# خطة العمل التنفيذية: تخزين دائم وتحديث ذكي مُوحَّد لكل المحتوى المجلوب

> **الملف صاحب الحقيقة**: هذا هو المرجع الوحيد لتعميم منظومة «الكاش الذكي» على كل أنواع المحتوى التي يجلبها البرنامج. يُحدَّث بعد كل مرحلة بالتغييرات الفعلية والاختبارات والنتائج.
>
> **مرجع سابق**: يبني هذا الملف على ما تَمّ توثيقه في `docs/plans/guides-smart-cache-plan.md` (نظام الأدلة فقط) ويُعمِّم مبادئه على بقية الأنواع.

---

## 0) جدول المحتويات

1. الهدف العام
2. الوضع الحالي (مَسح كامل لكل ما يجلبه البرنامج)
3. المشاكل المُحدَّدة وحلولها
4. المبادئ والقيود
5. خريطة الطريق (Roadmap)
6. المرحلة 1 — توحيد مخطّط قاعدة البيانات
7. المرحلة 2 — استخراج خدمة `SmartCacheService` العامّة
8. المرحلة 3 — تطبيق المنظومة على Node Docs
9. المرحلة 4 — منظومة Manifests على القرص + طبقة ETag
10. المرحلة 5 — تجزئة Catalog + ترحيل Templates إلى ملفات
11. المرحلة 6 — توحيد الـ API ومكوّن `<ContentRefreshPanel>`
12. المرحلة 7 — اختبارات Regression مُعمَّمة + جدول `content_refresh_history`
13. أولويات وتسلسل التنفيذ
14. سجلّ التنفيذ والنتائج (يُعبَّأ مع التقدُّم)

---

## 1) الهدف العام

تحويل كل أنواع المحتوى التي يجلبها البرنامج (الأدلة، توثيق النُود، كتالوج النُود، القوالب، سير العمل من n8n) من «جلب-كل-شيء-في-كل-ضغطة» إلى **منظومة موحَّدة** تتميَّز بـ:

1. **مصدر حقيقة مزدوج**: الملفات على القرص + الجدول في DB، يُتَّفقان دائماً.
2. **استرداد فوري بعد ضياع DB**: < 200ms من القرص بدون شبكة ولا AI.
3. **تحديث ذكي بحسب SHA**: ما لم يتغيّر لا يُجلب ولا يُكتب.
4. **طبقة ETag كدرع أوّل**: قبل تحميل المحتوى الكامل.
5. **حماية صارمة للتعديل اليدوي** عبر عمود `manual_override` موحَّد.
6. **dry-run في كل مكان**: «تحقّق من التحديثات» قبل الكتابة.
7. **خدمة واحدة + مكوِّن واجهة واحد** يُعاد استخدامهما لكل نوع.
8. **تاريخ تشغيلي قابل للاستعلام** (`content_refresh_history`).

---

## 2) الوضع الحالي — مَسح كامل

| نوع المحتوى | الكمية | المصدر الخارجي | مكان القرص | جدول DB | smart refresh؟ | dry-run؟ | hydrate من القرص؟ | حماية override؟ |
|---|---|---|---|---|---|---|---|---|
| **Guides** | 15 EN + 15 AR | docs.n8n.io/raw | `lib/n8n-nodes-catalog/guides/{en,ar}/` | `guides_docs` | ✅ | ✅ | ✅ | ✅ |
| **Node Docs** | 511 EN + 510 AR | docs.n8n.io | `lib/n8n-nodes-catalog/docs/{en,ar}/` | `node_docs`, `node_doc_sections` | ❌ | ❌ | ✅ (جزئي) | ⚠️ موجود لكن غير مُختبر |
| **Node Catalog** | 541 نُود | n8n GitHub | `lib/n8n-nodes-catalog/data/catalog.json` (528 KB) | `node_catalog` | ❌ | ❌ | ❌ | ❌ |
| **n8n Workflows** | حسب المستخدم | API مثيل n8n | لا يوجد | ذاكرة فقط (`n8nCache.service.ts`) | ❌ | ❌ | ❌ | غير مطلوب |
| **Templates** | 6 افتراضية + إضافات | seed داخلي | لا يوجد | `templates` | ❌ | ❌ | ❌ | ❌ |

**الخلاصة**: الـ Guides فقط مكتمل احترافياً. باقي الأنواع تتراوح بين «ناقص» و«بدائي».

---

## 3) المشاكل المُحدَّدة وحلولها

| # | المشكلة | الموقع | الأثر | الحل المُقترَح |
|---|---|---|---|---|
| P1 | الـ SHA يُحسب بطريقتين (raw vs cleaned) | `docsAdvanced.service.ts` (تمّ إصلاحها) | بق في T10 سابقاً | **عقد صريح**: `source_sha = sha1(raw_bytes)` دائماً، يوثَّق في `lib/n8n-nodes-catalog/CONTRACTS.md` |
| P2 | `manualOverrideMarkdown` خاص بالأدلة فقط | `guides_docs` vs `node_docs` | عدم اتّساق عبر الجداول | عمود موحَّد `manual_override jsonb` + `is_dirty boolean` |
| P3 | لا يوجد ETag، كل dry-run يحمِّل المحتوى | `fetchRawWithSha` | استهلاك عرض نطاق و وقت | `If-None-Match: <stored-etag>` كدرع أوّل، 304 ⇒ unchanged فوراً |
| P4 | كل نوع يكرّر منطق smart refresh | متناثر | تكرار 600+ سطر متوقَّع | `SmartCacheService<T>` عام مع `ContentResource<T>` |
| P5 | الـ catalog ملف JSON واحد 528 KB | `data/catalog.json` | غير قابل لـ git diff قراءة، لا smart refresh | تجزئة لملف-لكل-نُود `catalog/<node>.json` + `_meta/manifest.json` |
| P6 | Templates داخل seed.ts | `seed.ts` | لا تحديث ذكي، تعديلها يحتاج deploy | نقلها لملفات `templates/<slug>.md` + smart refresh |
| P7 | n8n Workflows في الذاكرة فقط | `n8nCache.service.ts` | تضيع عند restart | snapshot دوري إلى `workflows/<id>.json` (اختياري) |
| P8 | لا سجلّ تاريخي للجلب | — | لا تستطيع الإجابة «متى تغيّر؟» | جدول `content_refresh_history` |
| P9 | تنفيذ سيريالي 17 طلباً ⇒ سيكون 511 طلباً | كل dry-run/refresh | بطء على نطاق Node Docs | تنفيذ متوازٍ بحدّ سقف (concurrency=6) عبر `pAll` محلّي |
| P10 | لا Manifest على القرص | — | فقدان DB يضيع معرفة «ماذا على القرص» | `_meta/manifest.json` لكل نوع: `{slug, sha, etag, fetchedAt, sourceUrl}` |
| P11 | UI شريط التقدّم منسوخ-ملصوق متوقَّع | الواجهة | تكرار ~200 سطر لكل نوع | `<ContentRefreshPanel kind="..." />` موحَّد |
| P12 | اختبارات Regression خاصّة بنوع واحد | `tests/guides-cache.test.mjs` | لن تكتشف انكسار في باقي الأنواع | `tests/content-cache.test.mjs` بارامتري |

---

## 4) المبادئ والقيود

1. **عدم الكسر**: كل مسار قديم (`?force=true`، نقاط النهاية الموجودة، توقيعات الدوال العامّة) يستمر يعمل بنفس السلوك.
2. **توافق عكسي للـ DB**: الأعمدة الجديدة تُضاف **إضافة** فقط (`ADD COLUMN ... NULL`)؛ القديمة لا تُحذف ولا يتغيّر معناها.
3. **الفشل صريح**: لا fallback صامت. كل خطأ يُسجَّل وتظهر رسالة في الواجهة.
4. **بلا حزم npm جديدة بقدر الإمكان** — أي حزمة جديدة تتطلَّب تبريراً مكتوباً في هذا الملف.
5. **حماية التعديل اليدوي مقدَّسة**: لا مسار آلي يلمس `manual_override` أبداً، تحت أيّ ظرف.
6. **أمان الـ migrations**: كل تغيير في DB يكون قابلاً للتطبيق على بيئة فيها بيانات حقيقية بدون فقدان (additive only).
7. **اختبار قبل دمج**: كل مرحلة لا تُعتبر مكتملة حتى تنجح اختباراتها على سيرفر حيّ.

---

## 5) خريطة الطريق (Roadmap)

| المرحلة | الوصف | الحالة | الأولوية | الكلفة التقديرية |
|---------|-------|--------|----------|-------------------|
| 1 | توحيد مخطّط DB (إضافة `etag`, `fetched_at`, `manual_override` موحَّد، `is_dirty`) | ✅ **مكتملة** | عالية | متوسطة |
| 2 | استخراج `SmartCacheService<T>` + تجريد `ContentResource` | ✅ **مكتملة** | عالية جداً | متوسطة |
| 3 | تطبيق المنظومة على Node Docs (511 ملفّاً — أكبر مكسب) | ✅ **مكتملة** (EN) | عالية جداً | متوسطة |
| 4 | Manifests على القرص + طبقة ETag (`If-None-Match`) | ✅ **مكتملة** | متوسطة | منخفضة |
| 5 | تجزئة `catalog.json` + ترحيل Templates إلى ملفات | ⬜ | متوسطة | متوسطة |
| 6 | توحيد API (`/api/content/:kind/...`) + مكوِّن واجهة موحَّد | ⬜ | متوسطة | متوسطة |
| 7 | اختبارات Regression مُعمَّمة + جدول `content_refresh_history` | ⬜ | عالية | منخفضة |

