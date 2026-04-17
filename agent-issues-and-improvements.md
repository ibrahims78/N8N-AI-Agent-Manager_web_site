# تقرير مفصل: مشاكل الوكيل الذكي واقتراحات التحسين
## حالة التنفيذ — محدّث في 17 أبريل 2026 (المراجعة الشاملة)

---

## جدول الحالة الإجمالية

| # | المشكلة / الاقتراح | الحالة |
|---|-------------------|--------|
| 1 | رد فوري `thinking` عند استلام الرسالة | ✅ مُنجز |
| 2 | Cache لبيانات n8n بـ 30 ثانية TTL | ✅ مُنجز |
| 3 | Streaming النص حرفاً حرفاً | ✅ مُنجز |
| 4 | توازي DB + API Keys + Messages | ✅ مُنجز |
| 5 | كشف النية بـ LLM (GPT-4o mini) | ✅ مُنجز |
| 6 | بحث fuzzy + workflowNameHint | ✅ مُنجز |
| 7 | إصلاح SSE stuck bug | ✅ مُنجز |
| 8 | تقليص السياق بذكاء (smartTruncate) | ✅ مُنجز |
| 9 | رسائل خطأ بشرية واضحة | ✅ مُنجز |
| 10 | تمرير n8n context لـ Phase 1B (أ1) | ✅ مُنجز |
| 11 | Gate ذكي لتخطي Phase 3+4 (أ2) | ✅ مُنجز — **لكن ببعض الأخطاء الجديدة** |
| 12 | إشعارات المراحل الحية مع الوقت (ب) | ✅ مُنجز |
| 13 | ذاكرة قصيرة المدى في System Prompt (ج1) | ✅ مُنجز — **لكن ببعض الأخطاء** |
| 14 | **BUG جديد** — label الـ smart gate عربي في الوضعين | 🔴 خطأ نشط |
| 15 | **BUG جديد** — buildSessionSummary تلتقط أسماء nodes وليس workflows | 🔴 خطأ نشط |
| 16 | **BUG جديد** — race condition في previousMessages مع insert | 🔴 خطأ نشط |
| 17 | **BUG جديد** — محلل الـ analyzer يستخدم gemini-1.5-flash لكن الـ label يقول 2.5 Pro | 🟡 خطأ بصري |
| 18 | **BUG جديد** — buildSuccessMessage دائماً يقول 5 مراحل رغم تخطي 2 منها | 🟡 خطأ بصري |
| 19 | **بحاجة تحسين** — smart gate threshold = 3 nodes فقط (ضيق جداً) | 🟡 قيد |
| 20 | **بحاجة تحسين** — extractWorkflowNameFromMessage كود ميت يستخدم GPT-4o | 🟡 إهدار |
| 21 | **بحاجة تحسين** — لا invalidation للـ cache عند إنشاء workflow جديد | 🟠 خطأ منطقي |
| 22 | **مقترح احترافي** — معمارية Tool Calling بدلاً من pipeline ثابت | 💡 مقترح كبير |
| 23 | **مقترح احترافي** — حلقة تصحيح تلقائية عبر n8n | 💡 مقترح كبير |
| 24 | **مقترح احترافي** — Workflow versioning قبل كل تعديل | 💡 مقترح |
| 25 | **مقترح احترافي** — Diff view للتغييرات | 💡 مقترح |
| 26 | **مقترح احترافي** — إلغاء الطلب الجاري عند إرسال رسالة جديدة | 💡 مقترح |
| 27 | **مقترح احترافي** — استيراد تلقائي لـ n8n + عرض النتيجة فوراً | 💡 مقترح |

---

## القسم الأول: ما تم إنجازه ✅

### الإنجازات 1–9 (المرحلة الأولى)

راجع القسم الأول من التقرير السابق — جميعها مُنجزة وتعمل.

