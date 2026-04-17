import { logger } from "../lib/logger";

export type Intent = "create" | "modify" | "query";

export interface IntentResult {
  intent: Intent;
  confidence: "high" | "medium" | "low";
  workflowNameHint: string | null;
  reasoning: string;
}

const STRONG_CREATE_AR = ["أنشئ", "اصنع", "ابني", "إنشاء", "أريد workflow جديد", "اعمل لي workflow", "اصنع لي workflow"];
const STRONG_CREATE_EN = ["create a workflow", "build a workflow", "make a workflow", "generate a workflow", "design a workflow", "new workflow that", "workflow that sends", "workflow that automatically", "automate"];

const STRONG_MODIFY_AR = ["عدّل الـ", "عدل الـ", "غيّر الـ", "غير الـ", "اصلح الـ", "حدّث الـ", "أضف لـ", "احذف من"];
const STRONG_MODIFY_EN = ["modify the workflow", "edit the workflow", "update the workflow", "fix the workflow", "add a node to", "remove the node", "change the trigger of", "update the step"];

function fastKeywordIntent(message: string): IntentResult | null {
  const lower = message.toLowerCase();

  for (const kw of STRONG_CREATE_AR) {
    if (message.includes(kw)) {
      return { intent: "create", confidence: "high", workflowNameHint: null, reasoning: `AR create keyword: "${kw}"` };
    }
  }
  for (const kw of STRONG_CREATE_EN) {
    if (lower.includes(kw)) {
      return { intent: "create", confidence: "high", workflowNameHint: null, reasoning: `EN create keyword: "${kw}"` };
    }
  }
  for (const kw of STRONG_MODIFY_AR) {
    if (message.includes(kw)) {
      return { intent: "modify", confidence: "high", workflowNameHint: null, reasoning: `AR modify keyword: "${kw}"` };
    }
  }
  for (const kw of STRONG_MODIFY_EN) {
    if (lower.includes(kw)) {
      return { intent: "modify", confidence: "high", workflowNameHint: null, reasoning: `EN modify keyword: "${kw}"` };
    }
  }

  return null;
}

export async function detectIntent(
  message: string,
  workflowNames: string[],
  openaiKey: string
): Promise<IntentResult> {
  const fast = fastKeywordIntent(message);
  if (fast && fast.confidence === "high") {
    if (fast.intent !== "create" && workflowNames.length > 0) {
      fast.workflowNameHint = findWorkflowNameHint(message, workflowNames);
    }
    return fast;
  }

  try {
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey: openaiKey, timeout: 15_000 });

    const workflowListSnippet = workflowNames.slice(0, 20).map((n, i) => `${i + 1}. "${n}"`).join("\n");

    const systemPrompt = `You are an intent classifier for an n8n workflow management system.
Classify the user message into one of these intents:
- "create": user wants to CREATE a new workflow from scratch
- "modify": user wants to MODIFY, edit, fix, update an EXISTING workflow in n8n
- "query": user is asking a question, requesting information, or having a general conversation

Rules:
- If the message asks about what a workflow does, how it works, or why it failed → "query"
- If the message asks to add/remove/change something in an existing workflow → "modify"  
- If the message asks to build something new → "create"
- Questions starting with "كيف/ما/هل/لماذا/ايش/وش" (Arabic) or "what/how/why/can you explain/tell me" (English) → usually "query"
- Words like "أضف/add" alone do not mean modify if they're in a question form

Available workflows in n8n:
${workflowListSnippet || "(none configured)"}

Respond ONLY with valid JSON matching this schema:
{"intent":"create"|"modify"|"query","confidence":"high"|"medium"|"low","workflowNameHint":string|null,"reasoning":string}

workflowNameHint: if the user mentions a specific workflow by name or part of its name, return the closest matching workflow name from the list above, otherwise null.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 120,
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as IntentResult;

    if (!parsed.intent || !["create", "modify", "query"].includes(parsed.intent)) {
      throw new Error("Invalid intent from LLM");
    }

    logger.debug({ intent: parsed.intent, confidence: parsed.confidence, hint: parsed.workflowNameHint }, "LLM intent detected");
    return parsed;

  } catch (err) {
    logger.warn({ err }, "LLM intent detection failed — falling back to keyword detection");

    const isArabic = /[\u0600-\u06FF]/.test(message);
    const lower = message.toLowerCase();

    const FALLBACK_CREATE_AR = ["أنشئ", "اصنع", "ابني", "إنشاء", "أريد workflow", "سير عمل"];
    const FALLBACK_CREATE_EN = ["create", "build", "make", "generate", "design", "set up", "new workflow"];
    const FALLBACK_MODIFY_AR = ["عدّل", "عدل", "غيّر", "غير", "اصلح", "حدّث", "أضف", "احذف", "تعديل"];
    const FALLBACK_MODIFY_EN = ["modify", "edit", "update", "change", "fix", "add", "remove", "delete", "adjust"];

    if (isArabic) {
      if (FALLBACK_CREATE_AR.some(k => message.includes(k))) return { intent: "create", confidence: "low", workflowNameHint: null, reasoning: "fallback create" };
      if (FALLBACK_MODIFY_AR.some(k => message.includes(k))) return { intent: "modify", confidence: "low", workflowNameHint: findWorkflowNameHint(message, workflowNames), reasoning: "fallback modify" };
    } else {
      if (FALLBACK_CREATE_EN.some(k => lower.includes(k))) return { intent: "create", confidence: "low", workflowNameHint: null, reasoning: "fallback create" };
      if (FALLBACK_MODIFY_EN.some(k => lower.includes(k))) return { intent: "modify", confidence: "low", workflowNameHint: findWorkflowNameHint(message, workflowNames), reasoning: "fallback modify" };
    }

    return { intent: "query", confidence: "low", workflowNameHint: null, reasoning: "fallback query" };
  }
}

export function findWorkflowNameHint(message: string, workflowNames: string[]): string | null {
  const lower = message.toLowerCase();

  for (const name of workflowNames) {
    if (lower.includes(name.toLowerCase())) return name;
  }

  for (const name of workflowNames) {
    const words = name.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    if (words.some(w => lower.includes(w))) return name;
  }

  return null;
}

export function smartTruncateMessage(content: string, maxLen: number): string {
  if (content.length <= maxLen) return content;

  const jsonMatch = content.match(/```json\n[\s\S]*?\n```/);
  if (jsonMatch) {
    const withoutJson = content.replace(/```json\n[\s\S]*?\n```/, "[workflow JSON omitted]");
    if (withoutJson.length <= maxLen) return withoutJson;
  }

  return content.slice(0, Math.floor(maxLen * 0.65)) + "\n...[truncated]...\n" + content.slice(-Math.floor(maxLen * 0.3));
}
