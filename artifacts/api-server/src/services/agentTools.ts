/**
 * agentTools.ts
 * FIX 5.1 — Tool Calling Architecture
 *
 * Defines the 6 tools available to the GPT-4o agent for dynamic n8n workflow
 * building. Each tool has:
 *   - OpenAI ChatCompletionTool definition (for tool_calls API)
 *   - Executor function (runs real logic and returns structured data)
 *
 * Tools:
 *   1. get_node_schema      — exact schema for a specific n8n node type
 *   2. search_node_types    — fuzzy search across all known node types
 *   3. list_available_workflows — list workflows in the connected n8n instance
 *   4. get_workflow_details — full JSON of a specific workflow by ID or name
 *   5. validate_workflow_json — validate workflow JSON for n8n compatibility
 *   6. get_execution_errors — recent execution errors for a workflow
 */

import type OpenAI from "openai";
import { NODE_SCHEMAS, getRelevantSchemas } from "./nodeSchemas";
import { validateWorkflowJson } from "./jsonValidator.service";
import { getCachedWorkflows, getCachedWorkflow } from "./n8nCache.service";
import { getWorkflowExecutionsWithErrors } from "./n8n.service";
import {
  getDynamicNodeSchema,
  searchDynamicNodeTypes,
} from "./dynamicNodeSchema.service";
import { logger } from "../lib/logger";

// ─────────────────────────────────────────────────────────────────────────────
// Internal: keyword → node type resolution table (FIX 5.1)
// Converts common names/aliases to canonical n8n node type keys.
// This is a subset of the full KEYWORD_NODE_MAP in nodeSchemas.ts, kept
// here as a flat Record for O(1) lookup inside get_node_schema.
// ─────────────────────────────────────────────────────────────────────────────
const KEYWORD_LOOKUP: Record<string, string> = {
  // Triggers
  "webhook": "n8n-nodes-base.webhookTrigger",
  "schedule": "n8n-nodes-base.scheduleTrigger",
  "cron": "n8n-nodes-base.scheduleTrigger",
  "manual": "n8n-nodes-base.manualTrigger",
  // Communication
  "slack": "n8n-nodes-base.slack",
  "telegram": "n8n-nodes-base.telegram",
  "discord": "n8n-nodes-base.discord",
  "email": "n8n-nodes-base.gmail",
  "gmail": "n8n-nodes-base.gmail",
  "sendgrid": "n8n-nodes-base.sendGrid",
  "twilio": "n8n-nodes-base.twilio",
  "whatsapp": "n8n-nodes-base.whatsApp",
  // Google
  "sheets": "n8n-nodes-base.googleSheets",
  "google sheets": "n8n-nodes-base.googleSheets",
  "drive": "n8n-nodes-base.googleDrive",
  "calendar": "n8n-nodes-base.googleCalendar",
  // Databases
  "postgres": "n8n-nodes-base.postgres",
  "postgresql": "n8n-nodes-base.postgres",
  "mysql": "n8n-nodes-base.mySql",
  "mongodb": "n8n-nodes-base.mongoDb",
  "redis": "n8n-nodes-base.redis",
  // Dev tools
  "github": "n8n-nodes-base.github",
  "gitlab": "n8n-nodes-base.gitlab",
  "jira": "n8n-nodes-base.jira",
  "linear": "n8n-nodes-base.linear",
  "asana": "n8n-nodes-base.asana",
  // E-commerce
  "stripe": "n8n-nodes-base.stripe",
  "shopify": "n8n-nodes-base.shopify",
  // Storage
  "s3": "n8n-nodes-base.awsS3",
  "aws": "n8n-nodes-base.awsS3",
  "dropbox": "n8n-nodes-base.dropbox",
  // AI
  "openai": "@n8n/n8n-nodes-langchain.openAi",
  "chatgpt": "@n8n/n8n-nodes-langchain.openAi",
  "gemini": "n8n-nodes-base.gemini",
  // Utilities
  "http": "n8n-nodes-base.httpRequest",
  "api": "n8n-nodes-base.httpRequest",
  "rest": "n8n-nodes-base.httpRequest",
  "code": "n8n-nodes-base.code",
  "function": "n8n-nodes-base.code",
  "if": "n8n-nodes-base.if",
  "condition": "n8n-nodes-base.if",
  "switch": "n8n-nodes-base.switch",
  "merge": "n8n-nodes-base.merge",
  "split": "n8n-nodes-base.splitInBatches",
  "loop": "n8n-nodes-base.splitInBatches",
  "wait": "n8n-nodes-base.wait",
  "set": "n8n-nodes-base.set",
  "filter": "n8n-nodes-base.filter",
};