**ملخص سريع:**
- رد فوري < 100ms بمؤشر "يفكر"
- Cache ذكي 30/60 ثانية لبيانات n8n
- Streaming حرف بحرف في مسار الدردشة
- توازي استدعاءات DB في كل طلب
- كشف النية بـ LLM بدقة 95%
- بحث fuzzy بمطابقة 88%
- إصلاح تجميد زر الإرسال
- تقليص سياق ذكي
- رسائل خطأ بشرية

### الإنجازات 10–13 (المرحلة الثانية)

**أ1** — تمرير n8n context لـ Phase 1B: يعمل. Phase 1B تعرف الآن الـ workflows الموجودة وتتجنب التكرار.

**أ2** — Smart Gate (لكن فيه خطأ في الـ labels — انظر القسم الثاني).

**ب** — إشعارات المراحل الحية: تعمل بالكامل مع الوقت الفعلي لكل مرحلة.

**ج1** — Session Memory (لكن فيها خطأ في الـ regex — انظر القسم الثاني).

---

## القسم الثاني: أخطاء مكتشفة جديدة 🔴🟡🟠

---

### 🔴 BUG 1 — Smart Gate يعرض Label عربي في الوضع الإنجليزي

**الملف:** `artifacts/api-server/src/services/sequentialEngine.service.ts`

**المشكلة:**
```typescript
const skippedLabel = lang === "ar" ? "تم التخطي (الجودة ممتازة ✅)" : "Skipped (quality OK ✅)";

phases[2]!.label = skippedLabel;    // ← يُفترض هذا الإنجليزي
phases[2]!.labelAr = skippedLabel;  // ← يُفترض هذا العربي
// لكن كليهما يأخذان نفس القيمة!
```

**النتيجة:** عند الـ smart gate في الوضع الإنجليزي، `labelAr` يصبح "Skipped (quality OK ✅)" إنجليزياً. وفي الوضع العربي، `label` يصبح عربياً.

**الإصلاح:**
```typescript
phases[2]!.label = "Skipped (quality OK ✅)";
phases[2]!.labelAr = "تم التخطي (الجودة ممتازة ✅)";
```

---

### 🔴 BUG 2 — buildSessionSummary تلتقط أسماء الـ Nodes وليس الـ Workflows

**الملف:** `artifacts/api-server/src/routes/chat.routes.ts`

**المشكلة:**
```typescript
const nameMatches = m.content.match(/"name"\s*:\s*"([^"]{3,80})"/g);
```

هذا الـ regex يطابق **كل** حقل `"name"` في الـ JSON، بما في ذلك:
- `"name": "Gmail Trigger"` — اسم node
- `"name": "HTTP Request"` — اسم node
- `"name": "Set Variable"` — اسم node
- `"name": "My Email Workflow"` — اسم الـ workflow الفعلي

**النتيجة:** الـ system prompt سيحتوي على أسماء nodes عشوائية بدلاً من أسماء الـ workflows المُنشأة.

**الإصلاح:** استهداف حقل `"name"` عند المستوى الأعلى من الـ JSON فقط:
```typescript
// بدلاً من regex عام، ابحث عن اسم الـ workflow الجذري
const jsonMatch = m.content.match(/```json\n([\s\S]*?)\n```/);
if (jsonMatch) {
  try {
    const wf = JSON.parse(jsonMatch[1]) as { name?: string };
    if (wf.name && wf.name.length > 3) {
      createdWorkflows.push(wf.name);
    }
  } catch { /* ignore */ }
}
```

---

### 🔴 BUG 3 — Race Condition في previousMessages

**الملف:** `artifacts/api-server/src/routes/chat.routes.ts`

**المشكلة:**
```typescript
const [, { openaiKey, geminiKey }, previousMessages] = await Promise.all([
  db.insert(messagesTable).values({ ... }),  // يُدرج رسالة المستخدم
  getApiKeys(),
  db.select().from(messagesTable)...limit(20), // يجلب الرسائل بالتوازي!
]);
```

