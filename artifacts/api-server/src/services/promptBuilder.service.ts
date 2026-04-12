/**
 * promptBuilder.service.ts
 * Builds structured prompts for each phase of the Sequential AI Engine.
 * Supports Arabic and English based on the user's input language.
 */

export type Language = "ar" | "en";

export function detectLanguage(text: string): Language {
  return /[\u0600-\u06FF]/.test(text) ? "ar" : "en";
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 1: GPT-4o — Create Workflow
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
}

فكّر خطوة بخطوة قبل الإجابة. ابدأ بفهم الهدف الرئيسي، ثم حدد الـ nodes المطلوبة، ثم أنشئ الـ connections.`;
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
}

Think step by step before answering. Start by understanding the main goal, identify required nodes, then create connections.`;
}

export function buildPhase1UserPrompt(userRequest: string, lang: Language): string {
  if (lang === "ar") {
    return `أنشئ n8n workflow كامل وصالح للطلب التالي:

"${userRequest}"

أرجع JSON فقط، بدون أي نص إضافي أو markdown code blocks. يجب أن يكون الـ JSON صالحاً وقابلاً للاستيراد مباشرة في n8n.`;
  }

  return `Create a complete, valid n8n workflow for the following request:

"${userRequest}"

Return JSON only, without any additional text or markdown code blocks. The JSON must be valid and directly importable into n8n.`;
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
    return `أنت مراجع متقدم لـ n8n workflows. راجع الـ workflow JSON التالي الذي تم إنشاؤه بواسطة GPT-4.

الطلب الأصلي للمستخدم:
"${userRequest}"

الـ workflow JSON المُنشأ:
\`\`\`json
${workflowJson}
\`\`\`

قيّم الـ workflow على المعايير التالية وأعطِ تقرير مفصل:

1. **صحة الـ JSON**: هل البنية صحيحة ومتوافقة مع n8n؟
2. **منطق العمل**: هل يُحقق الـ workflow الهدف المطلوب؟
3. **الـ Nodes**: هل الـ nodes المستخدمة صحيحة ومناسبة؟
4. **الـ Connections**: هل الروابط منطقية وصحيحة؟
5. **معالجة الأخطاء**: هل يوجد error handling كافٍ؟
6. **الأداء**: هل يمكن تحسين الكفاءة؟
7. **الأمان**: هل هناك مخاوف أمنية؟

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

  return `You are an advanced n8n workflow reviewer. Review the following workflow JSON that was created by GPT-4.

User's original request:
"${userRequest}"

Generated workflow JSON:
\`\`\`json
${workflowJson}
\`\`\`

Evaluate the workflow on the following criteria and provide a detailed report:

1. **JSON Validity**: Is the structure correct and n8n compatible?
2. **Business Logic**: Does the workflow achieve the requested goal?
3. **Nodes**: Are the used nodes correct and appropriate?
4. **Connections**: Are the connections logical and correct?
5. **Error Handling**: Is there sufficient error handling?
6. **Performance**: Can efficiency be improved?
7. **Security**: Are there any security concerns?

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
5. تأكد من أن الـ workflow أفضل من النسخة الأصلية`;
  }

  return `You are an advanced n8n workflow improvement expert. Your task is to refine a workflow JSON based on a detailed review report.

Strict rules:
1. Apply all critical fixes (criticalIssues) completely
2. Apply all suggested improvements (specificFixes)
3. Preserve the existing positive points (strengths)
4. Return completely valid JSON without any additional text
5. Ensure the workflow is better than the original version`;
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
// Phase 4: Gemini — Final Validation
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

export function buildSuccessMessage(
  userRequest: string,
  qualityGrade: string,
  finalScore: number,
  validationSummary: string,
  deploymentNotes: string,
  lang: Language
): string {
  if (lang === "ar") {
    return `✅ **تم إنشاء الـ workflow بنجاح!**

📊 **نتيجة الجودة:** ${qualityGrade} (${finalScore}/100)

📝 **ملخص التحقق:**
${validationSummary}

💡 **ملاحظات النشر:**
${deploymentNotes}

---
🔄 **عملية الإنشاء التسلسلية المكتملة:**
1. 🔵 GPT-4o أنشأ الـ workflow
2. 🟣 Gemini 2.5 Pro راجع وقيّم
3. 🔵 GPT-4o حسّن بناءً على التقرير
4. 🟣 Gemini تحقق من الجودة النهائية

الـ workflow جاهز للاستيراد في n8n. هل تريد تعديلاً إضافياً؟`;
  }

  return `✅ **Workflow created successfully!**

📊 **Quality Score:** ${qualityGrade} (${finalScore}/100)

📝 **Validation Summary:**
${validationSummary}

💡 **Deployment Notes:**
${deploymentNotes}

---
🔄 **Completed Sequential Creation Process:**
1. 🔵 GPT-4o created the workflow
2. 🟣 Gemini 2.5 Pro reviewed and scored
3. 🔵 GPT-4o refined based on the report
4. 🟣 Gemini validated final quality

The workflow is ready for import in n8n. Would you like any additional changes?`;
}