// ─────────────────────────────────────────────────────────────────────────────
// OpenAI Tool Definitions
// ─────────────────────────────────────────────────────────────────────────────

export const AGENT_TOOL_DEFINITIONS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_node_schema",
      description:
        "Get the exact n8n schema for a specific node type. Returns the correct type, typeVersion, credentials, and required parameters. Always call this before using any node in the workflow.",
      parameters: {
        type: "object",
        properties: {
          node_type: {
            type: "string",
            description:
              "The n8n node type key (e.g. 'n8n-nodes-base.github', 'n8n-nodes-base.slack') or a keyword (e.g. 'github', 'slack', 'webhook', 'email').",
          },
        },
        required: ["node_type"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_node_types",
      description:
        "Search available n8n node types by keyword. Use this first to discover what nodes exist for a given integration or category.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Search keyword, e.g. 'email', 'database', 'telegram', 'trigger', 'http', 'slack'.",
          },
        },
        required: ["query"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_available_workflows",
      description:
        "List all workflows in the connected n8n instance. Use to avoid duplicates and understand existing context.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_workflow_details",
      description:
        "Get the full JSON of a specific workflow by name or ID. Useful for understanding an existing workflow before modifying it.",
      parameters: {
        type: "object",
        properties: {
          workflow_id: {
            type: "string",
            description: "The workflow ID or a keyword from the workflow name.",
          },
        },
        required: ["workflow_id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "validate_workflow_json",
      description:
        "Validate a workflow JSON object for n8n compatibility. Returns a list of errors and whether it is valid. Always call this before finalizing the workflow.",
      parameters: {
        type: "object",
        properties: {
          workflow_json: {
            type: "object",
            description: "The workflow JSON object to validate.",
          },
        },
        required: ["workflow_json"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_execution_errors",
      description:
        "Get recent execution errors for a specific workflow. Useful when diagnosing why a workflow is failing.",
      parameters: {
        type: "object",
        properties: {
          workflow_id: {
            type: "string",
            description: "The workflow ID.",
          },
          limit: {
            type: "number",
            description: "Number of recent errors to retrieve (default: 5).",
          },
        },
        required: ["workflow_id"],
        additionalProperties: false,
      },
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Result Type
// ─────────────────────────────────────────────────────────────────────────────

export interface ToolCallResult {
  toolName: string;
  result: unknown;
  error?: string;
  durationMs: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Dispatcher
// ─────────────────────────────────────────────────────────────────────────────

export async function executeToolCall(
  toolName: string,
  args: Record<string, unknown>
): Promise<ToolCallResult> {
  const start = Date.now();
  try {
    let result: unknown;

    switch (toolName) {
      case "get_node_schema":
        result = await executeGetNodeSchema(String(args.node_type ?? ""));
        break;
      case "search_node_types":
        result = await executeSearchNodeTypes(String(args.query ?? ""));
        break;
      case "list_available_workflows":
        result = await executeListWorkflows();
        break;
      case "get_workflow_details":
        result = await executeGetWorkflowDetails(String(args.workflow_id ?? ""));
        break;
      case "validate_workflow_json":
        result = executeValidateWorkflow(args.workflow_json as Record<string, unknown>);
        break;
      case "get_execution_errors":
        result = await executeGetExecutionErrors(
          String(args.workflow_id ?? ""),
          Number(args.limit ?? 5)
        );
        break;
      default:
        result = { error: `Unknown tool: ${toolName}` };
    }

    return { toolName, result, durationMs: Date.now() - start };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.warn({ toolName, error }, "FIX 5.1: Tool execution failed");
    return { toolName, result: { error }, error, durationMs: Date.now() - start };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool 1: get_node_schema
// FIX 5.2: Now uses Dynamic Node Schema Discovery with static fallback
// ─────────────────────────────────────────────────────────────────────────────

async function executeGetNodeSchema(nodeType: string): Promise<unknown> {
  if (!nodeType.trim()) {
    return { found: false, message: "node_type is required." };
  }

  const normalized = nodeType.toLowerCase().trim();

  // ── FIX 5.2: Try dynamic lookup first ─────────────────────────────────────
  try {
    const dynamic = await getDynamicNodeSchema(nodeType);
    if (dynamic.found && dynamic.node) {
      const node = dynamic.node;
      // If we have a curated static schema, return its full detail
      if (node.hasStaticSchema && node.staticSchema) {
        return {
          found: true,
          source: dynamic.source,
          installedInN8n: dynamic.source === "n8n-api",
          resolvedAs: node.type,
          schema: node.staticSchema,
          alternatives: dynamic.alternatives,
          nodeInfo: {
            displayName: node.displayName,
            version: node.version,
            credentialTypes: node.credentialTypes,
            category: node.category,
          },
        };
      }
      // Dynamic-only node (no curated schema) — return what n8n told us
      return {
        found: true,
        source: dynamic.source,
        installedInN8n: dynamic.source === "n8n-api",
        resolvedAs: node.type,
        schema: {
          type: node.type,
          typeVersion: node.version,
          credentials: node.credentialTypes.reduce<Record<string, string>>(
            (acc, ct) => { acc[ct] = ct; return acc; },
            {}
          ),
          defaultParameters: {},
          description: node.description,
          category: node.category,
        },
        alternatives: dynamic.alternatives,
        note: "Schema inferred from n8n API — curated static schema not available for this node.",
        nodeInfo: {
          displayName: node.displayName,
          version: node.version,
          credentialTypes: node.credentialTypes,
          category: node.category,
        },
      };
    }
  } catch (err) {
    logger.debug(
      { err: err instanceof Error ? err.message : String(err), nodeType },
      "FIX 5.2: Dynamic schema lookup failed, falling back to static"
    );
  }

  // ── Static fallback chain (FIX 5.1 logic preserved) ────────────────────────

  // 1. Exact key match
  if (NODE_SCHEMAS[nodeType]) {
    return { found: true, source: "static", schema: NODE_SCHEMAS[nodeType] };
  }

  // 2. KEYWORD_LOOKUP resolution
  const mappedKey = KEYWORD_LOOKUP[normalized];
  if (mappedKey && NODE_SCHEMAS[mappedKey]) {
    return { found: true, source: "static", resolvedAs: mappedKey, schema: NODE_SCHEMAS[mappedKey] };
  }

  // 3. getRelevantSchemas — uses full KEYWORD_NODE_MAP + Arabic aliases
  const relevant = getRelevantSchemas(nodeType);
  if (relevant.length > 0) {
    const first = relevant[0]!;
    const schemaEntry = Object.entries(NODE_SCHEMAS).find(([, s]) => s.type === first.type);
    if (schemaEntry) {
      return {
        found: true,
        source: "static",
        resolvedVia: "keyword-map",
        schema: schemaEntry[1],
        alternatives: relevant.slice(1, 4).map((s) => s.type),
      };
    }
  }

  // 4. Fuzzy key match
  const matchKey = Object.keys(NODE_SCHEMAS).find((k) =>
    k.toLowerCase().includes(normalized)
  );
  if (matchKey) {
    return { found: true, source: "static", resolvedAs: matchKey, schema: NODE_SCHEMAS[matchKey] };
  }

  // 5. Suggest alternatives
  const suggestions = Object.keys(NODE_SCHEMAS)
    .filter((k) => {
      const s = NODE_SCHEMAS[k];
      return (
        s &&
        (s.description.toLowerCase().includes(normalized) ||
          s.category.toLowerCase().includes(normalized))
      );
    })
    .slice(0, 8);

  return {
    found: false,
    message: `No schema found for "${nodeType}". Use search_node_types to discover available nodes.`,
    suggestions,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool 2: search_node_types
// FIX 5.2: Now searches ALL nodes installed in n8n, not just static schemas
// ─────────────────────────────────────────────────────────────────────────────

async function executeSearchNodeTypes(query: string): Promise<unknown> {
  const q = query.toLowerCase().trim();
  if (!q) return { query, count: 0, results: [] };

  // ── FIX 5.2: Use dynamic search across all installed n8n nodes ────────────
  try {
    const dynamic = await searchDynamicNodeTypes(query);
    if (dynamic.totalInstalled > 0) {
      // Also check KEYWORD_LOOKUP aliases for the agent's convenience
      const aliases = Object.entries(KEYWORD_LOOKUP)
        .filter(([kw]) => kw.includes(q))
        .map(([kw, target]) => ({ alias: kw, resolves_to: target }))
        .slice(0, 10);

      return {
        query,
        source: dynamic.source,
        totalInstalled: dynamic.totalInstalled,
        count: dynamic.count,
        results: dynamic.results,
        keywordAliases: aliases,
        hint: dynamic.hint,
      };
    }
  } catch (err) {
    logger.debug(
      { err: err instanceof Error ? err.message : String(err) },
      "FIX 5.2: Dynamic search failed, falling back to static"
    );
  }

  // ── Static fallback (FIX 5.1 logic preserved) ────────────────────────────
  const relevant = getRelevantSchemas(query);
  const relevantKeys = new Set(relevant.map((s) => s.type));

  const results: Array<{ key: string; description: string; category: string; relevant: boolean }> = [];

  for (const [key, schema] of Object.entries(NODE_SCHEMAS)) {
    const isRelevant = relevantKeys.has(schema.type) ||
      key.toLowerCase().includes(q) ||
      schema.description.toLowerCase().includes(q) ||
      schema.category.toLowerCase().includes(q);

    if (isRelevant) {
      results.push({
        key,
        description: schema.description,
        category: schema.category,
        relevant: relevantKeys.has(schema.type),
      });
    }
  }

  results.sort((a, b) => (b.relevant ? 1 : 0) - (a.relevant ? 1 : 0));

  const aliases = Object.entries(KEYWORD_LOOKUP)
    .filter(([kw]) => kw.includes(q))
    .map(([kw, target]) => ({ alias: kw, resolves_to: target }))
    .slice(0, 10);

  return {
    query,
    source: "static",
    totalInstalled: Object.keys(NODE_SCHEMAS).length,
    count: results.length,
    results: results.slice(0, 15),
    keywordAliases: aliases,
    hint:
      results.length === 0
        ? "No matching nodes found. Try a broader search term."
        : `Found ${results.length} node(s) in static schemas. Use get_node_schema to get the full schema.`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool 3: list_available_workflows
// ─────────────────────────────────────────────────────────────────────────────

async function executeListWorkflows(): Promise<unknown> {
  try {
    const workflows = await getCachedWorkflows();
    return {
      count: workflows.length,
      workflows: workflows.slice(0, 30).map((w) => ({
        id: w.id,
        name: w.name,
        active: w.active,
      })),
    };
  } catch {
    return {
      count: 0,
      workflows: [],
      note: "n8n is not connected or not configured. Proceeding without context.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool 4: get_workflow_details
// ─────────────────────────────────────────────────────────────────────────────

async function executeGetWorkflowDetails(workflowId: string): Promise<unknown> {
  try {
    const details = await getCachedWorkflow(workflowId);
    if (details && Object.keys(details).length > 0) {
      return { found: true, workflow: details };
    }

    const all = await getCachedWorkflows();
    const byName = all.find((w) =>
      w.name.toLowerCase().includes(workflowId.toLowerCase())
    );
    if (byName) {
      const full = await getCachedWorkflow(byName.id);
      return {
        found: true,
        resolvedById: byName.id,
        resolvedByName: byName.name,
        workflow: full,
      };
    }

    return {
      found: false,
      message: `No workflow found with ID or name containing: "${workflowId}"`,
    };
  } catch {
    return {
      found: false,
      message: "Could not fetch workflow details — n8n may not be configured.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool 5: validate_workflow_json
// ─────────────────────────────────────────────────────────────────────────────

function executeValidateWorkflow(workflowJson: Record<string, unknown>): unknown {
  if (!workflowJson || typeof workflowJson !== "object") {
    return { valid: false, errors: ["workflow_json must be an object."] };
  }

  let jsonStr: string;
  try {
    jsonStr = JSON.stringify(workflowJson);
  } catch {
    return { valid: false, errors: ["workflow_json is not serializable."] };
  }

  const validation = validateWorkflowJson(jsonStr);
  const nodes = workflowJson.nodes as unknown[] | undefined;

  return {
    valid: validation.valid,
    errors: validation.errors ?? [],
    nodeCount: Array.isArray(nodes) ? nodes.length : 0,
    checks: {
      hasName: typeof workflowJson.name === "string" && workflowJson.name.length > 0,
      hasNodes: Array.isArray(nodes) && nodes.length > 0,
      hasConnections: typeof workflowJson.connections === "object",
      hasSettings: typeof workflowJson.settings === "object",
    },
    advice: validation.valid
      ? "✅ Workflow JSON is valid and ready for import."
      : `❌ Fix ${(validation.errors ?? []).length} issue(s) before importing.`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool 6: get_execution_errors
// ─────────────────────────────────────────────────────────────────────────────

async function executeGetExecutionErrors(workflowId: string, limit: number): Promise<unknown> {
  try {
    const errors = await getWorkflowExecutionsWithErrors(workflowId, Math.min(limit, 20));
    return {
      workflowId,
      count: Array.isArray(errors) ? errors.length : 0,
      errors,
    };
  } catch {
    return {
      workflowId,
      count: 0,
      errors: [],
      note: "Could not fetch execution errors — n8n may not be configured or workflow not found.",
    };
  }
}