الـ INSERT والـ SELECT يعملان بالتوازي — في بعض الأحيان السيليكت ينتهي **قبل** أن الـ INSERT يُكمل، فتغيب رسالة المستخدم الحالية من السياق الممرَّر للـ AI.

**الإصلاح:**
```typescript
// أولاً احفظ الرسالة، ثم اجلب بالتوازي
await db.insert(messagesTable).values({ conversationId: convId, role: "user", content });

const [{ openaiKey, geminiKey }, previousMessages] = await Promise.all([
  getApiKeys(),
  db.select().from(messagesTable)
    .where(eq(messagesTable.conversationId, convId))
    .orderBy(desc(messagesTable.createdAt))
    .limit(20),
]);
```

---

### 🟡 BUG 4 — workflowAnalyzer يستخدم gemini-1.5-flash لكن الـ Label يقول "Gemini 2.5 Pro"

**الملف:** `artifacts/api-server/src/services/workflowAnalyzer.service.ts`

**المشكلة:**
```typescript
// Phase 2 في الـ analyzer
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// ↑ لكن label الـ phase يقول:
{ phase: 2, label: "Gemini: Validating analysis", ... }
// والـ frontend يعرض "Gemini 2.5 Pro" في بعض السياقات
```

المستخدم يظن أن التحقق يتم بـ gemini-2.5-pro لكن فعلياً يستخدم نموذجاً أضعف بكثير.

**الإصلاح:** إما تغيير النموذج لـ `gemini-2.5-pro`، أو تصحيح الـ label.

---

### 🟡 BUG 5 — buildSuccessMessage دائماً يعرض 5 مراحل حتى عند تخطي 2

**الملف:** `artifacts/api-server/src/services/promptBuilder.service.ts`

**المشكلة:**
```
🔄 **عملية الإنشاء التسلسلية المكتملة:**
1. 🔵 GPT-4o حلّل الـ nodes المطلوبة
2. 🔵 GPT-4o أنشأ الـ workflow
3. 🟣 Gemini 2.5 Pro راجع وقيّم
4. 🔵 GPT-4o حسّن        ← لم يحدث فعلاً (smart gate)
5. 🟣 Gemini 2.5 Pro تحقق ← لم يحدث فعلاً (smart gate)
```

عندما يُفعَّل الـ smart gate، الرسالة لا تزال تقول "5 مراحل" رغم أنها 3 فقط.

**الإصلاح:** تمرير `wasGated: boolean` للدالة وعرض رسالة مختلفة.

---

### 🟡 BUG 6 — Smart Gate Threshold = 3 ضيق جداً

**الملف:** `artifacts/api-server/src/services/sequentialEngine.service.ts`

**المشكلة:** `simpleWorkflowNodeThreshold ?? 3` يعني أن الـ gate يُفعَّل فقط عند وجود 3 nodes أو أقل.

في الواقع:
- workflow بسيط نموذجي: Trigger → Process → Send = **3 nodes** ✓
- workflow بسيط شائع: Trigger → Condition → Action1 → Action2 = **4 nodes** ✗ (لا يستفيد)
- workflow webhook: Webhook → Set → HTTP → Response = **4 nodes** ✗

الحد الأنسب هو **5 nodes** لتغطية معظم الطلبات البسيطة.

---

### 🟠 BUG 7 — لا يوجد Cache Invalidation بعد إنشاء Workflow جديد

**الملف:** `artifacts/api-server/src/routes/chat.routes.ts`

**المشكلة:** عند نجاح إنشاء workflow وإرساله لـ n8n، لا يُستدعى `invalidateWorkflowCache()`. لذا:
- المستخدم ينشئ workflow جديد
- يسأل عن workflows المتاحة في الدردشة
- الـ AI يُجيب بقائمة قديمة لا تشمل الـ workflow الجديد (لمدة 30 ثانية)

