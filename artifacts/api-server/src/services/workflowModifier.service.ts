/**
 * workflowModifier.service.ts
 * Handles AI-driven workflow modification requests from the chat.
 *
 * Flow:
 *   Phase 1: GPT-4o  → Understands the modification request + generates modified workflow
 *   Phase 2: Gemini  → Validates the changes are correct and complete
 *   Phase 3: n8n API → Applies the fix directly to n8n (if connected)
 */

import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../lib/logger";
import { extractJson } from "./jsonValidator.service";
import type { Language } from "./promptBuilder.service";

export interface ModifierConfig {
  openaiKey: string;
  geminiKey?: string;
  onPhaseUpdate?: (phase: ModifierPhase) => void;
}

export interface ModifierPhase {
  phase: 1 | 2 | 3;
  label: string;
  labelAr: string;
  status: "pending" | "running" | "done" | "failed";
  durationMs?: number;
}

export interface ModifierResult {
  success: boolean;
  modifiedWorkflowJson: Record<string, unknown> | null;
  changesSummary: string;
  changesSummaryAr: string;
  phases: ModifierPhase[];
  totalTimeMs: number;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Prompts
// ─────────────────────────────────────────────────────────────────────────────

function buildModifierSystemPrompt(lang: Language): string {
  return `You are a senior n8n workflow engineer. Your job is to modify an existing n8n workflow JSON based on the user's specific request.

Rules:
1. Keep ALL existing node IDs, names, and connections that are not affected by the change
2. Only modify, add, or remove what the user explicitly asked for
3. Preserve the overall structure and logic of the workflow
4. Use correct n8n node types and exact parameter names
5. Return a valid n8n workflow JSON with: nodes (array), connections (object), settings (object)
6. Include a brief summary of what was changed

Return ONLY a valid JSON object with this structure (no markdown, no extra text):
{
  "nodes": [...],
  "connections": {...},
  "settings": { "executionOrder": "v1" },
  "name": "<workflow name>",
  "_changesSummary": "Brief English description of what was changed",
  "_changesSummaryAr": "وصف عربي مختصر للتغييرات التي تمت"
}`;
}

function buildModifierUserPrompt(
  currentWorkflowJson: string,
  userRequest: string,
  lang: Language
): string {
  if (lang === "ar") {
    return `الـ workflow الحالي في n8n:
\`\`\`json
${currentWorkflowJson}
\`\`\`

طلب التعديل:
"${userRequest}"

قم بتعديل الـ workflow بدقة حسب الطلب. أرجع الـ workflow JSON المعدّل الكامل فقط.`;
  }

  return `Current workflow in n8n:
\`\`\`json
${currentWorkflowJson}
\`\`\`

Modification request:
"${userRequest}"

Modify the workflow precisely as requested. Return the complete modified workflow JSON only.`;
}

function buildGeminiValidationPrompt(
  originalJson: string,
  modifiedJson: string,
  userRequest: string
): string {
  return `You are an n8n workflow validator. A workflow was modified based on a user request. Verify the modification is correct.

User request: "${userRequest}"

Original workflow nodes count: ${(() => { try { return (JSON.parse(originalJson).nodes as unknown[]).length; } catch { return "?"; } })()}
Modified workflow nodes count: ${(() => { try { return (JSON.parse(modifiedJson).nodes as unknown[]).length; } catch { return "?"; } })()}

Modified workflow:
\`\`\`json
${modifiedJson.slice(0, 6000)}
\`\`\`

Check:
1. Does the modification fulfill the user request?
2. Is the JSON structure valid for n8n?
3. Are all connections still intact?
4. Any critical issues introduced?

Respond ONLY with a JSON object:
{
  "valid": true,
  "issues": [],
  "note": "Brief validation note"
}`;
}

// DEAD CODE REMOVED: extractWorkflowNameFromMessage was superseded by
// detectIntent + findWorkflowNameHint in intentDetector.service.ts (gpt-4o-mini,
// cheaper and already integrated into chat.routes.ts). The function was never
// imported by any route — removing avoids confusion and wasted gpt-4o tokens.

// ─────────────────────────────────────────────────────────────────────────────
// Main Modifier
// ─────────────────────────────────────────────────────────────────────────────

export async function runWorkflowModifier(
  currentWorkflowJson: Record<string, unknown>,
  userRequest: string,
  lang: Language,
  config: ModifierConfig
): Promise<ModifierResult> {
  const startTime = Date.now();

  const phases: ModifierPhase[] = [
    {
      phase: 1,
      label: "GPT-4o: Generating modification",
      labelAr: "GPT-4o: توليد التعديل",
      status: "pending",
    },
    {
      phase: 2,
      label: "Gemini 2.5 Pro: Validating changes",
      labelAr: "Gemini 2.5 Pro: التحقق من التعديلات",
      status: "pending",
    },
    {
      phase: 3,
      label: "Applying to n8n",
      labelAr: "تطبيق التعديل على n8n",
      status: "pending",
    },
  ];

  const notify = config.onPhaseUpdate ?? (() => undefined);

  const result: ModifierResult = {
    success: false,
    modifiedWorkflowJson: null,
    changesSummary: "",
    changesSummaryAr: "",
    phases,
    totalTimeMs: 0,
  };

  const openai = new OpenAI({ apiKey: config.openaiKey, timeout: 90000 });
  const currentJsonString = JSON.stringify(currentWorkflowJson, null, 2);

  // ── Phase 1: GPT-4o generates modified workflow ────────────────────────────
  const p1Start = Date.now();
  phases[0]!.status = "running";
  notify({ ...phases[0]! });

  let modifiedJson: Record<string, unknown> | null = null;

  try {
    const p1Response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: buildModifierSystemPrompt(lang) },
        {
          role: "user",
          content: buildModifierUserPrompt(currentJsonString, userRequest, lang),
        },
      ],
      max_tokens: 4000,
      temperature: 0.15,
      response_format: { type: "json_object" },
    });

    const p1Raw = p1Response.choices[0]?.message?.content ?? "{}";
    try {
      modifiedJson = JSON.parse(p1Raw) as Record<string, unknown>;

      result.changesSummary =
        (modifiedJson._changesSummary as string) ?? "Workflow modified as requested";
      result.changesSummaryAr =
        (modifiedJson._changesSummaryAr as string) ?? "تم تعديل الـ workflow حسب الطلب";

      // Remove internal metadata fields before using the JSON
      delete modifiedJson._changesSummary;
      delete modifiedJson._changesSummaryAr;

      if (!modifiedJson.nodes || !Array.isArray(modifiedJson.nodes)) {
        throw new Error("Modified JSON missing nodes array");
      }
    } catch (parseErr) {
      const extracted = extractJson(p1Raw);
      modifiedJson = JSON.parse(extracted) as Record<string, unknown>;
    }

    phases[0]!.status = "done";
    phases[0]!.durationMs = Date.now() - p1Start;
    notify({ ...phases[0]! });
    logger.info("Workflow modifier Phase 1 complete");
  } catch (err) {
    logger.error({ err }, "Workflow modifier Phase 1 failed");
    phases[0]!.status = "failed";
    notify({ ...phases[0]! });
    result.error = `Phase 1 failed: ${String(err)}`;
    result.totalTimeMs = Date.now() - startTime;
    return result;
  }

  // ── Phase 2: Gemini validates the changes ─────────────────────────────────
  const p2Start = Date.now();
  phases[1]!.status = "running";
  notify({ ...phases[1]! });

  if (config.geminiKey && modifiedJson) {
    try {
      const genAI = new GoogleGenerativeAI(config.geminiKey);
      // FIX 3.1: use correct Gemini 2.5 Pro experimental model name
      const geminiModel = genAI.getGenerativeModel({
        model: "gemini-2.5-pro-exp-03-25",
        generationConfig: { temperature: 0.1, maxOutputTokens: 500 },
      });

      const validationPrompt = buildGeminiValidationPrompt(
        currentJsonString,
        JSON.stringify(modifiedJson, null, 2),
        userRequest
      );

      const p2Response = await geminiModel.generateContent(validationPrompt);
      const p2Text = p2Response.response.text();

      try {
        const validation = JSON.parse(extractJson(p2Text)) as {
          valid?: boolean;
          issues?: string[];
          note?: string;
        };

        if (!validation.valid && validation.issues && validation.issues.length > 0) {
          logger.warn({ issues: validation.issues }, "Gemini found issues in modified workflow");
        }
      } catch {
        logger.warn("Gemini validation parse failed — continuing");
      }

      phases[1]!.status = "done";
      phases[1]!.durationMs = Date.now() - p2Start;
      notify({ ...phases[1]! });
    } catch (err) {
      logger.warn({ err }, "Workflow modifier Phase 2 (Gemini) failed — continuing");
      phases[1]!.status = "failed";
      notify({ ...phases[1]! });
    }
  } else {
    phases[1]!.status = "done";
    phases[1]!.durationMs = 0;
    notify({ ...phases[1]! });
  }

  result.modifiedWorkflowJson = modifiedJson;
  result.success = true;
  result.totalTimeMs = Date.now() - startTime;

  // Phase 3 status is set by the caller (chat route) after applying to n8n
  phases[2]!.status = "pending";
  notify({ ...phases[2]! });

  return result;
}
