/**
 * Phase 6: Multi-Turn Workflow Builder — Clarification Detector
 *
 * Detects when a workflow creation request is too vague,
 * generates smart clarifying questions, and merges answers
 * into an enriched request for the build pipeline.
 *
 * Flow:
 *  User: "أنشئ workflow للمبيعات"
 *    → needsClarification() → true
 *    → generateClarificationQuestions() → [3 targeted questions]
 *    → Save as assistant message (with hidden marker)
 *
 *  User: "من Shopify، إشعار Slack عند كل بيع وتحديث Google Sheets"
 *    → detectClarificationResponse() → { originalRequest, questionsAsked }
 *    → buildEnrichedRequest() → merged rich prompt
 *    → Proceed to PATH A/A2 normally
 */

import { logger } from "../lib/logger";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClarificationCheckResult {
  needed: boolean;
  missingInfo: string[];
  confidence: "high" | "medium" | "low";
  reasoning: string;
}

export interface ClarificationQuestions {
  intro: string;
  questions: string[];
  marker: string;
}

export interface ClarificationContext {
  originalRequest: string;
  questionsAsked: string[];
}

// ─── Internal markers ─────────────────────────────────────────────────────────
// These HTML-comment-style markers are invisible to the user but allow us
// to reliably identify clarification messages and recover the original request.

const CLARIFICATION_MARKER_PREFIX = "<!-- CLARIFICATION_REQUEST:";
const CLARIFICATION_MARKER_SUFFIX = " -->";

// ─── 1. needsClarification ────────────────────────────────────────────────────

/**
 * Checks if a CREATE request has enough detail to build a useful workflow.
 * Uses GPT-4o-mini (fast + cheap) for the check.
 * Fails open: if LLM fails, returns { needed: false } to not block the user.
 */
export async function needsClarification(
  message: string,
  lang: string,
  openaiKey: string
): Promise<ClarificationCheckResult> {
  // Fast path: if message is very detailed (≥40 words), skip LLM check
  const wordCount = message.trim().split(/\s+/).length;
  if (wordCount >= 40) {
    logger.debug({ wordCount }, "Phase 6: message long enough — skipping clarification check");
    return {
      needed: false,
      missingInfo: [],
      confidence: "high",
      reasoning: `Message is detailed (${wordCount} words ≥ 40 threshold)`,
    };
  }

  try {
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey: openaiKey, timeout: 12_000 });

    const systemPrompt = `You are an expert evaluator for n8n workflow automation requests.

Your task: Determine if a workflow creation request has ENOUGH information to build a specific, functional workflow.

A request is SUFFICIENT if it clearly specifies at least:
- TRIGGER: When/how the workflow starts (e.g., Gmail incoming, Shopify new order, schedule, webhook, HTTP request)
- ACTION: What the workflow does (e.g., send email, post to Slack, update Google Sheets, create a record)

A request NEEDS CLARIFICATION if it's missing 2 or more core dimensions:
- "أنشئ workflow للمبيعات" → missing trigger, action, destination → NEEDS clarification
- "Create an automation for my business" → no trigger, no action → NEEDS clarification
- "workflow يرسل رسائل" → sends messages to whom? when? from where? → NEEDS clarification
- "اعمل لي workflow تسويقي" → completely vague → NEEDS clarification

A request is SUFFICIENT even if short:
- "أنشئ workflow يراقب Gmail ويحفظ المرفقات في Drive" → trigger: Gmail, action: save → SUFFICIENT
- "workflow يرسل Slack عند طلب Shopify" → trigger: Shopify, action: Slack → SUFFICIENT
- "schedule daily report from Google Sheets to email" → trigger: schedule, action: email, source: Sheets → SUFFICIENT
- "أرسل إشعار واتساب عند إضافة صف جديد في Sheets" → trigger: Sheets, action: WhatsApp → SUFFICIENT

Respond ONLY with valid JSON:
{
  "needsClarification": boolean,
  "missingInfo": string[],
  "confidence": "high" | "medium" | "low",
  "reasoning": string
}

missingInfo values (use only if needsClarification=true):
"trigger" | "data_source" | "action" | "destination" | "frequency" | "conditions" | "scope"`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 180,
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as {
      needsClarification?: boolean;
      missingInfo?: string[];
      confidence?: string;
      reasoning?: string;
    };

    const result: ClarificationCheckResult = {
      needed: parsed.needsClarification ?? false,
      missingInfo: Array.isArray(parsed.missingInfo) ? parsed.missingInfo : [],
      confidence: (["high", "medium", "low"].includes(parsed.confidence ?? ""))
        ? (parsed.confidence as "high" | "medium" | "low")
        : "medium",
      reasoning: parsed.reasoning ?? "",
    };

    logger.debug(
      { needed: result.needed, missingInfo: result.missingInfo, confidence: result.confidence },
      "Phase 6: needsClarification result"
    );
    return result;

  } catch (err) {
    // Fail open — don't block the user if the check fails
    logger.warn({ err }, "Phase 6: needsClarification LLM check failed — failing open");
    return {
      needed: false,
      missingInfo: [],
      confidence: "low",
      reasoning: "LLM check failed — skipping clarification",
    };
  }
}

