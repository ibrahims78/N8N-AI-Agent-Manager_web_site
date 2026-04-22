# تحسينات صفحة «كتالوج عقد n8n» (Nodes Catalog)

> الإصدار: 2.0 — التاريخ: 2026-04-22
> الملف الرئيسي: `artifacts/n8n-manager/src/pages/nodes-catalog.tsx`
> ملفات داعمة:
> - `artifacts/n8n-manager/src/components/docs/AdvancedDocsTools.tsx` (Operations / History / Manual editor / Workflow JSON)
> - `artifacts/n8n-manager/src/components/docs/GlobalDocsSearch.tsx` (بحث BM25 الذكي)
> - `artifacts/n8n-manager/src/components/docs/SyncSettingsCard.tsx` (المزامنة + التصدير)
> - `artifacts/api-server/src/routes/catalogDocs.routes.ts` و `docsAdvanced.routes.ts`

---

## 1) الهدف من التحديث

الصفحة الجديدة هدفها أن تكون **مرجعاً احترافياً واحداً** لكل عقد n8n مع كل احتياجات فريق المنتج والمحرّر:
- ظهور احترافي ومتناسق مع باقي الصفحات (نفس لغة التصميم المستخدمة في صفحة الأدلة).
- ظهور صحيح لجميع البطاقات والإحصاءات.
- جلب بيانات صحيح وموثوق مع شارات صحّة (EN/AR/Auth/Examples) على كل بطاقة.
- جميع الأزرار تعمل (التحديث، الجلب، الترجمة، التصدير، التحرير، الاستعادة).
- بحث ذكي (BM25) في **محتوى** التوثيقات + فلترة سريعة منفصلة.
- تصدير سليم (HTML/Markdown) إلى ملفات قابلة للتنزيل.
- ملف مصدر منظّم، خالٍ من الاستيرادات والمتغيّرات غير المستخدمة، مع تعليقات احترافية.
- مزامنة دورية تعمل (إعدادات + تشغيل فوري + معاينة آخر تشغيل).

---

## 2) ملخّص التغييرات على الواجهة

### أ) ترويسة Hero احترافية (Hero Header)
استُبدل العنوان البسيط بـ ترويسة بتدرّج لوني خفيف وأيقونة مميَّزة، مع:
- وصف موجز ومهنيّ يشرح ماهية الكتالوج وما يوفّره (الترجمة، العمليات الفرعية، الإصدارات، التحرير اليدوي، المزامنة).
- شارة «آخر مزامنة» بتاريخ كامل.
- **شريط 4 بطاقات إحصاء** مرئية لكل المستخدمين (وليس فقط الأدمن):
  | البطاقة | المحتوى |
  |---|---|
  | إجمالي العقد | عدّاد كبير + لون التمييز |
  | تغطية التوثيق EN | عدد + شريط نسبة + النسبة % |
  | ترجمة AR | عدد + شريط نسبة + النسبة % |
  | الملفات المحلية | EN + AR مع تفصيلهما |

### ب) فصل واضح بين البحثَين
كان في الصفحة شريطا بحث متجاوران دون تمييز. الآن لكلٍّ بطاقة مستقلّة بعنوان وأيقونة:
1. **بحث ذكي في محتوى التوثيقات** (`GlobalDocsSearch`) — BM25 على الخادم، يبحث داخل نصّ كل التوثيقات المخزَّنة (EN أو AR)، يعرض درجة الترتيب ومقطعاً نصّياً، وعند اختيار نتيجة يضع `nodeType` في فلتر الكتالوج.
2. **تصفية الكتالوج** — يبحث في الاسم، الفئة، الاسم البديل، مع شارات الفئات وزرّ مسح فوري ومرشِّح نوع (محفّز / عادي / الكل).

كلّ شريط له أيقونة وعنوان داخلي وشرح مختصر، مع زرّ مسح مدمج.

### جـ) عدّاد نتائج وتحكم في الفلاتر
- يُعرض «عرض X من إجمالي Y عقدة» مع تفعيل مسح فوري للمرشحات إذا كان أيٌّ منها مفعَّلاً.
- مؤشّر الصفحة الحالية + الإجمالي يَظهر بجانب العدّاد، تكراراً عند الأسفل لسهولة التنقّل.

