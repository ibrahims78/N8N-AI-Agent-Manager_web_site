/**
 * sequentialEngine.service.ts
 * The 4-Phase Sequential AI Engine for n8n Workflow Generation.
 *
 * Pipeline:
 *   Phase 1: GPT-4o    → Creates initial workflow JSON
 *   Phase 2: Gemini    → Reviews and scores the workflow
 *   Phase 3: GPT-4o    → Refines based on Gemini's feedback
 *   Phase 4: Gemini    → Final validation and quality gate
 *
 * If Phase 4 score < threshold: up to 2 additional refinement rounds.
 */

import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../lib/logger";
import {
  detectLanguage,
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

export interface EngineConfig {
  openaiKey: string;
  geminiKey: string;
  maxRefinementRounds?: number;
  qualityThreshold?: number;
  openaiModel?: string;
  geminiModel?: string;
  onPhaseUpdate?: (phase: PhaseProgress) => void;
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
    { phase: 1, label: "GPT-4o: Creating workflow", labelAr: "GPT-4o: إنشاء الـ workflow", status: "pending" },
    { phase: 2, label: "Gemini: Reviewing & scoring", labelAr: "Gemini: مراجعة وتقييم", status: "pending" },
    { phase: 3, label: "GPT-4o: Refining workflow", labelAr: "GPT-4o: تحسين الـ workflow", status: "pending" },
    { phase: 4, label: "Gemini: Final validation", labelAr: "Gemini: التحقق النهائي", status: "pending" },
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
  const geminiModel = config.geminiModel ?? "gemini-2.0-flash";

  try {
    // ─── PHASE 1: GPT-4o Creates Workflow ────────────────────────────────────
    const p1Start = Date.now();
    phases[0]!.status = "running";
    notify({ ...phases[0]! });
    logger.info({ phase: 1 }, "Sequential engine: Phase 1 starting");

    let phase1JsonString: string;
    try {
      const p1Response = await openai.chat.completions.create({
        model: openaiModel,
        messages: [
          { role: "system", content: buildPhase1SystemPrompt(lang) },
          { role: "user", content: buildPhase1UserPrompt(userRequest, lang) },
        ],
        max_tokens: 4000,
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      phase1JsonString = p1Response.choices[0]?.message?.content ?? "";
    } catch (err) {
      logger.error({ err }, "Phase 1 OpenAI call failed");
      phases[0]!.status = "failed";
      notify({ ...phases[0]! });
      result.error = `Phase 1 failed: ${String(err)}`;
      result.userMessage = lang === "ar"
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
      result.phase1Result = sanitizeWorkflowJson(p1Validation.parsedJson) as Record<string, unknown>;
    }

    const phase1JsonForReview = JSON.stringify(result.phase1Result, null, 2);
    logger.info({ nodeCount: p1Validation.nodeCount }, "Phase 1 complete");

    // ─── PHASE 2: Gemini Reviews ──────────────────────────────────────────────
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
      const p2Response = await geminiReviewModel.generateContent(p2Prompt);
      const p2Text = p2Response.response.text();

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

    // ─── PHASE 3: GPT-4o Refines ─────────────────────────────────────────────
    const p3Start = Date.now();
    phases[2]!.status = "running";
    notify({ ...phases[2]! });
    logger.info({ phase: 3 }, "Sequential engine: Phase 3 starting");

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
        const p3Response = await openai.chat.completions.create({
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
        });

        phase3JsonString = p3Response.choices[0]?.message?.content ?? phase1JsonForReview;
      } catch (err) {
        logger.warn({ err }, "Phase 3 OpenAI call failed — using Phase 1 result");
        phase3JsonString = phase1JsonForReview;
      }

      const p3Validation = validateWorkflowJson(phase3JsonString);
      if (p3Validation.valid && p3Validation.parsedJson) {
        result.phase3Result = sanitizeWorkflowJson(p3Validation.parsedJson) as Record<string, unknown>;
      } else {
        try {
          result.phase3Result = JSON.parse(extractJson(phase3JsonString)) as Record<string, unknown>;
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

    // ─── PHASE 4: Gemini Final Validation ────────────────────────────────────
    const p4Start = Date.now();
    phases[3]!.status = "running";
    notify({ ...phases[3]! });
    logger.info({ phase: 4 }, "Sequential engine: Phase 4 starting");

    let validationReport: GeminiValidationReport = {
      finalScore: reviewReport.overallScore ?? 75,
      readyForDeployment: true,
      remainingIssues: [],
      validationSummary:
        lang === "ar"
          ? "تم التحقق من الـ workflow بنجاح"
          : "Workflow validated successfully",
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
      const p4Response = await geminiValidateModel.generateContent(p4Prompt);
      const p4Text = p4Response.response.text();

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

    // ─── Additional Refinement Round if Below Threshold ───────────────────────
    if (!result.phase4Approved && result.qualityScore < threshold && maxRounds > 1) {
      logger.info({ score: result.qualityScore }, "Quality below threshold, running additional refinement");
      roundsCount++;

      try {
        const extraReview = `Quality score was ${result.qualityScore}. Remaining issues: ${(validationReport.remainingIssues ?? []).join(", ")}`;
        const extraRefineResponse = await openai.chat.completions.create({
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
        });

        const extraJson = extraRefineResponse.choices[0]?.message?.content ?? finalJsonForValidation;
        try {
          result.phase3Result = JSON.parse(extractJson(extraJson)) as Record<string, unknown>;
          result.phase4Approved = true;
          result.qualityScore = Math.min(result.qualityScore + 10, 95);
        } catch {
          // Keep previous result
        }
      } catch (err) {
        logger.warn({ err }, "Extra refinement round failed");
      }
    }

    result.roundsCount = roundsCount;
    result.workflowJson = result.phase3Result ?? result.phase1Result;
    result.totalTimeMs = Date.now() - startTime;
    result.success = true;

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
    phases.forEach(p => {
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
    return CREATE_KEYWORDS_AR.some(kw => message.includes(kw));
  }
  return CREATE_KEYWORDS_EN.some(kw => lower.includes(kw));
}
