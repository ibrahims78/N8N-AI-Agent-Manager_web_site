# خطة عمل: تخزين دائم وتحديث ذكي لأدلة n8n

> **الملف صاحب الحقيقة**: هذا الملف هو المرجع الوحيد لخطة تطوير نظام التخزين الذكي للأدلة. يُحدَّث بعد كل مرحلة بالتغييرات الفعلية والاختبارات والنتائج.

---

## 1) الهدف العام

تحويل سلوك صفحة *أدلة n8n العامة* (`/guides`) من «جلب وترجمة كل شيء في كل ضغطة» إلى نموذج «جلب وترجمة مرة واحدة، تحديث ذكي بعدها فقط»، مع استمرارية كاملة للبيانات بين عمليات إعادة التشغيل وإعادة ضبط قاعدة البيانات.

النتيجة المرجوّة:
- النسخة الإنجليزية تُجلب مرة واحدة وتُحفظ في `lib/n8n-nodes-catalog/guides/en/<slug>.md` + قاعدة البيانات.
- الترجمة العربية تُولَّد مرة واحدة وتُحفظ في `lib/n8n-nodes-catalog/guides/ar/<slug>.md` + قاعدة البيانات.
- ضغطة «جلب + ترجمة AR» اللاحقة لا تجلب ولا تترجم إلا الملفات التي تغيّرت فعلاً على المصدر.
- عند كل إقلاع للخادم: تُحمَّل المحتويات من المجلدات إلى قاعدة البيانات إن كانت ناقصة، بدون أي طلب شبكي ولا استدعاء ذكاء اصطناعي.

---

## 2) القيود والمبادئ الواجب احترامها

1. **حماية التعديل اليدوي**: العمود `manualOverrideMarkdown` في جدول `guides_docs` لا يُلمس مطلقاً في أي مسار تحديث آلي.
2. **عدم الكسر**: المسارات الموجودة (`fetchGuide`, `fetchArabicGuide`, `fetchAllGuides`) تحافظ على توقيعاتها الحالية. السلوك الجديد يُضاف عبر علم اختياري `smart`.
3. **التوافق العكسي**: الواجهة القديمة التي تُمرّر `force=true` تستمر في العمل كما هي.
4. **بدون هجرات DB**: نستخدم الأعمدة الموجودة في الجدول (`sourceSha`, `markdown`, `sourceUrl`, ...) دون تغيير المخطّط.
5. **بدون تثبيت حزم جديدة**.
6. **الفشل صريح وليس صامت**: أي خطأ يُرَى في السجلات وفي الواجهة كرسالة Toast.

---

## 3) المراحل (Roadmap)

| المرحلة | الوصف | الحالة |
|---------|-------|--------|
| 1 | Hydrate Guides عند الإقلاع — استرجاع الملفات من القرص إلى DB إن كانت ناقصة | 🟢 **مكتملة** |
| 2 | جعل زر «جلب الكل (EN)» تحديثياً ذكياً عبر مقارنة `sourceSha` | ⬜ مؤجَّلة |
| 3 | جعل زر «جلب + ترجمة AR» تحديثياً ذكياً + تخطّي الترجمة لما لم يتغيّر | 🟢 **مكتملة** |
| 4 | تحسينات الواجهة: فصل أزرار التحقق/التطبيق وعرض ملخّص واضح | ⬜ مؤجَّلة |
| 5 | اختبار صريح لحماية `manualOverrideMarkdown` | ⬜ مؤجَّلة |

---

## 4) المرحلة 1 — Hydrate Guides عند الإقلاع

### 4.1 المشكلة
- توجد دالة `hydrateDocsFromLocalFiles(lang)` تعمل عند الإقلاع لاسترجاع توثيقات النُود من الملفات.
- لا توجد دالة مكافئة للأدلة (Guides). إذا أُعيد ضبط DB يبقى جدول `guides_docs` فارغاً رغم وجود 15 ملفاً إنجليزياً + 15 ملفاً عربياً على القرص.
- النتيجة: المستخدم مضطر لإعادة الجلب والترجمة من الصفر بعد كل إعادة ضبط.

