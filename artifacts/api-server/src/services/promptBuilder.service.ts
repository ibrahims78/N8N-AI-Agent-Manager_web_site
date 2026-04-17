/**
 * promptBuilder.service.ts
 * Builds structured prompts for each phase of the Sequential AI Engine.
 * Supports Arabic and English based on the user's input language.
 */

import { buildSchemaReferenceBlock, getRelevantSchemas } from "./nodeSchemas";

export type Language = "ar" | "en";

export function detectLanguage(text: string): Language {
  return /[\u0600-\u06FF]/.test(text) ? "ar" : "en";
}

// ─────────────────────────────────────────────────────────────────────────────
// Few-Shot Example: A complete, correct n8n workflow for reference
// ─────────────────────────────────────────────────────────────────────────────

const FEW_SHOT_EXAMPLE = `
REFERENCE EXAMPLE — A fully correct n8n workflow (Gmail → Slack notification):
{
  "nodes": [
    {
      "id": "a1b2c3d4-0001-0001-0001-000000000001",
      "name": "Gmail Trigger",
      "type": "n8n-nodes-base.gmailTrigger",
      "typeVersion": 1,
      "position": [240, 300],
      "credentials": { "gmailOAuth2": "gmailOAuth2" },
      "parameters": {
        "filters": {},
        "pollTimes": { "item": [{ "mode": "everyMinute" }] }
      }
    },
    {
      "id": "a1b2c3d4-0002-0002-0002-000000000002",
      "name": "Send Slack Notification",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2,
      "position": [480, 300],
      "credentials": { "slackApi": "slackApi" },
      "parameters": {
        "operation": "post",
        "resource": "message",
        "channel": "#notifications",
        "text": "=New email from: {{ $json.from }}\nSubject: {{ $json.subject }}"
      }
    }
  ],
  "connections": {
    "Gmail Trigger": {
      "main": [[{ "node": "Send Slack Notification", "type": "main", "index": 0 }]]
    }
  },
  "settings": { "executionOrder": "v1" }
}

Key rules demonstrated in this example:
- Each node has a unique UUID id, correct type, correct typeVersion, and position
- Credentials use the EXACT credential type name (gmailOAuth2, slackApi)
- Connections reference nodes by their exact "name" field
- Connection format: { "NodeName": { "main": [[{ "node": "TargetName", "type": "main", "index": 0 }]] } }
- settings.executionOrder is always "v1"
`;

// ─────────────────────────────────────────────────────────────────────────────
// Phase 1A: GPT-4o — Identify Required Nodes (Step 1 of 2)
// ─────────────────────────────────────────────────────────────────────────────

export function buildPhase1ASystemPrompt(): string {
  return `You are an n8n workflow architect. Your ONLY task is to identify which n8n nodes are needed to fulfill a user's automation request.

Output a JSON object with this exact structure:
{
  "triggerNode": "<the exact n8n node type for the trigger, e.g. n8n-nodes-base.scheduleTrigger>",
  "processingNodes": ["<node type 1>", "<node type 2>"],
  "outputNodes": ["<node type 1>"],
  "reasoning": "<one sentence explaining the workflow structure>"
}

Use ONLY real n8n node types. Examples of valid types:
- n8n-nodes-base.scheduleTrigger
- n8n-nodes-base.gmailTrigger
- n8n-nodes-base.webhook
- n8n-nodes-base.manualTrigger
- n8n-nodes-base.gmail
- n8n-nodes-base.slack
- n8n-nodes-base.telegram
- n8n-nodes-base.googleSheets
- n8n-nodes-base.httpRequest
- n8n-nodes-base.set
- n8n-nodes-base.if
- n8n-nodes-base.code
- n8n-nodes-base.postgres
- @n8n/n8n-nodes-langchain.openAi
- @n8n/n8n-nodes-langchain.agent`;
}

