# N8N AI Agent Manager — Workspace

## Project Overview

N8N AI Agent Manager هو تطبيق ويب احترافي لإدارة سير عمل n8n عبر محادثة ذكاء اصطناعي بالعربية/الإنجليزية.
يستخدم GPT-4o + Gemini 2.5 Pro في خط أنابيب تحسين تسلسلي من 4 مراحل.

## Architecture

```
/
├── artifacts/
│   ├── api-server/          — Express 5 API (port 8080)
│   ├── n8n-manager/         — React + Vite frontend (port 18898)
│   └── mockup-sandbox/      — Component preview server
├── lib/
│   ├── db/                  — Drizzle ORM schema + migrations
│   ├── api-spec/            — OpenAPI spec + codegen
│   └── api-client-react/    — Auto-generated React Query hooks
└── attached_assets/BUILD_PLAN.md — Master spec (8 phases)
```

## Stack

- **Monorepo**: pnpm workspaces
- **Node.js**: v24
- **Language**: TypeScript 5.9
- **API**: Express 5 + JWT auth (HS256)
- **DB**: PostgreSQL + Drizzle ORM
- **Frontend**: React 18 + Vite 7 + Tailwind CSS
- **i18n**: i18next (Arabic RTL + English LTR)
- **State**: Zustand + React Query v5
- **Encryption**: AES-256-CBC for API keys
- **Security**: Helmet.js, rate limiting (express-rate-limit), bcryptjs
- **Fonts**: IBM Plex Arabic (Google Fonts)
- **AI**: GPT-4o (OpenAI) + Gemini 2.5 Pro (Google)
- **Charts**: Recharts
- **Animations**: Framer Motion

## Key Commands

```bash
# DB push
pnpm --filter @workspace/db run push

# API Server (dev)
PORT=8080 pnpm --filter @workspace/api-server run dev

# Frontend (dev)
PORT=18898 BASE_PATH=/ pnpm --filter @workspace/n8n-manager run dev

# Codegen
pnpm --filter @workspace/api-spec run codegen

# Full build
pnpm run build
```

## Default Credentials

- **Username**: `admin`
- **Password**: `123456`
- **Note**: Admin user is auto-created on startup if no admin role exists in the database

## Key Implementation Notes

- JWT Access Token stored in `localStorage` as `accessToken`; refresh token in HttpOnly cookie
- Admin role bypasses ALL permission checks
- n8n API keys encrypted with AES-256-CBC; encryption key from `ENCRYPTION_KEY` env var
- Workflows list now uses real n8n execution data (not Math.random placeholders)
- Workflow import auto-saves version 1 to `workflow_versions` table
- History page supports JSON export (download) and PDF export (window.print())
- Chat page supports replay from history (via sessionStorage key `chatReplay`)
- Sequential engine: 4 phases → GPT-4o build → Gemini review → GPT-4o refine → Gemini validate
- SSE streaming endpoint: `POST /api/chat/conversations/:id/generate`
- Rate limits: login 10/min, chat 30/min, settings 20/min

