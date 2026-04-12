# خطة بناء تطبيق N8N AI Agent Manager — دليل التنفيذ الكامل

---

> **هذا الملف هو المرجع الرئيسي لبناء التطبيق من الصفر.**
> يحتوي على الأمر الاحترافي الكامل لـ Replit، وجميع مراحل التطوير مع بداياتها ونهاياتها، وخطة الاختبار التفصيلية لكل مرحلة وللتطبيق كاملاً.

---

## الأمر الاحترافي لـ Replit (ابدأ هنا)

انسخ هذا الأمر كاملاً وأعطه لـ Replit Agent عند بداية كل مرحلة جديدة:

---

### الأمر الرئيسي — الإطار الكامل للمشروع

```
أنت مهندس برمجيات أول متخصص في React، Node.js، وتكاملات الذكاء الاصطناعي.
ستبني تطبيق "N8N AI Agent Manager" وفق المواصفات التالية بدقة تامة.

═══════════════════════════════════════════════════
الهوية التقنية للمشروع:
═══════════════════════════════════════════════════

الواجهة الأمامية: React 18 + Vite + TypeScript
التنسيق: Tailwind CSS + shadcn/ui
الحالة: TanStack Query (React Query v5)
الحركة: Framer Motion
التوجيه: React Router v6
الخلفية: Node.js 20 + Express 5 + TypeScript
قاعدة البيانات: PostgreSQL (Replit DB)
ORM: Drizzle ORM
Cache / Queue: Redis + Bull Queue
Real-Time: WebSocket (ws library)
المصادقة: JWT (Access Token 15min + Refresh Token 7days في HttpOnly Cookie)
التشفير: AES-256-CBC لمفاتيح API
كلمات المرور: bcrypt cost factor 12
الذكاء الاصطناعي: OpenAI SDK (gpt-4.1) + Google Generative AI SDK (gemini-2.5-pro)
اللغة العربية: RTL كامل + خط IBM Plex Arabic / Tajawal
الاختبارات: Jest + Supertest + Playwright

═══════════════════════════════════════════════════
قواعد التطوير الإجبارية:
═══════════════════════════════════════════════════

1. اللغة الافتراضية للواجهة: العربية (RTL) — مع زر تبديل للإنجليزية
2. الوضع الافتراضي: نهاري — مع زر تبديل للوضع الليلي
3. كل إعداد اللغة والوضع يُحفظ في localStorage
4. جميع مفاتيح API تُخزن مشفرة بـ AES-256 في قاعدة البيانات — لا تُخزن كنص عادي أبداً
5. نظام الصلاحيات يطبق على كل endpoint في الـ Backend و كل عنصر في الـ Frontend
6. الـ Agent يرد بنفس لغة المستخدم (عربي → عربي، إنجليزي → إنجليزي)
7. كل workflow يمر على JSON Validator قبل الإرسال لـ n8n
8. شريط التقدم للمراحل الأربع يجب أن يكون مرئياً وحياً أثناء العمل
9. البيانات الحساسة لا تظهر في الـ logs أبداً
10. كل API endpoint يجب أن يُرجع استجابة موحدة: { success, data, error }

═══════════════════════════════════════════════════
نظام الألوان الإجباري:
═══════════════════════════════════════════════════

نهاري:
  --bg-primary: #F8FAFC
  --bg-card: #FFFFFF
  --sidebar: #FFFFFF
  --accent: #6366F1
  --accent-secondary: #8B5CF6
  --text-primary: #1E293B
  --text-secondary: #64748B
  --success: #10B981
  --error: #EF4444
  --warning: #F59E0B

ليلي:
  --bg-primary: #0F172A
  --bg-card: #1E293B
  --sidebar: #1E293B
  --accent: #818CF8
  --accent-secondary: #A78BFA
  --text-primary: #F1F5F9
  --text-secondary: #94A3B8
  --success: #34D399
  --error: #F87171
  --warning: #FCD34D

═══════════════════════════════════════════════════
هيكل قاعدة البيانات الكامل (Drizzle Schema):
═══════════════════════════════════════════════════

جدول users:
  id, username, password_hash, role (admin/user), is_active,
  force_password_change, failed_login_attempts, locked_until,
  last_login, created_at, updated_at

جدول user_permissions:
  id, user_id, permission_key, is_enabled, updated_at

جدول system_settings:
  id, n8n_url, n8n_api_key_encrypted, n8n_api_key_iv,
  openai_key_encrypted, openai_key_iv, openai_key_updated_at,
  gemini_key_encrypted, gemini_key_iv, gemini_key_updated_at

جدول conversations:
  id, user_id, title, type (create/edit/diagnose/query),
  status, message_count, related_workflow_id, created_at, updated_at

جدول messages:
  id, conversation_id, role (user/assistant/system),
  content, model_used, tokens_used, created_at

جدول workflow_versions:
  id, workflow_n8n_id, version_number, workflow_json,
  change_description, created_by, created_at

جدول generation_sessions:
  id, conversation_id, user_request, phase_1_result,
  phase_2_feedback, phase_3_result, phase_4_approved,
  rounds_count, total_time_ms, final_workflow_json,
  quality_score, quality_report, created_at

جدول templates:
  id, name, description, category, nodes_count,
  workflow_json, usage_count, avg_rating, created_by,
  is_system, created_at

جدول audit_logs:
  id, user_id, action, entity_type, entity_id,
  details_json, ip_address, created_at

═══════════════════════════════════════════════════
هيكل المجلدات المطلوب:
═══════════════════════════════════════════════════

/
├── client/                     (React Frontend)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             (shadcn components)
│   │   │   ├── layout/         (Navbar, Sidebar, Layout)
│   │   │   ├── chat/           (Chat UI components)
│   │   │   ├── workflows/      (Workflow cards, list, details)
│   │   │   ├── dashboard/      (Charts, stats, heatmap)
│   │   │   └── shared/         (Reusable components)
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── OnboardingPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ChatPage.tsx
│   │   │   ├── WorkflowsPage.tsx
│   │   │   ├── WorkflowDetailPage.tsx
│   │   │   ├── TemplatesPage.tsx
│   │   │   ├── HistoryPage.tsx
│   │   │   ├── UsersPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── hooks/              (Custom hooks)
│   │   ├── lib/                (API client, utils, validators)
│   │   ├── stores/             (Zustand stores)
│   │   ├── i18n/               (ar.json, en.json)
│   │   └── types/              (TypeScript types)
│   └── index.html
│
├── server/                     (Node.js Backend)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── workflows.routes.ts
│   │   │   ├── chat.routes.ts
│   │   │   ├── dashboard.routes.ts
│   │   │   ├── templates.routes.ts
│   │   │   ├── history.routes.ts
│   │   │   ├── users.routes.ts
│   │   │   └── settings.routes.ts
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── n8nAdapter.service.ts
│   │   │   ├── gpt41.service.ts
│   │   │   ├── gemini.service.ts
│   │   │   ├── sequentialEngine.service.ts
│   │   │   ├── jsonValidator.service.ts
│   │   │   ├── encryption.service.ts
│   │   │   └── queue.service.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── permissions.middleware.ts
│   │   │   ├── rateLimiter.middleware.ts
│   │   │   └── errorHandler.middleware.ts
│   │   ├── db/
│   │   │   ├── schema.ts
│   │   │   └── migrations/
│   │   ├── websocket/
│   │   └── utils/
│   └── index.ts
│
├── shared/                     (مشترك بين Client و Server)
│   └── types/
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```
```

---

## المراحل التفصيلية للبناء

---

## المرحلة صفر (0): إعداد البيئة والأساس التقني

### البداية
تشغيل هذا الأمر في Replit لإعداد المشروع كاملاً من الصفر.

### الأمر لـ Replit

```
المرحلة 0: إعداد البيئة الكاملة للمشروع