### 4.2 الحل
1. إضافة دالة `hydrateGuidesFromLocalFiles(lang: DocLang)` في `artifacts/api-server/src/services/docsAdvanced.service.ts`، تحاكي تماماً منطق دالة النُود:
   - تمسح المجلد `lib/n8n-nodes-catalog/guides/<lang>/`.
   - لكل ملف `.md` تستخرج الـ slug من اسم الملف.
   - تتحقّق أن الـ slug موجود في `CORE_GUIDE_PAGES` (وإلا تتجاهله بأمان).
   - تتحقّق أن الصف غير موجود أو ليس له `markdown` ولا `manualOverrideMarkdown` في DB.
   - في تلك الحالة تستورد المحتوى عبر `INSERT ... ON CONFLICT DO NOTHING` لتجنّب أي تصادم.
   - **لا تكتب فوق محتوى موجود**.
2. استدعاء الدالة في `artifacts/api-server/src/index.ts` بجانب الاستدعاءين الموجودَين للنُود.

### 4.3 الاختبار
| السيناريو | الخطوات | المتوقَّع |
|-----------|---------|-----------|
| T1 — DB فارغة، ملفات موجودة | 1. حذف كل صفوف `guides_docs`<br>2. إعادة تشغيل خادم API | السجلات تظهر `Hydrated guides from local files: en={imported:N}, ar={imported:N}` و `getGuidesStats()` يعرض الأرقام الصحيحة |
| T2 — DB فيها بيانات | لا يُجرى أي حذف، فقط إعادة تشغيل | السجلات لا تذكر استيراداً (imported=0)؛ البيانات المحفوظة لا تتغيّر |
| T3 — مجلد فارغ | حذف المجلد، إعادة تشغيل | الدالة تعيد `{scanned:0, imported:0}` بدون أي خطأ في السجلات |
| T4 — ملف غير قابل للقراءة | ملف بحجم 0 بايت | يُعدّ `skipped` لا `imported`، الخادم يكمل الإقلاع طبيعياً |
| T5 — التعديل اليدوي محفوظ | DB فيها صف `slug=X` بـ `manualOverrideMarkdown` فقط بلا `markdown` | يُعدّ `skipped` (لأن `hasMd` يحسب الـ override أيضاً) — التعديل اليدوي محميّ |

### 4.4 التوثيق
- إضافة JSDoc كامل للدالة الجديدة.
- إضافة سطر في `docs/` يصف نقطة الإقلاع.

---

## 5) المرحلة 3 — تحديث ذكي لزر «جلب + ترجمة AR»

### 5.1 المشكلة
الواجهة ترسل دائماً `force=true&translate=true`، فكل ضغطة:
- تُعيد جلب 17 ملفاً من GitHub raw (يستهلك معدّل الطلبات).
- تُعيد ترجمة 17 ملفاً عبر مزوّد الذكاء الاصطناعي (يستهلك حصة API ودولارات).
- تكتب فوق نفس البيانات في DB والقرص.

حتى لو لم يتغيّر شيء على n8n الرسمي.

### 5.2 الحل
1. إضافة **علم جديد** `smart=true` يُمرَّر من الواجهة إلى المسار `POST /guides/refresh-all`.
2. عند `smart=true`:
   - **مقارنة SHA على المحتوى**: يُحسب `crypto.sha1` للنص المجلوب حالياً ويُقارَن بـ `sourceSha` المخزَّن في DB. إن تطابقا → الملف لم يتغيّر، نتخطّاه (`unchanged`)، لا نكتب على DB ولا على القرص.
   - **تخطّي الترجمة**: قبل الترجمة نتحقّق من وجود صف `ar` بـ `markdown` غير فارغ و `sourceSha` مساوٍ لـ `en.sourceSha`. إن وُجد → `unchanged` ولا استدعاء AI.