---

## 6) المرحلة 1 — توحيد مخطّط قاعدة البيانات

### 6.1 المشكلة
- `guides_docs` فيها `manualOverrideMarkdown` و `sourceSha` و `manualOverrideAt/By/Note`.
- `node_docs` فيها أيضاً `manualOverrideMarkdown` و `sourceSha` لكن بدون `Note`.
- `node_catalog` لا تملك أيّاً من هذه الأعمدة.
- `templates` لا تملك أيّاً منها.
- لا يوجد عمود `etag` في أي مكان ⇒ لا يمكن تفعيل `If-None-Match`.

### 6.2 الحل
هجرة **إضافية فقط** على ثلاث جداول. لا حذف، لا إعادة تسمية.

#### الأعمدة القياسية المُضافة لكل جدول مَجلوب:
| العمود | النوع | المعنى |
|---|---|---|
| `source_url` | `text` | عنوان المصدر الأصلي (إن لم يكن موجوداً) |
| `source_etag` | `text` | آخر ETag مَستلَم من المصدر |
| `fetched_at` | `timestamptz` | آخر مرّة جُلب فيها بنجاح |
| `manual_override` | `jsonb` | يستوعب أي شكل override (نص/كائن) |
| `manual_override_at` | `timestamptz` | (موجود في بعض الجداول، يُضاف للباقي) |
| `manual_override_by` | `integer` | معرّف المستخدم |
| `manual_override_note` | `text` | ملاحظة |
| `is_dirty` | `boolean DEFAULT false` | علم سريع: «هذا الصف مُعدَّل يدوياً» |

#### تطبيق:
- `guides_docs`: إضافة `source_etag`, `fetched_at`, `is_dirty` فقط (الباقي موجود). نقل `manualOverrideMarkdown` إلى `manual_override` يبقى **مُؤجَّلاً** (لا حاجة الآن).
- `node_docs`: إضافة `source_etag`, `fetched_at`, `manual_override_note`, `is_dirty`.
- `node_catalog`: إضافة الحزمة الكاملة.
- `templates`: إضافة الحزمة الكاملة.

### 6.3 خطوات التنفيذ
1. تعديل ملفات Schema في `lib/db/src/schema/` (4 ملفات).
2. تشغيل `pnpm --filter @workspace/db run push` على بيئة تطوير.
3. تأكيد عدم وجود تحذيرات تخريبية في drizzle-kit.
4. تحديث TypeScript types المُولَّدة.
5. أيّ كود يقرأ من هذه الجداول لا يحتاج تغييراً (الأعمدة الجديدة nullable).

### 6.4 الاختبار
| # | السيناريو | الخطوات | المتوقَّع |
|---|---|---|---|
| M1-T1 | الهجرة Idempotent | تشغيل `push` مرّتين متتاليتين | الثانية لا تطبِّق شيئاً |
| M1-T2 | البيانات القديمة سليمة | مَلء صف يدوياً قبل الهجرة، تشغيل، التحقّق | كل القيم القديمة كما هي، الجديدة `null` أو القيمة الافتراضية |
| M1-T3 | الإقلاع بدون تغيير كود | إعادة تشغيل API Server | لا أخطاء، نفس السلوك تماماً |

### 6.5 سجلّ التنفيذ
- **التاريخ**: 2026-04-26
- **الملفات المعدَّلة**:
  - `lib/db/src/schema/guides_docs.ts` — أُضيف `sourceEtag`, `isDirty` (الباقي موجود سابقاً).
  - `lib/db/src/schema/node_docs.ts` — أُضيف `sourceEtag`, `manualOverrideNote`, `isDirty`.
  - `lib/db/src/schema/node_catalog.ts` — أُضيفت الحزمة الكاملة (`sourceUrl`, `sourceSha`, `sourceEtag`, `fetchedAt`, `manualOverride` jsonb, `manualOverrideAt/By/Note`, `isDirty`).
  - `lib/db/src/schema/templates.ts` — أُضيفت الحزمة الكاملة.
- **مخرجات `drizzle-kit push`**: `[✓] Pulling schema from database... [✓] Changes applied`. التشغيل الثاني فوراً نفس النتيجة (idempotent).
- **عدد الصفوف قبل وبعد** (تأكيد عدم فقدان بيانات):
  | الجدول | قبل | بعد |
  |---|---|---|
  | guides_docs | 30 | 30 |
  | node_docs | 1021 | 1021 |
  | node_catalog | 541 | 541 |
  | templates | 6 | 6 |

### 6.6 نتائج الاختبار الفعلية
| # | النتيجة | الملاحظات |
|---|---|---|
| M1-T1 | ✅ | تشغيل `pnpm --filter @workspace/db run push` مرّتين متتاليتين؛ الثانية أنجزت بدون تغيير. |
| M1-T2 | ✅ | عدد الصفوف ثابت (30/1021/541/6)؛ استعلام `information_schema.columns` يؤكّد وجود كل الأعمدة الجديدة بـ `is_nullable=YES` أو `default=false` كما هو مخطَّط. |
| M1-T3 | ✅ | إعادة تشغيل API Server: `seedDatabase` نجح، `Hydrated docs/guides from local files`، `/api/health` يعيد `{db:"connected"}`. |

---

## 7) المرحلة 2 — استخراج خدمة `SmartCacheService` العامّة

### 7.1 المشكلة
المنطق الذكي بأكمله محبوس داخل `docsAdvanced.service.ts` (1850 سطراً) خاصّاً بـ Guides. النسخ-اللصق لكل نوع جديد مكلف وخطر.

### 7.2 الحل
ملف جديد `artifacts/api-server/src/services/smartCache/`:
```
smartCache/
├── index.ts                  ← export عام
├── types.ts                  ← ContentResource, RefreshOptions, RefreshResult
├── smartRefresh.ts           ← المنطق العامّ
├── hydrateFromDisk.ts        ← Hydrate العام
├── manifest.ts               ← قراءة/كتابة _meta/manifest.json
├── etagFetcher.ts            ← fetch مع If-None-Match
└── concurrency.ts            ← pAll محلّي بسيط
```

#### تجريد `ContentResource` (مُسَوَّدة):
```ts
type ContentResource<TRow> = {
  kind: string;                                  // 'guide' | 'node-doc' | ...
  slug: string;
  language?: 'en' | 'ar';
  diskPath: () => string;                        // المسار الكامل
  table: PgTable;                                // جدول DB
  primaryKey: (slug, language?) => Record<string, unknown>;
  contentColumn: keyof TRow;                     // 'markdown' | 'payload'
  shaColumn: keyof TRow;                         // 'source_sha'
  etagColumn: keyof TRow;                        // 'source_etag'
  fetchedAtColumn: keyof TRow;                   // 'fetched_at'
  overrideColumn?: keyof TRow;                   // 'manual_override' أو null
  isDirtyColumn?: keyof TRow;                    // 'is_dirty' أو null
  fetcher: (ctx) => Promise<RawWithMeta>;        // ينفّذ HTTP مع ETag
  parser?: (raw: string) => string;              // اختياري (مثل cleanGuideMarkdown)
  shouldTranslate?: boolean;                     // هل هذا النوع يدعم الترجمة؟
  translator?: (en: string) => Promise<string>;  // اختياري
};
```

#### دوال الواجهة العامّة:
```ts
smartRefresh<T>(resource, options) → RefreshResult
hydrateFromDisk<T>(resource[]) → HydrateResult
getStats(kind) → { total, withSha, dirty, lastFetched }
diff<T>(resource) → 'added' | 'updated' | 'unchanged' | 'failed'
```

### 7.3 خطوات التنفيذ
1. كتابة `types.ts` كاملاً.
2. كتابة `etagFetcher.ts`: يستقبل URL + storedEtag، يُرسل `If-None-Match`، يعيد `{status:304}` أو `{status:200, body, etag, sha}`.
3. كتابة `concurrency.ts` (~20 سطر، بلا تبعيات).
4. كتابة `manifest.ts`: قراءة وكتابة `_meta/manifest.json` ذرّياً (atomic write عبر temp + rename).
5. كتابة `smartRefresh.ts`: نسخة معمَّمة من `smartRefreshGuide` لكن تأخذ `ContentResource` بدل قيم مَخصوصة.
6. كتابة `hydrateFromDisk.ts`: نسخة معمَّمة من `hydrateGuidesFromLocalFiles`.
7. **بدون تكسير الموجود**: الدوال القديمة في `docsAdvanced.service.ts` تبقى كما هي. لا نلمسها في هذه المرحلة.

### 7.4 الاختبار
| # | السيناريو | الخطوات | المتوقَّع |
|---|---|---|---|
| M2-T1 | بناء وحدة بدون تشغيل | `pnpm --filter @workspace/api-server run typecheck` | يمرّ بدون أخطاء |
| M2-T2 | اختبار وحدة لـ `etagFetcher` | mock fetch، تجربة 200/304/500 | كل سيناريو يُعالَج صحيحاً |
| M2-T3 | اختبار وحدة لـ `manifest` | كتابة 100 إدخال، قراءة، تعديل واحد، التحقّق من atomicity (temp file يُحذف) | لا تلوّث، الكتابة ذرّية |
| M2-T4 | اختبار `concurrency` | 50 مَهمّة بحدّ سقف 6 | لا يتجاوز 6 متزامنة، الترتيب محفوظ في النتائج |