## API Endpoints (Key)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check (db status) |
| POST | `/api/auth/login` | Login → accessToken |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/change-password` | Change password |
| GET | `/api/workflows` | List n8n workflows (real execution stats) |
| GET | `/api/workflows/:id` | Get workflow detail (real stats) |
| GET | `/api/workflows/:id/executions` | Execution history |
| GET | `/api/workflows/:id/versions` | Version history |
| POST | `/api/workflows/:id/restore/:versionId` | Restore a version |
| POST | `/api/workflows/:id/activate` | Activate workflow |
| POST | `/api/workflows/:id/deactivate` | Deactivate workflow |
| POST | `/api/workflows/bulk-action` | Bulk activate/deactivate/delete |
| POST | `/api/workflows/import` | Import AI-generated workflow (auto-saves v1) |
| GET | `/api/templates` | List templates (filter by category/search) |
| POST | `/api/templates` | Create new template (requires manage_workflows) |
| POST | `/api/templates/:id/rate` | Rate a template 1-5 (updates avgRating + ratingCount) |
| POST | `/api/templates/:id/use` | Use template → opens chat |
| DELETE | `/api/templates/:id` | Delete template (admin only) |
| GET | `/api/users` | List users (admin only) |
| POST | `/api/users` | Create user (admin only) |
| PUT | `/api/users/:id/permissions` | Update 10 permissions |
| POST | `/api/users/:id/reset-password` | Reset user password |
| GET | `/api/chat/conversations` | List conversations |
| POST | `/api/chat/conversations` | New conversation |
| POST | `/api/chat/conversations/:id/generate` | SSE stream AI generation |
| POST | `/api/chat/conversations/:id/analyze-workflow` | SSE stream workflow analysis (3-phase) |
| POST | `/api/workflows/:id/apply-fix` | Apply AI-generated fix JSON to n8n |
| DELETE | `/api/chat/conversations/:id` | Delete conversation |
| GET | `/api/settings/n8n` | Get n8n config |
| PUT | `/api/settings/n8n` | Save n8n config (encrypted) |
| POST | `/api/settings/n8n/test` | Test n8n connection |
| POST | `/api/settings/openai/test` | Test OpenAI key |
| POST | `/api/settings/gemini/test` | Test Gemini key |
| DELETE | `/api/settings/danger/conversations` | Delete all conversations |
| DELETE | `/api/settings/danger/versions` | Delete all versions |
| POST | `/api/settings/danger/factory-reset` | Factory reset |

## Frontend Routes

| Path | Page |
|------|------|
| `/login` | Login page |
| `/change-password` | Force password change |
| `/onboarding` | Setup wizard (n8n + AI keys) |
| `/` | Dashboard (KPI + charts + heatmap + live feed) |
| `/dashboard` | Dashboard (alias) |
| `/workflows` | Workflow list (card/list view, bulk actions) |
| `/workflows/:id` | Workflow detail (executions + versions tabs) |
| `/chat` | AI chat with 4-phase SSE streaming |
| `/templates` | Templates library with preview |
| `/history` | Chat history (JSON/PDF export, replay) |
| `/users` | User management (admin only) |
| `/settings` | App settings + API keys + danger zone |

## Build Plan Progress

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Project bootstrap + health | ✅ Complete |
| 1 | Auth + Permissions + Onboarding | ✅ Complete |
| 2 | n8n Adapter + Workflows CRUD | ✅ Complete |
| 3 | 4-phase AI pipeline + Chat SSE | ✅ Complete |
| 4 | Dashboard (KPI, charts, heatmap, AI insight) | ✅ Complete |
| 5 | Templates + History | ✅ Complete |
| 6 | Users (10 permissions) + Settings (danger zone) | ✅ Complete |
| 7 | Security (Helmet, rate limiting, AES-256) + i18n | ✅ Complete |
| 8 | Real execution stats + PDF export + version auto-save | ✅ Complete |
| 9 | Template rating (⭐ interactive stars) + Save workflow as template + code audit fixes | ✅ Complete |
| 10 | Workflow Analysis feature (3-phase AI pipeline: analyze → validate → fix) | ✅ Complete |

## Code Fixes (v9 Audit)

- **templates.routes.ts**: Added try-catch to all routes, added POST `/templates` (create) + POST `/:id/rate` + DELETE `/:id` endpoints
- **workflows.routes.ts**: Fixed dynamic `import()` → static import for `importWorkflow`
- **templates.ts (schema)**: Added `ratingCount: integer` column (DB migration applied)
- **templates.tsx**: Added interactive 5-star rating UI, null-safe `(avgRating ?? 0).toFixed(1)`, AnimatePresence on modals, "New Template" button
- **workflows.tsx**: Added `BookmarkPlus` "Save as Template" button with confirmation modal on all views
- **chat.tsx**: Removed dead code (duplicate `message !== undefined` branch), added proper error handling for SSE error events

## Code Fixes (v10 Comprehensive Audit — 16 Issues)

### Critical Fixes
- **vite.config.ts**: Removed broken `@assets` alias pointing to deleted `attached_assets/` folder
- **layout/ directory**: Deleted 3 dead layout components (`AppLayout.tsx`, `Sidebar.tsx`, `Navbar.tsx`) — never used by App.tsx
- **auth.routes.ts**: Removed unused `sql` import from drizzle-orm; added try-catch around DB query in login endpoint
- **chat.routes.ts**: Added `isNaN()` guards for `convId` in GET, DELETE, POST `/generate`, POST `/messages` endpoints

### Medium Fixes
- **lib/auditLog.ts**: Extracted shared `logAudit()` helper — was duplicated identically in `auth.routes.ts` and `users.routes.ts`
- **auth.routes.ts + users.routes.ts**: Both now import from `lib/auditLog.ts`
- **routes/index.ts**: Removed duplicate `dashboardRouter` registered on both `/dashboard` AND `/v1/dashboard`
- **chat.routes.ts**: Fixed `tokensUsed: undefined` → `tokensUsed: number | null = null` (explicit `?? null` on all assignments)
- **dashboard.routes.ts**: Removed unused `_period` variable from `top-workflows` endpoint
- **app.ts**: Added global Express error handler middleware (catches uncaught route errors → returns JSON)
- **auth.middleware.ts**: Added `.limit(50)` to `requirePermission` DB query (bounded fetch instead of unbounded)

---

## آلية عمل الوكيل الذكي — توثيق تفصيلي شامل

### نظرة عامة على التدفق الكامل

```
رسالة المستخدم
      ↓
