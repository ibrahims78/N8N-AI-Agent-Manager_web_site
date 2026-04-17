/**
 * FIX Phase 4 — Persistent Memory & Project Context
 *
 * Provides per-user long-term memory that persists across sessions:
 *   - Workflows created via the agent (n8nId, name, nodeTypes, qualityScore)
 *   - User behaviour patterns (preferred language, frequent node types)
 *   - n8n credentials available in the user's instance (synced from n8n API)
 *
 * The memory is injected into every LLM system prompt so the agent can say:
 *   "You already have a Slack → Google Sheets workflow (ID: xyz)"
 *   "Your n8n has Gmail and Slack credentials configured"
 *   "Last week you created 3 Telegram notification workflows"
 */

import { db, agentMemoryTable } from "@workspace/db";
import type { AgentMemory, MemoryWorkflow, UserPatterns, N8nCredential } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getN8nConfig } from "./n8n.service";
import { logger } from "../lib/logger";

// ─── TTL for n8n credential sync (1 hour) ────────────────────────────────────
const CREDENTIAL_SYNC_TTL_MS = 60 * 60 * 1000;

// ─── How many workflows to include in prompt context (most recent) ────────────
const MAX_WORKFLOWS_IN_PROMPT = 10;

// ─── How many workflows to keep in memory (sliding window) ───────────────────
const MAX_WORKFLOWS_IN_MEMORY = 50;

// ─── How many frequent node types to track ───────────────────────────────────
const MAX_FREQUENT_NODES = 15;

// ─── helpers ─────────────────────────────────────────────────────────────────

function nowIso(): string {
  return new Date().toISOString();
}

// ─── Core CRUD ───────────────────────────────────────────────────────────────

/**
 * Returns the agent memory record for a user.
 * Creates one with defaults if this is the first time the user is seen.
 */
export async function getOrCreateMemory(userId: number): Promise<AgentMemory> {
  const existing = await db
    .select()
    .from(agentMemoryTable)
    .where(eq(agentMemoryTable.userId, userId))
    .limit(1);

  if (existing[0]) return existing[0];

  const defaultPatterns: UserPatterns = {
    preferredLang: "ar",
    frequentNodeTypes: [],
    totalWorkflowsCreated: 0,
    lastActiveAt: nowIso(),
  };

  const [created] = await db
    .insert(agentMemoryTable)
    .values({
      userId,
      createdWorkflows: [],
      userPatterns: defaultPatterns,
      n8nCredentials: [],
    })
    .returning();

  return created!;
}

// ─── Workflow Recording ───────────────────────────────────────────────────────

export interface RecordWorkflowInput {
  n8nId: string;
  name: string;
  description: string;
  nodeTypes: string[];
  qualityScore: number;
  tags?: string[];
}

/**
 * Called after a successful workflow creation.
 * Adds the workflow to the user's memory and updates usage patterns.
 */
export async function recordWorkflowCreated(
  userId: number,
  input: RecordWorkflowInput
): Promise<void> {
  try {
    const memory = await getOrCreateMemory(userId);

    const newWorkflow: MemoryWorkflow = {
      n8nId: input.n8nId,
      name: input.name,
      description: input.description,
      nodeTypes: input.nodeTypes,
      qualityScore: input.qualityScore,
      createdAt: nowIso(),
      tags: input.tags ?? [],
    };

    // Prepend new workflow, keep sliding window
    const updatedWorkflows: MemoryWorkflow[] = [
      newWorkflow,
      ...memory.createdWorkflows.filter((w) => w.n8nId !== input.n8nId),
    ].slice(0, MAX_WORKFLOWS_IN_MEMORY);

    // Update frequency map for node types
    const freqMap: Record<string, number> = {};
    for (const wf of updatedWorkflows) {
      for (const nt of wf.nodeTypes) {
        freqMap[nt] = (freqMap[nt] ?? 0) + 1;
      }
    }
    const frequentNodeTypes = Object.entries(freqMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, MAX_FREQUENT_NODES)
      .map(([nt]) => nt);

    const updatedPatterns: UserPatterns = {
      ...memory.userPatterns,
      frequentNodeTypes,
      totalWorkflowsCreated: (memory.userPatterns.totalWorkflowsCreated ?? 0) + 1,
      lastActiveAt: nowIso(),
    };

    await db
      .update(agentMemoryTable)
      .set({
        createdWorkflows: updatedWorkflows,
        userPatterns: updatedPatterns,
      })
      .where(eq(agentMemoryTable.userId, userId));

    logger.info({ userId, workflowName: input.name, n8nId: input.n8nId }, "Agent memory: workflow recorded");
  } catch (err) {
    // Memory failures must never break the main flow
    logger.warn({ userId, err }, "Agent memory: failed to record workflow (non-fatal)");
  }
}