export function buildPhase1AUserPrompt(userRequest: string): string {
  return `User automation request: "${userRequest}"

List ONLY the n8n node types needed. Return JSON only.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 1B: GPT-4o — Build Workflow JSON with injected schemas (Step 2 of 2)
// ─────────────────────────────────────────────────────────────────────────────

export function buildPhase1BSystemPrompt(userRequest: string, lang: Language): string {
  const relevantSchemas = getRelevantSchemas(userRequest);
  const schemaBlock = buildSchemaReferenceBlock(relevantSchemas);

  const rules =
    lang === "ar"
      ? `قواعد صارمة يجب اتباعها:
1. استخدم فقط أسماء الـ node types الواردة في المواصفات أعلاه — لا تخترع أسماء
2. استخدم typeVersion الصحيح كما هو مذكور بالضبط
3. استخدم اسم الـ credential بالضبط كما هو في المواصفات
4. كل node يجب أن يحتوي على: id (UUID فريد)، name، type، typeVersion، position، parameters
5. الـ connections تستخدم اسم الـ node بالضبط كما في حقل "name"
6. تنسيق الـ connection: { "اسم الـ node": { "main": [[{ "node": "الهدف", "type": "main", "index": 0 }]] } }
7. settings.executionOrder يجب أن يكون "v1" دائماً
8. ابدأ دائماً بـ trigger node
9. أرجع JSON فقط بدون أي نص إضافي`
      : `Strict rules to follow:
1. Use ONLY the node types listed in the specifications above — do not invent type names
2. Use the exact typeVersion as specified
3. Use the exact credential name as shown in the specifications
4. Every node must have: id (unique UUID), name, type, typeVersion, position, parameters
5. Connections reference nodes by their exact "name" field
6. Connection format: { "Node Name": { "main": [[{ "node": "Target Name", "type": "main", "index": 0 }]] } }
7. settings.executionOrder must always be "v1"
8. Always start with a trigger node
9. Return JSON only — no additional text or markdown`;

  return `You are an advanced n8n workflow builder. You have been given the EXACT specifications for every node you need.

${schemaBlock}

${FEW_SHOT_EXAMPLE}

${rules}`;
}

export function buildPhase1BUserPrompt(
  userRequest: string,
  nodeAnalysis: string,
  lang: Language,
  n8nContext?: string
): string {
  const contextBlock = n8nContext
    ? lang === "ar"
      ? `\n\nالـ Workflows الموجودة حالياً في n8n (تجنب التكرار):\n${n8nContext}`
      : `\n\nExisting workflows in n8n (avoid duplication):\n${n8nContext}`
    : "";

  if (lang === "ar") {
    return `أنشئ n8n workflow كامل وصالح للطلب التالي:

"${userRequest}"

تحليل الـ nodes المطلوبة:
${nodeAnalysis}${contextBlock}

استخدم مواصفات الـ nodes الواردة في الـ system prompt بالضبط. أرجع JSON فقط.`;
  }

  return `Create a complete, valid n8n workflow for the following request:

"${userRequest}"

Required nodes analysis:
${nodeAnalysis}${contextBlock}

Use the exact node specifications provided in the system prompt. Return JSON only.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy Phase 1 (kept as fallback)
// ─────────────────────────────────────────────────────────────────────────────

export function buildPhase1SystemPrompt(lang: Language): string {
  if (lang === "ar") {
    return `أنت خبير متقدم في بناء n8n workflows. مهمتك إنشاء workflow JSON صالح وكامل بناءً على طلب المستخدم.

قواعد صارمة:
1. أرجع JSON صالحاً تماماً يتبع مواصفات n8n
2. كل node يجب أن يحتوي على: id (uuid فريد)، name، type، typeVersion، position، parameters
3. يجب أن يكون هناك "connections" صحيحة بين الـ nodes
4. ابدأ دائماً بـ trigger node (Schedule Trigger أو Webhook أو Manual Trigger)
5. أضف Error Handler عند الحاجة
6. استخدم أسماء nodes واضحة ووصفية بالإنجليزية
7. تأكد من منطق العمل (business logic) صحيح ومترابط

بنية الرد المطلوبة:
{
  "nodes": [...],
  "connections": {...},
  "settings": { "executionOrder": "v1" }
}`;
  }

  return `You are an advanced n8n workflow expert. Your task is to create a valid, complete workflow JSON based on the user's request.

Strict rules:
1. Return valid JSON that follows n8n specifications exactly
2. Each node must contain: id (unique uuid), name, type, typeVersion, position, parameters
3. Connections between nodes must be correct
4. Always start with a trigger node (Schedule Trigger, Webhook, or Manual Trigger)
5. Add Error Handler when appropriate
6. Use clear, descriptive node names in English
7. Ensure business logic is correct and interconnected

Required response structure:
{
  "nodes": [...],
  "connections": {...},
  "settings": { "executionOrder": "v1" }
}`;
}

export function buildPhase1UserPrompt(userRequest: string, lang: Language): string {
  if (lang === "ar") {
    return `أنشئ n8n workflow كامل وصالح للطلب التالي:

"${userRequest}"

أرجع JSON فقط، بدون أي نص إضافي أو markdown code blocks.`;
  }

  return `Create a complete, valid n8n workflow for the following request:

"${userRequest}"

Return JSON only, without any additional text or markdown code blocks.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 2: Gemini 2.5 Pro — Review & Critique
// ─────────────────────────────────────────────────────────────────────────────

export function buildPhase2Prompt(
  userRequest: string,
  workflowJson: string,
  lang: Language
): string {
  if (lang === "ar") {
    return `أنت مراجع متقدم لـ n8n workflows. راجع الـ workflow JSON التالي الذي تم إنشاؤه بواسطة GPT-4o.

الطلب الأصلي للمستخدم:
"${userRequest}"

الـ workflow JSON المُنشأ:
\`\`\`json
${workflowJson}
\`\`\`

قيّم الـ workflow على المعايير التالية:

1. **صحة الـ JSON**: هل البنية صحيحة ومتوافقة مع n8n؟
2. **أسماء الـ node types**: هل تبدو أسماء الـ nodes صحيحة (مثل n8n-nodes-base.gmail لا gmail فقط)؟
3. **الـ typeVersion**: هل قيم الـ typeVersion منطقية؟
4. **أسماء الـ credentials**: هل أسماء الـ credentials تبدو صحيحة؟
5. **الـ Connections**: هل الروابط تستخدم أسماء الـ nodes بالضبط؟
6. **منطق العمل**: هل يُحقق الـ workflow الهدف المطلوب؟
7. **معالجة الأخطاء**: هل يوجد error handling كافٍ؟

أرجع تقرير المراجعة بتنسيق JSON التالي فقط، بدون نص إضافي:
{
  "overallScore": <رقم من 0 إلى 100>,
  "approved": <true إذا كان الـ score >= 85، false إذا كان أقل>,
  "criticalIssues": [<قائمة بالمشاكل الحرجة التي يجب إصلاحها>],
  "improvements": [<قائمة بالتحسينات المقترحة>],
  "strengths": [<قائمة بالنقاط الإيجابية>],
  "specificFixes": [<قائمة بإصلاحات محددة يجب تطبيقها>],
  "reviewSummary": "<ملخص شامل للمراجعة>"
}`;
  }

  return `You are an advanced n8n workflow reviewer. Review the following workflow JSON created by GPT-4o.

User's original request:
"${userRequest}"

Generated workflow JSON:
\`\`\`json
${workflowJson}
\`\`\`

Evaluate the workflow on these criteria:

1. **JSON Validity**: Is the structure correct and n8n compatible?
2. **Node type names**: Do the node type names look correct (e.g. n8n-nodes-base.gmail not just gmail)?
3. **typeVersion**: Are the typeVersion values reasonable?
4. **Credential names**: Do credential names look correct?
5. **Connections**: Do connections reference nodes by their exact "name" fields?
6. **Business Logic**: Does the workflow achieve the requested goal?
7. **Error Handling**: Is there sufficient error handling?

Return the review report in the following JSON format only, without additional text:
{
  "overallScore": <number from 0 to 100>,
  "approved": <true if score >= 85, false if lower>,
  "criticalIssues": [<list of critical issues that must be fixed>],
  "improvements": [<list of suggested improvements>],
  "strengths": [<list of positive points>],
  "specificFixes": [<list of specific fixes to apply>],
  "reviewSummary": "<comprehensive review summary>"
}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 3: GPT-4o — Refine Based on Gemini Feedback
// ─────────────────────────────────────────────────────────────────────────────

export function buildPhase3SystemPrompt(lang: Language): string {
  if (lang === "ar") {
    return `أنت خبير متقدم في تحسين n8n workflows. مهمتك تحسين workflow JSON استناداً إلى تقرير المراجعة المفصل.

قواعد صارمة:
1. طبّق جميع الإصلاحات الحرجة (criticalIssues) بالكامل
2. طبّق التحسينات المقترحة (specificFixes) كلها
3. احتفظ بالنقاط الإيجابية (strengths) الموجودة
4. أرجع JSON صالح تماماً بدون أي نص إضافي
5. تأكد من أن الـ workflow أفضل من النسخة الأصلية
6. لا تغير أسماء الـ node types الصحيحة
7. settings.executionOrder يبقى "v1"`;
  }

  return `You are an advanced n8n workflow improvement expert. Your task is to refine a workflow JSON based on a detailed review report.

Strict rules:
1. Apply all critical fixes (criticalIssues) completely
2. Apply all suggested improvements (specificFixes)
3. Preserve the existing positive points (strengths)
4. Return completely valid JSON without any additional text
5. Ensure the workflow is better than the original version
6. Do not change correct node type names
7. Keep settings.executionOrder as "v1"`;
}

export function buildPhase3UserPrompt(
  userRequest: string,
  originalJson: string,
  reviewReport: string,
  lang: Language
): string {
  if (lang === "ar") {
    return `حسّن الـ workflow JSON التالي بناءً على تقرير المراجعة:

الطلب الأصلي:
"${userRequest}"

الـ workflow الأصلي:
\`\`\`json
${originalJson}
\`\`\`

تقرير المراجعة من Gemini:
\`\`\`json
${reviewReport}
\`\`\`

أرجع الـ workflow JSON المحسّن فقط، بدون أي نص إضافي.`;
  }

  return `Improve the following workflow JSON based on the review report:

Original request:
"${userRequest}"

Original workflow:
\`\`\`json
${originalJson}
\`\`\`

Gemini's review report:
\`\`\`json
${reviewReport}
\`\`\`

Return the improved workflow JSON only, without any additional text.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 4: Gemini 2.5 Pro — Final Validation
// ─────────────────────────────────────────────────────────────────────────────

export function buildPhase4Prompt(
  userRequest: string,
  finalJson: string,
  lang: Language
): string {
  if (lang === "ar") {
    return `أنت مدقق نهائي لـ n8n workflows. مهمتك التحقق من أن الـ workflow النهائي جاهز للنشر.