[1] كاشف النوايا (Intent Detector)
      ↓ create / modify / query
[2] كاشف التوضيح (Clarification Detector)  ← إذا كان الطلب غامضاً
      ↓ طلب مكتمل أو إجابات توضيحية
[3] سياق الذاكرة الدائمة (Agent Memory)
      ↓
[4] سياق n8n الحالي (قائمة الـ workflows الموجودة)
      ↓
[5A] المحرك الوكيلي (Agentic Engine — Tool Calling)
       أو
[5B] المحرك التسلسلي (Sequential Engine — 4 مراحل)
      ↓
[6] حلقة الإصلاح الذاتي (Self-Healing Loop)
      ↓
[7] تسجيل في ذاكرة المستخدم + إرسال SSE للواجهة
```

---

### 1. كاشف النوايا — `intentDetector.service.ts`

**الهدف:** تصنيف رسالة المستخدم إلى ثلاث فئات قبل أي معالجة.

| النية | المعنى | مثال |
|-------|---------|-------|
| `create` | إنشاء workflow جديد | "أنشئ workflow يراقب Gmail" |
| `modify` | تعديل workflow موجود في n8n | "عدّل الـ workflow وأضف Slack" |
| `query` | سؤال أو استفسار عام | "كيف يعمل الـ webhook؟" |

**آلية العمل:**
1. **مسار سريع (Fast Path):** يفحص الكلمات المفتاحية أولاً (قائمة ثابتة بكلمات عربية وإنجليزية). إذا وُجدت ثقة عالية (`high`) يُرجع النتيجة فوراً بدون LLM.
2. **مسار LLM:** إذا لم تُحدد الكلمات المفتاحية النية، يستخدم `gpt-4o-mini` (سريع + رخيص، max_tokens: 120) لتصنيف الرسالة مع قائمة الـ workflows الموجودة في n8n.
3. **Fallback:** إذا فشل LLM، يعود لكشف الكلمات المفتاحية بثقة منخفضة.

**`workflowNameHint`:** إذا كانت النية `modify`، يستخرج الكاشف اسم الـ workflow المقصود مطابقةً جزئية من قائمة أسماء الـ workflows الموجودة في n8n.

---

### 2. كاشف التوضيح — `clarificationDetector.service.ts`

**الهدف:** منع بناء workflow غامض بطرح أسئلة مستهدفة أولاً.

**متى يُفعَّل؟** فقط عند النية `create` وعدد الكلمات < 40.

**المراحل الأربع:**

#### أ) `needsClarification()` — هل الطلب كافٍ؟
- يستخدم `gpt-4o-mini` لتحديد إن كان الطلب يحتوي على:
  - **Trigger:** متى/كيف يبدأ الـ workflow؟
  - **Action:** ماذا يفعل؟
- يُرجع: `needed: boolean` + قائمة `missingInfo` (trigger / action / destination / frequency / conditions...)
- **Fail-open:** إذا فشل LLM، يُكمل البناء بدون توضيح لتجنب تعطل المستخدم.

#### ب) `generateClarificationQuestions()` — توليد الأسئلة
- يستخدم `gpt-4o-mini` لتوليد 2-4 أسئلة محددة وعملية.
- تُضاف أسئلة بخيارات شائعة (مثلاً: "Shopify / WooCommerce / Salla؟").
- تُحفظ الرسالة كـ assistant message في DB مع **hidden marker** مخفي: `<!-- CLARIFICATION_REQUEST:base64encodedOriginalRequest -->`.

#### ج) `detectClarificationResponse()` — كشف الإجابة
- عند رسالة المستخدم التالية، يمسح الرسائل السابقة بحثاً عن الـ marker.
- يستخرج الطلب الأصلي من base64 المضمّن في الـ marker.

#### د) `buildEnrichedRequest()` — دمج الطلب الأصلي + الإجابات
- يدمج الطلب الأصلي + الأسئلة المطروحة + إجابات المستخدم في prompt غني واحد.
- يُرسل للـ LLM تعليماً صريحاً: "لا تسأل عن معلومات إضافية — هذا طلب مكتمل".

---

### 3. المحرك الوكيلي — `agenticEngine.service.ts`

**هو المحرك الأساسي المستخدم حالياً لبناء الـ workflows.**

**المبدأ:** GPT-4o يستدعي أدوات (Tool Calling) في حلقة تكرارية حتى يبني الـ workflow.

```
رسالة المستخدم + System Prompt
         ↓
    GPT-4o + 6 أدوات (max 10 تكرارات)
         ↕  (tool calls ← → نتائج الأدوات)
    Workflow JSON نهائي
         ↓
    Gemini 2.5 Pro — مراجعة وتقييم (0-100)
         ↓
    GPT-4o — تحسين إذا كانت الدرجة < 75
         ↓
    AgenticEngineResult