// ─── Language Preference ──────────────────────────────────────────────────────

/**
 * Updates the user's preferred language in memory (called on every request).
 */
export async function updateLanguagePreference(
  userId: number,
  lang: "ar" | "en"
): Promise<void> {
  try {
    const memory = await getOrCreateMemory(userId);
    if (memory.userPatterns.preferredLang === lang) return; // nothing to update

    await db
      .update(agentMemoryTable)
      .set({
        userPatterns: {
          ...memory.userPatterns,
          preferredLang: lang,
          lastActiveAt: nowIso(),
        },
      })
      .where(eq(agentMemoryTable.userId, userId));
  } catch (err) {
    logger.warn({ userId, err }, "Agent memory: failed to update language (non-fatal)");
  }
}

// ─── n8n Credentials Sync ─────────────────────────────────────────────────────

/**
 * Fetches credentials from the user's n8n instance and caches them in memory.
 * Respects a 1-hour TTL — skips sync if data is fresh.
 */
export async function syncN8nCredentials(userId: number): Promise<N8nCredential[]> {
  try {
    const memory = await getOrCreateMemory(userId);

    // Check TTL
    const lastSync = memory.lastN8nCredentialSync
      ? new Date(memory.lastN8nCredentialSync).getTime()
      : 0;
    if (Date.now() - lastSync < CREDENTIAL_SYNC_TTL_MS && memory.n8nCredentials.length > 0) {
      return memory.n8nCredentials;
    }

    const config = await getN8nConfig();
    if (!config) return memory.n8nCredentials; // n8n not configured — return stale cache

    const response = await fetch(`${config.n8nUrl}/api/v1/credentials`, {
      headers: { "X-N8N-API-KEY": config.n8nApiKey },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return memory.n8nCredentials;

    const data = (await response.json()) as { data?: Array<{ id: string; name: string; type: string }> };
    const credentials: N8nCredential[] = (data.data ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
    }));

    await db
      .update(agentMemoryTable)
      .set({
        n8nCredentials: credentials,
        lastN8nCredentialSync: new Date(),
      })
      .where(eq(agentMemoryTable.userId, userId));

    logger.info({ userId, count: credentials.length }, "Agent memory: n8n credentials synced");
    return credentials;
  } catch (err) {
    logger.warn({ userId, err }, "Agent memory: failed to sync n8n credentials (non-fatal)");
    return [];
  }
}

// ─── Context Builder ──────────────────────────────────────────────────────────

/**
 * Builds a compact memory context string to inject into the LLM system prompt.
 * Written in Arabic or English depending on the user's preferred language.
 */