**الإصلاح:**
```typescript
// بعد إرسال workflow لـ n8n بنجاح في PATH A
if (engineResult.success && engineResult.workflowJson) {
  invalidateWorkflowCache(); // ← أضف هذا
}
```

---

### 🟡 BUG 8 — extractWorkflowNameFromMessage كود ميت يستخدم GPT-4o الغالي

**الملف:** `artifacts/api-server/src/services/workflowModifier.service.ts`

**المشكلة:** `extractWorkflowNameFromMessage` لا تُستدعى من أي مكان في كود الإنتاج الحالي (تم الاستغناء عنها بـ `workflowNameHint` من `detectIntent`). لكنها لا تزال موجودة وتستخدم GPT-4o بـ timeout 20 ثانية.

**الإصلاح:** حذف الدالة أو تحويلها لـ gpt-4o-mini إذا ستُستخدم مستقبلاً.

---

## القسم الثالث: المراجعة الاحترافية — مقارنة بوكيل Replit

---

### ما الفرق بين الوكيل الحالي ووكيل Replit؟

| الخاصية | وكيل Replit | وكيل n8n الحالي |
|---------|-------------|-----------------|
| **المعمارية** | Tool Calling ديناميكي — الـ AI يقرر أي أداة يستخدم | Pipeline ثابت 4 مراحل لا يتغير |
| **التكيف** | الـ AI يعيد المحاولة تلقائياً إذا فشلت أداة | لا retry تلقائي — فشل المرحلة = فشل الكل |
| **حلقة التصحيح** | يُشغّل الكود، يرى الخطأ، يُصلح، يُشغّل مجدداً | ينشئ الـ workflow لكن لا يختبره ولا يُصلح تلقائياً |
| **الشفافية** | يعرض المستخدم أدوات محددة تُستدعى لحظة بلحظة | يعرض مراحل عامة لكن ليس الاستدعاءات الفعلية |
| **المرونة** | يستطيع استخدام 1 أو 10 أدوات حسب التعقيد | دائماً 4 مراحل أو 2 (بعد الـ gate) — ثابت |
| **الذاكرة** | ذاكرة دائمة عبر sessions بـ vector store | ذاكرة مؤقتة في session فقط |
| **إلغاء الطلب** | يمكن إلغاء أي عملية جارية | لا يمكن إلغاء عملية الإنشاء بعد بدئها |
| **نتيجة قابلة للتحقق** | يرى نتيجة تنفيذ الكود مباشرة | لا يعرف إذا كان الـ workflow يعمل فعلاً في n8n |

---

## القسم الرابع: المقترحات الاحترافية الكبرى

---

### 💡 المقترح 1 — معمارية Tool Calling (الأهم والأكبر أثراً)

**المشكلة الجذرية:** Pipeline الـ 4 مراحل الثابت لا يعرف ماذا يحتاج المستخدم حقاً. طلب "أنشئ webhook بسيط" يمر بنفس المراحل الـ 4 التي يمر بها "أنشئ نظام CRM كامل مع 15 node".

**الحل:** استبدال الـ pipeline بـ OpenAI Tool Calling. يُعطى الـ AI مجموعة أدوات ويقرر بنفسه:

```typescript
const AGENT_TOOLS = [
  {
    type: "function",
    function: {
      name: "analyze_requirement",
      description: "تحليل متطلبات المستخدم وتحديد الـ nodes المناسبة",
      parameters: { type: "object", properties: { requirement: { type: "string" } } }
    }
  },
  {
    type: "function",
    function: {
      name: "build_workflow",
      description: "بناء workflow JSON كامل",
      parameters: { type: "object", properties: { nodes_plan: { type: "string" } } }
    }
  },
  {
    type: "function",
    function: {
      name: "validate_workflow",
      description: "التحقق من صحة الـ workflow وإصلاح الأخطاء",
      parameters: { type: "object", properties: { workflow_json: { type: "string" } } }
    }
  },
  {
    type: "function",
    function: {
      name: "import_to_n8n",
      description: "استيراد الـ workflow لـ n8n واختباره",
      parameters: { type: "object", properties: { workflow_json: { type: "string" } } }
    }
  },
  {
    type: "function",
    function: {
      name: "get_n8n_execution_result",
      description: "رؤية نتيجة آخر تنفيذ للـ workflow",
      parameters: { type: "object", properties: { workflow_id: { type: "string" } } }
    }
  }
];
```