### د) Skeleton loading احترافي
بدل دوّامة تحميل واحدة، تَظهر الآن **6 بطاقات هيكلية متحرّكة** مطابقة لشكل البطاقة الفعلي → تجربة تحميل مهنيّة بلا قفز في الصفحة.

### هـ) بطاقات العقد (NodeCard)
- تأثير hover ثلاثي: تغيّر لون الحدّ + ظلّ + رفع طفيف للأعلى (`-translate-y-0.5`).
- focus ring واضح عند التنقّل بلوحة المفاتيح + `aria-label` للوصولية.
- شارات الصحّة (EN موثّقة، AR مترجمة، Examples، Auth) مرتّبة بألوان معبّرة ومتسقة.

### و) حالة فارغة احترافية
عند عدم وجود نتائج: بطاقة كبيرة بأيقونة بحث، عنوان واضح، نصّ مساعد، وزرّ «مسح المرشحات» مباشر.

### ز) لوحة Docs Viewer (داخل تفاصيل العقدة)
- شارات وأزرار العمليات (نسخ، إصدارات، تحرير، Workflow JSON، تحديث) منظَّمة في شريط واحد.
- تنسيق Markdown احترافي (مطابق لمعايير صفحة الأدلة):
  - عناوين بحدود سفلية وفاصل واضح بين المستويات.
  - روابط بلون التمييز مع underline عند المرور.
  - أكواد بخلفية وحدود.
  - اقتباسات بحدّ ملوّن وخلفية خفيفة.
  - جداول بحدود ورؤوس مظلَّلة.
  - صور بحدود وزوايا منحنية مع `loading="lazy"`.
- في العربية: `line-height: 1.85` وحجم خط 15px لقراءة مريحة.

---

## 3) الميزات والتحقّق من عملها

### ✅ بطاقات الإحصاء (Stats Cards)
- 4 بطاقات في الترويسة (لكل مستخدم) + 4 بطاقات تفصيلية في لوحة الأدمن.
- مصدر البيانات: `GET /catalog/docs/stats` و `GET /catalog/status`.
- تتضمّن: إجمالي العقد، EN موثّقة، AR مترجمة، ملفات محلية، نسب مئوية وأشرطة تقدّم.

### ✅ جلب البيانات (Data Fetching)
- استعلامات `react-query` بكاش ذكي وإلغاء فوري عند تغيّر المرشحات:
  - `/catalog?search=&category=&trigger=&limit=&offset=`
  - `/catalog/categories`
  - `/catalog/status`
  - `/catalog/docs/stats`
  - `/catalog/docs/coverage`
- زرّ Reset Filters يُعيد الكلّ ويُلغي أي debounce معلَّق.

### ✅ الأزرار وتعمل بشكل صحيح
| الزرّ | الإجراء | المسار |
|---|---|---|
| تحديث قائمة العقد | يجلب أحدث قائمة من مستودع n8n | `POST /catalog/refresh` |
| جلب التوثيقات (SSE) | يجلب EN لكل العقد ويبثّ تقدّماً مباشراً | `POST /catalog/docs/fetch-all-stream` |
| ترجمة الكل (SSE) | يترجم EN → AR لكل العقد | `POST /catalog/docs/translate-all-stream` |
| Stop | يلغي عملية SSE فوراً | عبر `AbortController` |
| Refresh دليل واحد | يعيد جلب EN/AR لعقدة محدّدة | `POST /catalog/docs/:nodeType/refresh` |
| تحرير يدوي | يحفظ نسخة محرَّرة منفصلة | `PUT /catalog/docs-advanced/:nt/manual` |
| مسح التحرير | يعود للنسخة الآلية | `DELETE /catalog/docs-advanced/:nt/manual` |
| استعادة إصدار | يستعيد نسخة من السجل كتحرير يدوي | `POST /catalog/docs-advanced/history/:id/rollback` |
| نسخ JSON | ينسخ workflow JSON من التوثيق | `navigator.clipboard.writeText` |

### ✅ ميزة البحث (Search)
- **ذكي (BM25)**: `GET /catalog/docs-advanced/search?q=&lang=&limit=`
  - يبحث داخل نصّ كل التوثيقات.
  - يُرجع `score, sectionTitle, sectionPath, snippet, nodeType, language`.
  - debounce 250ms، يتجاهل الاستعلامات الفارغة.
