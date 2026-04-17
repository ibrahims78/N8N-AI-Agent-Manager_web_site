import { getWorkflows, getWorkflow } from "./n8n.service";
import { logger } from "../lib/logger";

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL_MS = 30_000;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && entry.expiresAt > Date.now()) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

function setCached<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export type CachedWorkflow = {
  id: string;
  name: string;
  active: boolean;
  nodes?: Array<{ type?: string; name?: string }>;
};

export async function getCachedWorkflows(ttlMs = DEFAULT_TTL_MS): Promise<CachedWorkflow[]> {
  const key = "n8n:workflows:list";
  const cached = getCached<CachedWorkflow[]>(key);
  if (cached) {
    logger.debug("n8nCache: returning cached workflow list");
    return cached;
  }

  logger.debug("n8nCache: fetching workflow list from n8n");
  const workflows = (await getWorkflows()) as CachedWorkflow[];
  setCached(key, workflows, ttlMs);
  return workflows;
}

export async function getCachedWorkflow(id: string, ttlMs = 60_000): Promise<Record<string, unknown>> {
  const key = `n8n:workflow:${id}`;
  const cached = getCached<Record<string, unknown>>(key);
  if (cached) {
    logger.debug({ id }, "n8nCache: returning cached workflow detail");
    return cached;
  }

  logger.debug({ id }, "n8nCache: fetching workflow detail from n8n");
  const wf = (await getWorkflow(id)) as unknown as Record<string, unknown>;
  setCached(key, wf, ttlMs);
  return wf;
}

export function invalidateWorkflowCache(id?: string): void {
  if (id) {
    cache.delete(`n8n:workflow:${id}`);
  }
  cache.delete("n8n:workflows:list");
}

export function clearAllN8nCache(): void {
  for (const key of cache.keys()) {
    if (key.startsWith("n8n:")) cache.delete(key);
  }
}