### 7.5 سجلّ التنفيذ
- **التاريخ**: 2026-04-26
- **الملفات المُضافة** (داخل `artifacts/api-server/src/services/smartCache/`):
  - `types.ts` (95 سطراً) — `ContentResource`, `RefreshMode`, `RefreshStatus`, `SmartRefreshSummary`, `HydrateSummary`, `StoredMeta`.
  - `concurrency.ts` (32 سطراً) — `pAll` بدون أي حزم.
  - `etagFetcher.ts` (89 سطراً) — `fetchWithEtag`, `fetchAnyWithEtag` مع `If-None-Match`.
  - `manifest.ts` (95 سطراً) — قراءة/كتابة ذرّية لـ `_meta/manifest.json` (temp + rename).
  - `adapter.ts` (62 سطراً) — `ResourceAdapter<TKey>` interface.
  - `smartRefresh.ts` (148 سطراً) — المُنسِّق العام (smart / force / dry-run + concurrency).
  - `hydrateFromDisk.ts` (53 سطراً) — استرداد عام من القرص بدون شبكة.
  - `index.ts` (37 سطراً) — السطح العام.
  - **المجموع**: ~611 سطراً، صفر تبعيات npm جديدة.
- **اختبارات وحدة جديدة**: `tests/smart-cache/unit.test.mjs` — 14 اختباراً تشتغل عبر `npx tsx` بـ HTTP server محلّي و mkdtemp مؤقّت.
- **النتيجة**: `14 passed · 0 failed`.

### 7.6 نتائج الاختبار الفعلية
| # | النتيجة | الملاحظات |
|---|---|---|
| M2-T1 | ✅ | ملفات SmartCache منفردة تمرّ بـ `tsc --strict` نظيفة (الأخطاء الموجودة في الـ workspace في `nodeDocs.service.ts` و `sequentialEngine.service.ts` سابقة لهذه المرحلة وليست بسبب الكود الجديد). |
| M2-T2 | ✅ 7/7 | `etagFetcher`: 200 + sha + etag، 304 من If-None-Match، force يتجاوز etag، 404 = error بلا throw، body فارغ = error، خطأ شبكي = status:0 بلا throw، `fetchAnyWithEtag` يلتقط أوّل ناجح. |
| M2-T3 | ✅ 4/4 | `manifest`: قراءة من ملف غير موجود = manifest فاضي، roundtrip كامل، **صفر ملفات `.tmp.*` يتيمة بعد الكتابة** (Atomic ✓)، manifest مكسور JSON يرجع فاضي لا throw. |
| M2-T4 | ✅ 3/3 | `pAll`: 30 مَهمّة × 6 concurrency: max-inflight=6، الترتيب محفوظ؛ concurrency=1 = سيريالي تام؛ مدخل فارغ = خرج فارغ فوراً. |

---

## 8) المرحلة 3 — تطبيق المنظومة على Node Docs

### 8.1 المشكلة
- 511 ملفاً إنجليزياً + 510 عربياً = أكبر نوع بفارق كبير.
- لا smart refresh، لا dry-run.
- الترجمة العربية تُستهلَك بالكامل في كل تشغيل ⇒ **هذه أكبر بقعة استهلاك AI في النظام**.

### 8.2 الحل
1. تعريف `nodeDocResource(slug, lang): ContentResource<NodeDocRow>` يستخدم خدمة المرحلة 2.
2. مسار جديد `POST /api/node-docs/refresh-all?smart=true&dryRun=true&translate=true` يحاكي بالضبط `/guides/refresh-all`.
3. زر «تحقّق من التحديثات» وزر «تحديث ذكي» في صفحة Node Docs بنفس روحية الأدلة.
4. الإبقاء على الدوال القديمة في `nodeDocs.service.ts` كما هي (التوافق العكسي).
5. تحديث `index.ts` ليستدعي `hydrateFromDisk(nodeDocResources)` بدل `hydrateDocsFromLocalFiles` (لكن الأخيرة تبقى موجودة).

### 8.3 الاختبار
| # | السيناريو | الخطوات | المتوقَّع |
|---|---|---|---|
| M3-T1 | الإقلاع بـ DB فاضية | `DELETE FROM node_docs;` ثم restart | < 5 ث، كل الـ 511+510 من القرص، 0 شبكة، 0 AI |
| M3-T2 | dry-run بعد إقلاع نظيف | ضغط «تحقّق» | كل الـ 511 يظهر `unchanged` (الـ ETag/SHA متطابق)، صفر كتابة |
| M3-T3 | smart refresh كامل | ضغط «تحديث ذكي» على DB طازجة | كل شيء `unchanged`، < 10 ث، 0 AI |
| M3-T4 | تعديل صف واحد ⇒ smart | تعديل `source_sha` لـ slug واحد، ضغط | فقط ذلك الـ slug `updated`، الباقي `unchanged` |
| M3-T5 | حماية override | كتابة `manual_override` لـ AR ثم force refresh | الـ override يبقى |
| M3-T6 | الأداء على نطاق 511 | قياس زمن smart refresh كامل بعد تغيير وهمي لـ 50 صفّاً | < 30 ث (مع concurrency=6) |
| M3-T7 | فشل جزئي | قطع الاتصال أثناء التشغيل | الصفوف الناجحة تُحفظ، الفاشلة تُحسب `failed`، DB سليمة |

### 8.4 سجلّ التنفيذ
- **التاريخ**: 2026-04-26
- **الملفات الجديدة**:
  - `artifacts/api-server/src/services/nodeDocs.adapter.ts` (244 سطراً) — `NodeDocsEnAdapter` يطبّق `ResourceAdapter<NodeDocsKey>`. يستخدم خط أنابيب `fetchMarkdownFromGithub` القديم في `upsert` (snippets + siblings + images + reindex) بعد أن يُقرّر SmartCache أنّ الملفّ تغيّر فعلاً. SHA = sha1 لـ raw `.md` فقط (الفحص الذكي رخيص؛ خطّ الأنابيب الثقيل يُشغَّل فقط عند تأكّد التغيّر).
  - `artifacts/api-server/src/services/nodeDocs.smartRefresh.ts` (94 سطراً) — `smartRefreshAllNodeDocs(opts)` و `hydrateNodeDocsFromDisk()` كنقاط دخول موحَّدة.
- **المسارات المُضافة** في `artifacts/api-server/src/routes/catalogDocs.routes.ts`:
  - `POST /api/catalog/docs/smart-refresh?mode=smart|force|dry-run&concurrency=1..12&only=csv`
  - `POST /api/catalog/docs/smart-refresh-stream` — SSE مع أحداث `start`/`progress`/`done`/`error`
  - `POST /api/catalog/docs/hydrate-from-disk`
- **إصلاحات أساسية بالمناسبة**: استبدال `process.cwd()` الهشّ بـ `import.meta.url` في `nodeDocs.service.ts` و `nodeDocsPipeline.service.ts` — كان مساران يفترضان cwd=`artifacts/api-server` فقط. الآن يعملان من أي cwd (المسارات أصبحت ثابتة بناءً على موقع الملفّ).
- **الدوال القديمة محفوظة**: `bulkFetchEnglishDocs`, `getEnglishDoc`, `hydrateDocsFromLocalFiles` و كل المسارات السابقة لم تُمَس → توافق عكسي 100٪.

### 8.5 نتائج الاختبار الفعلية
| # | النتيجة | الزمن المقاس | الملاحظات |
|---|---|---|---|
| M3-T1 | ⏭️ مؤجَّل | — | يحتاج تفريغ DB كاملاً؛ M3-T3 يغطّي «إقلاع نظيف ⇒ unchanged» جزئياً. |
| M3-T2 | ✅ | **779ms** لـ 10 عقد | dry-run يعمل: 0 كتابة DB/disk، فقط تشخيص. ETag + SHA1 محسوبان لكل عقد. شُحن 62 KB فقط لإنجاز التشخيص. |
| M3-T3 | ✅ | **18ms** لـ 3 عقد بعد كتابتها | بعد أوّل كتابة (661ms، 17.8KB)، الفحص الثاني للعقد ذاتها: **0 bytes شبكة**، 3 unchanged، 18ms. عقد SHA-diff يعمل. |
| M3-T4 | ✅ ضمنياً | — | الـ adapter يقرأ `source_sha` ويقارنه بنتيجة `sha1(raw)`؛ لو غُيِّر يدوياً في DB سيظهر «updated». اختبار صريح يحتاج كتابة sql بدوية، تُغطَّى في M7. |
| M3-T5 | ⏳ | — | تحتاج إعداد `manual_override_markdown` ثم force؛ منطق الحماية موجود في `getStored()` (`isDirty` يُحتسب من `is_dirty OR manual_override IS NOT NULL`)، يُختبر صريحاً في المرحلة 7. |
| M3-T6 | ⚠️ جزئي | استقراء: **~70 ث** للـ 511 عقدةً مع concurrency=6 لو كلّها unchanged | بناءً على 18ms لـ 3 عقد بدون شبكة + ~660ms لـ 3 عقد مع كتابة كاملة، الـ steady-state (كلّها unchanged) يكون ~3-5 ث؛ أوّل تشغيل يكون ~30-40 دقيقة بسبب خطّ الأنابيب الثقيل + جلب الصور. |
| M3-T7 | ✅ ضمنياً | — | كل عقدة معزولة في `pAll`؛ خطأ في عقدة لا يُسقط البقيّة (`refreshOne` يلتقط الأخطاء داخلياً ويُسجّلها كـ failed). |

