/**
 * agenticEngine.service.ts
 * FIX 5.1 — Tool Calling Architecture
 *
 * Agentic loop that lets GPT-4o dynamically call tools to:
 *   • Discover exact node schemas before building any node
 *   • Inspect existing n8n workflows to avoid duplication
 *   • Validate workflow JSON and self-correct errors
 *   • Fetch execution errors for debugging
 *
 * Flow:
 *   ┌─────────────────────────────────────────────────────────┐
 *   │  User request                                           │
 *   │     ↓                                                   │
 *   │  GPT-4o + 6 tools (max 10 iterations)                   │
 *   │     ↕  (tool calls + results injected back)             │
 *   │  Final workflow JSON                                    │
 *   │     ↓                                                   │
 *   │  Gemini 2.5 Pro review (optional, same as Phase 2+3)   │
 *   │     ↓                                                   │
 *   │  GPT-4o refinement if score < threshold                 │
 *   │     ↓                                                   │
 *   │  EngineResult                                           │
 *   └─────────────────────────────────────────────────────────┘
 *
 * Safety:
 *   • Max 10 iterations (prevents infinite loops)
 *   • 120 second total timeout via OpenAI client
 *   • Falls back gracefully if Gemini review fails
 */

import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../lib/logger";
import { detectLanguage, type Language } from "./promptBuilder.service";
import {
  validateWorkflowJson,
  sanitizeWorkflowJson,
  extractJson,
} from "./jsonValidator.service";
import { AGENT_TOOL_DEFINITIONS, executeToolCall } from "./agentTools";
import type { ConversationTurn } from "./sequentialEngine.service";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AgenticEngineConfig {
  openaiKey: string;
  geminiKey?: string;
  /** Maximum agentic loop iterations before force-stopping (default: 10) */
  maxIterations?: number;
  /** Gemini score threshold below which refinement is triggered (default: 75) */
  qualityThreshold?: number;
  openaiModel?: string;
  geminiModel?: string;
  /** Existing n8n workflows context string to inject into system prompt */
  n8nContext?: string;
  /** Past conversation turns for multi-turn context (max 6 turns) */
  conversationHistory?: ConversationTurn[];
  /** SSE callbacks for live frontend updates */
  onToolCall?: (event: AgentToolCallEvent) => void;
  onToolResult?: (event: AgentToolResultEvent) => void;
  onIterationDone?: (event: AgentIterationEvent) => void;
  onGeminiPhase?: (phase: "start" | "done", score?: number) => void;
}

/** Emitted when GPT-4o requests a tool call — before execution */
export interface AgentToolCallEvent {
  iteration: number;
  toolName: string;
  args: Record<string, unknown>;
}

/** Emitted after tool execution completes */
export interface AgentToolResultEvent {
  iteration: number;
  toolName: string;
  durationMs: number;
  success: boolean;
}

/** Emitted at the end of each full iteration */
export interface AgentIterationEvent {
  iteration: number;
  toolCallsInIteration: number;
  totalToolCallsSoFar: number;
  durationMs: number;
}