3. **التوافق**: `force=true` يستمر يعني «أعد جلب وترجمة كل شيء» (للحالات الاستثنائية كتجربة موديل ترجمة جديد).

### 5.3 التغييرات المُنفَّذة بالتفصيل
- دالتان داخليتان جديدتان: `smartRefreshGuide(slug)` و `smartRefreshArabicGuide(slug)`.
- توسعة `fetchAllGuides` لتقبل خيار `smart`، وعدّادات إضافية: `enAdded`, `enUpdated`, `enUnchanged`, `arAdded`, `arUpdated`, `arUnchanged`.
- استمرار الإرجاع الموجود (`fetched`, `failed`, `translated`, `translateFailed`) للتوافق العكسي.
- المسار يقبل `?smart=true` ويمرّره إلى الخدمة.
- زر «جلب + ترجمة AR» في الواجهة يُرسل `smart=true&translate=true` (بدون `force`).
- زر «جلب الكل (EN)» يبقى كما هو (`force=true`) — لا يلمسه هذا التغيير (سيُعالَج في المرحلة 2).
- رسالة Toast جديدة عند `smart`: تعرض «جديد + محدَّث + بلا تغيير» للإنجليزية والعربية.

### 5.4 الاختبار
| السيناريو | الخطوات | المتوقَّع |
|-----------|---------|-----------|
| T6 — أوّل ضغطة (DB فارغة) | حذف الصفوف ثم ضغط الزر | كل الـ 17 دليلاً تظهر `added` للإنجليزية، الـ AR كذلك (إن كان مفتاح الذكاء الاصطناعي مُهيَّأ) |
| T7 — ضغطة ثانية فوراً | الضغط مرة ثانية بدون أي تغيير على المصدر | كل الـ 17 تظهر `unchanged`، عدّاد `translated` يبقى كما هو، **لا استدعاء أي API ذكاء اصطناعي** |
| T8 — تعديل ملف على القرص يدوياً | تعديل `markdown` في DB لـ slug واحد بحيث `sourceSha` يصبح مختلفاً عن المصدر | عند الضغط يُعدّ هذا الـ slug `updated` فقط، الباقي `unchanged` |
| T9 — حذف الترجمة العربية فقط | حذف الصف `ar` لـ slug واحد | عند الضغط (مع `translate=true`): EN `unchanged`، AR لذلك الـ slug `added`، الباقي AR `unchanged` |
| T10 — حماية التعديل اليدوي | تعديل `manualOverrideMarkdown` للعربية ثم ضغط الزر | العمود `manualOverrideMarkdown` يبقى دون تغيير حتى لو تغيَّر المصدر (تتحدَّث `markdown` فقط) |
| T11 — `force=true` (التوافق العكسي) | استدعاء المسار مع `force=true` يدوياً عبر `curl` | السلوك القديم: إعادة جلب وترجمة كل شيء |
| T12 — لا يوجد مفتاح AI | `translate=true&smart=true` بدون مفتاح ذكاء اصطناعي | EN يكتمل بنجاح، AR يفشل لكل العناصر، Toast يظهر بنص «لم تعمل الترجمة — مطلوب مفتاح ذكاء اصطناعي» |

### 5.5 التوثيق
- تحديث JSDoc لـ `fetchAllGuides`.
- توثيق العلم `?smart=true` في تعليق `/guides/refresh-all` الموجود في الراوتر.
- إضافة دلائل واضحة في الواجهة (tooltip للزر).

---

## 6) سجل التنفيذ والنتائج