export async function buildMemoryContext(
  userId: number,
  lang: "ar" | "en" = "ar"
): Promise<string> {
  try {
    const memory = await getOrCreateMemory(userId);
    const parts: string[] = [];

    // 1. Previous workflows created by this user
    const recentWorkflows = memory.createdWorkflows.slice(0, MAX_WORKFLOWS_IN_PROMPT);
    if (recentWorkflows.length > 0) {
      if (lang === "ar") {
        parts.push(`## ذاكرة المستخدم — Workflows التي أنشأها سابقاً (${recentWorkflows.length}):`);
        for (const wf of recentWorkflows) {
          const date = new Date(wf.createdAt).toLocaleDateString("ar-SA", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          const score = wf.qualityScore > 0 ? ` | جودة: ${wf.qualityScore}%` : "";
          const nodes = wf.nodeTypes.length > 0
            ? ` | nodes: ${wf.nodeTypes.slice(0, 4).join(", ")}`
            : "";
          parts.push(`  - "${wf.name}" (ID: ${wf.n8nId}) — ${wf.description || "لا وصف"}${score}${nodes} — أُنشئ: ${date}`);
        }
      } else {
        parts.push(`## User Memory — Previously Created Workflows (${recentWorkflows.length}):`);
        for (const wf of recentWorkflows) {
          const date = new Date(wf.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          const score = wf.qualityScore > 0 ? ` | quality: ${wf.qualityScore}%` : "";
          const nodes = wf.nodeTypes.length > 0
            ? ` | nodes: ${wf.nodeTypes.slice(0, 4).join(", ")}`
            : "";
          parts.push(`  - "${wf.name}" (ID: ${wf.n8nId}) — ${wf.description || "No description"}${score}${nodes} — created: ${date}`);
        }
      }
    }

    // 2. n8n credentials available
    if (memory.n8nCredentials.length > 0) {
      const credNames = memory.n8nCredentials.map((c) => `${c.name} (${c.type})`);
      if (lang === "ar") {
        parts.push(`## Credentials مضبوطة في n8n المستخدم (${memory.n8nCredentials.length}):`);
        parts.push(`  ${credNames.slice(0, 20).join("، ")}`);
      } else {
        parts.push(`## Credentials Configured in User's n8n (${memory.n8nCredentials.length}):`);
        parts.push(`  ${credNames.slice(0, 20).join(", ")}`);
      }
    }

    // 3. Usage patterns
    const patterns = memory.userPatterns;
    if (patterns.frequentNodeTypes.length > 0 || patterns.totalWorkflowsCreated > 0) {
      if (lang === "ar") {
        parts.push(`## أنماط الاستخدام:`);
        if (patterns.totalWorkflowsCreated > 0) {
          parts.push(`  - إجمالي الـ workflows المُنشأة: ${patterns.totalWorkflowsCreated}`);
        }
        if (patterns.frequentNodeTypes.length > 0) {
          parts.push(`  - الـ nodes الأكثر استخداماً: ${patterns.frequentNodeTypes.slice(0, 8).join("، ")}`);
        }
      } else {
        parts.push(`## Usage Patterns:`);
        if (patterns.totalWorkflowsCreated > 0) {
          parts.push(`  - Total workflows created: ${patterns.totalWorkflowsCreated}`);
        }
        if (patterns.frequentNodeTypes.length > 0) {
          parts.push(`  - Most used node types: ${patterns.frequentNodeTypes.slice(0, 8).join(", ")}`);
        }
      }
    }

    if (parts.length === 0) return "";

    const header = lang === "ar"
      ? "### [ذاكرة دائمة — سياق المستخدم عبر الجلسات]\n"
      : "### [Persistent Memory — Cross-Session User Context]\n";

    return header + parts.join("\n") + "\n";
  } catch (err) {
    logger.warn({ userId, err }, "Agent memory: failed to build context (non-fatal)");
    return "";
  }
}

// ─── Utility: extract node types from workflow JSON ───────────────────────────

/**
 * Extracts node type names from a workflow JSON for storage in memory.
 * Returns clean short names (e.g. "slack" instead of "n8n-nodes-base.slack").
 */
export function extractNodeTypesFromWorkflow(
  workflowJson: Record<string, unknown>
): string[] {
  const nodes = workflowJson.nodes;
  if (!Array.isArray(nodes)) return [];

  const types = new Set<string>();
  for (const node of nodes as Array<{ type?: string }>) {
    if (typeof node.type === "string") {
      // n8n-nodes-base.slack → slack
      const short = node.type.split(".").pop() ?? node.type;
      // skip start/stickyNote/noOp etc.
      if (!["stickyNote", "noOp", "start"].includes(short)) {
        types.add(short);
      }
    }
  }
  return Array.from(types);
}

// ─── Utility: extract description from workflow JSON ─────────────────────────

export function extractWorkflowDescription(
  workflowJson: Record<string, unknown>,
  userRequest: string
): string {
  // Use the first 100 chars of the user's request as description
  return userRequest.slice(0, 100).trim();
}