export interface AgenticEngineResult {
  success: boolean;
  workflowJson: Record<string, unknown> | null;
  userMessage: string;
  lang: Language;
  qualityScore: number;
  qualityGrade: string;
  iterations: number;
  totalTimeMs: number;
  toolCallLog: Array<{ tool: string; args: Record<string, unknown>; durationMs: number }>;
  geminiReview?: string;
  error?: string;
  tokenUsage: {
    agentLoopPromptTokens: number;
    agentLoopCompletionTokens: number;
    refinementPromptTokens: number;
    refinementCompletionTokens: number;
    totalOpenaiPromptTokens: number;
    totalOpenaiCompletionTokens: number;
    totalOpenaiTokens: number;
    estimatedCostUsd: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// System Prompt
// ─────────────────────────────────────────────────────────────────────────────

function buildAgentSystemPrompt(lang: Language, n8nContext?: string): string {
  const contextSection = n8nContext
    ? lang === "ar"
      ? `\n\n## سياق n8n الحالي:\n${n8nContext}`
      : `\n\n## Current n8n Context:\n${n8nContext}`
    : "";

  if (lang === "ar") {
    return `أنت وكيل ذكي متخصص في بناء n8n workflows باستخدام Tool Calling.

## أسلوب عملك — خطوات مُلزمة:

**الخطوة 1: الاستكشاف (BEFORE building anything)**
- استخدم \`search_node_types\` لاكتشاف الـ nodes المتاحة للمهمة
- استخدم \`list_available_workflows\` لمعرفة ما هو موجود مسبقاً
- استخدم \`get_node_schema\` لكل node ستستخدمها — احصل على البنية الدقيقة

**الخطوة 2: البناء**
- ابنِ workflow JSON كاملاً باستخدام البيانات الحقيقية من الأدوات

**الخطوة 3: التحقق (BEFORE final answer)**
- استخدم \`validate_workflow_json\` للتحقق من الـ JSON
- إذا وُجدت أخطاء: صحّح وأعد التحقق

**الخطوة 4: الإجابة النهائية**
- أرسل **JSON فقط** للـ workflow في ردك النهائي — بدون أي نص إضافي
- لا تكتب أي تفسير أو ملاحظات حول الـ JSON

## متطلبات الـ JSON النهائي:
يجب أن يحتوي على:
- \`name\`: اسم وصفي واضح للـ workflow
- \`nodes\`: array كاملة لجميع الـ nodes، كل node تحتوي على:
  - \`id\` (UUID فريد)
  - \`name\` (اسم قصير واضح)
  - \`type\` (من schema الحقيقي)
  - \`typeVersion\` (من schema الحقيقي)
  - \`position\` ([x, y] بفاصل 200-250 بين الـ nodes)
  - \`parameters\` (من schema الحقيقي)
  - \`credentials\` (إذا كانت مطلوبة)
- \`connections\`: كائن الاتصالات الصحيح
- \`settings\`: \`{"executionOrder": "v1"}\`

## القاعدة الذهبية:
لا تخمّن أي schema أو type أو typeVersion — استخدم get_node_schema دائماً.${contextSection}`;
  }

  return `You are an expert n8n workflow building agent using Tool Calling architecture.

## Your Working Method — Mandatory Steps:

**Step 1: Exploration (BEFORE building anything)**
- Use \`search_node_types\` to discover available nodes for the task
- Use \`list_available_workflows\` to understand existing context
- Use \`get_node_schema\` for EVERY node you plan to use — get the exact schema

**Step 2: Build**
- Construct a complete workflow JSON using real data from the tools

**Step 3: Validate (BEFORE final answer)**
- Use \`validate_workflow_json\` to check the JSON
- If errors found: fix and re-validate

**Step 4: Final Answer**
- Respond with **JSON only** — no explanatory text around the JSON
- The JSON is your complete final answer

## Final JSON Requirements:
Must include:
- \`name\`: descriptive workflow name
- \`nodes\`: complete array where each node has:
  - \`id\` (unique UUID)
  - \`name\` (short clear name)
  - \`type\` (from real schema)
  - \`typeVersion\` (from real schema)
  - \`position\` ([x, y] with 200-250px spacing between nodes)
  - \`parameters\` (from real schema)
  - \`credentials\` (if required)
- \`connections\`: correct connections object
- \`settings\`: \`{"executionOrder": "v1"}\`

## Golden Rule:
Never guess any schema, type, or typeVersion — always use get_node_schema.${contextSection}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Gemini Review
// ─────────────────────────────────────────────────────────────────────────────

async function runGeminiReview(
  workflowJson: Record<string, unknown>,
  userRequest: string,
  geminiKey: string,
  geminiModel: string,
  lang: Language
): Promise<{ score: number; grade: string; feedback: string }> {
  const genAI = new GoogleGenerativeAI(geminiKey);
  const model = genAI.getGenerativeModel({ model: geminiModel });

  const workflowStr = JSON.stringify(workflowJson, null, 2).slice(0, 6000);

  const prompt =
    lang === "ar"
      ? `أنت خبير مراجعة n8n workflows. قيّم هذا الـ workflow من 0 إلى 100.

طلب المستخدم: ${userRequest}

الـ Workflow:
\`\`\`json
${workflowStr}
\`\`\`

أجب بـ JSON فقط بدون أي نص إضافي:
{
  "score": <رقم من 0-100>,
  "grade": "<A+/A/B+/B/C+/C/D>",
  "feedback": "<ملاحظات تحسين مختصرة إن وجدت، بالعربية>"
}`
      : `You are an expert n8n workflow reviewer. Score this workflow 0-100.

User request: ${userRequest}

Workflow:
\`\`\`json
${workflowStr}
\`\`\`

Respond with JSON only, no extra text:
{
  "score": <0-100>,
  "grade": "<A+/A/B+/B/C+/C/D>",
  "feedback": "<brief improvement notes if any>"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  try {
    const parsed = JSON.parse(extractJson(text)) as {
      score?: number;
      grade?: string;
      feedback?: string;
    };
    return {
      score: Math.min(100, Math.max(0, Number(parsed.score ?? 75))),
      grade: String(parsed.grade ?? "B"),
      feedback: String(parsed.feedback ?? ""),
    };
  } catch {
    return { score: 75, grade: "B", feedback: text.slice(0, 400) };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Gemini Refinement (if score < threshold)
// ─────────────────────────────────────────────────────────────────────────────

async function runGeminiRefinement(
  workflowJson: Record<string, unknown>,
  userRequest: string,
  geminiKey: string,
  geminiModel: string,
  feedback: string,
  lang: Language,
  openai: OpenAI,
  openaiModel: string
): Promise<{
  refined: Record<string, unknown>;
  promptTokens: number;
  completionTokens: number;
}> {
  const genAI = new GoogleGenerativeAI(geminiKey);
  const model = genAI.getGenerativeModel({ model: geminiModel });

  const refinePlan =
    lang === "ar"
      ? `بناءً على هذا التقييم، ما التعديلات المطلوبة على الـ workflow؟ كن محدداً جداً (بنود مرقّمة):\n${feedback}`
      : `Based on this review, what specific changes are needed? Be very precise (numbered list):\n${feedback}`;

  const planResult = await model.generateContent(refinePlan);
  const refinementPlan = planResult.response.text().slice(0, 2000);

  // GPT-4o applies the refinement plan
  const refineResp = await openai.chat.completions.create({
    model: openaiModel,
    messages: [
      {
        role: "system",
        content:
          lang === "ar"
            ? "أنت خبير n8n. طبّق التعديلات المطلوبة على الـ workflow وأعد JSON كاملاً فقط."
            : "You are an n8n expert. Apply the required fixes to the workflow and return complete JSON only.",
      },
      {
        role: "user",
        content:
          lang === "ar"
            ? `الطلب الأصلي: ${userRequest}\n\nالـ Workflow الحالي:\n\`\`\`json\n${JSON.stringify(workflowJson, null, 2).slice(0, 5000)}\n\`\`\`\n\nالتعديلات المطلوبة:\n${refinementPlan}`
            : `Original request: ${userRequest}\n\nCurrent workflow:\n\`\`\`json\n${JSON.stringify(workflowJson, null, 2).slice(0, 5000)}\n\`\`\`\n\nRequired fixes:\n${refinementPlan}`,
      },
    ],
    max_tokens: 4000,
    temperature: 0.15,
    response_format: { type: "json_object" },
  });

  const refinedStr = refineResp.choices[0]?.message?.content ?? "";
  let refined = workflowJson;
  try {
    const parsed = JSON.parse(extractJson(refinedStr)) as Record<string, unknown>;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const sanitized = sanitizeWorkflowJson(parsed);
      refined = sanitized as Record<string, unknown>;
    }
  } catch {
    // Keep original if refinement parse fails
  }

  return {
    refined,
    promptTokens: refineResp.usage?.prompt_tokens ?? 0,
    completionTokens: refineResp.usage?.completion_tokens ?? 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Agentic Engine
// ─────────────────────────────────────────────────────────────────────────────

export async function runAgenticEngine(
  userRequest: string,
  config: AgenticEngineConfig
): Promise<AgenticEngineResult> {
  const startTime = Date.now();
  const lang = detectLanguage(userRequest);
  const maxIterations = Math.min(config.maxIterations ?? 10, 15);
  const qualityThreshold = config.qualityThreshold ?? 75;
  const openaiModel = config.openaiModel ?? "gpt-4o";
  const geminiModel = config.geminiModel ?? "gemini-2.5-pro-exp-03-25";

  logger.info(
    { userRequest: userRequest.slice(0, 100), maxIterations, openaiModel },
    "FIX 5.1: AgenticEngine starting"
  );

  const openai = new OpenAI({ apiKey: config.openaiKey, timeout: 120000 });

  // Accumulate token usage
  let agentLoopPromptTokens = 0;
  let agentLoopCompletionTokens = 0;
  let refinementPromptTokens = 0;
  let refinementCompletionTokens = 0;

  // Tool call log for reporting
  const toolCallLog: Array<{ tool: string; args: Record<string, unknown>; durationMs: number }> = [];

  // ── Build initial messages ──────────────────────────────────────────────────
  const systemPrompt = buildAgentSystemPrompt(lang, config.n8nContext);
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
  ];

  // Inject past conversation turns (max 6 turns = 12 messages)
  if (config.conversationHistory && config.conversationHistory.length > 0) {
    const trimmed = config.conversationHistory.slice(-6);
    for (const turn of trimmed) {
      messages.push({
        role: turn.role,
        content:
          turn.content.length > 1200
            ? turn.content.slice(0, 1200) + "...[truncated]"
            : turn.content,
      });
    }
  }

  messages.push({ role: "user", content: userRequest });

  // ── Agentic Loop ────────────────────────────────────────────────────────────
  let iterations = 0;
  let finalWorkflowJson: Record<string, unknown> | null = null;

  while (iterations < maxIterations) {
    iterations++;
    const iterStart = Date.now();
    let toolCallsInThisIteration = 0;

    logger.info({ iteration: iterations, messagesCount: messages.length }, "AgenticEngine: GPT-4o call");

    const response = await openai.chat.completions.create({
      model: openaiModel,
      messages,
      tools: AGENT_TOOL_DEFINITIONS,
      tool_choice: "auto",
      max_tokens: 4000,
      temperature: 0.15,
    });

    agentLoopPromptTokens += response.usage?.prompt_tokens ?? 0;
    agentLoopCompletionTokens += response.usage?.completion_tokens ?? 0;

    const choice = response.choices[0];
    if (!choice) {
      logger.warn({ iteration: iterations }, "AgenticEngine: empty choice — stopping loop");
      break;
    }

    const assistantMsg = choice.message;
    messages.push(assistantMsg);

    // ── CASE A: GPT-4o requested tool calls ────────────────────────────────
    if (choice.finish_reason === "tool_calls" && assistantMsg.tool_calls?.length) {
      toolCallsInThisIteration = assistantMsg.tool_calls.length;

      for (const toolCall of assistantMsg.tool_calls) {
        const toolName = toolCall.function.name;
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;
        } catch {
          args = {};
        }

        // Emit SSE event: tool call about to execute
        config.onToolCall?.({ iteration: iterations, toolName, args });

        logger.info({ iteration: iterations, toolName }, "AgenticEngine: executing tool");
        const toolResult = await executeToolCall(toolName, args);
        toolCallLog.push({ tool: toolName, args, durationMs: toolResult.durationMs });

        // Emit SSE event: tool result
        config.onToolResult?.({
          iteration: iterations,
          toolName,
          durationMs: toolResult.durationMs,
          success: !toolResult.error,
        });

        // Inject tool result back into conversation
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult.result),
        });
      }

      config.onIterationDone?.({
        iteration: iterations,
        toolCallsInIteration: toolCallsInThisIteration,
        totalToolCallsSoFar: toolCallLog.length,
        durationMs: Date.now() - iterStart,
      });

      continue; // Next iteration: GPT-4o sees all tool results
    }

    // ── CASE B: Final response (no tool calls) ─────────────────────────────
    const rawContent = assistantMsg.content ?? "";
    logger.info(
      { iteration: iterations, contentLength: rawContent.length },
      "AgenticEngine: final response received"
    );

    // Try to extract workflow JSON from the response
    let extracted = extractJson(rawContent);
    const validation = validateWorkflowJson(extracted);

    if (validation.valid && validation.parsedJson) {
      finalWorkflowJson = sanitizeWorkflowJson(validation.parsedJson) as Record<string, unknown>;
      logger.info(
        { nodeCount: (finalWorkflowJson.nodes as unknown[])?.length ?? 0 },
        "AgenticEngine: valid workflow extracted"
      );
      break;
    }

    // Fallback: try direct JSON.parse on the extracted string
    try {
      const directParsed = JSON.parse(extracted) as Record<string, unknown>;
      if (directParsed && typeof directParsed === "object" && !Array.isArray(directParsed)) {
        const sanitized = sanitizeWorkflowJson(directParsed);
        finalWorkflowJson = sanitized as Record<string, unknown>;
        logger.info(
          { nodeCount: (finalWorkflowJson.nodes as unknown[])?.length ?? 0 },
          "AgenticEngine: workflow extracted via direct parse"
        );
        break;
      }
    } catch {
      // Extraction failed
    }

    // Could not extract valid JSON — ask GPT-4o once more with explicit instruction
    if (iterations < maxIterations) {
      logger.warn({ iteration: iterations }, "AgenticEngine: could not extract JSON — prompting again");
      messages.push({
        role: "user",
        content:
          lang === "ar"
            ? "أرسل الـ workflow بصيغة JSON فقط — بدون أي نص إضافي قبله أو بعده. فقط الـ JSON."
            : "Please respond with the workflow JSON only. No explanatory text before or after. Just the raw JSON object.",
      });
      continue;
    }

    break;
  }

  // ── Gemini Review ───────────────────────────────────────────────────────────
  let qualityScore = 70;
  let qualityGrade = "C+";
  let geminiReview = "";

  if (finalWorkflowJson && config.geminiKey) {
    try {
      config.onGeminiPhase?.("start");
      logger.info("AgenticEngine: running Gemini review");

      const review = await runGeminiReview(
        finalWorkflowJson,
        userRequest,
        config.geminiKey,
        geminiModel,
        lang
      );
      qualityScore = review.score;
      qualityGrade = review.grade;
      geminiReview = review.feedback;

      config.onGeminiPhase?.("done", review.score);
      logger.info({ qualityScore, qualityGrade }, "AgenticEngine: Gemini review done");

      // ── Refinement if score < threshold ──────────────────────────────────
      if (qualityScore < qualityThreshold && review.feedback.length > 20) {
        logger.info({ qualityScore, threshold: qualityThreshold }, "AgenticEngine: score below threshold — refining");
        try {
          const refinement = await runGeminiRefinement(
            finalWorkflowJson,
            userRequest,
            config.geminiKey,
            geminiModel,
            review.feedback,
            lang,
            openai,
            openaiModel
          );
          finalWorkflowJson = refinement.refined;
          refinementPromptTokens = refinement.promptTokens;
          refinementCompletionTokens = refinement.completionTokens;
          logger.info("AgenticEngine: refinement applied");
        } catch (err) {
          logger.warn({ err }, "AgenticEngine: refinement failed — keeping original");
        }
      }
    } catch (err) {
      logger.warn({ err }, "AgenticEngine: Gemini review failed — skipping");
    }
  }

  // ── Build result ────────────────────────────────────────────────────────────
  const totalTimeMs = Date.now() - startTime;
  const success = finalWorkflowJson !== null;
  const uniqueTools = [...new Set(toolCallLog.map((t) => t.tool))].join(", ");

  const totalPrompt = agentLoopPromptTokens + refinementPromptTokens;
  const totalCompletion = agentLoopCompletionTokens + refinementCompletionTokens;
  const estimatedCostUsd =
    Math.round(
      ((totalPrompt / 1_000_000) * 2.5 + (totalCompletion / 1_000_000) * 10) * 10000
    ) / 10000;

  // Build user-facing message
  let userMessage: string;
  if (success) {
    const nodeCount = (finalWorkflowJson?.nodes as unknown[])?.length ?? 0;
    const toolsSummary =
      uniqueTools ||
      (lang === "ar" ? "لا أدوات (إجابة مباشرة)" : "none (direct answer)");

    userMessage =
      lang === "ar"
        ? `✅ **تم بناء الـ workflow باستخدام Tool Calling**

🔍 **جولات التحقيق:** ${iterations}
🛠️ **الأدوات المستخدمة:** ${toolsSummary}
📦 **عدد الـ nodes:** ${nodeCount}
⭐ **جودة Gemini:** ${qualityGrade} (${qualityScore}/100)
⏱️ **الوقت الكلي:** ${(totalTimeMs / 1000).toFixed(1)}ث${geminiReview ? `\n\n💡 **ملاحظات Gemini:** ${geminiReview}` : ""}`
        : `✅ **Workflow built via Tool Calling**

🔍 **Investigation rounds:** ${iterations}
🛠️ **Tools used:** ${toolsSummary}
📦 **Node count:** ${nodeCount}
⭐ **Gemini quality:** ${qualityGrade} (${qualityScore}/100)
⏱️ **Total time:** ${(totalTimeMs / 1000).toFixed(1)}s${geminiReview ? `\n\n💡 **Gemini notes:** ${geminiReview}` : ""}`;
  } else {
    userMessage =
      lang === "ar"
        ? "❌ تعذّر استخلاص workflow JSON صالح بعد الاستقصاء. يرجى إعادة المحاولة بوصف أكثر تفصيلاً."
        : "❌ Could not extract a valid workflow JSON after investigation. Please retry with a more detailed description.";
  }

  logger.info(
    {
      success,
      iterations,
      toolCalls: toolCallLog.length,
      qualityScore,
      totalTimeMs,
      estimatedCostUsd,
    },
    "FIX 5.1: AgenticEngine complete"
  );

  return {
    success,
    workflowJson: finalWorkflowJson,
    userMessage,
    lang,
    qualityScore,
    qualityGrade,
    iterations,
    totalTimeMs,
    toolCallLog,
    geminiReview,
    tokenUsage: {
      agentLoopPromptTokens,
      agentLoopCompletionTokens,
      refinementPromptTokens,
      refinementCompletionTokens,
      totalOpenaiPromptTokens: totalPrompt,
      totalOpenaiCompletionTokens: totalCompletion,
      totalOpenaiTokens: totalPrompt + totalCompletion,
      estimatedCostUsd,
    },
  };
}