الطلب الأصلي:
"${userRequest}"

الـ workflow النهائي (بعد التحسين):
\`\`\`json
${finalJson}
\`\`\`

أجرِ تحقق نهائي شامل وأرجع النتيجة بتنسيق JSON فقط:
{
  "finalScore": <رقم من 0 إلى 100>,
  "readyForDeployment": <true أو false>,
  "remainingIssues": [<قائمة بأي مشاكل متبقية>],
  "validationSummary": "<ملخص التحقق النهائي>",
  "qualityGrade": "<A+ | A | B+ | B | C | F>",
  "deploymentNotes": "<ملاحظات مهمة للنشر>"
}`;
  }

  return `You are a final validator for n8n workflows. Your task is to verify that the final workflow is ready for deployment.

Original request:
"${userRequest}"

Final workflow (after improvement):
\`\`\`json
${finalJson}
\`\`\`

Perform a comprehensive final validation and return the result in JSON format only:
{
  "finalScore": <number from 0 to 100>,
  "readyForDeployment": <true or false>,
  "remainingIssues": [<list of any remaining issues>],
  "validationSummary": "<comprehensive final validation summary>",
  "qualityGrade": "<A+ | A | B+ | B | C | F>",
  "deploymentNotes": "<important deployment notes>"
}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Build user-facing response after engine completes
// ─────────────────────────────────────────────────────────────────────────────

// BUG 5 FIX: wasGated=true → show 3-step summary (smart gate skipped Phase 3+4)
export function buildSuccessMessage(
  userRequest: string,
  qualityGrade: string,
  finalScore: number,
  validationSummary: string,
  deploymentNotes: string,
  lang: Language,
  wasGated = false
): string {
  if (lang === "ar") {
    const stepsBlock = wasGated
      ? `🔄 **عملية الإنشاء المكتملة (3 مراحل):**