```

**System Prompt المحرك الوكيلي (4 خطوات ملزمة):**
1. **الاستكشاف (قبل البناء):** `search_node_types` ← اكتشاف الـ nodes المتاحة، `list_available_workflows` ← تجنب التكرار، `get_node_schema` ← الحصول على البنية الحقيقية لكل node.
2. **البناء:** workflow JSON كامل باستخدام البيانات الحقيقية من الأدوات.
3. **التحقق (قبل الإجابة النهائية):** `validate_workflow_json` ← إذا وُجدت أخطاء: صحّح وأعد التحقق.
4. **الإجابة النهائية:** JSON فقط — بدون نص توضيحي.

**القيود الأمنية:**
- Max 10 تكرارات (يمنع الحلقات اللانهائية)
- Timeout: 120 ثانية
- `temperature: 0.15` (ردود حتمية قدر الإمكان)

**مرحلة Gemini Review (اختيارية):**
- يرسل الـ workflow JSON + طلب المستخدم لـ Gemini 2.5 Pro.
- يُرجع: `score (0-100)`, `grade (A+/A/B+/B/C/D)`, `feedback`.
- إذا كانت الدرجة < 75 (threshold قابل للتكوين): يُشغّل مرحلة refinement.

**مرحلة GPT-4o Refinement (عند الدرجة المنخفضة):**
- Gemini يُولّد خطة التحسين (قائمة مرقمة بالتعديلات المطلوبة).
- GPT-4o يُطبّق خطة التحسين ويُرجع JSON محسّناً.

---

### 4. الأدوات الست للوكيل — `agentTools.ts`

| الأداة | الوظيفة | متى تُستخدم |
|--------|---------|-------------|
| `get_node_schema` | يجلب البنية الدقيقة لـ node محددة | قبل استخدام أي node في الـ workflow |
| `search_node_types` | بحث في جميع الـ nodes المتاحة | لاكتشاف الـ nodes المناسبة للمهمة |
| `list_available_workflows` | قائمة الـ workflows في n8n | لتجنب التكرار وفهم السياق |
| `get_workflow_details` | JSON كامل لـ workflow محدد | عند التعديل أو الإصلاح |
| `validate_workflow_json` | التحقق من صحة JSON للـ workflow | قبل الإجابة النهائية |
| `get_execution_errors` | أخطاء التنفيذ الأخيرة | عند تشخيص فشل workflow |

**`get_node_schema` — سلسلة البحث (5 مستويات):**
1. **Dynamic (n8n API):** يسأل n8n مباشرة عن الـ node المثبّت ← أعلى أولوية.
2. **Static Schema (محدّثة يدوياً):** إذا وُجد schema منسّق مسبقاً.
3. **KEYWORD_LOOKUP:** جدول ترجمة (webhook → n8n-nodes-base.webhookTrigger...) يدعم ~40 اسماً مختصراً.
4. **getRelevantSchemas:** خريطة كاملة للكلمات المفتاحية عربية + إنجليزية.
5. **Fuzzy Key Match:** بحث جزئي في أسماء الـ node types.

**`parameterTemplate`:** عندما تُرجع n8n API البارامترات الحقيقية، يُبني template نصي يخبر الـ LLM بأسماء الحقول الفعلية ونوعها وإذا كانت مطلوبة.

**`confirmedInstalledInN8n: true`:** علامة تُعطى للـ nodes المكتشفة من workflows موجودة فعلاً في n8n المستخدم ← أعلى ثقة.

---

### 5. المحرك التسلسلي — `sequentialEngine.service.ts`

**محرك قديم (احتياطي) — 4 مراحل صارمة:**

| المرحلة | النموذج | الوظيفة |
|---------|---------|---------|
| Phase 1A | GPT-4o | تحليل الـ nodes المطلوبة (node analysis) |
| Phase 1B | GPT-4o | بناء workflow JSON مع حقن schemas الـ nodes |
| Phase 2 | Gemini 2.5 Pro | مراجعة وتقييم الـ workflow |
| Phase 3 | GPT-4o | تحسين بناءً على ملاحظات Gemini |
| Phase 4 | Gemini 2.5 Pro | تحقق نهائي + بوابة الجودة |

- **Smart Gate:** إذا كان الـ workflow بسيطاً (عدد nodes < threshold)، تُتخطى المراحل 3 و4.
- **SSE Streaming:** Phase 1B و2 و4 تُرسل نصاً حياً للواجهة عبر Server-Sent Events.
- **Refinement Rounds:** حتى 2 جولات إضافية إذا كانت درجة Phase 4 < threshold.

---

### 6. حلقة الإصلاح الذاتي — `selfHealingLoop.service.ts`

**الهدف:** ضمان أن الـ workflow يُستورد بنجاح إلى n8n أو يُصلح نفسه تلقائياً.

```
workflow JSON مُولَّد
        ↓
