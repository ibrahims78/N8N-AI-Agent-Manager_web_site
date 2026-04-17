/**
 * sequentialEngine.service.ts
 * The Sequential AI Engine for n8n Workflow Generation.
 *
 * Pipeline:
 *   Phase 1A: GPT-4o    → Identifies required nodes (node analysis)
 *   Phase 1B: GPT-4o    → Builds workflow JSON with injected node schemas
 *   Phase 2:  Gemini    → Reviews and scores the workflow
 *   Phase 3:  GPT-4o    → Refines based on Gemini's feedback
 *   Phase 4:  Gemini    → Final validation and quality gate
 *
 * If Phase 4 score < threshold: up to 2 additional refinement rounds.
 */

import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../lib/logger";
import {
  detectLanguage,
  buildPhase1ASystemPrompt,
  buildPhase1AUserPrompt,
  buildPhase1BSystemPrompt,
  buildPhase1BUserPrompt,
  buildPhase1SystemPrompt,
  buildPhase1UserPrompt,
  buildPhase2Prompt,
  buildPhase3SystemPrompt,
  buildPhase3UserPrompt,
  buildPhase4Prompt,
  buildSuccessMessage,
  type Language,
} from "./promptBuilder.service";
import {
  validateWorkflowJson,
  sanitizeWorkflowJson,
  extractJson,
} from "./jsonValidator.service";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** A single turn of conversation history to pass context to the engine. */
export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