1. 🔵 GPT-4o حلّل الـ nodes المطلوبة وأنشأ الـ workflow
2. 🟣 Gemini 2.5 Pro راجع وقيّم — نتيجة ممتازة ⚡
3. ⚡ Phase 3+4 تم تخطيهما تلقائياً (جودة ≥ 85، workflow بسيط)`
      : `🔄 **عملية الإنشاء التسلسلية المكتملة (5 مراحل):**
1. 🔵 GPT-4o حلّل الـ nodes المطلوبة
2. 🔵 GPT-4o أنشأ الـ workflow بمواصفات دقيقة
3. 🟣 Gemini 2.5 Pro راجع وقيّم
4. 🔵 GPT-4o حسّن بناءً على التقرير
5. 🟣 Gemini 2.5 Pro تحقق من الجودة النهائية`;

    return `✅ **تم إنشاء الـ workflow بنجاح!**

📊 **نتيجة الجودة:** ${qualityGrade} (${finalScore}/100)

📝 **ملخص التحقق:**
${validationSummary}

💡 **ملاحظات النشر:**
${deploymentNotes}

---
${stepsBlock}

الـ workflow جاهز للاستيراد في n8n. هل تريد تعديلاً إضافياً؟`;
  }

  const stepsBlock = wasGated
    ? `🔄 **Completed Creation Process (3 phases):**
1. 🔵 GPT-4o analyzed nodes & built workflow
2. 🟣 Gemini 2.5 Pro reviewed & scored — excellent result ⚡
3. ⚡ Phases 3+4 skipped automatically (quality ≥ 85, simple workflow)`
    : `🔄 **Completed Sequential Creation Process (5 phases):**
1. 🔵 GPT-4o analyzed required nodes
2. 🔵 GPT-4o built workflow with exact specifications
3. 🟣 Gemini 2.5 Pro reviewed and scored
4. 🔵 GPT-4o refined based on the report
5. 🟣 Gemini 2.5 Pro validated final quality`;

  return `✅ **Workflow created successfully!**

📊 **Quality Score:** ${qualityGrade} (${finalScore}/100)

📝 **Validation Summary:**
${validationSummary}

💡 **Deployment Notes:**
${deploymentNotes}

---
${stepsBlock}

The workflow is ready for import in n8n. Would you like any additional changes?`;
}