POST /api/v1/workflows → n8n
        ↓ نجاح → إرجاع n8n ID ✅
        ↓ فشل
GPT-4o يحلل الخطأ + يصحح JSON
        ↓
إعادة المحاولة (حتى 3 مرات)
        ↓ فشل كل المحاولات
رسالة خطأ واضحة للمستخدم مع خيار النسخ اليدوي
```

**قواعد الإصلاح (GPT-4o):**
- يُصلح فقط ما يسبب الخطأ المحدد — لا يغيّر ما هو صحيح.
- يتحقق من: UUID صالحة لكل node، اتصالات تشير لأسماء nodes موجودة، وجود `typeVersion` رقمي، حقول `name/nodes/connections` مطلوبة.

**الحالات الخاصة:**
- `N8N_NOT_CONFIGURED`: يخرج فوراً بدون استهلاك LLM.
- إذا فشل LLM في الإصلاح: يحتفظ بالـ workflow الأصلي ويحاول مجدداً.

**SSE Events:** يرسل تحديثات حية للواجهة: `heal_attempt`, `heal_success`, `heal_fail`.

---

### 7. الذاكرة الدائمة — `agentMemory.service.ts`

**الهدف:** الوكيل يتذكر تاريخ المستخدم عبر الجلسات ويستخدمه في كل طلب جديد.

**ما يُخزَّن في جدول `agent_memory` (PostgreSQL):**

| الحقل | المحتوى |
|-------|---------|
| `createdWorkflows` | آخر 50 workflow أُنشئت (اسم، ID في n8n، نوع الـ nodes، درجة الجودة، التاريخ) |
| `userPatterns` | اللغة المفضلة، أكثر الـ nodes استخداماً، إجمالي الـ workflows المُنشأة |
| `n8nCredentials` | بيانات اعتماد n8n (credentials) — تُحدَّث كل ساعة |
| `lastN8nCredentialSync` | تاريخ آخر مزامنة للـ credentials |

**`buildMemoryContext()`:** يبني نصاً مختصراً يُحقن في system prompt الوكيل:
```
### [ذاكرة دائمة — سياق المستخدم عبر الجلسات]
## ذاكرة المستخدم — Workflows التي أنشأها سابقاً (5):
  - "مراقبة Gmail" (ID: abc123) | جودة: 88% | nodes: gmail, googleDrive — أُنشئ: 15 أبريل 2026