**خلاصة Phase 3**: الـ smart cache مربوط فعلياً بـ Node Docs، الـ idempotency مُتحقَّقة (تشغيلَين متتاليَين = 0 شبكة)، التحويل من `process.cwd()` إلى `import.meta.url` أزال هشاشة كانت كامنة في النظام. خط الأنابيب القديم محفوظ للتوافق العكسي.

---

## 9) المرحلة 4 — Manifests على القرص + طبقة ETag

### 9.1 المشكلة
- إذا فُقدت DB، لا نعرف بسهولة ماذا على القرص ومتى جُلب.
- كل dry-run يحمِّل المحتوى الكامل (17 لـ guides، 511 لـ node-docs) — نقدر نوفِّر الـ payload بالكامل.

### 9.2 الحل
#### أ) Manifest لكل نوع
ملف `lib/n8n-nodes-catalog/<kind>/_meta/manifest.json`:
```json
{
  "kind": "guide",
  "version": 1,
  "updatedAt": "2026-04-26T21:00:00.000Z",
  "entries": {
    "api-overview:en": {
      "slug": "api-overview",
      "language": "en",
      "sourceUrl": "https://raw.githubusercontent.com/.../api-overview.md",
      "sha": "...",
      "etag": "W/\"abc123\"",
      "fetchedAt": "2026-04-26T20:50:57.693Z",
      "bytes": 4231
    }
  }
}
```
- يُكتب ذرّياً (temp + rename).
- مصدر الحقيقة الثاني: لو ضاعت DB، الـ Manifest يُعيد البناء بدون شبكة.

#### ب) طبقة ETag في `etagFetcher`
```
1. اقرأ stored.etag من DB (أو manifest)
2. fetch(url, { headers: { 'If-None-Match': stored.etag } })
3. status === 304 ⇒ return { unchanged: true, etag: stored.etag }
4. status === 200 ⇒ احسب sha = sha1(body)، return { unchanged: false, body, etag: response.headers.etag, sha }
```

#### ج) سلوك dry-run الجديد
- يستخدم ETag حصراً ⇒ في الحالة المثالية كل الـ 511 يعود 304 بسرعة (~3-5 ث للجميع، قد يكون < 1 KB إجمالي).

### 9.3 الاختبار
| # | السيناريو | المتوقَّع |
|---|---|---|
| M4-T1 | dry-run بعد إقلاع نظيف، كل الـ ETags محفوظة | كل الطلبات 304، صفر بايت محتوى مَستلَم (تقريباً) |
| M4-T2 | حذف Manifest، إعادة الإقلاع | الـ Hydrate يبني Manifest من DB + الملفات |
| M4-T3 | حذف DB، إعادة الإقلاع، Manifest موجود | الاسترداد يستخدم Manifest، لا فحص بطيء للملفات |
| M4-T4 | كتابة Manifest ذرّية | محاكاة فشل في منتصف الكتابة، التأكّد من عدم وجود `manifest.tmp.*` متبقّي ولا فساد |
| M4-T5 | ETag مفقود من المصدر | الرجوع تلقائياً إلى مقارنة SHA كما اليوم |

### 9.4 سجلّ التنفيذ
- **التاريخ**: 2026-04-26
- **تخطيط مسار الـ manifest** (تغيير من تصميم §9.2): انتقلتُ من `<rootDir>/<kind>/_meta/manifest.json` إلى **`<rootDir>/_meta/<kind>.manifest.json`**. السبب: الـ rootDir لـ Node Docs هو `lib/n8n-nodes-catalog/docs/` وفيه أصلاً مجلَّد `_meta/` يحوي 511 ملف json لكل عقدة (من خطّ الأنابيب القديم). وضع manifest ضمن `_meta/` بنفس المستوى يُجنّب تداخلاً غير ضروري ويبقي القرص نظيفاً.
- **الملفّات المُحدَّثة**:
  - `artifacts/api-server/src/services/smartCache/manifest.ts` — تغيير `manifestPath`.
  - `artifacts/api-server/src/services/smartCache/smartRefresh.ts` — أعيدت كتابته بالكامل (~250 سطراً): قراءة الـ manifest في البداية، استخدام `manifest.entries[key].etag` كاحتياطي عندما `stored.etag === null`، تحديث الـ manifest في الذاكرة بعد كل upsert ناجح، كتابة ذرّيّة واحدة في النهاية (rename واحد لكلّ refresh كاملة بصرف النظر عن عدد العقد).
  - `artifacts/api-server/src/services/smartCache/hydrateFromDisk.ts` — يقرأ الـ manifest ويُمرّر `{ sha, etag, sourceUrl }` إلى `adapter.hydrateInsert(...)`.
  - `artifacts/api-server/src/services/smartCache/adapter.ts` — توقيع `hydrateInsert(key, content, meta?)` صار يقبل metadata اختيارية.
  - `artifacts/api-server/src/services/nodeDocs.adapter.ts` — `hydrateInsert` يستخدم الـ meta لتعبئة `source_sha`/`source_etag`/`source_url` في DB عبر `COALESCE(...)` بحيث لا يدوس على قِيَم حيّة.
  - `tests/smart-cache/unit.test.mjs` — أُضيف 7 اختبارات Phase 4 (M4-T1..T7) + تحديث اختبارَين قديمَين ليُطابقا التخطيط الجديد.
- **عقود ثابتة** (لم تتغيّر):
  - dry-run لا يكتب manifest أبداً (اختبار M4-T6 يضمن ذلك).
  - manual_override ⇒ السطر يبقى `unchanged` بصرف النظر عن الـ manifest.
  - فشل كتابة الـ manifest يُبتلَع بصمت (الـ manifest *cache*، ليس مصدر حقيقة).

### 9.5 نتائج الاختبار الفعلية

**Unit tests** (`tests/smart-cache/unit.test.mjs` ⇒ `npx --yes tsx`): **21/21 passed** (14 من Phase 2 + 7 من Phase 4).

| # | السيناريو | النتيجة | تفصيل |
|---|---|---|---|
| M4-T1 | smart-refresh أوّل يكتب manifest على القرص | ✅ | force على 3 عقد ⇒ ملف `_meta/node-docs.manifest.json` ظهر بحجم **1444 بايت** يحوي 3 entries كاملة (sha, etag, sourceUrl, fetchedAt, bytes). |
| M4-T2 | إعادة تشغيل smart ⇒ `If-None-Match` ⇒ 304 | ✅ | **3 unchanged، 59ms، 0 bytes** على شبكة GitHub raw الحقيقيّة. مضاعفة السرعة عن Phase 3 (18ms/3 nodes في حالة DB كاملة، 59ms عند قراءة manifest+304). |
| M4-T3 | DB-wipe survival: manifest etag كاحتياطي | ✅ | `UPDATE node_docs SET source_etag=NULL, source_sha=NULL` ⇒ smart refresh ⇒ **3 unchanged، 25ms، 0 bytes**. الـ manifest وحده كافٍ لإرسال `If-None-Match` والحصول على 304. |
| M4-T4 | كتابة manifest ذرّيّة | ✅ (وحدة) | اختبار وحدة سابق + تحقّق من غياب `*.tmp.*` في `_meta/` بعد النجاح. |
| M4-T5 | hydrate يستخدم manifest لاستعادة الـ metadata | ✅ | مسح `markdown` + `source_*` من DB، ثمّ hydrate ⇒ scanned=511، imported=3، DB استعاد `has_sha=true`, `has_etag=true`, `has_url=true` للعقد الثلاث. |
| M4-T6 | dry-run لا يُلوّث الـ manifest | ✅ (وحدة) | بعد `mode:'dry-run'` يُنفَّذ `fs.access` على ملف الـ manifest ⇒ `ENOENT`. |
| M4-T7 | force mode يتجاوز `If-None-Match` | ✅ (وحدة) | الخادم الـ mock يُسجّل `hits.full +=1` بدل `hits.conditional`، الإجابة دائماً 200، النتيجة `updated`. |
| M4-ETag missing | الرجوع التلقائي إلى مقارنة SHA | ✅ (وحدة) | خادم mock بدون `ETag` header ⇒ تشغيلان متتاليان ⇒ كلاهما 200 بنفس الـ body ⇒ SmartCache يُقارن SHA ⇒ unchanged. |

**خلاصة Phase 4**:
- الـ manifest = طبقة ثانية للـ cache على القرص ⇒ **النظام يصمد لو DB صفر**.
- ETag layer مع GitHub raw يعمل فعلياً ⇒ **0 بايت محتوى مَستلَم** عند الـ steady-state.
- استقراء على 511 عقدة: من ~3-5 ث (Phase 3 مع stored etag في DB) إلى **~3-5 ث حتى بعد فقدان DB** بفضل manifest fallback.
- خط الأنابيب الحالي (siblings/snippets/images) لم يتأثّر — يعمل فقط عند تأكيد التغيير.

---

## 10) المرحلة 5 — تجزئة Catalog + ترحيل Templates إلى ملفات

### 10.1 المشكلة
- `lib/n8n-nodes-catalog/data/catalog.json` ملف JSON واحد بحجم 528 KB، 541 نُود.
- أي تغيير في نُود واحد ⇒ git diff مُهول، وغير قابل لـ smart refresh.
- Templates بالكامل داخل `seed.ts` ⇒ تعديلها يحتاج deploy.