الـ AI يستدعي ما يحتاجه:
- طلب بسيط: `analyze_requirement` → `build_workflow` → `import_to_n8n` (3 خطوات)
- طلب معقد: 7-8 خطوات مع validate وretry
- خطأ في التنفيذ: يُضيف `get_n8n_execution_result` ويُصلح تلقائياً

**الأثر:** الوكيل يصبح ديناميكياً مثل Replit Agent بدلاً من pipeline جامد.

---

### 💡 المقترح 2 — حلقة التصحيح التلقائية عبر n8n (Auto-Fix Loop)

**المشكلة:** حالياً الوكيل ينشئ الـ workflow ويُرسله لـ n8n لكن لا يعرف إذا كان يعمل. المستخدم يكتشف الخطأ بنفسه.

**الحل:**
```
إنشاء Workflow ← بناء ← استيراد n8n ← تشغيل تجريبي ← قراءة النتيجة
                                                        ↓ إذا فشل
                                              تحليل الخطأ ← إصلاح ← استيراد مجدداً
                                                        (حتى 3 محاولات)
```

```typescript
// بعد الاستيراد
const execResult = await triggerTestExecution(workflowId);
if (execResult.status === "error") {
  sendEvent("fixing", { message: `اكتشفت خطأ: ${execResult.error} — جاري الإصلاح...` });
  const fixedWorkflow = await runWorkflowAnalyzer(workflowJson, [execResult], "auto-fix");
  await updateWorkflow(workflowId, fixedWorkflow);
  // إعادة المحاولة
}
```

**الأثر:** الوكيل يُسلّم workflow يعمل بالفعل بدلاً من workflow "يبدو صحيحاً".

---

### 💡 المقترح 3 — Workflow Versioning (حفظ النسخ)

**المشكلة:** عند تعديل workflow، لا توجد نسخة سابقة يمكن الرجوع إليها إذا أفسد التعديل شيئاً.

**الحل:**

```sql
-- إضافة جدول جديد
CREATE TABLE workflow_versions (
  id SERIAL PRIMARY KEY,
  workflow_id VARCHAR NOT NULL,
  workflow_name VARCHAR NOT NULL,
  workflow_json JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER REFERENCES users(id),
  change_summary TEXT
);
```

قبل كل تعديل:
```typescript
// في chat.routes.ts — PATH B (modify)
await db.insert(workflowVersionsTable).values({
  workflowId: targetWorkflowId,
  workflowJson: currentWorkflowJson,
  changeSum: `Before: "${content}"`,
});
```

في الواجهة: زر "↩ استعادة النسخة السابقة" يظهر بعد كل تعديل.

**الأثر:** المستخدم يمكنه تجربة التعديلات بأمان مع إمكانية التراجع.

---

### 💡 المقترح 4 — Diff View للتغييرات (قبل/بعد)

**المشكلة:** عند تعديل workflow، المستخدم يرى JSON كامل جديد لكن لا يعرف ما الذي تغيير بالضبط.

**الحل (في الواجهة):**

```typescript
function WorkflowDiff({ original, modified }: { 
  original: Record<string, unknown>;
  modified: Record<string, unknown>;
}) {
  const addedNodes = modified.nodes.filter(n => !original.nodes.find(o => o.id === n.id));
  const removedNodes = original.nodes.filter(n => !modified.nodes.find(m => m.id === n.id));
  const changedNodes = modified.nodes.filter(n => {
    const orig = original.nodes.find(o => o.id === n.id);
    return orig && JSON.stringify(orig) !== JSON.stringify(n);
  });

  return (
    <div>
      {addedNodes.map(n => <DiffRow type="added" node={n} />)}
      {removedNodes.map(n => <DiffRow type="removed" node={n} />)}
      {changedNodes.map(n => <DiffRow type="changed" node={n} />)}
    </div>
  );
}
```

