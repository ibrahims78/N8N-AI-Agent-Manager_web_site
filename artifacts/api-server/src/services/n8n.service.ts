import { db, systemSettingsTable } from "@workspace/db";
import { decryptApiKey } from "./encryption.service";

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: Record<string, unknown>[];
  connections: Record<string, unknown>;
  settings?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface N8nExecution {
  id: string;
  workflowId: string;
  status: string;
  startedAt: string;
  stoppedAt?: string;
  mode: string;
}

export async function getN8nConfig(): Promise<{ url: string; apiKey: string } | null> {
  const settings = await db.select().from(systemSettingsTable).limit(1);
  if (!settings[0] || !settings[0].n8nUrl || !settings[0].n8nApiKeyEncrypted || !settings[0].n8nApiKeyIv) {
    return null;
  }
  const apiKey = decryptApiKey(settings[0].n8nApiKeyEncrypted, settings[0].n8nApiKeyIv);
  return { url: settings[0].n8nUrl, apiKey };
}

async function n8nFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const config = await getN8nConfig();
  if (!config) {
    throw new Error("N8N_NOT_CONFIGURED");
  }

  const url = `${config.url}/api/v1${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "X-N8N-API-KEY": config.apiKey,
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {}),
    },
    signal: AbortSignal.timeout(30000),
  });

  return response;
}

export async function testN8nConnection(url: string, apiKey: string): Promise<{ connected: boolean; version?: string; workflowsCount?: number; message?: string }> {
  try {
    const response = await fetch(`${url}/api/v1/workflows`, {
      headers: { "X-N8N-API-KEY": apiKey },
      signal: AbortSignal.timeout(10000),
    });

    if (response.status === 401) {
      return { connected: false, message: "مفتاح API غير صالح" };
    }
    if (!response.ok) {
      return { connected: false, message: `خطأ في الاتصال: ${response.status}` };
    }

    const data = await response.json() as { data?: unknown[] };
    
    let version: string | null = null;
    try {
      // Approach 1: /api/v1/ root (works on some n8n versions)
      const versionRes = await fetch(`${url}/api/v1/`, {
        headers: { "X-N8N-API-KEY": apiKey },
        signal: AbortSignal.timeout(5000),
      });
      if (versionRes.ok) {
        const vd = await versionRes.json() as Record<string, unknown>;
        const d = vd?.data as Record<string, unknown> | undefined;
        const raw =
          (d?.n8nVersion as string | undefined) ??
          (d?.versionCli as string | undefined) ??
          (vd?.n8nVersion as string | undefined);
        if (raw) version = raw;
      }
    } catch {}

    if (!version) {
      try {
        // Approach 2: /rest/settings (works on some n8n versions without auth)
        const settingsRes = await fetch(`${url}/rest/settings`, {
          signal: AbortSignal.timeout(5000),
        });
        if (settingsRes.ok) {
          const sd = await settingsRes.json() as { data?: { versionCli?: string } };
          if (sd?.data?.versionCli) version = sd.data.versionCli;
        }
      } catch {}
    }

    if (!version) {
      try {
        // Approach 3: parse version from n8n UI assets (works on all n8n versions with a UI)
        const htmlRes = await fetch(`${url}/`, { signal: AbortSignal.timeout(5000) });
        if (htmlRes.ok) {
          const html = await htmlRes.text();
          const assetMatch = html.match(/\/assets\/(versions\.store-[^"']+\.js)/);
          if (assetMatch) {
            const jsRes = await fetch(`${url}/assets/${assetMatch[1]}`, {
              signal: AbortSignal.timeout(5000),
            });
            if (jsRes.ok) {
              const js = await jsRes.text();
              const vMatch = js.match(/n8n@([0-9]+\.[0-9]+\.[0-9]+[^`'"]*)/);
              if (vMatch) version = vMatch[1];
            }
          }
        }
      } catch {}
    }

    return {
      connected: true,
      version,
      workflowsCount: Array.isArray(data.data) ? data.data.length : 0,
    };
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      return { connected: false, message: "انتهت مهلة الاتصال - تحقق من الـ URL" };
    }
    return { connected: false, message: "تعذر الاتصال - تحقق من الـ URL وإعدادات الشبكة" };
  }
}