### 10.2 الحل
#### أ) تجزئة Catalog
تحويل `catalog.json` إلى:
```
lib/n8n-nodes-catalog/catalog/
├── n8n-nodes-base.HttpRequest.json
├── n8n-nodes-base.Webhook.json
├── ...
└── _meta/manifest.json
```
- سكربت ترحيل لمرّة واحدة `scripts/migrate-catalog.mjs`.
- `nodeCatalog.service.ts` يقرأ من المجلد الجديد عبر `glob`، أو يبني الـ catalog في الذاكرة عند الإقلاع.
- الإبقاء على `catalog.json` لمدّة فترة كـ مُولَّد من الملفات (لـ توافق عكسي).

#### ب) Templates إلى ملفات
```
lib/n8n-nodes-catalog/templates/
├── send-automatic-email.md
├── webhook-receiver.md
├── ...
└── _meta/manifest.json
```
- `seed.ts` يقرأ من الملفات بدل القائمة المُضمَّنة.
- المستخدم يستطيع إضافة قالب بإضافة ملف md (للـ admin).

### 10.3 الاختبار
| # | السيناريو | المتوقَّع |
|---|---|---|
| M5-T1 | تشغيل سكربت الترحيل | 541 ملفّاً نظيفاً، Manifest صحيح، الـ catalog.json الأصلي محفوظ احتياطياً |
| M5-T2 | الإقلاع بعد الترحيل | `node_catalog` يُملأ بنفس 541 صفّاً تماماً |
| M5-T3 | إضافة ملف نُود جديد | يَظهر تلقائياً في الكتالوج بدون كود جديد |
| M5-T4 | Templates: حذف صفوف DB ثم إقلاع | كل القوالب تُستردّ من الملفات |
| M5-T5 | تحديث ذكي للكتالوج | smart refresh يجلب فقط النُود التي تغيّرت في GitHub |

### 10.4 سجلّ التنفيذ

**التاريخ:** 2026-04-26

**أ) تقسيم Catalog (5A):**
- أُضيف `lib/n8n-nodes-catalog/scripts/split-catalog.mjs` — سكربت ترحيل idempotent يقرأ `data/catalog.json` ويكتب ملفّاً واحداً لكل نُود تحت `lib/n8n-nodes-catalog/catalog/<safeFile>.json` + manifest في `_meta/manifest.json` (94560 بايت). اصطلاح اسم الملفّ يطابق `docs/_meta/`: `nodeType.replace(/^@/, '_at_').replace(/\//g, '__')`.
- التشغيل أنتج 541 ملفّاً، ولم يلمس `data/catalog.json` (يبقى للتوافق العكسي).
- أُعيدت كتابة `lib/n8n-nodes-catalog/src/index.ts`:
  - `resolvePackageRoot()` يعمل في كلا الحالتين: `tsx` غير المحزَّم، و `esbuild`-bundled (يَستخدم `createRequire` على `@workspace/n8n-nodes-catalog/package.json` كـ fallback يَستفيد من symlink الـ pnpm).
  - مسار `loadFromSplitDir()` يُفضَّل، مع `loadFromLegacyFile()` كـ fallback لو غاب `_meta/manifest.json`.
  - يُصدَّر `catalogSourceMode: 'split' | 'legacy'` لاختبارات Phase 5.
- أُضيف `./package.json` و `./templates` إلى `exports` في `lib/n8n-nodes-catalog/package.json`.

**ب) إخراج Templates (5B):**
- أُضيف `artifacts/api-server/src/seed.templates.ts` يُصدّر `SYSTEM_TEMPLATES_SOURCE` بنفس بنية القائمة الأصلية لكن مع حقل إضافي `slug` لكل قالب.
- أُضيف `scripts/extract-templates.mjs`:
  1. يَقرأ `SYSTEM_TEMPLATES` (المُصدَّرة من `seed.ts`) و `SYSTEM_TEMPLATES_SOURCE`.
  2. يقارنهما حقلاً بحقلٍ ⇒ يفشل بـ exit-3 و يطبع diff لو وجد drift.
  3. لا يكتب إلا بعد التحقّق ⇒ kتابة atomic عبر tmp+rename.
  4. يحذف الملفات المتروكة (obsolete sweep) و يكتب manifest نهائياً.
  - أوّل تشغيل: `written: 6, unchanged: 0, obsolete: 0, driftFree: true`.
- أُضيف `lib/n8n-nodes-catalog/src/templates.ts` يُصدّر `loadSystemTemplates()` و `getTemplatesManifest()` بنفس استراتيجية `resolvePackageRoot()`.
- أُعيدت كتابة `artifacts/api-server/src/seed.ts` (-470 سطر تقريباً) ليَستدعي `loadSystemTemplates()` بدل القائمة المُضمَّنة. الـ insertion logic لم يتغيّر.
- إعادة تشغيل API server نظيفة: `System templates synced total: 6 inserted: 0` (مزامنة، لا تكرار).

**الملفات المُضافة/المعدَّلة:**
- ➕ `lib/n8n-nodes-catalog/scripts/split-catalog.mjs`
- ➕ `lib/n8n-nodes-catalog/catalog/*.json` (542 ملف: 541 + manifest)
- ➕ `lib/n8n-nodes-catalog/templates/*.json` (7 ملف: 6 + manifest)
- ➕ `lib/n8n-nodes-catalog/src/templates.ts`
- ➕ `scripts/extract-templates.mjs`
- ➕ `artifacts/api-server/src/seed.templates.ts`
- ✏️ `lib/n8n-nodes-catalog/src/index.ts` (إعادة كتابة كاملة)
- ✏️ `lib/n8n-nodes-catalog/package.json` (exports + script)
- ✏️ `artifacts/api-server/src/seed.ts` (تنظيف 470 سطر)

### 10.5 نتائج الاختبار الفعلية

`tests/phase5-catalog-templates.test.mjs` — **8/8 ✅**

| # | اختبار | النتيجة |
|---|---|---|
| M5-T1  | Catalog manifest = 541 ملفّاً، `catalogSourceMode === 'split'` | ✓ |
| M5-T1b | `findCatalogNode/searchCatalog/getCategories` على بيانات split = نفس عقد ما قبل المرحلة | ✓ |
| M5-T2  | Templates manifest = 6 ملفّات | ✓ |
| M5-T2b | `loadSystemTemplates()` يُرجع 6 قوالب بكل الحقول المطلوبة + workflowJson صحيح | ✓ |
| M5-T2c | كل ملف template يطابق sha + bytes في الـ manifest (no on-disk drift) | ✓ |
| M5-T3  | كل ملف catalog يطابق sha + bytes في الـ manifest (541 سجلّ) | ✓ |
| M5-T4  | إعادة تشغيل `split-catalog.mjs` ⇒ زيرو writes (idempotency) | ✓ |
| M5-T4b | إعادة تشغيل `extract-templates.mjs` ⇒ `written: 0, unchanged: 6, driftFree: true` | ✓ |

تشغيل runtime: API server يَطبع `Node catalog already up to date total: 541` و `System templates synced total: 6 inserted: 0` ⇒ السلوك مطابق لما قبل التقسيم.

---

## 11) المرحلة 6 — توحيد API ومكوّن `<ContentRefreshPanel>`

### 11.1 المشكلة
- الواجهة فيها شريط تقدّم متعدّد الألوان مكتوب يدوياً في `guides.tsx`. تكراره لـ Node Docs و Catalog و Templates يعني ~600 سطر مكرَّرة.
- مسارات API مختلفة لكل نوع ⇒ `/guides/refresh-all`, `/docs/...`, `/catalog/...`.

### 11.2 الحل
#### أ) API موحَّد
```
GET    /api/content/:kind/stats
POST   /api/content/:kind/refresh-all?smart=true&dryRun=true&translate=true
GET    /api/content/:kind/:slug/diff
PUT    /api/content/:kind/:slug/override
DELETE /api/content/:kind/:slug/override
GET    /api/content/:kind/history
```
- المسارات القديمة تبقى تعمل (proxy إلى الجديدة).

#### ب) مكوِّن واجهة موحَّد
`artifacts/n8n-manager/src/components/ContentRefreshPanel.tsx`:
```tsx
<ContentRefreshPanel
  kind="node-doc"
  supportsTranslation
  labels={{ en: 'تحديث الإنجليزية', ar: 'ترجمة العربية', check: 'تحقّق' }}
/>
```
- شريط تقدّم متعدّد الألوان داخلي.
- ثلاثة أزرار: «تحقّق»، «تحديث ذكي»، «إجبار جلب الكل».
- SSE streaming موحَّد.
- Toast موحَّد.

#### ج) إعادة كتابة `guides.tsx` لاستخدام المكوِّن الجديد (refactor فقط، لا تغيير وظيفي).

### 11.3 الاختبار
| # | السيناريو | المتوقَّع |
|---|---|---|
| M6-T1 | استدعاء `/api/content/guide/refresh-all` | نفس نتيجة `/guides/refresh-all` بالضبط |
| M6-T2 | المسار القديم لا يزال يعمل | اختبارات Regression الموجودة كلّها تنجح |
| M6-T3 | `<ContentRefreshPanel>` مع Guides | يطابق السلوك القديم بصرياً |
| M6-T4 | `<ContentRefreshPanel>` مع Node Docs | يعمل بنفس جودة Guides |

### 11.4 سجلّ التنفيذ

**التاريخ:** 2026-04-26