// ─── 2. generateClarificationQuestions ───────────────────────────────────────

/**
 * Generates 2-4 targeted, practical clarifying questions based on what's missing.
 * Questions are specific to the user's domain and offer common choices where possible.
 */
export async function generateClarificationQuestions(
  originalMessage: string,
  missingInfo: string[],
  lang: string,
  openaiKey: string
): Promise<ClarificationQuestions> {
  const isAr = lang === "ar";

  try {
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey: openaiKey, timeout: 15_000 });

    const systemPrompt = isAr
      ? `أنت مساعد احترافي لبناء workflows في n8n. المستخدم طلب إنشاء workflow لكن الوصف غير كافٍ للبناء.

مهمتك: اسأل 2-4 أسئلة توضيحية محددة وعملية لفهم احتياج المستخدم بالضبط.

قواعد الأسئلة:
- كل سؤال يعالج نقطة ضعف واحدة محددة فقط
- قدّم خيارات شائعة حين تعرف الاحتمالات (مثلاً: Shopify / WooCommerce / Salla؟)
- ابدأ بسؤال المُشغِّل (trigger) إذا لم يُذكر (متى/كيف يعمل الـ workflow؟)
- ثم سؤال الإجراء (action) إذا لم يُذكر (ماذا يفعل الـ workflow؟)
- ثم سؤال الوجهة/المخرجات إذا لم تُذكر
- لا تسأل عمّا هو واضح بالفعل في طلب المستخدم
- الأسئلة قصيرة ومباشرة — قابلة للإجابة بجملة واحدة

المعلومات الناقصة: ${missingInfo.join(", ")}

أجب بـ JSON فقط:
{
  "intro": "جملة ترحيبية قصيرة ومحفّزة (جملة واحدة)",
  "questions": ["السؤال 1", "السؤال 2", ...]
}`
      : `You are a professional n8n workflow builder assistant. The user wants to create a workflow but the description lacks enough detail to build it.

Your task: Ask 2-4 specific, practical clarifying questions to understand exactly what the user needs.

Rules:
- Each question addresses exactly one specific gap
- Offer common options when you know the typical choices (e.g., Shopify / WooCommerce / manual?)
- Start with the Trigger question if not mentioned (when/how does the workflow run?)
- Then the Action question if not mentioned (what should the workflow do?)
- Then the Destination/Output question if not mentioned
- Do NOT ask about information already clear in the user's request
- Questions should be short and direct — answerable in one sentence

Missing info: ${missingInfo.join(", ")}

Reply with JSON only:
{
  "intro": "short encouraging opening line (one sentence)",
  "questions": ["Question 1", "Question 2", ...]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: isAr ? `طلب المستخدم: "${originalMessage}"` : `User request: "${originalMessage}"` },
      ],
      max_tokens: 500,
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as { intro?: string; questions?: string[] };

    const questions = (Array.isArray(parsed.questions) ? parsed.questions : []).slice(0, 4);
    const intro = parsed.intro?.trim() ||
      (isAr ? "ممتاز! أحتاج بعض التوضيحات قبل البناء:" : "Great! I need a few clarifications before building:");

    if (questions.length === 0) throw new Error("No questions generated");

    logger.debug({ questionsCount: questions.length }, "Phase 6: clarification questions generated");

    return {
      intro,
      questions,
      marker: buildMarker(originalMessage),
    };

  } catch (err) {
    logger.warn({ err }, "Phase 6: generateClarificationQuestions failed — using fallback questions");
    const isAr = lang === "ar";

    return {
      intro: isAr
        ? "ممتاز! أحتاج بعض التوضيحات قبل البناء:"
        : "Great! I need a few clarifications before building:",
      questions: isAr
        ? [
            "ما الحدث الذي يُشغّل الـ workflow؟ (مثلاً: رسالة Gmail / طلب Shopify / جدول زمني / webhook)",
            "ما الإجراء الذي تريده عند التشغيل؟ (مثلاً: إشعار / تقرير / تحديث قاعدة بيانات / إرسال بريد)",
            "ما وجهة المخرجات؟ (مثلاً: Slack / Email / Google Sheets / WhatsApp / قاعدة بيانات)",
          ]
        : [
            "What event should trigger the workflow? (e.g., Gmail message / Shopify order / schedule / webhook)",
            "What action should happen when it triggers? (e.g., notification / report / database update / send email)",
            "What is the output destination? (e.g., Slack / Email / Google Sheets / WhatsApp / database)",
          ],
      marker: buildMarker(originalMessage),
    };
  }
}

// ─── 3. detectClarificationResponse ──────────────────────────────────────────

/**
 * Scans previous messages to detect if the user is responding to clarification questions.
 * Looks for our hidden CLARIFICATION_REQUEST marker in the last assistant message.
 *
 * Context: `previousMessages` is passed in chronological order (oldest first).
 * The current user message is the LAST item in the array (already saved to DB).
 * We scan in reverse: skip the leading (most-recent) user messages, then inspect
 * the first assistant message we find for the clarification marker.
 *
 * Returns ClarificationContext (original request + questions asked) or null.
 */
export function detectClarificationResponse(
  previousMessages: Array<{ role: string; content: string }>
): ClarificationContext | null {
  // Scan from most recent to oldest
  const reversed = [...previousMessages].reverse();

  // We expect: [current-user-msg, clarification-assistant-msg, ...]
  // Skip over any leading user messages (the current user turn may appear here
  // since it was inserted before this function is called).
  let foundAssistant = false;

  for (const msg of reversed) {
    if (msg.role === "user") {
      if (foundAssistant) {
        // We already found and processed the last assistant message —
        // hitting a user message now means we've gone too far back.
        break;
      }
      // Skip the current user message (the clarification answer) and continue
      continue;
    }

    if (msg.role !== "assistant") continue;

    // First assistant message found in reverse scan
    foundAssistant = true;

    // Check if this assistant message contains our clarification marker
    if (!msg.content.includes(CLARIFICATION_MARKER_PREFIX)) {
      // This is a normal assistant message (not a clarification) — no context
      break;
    }

    // Extract the original request from the embedded marker
    const markerRegex = new RegExp(
      CLARIFICATION_MARKER_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
        "([A-Za-z0-9+/=]+)" +
        CLARIFICATION_MARKER_SUFFIX.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );
    const markerMatch = msg.content.match(markerRegex);

    if (!markerMatch || !markerMatch[1]) {
      logger.warn("Phase 6: clarification marker found but base64 extraction failed");
      break;
    }

    let originalRequest: string;
    try {
      originalRequest = Buffer.from(markerMatch[1]!, "base64").toString("utf8");
    } catch {
      logger.warn("Phase 6: failed to decode originalRequest from marker");
      break;
    }

    // Extract numbered questions from the message
    const questionLineRegex = /^\d+\.\s+(.+)/gm;
    const questionsAsked: string[] = [];
    let qMatch: RegExpExecArray | null;
    while ((qMatch = questionLineRegex.exec(msg.content)) !== null) {
      const q = qMatch[1]?.trim();
      if (q) questionsAsked.push(q);
    }

    logger.debug(
      { originalRequest: originalRequest.slice(0, 60), questionsCount: questionsAsked.length },
      "Phase 6: clarification response detected"
    );

    return { originalRequest, questionsAsked };
  }

  return null;
}

// ─── 4. buildEnrichedRequest ──────────────────────────────────────────────────

/**
 * Merges the original vague request + the user's clarification answers
 * into a rich, detailed prompt ready for the build pipeline.
 */
export function buildEnrichedRequest(
  originalRequest: string,
  userAnswers: string,
  questionsAsked: string[],
  lang: string
): string {
  const isAr = lang === "ar";

  const questionsSection =
    questionsAsked.length > 0
      ? isAr
        ? `\n\nالأسئلة التي طُرحت على المستخدم:\n${questionsAsked
            .map((q, i) => `${i + 1}. ${q}`)
            .join("\n")}`
        : `\n\nClarification questions that were asked:\n${questionsAsked
            .map((q, i) => `${i + 1}. ${q}`)
            .join("\n")}`
      : "";

  if (isAr) {
    return `${originalRequest}