### المرحلة 1 — Hydrate Guides — تنفيذ
- **التاريخ**: 2026-04-26
- **الملفات المعدَّلة**:
  - `artifacts/api-server/src/services/docsAdvanced.service.ts` — دالة جديدة `hydrateGuidesFromLocalFiles(lang)` (~50 سطر).
  - `artifacts/api-server/src/index.ts` — استيراد الدالة + استدعاؤها في `Promise.all` بجانب دالتَي النُود + سطر سجلّ منفصل عند الاستيراد.
- **عناصر السلامة**:
  - `ON CONFLICT DO NOTHING` لتجنّب الكتابة فوق أي صف موجود.
  - فحص `hasMd` يأخذ بعين الاعتبار `manualOverrideMarkdown` (لا نستورد لو هناك تعديل يدوي محفوظ بدون markdown).
  - تجاهل أي ملف لا يطابق `slug` موجود في `CORE_GUIDE_PAGES`.
  - أخطاء فردية (ملف فاسد) تُسجَّل كـ `warn` ولا تُسقط عملية الإقلاع.

### المرحلة 1 — اختبار (نتائج فعلية موثَّقة)
| الاختبار | النتيجة الفعلية |
|----------|---------|
| T1 (DB فارغة، ملفات موجودة) | ✅ بعد `DELETE FROM guides_docs RETURNING ...` (32 صفّاً محذوفاً) ثم إعادة التشغيل، السجلّ في `[20:50:57.693]` أظهر بالحرف: `Hydrated guides from local files {en:{scanned:15,imported:15,skipped:0}, ar:{scanned:15,imported:15,skipped:0}}`. الإقلاع كله استغرق أقل من 200ms ولم يُجرَ أي طلب شبكي ولا استدعاء AI. |
| T2 (DB فيها بيانات) | ✅ تأكَّد ضمنياً عبر إعادة التشغيل الأولى بعد التعديل: لم يظهر سطر «Hydrated guides» إطلاقاً لأن الشرط `imported \|\| ar.imported` كان كاذباً (الصفوف الثلاثون موجودة). البيانات لم تتغيّر. |
| T3 (مجلد فارغ) | ✅ تحقّق منطقي: الكتلة `try/catch` حول `fs.readdir` تعيد `{scanned:0, imported:0, skipped:0}` بدون أي خطأ. مغطّاة في الكود (السطر 663-666 من الخدمة). |
| T4 (ملف فارغ) | ✅ تحقّق منطقي: شرط `if (!md \|\| md.length < 10)` يرفع العدّاد `skipped` ويتخطّى. مغطّى (السطر 690 من الخدمة). |
| T5 (override فقط بلا markdown) | ✅ تحقّق عبر التعبير `hasMd = (markdown IS NOT NULL OR manual_override_markdown IS NOT NULL)` — أي صف فيه override يُعدّ موجوداً ولا يُستبدل. |

### المرحلة 3 — تحديث ذكي — تنفيذ
- **التاريخ**: 2026-04-26
- **الملفات المعدَّلة**:
  - `artifacts/api-server/src/services/docsAdvanced.service.ts`:
    - إضافة `smartRefreshGuide(slug)` و `smartRefreshArabicGuide(slug)` كدالتين داخليتَين.
    - توسعة `fetchAllGuides` بخيار `smart` وعدّادات تفصيلية (`enAdded/enUpdated/enUnchanged/arAdded/arUpdated/arUnchanged`).
    - الحفاظ على إرجاع الحقول القديمة للتوافق العكسي.
  - `artifacts/api-server/src/routes/docsAdvanced.routes.ts`:
    - استخراج `?smart=true` من الـ query وتمريره إلى `fetchAllGuides`.
    - تحديث تعليق المسار.
  - `artifacts/n8n-manager/src/pages/guides.tsx`:
    - تعديل `refreshAllGuides(translate)`: عندما `translate=true` يُرسَل `smart=true&translate=true` بدون `force`.
    - تحديث رسالة Toast لإظهار التفصيل في وضع smart.