- **فلتر الكتالوج**: محلّي على القائمة المُحمَّلة + استعلام للسيرفر مع مرشحات `category` و `trigger`.

### ✅ التصدير (Export)
في `SyncSettingsCard`:
- **HTML عربي** (للطباعة → PDF): `GET /catalog/docs-advanced/export.html?lang=ar`
- **HTML إنجليزي**: `GET /catalog/docs-advanced/export.html?lang=en`
- **Markdown مجمَّع**: `GET /catalog/docs-advanced/export.md?lang=ar|en`
- يُستخدم `fetch + Blob + URL.createObjectURL` لإجبار تنزيل ملف بإسم تلقائي بصيغة `n8n-docs-<lang>-<YYYY-MM-DD>.<ext>`.
- يحمل ترويسة `Authorization` تلقائياً لجلسة المستخدم.

### ✅ المزامنة الدورية (Auto-Sync)
- `GET /catalog/docs-advanced/sync` — تحميل الإعدادات.
- `PUT /catalog/docs-advanced/sync` — حفظ تفعيل/فاصل ساعات/ترجمة تلقائية.
- `POST /catalog/docs-advanced/sync/run` — تشغيل فوري.
- `POST /catalog/docs-advanced/reindex` — إعادة بناء فهرس BM25.
- يَظهر آخر تشغيل + ملخّصه (changed/fetched/translated) + موعد التشغيل التالي.

### ✅ ملف المصدر احترافي
- ترويسة JSDoc في أعلى الملف تشرح كل الأقسام.
- إزالة الاستيرادات والمتغيّرات غير المستخدمة (`pct`, `refetchStats`, `refetchCoverage`).
- تقسيم منطقي مع تعليقات عناوين بين الأقسام.
- استخراج بطاقة `HeroStat` كمكوّن مستقلّ قابل لإعادة الاستخدام.
- جميع الروابط الخارجية تستخدم `target="_blank" rel="noreferrer"`.
- تحويل تلقائي لروابط GitHub raw → blob ليفتح المصدر بشكل صحيح.

---

## 4) واجهات API المستخدمة

### كتالوج العقد
- `GET /api/catalog?search&category&trigger&limit&offset`
- `GET /api/catalog/categories`
- `GET /api/catalog/status`
- `GET /api/catalog/lookup/:nodeType`
- `POST /api/catalog/refresh` (admin)

### توثيق العقد
- `GET /api/catalog/docs/stats`
- `GET /api/catalog/docs/coverage`
- `GET /api/catalog/docs/:nodeType?lang=&force=`
- `POST /api/catalog/docs/:nodeType/refresh?lang=` (admin)
- `POST /api/catalog/docs/fetch-all-stream` (admin, SSE)
- `POST /api/catalog/docs/translate-all-stream` (admin, SSE)

### الميزات المتقدّمة
- `GET /api/catalog/docs-advanced/search?q&lang&limit`
- `POST /api/catalog/docs-advanced/reindex` (admin)
- `GET /api/catalog/docs-advanced/:nodeType/operations?lang=`
- `GET /api/catalog/docs-advanced/:nodeType/history?lang=`
- `GET /api/catalog/docs-advanced/history/:id`
- `POST /api/catalog/docs-advanced/history/:id/rollback` (admin)
- `PUT /api/catalog/docs-advanced/:nodeType/manual?lang=` (admin)
- `DELETE /api/catalog/docs-advanced/:nodeType/manual?lang=` (admin)
- `GET /api/catalog/docs-advanced/sync` / `PUT` / `POST .../run` (admin للكتابة)
- `GET /api/catalog/docs-advanced/export.html?lang=`
- `GET /api/catalog/docs-advanced/export.md?lang=`

---

## 5) الصلاحيات

| العملية | مستخدم عادي | أدمن |
|---|:---:|:---:|
| تصفّح الكتالوج والبحث | ✅ | ✅ |
| فتح تفاصيل عقدة + قراءة EN/AR | ✅ | ✅ |
| استعراض الإصدارات + معاينة | ✅ | ✅ |
| تنزيل التصدير (HTML/MD) | ✅ | ✅ |
| تحديث قائمة العقد | ❌ | ✅ |
| جلب/ترجمة جماعية SSE | ❌ | ✅ |
| تحديث دليل واحد | ❌ | ✅ |
| تحرير يدوي + مسح | ❌ | ✅ |
| استعادة إصدار | ❌ | ✅ |
| تعديل المزامنة + تشغيلها | ❌ | ✅ |
| إعادة بناء فهرس البحث | ❌ | ✅ |