export async function getWorkflows(): Promise<N8nWorkflow[]> {
  let cursor: string | undefined;
  const allWorkflows: N8nWorkflow[] = [];

  do {
    const path = `/workflows${cursor ? `?cursor=${cursor}` : ""}`;
    const res = await n8nFetch(path);
    if (!res.ok) break;
    const body = await res.json() as { data: N8nWorkflow[]; nextCursor?: string };
    allWorkflows.push(...body.data);
    cursor = body.nextCursor;
  } while (cursor);

  return allWorkflows;
}

export async function getWorkflow(id: string): Promise<N8nWorkflow> {
  const res = await n8nFetch(`/workflows/${id}`);
  if (!res.ok) throw new Error(`Workflow ${id} not found`);
  return res.json() as Promise<N8nWorkflow>;
}

export async function activateWorkflow(id: string): Promise<void> {
  const res = await n8nFetch(`/workflows/${id}/activate`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to activate workflow");
}

export async function deactivateWorkflow(id: string): Promise<void> {
  const res = await n8nFetch(`/workflows/${id}/deactivate`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to deactivate workflow");
}

export async function deleteWorkflow(id: string): Promise<void> {
  const res = await n8nFetch(`/workflows/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete workflow");
}

export async function createWorkflow(data: Record<string, unknown>): Promise<N8nWorkflow> {
  const res = await n8nFetch("/workflows", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let detail = `n8n responded with ${res.status}`;
    try {
      const body = await res.json() as { message?: string; error?: string };
      detail = body.message ?? body.error ?? JSON.stringify(body);
    } catch {}
    throw new Error(`فشل إنشاء الـ workflow في n8n: ${detail}`);
  }
  return res.json() as Promise<N8nWorkflow>;
}

export async function updateWorkflow(id: string, data: Record<string, unknown>): Promise<N8nWorkflow> {
  const res = await n8nFetch(`/workflows/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let detail = `n8n responded with ${res.status}`;
    try {
      const body = await res.json() as { message?: string; error?: string };
      detail = body.message ?? body.error ?? JSON.stringify(body);
    } catch {}
    throw new Error(`فشل تحديث الـ workflow في n8n: ${detail}`);
  }
  return res.json() as Promise<N8nWorkflow>;
}

export async function getWorkflowExecutions(workflowId: string, limit = 20): Promise<N8nExecution[]> {
  const res = await n8nFetch(`/executions?workflowId=${workflowId}&limit=${limit}`);
  if (!res.ok) return [];
  const body = await res.json() as { data: N8nExecution[] };
  return body.data ?? [];
}

export async function getAllRecentExecutions(limit = 20): Promise<N8nExecution[]> {
  const res = await n8nFetch(`/executions?limit=${limit}`);
  if (!res.ok) return [];
  const body = await res.json() as { data: N8nExecution[] };
  return body.data ?? [];
}

export async function getExecutionDetails(executionId: string): Promise<{
  id: string;
  status: string;
  error?: { message?: string; node?: { name?: string }; stack?: string };
  startedAt?: string;
  stoppedAt?: string;
}> {
  try {
    const res = await n8nFetch(`/executions/${executionId}`);
    if (!res.ok) return { id: executionId, status: "unknown" };
    return res.json() as Promise<{ id: string; status: string; error?: { message?: string; node?: { name?: string }; stack?: string }; startedAt?: string; stoppedAt?: string }>;
  } catch {
    return { id: executionId, status: "unknown" };
  }
}

export async function getWorkflowExecutionsWithErrors(workflowId: string, limit = 15): Promise<{
  all: N8nExecution[];
  errorDetails: Array<{ id: string; status: string; error?: { message?: string; node?: { name?: string } }; startedAt?: string }>;
}> {
  const all = await getWorkflowExecutions(workflowId, limit);
  const failedExecs = all.filter(e => e.status === "error" || e.status === "failed").slice(0, 5);
  const errorDetails = await Promise.all(failedExecs.map(e => getExecutionDetails(e.id)));
  return { all, errorDetails };
}

export async function importWorkflow(workflowJson: Record<string, unknown>): Promise<N8nWorkflow> {
  const workflowData = {
    name: (workflowJson.name as string) ?? "Imported Workflow",
    nodes: workflowJson.nodes ?? [],
    connections: workflowJson.connections ?? {},
    settings: workflowJson.settings ?? {},
    // NOTE: do NOT send `active` field — n8n API v1 treats it as read-only on POST
  };
  return createWorkflow(workflowData);
}