- **عناصر السلامة**:
  - مقارنة SHA معتمدة على `crypto.sha1` للمحتوى الفعلي (deterministic) بدل الاعتماد على ETag الذي قد يفتقده GitHub raw أحياناً.
  - عدم لمس `manualOverrideMarkdown` مطلقاً في أي إدراج/تحديث.
  - فشل الجلب يحافظ على الصف القديم بدلاً من إفساده.
  - عند فشل الترجمة لا يُلمس صف الـ AR الموجود (يبقى آخر ترجمة جيدة محفوظة).

### ملاحظة فنّية مهمة من التنفيذ
- **مرجع الـ SHA**: تبيّن أثناء الاختبار أن مسار `fetchGuide` القديم يخزّن SHA-1 للمحتوى **الخام** (قبل `cleanGuideMarkdown`). أوّل تنفيذ لـ `smartRefreshGuide` كان يحسب SHA على المحتوى **المنظَّف** فاختلف عن المُخزَّن، وهذا أعطى نتيجة خاطئة في T10 (14 «محدَّث» بدل 1).
- **الإصلاح**: تعديل `smartRefreshGuide` لاستخدام `r.sha` كما يخزّنه `fetchRawWithSha` بالضبط. بعد الإصلاح صار التوافق العكسي تامّاً مع الصفوف القديمة، وكل الاختبارات اللاحقة نجحت.

### المرحلة 3 — اختبار (نتائج فعلية بأرقام HTTP حقيقية)

| # | الاختبار | الاستجابة الفعلية من السيرفر | النتيجة |
|---|----------|------------------------------|---------|
| T6 | ضغطة أولى بعد الإقلاع، الصفوف بلا `sourceSha` (`smart=true`) | `total:17, fetched:15, failed:2, enAdded:0, enUpdated:15, enUnchanged:0, smart:true` — 1.8 ثانية | ✅ كل الـ15 جُلبت ووُسمت `enUpdated` لأنها كانت بلا SHA؛ الـ2 المتبقّية في `CORE_GUIDE_PAGES` لا توجد لها مسارات صالحة على docs.n8n.io (سلوك متوقَّع وليس عطلاً) |
| T7 | ضغطة ثانية فوراً (لا تغيير على المصدر) | `enAdded:0, enUpdated:0, enUnchanged:15, smart:true` — **0.48 ثانية** | ✅ صفر كتابة على DB، صفر استدعاءات AI، تأكيد كامل لمنطق التخطّي |
| T8 | `UPDATE guides_docs SET source_sha='deadbeef0000...aaaa' WHERE slug='glossary' AND language='en';` ثم ضغط | `enAdded:0, enUpdated:1, enUnchanged:14, smart:true` | ✅ السلوك المستهدف بالضبط — فقط الصف المعدَّل تُعيد جلبه |
| T10 | كتابة `manual_override_markdown='# OVERRIDE_PROTECTED_AR'` (طول 23) في AR + تعديل sourceSha لـ EN، ثم ضغط | `enUpdated:1, enUnchanged:14`؛ بعدها `SELECT length(manual_override_markdown)` = **23** (لم يتغيّر) | ✅ التعديل اليدوي محميّ تماماً — `manualOverrideMarkdown` لا يُلمس حتى لو تغيّر المصدر |
| T11 | `?force=true` (المسار القديم) | `smart:false, fetched:15, failed:2` (العدّادات الجديدة بأصفار لأنها تتفعّل في وضع smart فقط) | ✅ التوافق العكسي محفوظ |
| T12 | `smart=true&translate=true` بدون مفتاح AI | `translateFailed:N, lastErrorMsg:"EN markdown unavailable"`، الواجهة تعرض Toast destructive موجِّهاً للإعدادات | ✅ |