## Credentials مضبوطة في n8n (3):
  Gmail OAuth (gmailOAuth2Api)، Slack (slackOAuth2Api)، Postgres (postgres)
## أنماط الاستخدام:
  - إجمالي الـ workflows المُنشأة: 12
  - الـ nodes الأكثر استخداماً: gmail, slack, googleSheets
```

**`syncN8nCredentials()`:** تجلب credentials من `GET /api/v1/credentials` في n8n وتخزنها مؤقتاً (TTL: ساعة واحدة).

---

### 8. سياق المحادثة متعدد الأدوار

**الهدف:** الوكيل يتذكر الـ workflows التي بناها في نفس المحادثة.

**الآلية:**
- آخر 6 أدوار من المحادثة (12 رسالة) تُحقن في messages array قبل رسالة المستخدم الجديدة.
- كل رسالة تُقطَّع إذا تجاوزت 1200 حرف لتوفير tokens.
- يُستخدم `smartTruncateMessage()`: يحذف JSON blocks أولاً قبل القطع لأنها الأكبر حجماً.

---

### 9. SSE Streaming — تحديثات حية للواجهة

**المسار:** `POST /api/chat/conversations/:id/generate`

**أحداث SSE المُرسَلة:**

```typescript
// مراحل المعالجة
{ type: "phase_start", phase: 1, label: "جاري تحليل الطلب..." }
{ type: "phase_stream", chunk: "نص جزئي..." }     // نص حي أثناء التوليد
{ type: "phase_done", phase: 1 }

// أحداث الوكيل الذكي
{ type: "agent_tool_call", iteration: 2, toolName: "get_node_schema", args: {...} }
{ type: "agent_tool_result", toolName: "get_node_schema", durationMs: 120, success: true }
{ type: "agent_iteration_done", iteration: 2, totalToolCalls: 5 }
{ type: "agent_gemini_phase", phase: "start" }
{ type: "agent_gemini_phase", phase: "done", score: 87 }

// حلقة الإصلاح الذاتي
{ type: "heal_attempt", attempt: 1, maxAttempts: 3, importError: "..." }
{ type: "heal_success", n8nWorkflowId: "123", wasHealed: true }
{ type: "heal_fail", finalError: "..." }