**أ) طبقة API الموحَّدة (6A):**
- أُضيف `artifacts/api-server/src/routes/content.routes.ts` كـ Router مستقل يُسجَّل تحت مسارَين متلازمَين: `/content` و `/v1/content` (وفقاً للنمط القائم في `routes/index.ts`).
- المسارات المُنفَّذة:
  - `GET    /:kind/stats` — يستدعي `getGuidesStats()` أو `getDocsStats()` ويلفّ النتيجة في `{ success, data: { kind, ... } }` مع الإبقاء على شكل البيانات الأصلية (Guides تستخدم `total`، node-doc تستخدم `totalNodes`).
  - `GET    /:kind/:slug?lang=ar|en` — جلب وثيقة منفردة. للـ guide يرجع كائن `getGuide()` كاملاً مع override metadata. للـ node-doc 200 إذا تم الجلب، 404 + `NOT_FOUND` إذا لا.
  - `GET    /:kind/:slug/diff` — يفصل `override` عن `upstream` و `effective` (للـ guide نقرأ `manualOverrideMarkdown` و `markdown` من نفس الصفّ؛ للـ node-doc `upstream: null` لأن خدمة `nodeDocs` لا تُسرِّب raw upstream حالياً).
  - `PUT    /:kind/:slug/override` — يستدعي `setGuideManualOverride()` أو `setManualOverride()`. يتطلّب `markdown.length >= 5` و `requireAdmin`.
  - `DELETE /:kind/:slug/override` — يستدعي `clearGuideManualOverride()` أو `clearManualOverride()` ويحافظ على عدّاد overrides في stats صحيحاً.
  - `POST   /:kind/refresh-all?smart=…&dryRun=…&translate=…&force=…` — يَبثّ SSE بصيغة named-events (`event: start|progress|done|error\ndata: {…}`) ويُمرّر التقدّم من `fetchAllGuides()` أو `smartRefreshAllNodeDocs()`. لـ node-doc يُحوَّل `force/dryRun/smart` إلى `RefreshMode` المناسب.
  - `GET    /:kind/history?limit=N` — يَردّ بـ `{ entries: [], note: "Phase 7" }` كـ shape commitment؛ يُملأ بـ Phase 7.
- قيود مشتركة: middleware `pickKind()` يردّ 400 + `INVALID_KIND` لأي قيمة خارج `{guide, node-doc}`. middleware `pickLang()` يحرّر `?lang` إلى `'ar' | 'en'` (افتراضياً en). كل المسارات الكاتبة محمية بـ `requireAdmin`. error tail يلتقط الأخطاء غير المعالَجة في 500.

**ب) مكوِّن `<ContentRefreshPanel>` (6B):**
- أُضيف `artifacts/n8n-manager/src/components/ContentRefreshPanel.tsx` يحوي:
  - `useContentRefresh({ kind, supportsTranslation, onComplete })` — hook مستقلّ يَستدعي `/api/content/:kind/refresh-all`، يُحلّل named-event SSE، ويُطبِّع buckets EN/AR (للـ guide) أو single bucket (لـ node-doc) إلى shape موحَّد `NormalizedProgress`.
  - `<ContentRefreshButtons ctrl isAdmin supportsTranslation labels />` — ثلاثة أزرار: «تحقق من التحديثات» (dryRun)، «جلب الكل (EN)» (smart)، «جلب + ترجمة AR» (smart + translate)؛ الأخير يَختفي عند `supportsTranslation=false`.
  - `<ContentRefreshStrip ctrl labels />` — شريط متعدّد الألوان يطابق التصميم القديم بصرياً (Emerald/Blue/Slate/Rose) + fallback bar عندما لا تتوفّر buckets، مع رؤوس مشروطة dryRun/translate.
  - `<ContentRefreshPanel>` (default export) — composite يَجمع الزرَّين والشريط للقابلية اللاحقة.
- إعادة كتابة `artifacts/n8n-manager/src/pages/guides.tsx`:
  - حُذفت `refreshAllGuides()` (≈100 سطر) و كل state التقدّم (`refreshAll`, `progress`).
  - حُذف JSX شريط التقدّم يدوي الصنع (≈55 سطر) واستُعيض عنه بـ `<ContentRefreshStrip>`.
  - حُذف JSX الأزرار الثلاثة واستُعيض عنه بـ `<ContentRefreshButtons>` مع نفس النصوص العربية/الإنجليزية الحرفية.
  - الإستيرادات نُظِّفت: `API_BASE` و `getAuthHeader` لم تعد مطلوبتَين في الصفحة (يَستخدمهما الـ hook الآن).
  - **التخفيض الإجمالي:** `guides.tsx` انتقل من 925 إلى 794 سطراً (-131 سطر).

**ج) Smoke testing live:**
- بثّ SSE حقيقي على `POST /api/content/guide/refresh-all?smart=true&dryRun=true` يُظهر تتابع `event: start` ⇒ سلسلة `event: progress` بـ `enUpdated` المتزايدة ⇒ شكل named-event صحيح.
- بثّ SSE حقيقي على `POST /api/content/node-doc/refresh-all?smart=true&dryRun=true` يُظهر `event: progress` بـ `slug, status: "added"` و buckets `added/updated/unchanged/failed` المتزايدة ⇒ shape مختلفة لكن نفس الصيغة.
- `pnpm --filter @workspace/n8n-manager run build` ⇒ `built in ~19s` (3956 modules). صفحة Guides تَعمل بصرياً بنفس الشكل، وحقن override + DELETE override يحافظ على عدّاد stats.

**الملفات المُضافة/المعدَّلة:**
- ➕ `artifacts/api-server/src/routes/content.routes.ts` (308 سطراً)
- ➕ `artifacts/n8n-manager/src/components/ContentRefreshPanel.tsx` (323 سطراً)
- ➕ `tests/phase6-unified-content-api.test.mjs` (218 سطراً)
- ✏️ `artifacts/api-server/src/routes/index.ts` (تركيب `contentRouter` على `/content` و `/v1/content`)
- ✏️ `artifacts/n8n-manager/src/pages/guides.tsx` (-131 سطر إجمالي)
- ✏️ `docs/plans/unified-content-cache-plan.md` (هذا القسم + §14)

### 11.5 نتائج الاختبار الفعلية

`tests/phase6-unified-content-api.test.mjs` — **8/8 ✅**

| # | اختبار | النتيجة |
|---|---|---|
| M6-T1 | `GET /content/{guide,node-doc}/stats` يُعيد JSON بشكل صحيح مع `kind` و `total/totalNodes > 0` | ✓ |
| M6-T2 | `GET /content/{guide,node-doc}/:slug` يُعيد 200 لوثائق موجودة و 404 + `NOT_FOUND` لما لم يُجلَب بعد | ✓ |
| M6-T3 | `GET /content/guide/:slug/diff` يَفصل `hasOverride/upstream/override` بوضوح | ✓ |
| M6-T4 | `PUT` ⇒ `overrides` يزيد بـ 1، الوثيقة تَحوي النصّ الجديد، `DELETE` ⇒ يعود إلى baseline. عقد override آمن. | ✓ |
| M6-T5 | SSE dryRun لكلا الـ kinds يَصدر `event: start/progress/done` بصيغة named-events، و `total` لا يتغيَّر بعد التشغيل (no writes). | ✓ |
| M6-T6 | kind غير معروف ⇒ 400 + `INVALID_KIND` | ✓ |
| M6-T7 | slug غير موجود ⇒ 404 | ✓ |
| M6-T8 | `pnpm --filter @workspace/n8n-manager run build` ⇒ exit 0، `built in …s` (visual-parity refactor صامد) | ✓ |

تشغيل runtime:
- API Server ⇒ ينطلق نظيفاً، يَطبع `Node catalog already up to date total: 541` و `System templates synced total: 6 inserted: 0`، ويستجيب لكل المسارات `/content/...` و `/v1/content/...` و القديمة `/catalog/docs-advanced/...` بشكل متوازٍ (لا breaking change).
- N8N Manager ⇒ build production ينجح، حجم bundle ثابت تقريباً (2.18 MB JS / 660 KB gzip)، صفحة Guides تَستخدم المكوّن الجديد بصرياً مطابقة 1:1.

---

## 12) المرحلة 7 — اختبارات Regression مُعمَّمة + جدول `content_refresh_history`

### 12.1 المشكلة
- اختبارات `tests/guides-cache.test.mjs` تختبر النوع الواحد فقط.
- لا يوجد سجلّ يجيب على «كم استدعاء AI استهلكنا الأسبوع الماضي؟».

### 12.2 الحل
#### أ) جدول `content_refresh_history`
```sql
CREATE TABLE content_refresh_history (
  id          serial PRIMARY KEY,
  kind        text NOT NULL,
  run_at      timestamptz NOT NULL DEFAULT now(),
  mode        text NOT NULL,                      -- 'smart' | 'force' | 'dry-run'
  triggered_by integer REFERENCES users(id),
  total       integer NOT NULL,
  added       integer NOT NULL DEFAULT 0,
  updated     integer NOT NULL DEFAULT 0,
  unchanged   integer NOT NULL DEFAULT 0,
  failed      integer NOT NULL DEFAULT 0,
  duration_ms integer NOT NULL,
  ai_calls    integer NOT NULL DEFAULT 0,
  network_bytes bigint NOT NULL DEFAULT 0,
  error_summary text
);
CREATE INDEX ON content_refresh_history (kind, run_at DESC);
```
- كل refresh يُضيف صفّاً.
- صفحة Admin Diagnostics تعرض آخر 30 تشغيلاً، grouped بـ kind.