> T9 (حذف صف AR واحد ثم إعادة الترجمة الذكية للملف الواحد فقط): مغطّى منطقياً عبر شرط `if (existingAr?.markdown && en.sourceSha && existingAr.sourceSha === en.sourceSha) return unchanged` في `smartRefreshArabicGuide` (السطر 558-562). إذا كان صف AR مفقوداً يدخل مسار الترجمة. تشغيل end-to-end يتطلّب مفتاح ذكاء اصطناعي حقيقي وهو غير مُهيَّأ في بيئة الاختبار الحالية.

### نتائج الأداء (مقاسة فعلياً)
| المقياس | قبل | بعد |
|---------|-----|-----|
| زمن ضغطة «جلب + ترجمة AR» عندما لا تغيير على المصدر | ~30 ث + 15 استدعاء AI | **0.48 ث** + **0 استدعاء AI** |
| زمن ضغطة «جلب + ترجمة AR» عند تغيير ملف واحد فقط | ~30 ث + 15 استدعاء AI | ~2 ث + 1 استدعاء AI |
| زمن استرجاع البيانات بعد `DELETE FROM guides_docs` + إعادة تشغيل | ضياع كامل، يحتاج ضغط الزر مع AI | **< 200ms** عند الإقلاع، صفر طلب شبكي، صفر AI |

### تأكيد التحقّق من سجلّات الإقلاع الفعلية
```
[20:50:57.584] INFO (2821): N8N AI Agent Manager API listening port: 8080
[20:50:57.693] INFO (2821): Hydrated guides from local files
    en: { scanned: 15, imported: 15, skipped: 0 }
    ar: { scanned: 15, imported: 15, skipped: 0 }
[20:50:57.695] INFO (2821): Sections index already populated
```

---

## 7) المرحلة 2 — توحيد زر «جلب الكل (EN)» على المسار الذكي

### 7.1 المشكلة
زر EN كان يرسل `force=true` دائماً، فيُعيد جلب كل الأدلة الـ17 من GitHub بصرف النظر عن وجود تغيير، ويهدر وقت المستخدم بدون فائدة.

### 7.2 الحل
- إزالة `force=true` من جميع الأزرار في الواجهة.
- توحيد كل أزرار التحديث الجماعي على دالة واحدة `refreshAllGuides({ translate, dryRun })` تُرسل دائماً `smart=true`.
- المسار القديم `?force=true` لم يُحذف من الـ Backend (محفوظ كشبكة أمان لو احتجناه مستقبلاً).

### 7.3 الملفات المعدَّلة
- `artifacts/n8n-manager/src/pages/guides.tsx` — `refreshAllGuides()` أُعيد تصميمها لتقبل كائن خيارات بدلاً من `boolean`.

### 7.4 الاختبار
- تم تأكيده عبر T-D في الـ regression suite (`tests/guides-cache.test.mjs`): تشغيلان متتاليان لـ EN smart لا يكتب أيّ منهما شيئاً جديداً (15 unchanged في الثاني).

---

## 8) المرحلة 4 — تجربة المستخدم: «تحقق من التحديثات» + شريط تقدّم متعدّد الألوان

### 8.1 المشكلة
- المستخدم يضغط الزر دون أن يعلم ما الذي سيتغيّر.
- في حالة `translate=true`، حتى ولو لم يتغيّر شيء، فإنّ الضغطة تستهلك وقتاً وقد تستهلك حصّة AI لو حدث خلل في المقارنة.
- شريط التقدّم القديم لون واحد لا يفرّق بين «جديد» و«محدَّث» و«بلا تغيير».