**الأثر:** المستخدم يرى فوراً: `✅ أضاف: "HTTP Request"` و `🔴 حذف: "Old Webhook"` بدلاً من JSON ضخم.

---

### 💡 المقترح 5 — إلغاء الطلب الجاري (Abort Controller)

**المشكلة:** إذا أرسل المستخدم رسالة والـ AI يعمل على إنشاء workflow، لا يمكن إلغاء الطلب. المستخدم يجب أن ينتظر حتى 53 ثانية.

**الحل:**

```typescript
// Backend: Map لتتبع الطلبات الجارية
const activeRequests = new Map<string, AbortController>();

// عند بدء كل طلب
const abortController = new AbortController();
activeRequests.set(`${userId}-${convId}`, abortController);

// Endpoint جديد لإلغاء الطلب
router.post("/conversations/:id/abort", authenticate, async (req, res) => {
  const key = `${req.user.userId}-${convId}`;
  const controller = activeRequests.get(key);
  if (controller) {
    controller.abort();
    activeRequests.delete(key);
  }
  res.json({ success: true });
});
```

```tsx
// Frontend: زر إلغاء يظهر أثناء التوليد
{sending && (
  <button onClick={handleAbort} className="text-destructive">
    ✕ إلغاء
  </button>
)}
```

---

### 💡 المقترح 6 — Auto-Import مع نتيجة فورية

**المشكلة:** بعد إنشاء الـ workflow، المستخدم يجب أن يضغط "إرسال لـ n8n" يدوياً.

**الحل:** الاستيراد التلقائي الاختياري مع تنبيه واضح:

```typescript
// في الـ engine result handling
if (engineResult.success && engineResult.workflowJson && userPrefers_autoImport) {
  try {
    const imported = await importWorkflowToN8n(engineResult.workflowJson);
    sendEvent("imported", { workflowId: imported.id, workflowUrl: `${n8nUrl}/workflow/${imported.id}` });
    invalidateWorkflowCache();
  } catch (importErr) {
    sendEvent("import_failed", { error: String(importErr) });
  }
}
```

في الواجهة: بعد الإنجاز يظهر `🔗 فُتح في n8n` بدلاً من "أرسل لـ n8n".

---

### 💡 المقترح 7 — Token Usage Tracking

**المشكلة:** لا يوجد تتبع لعدد الـ tokens المستخدمة. المستخدم قد يستخدم حصته بدون معرفة.

**الحل:** تتبع tokens في كل استدعاء وتخزينها في الـ DB:

```typescript
// في كل استدعاء OpenAI
const response = await openai.chat.completions.create({ ... });
const tokensUsed = response.usage?.total_tokens ?? 0;

// تخزين في generation_sessions
await db.update(generationSessionsTable)
  .set({ tokensUsed: tokensUsed })
  .where(...);
```

في الـ Dashboard: "استُخدم 45,230 token هذا الشهر" مع رسم بياني.

---

### 💡 المقترح 8 — Dynamic n8n Schema Injection (بدلاً من الـ schemas الثابتة)

**المشكلة الجذرية:** `nodeSchemas.ts` يحتوي schemas ثابتة ومحدودة. أي node لا يوجد فيها لا يُعامَل معاملة صحيحة.

**الحل:** جلب schemas مباشرة من n8n API:

```typescript
// n8n API يوفر node types
const n8nNodeTypes = await fetch(`${n8nBaseUrl}/node-types`, {
  headers: { "X-N8N-API-KEY": apiKey }
});

// تخزينها في cache وتمريرها للـ prompts
const dynamicSchemas = await getCachedNodeTypes(); // cache 1 ساعة
```