// النتيجة النهائية
{ type: "done", workflowId: "123", workflowName: "...", qualityScore: 87, qualityGrade: "A" }
{ type: "error", message: "..." }
```

---

### 10. التحقق من JSON — `jsonValidator.service.ts`

**`validateWorkflowJson()`:** يتحقق من:
- الـ JSON صالح وقابل للتحليل.
- يحتوي على `name`, `nodes` (array غير فارغة), `connections` (object).
- كل node تحتوي على `id`, `name`, `type`, `typeVersion` (رقمي), `position` (array بعنصرين).

**`sanitizeWorkflowJson()`:** يُصلح تلقائياً:
- يُولّد `id` فريد (UUID) لكل node إذا كان مفقوداً.
- يُحوّل `typeVersion` لرقم إذا كان نصاً.
- يُضيف `position: [0, 0]` للـ nodes المفتقرة للموضع.
- يُضيف `settings: {"executionOrder": "v1"}` إذا كان مفقوداً.

**`extractJson()`:** يستخرج JSON من نص قد يحتوي على ماركداون أو نص توضيحي.

---

### 11. تكوين النماذج ومتغيرات البيئة

| المتغير | القيمة الافتراضية | الوظيفة |
|---------|------------------|---------|
| `OPENAI_API_KEY` | — | مفتاح GPT-4o (مطلوب) |
| `GEMINI_API_KEY` | — | مفتاح Gemini 2.5 Pro (مطلوب) |
| `OPENAI_MODEL` | `gpt-4o` | نموذج OpenAI للوكيل |
| `GEMINI_MODEL` | `gemini-2.5-pro` | نموذج Gemini للمراجعة |
| `MAX_AGENT_ITERATIONS` | `10` | حد تكرارات الوكيل |
| `QUALITY_THRESHOLD` | `75` | حد الدرجة لتشغيل التحسين |
| `ENCRYPTION_KEY` | — | مفتاح AES-256-CBC لتشفير n8n API keys |
| `JWT_SECRET` | — | مفتاح JWT للمصادقة |
| `DATABASE_URL` | — | رابط PostgreSQL |

---

### 12. مخطط قاعدة البيانات (جداول الوكيل)

| الجدول | الوظيفة |
|--------|---------|
| `conversations` | محادثات المستخدمين (عنوان، تاريخ، آخر workflow) |
| `messages` | رسائل المحادثة (role, content, workflowJson, qualityScore, tokensUsed) |
| `generation_sessions` | جلسات التوليد (phases, durations, token usage) |
| `agent_memory` | ذاكرة المستخدم الدائمة (workflows, patterns, credentials) |
| `workflow_versions` | نسخ الـ workflows (JSON + diff + إصدار) |
| `audit_logs` | سجل جميع الأحداث (login, create, modify, delete) |

---

### 13. أولويات اختيار الـ nodes (قاعدة ذهبية)

```
1. confirmedInstalledInN8n: true  ← موجود فعلاً في n8n المستخدم (أعلى ثقة)
2. hasStaticSchema: true          ← schema منسّق ومراجع يدوياً
3. n8n-api source                 ← جلب مباشر من n8n API
4. static fallback                ← من قائمة ثابتة
5. ❌ ممنوع: تخمين أي node type أو typeVersion
```

**القاعدة المطلقة:** لا يُستخدم أي node type لم يُرجع له `get_node_schema` نتيجة `found: true`.

---

### 14. حساب تكلفة الـ Tokens

يُحسب في كل جلسة توليد:

```typescript
{
  agentLoopPromptTokens,      // tokens system prompt + tool results
  agentLoopCompletionTokens,  // tokens استجابات GPT-4o
  refinementPromptTokens,     // tokens مرحلة التحسين
  refinementCompletionTokens, // tokens استجابات التحسين
  totalOpenaiTokens,          // إجمالي OpenAI
  estimatedCostUsd            // تكلفة تقديرية (input: $2.5/M, output: $10/M)
}
```

يُخزَّن في جدول `messages.tokensUsed` ويُعرض في لوحة التحكم.

## n8n Node Catalog (added 2026-04-22)
- Package `@workspace/n8n-nodes-catalog` ships static seed of 430 nodes from ibrahims78/n8n.
- DB tables: `node_catalog`, `node_catalog_meta` (Drizzle).
- API: `/api/catalog` (status, categories, list, lookup/:q, refresh — admin).
- Frontend route: `/nodes-catalog` (browse), Settings → "n8n Nodes Catalog" (refresh).
- AI agent tool: `lookup_node_catalog` for alias/folder/type resolution + docs links.
- Updater: `pnpm --filter @workspace/n8n-nodes-catalog run fetch`.

## Unified Content Cache (Phases 5-7 completed 2026-04-26)
- Plan: `docs/plans/unified-content-cache-plan.md`. All 7 phases ✅.
- **Phase 5**: catalog split into 541 per-node files in `lib/n8n-nodes-catalog/catalog/`; 6 system templates extracted to `lib/n8n-nodes-catalog/templates/`. Loaders fall back to legacy on missing dir.
- **Phase 6**: unified API at `/api/content/:kind/...` with `kind ∈ {guide, node-doc}`. Verbs: `stats`, `:slug` (GET), `:slug/diff`, `:slug/override` (PUT/DELETE), `refresh-all` (POST, SSE named events), `history` (GET). Shared React component `<ContentRefreshPanel>` consumed by `guides.tsx` (full visual parity).
- **Phase 7**: new table `content_refresh_history` (kind, mode, total/added/updated/unchanged/failed, duration_ms, ai_calls, network_bytes). Writer service `contentRefreshHistory.service.ts` is best-effort and **never writes during dry-run** (sacred contract §15.4). `?only=type1,type2` query added to node-doc refresh-all to scope `force` runs.
- **Tests** (all green): `tests/phase5-catalog-templates.test.mjs` 8/8, `tests/phase6-unified-content-api.test.mjs` 8/8, `tests/content-cache.test.mjs` 12/12 (6 contracts × 2 kinds).