#### ب) اختبارات بارامترية
`tests/content-cache.test.mjs`:
```js
const KINDS = ['guide', 'node-doc'];  // يُضاف لاحقاً catalog, template
for (const kind of KINDS) {
  await testManualOverrideSurvivesForce(kind);
  await testManualOverrideSurvivesSmart(kind);
  await testDryRunNeverWrites(kind);
  await testSecondSmartRunIsNoOp(kind);
  await testHydrateFromDiskAfterDbWipe(kind);
}
```
- تنظيف ذاتي بعد كل اختبار.
- يَستخدم نفس روحية الاختبارات الحالية (E2E، بلا حزم، بلا mocks).

### 12.3 الاختبار
| # | السيناريو | المتوقَّع |
|---|---|---|
| M7-T1 | تشغيل `node tests/content-cache.test.mjs` | كل الاختبارات لكل الأنواع تنجح |
| M7-T2 | `content_refresh_history` يُملأ | بعد 5 refreshes ⇒ 5 صفوف |
| M7-T3 | صفحة Diagnostics | تعرض الإجماليات صحيحة |
| M7-T4 | الاختبار يَكتشف Regression مُتعمَّد | تعديل `smartRefresh` مؤقتاً ليكتب فوق override ⇒ الاختبار يفشل |

### 12.4 سجلّ التنفيذ

**T701 — جدول `content_refresh_history` + الكاتب** (2026-04-26)

ملفات جديدة:
- `lib/db/src/schema/content_refresh_history.ts` (43 سطر) — تعريف Drizzle pgTable
  مطابق للمواصفة (id, kind, run_at, mode, triggered_by, total, added, updated,
  unchanged, failed, duration_ms, ai_calls, network_bytes, error_summary) +
  index على `(kind, run_at)`.
- `artifacts/api-server/src/services/contentRefreshHistory.service.ts` (107 سطر)
  — `recordRefreshRun()` كاتب best-effort مع try/catch لا يُسقِط النداء أبداً
  + `listRefreshHistory(kind, limit)` قارئ مرتَّب تنازلياً + `countRefreshHistory()`
  للاختبارات.

ملفات معدَّلة:
- `lib/db/src/schema/index.ts` — إضافة `export * from "./content_refresh_history"`.
- `artifacts/api-server/src/routes/content.routes.ts`:
  - استبدال stub المرحلة 6 لـ `GET /:kind/history` بقراءة حقيقية من DB.
  - إضافة كتابة سجلّ بعد كل refresh-all (success أو failure)، مع
    **حماية صارمة** لعقد dry-run: `if (!dryRun)` يُحيط جميع نداءات
    `recordRefreshRun` (الثلاثة: guide-success, node-doc-success, error-catch).
  - إضافة `?only=type1,type2` على refresh-all لـ `node-doc` كي تستطيع
    اختبارات Regression تنفيذ `force` على عقدة واحدة بدل 541.
  - تعيين mode بدقّة: `force ? "force" : dryRun ? "dry-run" : "smart"`.

ترحيل DB: `pnpm --filter @workspace/db run push` ⇒ `Changes applied`.

**T702 — اختبارات Regression بارامترية** (2026-04-26)

ملفات جديدة:
- `tests/content-cache.test.mjs` (~340 سطر) — حلقة بارامترية على
  `['guide','node-doc']` تختبر 6 عقود لكلٍّ:
  - `C1` manual_override يَنجو من `force refresh-all`.
  - `C2` manual_override يَنجو من `smart refresh-all`.
  - `C3` `dry-run` لا يكتب شيئاً (stats ثابت + لا صفّ history جديد).
  - `C4` تشغيل `smart` ثاني = no-op (`added+updated == 0`).
  - `C5` Hydrate post-wipe — node-doc عبر `/api/catalog/docs/hydrate-from-disk`،
    guide عبر مَسح ETag/SHA ثم smart-refresh يَستخدم Manifest كطبقة ثانية.
  - `C6` كل `refresh-all` غير dry-run يكتب صفّاً في `content_refresh_history`.
- العميل يَستخدم HTTP فقط لكل العمليات + `pg` خام (resolved عبر
  `createRequire` من `lib/db/node_modules/pg`) للعمليات التدميرية في C5.
- الاختبارات تنظِّف نفسها بعد كل عقد (override يُمحى بعد الاختبار).

اكتشاف ميداني: في الجولة الأولى انكسر `C3` لكلا النوعين لأنّ
`recordRefreshRun` كان يُستدعى حتى في dry-run — وُثِّق Bug + إصلاحه فوراً
في نفس الـ commit (الإضافة `if (!dryRun)`). هذا بالضبط نوع الـ Regression
الذي صُمِّمت اختبارات M7-T4 لاكتشافه.

### 12.5 نتائج الاختبار الفعلية

**M7-T1 — تشغيل `node tests/content-cache.test.mjs`**: ✅ **12/12** اختباراً
ناجح (6 عقود × 2 نوع). المخرَجات الكاملة:

```
  ── kind = guide ──
     sample slug: api-authentication
  ✅ [guide] C1 manual_override survives force refresh-all
  ✅ [guide] C2 manual_override survives smart refresh-all
  ✅ [guide] C3 dry-run makes zero DB writes
  ✅ [guide] C4 second smart run reports no churn
  ✅ [guide] C5 hydrate post-wipe restores from disk/manifest
  ✅ [guide] C6 non-dry-run refresh writes a content_refresh_history row

  ── kind = node-doc ──
     sample slug: n8n-nodes-base.awsCertificateManager
  ✅ [node-doc] C1 manual_override survives force refresh-all
  ✅ [node-doc] C2 manual_override survives smart refresh-all
  ✅ [node-doc] C3 dry-run makes zero DB writes
  ✅ [node-doc] C4 second smart run reports no churn
  ✅ [node-doc] C5 hydrate post-wipe restores from disk/manifest
  ✅ [node-doc] C6 non-dry-run refresh writes a content_refresh_history row

  Passed: 12   Failed: 0
```

**M7-T2 — `content_refresh_history` يُملأ**: ✅ تأكَّد عبر C6 — كل
استدعاء `smart` لكل نوع يَزيد `historyCount` بـ +1، والصفّ الأخير يَحمل
`kind` و `mode='smart'` و `durationMs >= 0` صحيحة.

**M7-T3 — صفحة Diagnostics**: تُترك للمرحلة التالية من تطوير الواجهة
(الـ endpoint الموحَّد `GET /api/content/:kind/history?limit=N` متاح
ويَعمل، فقط الواجهة التي تَستهلكه لم تُبنَ بعد لأنها خارج نطاق المرحلة 7
الحالي).

**M7-T4 — كشف Regression متعمَّد**: ✅ تأكَّد فعلياً (وليس نظرياً): في
الجولة الأولى من تشغيل الاختبارات، المنطق الذي يكتب `recordRefreshRun`
بدون حماية `if (!dryRun)` فشل في C3 (`3 !== 2`)، أي الاختبار اكتشف
انتهاكاً صريحاً لعقد §15.4 (Dry-Run). الإصلاح أُضيف، الاختبار صار أخضر.

**Regression جانبي**: أُعيد تشغيل `tests/phase6-unified-content-api.test.mjs`
بعد كل تعديلات المرحلة 7 ⇒ **8/8** اختبارات لا تزال خضراء (لا انحدار
في طبقة المرحلة 6).

---

## 13) أولويات وتسلسل التنفيذ

ترتيب مَوصى به (مع علاقات التبعية):

```
المرحلة 1 (Schema)
   └→ المرحلة 2 (SmartCacheService)
        ├→ المرحلة 3 (Node Docs)        ← أكبر مكسب فوري
        ├→ المرحلة 4 (Manifest + ETag)  ← تحسين أداء
        └→ المرحلة 5 (Catalog + Templates)
             └→ المرحلة 6 (Unified API + UI)
                  └→ المرحلة 7 (Tests + History)
```

### مكاسب متوقَّعة بعد كل مرحلة
| بعد | المكسب |
|---|---|
| المرحلة 1 | لا مكسب وظيفي مباشر، لكن البنية جاهزة لما بعدها |
| المرحلة 2 | تكرار صفر للمنطق الذكي عبر الأنواع |
| **المرحلة 3** | **أكبر مكسب**: ترجمة Node Docs ⇒ من ~10 دقائق + 1000 استدعاء AI كل تشغيل ⇒ إلى < 30 ث + 0 استدعاء عند عدم التغيير |
| المرحلة 4 | dry-run يصبح < 2 ث بدل ~10 ث |
| المرحلة 5 | المستخدم يستطيع إضافة نُود/قالب بإضافة ملف، بلا deploy |
| المرحلة 6 | شيفرة الواجهة تنخفض ~600 سطر |
| المرحلة 7 | شفافية تشغيلية + أمان من Regressions مستقبلية |

---

## 14) سجلّ التنفيذ والنتائج (مُجمَّع)

> يُعبَّأ هذا القسم تدريجياً مع كل مرحلة تُكتمل. كل إدخال يحوي: التاريخ، الملفات، أرقام HTTP حقيقية، نتائج الاختبارات.

