/**
 * dynamicNodeSchema.service.ts
 * FIX 5.2 — Dynamic Node Schema Discovery
 *
 * Fetches the real list of node types installed in the user's n8n instance
 * via the n8n REST API and caches the result for 1 hour. Falls back to the
 * curated static NODE_SCHEMAS library if n8n is unavailable or the endpoint
 * is not supported by the running n8n version.
 *
 * Architecture:
 *   1. getCachedN8nNodeTypes()       — full list of installed node types (1h cache)
 *   2. getDynamicNodeSchema()        — schema for a single node type (dynamic + static merged)
 *   3. searchDynamicNodeTypes()      — fuzzy search across ALL installed nodes
 *   4. isNodeTypeInstalled()         — quick boolean check
 *   5. getDynamicSchemaSummary()     — stats for monitoring / admin UI
 *   6. invalidateDynamicNodeCache()  — manual cache bust
 */

import { getN8nConfig } from "./n8n.service";
import { NODE_SCHEMAS, KEYWORD_NODE_MAP, type NodeSchema } from "./nodeSchemas";
import { logger } from "../lib/logger";

// Pre-compute a reverse map: node type → all keywords (including Arabic)
// Built once at module load from KEYWORD_NODE_MAP.
const NODE_TYPE_KEYWORDS: Map<string, string[]> = new Map();
for (const entry of KEYWORD_NODE_MAP) {
  for (const nodeType of entry.nodes) {
    const existing = NODE_TYPE_KEYWORDS.get(nodeType) ?? [];
    NODE_TYPE_KEYWORDS.set(nodeType, [...existing, ...entry.keywords]);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface N8nRawNodeType {
  name: string;           // e.g. "n8n-nodes-base.slack"
  displayName: string;    // e.g. "Slack"
  description: string;
  version: number | number[];
  group: string[];
  icon?: string;
  iconColor?: string;
  category?: string;
  subcategory?: string;
  credentials?: Array<{ name: string; required?: boolean }>;
  properties?: Array<{
    name: string;
    type: string;
    default?: unknown;
    required?: boolean;
    description?: string;
    options?: Array<{ name: string; value: unknown }>;
  }>;
  codex?: {
    categories?: string[];
    subcategories?: Record<string, string[]>;
    alias?: string[];
  };
}

export interface DynamicNodeInfo {
  /** Canonical n8n node type key */
  type: string;
  /** Human-readable name */
  displayName: string;
  /** Short description */
  description: string;
  /** Latest version available in this instance */
  version: number;
  /** Node groups (trigger, output, transform, etc.) */
  groups: string[];
  /** Credential types this node can use */
  credentialTypes: string[];
  /** Whether we have a curated static schema for this node */
  hasStaticSchema: boolean;
  /** Optional curated schema (if hasStaticSchema = true) */
  staticSchema?: NodeSchema;
  /** Category from n8n's codex / group */
  category: string;
  /** Search aliases from codex */
  aliases: string[];
}

export interface DynamicNodeCacheResult {
  /** All nodes from n8n */
  nodes: DynamicNodeInfo[];
  /** Source of this data */
  source: "n8n-api" | "static-fallback";
  /** ISO timestamp when this cache was populated */
  fetchedAt: string;
  /** Which endpoint was used if source is n8n-api */
  endpoint?: string;
  /** n8n base URL */
  n8nUrl?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// In-memory cache
// ─────────────────────────────────────────────────────────────────────────────

const NODE_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let _cachedResult: DynamicNodeCacheResult | null = null;
let _cacheExpiresAt = 0;

// ─────────────────────────────────────────────────────────────────────────────
// Raw fetching helpers
// ─────────────────────────────────────────────────────────────────────────────

interface RawApiResult {
  nodes: N8nRawNodeType[];
  endpoint: string;
}

/**
 * Attempts to retrieve raw node type list from multiple n8n endpoints.
 * Tries public API v1 first, then internal rest endpoint.
 * Returns null if n8n is not configured or no endpoint succeeded.
 */
async function fetchRawNodeTypes(
  n8nUrl: string,
  apiKey: string
): Promise<RawApiResult | null> {
  const endpoints = [
    // Public REST API v1 — available in n8n 1.0+
    { path: "/api/v1/node-types", auth: "api-key" as const },
    // Internal REST API — available in older versions (no API key, uses session)
    // We still try with our key; some self-hosted setups accept it
    { path: "/rest/node-types", auth: "api-key" as const },
  ];

  for (const endpoint of endpoints) {
    try {
      const url = `${n8nUrl}${endpoint.path}`;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-N8N-API-KEY": apiKey,
      };

      const res = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(15_000),
      });

      if (!res.ok) {
        logger.debug(
          { status: res.status, url },
          "FIX 5.2: node-types endpoint returned non-ok"
        );
        continue;
      }

      const body = await res.json() as unknown;

      // Response shape varies by endpoint and version
      let nodes: N8nRawNodeType[] | null = null;

      if (Array.isArray(body)) {
        // /rest/node-types returns a plain array
        nodes = body as N8nRawNodeType[];
      } else if (body && typeof body === "object") {
        const b = body as Record<string, unknown>;
        if (Array.isArray(b.data)) {
          // /api/v1/node-types returns { data: [...] }
          nodes = b.data as N8nRawNodeType[];
        } else if (Array.isArray(b.nodes)) {
          nodes = b.nodes as N8nRawNodeType[];
        }
      }

      if (nodes && nodes.length > 0) {
        logger.info(
          { count: nodes.length, endpoint: endpoint.path },
          "FIX 5.2: Successfully fetched node types from n8n"
        );
        return { nodes, endpoint: endpoint.path };
      }
    } catch (err) {
      logger.debug(
        { err: err instanceof Error ? err.message : String(err), path: endpoint.path },
        "FIX 5.2: Failed to fetch from endpoint"
      );
    }
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Transform raw → DynamicNodeInfo
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a raw n8n node type response into our normalized DynamicNodeInfo.
 */
function normalizeRawNode(raw: N8nRawNodeType): DynamicNodeInfo {
  const version = Array.isArray(raw.version)
    ? Math.max(...raw.version)
    : (raw.version ?? 1);

  const credentialTypes = (raw.credentials ?? []).map((c) =>
    typeof c === "string" ? c : c.name
  );

  // Resolve category from codex, group, or raw.category
  let category = raw.category ?? "";
  if (!category && raw.codex?.categories?.length) {
    category = raw.codex.categories[0] ?? "";
  }
  if (!category && raw.group?.length) {
    const g = raw.group[0] ?? "";
    // Map n8n group names to friendlier category strings
    const groupMap: Record<string, string> = {
      trigger: "trigger",
      output: "action",
      transform: "transform",
      input: "input",
    };
    category = groupMap[g.toLowerCase()] ?? g;
  }
  if (!category) category = "utility";

  const aliases: string[] = [];
  if (raw.codex?.alias) aliases.push(...raw.codex.alias);
  if (raw.displayName) aliases.push(raw.displayName.toLowerCase());

  // Check if we have a curated static schema
  const staticSchema = NODE_SCHEMAS[raw.name];

  return {
    type: raw.name,
    displayName: raw.displayName ?? raw.name,
    description: raw.description ?? "",
    version,
    groups: raw.group ?? [],
    credentialTypes,
    hasStaticSchema: !!staticSchema,
    staticSchema: staticSchema ?? undefined,
    category,
    aliases,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Build static fallback from NODE_SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

function buildStaticFallback(): DynamicNodeCacheResult {
  const nodes: DynamicNodeInfo[] = Object.entries(NODE_SCHEMAS).map(
    ([key, schema]) => ({
      type: key,
      displayName: key.split(".").pop() ?? key,
      description: schema.description,
      version: schema.typeVersion,
      groups: [schema.category],
      credentialTypes: schema.credentials
        ? Object.values(schema.credentials)
        : [],
      hasStaticSchema: true,
      staticSchema: schema,
      category: schema.category,
      // Populate aliases from KEYWORD_NODE_MAP (includes Arabic keywords)
      aliases: NODE_TYPE_KEYWORDS.get(key) ?? [],
    })
  );

  return {
    nodes,
    source: "static-fallback",
    fetchedAt: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the full list of node types installed in the user's n8n instance.
 * Cached for 1 hour. Falls back to static schemas if n8n is unavailable.
 *
 * @param forceRefresh  Pass true to bypass cache and re-fetch from n8n.
 */
export async function getCachedN8nNodeTypes(
  forceRefresh = false
): Promise<DynamicNodeCacheResult> {
  // Return cached result if still valid
  if (!forceRefresh && _cachedResult && Date.now() < _cacheExpiresAt) {
    logger.debug(
      { source: _cachedResult.source, count: _cachedResult.nodes.length },
      "FIX 5.2: Returning cached node types"
    );
    return _cachedResult;
  }

  // Try fetching from n8n
  try {
    const config = await getN8nConfig();
    if (config) {
      const raw = await fetchRawNodeTypes(config.url, config.apiKey);

      if (raw && raw.nodes.length > 0) {
        const normalized = raw.nodes.map(normalizeRawNode);

        // Merge: add any static schemas that n8n didn't return
        // (useful if n8n is an older version missing some endpoints)
        const dynamicTypeKeys = new Set(normalized.map((n) => n.type));
        const staticOnlyNodes: DynamicNodeInfo[] = [];
        for (const [key, schema] of Object.entries(NODE_SCHEMAS)) {
          if (!dynamicTypeKeys.has(key)) {
            staticOnlyNodes.push({
              type: key,
              displayName: key.split(".").pop() ?? key,
              description: schema.description,
              version: schema.typeVersion,
              groups: [schema.category],
              credentialTypes: schema.credentials
                ? Object.values(schema.credentials)
                : [],
              hasStaticSchema: true,
              staticSchema: schema,
              category: schema.category,
              aliases: [],
            });
          }
        }

        const result: DynamicNodeCacheResult = {
          nodes: [...normalized, ...staticOnlyNodes],
          source: "n8n-api",
          fetchedAt: new Date().toISOString(),
          endpoint: raw.endpoint,
          n8nUrl: config.url,
        };

        _cachedResult = result;
        _cacheExpiresAt = Date.now() + NODE_CACHE_TTL_MS;

        logger.info(
          {
            total: result.nodes.length,
            fromN8n: normalized.length,
            fromStatic: staticOnlyNodes.length,
            withStaticSchema: normalized.filter((n) => n.hasStaticSchema).length,
          },
          "FIX 5.2: Node type cache populated from n8n API"
        );

        return result;
      }
    }
  } catch (err) {
    logger.warn(
      { err: err instanceof Error ? err.message : String(err) },
      "FIX 5.2: Could not fetch node types from n8n, using static fallback"
    );
  }

  // Static fallback
  const fallback = buildStaticFallback();
  _cachedResult = fallback;
  _cacheExpiresAt = Date.now() + NODE_CACHE_TTL_MS;

  logger.info(
    { count: fallback.nodes.length },
    "FIX 5.2: Using static schema fallback for node types"
  );

  return fallback;
}

/**
 * Looks up a single node type. Priority:
 *   1. Exact match in dynamic nodes (from n8n)
 *   2. Curated static schema
 *   3. Fuzzy match in displayName / aliases
 *   4. null if nothing found
 */
export async function getDynamicNodeSchema(
  nodeType: string
): Promise<{
  found: boolean;
  node?: DynamicNodeInfo;
  source?: string;
  alternatives?: string[];
  suggestions?: string[];
  message?: string;
}> {
  const normalized = nodeType.toLowerCase().trim();
  const cache = await getCachedN8nNodeTypes();

  // 1. Exact type key match
  const exact = cache.nodes.find(
    (n) => n.type === nodeType || n.type.toLowerCase() === normalized
  );
  if (exact) {
    return { found: true, node: exact, source: cache.source };
  }

  // 2. Alias / displayName match
  const byAlias = cache.nodes.find(
    (n) =>
      n.aliases.some((a) => a.toLowerCase() === normalized) ||
      n.displayName.toLowerCase() === normalized
  );
  if (byAlias) {
    return {
      found: true,
      node: byAlias,
      source: cache.source,
      alternatives: [`Resolved "${nodeType}" → "${byAlias.type}"`],
    };
  }

  // 3. Partial match in type key
  const partialKey = cache.nodes.filter((n) =>
    n.type.toLowerCase().includes(normalized)
  );
  if (partialKey.length > 0) {
    return {
      found: true,
      node: partialKey[0]!,
      source: cache.source,
      alternatives: partialKey.slice(1, 5).map((n) => n.type),
    };
  }

  // 4. Partial match in displayName or description
  const partialDisplay = cache.nodes.filter(
    (n) =>
      n.displayName.toLowerCase().includes(normalized) ||
      n.description.toLowerCase().includes(normalized)
  );
  if (partialDisplay.length > 0) {
    return {
      found: true,
      node: partialDisplay[0]!,
      source: cache.source,
      alternatives: partialDisplay.slice(1, 5).map((n) => n.type),
    };
  }

  // Nothing found — provide suggestions
  const suggestions = cache.nodes
    .filter(
      (n) =>
        n.category.toLowerCase().includes(normalized) ||
        n.aliases.some((a) => a.toLowerCase().includes(normalized))
    )
    .slice(0, 8)
    .map((n) => n.type);

  return {
    found: false,
    message: `No node type found for "${nodeType}". Use search_node_types to discover what is available.`,
    suggestions,
  };
}

/**
 * Searches across ALL installed n8n node types by keyword.
 * Returns matches ranked by relevance.
 */
export async function searchDynamicNodeTypes(query: string): Promise<{
  query: string;
  source: "n8n-api" | "static-fallback";
  totalInstalled: number;
  count: number;
  results: Array<{
    type: string;
    displayName: string;
    description: string;
    category: string;
    version: number;
    hasStaticSchema: boolean;
    credentialTypes: string[];
    score: number;
  }>;
  hint: string;
}> {
  const q = query.toLowerCase().trim();
  const cache = await getCachedN8nNodeTypes();

  if (!q) {
    return {
      query,
      source: cache.source,
      totalInstalled: cache.nodes.length,
      count: 0,
      results: [],
      hint: "Provide a search keyword.",
    };
  }

  const scored: Array<{ node: DynamicNodeInfo; score: number }> = [];

  for (const node of cache.nodes) {
    let score = 0;

    // Exact type key match — highest score
    if (node.type.toLowerCase() === q) score += 100;
    // Type key contains query
    if (node.type.toLowerCase().includes(q)) score += 40;
    // Display name exact match
    if (node.displayName.toLowerCase() === q) score += 80;
    // Display name contains query
    if (node.displayName.toLowerCase().includes(q)) score += 30;
    // Alias exact match
    if (node.aliases.some((a) => a.toLowerCase() === q)) score += 70;
    // Alias contains query
    if (node.aliases.some((a) => a.toLowerCase().includes(q))) score += 20;
    // Description contains query
    if (node.description.toLowerCase().includes(q)) score += 10;
    // Category match
    if (node.category.toLowerCase().includes(q)) score += 15;

    if (score > 0) scored.push({ node, score });
  }

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 20);

  return {
    query,
    source: cache.source,
    totalInstalled: cache.nodes.length,
    count: top.length,
    results: top.map(({ node, score }) => ({
      type: node.type,
      displayName: node.displayName,
      description: node.description,
      category: node.category,
      version: node.version,
      hasStaticSchema: node.hasStaticSchema,
      credentialTypes: node.credentialTypes,
      score,
    })),
    hint:
      top.length === 0
        ? `No nodes found matching "${query}". Try a broader term like "email", "database", "trigger".`
        : `Found ${top.length} node(s) matching "${query}" out of ${cache.nodes.length} installed.`,
  };
}

/**
 * Checks whether a specific node type is installed in this n8n instance.
 */
export async function isNodeTypeInstalled(nodeType: string): Promise<boolean> {
  const result = await getDynamicNodeSchema(nodeType);
  return result.found;
}

/**
 * Returns a summary of the node type cache for monitoring and admin UI.
 */
export async function getDynamicSchemaSummary(): Promise<{
  source: "n8n-api" | "static-fallback";
  totalNodes: number;
  withStaticSchema: number;
  withoutStaticSchema: number;
  byCategory: Record<string, number>;
  fetchedAt: string;
  cacheExpiresAt: string;
  n8nUrl?: string;
}> {
  const cache = await getCachedN8nNodeTypes();

  const byCategory: Record<string, number> = {};
  let withStatic = 0;

  for (const node of cache.nodes) {
    byCategory[node.category] = (byCategory[node.category] ?? 0) + 1;
    if (node.hasStaticSchema) withStatic++;
  }

  return {
    source: cache.source,
    totalNodes: cache.nodes.length,
    withStaticSchema: withStatic,
    withoutStaticSchema: cache.nodes.length - withStatic,
    byCategory,
    fetchedAt: cache.fetchedAt,
    cacheExpiresAt: new Date(_cacheExpiresAt).toISOString(),
    n8nUrl: cache.n8nUrl,
  };
}

/**
 * Invalidates the node type cache, forcing a re-fetch on the next call.
 */
export function invalidateDynamicNodeCache(): void {
  _cachedResult = null;
  _cacheExpiresAt = 0;
  logger.info("FIX 5.2: Dynamic node type cache invalidated");
}