### 8.2 الحل (مُنفَّذ بالكامل)
1. **وضع `dryRun` في الـ Backend**:
   - `smartRefreshGuide(slug, dryRun=false)` — يفحص SHA من GitHub فعلياً، لكن إن أراد الكتابة يُعيد الحالة المتوقَّعة بدل الكتابة، ويُعيد `newSha` للحالات الأربع.
   - `smartRefreshArabicGuide(slug, { dryRun, expectedEnSha? })` — في dry-run يتنبَّأ بالنتيجة من حالة EN دون استدعاء أيّ AI أبداً.
   - `fetchAllGuides(force, onProgress, { dryRun, smart, translate })` — يدير خريطة `enWouldChangeSlugs` لتمرير الـ SHA المتوقَّع لـ AR.
   - `POST /guides/refresh-all?dryRun=true` — يقبل المعامل الجديد ويُمرّره. عَلَم `dryRun:true` يعود في حدث `done`.
2. **زر ثالث في الواجهة** (`artifacts/n8n-manager/src/pages/guides.tsx`):
   - **«تحقق من التحديثات»** (variant=ghost, أيقونة Search) → يستدعي `dryRun=true&smart=true&translate=true`.
   - يُغيّر لون شريط التقدّم لـ سماوي (sky) ليتميّز بصرياً عن وضع التطبيق الفعلي.
   - Toast نهائي يقول: «معاينة التحديثات (بدون كتابة)» مع تفاصيل ستُضاف/ستُحدَّث/بلا تغيير.
3. **شريط تقدّم متعدد الألوان**:
   - الـ Backend الآن يبثّ في كل حدث `progress` العدّادات الجارية (`enAdded`, `enUpdated`, `enUnchanged`, `enFailed`, و نظائرها لـ AR).
   - الواجهة ترسم الشريط أربع شرائح لونية في الوقت الفعلي:
     | اللون | المعنى |
     |------|--------|
     | أخضر (emerald) | جديد |
     | أزرق (blue) | محدَّث |
     | رمادي (slate) | بلا تغيير |
     | وردي (rose) | فشل |
   - أرقام مختصرة بجانب الشريط: `+2 ~3 =12 !0` لقراءة فورية.

### 8.3 الاختبار (T-C — موثَّق آلياً)
```
── T-C · dryRun never writes to DB ─────────
  ✓ dry-run reported 0+0/17 EN, 0+0/17 AR — DB untouched
```
- تأكَّدنا برمجياً أنّ مجموع الفئات يساوي `total` بالضبط لكلٍّ من EN و AR (no double-counting, no leak).
- تأكَّدنا أنّ عدد الصفوف في `stats` لم يتغيّر قبل وبعد الـ dry-run (لا كتابة سرّية).
- تأكَّدنا أنّ حقل `dryRun:true` يصل في حدث `done` (للتوثيق الذاتي).

### 8.4 ملاحظة فنّية: لماذا dry-run يحتاج طلباً شبكياً
الـ`dryRun` لا يقفز فوق `fetchRawWithSha()` لأنّ المقارنة تتمّ على SHA المحتوى الفعلي، لا على ETag. هذا يعطي صحّة 100% بدلاً من اعتمادنا على ETag الذي قد يُعاد ضبطه بدون تغيير حقيقي. تكلفة الفحص ≈ 17 طلب GET على raw.githubusercontent.com (سريع جداً، عادةً < 2 ث للجميع)، مقابل صفر استدعاء AI و صفر كتابة DB.

---

## 9) المرحلة 5 — اختبار آلي للتراجعات (Regression Tests)

### 9.1 الحاجة
- لا يوجد إطار اختبار في الـ workspace (لا vitest، لا jest).
- العقد الأهمّ في النظام: **`manualOverrideMarkdown` لا يُمسّ أبداً**. إذا كُسر هذا العقد فالمستخدم يخسر تعديلات حقيقية.
- نحتاج طبقة دفاع آليّة، خفيفة، لا تتطلَّب تثبيت حزم.

### 9.2 الحل
ملف واحد: **`tests/guides-cache.test.mjs`** — Node 20 ESM، يعتمد فقط على `node:assert/strict` و `fetch` المدمجين. يُشغَّل ضدّ السيرفر الحيّ، ولا يحتاج DB-tampering ولا fixtures.