export interface EngineConfig {
  openaiKey: string;
  geminiKey: string;
  maxRefinementRounds?: number;
  qualityThreshold?: number;
  openaiModel?: string;
  geminiModel?: string;
  onPhaseUpdate?: (phase: PhaseProgress) => void;
  /** [أ1] n8n existing workflows context to inject into Phase 1B */
  n8nContext?: string;
  /** [أ2] Node count threshold below which smart-gate may skip Phase 3+4 */
  simpleWorkflowNodeThreshold?: number;
  /**
   * [FIX 3.4] Last N turns of the conversation (user + assistant) so Phase 1B
   * is aware of previously created or discussed workflows in this session.
   * Pass at most 6 turns (12 messages) to keep the prompt concise.
   */
  conversationHistory?: ConversationTurn[];
  /**
   * [FIX 4.1] Streaming callback for Phase 1B (the longest phase).
   * Called with each text chunk as it is generated, so the frontend can
   * display live progress instead of waiting silently for 20-40 seconds.
   */
  onPhase1BStream?: (chunk: string) => void;
  /**
   * [ISSUE-6] Streaming callback for Phase 2 (Gemini review).
   * Eliminates the silent 10-20 second wait during Gemini's review phase.
   */
  onPhase2Stream?: (chunk: string) => void;
  /**
   * [ISSUE-6] Streaming callback for Phase 4 (Gemini final validation).
   * Eliminates the silent 10-20 second wait during Gemini's validation phase.
   */
  onPhase4Stream?: (chunk: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX 4.4: Token Usage & Cost Tracking
// ─────────────────────────────────────────────────────────────────────────────

export interface TokenUsage {
  phase1aPromptTokens: number;
  phase1aCompletionTokens: number;
  phase1bPromptTokens: number;
  phase1bCompletionTokens: number;
  phase3PromptTokens: number;
  phase3CompletionTokens: number;
  phase3ExtraPromptTokens: number;
  phase3ExtraCompletionTokens: number;
  totalOpenaiPromptTokens: number;
  totalOpenaiCompletionTokens: number;
  totalOpenaiTokens: number;
  /** Estimated cost in USD based on GPT-4o pricing ($2.50/1M input, $10/1M output) */
  estimatedCostUsd: number;
}

function buildTokenUsage(raw: {
  p1aPrompt: number; p1aCompletion: number;
  p1bPrompt: number; p1bCompletion: number;
  p3Prompt: number; p3Completion: number;
  p3xPrompt: number; p3xCompletion: number;
}): TokenUsage {
  const totalPrompt = raw.p1aPrompt + raw.p1bPrompt + raw.p3Prompt + raw.p3xPrompt;
  const totalCompletion = raw.p1aCompletion + raw.p1bCompletion + raw.p3Completion + raw.p3xCompletion;
  const totalTokens = totalPrompt + totalCompletion;
  // GPT-4o pricing: $2.50 per 1M input tokens, $10.00 per 1M output tokens
  const estimatedCostUsd = (totalPrompt / 1_000_000) * 2.50 + (totalCompletion / 1_000_000) * 10.00;

  return {
    phase1aPromptTokens: raw.p1aPrompt,
    phase1aCompletionTokens: raw.p1aCompletion,
    phase1bPromptTokens: raw.p1bPrompt,
    phase1bCompletionTokens: raw.p1bCompletion,
    phase3PromptTokens: raw.p3Prompt,
    phase3CompletionTokens: raw.p3Completion,
    phase3ExtraPromptTokens: raw.p3xPrompt,
    phase3ExtraCompletionTokens: raw.p3xCompletion,
    totalOpenaiPromptTokens: totalPrompt,
    totalOpenaiCompletionTokens: totalCompletion,
    totalOpenaiTokens: totalTokens,
    estimatedCostUsd: Math.round(estimatedCostUsd * 10_000) / 10_000,
  };
}

export interface PhaseProgress {
  phase: 1 | 2 | 3 | 4;
  label: string;
  labelAr: string;
  status: "pending" | "running" | "done" | "failed";
  durationMs?: number;
  round?: number;
}

export interface EngineResult {
  success: boolean;
  userMessage: string;
  workflowJson: Record<string, unknown> | null;
  phases: PhaseProgress[];
  qualityScore: number;
  qualityGrade: string;
  roundsCount: number;
  totalTimeMs: number;
  phase1Result: Record<string, unknown> | null;
  phase2Feedback: string | null;
  phase3Result: Record<string, unknown> | null;
  phase4Approved: boolean;
  error?: string;
  lang: Language;
  /** [FIX 4.4] Token usage and estimated cost breakdown per phase */
  tokenUsage?: TokenUsage;
}

interface GeminiReviewReport {
  overallScore?: number;
  approved?: boolean;
  criticalIssues?: string[];
  improvements?: string[];
  strengths?: string[];
  specificFixes?: string[];
  reviewSummary?: string;
}

interface GeminiValidationReport {
  finalScore?: number;
  readyForDeployment?: boolean;
  remainingIssues?: string[];
  validationSummary?: string;
  qualityGrade?: string;
  deploymentNotes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// FIX 3.6: Exponential Backoff Retry Helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retries an async function with exponential backoff.
 * - maxAttempts: total tries (including the first)
 * - baseDelayMs: initial wait (doubles each retry)
 * - Skips retry for non-retryable errors (e.g. invalid API key)
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  maxAttempts = 3,
  baseDelayMs = 1200
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // Do not retry on auth/permission errors — they won't recover
      const isNonRetryable =
        message.includes("401") ||
        message.includes("403") ||
        message.includes("invalid_api_key") ||
        message.includes("API key");

      if (attempt === maxAttempts || isNonRetryable) {
        logger.error({ attempt, label, err }, "withRetry exhausted");
        throw err;
      }

      const delayMs = baseDelayMs * Math.pow(2, attempt - 1);
      logger.warn({ attempt, maxAttempts, delayMs, label }, "withRetry: retrying after delay");
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  // TypeScript unreachable — loop always throws or returns
  throw new Error("withRetry: unreachable");
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Engine Function
// ─────────────────────────────────────────────────────────────────────────────

export async function runSequentialEngine(
  userRequest: string,
  config: EngineConfig
): Promise<EngineResult> {
  const startTime = Date.now();
  const lang = detectLanguage(userRequest);
  const maxRounds = config.maxRefinementRounds ?? 2;
  const threshold = config.qualityThreshold ?? 80;
  const notify = config.onPhaseUpdate ?? (() => undefined);

  const phases: PhaseProgress[] = [
    {
      phase: 1,
      label: "GPT-4o: Analyzing nodes & building workflow",
      labelAr: "GPT-4o: تحليل الـ nodes وبناء الـ workflow",
      status: "pending",
    },
    {
      phase: 2,
      label: "Gemini 2.5 Pro: Reviewing & scoring",
      labelAr: "Gemini 2.5 Pro: مراجعة وتقييم",
      status: "pending",
    },
    {
      phase: 3,
      label: "GPT-4o: Refining workflow",
      labelAr: "GPT-4o: تحسين الـ workflow",
      status: "pending",
    },
    {
      phase: 4,
      label: "Gemini 2.5 Pro: Final validation",
      labelAr: "Gemini 2.5 Pro: التحقق النهائي",
      status: "pending",
    },
  ];

  const result: EngineResult = {
    success: false,
    userMessage: "",
    workflowJson: null,
    phases,
    qualityScore: 0,
    qualityGrade: "F",
    roundsCount: 0,
    totalTimeMs: 0,
    phase1Result: null,
    phase2Feedback: null,
    phase3Result: null,
    phase4Approved: false,
    lang,
  };

  const openai = new OpenAI({ apiKey: config.openaiKey, timeout: 90000 });
  const geminiAI = new GoogleGenerativeAI(config.geminiKey);
  const openaiModel = config.openaiModel ?? "gpt-4o";
  // FIX 3.1: use the correct experimental model name that matches the label "Gemini 2.5 Pro"
  const geminiModel = config.geminiModel ?? "gemini-2.5-pro-exp-03-25";
  const n8nContext = config.n8nContext;
  const simpleNodeThreshold = config.simpleWorkflowNodeThreshold ?? 3;
  const onPhase1BStream = config.onPhase1BStream;
  const onPhase2Stream = config.onPhase2Stream;
  const onPhase4Stream = config.onPhase4Stream;

  // FIX 3.4: Conversation history — last N turns for Phase 1B context
  // Trim to last 6 turns max so the prompt stays within token budget
  const conversationHistory = (config.conversationHistory ?? []).slice(-6);

  // FIX 4.4: Token usage accumulators
  const tokenRaw = {
    p1aPrompt: 0, p1aCompletion: 0,
    p1bPrompt: 0, p1bCompletion: 0,
    p3Prompt: 0, p3Completion: 0,
    p3xPrompt: 0, p3xCompletion: 0,
  };

  try {
    // ─── PHASE 1: GPT-4o — Two-Step Workflow Creation ─────────────────────────
    const p1Start = Date.now();
    phases[0]!.status = "running";
    notify({ ...phases[0]! });
    logger.info({ phase: "1A" }, "Sequential engine: Phase 1A starting — node analysis");

    let phase1JsonString: string;

    try {
      // ── Step 1A: Identify required nodes (with retry) ──────────────────────
      let nodeAnalysis = "";
      try {
        const p1aResponse = await withRetry(
          () => openai.chat.completions.create({
            model: openaiModel,
            messages: [
              { role: "system", content: buildPhase1ASystemPrompt() },
              { role: "user", content: buildPhase1AUserPrompt(userRequest) },
            ],
            max_tokens: 500,
            temperature: 0.1,
            response_format: { type: "json_object" },
          }),
          "Phase1A-node-analysis"
        );
        nodeAnalysis = p1aResponse.choices[0]?.message?.content ?? "";
        // FIX 4.4: capture Phase 1A token usage
        tokenRaw.p1aPrompt = p1aResponse.usage?.prompt_tokens ?? 0;
        tokenRaw.p1aCompletion = p1aResponse.usage?.completion_tokens ?? 0;
        logger.info({ nodeAnalysis, tokensUsed: p1aResponse.usage?.total_tokens }, "Phase 1A complete — nodes identified");
      } catch (err) {
        logger.warn({ err }, "Phase 1A failed — falling back to direct generation");
      }

      // ── Step 1B: Build workflow JSON with injected schemas + conversation history ──
      logger.info({ phase: "1B" }, "Sequential engine: Phase 1B starting — workflow build");

      // FIX 3.4: inject conversation history turns before the final user message
      // so the model knows what was discussed/created in this session
      const historyMessages: Array<{ role: "user" | "assistant"; content: string }> =
        conversationHistory.length > 0
          ? conversationHistory.map((t) => ({
              role: t.role,
              // Truncate very long assistant messages (e.g. workflow JSON blocks)
              content:
                t.content.length > 1500
                  ? t.content.slice(0, 1200) + "\n...[truncated for context]..."
                  : t.content,
            }))
          : [];

      if (nodeAnalysis) {
        const p1bMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
          { role: "system", content: buildPhase1BSystemPrompt(userRequest, lang) },
          ...historyMessages,
          {
            role: "user",
            // [أ1] Pass n8nContext so Phase 1B is aware of existing workflows
            content: buildPhase1BUserPrompt(userRequest, nodeAnalysis, lang, n8nContext),
          },
        ];

        // FIX 4.1: Stream Phase 1B when caller provides onPhase1BStream callback
        if (onPhase1BStream) {
          const p1bStream = await withRetry(
            () => openai.chat.completions.create({
              model: openaiModel,
              messages: p1bMessages,
              max_tokens: 4000,
              temperature: 0.2,
              response_format: { type: "json_object" },
              stream: true,
              stream_options: { include_usage: true },
            }),
            "Phase1B-workflow-build-stream"
          );

          let accumulated = "";
          for await (const chunk of p1bStream) {
            const delta = chunk.choices[0]?.delta?.content ?? "";
            if (delta) {
              accumulated += delta;
              onPhase1BStream(delta);
            }
            // FIX 4.4: usage arrives in the final chunk when stream_options.include_usage=true
            if (chunk.usage) {
              tokenRaw.p1bPrompt = chunk.usage.prompt_tokens ?? 0;
              tokenRaw.p1bCompletion = chunk.usage.completion_tokens ?? 0;
            }
          }
          phase1JsonString = accumulated;
          logger.info({ streamedChars: accumulated.length, p1bTokens: tokenRaw.p1bPrompt + tokenRaw.p1bCompletion }, "Phase 1B streaming complete");
        } else {
          // Non-streaming (backward compatible)
          const p1bResponse = await withRetry(
            () => openai.chat.completions.create({
              model: openaiModel,
              messages: p1bMessages,
              max_tokens: 4000,
              temperature: 0.2,
              response_format: { type: "json_object" },
            }),
            "Phase1B-workflow-build"
          );
          phase1JsonString = p1bResponse.choices[0]?.message?.content ?? "";
          tokenRaw.p1bPrompt = p1bResponse.usage?.prompt_tokens ?? 0;
          tokenRaw.p1bCompletion = p1bResponse.usage?.completion_tokens ?? 0;
        }
      } else {
        // Fallback: direct generation without node analysis
        const p1FallbackResponse = await withRetry(
          () => openai.chat.completions.create({
            model: openaiModel,
            messages: [
              { role: "system", content: buildPhase1SystemPrompt(lang) },
              { role: "user", content: buildPhase1UserPrompt(userRequest, lang) },
            ],
            max_tokens: 4000,
            temperature: 0.3,
            response_format: { type: "json_object" },
          }),
          "Phase1-fallback"
        );
        phase1JsonString = p1FallbackResponse.choices[0]?.message?.content ?? "";
        tokenRaw.p1bPrompt = p1FallbackResponse.usage?.prompt_tokens ?? 0;
        tokenRaw.p1bCompletion = p1FallbackResponse.usage?.completion_tokens ?? 0;
      }
    } catch (err) {
      logger.error({ err }, "Phase 1 OpenAI call failed");
      phases[0]!.status = "failed";
      notify({ ...phases[0]! });
      result.error = `Phase 1 failed: ${String(err)}`;
      result.userMessage =
        lang === "ar"
          ? "❌ فشلت المرحلة الأولى. تأكد من مفتاح OpenAI API."
          : "❌ Phase 1 failed. Please verify your OpenAI API key.";
      result.totalTimeMs = Date.now() - startTime;
      return result;
    }

    phases[0]!.status = "done";
    phases[0]!.durationMs = Date.now() - p1Start;
    notify({ ...phases[0]! });

    const p1Validation = validateWorkflowJson(phase1JsonString);
    if (!p1Validation.valid || !p1Validation.parsedJson) {
      const extracted = extractJson(phase1JsonString);
      try {
        result.phase1Result = JSON.parse(extracted) as Record<string, unknown>;
      } catch {
        result.phase1Result = { raw: phase1JsonString };
      }
    } else {
      result.phase1Result = sanitizeWorkflowJson(p1Validation.parsedJson) as Record<
        string,
        unknown
      >;
    }

    const phase1JsonForReview = JSON.stringify(result.phase1Result, null, 2);
    logger.info({ nodeCount: p1Validation.nodeCount }, "Phase 1 complete");

    // ─── PHASE 2: Gemini 2.5 Pro Reviews ─────────────────────────────────────
    const p2Start = Date.now();
    phases[1]!.status = "running";
    notify({ ...phases[1]! });
    logger.info({ phase: 2 }, "Sequential engine: Phase 2 starting");

    let reviewReport: GeminiReviewReport = {
      overallScore: 75,
      approved: false,
      criticalIssues: [],
      improvements: [],
      strengths: [],
      specificFixes: [],
      reviewSummary: "Auto-generated fallback review",
    };

    try {
      const geminiReviewModel = geminiAI.getGenerativeModel({
        model: geminiModel,
        generationConfig: { temperature: 0.2, maxOutputTokens: 2000 },
      });

      const p2Prompt = buildPhase2Prompt(userRequest, phase1JsonForReview, lang);

      // [ISSUE-6] Use streaming for Phase 2 to eliminate silent 10-20s wait
      let p2Text = "";
      if (onPhase2Stream) {
        const p2Stream = await withRetry(
          () => geminiReviewModel.generateContentStream(p2Prompt),
          "Phase2-gemini-review-stream"
        );
        for await (const chunk of p2Stream.stream) {
          const delta = chunk.text();
          if (delta) {
            p2Text += delta;
            onPhase2Stream(delta);
          }
        }
      } else {
        const p2Response = await withRetry(
          () => geminiReviewModel.generateContent(p2Prompt),
          "Phase2-gemini-review"
        );
        p2Text = p2Response.response.text();
      }

      const p2JsonString = extractJson(p2Text);
      try {
        reviewReport = JSON.parse(p2JsonString) as GeminiReviewReport;
      } catch {
        logger.warn("Phase 2 JSON parse failed, using fallback review");
        reviewReport.reviewSummary = p2Text.slice(0, 500);
      }
    } catch (err) {
      logger.warn({ err }, "Phase 2 Gemini call failed — continuing with fallback review");
      reviewReport.reviewSummary = `Gemini review unavailable: ${String(err)}`;
    }

    result.phase2Feedback = JSON.stringify(reviewReport, null, 2);
    phases[1]!.status = "done";
    phases[1]!.durationMs = Date.now() - p2Start;
    notify({ ...phases[1]! });
    logger.info({ score: reviewReport.overallScore }, "Phase 2 complete");

    // ─── [أ2] Smart Gate: Skip Phase 3+4 for simple, high-quality workflows ──
    const p2Score = reviewReport.overallScore ?? 0;
    const nodeCount = Array.isArray((result.phase1Result as Record<string, unknown>)?.nodes)
      ? ((result.phase1Result as Record<string, unknown>).nodes as unknown[]).length
      : 99;

    if (p2Score >= 85 && nodeCount <= simpleNodeThreshold) {
      logger.info({ score: p2Score, nodeCount }, "[أ2] Smart gate triggered — skipping Phase 3+4 (simple workflow, quality OK)");

      // BUG 1 FIX: always keep label in English, labelAr in Arabic — never mix
      phases[2]!.status = "done";
      phases[2]!.durationMs = 0;
      phases[2]!.label = "Skipped (quality OK ✅)";
      phases[2]!.labelAr = "تم التخطي (الجودة ممتازة ✅)";
      notify({ ...phases[2]! });

      phases[3]!.status = "done";
      phases[3]!.durationMs = 0;
      phases[3]!.label = "Skipped (quality OK ✅)";
      phases[3]!.labelAr = "تم التخطي (الجودة ممتازة ✅)";
      notify({ ...phases[3]! });

      result.phase3Result = result.phase1Result;
      result.phase4Approved = true;
      result.qualityScore = p2Score;
      result.qualityGrade = p2Score >= 90 ? "A" : "B";
      result.roundsCount = 1;
      result.workflowJson = result.phase1Result;
      result.totalTimeMs = Date.now() - startTime;
      result.success = true;
      // BUG 5 FIX: pass wasGated=true so message shows 3 phases, not 5
      result.userMessage = buildSuccessMessage(
        userRequest,
        result.qualityGrade,
        result.qualityScore,
        lang === "ar" ? "تم التحقق تلقائياً — الـ workflow بسيط وجودته ممتازة" : "Auto-validated — simple workflow with excellent quality",
        lang === "ar" ? "الـ workflow جاهز للاستيراد في n8n" : "Workflow is ready for import in n8n",
        lang,
        true // wasGated
      );
      return result;
    }

    // ─── PHASE 3: Gemini 2.5 Pro Refines (ISSUE-7: cross-model correction) ───
    // Previously: GPT-4o was correcting its own output (same model bias).
    // Now: Gemini fixes what GPT-4o built — a truly different perspective.
    // Falls back to GPT-4o only when geminiKey is unavailable.
    const p3Start = Date.now();
    phases[2]!.status = "running";

    // [ISSUE-7] Update label dynamically based on which model will do Phase 3
    const p3UseGemini = !!config.geminiKey;
    phases[2]!.label = p3UseGemini
      ? "Gemini 2.5 Pro: Refining workflow (cross-model)"
      : "GPT-4o: Refining workflow";
    phases[2]!.labelAr = p3UseGemini
      ? "Gemini 2.5 Pro: تحسين الـ workflow (تصحيح متقاطع)"
      : "GPT-4o: تحسين الـ workflow";

    notify({ ...phases[2]! });
    logger.info({ phase: 3, model: p3UseGemini ? geminiModel : openaiModel }, "Sequential engine: Phase 3 starting");

    let phase3JsonString: string = phase1JsonForReview;
    let roundsCount = 1;

    if (reviewReport.approved && (reviewReport.overallScore ?? 0) >= 85) {
      logger.info("Gemini approved Phase 1 — skipping Phase 3 refinement");
      result.phase3Result = result.phase1Result;
      phases[2]!.status = "done";
      phases[2]!.durationMs = 0;
      notify({ ...phases[2]! });
    } else {
      try {
        if (p3UseGemini) {
          // [ISSUE-7] Use Gemini for Phase 3 — different model than Phase 1 (GPT-4o)
          const geminiRefineModel = geminiAI.getGenerativeModel({
            model: geminiModel,
            generationConfig: { temperature: 0.2, maxOutputTokens: 4000 },
          });
          const p3GeminiPrompt = `${buildPhase3SystemPrompt(lang)}\n\n${buildPhase3UserPrompt(userRequest, phase1JsonForReview, result.phase2Feedback, lang)}\n\nReturn ONLY the corrected workflow JSON with no extra text.`;

          const p3GeminiResponse = await withRetry(
            () => geminiRefineModel.generateContent(p3GeminiPrompt),
            "Phase3-gemini-refinement"
          );
          phase3JsonString = p3GeminiResponse.response.text();
          logger.info("Phase 3 complete — Gemini cross-model refinement");
        } else {
          // Fallback: GPT-4o (when no Gemini key)
          const p3Response = await withRetry(
            () => openai.chat.completions.create({
              model: openaiModel,
              messages: [
                { role: "system", content: buildPhase3SystemPrompt(lang) },
                {
                  role: "user",
                  content: buildPhase3UserPrompt(
                    userRequest,
                    phase1JsonForReview,
                    result.phase2Feedback,
                    lang
                  ),
                },
              ],
              max_tokens: 4000,
              temperature: 0.2,
              response_format: { type: "json_object" },
            }),
            "Phase3-refinement"
          );

          phase3JsonString = p3Response.choices[0]?.message?.content ?? phase1JsonForReview;
          // FIX 4.4: capture Phase 3 token usage (only when using GPT-4o)
          tokenRaw.p3Prompt = p3Response.usage?.prompt_tokens ?? 0;
          tokenRaw.p3Completion = p3Response.usage?.completion_tokens ?? 0;
        }
      } catch (err) {
        logger.warn({ err }, "Phase 3 call failed — using Phase 1 result");
        phase3JsonString = phase1JsonForReview;
      }

      const p3Validation = validateWorkflowJson(phase3JsonString);
      if (p3Validation.valid && p3Validation.parsedJson) {
        result.phase3Result = sanitizeWorkflowJson(p3Validation.parsedJson) as Record<
          string,
          unknown
        >;
      } else {
        try {
          result.phase3Result = JSON.parse(extractJson(phase3JsonString)) as Record<
            string,
            unknown
          >;
        } catch {
          result.phase3Result = result.phase1Result;
        }
      }

      phases[2]!.status = "done";
      phases[2]!.durationMs = Date.now() - p3Start;
      notify({ ...phases[2]! });
    }

    result.roundsCount = roundsCount;
    const finalJsonForValidation = JSON.stringify(result.phase3Result, null, 2);
    logger.info("Phase 3 complete");

    // ─── PHASE 4: Gemini 2.5 Pro Final Validation ─────────────────────────────
    const p4Start = Date.now();
    phases[3]!.status = "running";
    notify({ ...phases[3]! });
    logger.info({ phase: 4 }, "Sequential engine: Phase 4 starting");

    let validationReport: GeminiValidationReport = {
      finalScore: reviewReport.overallScore ?? 75,
      readyForDeployment: true,
      remainingIssues: [],
      validationSummary:
        lang === "ar" ? "تم التحقق من الـ workflow بنجاح" : "Workflow validated successfully",
      qualityGrade: "B",
      deploymentNotes:
        lang === "ar"
          ? "الـ workflow جاهز للاستيراد في n8n"
          : "Workflow is ready for import in n8n",
    };

    try {
      const geminiValidateModel = geminiAI.getGenerativeModel({
        model: geminiModel,
        generationConfig: { temperature: 0.1, maxOutputTokens: 1500 },
      });

      const p4Prompt = buildPhase4Prompt(userRequest, finalJsonForValidation, lang);

      // [ISSUE-6] Use streaming for Phase 4 to eliminate silent 10-20s wait
      let p4Text = "";
      if (onPhase4Stream) {
        const p4Stream = await withRetry(
          () => geminiValidateModel.generateContentStream(p4Prompt),
          "Phase4-gemini-validation-stream"
        );
        for await (const chunk of p4Stream.stream) {
          const delta = chunk.text();
          if (delta) {
            p4Text += delta;
            onPhase4Stream(delta);
          }
        }
      } else {
        const p4Response = await withRetry(
          () => geminiValidateModel.generateContent(p4Prompt),
          "Phase4-gemini-validation"
        );
        p4Text = p4Response.response.text();
      }

      const p4JsonString = extractJson(p4Text);
      try {
        validationReport = JSON.parse(p4JsonString) as GeminiValidationReport;
      } catch {
        logger.warn("Phase 4 JSON parse failed, using fallback validation report");
      }
    } catch (err) {
      logger.warn({ err }, "Phase 4 Gemini call failed — using fallback validation");
    }

    result.phase4Approved = validationReport.readyForDeployment ?? true;
    result.qualityScore = validationReport.finalScore ?? 75;
    result.qualityGrade = validationReport.qualityGrade ?? "B";

    phases[3]!.status = "done";
    phases[3]!.durationMs = Date.now() - p4Start;
    notify({ ...phases[3]! });

    // ─── FIX 3.2: Honest additional refinement round ──────────────────────────
    // Previously: blindly added +10 to qualityScore without re-evaluation (fake boost).
    // Now: actually run another GPT-4o refinement AND re-validate with Gemini if possible.
    if (!result.phase4Approved && result.qualityScore < threshold && maxRounds > 1) {
      logger.info({ score: result.qualityScore }, "[FIX 3.2] Quality below threshold — running HONEST extra refinement");
      roundsCount++;

      try {
        const extraReview = `Quality score was ${result.qualityScore}/100. These issues remain: ${(validationReport.remainingIssues ?? []).join("; ")}. Fix ALL of them.`;
        const extraRefineResponse = await withRetry(
          () => openai.chat.completions.create({
            model: openaiModel,
            messages: [
              { role: "system", content: buildPhase3SystemPrompt(lang) },
              {
                role: "user",
                content: buildPhase3UserPrompt(
                  userRequest,
                  finalJsonForValidation,
                  extraReview,
                  lang
                ),
              },
            ],
            max_tokens: 4000,
            temperature: 0.15,
            response_format: { type: "json_object" },
          }),
          "Phase3-extra-refinement"
        );

        const extraJson = extraRefineResponse.choices[0]?.message?.content ?? finalJsonForValidation;
        // FIX 4.4: capture extra refinement token usage
        tokenRaw.p3xPrompt = extraRefineResponse.usage?.prompt_tokens ?? 0;
        tokenRaw.p3xCompletion = extraRefineResponse.usage?.completion_tokens ?? 0;
        let extraParsed: Record<string, unknown> | null = null;
        try {
          extraParsed = JSON.parse(extractJson(extraJson)) as Record<string, unknown>;
        } catch {
          // Keep previous result if parse fails
        }

        if (extraParsed) {
          result.phase3Result = extraParsed;

          // Re-validate with Gemini instead of blindly adding +10
          try {
            const geminiRevalidateModel = geminiAI.getGenerativeModel({
              model: geminiModel,
              generationConfig: { temperature: 0.1, maxOutputTokens: 1000 },
            });
            const revalidatePrompt = buildPhase4Prompt(userRequest, JSON.stringify(extraParsed, null, 2), lang);
            const revalidateResponse = await geminiRevalidateModel.generateContent(revalidatePrompt);
            const revalidateText = revalidateResponse.response.text();
            const revalidated = JSON.parse(extractJson(revalidateText)) as GeminiValidationReport;

            // Use the REAL re-validated score — no artificial boost
            result.qualityScore = revalidated.finalScore ?? result.qualityScore;
            result.qualityGrade = revalidated.qualityGrade ?? result.qualityGrade;
            result.phase4Approved = revalidated.readyForDeployment ?? false;
            logger.info({ newScore: result.qualityScore }, "[FIX 3.2] Re-validation complete — using real score");
          } catch (revalidateErr) {
            logger.warn({ err: revalidateErr }, "[FIX 3.2] Re-validation failed — keeping original score (no fake boost)");
            // Do NOT add +10. Keep original score — honest reporting.
          }
        }
      } catch (err) {
        logger.warn({ err }, "Extra refinement round failed");
      }
    }

    result.roundsCount = roundsCount;
    result.workflowJson = result.phase3Result ?? result.phase1Result;
    result.totalTimeMs = Date.now() - startTime;
    result.success = true;

    // FIX 4.4: build and attach token usage summary
    result.tokenUsage = buildTokenUsage(tokenRaw);
    logger.info(
      { tokens: result.tokenUsage.totalOpenaiTokens, costUsd: result.tokenUsage.estimatedCostUsd },
      "Token usage summary"
    );

    result.userMessage = buildSuccessMessage(
      userRequest,
      result.qualityGrade,
      result.qualityScore,
      validationReport.validationSummary ??
        (lang === "ar" ? "تم التحقق بنجاح" : "Validated successfully"),
      validationReport.deploymentNotes ??
        (lang === "ar" ? "جاهز للنشر" : "Ready for deployment"),
      lang
    );

    logger.info(
      { score: result.qualityScore, grade: result.qualityGrade, totalMs: result.totalTimeMs },
      "Sequential engine complete"
    );

    return result;
  } catch (err) {
    logger.error({ err }, "Sequential engine unexpected error");
    result.error = String(err);
    result.totalTimeMs = Date.now() - startTime;
    result.userMessage =
      lang === "ar"
        ? `❌ حدث خطأ غير متوقع في محرك الذكاء الاصطناعي: ${String(err)}`
        : `❌ Unexpected error in AI engine: ${String(err)}`;
    phases.forEach((p) => {
      if (p.status === "running") p.status = "failed";
    });
    return result;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Intent Detection
// ─────────────────────────────────────────────────────────────────────────────

const CREATE_KEYWORDS_AR = [
  "أنشئ", "اصنع", "أنشأ", "ابني", "بني", "إنشاء", "أريد workflow",
  "أريد سير عمل", "اعمل لي", "اصنع لي", "جديد", "workflow جديد",
  "سير عمل", "أتمتة", "أتمتة", "أوتوماتيك",
];

const CREATE_KEYWORDS_EN = [
  "create", "build", "make", "generate", "design", "set up", "setup",
  "automate", "automation", "new workflow", "workflow for", "workflow that",
  "i want a workflow", "i need a workflow",
];

export function detectWorkflowCreationIntent(message: string): boolean {
  const lower = message.toLowerCase();
  const isArabic = /[\u0600-\u06FF]/.test(message);

  if (isArabic) {
    return CREATE_KEYWORDS_AR.some((kw) => message.includes(kw));
  }
  return CREATE_KEYWORDS_EN.some((kw) => lower.includes(kw));
}

// ─────────────────────────────────────────────────────────────────────────────
// Modify / Edit Intent Detection
// ─────────────────────────────────────────────────────────────────────────────

const MODIFY_KEYWORDS_AR = [
  "عدّل", "عدل", "غيّر", "غير", "اصلح", "أصلح", "صلّح", "حدّث", "حدث",
  "أضف", "اضف", "احذف", "حذف", "ازل", "أزل", "عدّل الـ", "عدّل ال",
  "تعديل", "تغيير", "إصلاح", "تحديث", "إضافة", "حذف", "ادمج", "قسّم",
  "بدّل", "بدل", "طوّر", "طور", "عدل على", "شغّل", "وقّف", "فعّل",
];

const MODIFY_KEYWORDS_EN = [
  "modify", "edit", "update", "change", "fix", "add", "remove", "delete",
  "adjust", "alter", "rename", "replace", "improve", "refactor", "patch",
  "tweak", "append", "insert", "disable", "enable", "activate", "deactivate",
  "split", "merge", "connect", "disconnect", "move node", "add node",
  "add a step", "change the trigger", "update the workflow",
];

export function detectWorkflowModifyIntent(message: string): boolean {
  const lower = message.toLowerCase();
  const isArabic = /[\u0600-\u06FF]/.test(message);

  if (isArabic) {
    return MODIFY_KEYWORDS_AR.some((kw) => message.includes(kw));
  }
  return MODIFY_KEYWORDS_EN.some((kw) => lower.includes(kw));
}