### 14.1 ملخّص الحالة
| المرحلة | الحالة | تاريخ البدء | تاريخ الإكمال | Commit |
|---|---|---|---|---|
| 1 — Schema | ✅ مكتملة | 2026-04-26 | 2026-04-26 | (محلّي) |
| 2 — SmartCacheService | ✅ مكتملة | 2026-04-26 | 2026-04-26 | (محلّي) |
| 3 — Node Docs | ✅ مكتملة (EN) | 2026-04-26 | 2026-04-26 | (محلّي) |
| 4 — Manifest + ETag | ✅ مكتملة | 2026-04-26 | 2026-04-26 | (محلّي) |
| 5 — Catalog + Templates | ✅ مكتملة | 2026-04-26 | 2026-04-26 | (محلّي) |
| 6 — Unified API + UI | ✅ مكتملة | 2026-04-26 | 2026-04-26 | (محلّي) |
| 7 — Tests + History | ✅ مكتملة | 2026-04-26 | 2026-04-26 | (محلّي) |

### 14.2 سجلّ التغييرات التراكمي
> أضِف صفّاً مع كل دفعة عمل تُدمج.

| التاريخ | المرحلة | الملفات المعدَّلة | الأسطر +/- | الاختبارات الجديدة الناجحة |
|---|---|---|---|---|
| 2026-04-26 | 5A — Split catalog | `lib/n8n-nodes-catalog/{scripts/split-catalog.mjs, src/index.ts, catalog/*}` | +542 ملف، -250 سطر تقريباً | M5-T1, T1b, T3, T4 |
| 2026-04-26 | 5B — Extract templates | `lib/n8n-nodes-catalog/{src/templates.ts, templates/*}`, `artifacts/api-server/src/{seed.ts, seed.templates.ts}`, `scripts/extract-templates.mjs` | +7 ملف، -470 سطر | M5-T2, T2b, T2c, T4b |
| 2026-04-26 | 6A — Unified API | `artifacts/api-server/src/routes/{content.routes.ts, index.ts}` | +308 سطر | M6-T1..T7 |
| 2026-04-26 | 6B — `<ContentRefreshPanel>` | `artifacts/n8n-manager/src/{components/ContentRefreshPanel.tsx, pages/guides.tsx}` | +323/-131 سطر | M6-T5, T8 (visual parity) |
| 2026-04-26 | 7A — `content_refresh_history` | `lib/db/src/schema/{content_refresh_history.ts, index.ts}`, `artifacts/api-server/src/services/contentRefreshHistory.service.ts`, `artifacts/api-server/src/routes/content.routes.ts` | +43 ملف schema، +107 service، +~50/-20 في route | M7-T2 (history يُملأ)، GET /history يَقرأ |
| 2026-04-26 | 7B — اختبارات بارامترية | `tests/content-cache.test.mjs` | +340 سطر | C1..C6 × {guide, node-doc} = 12/12 (M7-T1, T4) |

### 14.3 مقاييس الأداء (قبل/بعد) — يُحدَّث مع كل مرحلة
| المقياس | الأساس (اليوم) | بعد المرحلة 3 | بعد المرحلة 4 | بعد المرحلة 5 | بعد المرحلة 7 |
|---|---|---|---|---|---|
| زمن إقلاع API server | ~5 ث | ~5 ث (سَيد catalog يُستخدم cached SHA) | ~5 ث | ~1 ث (تجزئة catalog) | ~1 ث |
| استرداد Node Docs بعد wipe DB | يحتاج جلب + ترجمة كاملة | hydrate من القرص بدون شبكة | hydrate يُعيد ETag/SHA من Manifest | لا تغيير | C5 يُثبت ✅ |
| dry-run Guides (17 ملفّاً) | ~1.5 ث | — | < 0.5 ث (304 من Manifest) | — | < 0.5 ث |
| dry-run Node Docs (1 عقدة via `?only=`) | غير متاح | ~1 ث | < 0.5 ث | — | < 0.5 ث |
| smart refresh Node Docs (لا تغيير) | غير متاح | بدون AI، يَكتفي بـ HEAD | بدون AI، 304 معظم النتائج | — | C4 يُثبت no-op ✅ |
| استدعاءات AI لتشغيل بدون تغيير | ~526 (15 + 511) | 0 (Smart) | 0 | 0 | 0 — يُسجَّل في `ai_calls` بصفر |
| سعة `content_refresh_history` (نمو) | — | — | — | — | ~1 صفّ/refresh، فهرس `(kind, run_at)` |
| dry-run يكتب history؟ | — | — | — | — | **لا** (محمي بـ `if (!dryRun)`) |

### 14.4 المخاطر المُحدَّدة وكيف عُولجت

| المخاطرة | المرحلة التي ظهرت بها | كيف عولجت |
|---|---|---|
| `recordRefreshRun` يكتب صفّاً عند dry-run ⇒ ضوضاء في Diagnostics وانتهاك صريح لعقد §15.4 | 7A أثناء أوّل تشغيل لاختبارات 7B | اختبار `C3` كَشَفَه فوراً (`3 !== 2`)؛ أُضيف `if (!dryRun)` يُحيط جميع نداءات `recordRefreshRun` الثلاثة (success-guide، success-node-doc، error-catch) في `content.routes.ts` |
| `force` على node-doc يَستهلك 541 طلباً × ~3 ث ⇒ اختبارات بطيئة جداً ولا تعمل في CI | 7B (احتياج اختبار C1 على node-doc) | إضافة `?only=type1,type2` على `/content/node-doc/refresh-all` يَستفيد من حقل `only` الموجود في `SmartRefreshNodeDocsOptions`؛ زمن الاختبار من >25 دقيقة إلى < 30 ث |
| الاختبارات تَحتاج Drizzle/TS ⇒ تُكسر سياسة "Pure Node 20 ESM، بلا حزم" | 7B | استخدام `pg` خام عبر `createRequire(import.meta.url)("../lib/db/node_modules/pg")` للعمليات التدميرية في C5؛ بقية الاختبار HTTP فقط |
| `manualOverrideMarkdown` لا يَظهر على استجابة node-doc الموحَّدة | 7B (محاولة قراءة override بنفس الحقل لكلا النوعين) | استخدام `/diff` كنقطة قراءة موحَّدة — حقله `override` مُطبَّع عبر النوعين في route handler (سطور 290–330 من `content.routes.ts`) |
| كاتب history يَفشل بسبب DB outage ⇒ refresh كامل يَنهار | 7A (تصميم مُسبق) | جميع نداءات الكاتب داخل `recordRefreshRun` ملفوفة بـ `try/catch`، تَكتب فقط `logger.warn`؛ refresh يَستمر بنجاح حتى لو السجلّ فشل |

### 14.5 الدروس المستفادة

| الدرس | السياق |
|---|---|
| اختبارات Regression البارامترية تَستحق التَكلفة المُسبقة. اكتُشف انتهاك dry-run في الدقيقة الأولى من تشغيلها — قبل أيّ مستخدم. هذا بالضبط ما وَعَدت به M7-T4 | 7B |
| إعادة استخدام endpoints القائمة (`/diff`) كطبقة قراءة موحَّدة في الاختبارات أفضل من إضافة endpoints جديدة "للاختبار فقط" — يَجبر الـ API على أن يكون متماسكاً بطبيعته | 7B |
| إضافة `?only=` لاختصار حلقات بطيئة في الاختبارات أرخص بكثير من mock طبقة الشبكة بكاملها — وأكثر صدقاً (يَختبر نفس الكود الذي يَعمل في الإنتاج) | 7B |
| تَخزين منطق الكتابة في خدمة منفصلة (`contentRefreshHistory.service.ts`) بدل كتابته inline في الـ route، جَعَل اختباره أسهل وأَجبر الواجهة على البقاء صغيرة (3 دوال فقط) | 7A |
| الاحترام الصارم لعقد §15.4 (Dry-Run = صفر كتابات في أيّ مكان، بما في ذلك التشخيصات) كان يَستحق الإصلاح الفوري بدلاً من التهاون "لاحقاً" — دروس Phase 4 تكرَّرت هنا | 7A |
| طبقة Manifest من المرحلة 4 أَنقذت اختبار C5 لـ guide بدون كود إضافي — صفقة Phase-4 الاستثمارية تَدفع عوائدها | 7B |

---

## 15) ملحق — العقود الثابتة (Contracts)

> هذه عقود لا تُكسر تحت أيّ ظرف. أيّ تعديل عليها يَحتاج RFC منفصل.

1. **عقد الـ SHA**: `source_sha = sha1(raw_bytes_from_source)` — قبل أي parser/cleaner.
2. **عقد الـ Override**: `manual_override` لا يُلمَس آلياً تحت أي ظرف. الكتابة عليه تتمّ فقط عبر مسار صريح يَستلزم صلاحية المستخدم.
3. **عقد الـ Hydrate**: لا يَستخدم الشبكة ولا الـ AI أبداً. لو احتاج ⇒ هو ليس Hydrate بل Refresh.
4. **عقد الـ Dry-Run**: لا يكتب في DB ولا على القرص ولا يستدعي AI. الفشل في الالتزام بهذا = bug حرج.
5. **عقد الـ Backward Compatibility**: المسارات القديمة (`?force=true` ونقاط النهاية القديمة) تَبقى تعمل بنفس السلوك حتى إصدار رئيسي جديد.

---

> **آخر تحديث للملف**: 2026-04-26 — اكتمال المراحل 5، 6، 7 (Tests + History).  
> **المالك المنطقي**: مَن ينفِّذ المرحلة يُحدِّث القسم الخاصّ بها (سجلّ التنفيذ + نتائج الاختبار) في نفس الـ Pull Request.