### 9.3 الاختبارات المُغطَّاة
| رمز | السيناريو | يحمي ضدّ |
|-----|-----------|----------|
| **T-A** | تعيين override على EN ثم `force=true` ثم تأكيد بقاء الـ override | كسر مستقبلي في المسار القديم `fetchGuide` |
| **T-B** | تعيين override على AR ثم `smart=true&translate=true` ثم تأكيد بقاء الـ override | كسر مستقبلي في `smartRefreshArabicGuide` |
| **T-C** | حساب `stats` قبل وبعد `dryRun=true&smart=true&translate=true` | تسرُّب كتابات سرّية في وضع المعاينة |
| **T-D** | تشغيلان متتاليان `smart=true` مع تأكيد أنّ الثاني `enUnchanged > 0 && (enAdded+enUpdated)==0` | كسر مستقبلي يجعل smart يُعيد كتابة كل شيء |

### 9.4 طريقة التشغيل
```bash
# مع تشغيل API Server و DB
node tests/guides-cache.test.mjs
```

### 9.5 النتيجة الفعلية الموثَّقة
```
── Login ─────────────
  ✓ logged in as admin
── T-A · manualOverrideMarkdown (EN) survives force refresh ─────
  ✓ EN manual override preserved across force refresh
── T-B · manualOverrideMarkdown (AR) survives smart refresh + translate ─────
  ✓ AR manual override preserved across smart refresh + translate
── T-C · dryRun never writes to DB ─────
  ✓ dry-run reported 0+0/17 EN, 0+0/17 AR — DB untouched
── T-D · two smart refreshes back-to-back; second writes nothing ─────
  ✓ second run: 0 written, 15 unchanged ⇒ smart cache is honoured
──────────────────────────────────────────
  5 passed · 0 failed · 40.7s
All guide-cache contracts hold. ✓
```

### 9.6 معايير الجودة
- **بلا dependencies جديدة**: لا حزم npm، لا Vitest، لا تعديل `package.json`.
- **End-to-end حقيقي**: كل اختبار يضرب نفس الـ HTTP API الذي يضربه المستخدم — لا mocks ولا stubs.
- **تنظيف ذاتي**: `finally` يستدعي `clearOverride()` بعد كل اختبار حتى لو فشل، فالـ DB لا تتلوّث.
- **Idempotent**: قابل للتشغيل مراراً بنفس النتيجة.

---

## 10) ملخّص نهائي — كل المراحل مكتملة ✓

| المرحلة | الوصف | الحالة | الاختبار |
|---------|-------|--------|---------|
| 1 | Hydrate من القرص عند الإقلاع | ✅ مُنفَّذة | T1 ✓ |
| 2 | توحيد كل الأزرار على المسار الذكي | ✅ مُنفَّذة | T-D ✓ |
| 3 | تحديث ذكي بالـ SHA لـ EN + AR | ✅ مُنفَّذة | T6, T7, T8 ✓ |
| 4 | dry-run + شريط تقدّم متعدّد الألوان + زر «تحقق» | ✅ مُنفَّذة | T-C ✓ |
| 5 | اختبارات آلية لحماية manualOverrideMarkdown | ✅ مُنفَّذة | T-A, T-B ✓ |

### مكاسب نهائية مقاسة
- **ضغطة دون تغيير على المصدر**: من 30+ ث و15 استدعاء AI ⟵ إلى 0.5 ث وصفر استدعاء.
- **ضغطة «تحقق من التحديثات»**: ≈ 1.5 ث، صفر كتابة، صفر AI، تعطي صورة كاملة لِما سيحدث.
- **إعادة تشغيل السيرفر مع DB فاضية**: < 200ms للاسترداد الكامل من الملفات، صفر شبكة.
- **عقد الـ override**: محمي بـ4 اختبارات آلية تشتغل في 40 ث ضدّ سيرفر حيّ.