--- تفاصيل إضافية من المستخدم (إجابات توضيحية) ---
${userAnswers}${questionsSection}

[تعليمات للوكيل: هذا طلب مكتمل — الجزء الأول هو الطلب الأصلي والجزء الثاني هو إجابات توضيحية من المستخدم. استخدم كل هذه المعلومات معاً لبناء workflow دقيق ومفصّل. لا تسأل عن معلومات إضافية.]`;
  }

  return `${originalRequest}

--- Additional details from user (clarification answers) ---
${userAnswers}${questionsSection}

[Agent instructions: This is a complete request — the first part is the original request and the second part contains clarification answers from the user. Use ALL this information together to build a precise, detailed workflow. Do NOT ask for additional information.]`;
}

// ─── 5. formatClarificationMessage ───────────────────────────────────────────

/**
 * Formats the clarification questions as a clean markdown message
 * with the hidden marker embedded at the end.
 */
export function formatClarificationMessage(
  cq: ClarificationQuestions,
  lang: string
): string {
  const isAr = lang === "ar";
  const numbered = cq.questions
    .map((q, i) => `${i + 1}. ${q}`)
    .join("\n\n");

  const footer = isAr
    ? "\n\n_يمكنك الإجابة على كل الأسئلة في رسالة واحدة وسأبني الـ workflow مباشرة._"
    : "\n\n_You can answer all questions in one message and I'll build the workflow right away._";

  return `${cq.intro}\n\n${numbered}${footer}\n\n${cq.marker}`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildMarker(originalRequest: string): string {
  const encoded = Buffer.from(originalRequest).toString("base64");
  return `${CLARIFICATION_MARKER_PREFIX}${encoded}${CLARIFICATION_MARKER_SUFFIX}`;
}