أنشئ مشروع Node.js + React بالهيكل التالي:

1. أنشئ الهيكل الكامل للمجلدات كما هو موضح في الإطار العام

2. ثبّت جميع الحزم المطلوبة:
   
   Backend (server/package.json):
   - express@5, cors, helmet, express-rate-limit
   - jsonwebtoken, bcrypt
   - drizzle-orm, @neondatabase/serverless
   - drizzle-kit
   - openai (latest)
   - @google/generative-ai (latest)
   - bull (queue), ioredis
   - ws (websocket)
   - multer (file upload)
   - winston (logging)
   - zod (validation)
   - typescript, tsx, @types/*
   
   Frontend (client/package.json):
   - react@18, react-dom, react-router-dom@6
   - @tanstack/react-query@5
   - tailwindcss, @tailwindcss/typography
   - shadcn/ui components (all)
   - framer-motion
   - zustand (state management)
   - axios
   - recharts (charts)
   - react-i18next + i18next
   - date-fns
   - react-dropzone
   - react-hot-toast
   - lucide-react (icons)
   - @uiw/react-md-editor (markdown)
   - monaco-editor/react (JSON editor)
   - vite@5

3. أعدّ Tailwind مع دعم RTL وإضافة tailwindcss-rtl
   أضف خطوط Google: IBM Plex Arabic, Tajawal, Inter, JetBrains Mono

4. أنشئ ملف .env.example بجميع المتغيرات المطلوبة:
   DATABASE_URL, REDIS_URL, JWT_SECRET, JWT_REFRESH_SECRET,
   ENCRYPTION_KEY (32 bytes hex), PORT=5000, NODE_ENV=development

5. أنشئ schema.ts الكامل لـ Drizzle بجميع الجداول المذكورة

6. أنشئ migration أولى وشغّلها

7. أنشئ سيد قاعدة البيانات (seed.ts) يُضيف:
   - مستخدم مدير افتراضي: username="مدير", password="123456", role="admin", force_password_change=true
   - 10 صلاحيات لكل مستخدم (مُعطّلة بالافتراضي للمستخدمين العاديين)
   - 6 قوالب workflow جاهزة (إيميل يومي، مزامنة Sheets، تنبيه Slack، جلب API، Webhook، تنظيف DB)

8. أنشئ Drizzle config مربوط بـ DATABASE_URL

9. ضبط Vite على port 5000 مع proxy للـ Backend

10. أنشئ workflow لـ Replit يشغّل Frontend و Backend معاً

النتيجة المطلوبة: مشروع يعمل على port 5000 مع قاعدة بيانات جاهزة وبيانات أولية.
```

### نهاية المرحلة — معايير الاكتمال
- [ ] المشروع يعمل على port 5000
- [ ] قاعدة البيانات متصلة والجداول منشأة
- [ ] المستخدم الافتراضي "مدير" موجود في DB
- [ ] Vite يبني Frontend بدون أخطاء
- [ ] Backend يستجيب على `/api/v1/health`
- [ ] Redis متصل

### اختبار المرحلة
```bash
# اختبار الـ Backend
curl http://localhost:5000/api/v1/health
# المتوقع: { "success": true, "data": { "status": "ok", "db": "connected", "redis": "connected" } }

# اختبار قاعدة البيانات
# تشغيل: npx drizzle-kit studio
# التحقق من وجود جدول users مع مستخدم "مدير"
```

---

## المرحلة الأولى (1): نظام المصادقة والإعداد الأولي

### البداية
بعد اكتمال المرحلة 0 والتحقق من نجاح اختباراتها.

### الأمر لـ Replit

```
المرحلة 1: نظام المصادقة الكامل وشاشات الإعداد الأولي

ابنِ الآتي بدقة تامة:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
أ. Backend — Auth System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. auth.routes.ts:
   POST /api/v1/auth/login
     - تحقق من username + password
     - تحقق من is_active وlocked_until
     - فشل 5 مرات → قفل الحساب وتسجيل locked_until = now + 15 دقيقة
     - نجاح → حدّث last_login + reset failed_login_attempts
     - أرجع: accessToken (JWT 15 دقيقة) + Refresh Token في HttpOnly Cookie (7 أيام)
     - إذا force_password_change = true → أرجع { requiresPasswordChange: true }
   
   POST /api/v1/auth/logout
     - احذف Refresh Token من الـ Cookie
   
   POST /api/v1/auth/refresh
     - تحقق من Refresh Token في الـ Cookie
     - أرجع accessToken جديد
   
   POST /api/v1/auth/change-password
     - تحقق من كلمة المرور الحالية
     - تحقق من قوة كلمة المرور الجديدة (8+ أحرف، كبير، صغير، رقم)
     - رفض كلمة المرور الافتراضية (123456) وأشيع 20 كلمة مرور ضعيفة
     - حدّث password_hash وforce_password_change = false
     - سجّل في audit_logs

2. auth.middleware.ts:
   - تحقق من Access Token في Authorization header
   - أرجع 401 إذا منتهي أو خاطئ
   - ألصق بيانات المستخدم في req.user

3. permissions.middleware.ts:
   - تحقق من صلاحية معينة لكل endpoint
   - المدير: يمر دائماً
   - المستخدم: تحقق من user_permissions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ب. Backend — Settings (Onboarding)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. settings.routes.ts:
   POST /api/v1/settings/n8n/test
     - اختبر الاتصال بـ n8n مع URL و apiKey المُرسَلَين
     - أرجع: version, workflows_count, status
   
   PUT /api/v1/settings/n8n
     - احفظ n8n_url + n8n_api_key_encrypted (AES-256) في system_settings
     - للمدير فقط
   
   POST /api/v1/settings/openai/test
     - اختبر مفتاح OpenAI — اجلب قائمة النماذج
     - أرجع: valid, model_available, balance_info
   
   PUT /api/v1/settings/openai
     - احفظ المفتاح مشفراً

   POST /api/v1/settings/gemini/test
     - اختبر مفتاح Gemini — تحقق من إمكانية التوليد
     - أرجع: valid, model_available, daily_quota

   PUT /api/v1/settings/gemini
     - احفظ المفتاح مشفراً

   GET /api/v1/settings/system-status
     - أرجع حالة جميع الخدمات (n8n, openai, gemini, db, redis)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ج. encryption.service.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. أنشئ خدمة التشفير:
   - encryptApiKey(plaintext: string): { encryptedKey: string, iv: string }
   - decryptApiKey(encryptedKey: string, iv: string): string
   - استخدم crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv)
   - ENCRYPTION_KEY من environment variables (32 bytes)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
د. Frontend — صفحة تسجيل الدخول
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6. LoginPage.tsx:
   التصميم بالضبط:
   - خلفية: تدرج من #6366F1 إلى #8B5CF6
   - بطاقة بيضاء مركزية بظل ناعم
   - شعار 🤖 + "N8N AI Manager" + "مدير workflows ذكي بالعربية"
   - حقل username + حقل password (مع زر 👁 إظهار/إخفاء)
   - خيار "تذكرني 7 أيام" (checkbox)
   - زر "تسجيل الدخول" بلون #6366F1
   - رسالة "لا تملك حساباً؟ تواصل مع مدير النظام"
   - زرا اللغة والوضع في الزاوية العلوية
   
   السلوك:
   - اهتزاز الحقول عند خطأ (Framer Motion shake animation)
   - شاشة تحميل أثناء التحقق
   - عند force_password_change → انتقل لشاشة تغيير كلمة المرور
   - قفل الحساب → رسالة "تواصل مع مدير النظام لفتح الحساب"

7. شاشة إجبار تغيير كلمة المرور (ChangePasswordModal):
   - modal يمنع الإغلاق أو التخطي
   - حقلا كلمة مرور + تأكيد
   - مؤشر قوة كلمة المرور (ضعيفة/جيدة/قوية/ممتازة)
   - قائمة متطلبات تتحول للأخضر عند الاكتمال
   - رفض "123456" وأي كلمة مرور شائعة

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
هـ. Frontend — Onboarding (3 خطوات)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

8. OnboardingPage.tsx (للمدير فقط، مرة واحدة):
   
   خطوة 1 — ربط n8n:
   - حقل URL + حقل API Key
   - زر "اختبار الاتصال" ← يظهر نتيجة فورية
   - نجاح: يعرض إصدار n8n + عدد الـ workflows
   - فشل: رسائل تشخيص مفصلة حسب نوع الخطأ
   - لا يمكن المتابعة إلا بعد اتصال ناجح

   خطوة 2 — OpenAI:
   - حقل API Key
   - زر اختبار ← يعرض: صالح + النموذج + الرصيد
   - تحذير عند رصيد أقل من $5

   خطوة 3 — Gemini:
   - حقل API Key
   - زر اختبار ← يعرض: صالح + النموذج + الحصة اليومية
   
   شريط تقدم متحرك بين الخطوات الثلاث
   عند الانتهاء: انتقال للـ Dashboard مع Guided Tour

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
و. i18n (ملفات الترجمة)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

9. أنشئ ملفات ar.json و en.json بجميع النصوص المستخدمة في هذه المرحلة
   الافتراضي: العربية
   كل النصوص مترجمة للغتين

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ز. Layout الرئيسي
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

10. أنشئ Layout.tsx مع:
    - Navbar علوي: شعار + روابط + زر وضع ليلي + زر لغة + قائمة مستخدم
    - Sidebar يسار (RTL): Dashboard, Workflows, Agent, Templates, History, Users (مدير), Settings
    - الروابط تظهر حسب الصلاحيات فقط
    - Protected Route يحمي جميع الصفحات

النتيجة المطلوبة: تسجيل دخول كامل يعمل + onboarding + layout جاهز.
```

### نهاية المرحلة — معايير الاكتمال
- [ ] تسجيل الدخول يعمل بمستخدم "مدير" وكلمة مرور "123456"
- [ ] إجبار تغيير كلمة المرور يظهر في أول دخول ولا يمكن تخطيه
- [ ] قفل الحساب بعد 5 محاولات فاشلة
- [ ] Onboarding يُختبر الاتصال بـ n8n وOpenAI وGemini
- [ ] Layout العربي RTL يظهر صحيحاً
- [ ] زرا اللغة والوضع يعملان ويُحفظ الاختيار

### اختبار المرحلة
```
✅ تسجيل الدخول بـ: مدير / 123456 → شاشة تغيير كلمة المرور
✅ تغيير كلمة المرور بـ "password123" → يُرفض (كلمة مرور شائعة)
✅ تغيير كلمة المرور بـ "Admin@2026" → يُقبل
✅ 5 محاولات خاطئة → "الحساب مقفل"
✅ onboarding خطوة n8n → اختبار اتصال ناجح يُظهر عدد الـ workflows
✅ زر اللغة → تتحول الواجهة للإنجليزية (LTR)
✅ زر الوضع → تتحول للوضع الليلي
✅ الإعداد محفوظ بعد تحديث الصفحة
```

---

## المرحلة الثانية (2): صفحة الـ Workflows وتكامل n8n

### البداية
بعد اكتمال المرحلة 1 والتحقق من نجاح تسجيل الدخول والـ Onboarding.

### الأمر لـ Replit

```
المرحلة 2: صفحة إدارة Workflows الاحترافية وتكامل n8n الكامل

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
أ. n8nAdapter.service.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

أنشئ خدمة N8nAdapter كاملة تدعم:
- اكتشاف الإصدار تلقائياً (v1 API)
- إعادة المحاولة التلقائية (3 مرات مع exponential backoff)
- Timeout 30 ثانية لكل طلب
- رسائل خطأ واضحة (INVALID_API_KEY, CONNECTION_REFUSED, NOT_FOUND, etc.)

getWorkflows(): جلب جميع الـ workflows مع pagination
getWorkflow(id): جلب workflow واحد بالتفاصيل الكاملة
createWorkflow(data): إنشاء workflow جديد
updateWorkflow(id, data): تحديث workflow موجود
deleteWorkflow(id): حذف workflow
activateWorkflow(id): تفعيل workflow
deactivateWorkflow(id): إيقاف workflow
getWorkflowExecutions(id, limit): سجل التنفيذات
getWorkflowExecution(workflowId, executionId): تفاصيل تنفيذ واحد
testConnection(): اختبار الاتصال وجلب البيانات الأساسية

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ب. workflows.routes.ts (Backend)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GET    /api/v1/workflows              - قائمة كاملة مع فلترة وبحث
GET    /api/v1/workflows/:id          - تفاصيل workflow واحد
GET    /api/v1/workflows/:id/executions - سجل التنفيذات (مع pagination)
POST   /api/v1/workflows/:id/activate   - تفعيل
POST   /api/v1/workflows/:id/deactivate - إيقاف
DELETE /api/v1/workflows/:id            - حذف
POST   /api/v1/workflows/bulk-action   - إجراءات جماعية (activate/deactivate/delete)
GET    /api/v1/workflows/:id/versions   - سجل الإصدارات
POST   /api/v1/workflows/:id/restore/:versionId - استعادة إصدار

جميع الـ endpoints تتحقق من الصلاحيات المناسبة

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ج. WorkflowsPage.tsx (Frontend)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

التصميم الكامل:
1. شريط أعلى: عدد الـ workflows + بحث + فلتر ▼ + زر "جديد" + تبديل Card/List View
2. Sidebar يسار: شجرة مجلدات (الكل, مجلدات مخصصة) + زر "مجلد جديد"
3. منطقة المحتوى:
   
   Card View:
   - بطاقة لكل workflow تحتوي:
     * أيقونة + اسم الـ workflow
     * حالة: ✅ مفعّل / ⏸️ موقوف / 🔴 فاشل
     * جدول التشغيل (يومي/أسبوعي/يدوي)
     * شريط تقدم ملون: أخضر (90%+) برتقالي (70-90%) أحمر (أقل 70%)
     * نسبة النجاح
     * مؤشر نبضة 🟢 إذا يعمل الآن (WebSocket)
     * آخر تنفيذ
     * أزرار: ▶ تشغيل | ✏️ تعديل | 🗑️ حذف | ⋯ المزيد
     * قائمة ⋯: نسخ، نقل لمجلد، تصدير JSON، عرض السجل الكامل
   
   List View:
   - جدول بأعمدة: ☐ | الاسم | الحالة | النجاح | آخر تنفيذ | التردد | الإجراءات
   
   Bulk Actions (تظهر عند تحديد عناصر):
   - ▶ تفعيل الكل المحدد | ⏸ إيقاف | 🗑️ حذف | 📤 تصدير
   
   سحب وإفلات لنقل workflow بين المجلدات

4. React Query لجلب البيانات مع auto-refresh كل 30 ثانية
5. WebSocket للحصول على تحديثات التنفيذ الحي
6. Skeleton loading أثناء جلب البيانات
7. Empty state جميل عند عدم وجود workflows

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
د. WorkflowDetailPage.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4 أقسام في الصفحة:

قسم 1 - المعاينة البصرية:
- رسم الـ workflow بالعقد والروابط (SVG-based أو مكتبة بسيطة)
- كل node كبطاقة مع أيقونة ونوع واسم
- الروابط بين الـ nodes بأسهم
- Error Handler يظهر باللون الأحمر

قسم 2 - إحصائيات الأسبوع:
- نجاح/فشل + نسبة + Sparkline chart
- متوسط وقت التنفيذ + أسرع + أبطأ

قسم 3 - سجل التنفيذات:
- فلتر: الكل / ناجح / فاشل
- قائمة بالتنفيذات: وقت + حالة + مدة
- زر "تشخيص فوري" على كل تنفيذ فاشل → يفتح صفحة الـ Agent مع بيانات الخطأ

قسم 4 - سجل الإصدارات:
- قائمة بالإصدارات: رقم + وقت + وصف التغيير
- زر "معاينة" + زر "استعادة"
- Diff view بصري بين إصدارين (قبل/بعد)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
هـ. WebSocket للتحديثات الحية
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. أنشئ WebSocket server:
   - يُرسل workflow:execution:started عند بداية تنفيذ
   - يُرسل workflow:execution:completed عند الانتهاء
   - يُرسل workflow:status:changed عند تغيير الحالة
   - Polling لـ n8n كل 15 ثانية للحصول على التحديثات
   - Broadcasting للمستخدمين المصرح لهم فقط

النتيجة المطلوبة: صفحة workflows تعرض جميع workflows من n8n مع تحديث حي وكل العمليات تعمل.
```

### نهاية المرحلة — معايير الاكتمال
- [ ] تُعرض جميع الـ 9 workflows الموجودة في n8n
- [ ] Card View و List View يعملان بالتبديل بينهما
- [ ] تفعيل/إيقاف workflow يؤثر فعلياً على n8n
- [ ] سجل التنفيذات يعرض البيانات الحقيقية
- [ ] مؤشر النبضة يظهر على الـ workflows النشطة
- [ ] الـ WebSocket يُحدّث الواجهة دون إعادة تحميل

### اختبار المرحلة
```
✅ الدخول لصفحة Workflows → يظهر 9 workflows
✅ تفعيل workflow موقوف → يتحول للـ Active في n8n فعلاً
✅ Bulk Action: تحديد 3 workflows وتصديرها كـ JSON
✅ فتح تفاصيل workflow → تظهر المعاينة البصرية والسجل
✅ إيقاف تنفيذ نشط → مؤشر النبضة يختفي
✅ Diff View: مقارنة إصدارين تظهر الفرق بوضوح
```

---

## المرحلة الثالثة (3): محرك AI وواجهة المحادثة

### البداية
بعد اكتمال المرحلة 2 والتحقق من عمل صفحة الـ Workflows.

### الأمر لـ Replit

```
المرحلة 3: محرك الذكاء الاصطناعي وواجهة المحادثة

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
أ. gpt41.service.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

أنشئ خدمة كاملة لـ GPT-4.1:

buildWorkflow(userRequest, context, mode): Promise<WorkflowJSON>
  - يُرسل System Prompt المتخصص لـ n8n (قواعد البنية، الـ nodes، Error Handling)
  - يُضمّن إجابات الاستيعاب (context) في الـ Prompt
  - يُرجع JSON صالح فقط (يرفض أي رد غير JSON)
  - يُسجّل tokens المستخدمة

improveWorkflow(workflow, geminiReview, userRequest): Promise<WorkflowJSON>
  - يُطبّق جميع ملاحظات Gemini بدقة
  - يُرجع النسخة المحسّنة

generateDailyInsight(workflowsStats): Promise<string>
  - يُنشئ ملخصاً ذكياً يومياً
  - يُوصي بحلول للـ workflows الفاشلة

chat(messages, language): AsyncGenerator<string>
  - محادثة عامة مع Streaming
  - يرد بنفس لغة المستخدم

analyzeImage(imageBase64, prompt): Promise<string>
  - تشخيص صور الأخطاء البصرية

System Prompt المتخصص لـ n8n يتضمن:
- قواعد بنية n8n JSON الكاملة
- قائمة الـ nodes الشائعة وحقولها الإجبارية
- 3 أمثلة كاملة (Few-Shot)
- قواعد Error Handling الإجبارية
- قواعد التسمية المنظمة
- طلب إخراج JSON صارم فقط بدون شرح

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ب. gemini.service.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

reviewWorkflow(workflow, userRequest): Promise<ReviewReport>
  - يراجع من 6 محاور: JSON صحة، اكتمال Nodes، منطق التدفق،
    Error Handling، الأداء، تحقيق الهدف
  - يُرجع: { approved: boolean, score: number, observations: string[], improvements: string[] }

validateFinalWorkflow(workflow, originalRequest): Promise<ValidationResult>
  - التحقق النهائي: هل طُبّقت الملاحظات؟ هل جاهز لـ n8n؟
  - يُرجع: { approved: boolean, score: number, reason: string }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ج. jsonValidator.service.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

validateWorkflow(json): ValidationResult
  نقاط التحقق الإجبارية:
  - صحة JSON (parseable + complete)
  - وجود nodes array غير فارغ
  - كل node لها: id (UUID)، name، type، typeVersion، position، parameters
  - connections صالحة (تشير لـ nodes موجودة)
  - وجود triggerNode واحد على الأقل
  - تحقق من Error Handler للـ nodes الحساسة

يُرجع: { valid, errors[], warnings[] }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
د. chat.routes.ts (Backend)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

POST /api/v1/chat/conversations        - بدء محادثة جديدة
GET  /api/v1/chat/conversations        - قائمة المحادثات
GET  /api/v1/chat/conversations/:id    - تفاصيل محادثة
DELETE /api/v1/chat/conversations/:id  - حذف محادثة

POST /api/v1/chat/conversations/:id/messages - إرسال رسالة
  - Streaming response (text/event-stream)
  - يدير context window (آخر 20 رسالة + تلخيص القديم)
  - يُصنّف نوع الطلب (create/edit/diagnose/query)
  - يحفظ الرسالة في DB

POST /api/v1/chat/upload - رفع ملف JSON أو صورة (multer)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
هـ. ChatPage.tsx (Frontend)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

التصميم الكامل:

1. Header:
   - عنوان المحادثة الحالية (قابل للتعديل)
   - وضع المستخدم: مبتدئ / خبير (Toggle)
   - زر "محادثة جديدة"

2. منطقة الرسائل:
   - كل رسالة مستخدم: فقاعة زرقاء يسار (RTL) مع وقت
   - كل رسالة Agent: فقاعة رمادية يمين مع:
     * اسم النموذج المستخدم (GPT-4.1 أو Gemini)
     * وقت التوليد
     * زر نسخ المحتوى
   - كود JSON يُعرض في code block ملوّن (JetBrains Mono)
   - Markdown مُنسَّق (عناوين، قوائم، كود)
   - Streaming: نص يظهر حرفاً حرفاً (مثل ChatGPT)
   - مؤشر "يكتب..." مع نقاط متحركة

3. شريط التقدم الرباعي (يظهر أثناء الإنشاء فقط):
   ┌────────────────────────────────────────┐
   │  جاري إنشاء الـ Workflow...           │
   │                                        │
   │  ✅ المرحلة 1: GPT-4.1 يبني...        │
   │  🔄 المرحلة 2: Gemini يراجع...        │
   │  ⏳ المرحلة 3: التحسينات              │
   │  ⏳ المرحلة 4: التحقق النهائي         │
   │                                        │
   │  الجولة: 1 من 3    ████████░░ 70%     │
   └────────────────────────────────────────┘
   كل مرحلة مع وقتها الفعلي بالثواني
   يُحدَّث عبر WebSocket

4. حقل الإدخال:
   - Textarea يكبر تلقائياً مع النص
   - زر إرسال (أو Enter، Shift+Enter لسطر جديد)
   - 📎 رفع ملف (JSON أو صورة) مع Drag & Drop
   - مؤشر "طلبك في الصف رقم X" إذا كانت هناك طلبات قبله

5. اقتراحات سريعة (تظهر في المحادثة الجديدة فقط):
   [📧 إنشاء workflow إيميل] [🔗 webhook] [📊 تقرير يومي] [❓ سؤال عام]

النتيجة المطلوبة: محادثة تعمل مع Streaming، رفع الملفات، وكل المكونات المرئية.
```

### نهاية المرحلة — معايير الاكتمال
- [ ] المحادثة العربية تعمل مع Streaming (نص يظهر تدريجياً)
- [ ] رفع ملف JSON يُحلَّل ويُرد عليه بذكاء
- [ ] رفع صورة خطأ n8n يعطي تشخيصاً
- [ ] مؤشر "يكتب..." يظهر أثناء انتظار الرد
- [ ] الـ Agent يرد بالعربية على طلب عربي والإنجليزية على طلب إنجليزي
- [ ] سجل المحادثات يُحفظ في قاعدة البيانات

### اختبار المرحلة
```
✅ "مرحباً كيف حالك؟" → الـ Agent يرد بالعربية بنص متدفق
✅ "Hello, how are you?" → الـ Agent يرد بالإنجليزية
✅ رفع ملف JSON تالف → الـ Agent يشرح الخطأ
✅ إرسال طلب بسيط → يُحفظ في قاعدة البيانات ويظهر في السجل
✅ فتح محادثة قديمة → الـ Agent يتذكر السياق
```

---

## المرحلة الرابعة (4): نظام التحسين التسلسلي الرباعي (القلب الأساسي)

### البداية
بعد اكتمال المرحلة 3 والتحقق من عمل المحادثة الأساسية.

### الأمر لـ Replit

```
المرحلة 4: نظام التحسين التسلسلي الرباعي — القلب الأساسي للتطبيق

هذا النظام هو الميزة الأبرز في التطبيق. ابنه بأعلى دقة ممكنة.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
أ. sequentialEngine.service.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

الخدمة الرئيسية التي تُنسِّق جميع مراحل الإنشاء:

async runSequentialImprovement(params: {
  userRequest: string,
  userId: string,
  conversationId: string,
  mode: 'beginner' | 'expert',
  onProgress: (update: ProgressUpdate) => void
}): Promise<GenerationResult>

تدفق التنفيذ الكامل:

[1] استيعاب الطلب (Pre-Build Analysis):
    - إذا mode === 'beginner': أرسل أسئلة توضيحية للمستخدم عبر WebSocket
    - انتظر إجابات المستخدم (أو timeout 5 دقائق)
    - إذا mode === 'expert': تخطَّ الأسئلة

[2] بناء Prompt احترافي:
    - ادمج System Prompt الكامل + إجابات الاستيعاب + طلب المستخدم
    - تحقق من مكتبة الأمثلة للبحث عن أمثلة مشابهة (تشابه >80%)
    - إذا وُجد مثال: أضفه كـ Few-Shot في الـ Prompt

[3] تقسيم الطلب المعقد إذا لزم:
    - إذا تجاوز الطلب 5 خطوات → ابنِ كل وحدة منفصلة ثم ادمجها

حلقة التحسين (بحد أقصى 3 جولات):

    المرحلة 1: GPT-4.1 يبني الـ workflow
      → onProgress({ phase: 1, status: 'running', round: X })
      → workflow_v1 = await gpt41Service.buildWorkflow(...)
      → onProgress({ phase: 1, status: 'done', duration: Xms })

    التحقق التقني:
      → validationResult = jsonValidator.validateWorkflow(workflow_v1)
      → إذا فشل: أُعد للـ GPT-4.1 مع تفاصيل الفشل (مرة واحدة إضافية)

    المرحلة 2: Gemini يراجع
      → onProgress({ phase: 2, status: 'running', round: X })
      → review = await geminiService.reviewWorkflow(workflow_v1, userRequest)
      → onProgress({ phase: 2, status: 'done', observations: review.observations })

    المرحلة 3: GPT-4.1 يُطبّق التحسينات
      → onProgress({ phase: 3, status: 'running', round: X })
      → workflow_improved = await gpt41Service.improveWorkflow(workflow_v1, review, userRequest)
      → onProgress({ phase: 3, status: 'done', duration: Xms })

    المرحلة 4: Gemini يتحقق النهائي
      → onProgress({ phase: 4, status: 'running', round: X })
      → finalCheck = await geminiService.validateFinalWorkflow(workflow_improved, userRequest)
      → onProgress({ phase: 4, status: 'done', approved: finalCheck.approved })

    إذا finalCheck.approved === true → اخرج من الحلقة
    إذا finalCheck.approved === false && round < 3 → أعد من المرحلة 3
    إذا round === 3 → أرسل أفضل نسخة متاحة مع ملاحظة

النتيجة:
    → احفظ كل مرحلة في generation_sessions
    → أرجع: { workflow, qualityReport, rounds, totalTime }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ب. queue.service.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

أنشئ Bull Queue لإدارة طلبات الـ AI:
- concurrency: 3 (ثلاثة طلبات بالتوازي)
- timeout: 300,000ms (5 دقائق)
- attempts: 2 مع exponential backoff
- priority: admin=1, user=5, diagnostic=3
- حد لكل مستخدم: 3 طلبات متزامنة
- إخبار المستخدم بمكانه في الصف عبر WebSocket

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ج. WorkflowPreview Component
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

بعد اكتمال الإنشاء، اعرض:

┌──────────────────────────────────────────────────┐
│ تقرير جودة الـ Workflow                          │
│ ──────────────────────────────────────────────── │
│ عدد الجولات: X  ┊  الوقت: Xث  ┊  التقييم: X/10│
│ ملاحظات طُبّقت: X من X                          │
│ Error Handling: ✅  ┊  JSON: ✅  ┊  الهدف: ✅   │
│ ──────────────────────────────────────────────── │
│ معاينة بصرية: [Node1] → [Node2] → [Node3]       │
│ ──────────────────────────────────────────────── │
│ [✅ إرسال لـ n8n]  [✏️ طلب تعديل]  [💾 مسودة] │
│ [📋 نسخ JSON]                                    │
└──────────────────────────────────────────────────┘

عند الضغط "إرسال لـ n8n":
→ أرسل الـ workflow لـ n8n API
→ أظهر تأكيد النجاح مع رابط الـ workflow في n8n
→ احفظ نسخة في workflow_versions
→ أضفه لمكتبة الأمثلة الداخلية
→ اطلب تقييم المستخدم (⭐ 1-5 مع تعليق اختياري)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
د. مرحلة الاستيعاب التفاعلي (وضع المبتدئ)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

عند وضع المبتدئ:
- GPT-4.1 يُحدد ما يحتاجه من توضيح (2-4 أسئلة فقط)
- تُرسل الأسئلة للمستخدم كرسالة في الـ Chat
- المستخدم يجيب بشكل طبيعي
- الإجابات تُضاف لسياق البناء
- ثم يبدأ نظام التحسين التسلسلي

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
هـ. Context Window Management
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

أضف إدارة احترافية لـ context window:
- احتفظ بآخر 20 رسالة
- لخّص الرسائل القديمة تلقائياً بعد 15 رسالة
- تحذير للمستخدم عند اقتراب حد الـ tokens

النتيجة المطلوبة: "أنشئ workflow يرسل إيميل يومياً" → يمر بالمراحل الأربع → workflow يُرسل لـ n8n بنجاح.
```

### نهاية المرحلة — معايير الاكتمال
- [ ] طلب إنشاء workflow يمر بالمراحل الأربع مع شريط تقدم مرئي
- [ ] شريط التقدم يُحدَّث حياً عبر WebSocket
- [ ] تقرير الجودة يظهر بعد الاكتمال
- [ ] "إرسال لـ n8n" يُنشئ الـ workflow فعلاً في n8n
- [ ] حد 3 جولات يعمل بشكل صحيح
- [ ] Queue يمنع تجاوز 3 طلبات متزامنة

### اختبار المرحلة
```
✅ طلب "أنشئ workflow يُرسل إيميل يومياً الساعة 8 صباحاً عبر Gmail"
   → وضع مبتدئ: يسأل عن Gmail credentials وما يُرسَل
   → المراحل الأربع تظهر مع الوقت الفعلي
   → تقرير الجودة يظهر: ملاحظات، جولات، وقت
   → الـ workflow يُرسَل لـ n8n ويظهر في قائمة الـ workflows
   
✅ طلبان متزامنان من مستخدمَين مختلفَين → يعملان بالتوازي
✅ 4 طلبات في نفس الوقت → الرابع يُخبَر بمكانه في الصف
✅ Gemini يرفض في الجولة الثانية → يعود لـ GPT-4.1 للجولة الثالثة
```

---

## المرحلة الخامسة (5): لوحة التحكم الذكية

### البداية
بعد اكتمال المرحلة 4 والتحقق من عمل نظام التحسين التسلسلي.

### الأمر لـ Replit

```
المرحلة 5: لوحة التحكم الذكية (Dashboard)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
أ. dashboard.routes.ts (Backend)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GET /api/v1/dashboard/stats
  → عدد الـ workflows الكلي، المفعّلة، الموقوفة
  → نسبة النجاح اليوم مع المقارنة بالأمس
  → متوسط وقت التنفيذ مع المقارنة
  → Sparklines (آخر 7 أيام) لكل مؤشر
  → حالة n8n مع ping time

GET /api/v1/dashboard/activity-chart?period=7d|30d|3m
  → بيانات الرسم البياني: ناجح + فاشل + متوسط وقت لكل نقطة زمنية
  → تُجلب من n8n executions API

GET /api/v1/dashboard/live-feed?limit=20
  → آخر التنفيذات مع الحالة والوقت والمدة
  → يدعم WebSocket للتحديث الحي

GET /api/v1/dashboard/top-workflows?period=week|month|all
  → أكثر 5 workflows تنفيذاً مع نسبة النجاح

GET /api/v1/dashboard/heatmap?year=2026
  → بيانات خريطة الحرارة: تاريخ → عدد التنفيذات

GET /api/v1/dashboard/alerts
  → التنبيهات النشطة: workflows فشلت أكثر من مرتين متتالية، رصيد منخفض

GET /api/v1/dashboard/ai-insights
  → ملخص يومي من GPT-4.1 (مُخزَّن في cache، يُجدَّد مرة كل 12 ساعة)
  → تحليل الأداء + توصيات بالحلول

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ب. DashboardPage.tsx (Frontend)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Layout الصفحة:

Row 1 — 4 بطاقات KPI:
  كل بطاقة تحتوي:
  - رقم رئيسي كبير
  - مؤشر تغيير ↑↓ مقارنة بالأمس
  - Sparkline chart مصغّر (Recharts)
  - لون ديناميكي (أخضر/أحمر/رمادي)
  البطاقات: تنفيذات اليوم | نسبة النجاح | متوسط وقت | حالة n8n

Row 2 — رسم بياني تفاعلي:
  - Recharts BarChart + LineChart مركّبان
  - أشرطة خضراء: تنفيذات ناجحة
  - أشرطة حمراء: تنفيذات فاشلة
  - خط أزرق: متوسط وقت التنفيذ
  - Tooltip غني عند التمرير
  - فلتر زمني: [اليوم][7 أيام][30 يوماً][مخصص]

Row 3 — عمودان:
  العمود الأيسر: التغذية الحية
    - قائمة آخر 20 تنفيذ مع الحالة والوقت والمدة
    - 🟢 نابضة تؤكد أن البيانات حية
    - زر "تشخيص فوري" على التنفيذات الفاشلة
    - auto-refresh كل 30 ثانية (أو WebSocket)
    - فلتر: الكل / ناجح / فاشل
  
  العمود الأيمن: مركز التنبيهات
    - قائمة التنبيهات مُصنّفة: 🔴 عالي / 🟡 متوسط / 🔵 معلومات
    - زر "تشخيص فوري مع Agent" لكل تنبيه
    - زر "تجاهل" لإخفاء التنبيه

Row 4 — عمودان:
  العمود الأيسر: أكثر الـ workflows نشاطاً
    - Top 5 مع شريط تقدم ملوّن + نسبة النجاح
    - فلتر: هذا الأسبوع / هذا الشهر
  
  العمود الأيمن: ملخص الذكاء الاصطناعي
    - نص GPT-4.1 عن أداء اليوم
    - توصيات بالحلول
    - Skeleton loading أثناء التوليد
    - زر "تحديث التقرير"

Row 5 — خريطة الحرارة السنوية (GitHub-style):
  - 53 × 7 مربعات تمثل كل أسبوع وكل يوم
  - 4 درجات لون: رمادي / أخضر فاتح / أخضر / أخضر داكن
  - Tooltip: التاريخ + عدد التنفيذات + نسبة النجاح
  - الضغط على يوم → عرض تفاصيله

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ج. Guided Tour (أول دخول)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4 نقاط تفاعلية تُوجّه المستخدم عند أول دخول للـ Dashboard بعد الـ Onboarding

النتيجة المطلوبة: Dashboard مع بيانات حقيقية من n8n وتحديث كل 30 ثانية.
```

### نهاية المرحلة — معايير الاكتمال
- [ ] 4 بطاقات KPI تعرض بيانات حقيقية مع Sparklines
- [ ] الرسم البياني يعرض آخر 7 أيام مع تحديث فوري
- [ ] التغذية الحية تُحدَّث دون إعادة تحميل
- [ ] ملخص GPT-4.1 يُولَّد ويُعرض في أول دخول
- [ ] خريطة الحرارة تعرض نشاط السنة كاملة
- [ ] Guided Tour يعمل في أول دخول بعد Onboarding

---

## المرحلة السادسة (6): القوالب الجاهزة وسجل المحادثات

### الأمر لـ Replit

```
المرحلة 6: القوالب الجاهزة وسجل المحادثات

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
أ. TemplatesPage.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Header: بحث + فلتر حسب التصنيف [الكل][إيميل][تقارير][API][جدولة][تنبيهات]

2. قسم "الأكثر استخداماً" (3 قوالب بارزة)

3. شبكة القوالب:
   كل قالب كبطاقة:
   - عنوان + أيقونة + وصف موجز
   - ⭐ تقييم (X.X) + عدد الاستخدامات
   - عدد الـ nodes + تقدير وقت الإعداد
   - زر "👁 معاينة" → نافذة تعرض المعاينة البصرية للقالب
   - زر "+ استخدام" → يفتح Chat مع رسالة جاهزة للتخصيص

4. زر "💾 حفظ workflow كقالب" (يظهر في صفحة تفاصيل الـ workflow بعد إنشائه)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ب. HistoryPage.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Header: بحث عميق + فلتر [الكل][🟢 إنشاء][🔵 تعديل][🔴 تشخيص][🟡 استفسار] + تصدير + حذف

2. Layout ثنائي العمود:
   العمود الأيسر — قائمة المحادثات:
   - مجمّعة زمنياً: اليوم / أمس / هذا الأسبوع / أقدم
   - كل جلسة: أيقونة نوعها + عنوان ذكي + وقت
   - بحث فوري يعمل أثناء الكتابة (بالنص وليس العنوان فقط)
   - المدير: يرى محادثات الجميع مع فلتر حسب المستخدم

   العمود الأيمن — تفاصيل المحادثة المختارة:
   
   أ. بطاقة ملخص ذكية:
      - النتيجة النهائية
      - النموذج المستخدم + عدد الجولات + الوقت
      - الـ workflow المرتبط (رابط)
   
   ب. Timeline تفاعلي:
      - كل خطوة مع الوقت الدقيق
      - وقفات المراجعة التسلسلية مفصّلة
      - الـ workflow الناتج
   
   ج. الإجراءات:
      - [🔄 إعادة الطلب] → يفتح Chat بنفس الطلب
      - [↩️ مواصلة] → يفتح Chat مع سياق المحادثة
      - [📤 تصدير PDF / JSON]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ج. إحصائيات استخدام الـ Agent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

قسم في نهاية صفحة السجل يعرض:
- إجمالي المحادثات + تصنيفها
- متوسط وقت الإنشاء + متوسط عدد الجولات
- رسم بياني لنشاط المستخدم خلال آخر 30 يوم

النتيجة المطلوبة: 6 قوالب جاهزة تعمل + سجل محادثات كامل مع بحث عميق.
```

### نهاية المرحلة — معايير الاكتمال
- [ ] 6 قوالب جاهزة معروضة مع معاينة بصرية
- [ ] الضغط "استخدام" يفتح Chat مع رسالة تخصيص جاهزة
- [ ] سجل المحادثات يعرض جميع المحادثات مع التصنيف
- [ ] البحث يعمل داخل نص المحادثات
- [ ] تصدير المحادثة كـ PDF يعمل
- [ ] "إعادة الطلب" ينفذ نفس الطلب من جديد

---

## المرحلة السابعة (7): إدارة المستخدمين والإعدادات

### الأمر لـ Replit

```
المرحلة 7: إدارة المستخدمين (Admin Panel) وصفحة الإعدادات

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
أ. users.routes.ts (Backend)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

للمدير فقط:
GET    /api/v1/users           - قائمة المستخدمين مع بيانات النشاط
POST   /api/v1/users           - إنشاء مستخدم جديد
PUT    /api/v1/users/:id       - تعديل مستخدم (اسم، كلمة مرور، نوع الحساب)
DELETE /api/v1/users/:id       - حذف مستخدم (لا يمكن حذف الحساب الخاص)
PUT    /api/v1/users/:id/status - تفعيل / إيقاف مؤقت
PUT    /api/v1/users/:id/permissions - تحديث الصلاحيات العشر
POST   /api/v1/users/:id/reset-password - إعادة تعيين كلمة المرور (تُولَّد تلقائياً)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ب. UsersPage.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Header: عدد المستخدمين + زر "إضافة مستخدم جديد"

2. فلترة: بحث + [الكل][مدير][مستخدم] + [نشط][موقوف]

3. جدول المستخدمين:
   أعمدة: أيقونة نوع | الاسم | النوع | الحالة | آخر دخول | الإجراءات
   الإجراءات: ✏️ تعديل | ⏸️ إيقاف مؤقت | 🗑️ حذف
   المدير لا يمكن حذفه أو إيقافه

4. نافذة إنشاء/تعديل مستخدم:
   - اسم المستخدم + كلمة المرور (مع مؤشر قوة)
   - نوع الحساب: مدير / مستخدم
   - 10 صلاحيات قابلة للتفعيل بـ Toggle switches
   - أزرار "تفعيل الكل" / "إيقاف الكل"
   - زر "إعادة تعيين كلمة المرور" (يُولّد كلمة عشوائية ويعرضها مرة واحدة فقط)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ج. SettingsPage.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3 أقسام:

1. الإعدادات الشخصية (للجميع):
   - تغيير كلمة المرور مع متطلبات القوة
   - اللغة (عربي/إنجليزي) + الوضع (نهاري/ليلي) + حجم الخط + نوع الخط

2. إعدادات n8n (للمدير فقط):
   - حقل URL + API Key (تعديل مع تأكيد)
   - زر "اختبار الاتصال" مع نتيجة فورية

3. مفاتيح الذكاء الاصطناعي (للمدير فقط):
   
   OpenAI:
   - حقل API Key (مُخفى) + زر "تغيير" + تاريخ آخر تحديث
   - زر "🧪 اختبار" → 5 حالات:
     ⬜ لم يُختبر | 🔄 جاري | ✅ صالح (+ رصيد) | ⚠️ رصيد منخفض | ❌ غير صالح
   
   Gemini:
   - نفس بنية OpenAI
   - حالة اختبار مع الحصة اليومية
   
   اختبار النظام الكامل:
   - يختبر الثلاثة معاً
   - يُشغّل جولة تجريبية مصغّرة
   
   منطقة الخطر (حمراء مع تأكيد مزدوج):
   - حذف جميع المحادثات
   - حذف سجل الإصدارات
   - إعادة ضبط المصنع

النتيجة المطلوبة: إدارة المستخدمين كاملة + الإعدادات الكاملة مع اختبار API حي.
```

### نهاية المرحلة — معايير الاكتمال
- [ ] إنشاء مستخدم جديد مع تحديد 10 صلاحيات
- [ ] المستخدم الجديد يسجل دخوله ولا يرى الصفحات التي ليس لها صلاحية
- [ ] إيقاف مستخدم مؤقتاً يمنعه من تسجيل الدخول
- [ ] اختبار مفتاح OpenAI يُظهر الرصيد
- [ ] اختبار مفتاح Gemini يُظهر الحصة اليومية
- [ ] منطقة الخطر تطلب تأكيداً مزدوجاً

---

## المرحلة الثامنة (8): الصقل والتحسينات النهائية

### الأمر لـ Replit

```
المرحلة 8: الصقل والتحسينات النهائية والأمان

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
أ. تجربة المستخدم
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. أضف Skeleton Loading لجميع الصفحات
2. أضف Empty States جميلة مع أيقونات وأزرار CTA
3. أضف Toast notifications (react-hot-toast) لكل العمليات
4. أضف شاشة 404 مخصصة
5. أضف Error Boundary يمنع crash التطبيق عند خطأ
6. أضف تأكيد مزدوج عند الحذف ("هل أنت متأكد؟")
7. أضف Animations بـ Framer Motion لانتقالات الصفحات
8. Responsive design: تأكد من عمل التطبيق على الجوال والتابلت

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ب. الأمان والحماية
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Rate Limiting:
   - /api/v1/auth/login: 10 طلبات/دقيقة لكل IP
   - /api/v1/chat: 30 طلباً/دقيقة للمستخدم الواحد
   - /api/v1/settings: 20 طلباً/دقيقة

2. Helmet.js لجميع Headers الأمنية
3. CORS محدود بالـ domain المسموح
4. Input Validation بـ Zod لجميع الـ endpoints
5. SQL Injection protection (Drizzle ORM يمنعها بالـ prepared statements)
6. XSS: sanitize جميع المدخلات قبل تخزينها
7. Audit Log لجميع العمليات الحساسة

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ج. الأداء
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Redis Cache لنتائج Dashboard (30 ثانية)
2. Redis Cache للملخص اليومي من GPT-4.1 (12 ساعة)
3. Pagination لجميع القوائم الطويلة
4. Lazy loading للصفحات غير الأساسية
5. تحسين الـ Vite build للإنتاج

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
د. معالجة حالات الخطأ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

جميع حالات الخطأ المذكورة في الدراسة:
1. انقطاع الاتصال بـ n8n → وضع القراءة فقط من Cache
2. انتهاء صلاحية API Keys → رسائل تشخيص مفصلة مع رابط الإعدادات
3. استجابة بطيئة > 45 ثانية → إشعار مع خيار الإلغاء
4. فشل JSON Validation → إعادة محاولة تلقائية مع تقرير الخطأ
5. رفض n8n للـ workflow → رسالة شرح مع خيار الحفظ كمسودة
6. قائمة انتظار ممتلئة → مكان الطلب في الصف مع الوقت المتوقع

النتيجة المطلوبة: تطبيق مصقول ومحمي جاهز للاستخدام الفعلي.
```

---

## مرحلة الاختبار النهائي الشامل (الأخيرة)

### الأمر لـ Replit

```
مرحلة الاختبار النهائي الشامل: تأكيد جاهزية التطبيق للإنتاج

ابنِ واشغّل الاختبارات التالية وأصلح كل ما يفشل:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. اختبارات الوحدة (Jest)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

tests/unit/jsonValidator.test.ts:
  ✅ يقبل workflow صالح
  ✅ يرفض workflow بدون nodes
  ✅ يكتشف node بدون UUID
  ✅ يكتشف connections خاطئة
  ✅ يُحذّر من غياب Error Handler

tests/unit/encryption.test.ts:
  ✅ يُشفّر ويُفكّ تشفير بنجاح
  ✅ IV مختلف في كل عملية
  ✅ يفشل عند تعديل البيانات المشفرة

tests/unit/password.test.ts:
  ✅ يرفض كلمات المرور القصيرة
  ✅ يرفض "123456" والكلمات الشائعة
  ✅ يقبل كلمة مرور قوية
  ✅ bcrypt hash صحيح

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. اختبارات التكامل (Jest + Supertest)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

tests/integration/auth.test.ts:
  ✅ تسجيل دخول ناجح يُرجع Token
  ✅ كلمة مرور خاطئة → 401
  ✅ 5 محاولات فاشلة → 423 (Locked)
  ✅ Refresh Token يُجدّد Access Token
  ✅ Access Token منتهي → 401
  ✅ force_password_change → يُرجع requiresPasswordChange: true

tests/integration/workflows.test.ts:
  ✅ جلب الـ workflows يتطلب Auth
  ✅ مستخدم بدون صلاحية Workflows → 403
  ✅ تفعيل workflow يُحدّث n8n فعلاً
  ✅ حذف workflow يُحذفه من n8n فعلاً

tests/integration/settings.test.ts:
  ✅ حفظ n8n credentials يُشفّرها في DB
  ✅ اختبار n8n connection يُرجع النتيجة الصحيحة
  ✅ مستخدم عادي لا يستطيع تغيير API Keys → 403

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. اختبارات E2E (Playwright)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

tests/e2e/fullWorkflow.test.ts:

سيناريو 1: تدفق المدير الكامل
  ✅ فتح التطبيق → تسجيل دخول بـ (مدير/Admin@2026)
  ✅ Dashboard يظهر مع بيانات حقيقية
  ✅ فتح Chat → إرسال "أنشئ workflow يرسل إيميل كل يوم"
  ✅ شريط التقدم الرباعي يظهر ويكتمل
  ✅ تقرير الجودة يظهر
  ✅ الضغط "إرسال لـ n8n" → تأكيد النجاح
  ✅ التحقق من وجود الـ workflow في صفحة Workflows

سيناريو 2: إدارة المستخدمين
  ✅ فتح صفحة المستخدمين
  ✅ إنشاء مستخدم "سارة" مع صلاحية Chat فقط
  ✅ تسجيل خروج + تسجيل دخول بحساب "سارة"
  ✅ سارة ترى Chat فقط في الـ Sidebar
  ✅ محاولة الوصول لـ /users → تحويل لـ Dashboard

سيناريو 3: وضع الليلي واللغة
  ✅ تبديل الوضع للليلي → التطبيق يتحول
  ✅ إعادة تحميل الصفحة → الوضع الليلي محفوظ
  ✅ تبديل اللغة للإنجليزية → كل النصوص تتحول
  ✅ الـ Sidebar يتحول لـ LTR
  ✅ إعادة تحميل → اللغة محفوظة

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. الاختبار اليدوي الشامل (Checklist)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

بعد تشغيل جميع الاختبارات التلقائية، تحقق يدوياً من:

المصادقة:
  ☐ تسجيل الدخول بالحساب الافتراضي (مدير/123456)
  ☐ إجبار تغيير كلمة المرور يعمل ولا يمكن تخطيه
  ☐ قفل الحساب بعد 5 محاولات خاطئة
  ☐ "تذكرني 7 أيام" يحفظ الجلسة

لوحة التحكم:
  ☐ 4 بطاقات KPI تعرض أرقاماً حقيقية
  ☐ الرسم البياني يعمل مع فلتر الوقت
  ☐ التغذية الحية تُحدَّث
  ☐ ملخص GPT-4.1 يظهر ويصف الوضع الحالي
  ☐ خريطة الحرارة تعرض نشاط السنة

المحادثة والإنشاء:
  ☐ طلب بسيط → workflow يُنشأ ويُرسَل لـ n8n
  ☐ وضع المبتدئ: أسئلة توضيحية تظهر
  ☐ وضع الخبير: البناء مباشرة بدون أسئلة
  ☐ رفع JSON معطوب → الـ Agent يُعطي خطأ واضح
  ☐ رفع صورة خطأ n8n → الـ Agent يُشخّص

الـ Workflows:
  ☐ Card View و List View يعملان
  ☐ تفعيل/إيقاف workflow يؤثر فعلاً على n8n
  ☐ سجل التنفيذات يعرض الأخطاء
  ☐ زر "تشخيص فوري" يفتح Chat مع بيانات الخطأ
  ☐ Diff View بين إصدارين يعمل
  ☐ استعادة إصدار قديم تعمل

القوالب:
  ☐ 6 قوالب معروضة مع معاينة بصرية
  ☐ الضغط "استخدام" يفتح Chat مع رسالة جاهزة

السجل:
  ☐ جميع المحادثات مُصنّفة بالتصنيف الصحيح
  ☐ البحث داخل نص المحادثات يعمل
  ☐ تصدير محادثة كـ PDF

إدارة المستخدمين:
  ☐ إنشاء مستخدم جديد مع صلاحيات مخصصة
  ☐ الصلاحيات تُطبَّق على الـ Frontend والـ Backend
  ☐ إيقاف مستخدم يمنعه من الدخول

الإعدادات:
  ☐ اختبار مفاتيح API يعمل مع نتائج حقيقية
  ☐ منطقة الخطر تطلب تأكيداً مزدوجاً

الأمان:
  ☐ مفاتيح API لا تظهر في أي response من الـ Backend
  ☐ Rate Limiting يمنع تجاوز الحد
  ☐ مستخدم بدون صلاحية لا يستطيع الوصول للـ endpoint

أصلح كل ما يفشل قبل الانتقال للنشر على VPS.
```

---

## قواعد عامة مهمة لكل مرحلة

```
1. اكتب TypeScript بدقة — لا any، لا ts-ignore

2. كل function لها:
   - اسم واضح يصف وظيفتها
   - معالجة خطأ صريحة (try/catch مع رسائل واضحة)
   - JSDoc comment إذا كانت معقدة

3. كل API endpoint يُرجع:
   نجاح: { success: true, data: {...} }
   خطأ:  { success: false, error: { code: "ERROR_CODE", message: "..." } }

4. استخدم الألوان من نظام الألوان المحدد حصراً — لا تضف ألواناً جديدة

5. كل صفحة تدعم اللغتين كاملاً (ar.json + en.json)

6. لا تُبسّط أي ميزة من الدراسة — نفّذها كاملاً كما هي موصوفة

7. بعد انتهاء كل مرحلة، تحقق من معايير الاكتمال قبل الانتقال للتالية
```

---

*هذا الملف مرجع تنفيذي كامل مبني على دراسة `N8N_AI_Agent_Manager_v1.md`*
*المرجع الرئيسي: `docs/N8N_AI_Agent_Manager_v1.md`*