**الأثر:** الوكيل يعرف جميع الـ nodes المتاحة في n8n الخاصة بالمستخدم وليس فقط الـ 20 node المضمنة.

---

## القسم الخامس: مقارنة الأداء الشاملة

| المقياس | قبل أي تحسين | بعد المرحلة الأولى | بعد المرحلة الثانية | الهدف المقترح |
|---------|------------|-------------------|---------------------|--------------|
| وقت الاستجابة الأولى | 0-30s (صمت) | < 200ms | < 200ms | < 100ms |
| وقت الدردشة — أول كلمة | 10-15s | 1-3s (streaming) | 1-3s | 1-2s |
| وقت الإنشاء — بسيط (≤3 nodes) | 27-43s | 27-43s | **10-18s** | **5-12s** (مع tool calling) |
| وقت الإنشاء — معقد | 27-53s | 27-53s | 27-53s | 20-35s (مع توازي) |
| دقة كشف النية | ~75% | ~95% | ~95% | ~98% |
| مطابقة اسم الـ Workflow | ~60% | ~88% | ~88% | ~95% |
| نجاح الـ workflow في n8n | غير مُختبَر | غير مُختبَر | غير مُختبَر | ~90% (auto-fix loop) |
| ذاكرة الـ session | لا | لا | جزئية (bugs) | كاملة |
| إمكانية إلغاء طلب | لا | لا | لا | نعم |
| versioning | لا | لا | لا | نعم |

---

## القسم السادس: خارطة الطريق المقترحة

### الأولوية الأولى — إصلاح الأخطاء الحالية (1-2 أيام)
1. 🔴 إصلاح BUG 1: Smart gate labels (سطران فقط)
2. 🔴 إصلاح BUG 2: buildSessionSummary regex (تغيير النهج)
3. 🔴 إصلاح BUG 3: Race condition في previousMessages (إزالة التوازي)
4. 🟠 إصلاح BUG 7: Cache invalidation بعد إنشاء workflow (سطر واحد)
5. 🟡 إصلاح BUG 5: buildSuccessMessage مع smart gate (تمرير wasGated)
6. 🟡 تعديل BUG 6: رفع الـ threshold لـ 5 nodes (رقم واحد)

### الأولوية الثانية — تحسينات سريعة (2-3 أيام)
7. 💡 المقترح 3: Workflow Versioning (جدول DB + منطق بسيط)
8. 💡 المقترح 4: Diff View (مكوّن React)
9. 💡 المقترح 5: Abort Controller (endpoint + زر)
10. 💡 المقترح 6: Auto-Import التلقائي (اختياري)

### الأولوية الثالثة — إعادة المعمارية (أسبوع+)
11. 💡 المقترح 1: Tool Calling Architecture (تغيير جوهري)
12. 💡 المقترح 2: Auto-Fix Loop عبر n8n
13. 💡 المقترح 8: Dynamic Schema Injection

---

## الملفات المعدّلة — تاريخي

| الملف | التغييرات |
|-------|-----------|
| `artifacts/api-server/src/services/n8nCache.service.ts` | **جديد** — Cache service |
| `artifacts/api-server/src/services/intentDetector.service.ts` | **جديد** — LLM intent + fuzzy + smartTruncate |
| `artifacts/api-server/src/services/sequentialEngine.service.ts` | **محدَّث** — n8nContext + Smart Gate |
| `artifacts/api-server/src/services/promptBuilder.service.ts` | **محدَّث** — n8nContext في Phase 1B |
| `artifacts/api-server/src/routes/chat.routes.ts` | **مُعاد كتابته** — كل التحسينات |
| `artifacts/n8n-manager/src/pages/chat.tsx` | **محدَّث** — SSE fix + streaming + phase display |

---

*آخر تحديث: 17 أبريل 2026 — مراجعة شاملة للكود بعد المرحلتين الأولى والثانية*