كل المسارات محميّة بـ `authenticate`، والإدارية بـ `requireAdmin` على الخادم.

---

## 6) سيناريو اختبار سريع

1. **تسجيل الدخول كأدمن** (`admin / 123456`).
2. الانتقال إلى صفحة الكتالوج → التأكد من ظهور الـ 4 بطاقات الإحصائية أعلى الصفحة بأرقام صحيحة.
3. كتابة كلمة في **البحث الذكي** (مثل `webhook`) → تَظهر نتائج مرتّبة مع snippets؛ الضغط على نتيجة يضع اسم العقدة في فلتر الكتالوج.
4. اختيار فئة من الشارات → الشبكة تتحدّث؛ زرّ Reset Filters يَظهر ويُعيد الحالة الأصلية.
5. فتح بطاقة عقدة → التحقّق من تبويبات المعلومات والأمثلة والتوثيق.
6. في تبويب التوثيق: تبديل EN ↔ ع، فتح Operations / Versions / Workflow JSON.
7. فتح المحرّر اليدوي → تعديل سطر → حفظ → التأكد من ظهور النقطة البرتقالية على زرّ Edit وأنّ التغيير ظاهر بعد إغلاق الحوار.
8. فتح لوحة الأدمن من أعلى الصفحة:
   - زرّ **تحديث قائمة العقد** → ينجح ويُحدّث «إجمالي العقد».
   - زرّ **جلب التوثيقات** → يَظهر شريط تقدّم فوري مع اسم العقدة الحالي.
   - زرّ **ترجمة الكل** → نفس السلوك (يحتاج مفتاح AI).
9. في **بطاقة المزامنة**: تبديل تفعيل/فاصل ساعات → يحفظ ويعرض موعد التشغيل التالي.
10. الضغط على «كتاب عربي» / «كتاب إنجليزي» / «.md» → يُنزَّل ملف باسم صحيح ومحتوى كامل.

---

## 7) ملفات تغيّرت في هذا التحديث

- ✏️ `artifacts/n8n-manager/src/pages/nodes-catalog.tsx`
  - ترويسة JSDoc جديدة.
  - إزالة الاستيرادات والمتغيّرات غير المستخدمة.
  - مكوّن `HeroStat` جديد + 4 بطاقات إحصاء في الترويسة.
  - فصل واضح بين بحث BM25 وفلتر الكتالوج (بطاقتان منفصلتان بعنوانين).
  - عدّاد نتائج + Reset Filters + مؤشّر صفحة.
  - Skeleton loading.
  - حالة فارغة احترافية.
  - تأثيرات NodeCard المحسَّنة (hover/focus/aria).
  - تنسيق Markdown احترافي في DocsViewer + RTL محسَّن للعربية.
- 🆕 `docs/NODES_CATALOG_IMPROVEMENTS_AR.md` — هذا الملف.

> الـ Backend لم يحتج تعديلات لأنّ كل النقاط المطلوبة موجودة وتعمل: stats, coverage, search BM25, fetch/translate SSE, manual override, history + rollback, sync, export HTML/MD, reindex.

---

## 8) ملاحظة عملية

- ميزات **الترجمة الآلية** و**المزامنة مع ترجمة تلقائية** تتطلّب تكامل ذكاء اصطناعي مكوَّن (OpenAI/Anthropic/Gemini). إذا لم يكن مهيَّأً ستفشل تلك العمليات بالرسالة: «لا يوجد مفتاح AI متوفر». باقي الميزات (الجلب الإنجليزي، البحث، التحرير اليدوي، الإصدارات، التصدير، المزامنة) تعمل بدون أي إعداد إضافي.
- ملفات التوثيق المحلّية تُحفظ في `lib/n8n-nodes-catalog/docs/<lang>/<nodeType>.md` لإمكانية الوصول دون اتصال ولاسترداد سريع.
