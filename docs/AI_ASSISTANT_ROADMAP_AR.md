# خارطة طريق تطوير المساعد الذكي — N8N AI Agent Manager

> **الإصدار:** 1.0  
> **التاريخ:** 28 أبريل 2026  
> **النطاق:** خمس مراحل متتالية (4 بناء + 1 ضمان جودة) لتحويل المساعد من *مولِّد JSON متقدّم* إلى *مستشار n8n احترافي* قابل للقياس.  
> **الجمهور:** مهندسو الـ backend والـ AI، مديرو المنتج، فريق ضمان الجودة.

---

## جدول المحتويات

1. [خلفيّة وتقدير الوضع الحالي](#خلفية-وتقدير-الوضع-الحالي)
2. [مبادئ توجيهيّة (تقاطعيّة لكلّ المراحل)](#مبادئ-توجيهية-تقاطعية-لكل-المراحل)
3. [بوّابات الجودة (Quality Gates) ومعايير الانتقال](#بوابات-الجودة-quality-gates-ومعايير-الانتقال)
4. [مؤشّرات الأداء الجوهريّة (KPIs)](#مؤشرات-الأداء-الجوهرية-kpis)
5. [Phase 0 — البنية التحتيّة الممكِّنة](#phase-0--البنية-التحتية-الممكنة)
6. [Phase 1 — المكاسب الفوريّة (Quick Wins)](#phase-1--المكاسب-الفورية-quick-wins)
7. [Phase 2 — القفزة المعرفيّة (Knowledge Leap)](#phase-2--القفزة-المعرفية-knowledge-leap)
8. [Phase 3 — جودة الإنتاج (Production Quality)](#phase-3--جودة-الإنتاج-production-quality)
9. [Phase 4 — التميّز وتجربة المستخدم](#phase-4--التميز-وتجربة-المستخدم)
10. [Phase 5 — ضمان الجودة الشامل والنتائج المرجوّة](#phase-5--ضمان-الجودة-الشامل-والنتائج-المرجوة)
11. [الملاحق](#الملاحق)

---

## خلفيّة وتقدير الوضع الحالي

### البنية الراهنة (28 أبريل 2026)

المساعد يعتمد **خطّ أنابيب متعدّد المحرّكات**:

| المرحلة | الخدمة | النموذج | الدور |
|---|---|---|---|
| تنقية | `inputSanitizer.service.ts` | — | منع prompt-injection |
| تصنيف النيّة | `intentDetector.service.ts` | GPT-4o-mini | create / modify / query |
| توضيح | `clarificationDetector.service.ts` | GPT-4o-mini | أسئلة قبل البناء |
| التوليد | `agenticEngine.service.ts` | GPT-4o + 8 أدوات | حلقة tool-calling حدّها 10 تكرارات |
| النقد | داخل `agenticEngine` | Gemini 2.5 Pro | تقييم 0-100 |
| الإصلاح الذاتي | `selfHealingLoop.service.ts` | GPT-4o | حدّ 3 محاولات استيراد |
| التحقّق الحيّ | `workflowTestRunner.service.ts` | — | تشغيل تجريبي حقيقي |

### نقاط القوّة (يجب الحفاظ عليها)

- **Schema-grounded generation** — لا تخمين typeVersion.
- **`confirmedInstalledInN8n` priority** — يفضّل العقد الموجودة فعلاً.
- **Self-Healing فعليّ** يستورد إلى n8n حقيقي قبل الإعلان عن النجاح.
- **Multi-model orchestration** — كلّ نموذج في موضعه الأمثل.
- **بثّ SSE بأحداث دلاليّة غنيّة**.
- **Versioning للـ workflows** عبر جدول `workflow_versions`.

### الفجوات التي تعالجها هذه الخارطة

| رمز | الفجوة | الأثر |
|---|---|---|
| G1 | لا embeddings — RAG كلمات مفتاحيّة فقط | Recall 50-70% فقط |
| G2 | لا تحقّق دلاليّ من توافق outputs/inputs | فشل تشغيل بعد استيراد ناجح |
| G3 | Templates لا تُستخدم كمرجع | بناء من الصفر دائماً |
| G4 | لا ذاكرة طويلة الأمد للمشروع | تكرار أسئلة معروفة |
| G5 | أدوات الوكيل ناقصة (لا credentials, لا templates) | فشل استيراد + workflows من الصفر |
| G6 | فرع `query` لا يستخدم الأدوات | إجابات من ذاكرة LLM فقط |
| G7 | لا feedback loop | التحسّن متوقّف |
| G8 | Refinement مرّة واحدة | سقف جودة مصطنع |
| G9 | لا anti-patterns catalog | تحليل غير منهجي |
| G10–G15 | فجوات تشغيليّة (rate limits, observability, A/B) | صعوبة قياس وتحسين |

---

## مبادئ توجيهيّة (تقاطعيّة لكلّ المراحل)

| المبدأ | التطبيق |
|---|---|
| **Test-First** | كلّ ميزة تكتب اختباراتها قبل أو مع الكود (vitest للوحدات، playwright للـ E2E). |
| **Observability-by-default** | كلّ خدمة جديدة تنشر metrics إلى `agent_metrics` جدول مركزي + structured logs. |
| **Backward-compatible** | لا تكسر مسارات قائمة. الميزات الجديدة خلف feature flags في `app_settings`. |
| **Ship small, ship often** | لا PR > 500 سطر. كل R-item قابل للنشر باستقلاليّة. |
| **Docs alongside code** | كلّ مرحلة تحدّث `docs/AI_ASSISTANT_ROADMAP_AR.md` (هذا الملف) ببقعة "ما أُنجز" + ملحق نتائج اختبار + مذكّرات قرار. |
| **Cost-conscious** | كلّ استدعاء LLM يسجّل `prompt_tokens` و `completion_tokens` و `estimated_cost_usd`. لوحة مراقبة شهريّة. |
| **Bilingual parity** | كلّ نصّ موجَّه للمستخدم يدعم AR/EN. التشخيصات ورسائل الأخطاء بالعربيّة الفصحى الواضحة. |
| **Privacy-aware** | لا data خام للمستخدم في logs (sanitize قبل التسجيل). أيّ تخزين للذاكرة طويلة الأمد يكون per-user opt-in. |

---

## بوّابات الجودة (Quality Gates) ومعايير الانتقال

لا يبدأ Phase التالي قبل عبور **كلّ بوّابات** Phase الحالي. كلّ بوّابة قابلة للقياس آلياً.

| البوّابة | التعريف | الأداة |
|---|---|---|
| **G-Type** | صفر أخطاء TypeScript على الكود الجديد | `pnpm tsc --noEmit` |
| **G-Lint** | صفر تحذيرات ESLint/Prettier على الكود الجديد | `pnpm lint` |
| **G-Unit** | تغطية اختبارات الوحدة ≥ 80% للخدمات الجديدة | `vitest --coverage` |
| **G-Integration** | كلّ tool جديد له اختبار تكامل واحد على الأقلّ ضدّ n8n حقيقي (mock/staging) | `vitest run integration/` |
| **G-E2E** | السيناريوهات الذهبيّة الـ 12 (مذكورة في Phase 5) تنجح | playwright |
| **G-Perf** | لا regression > 15% على زمن الاستجابة المتوسّط مقابل baseline | bench script |
| **G-Cost** | لا زيادة > 20% على متوسّط cost per workflow مقابل baseline | metrics dashboard |
| **G-Doc** | كلّ R-item جديد له بقعة موثَّقة في هذا الملف | يدوي + grep |
| **G-Rollback** | كلّ تغيير DB schema له migration عكسيّ مُختبَر | drizzle migration test |

---

## مؤشّرات الأداء الجوهريّة (KPIs)

تُقاس قبل بدء Phase 1 (baseline) وبعد إنجاز كلّ Phase، وتُسجَّل في `kpi_snapshots`.

### KPIs الجودة (Quality)

| KPI | الوصف | Baseline متوقَّع | الهدف بعد Phase 4 |
|---|---|---|---|
| **WSR** — Workflow Success Rate | نسبة المسارات التي تستورد + تُشغَّل بنجاح من أوّل محاولة | ~55% | ≥ 92% |
| **AVG-Quality-Score** | متوسّط نتيجة Gemini Review | ~74 | ≥ 90 |
| **Self-Heal-Rate** | نسبة المسارات التي احتاجت self-heal | ~38% | ≤ 12% |
| **Self-Heal-Success-Rate** | نجاح self-heal عند استدعائه | ~70% | ≥ 95% |
| **Critical-Issues-per-Analysis** | متوسّط مشاكل critical في تحليل المسارات الموجودة | ~2.1 | ≤ 0.3 |

### KPIs المعرفة (Knowledge)

| KPI | الوصف | Baseline | الهدف |
|---|---|---|---|
| **Recall@5** | نسبة الاستعلامات التي يكون فيها المصدر الصحيح ضمن أوّل 5 نتائج بحث | ~58% | ≥ 90% |
| **Citation-Coverage** | نسبة الإجابات التي تتضمّن مصدراً صريحاً | 0% | ≥ 85% |
| **Hallucination-Rate** | نسبة الإجابات التي تذكر nodes/features غير موجودة | ~12% | ≤ 1% |

### KPIs التجربة (UX)

| KPI | الوصف | Baseline | الهدف |
|---|---|---|---|
| **TTFB** — Time To First Byte (SSE) | زمن أوّل event SSE | ~1.8s | ≤ 1.0s |
| **Median-Time-To-Workflow** | زمن من بداية الطلب إلى workflow جاهز للاستيراد | ~28s | ≤ 18s |
| **CSAT** — Thumbs up rate | (👍) / (👍+👎) | غير مُقاس | ≥ 88% |
| **Clarification-Rate** | نسبة طلبات التوليد التي يقطعها clarification gate | ~25% | 10-15% (tighter) |
| **Re-prompt-Rate** | نسبة المستخدمين الذين يضغطون Regenerate | غير مُقاس | ≤ 8% |

### KPIs التشغيل (Operations)

| KPI | الوصف | Baseline | الهدف |
|---|---|---|---|
| **Cost-per-Workflow** | متوسّط $ لإنتاج workflow كامل | غير مُقاس مفصَّلاً | ≤ $0.18 |
| **p95-Latency** | 95% من الطلبات تنتهي خلال هذا الزمن | غير مُقاس | ≤ 35s |
| **Tool-Call-Failure-Rate** | نسبة فشل استدعاءات الأدوات | غير مُقاس | ≤ 2% |
| **Uptime** | جاهزيّة `/api/chat/conversations/:id/generate` | — | ≥ 99.5% |

---

## Phase 0 — البنية التحتيّة الممكِّنة

> **المدّة المقدَّرة:** 5-7 أيّام عمل.  
> **لماذا قبل Phase 1:** ميزات لاحقة كثيرة (R11, R20, R15, R14) تتطلّب pgvector وجدولاً مركزيّاً للأحداث. بناؤها مرّة واحدة في البداية يمنع تكلفة retrofitting لاحقاً.

### نطاق Phase 0

| البند | الوصف |
|---|---|
| **0.1** | تفعيل extension `pgvector` في PostgreSQL |
| **0.2** | جدول `embeddings_index` (polymorphic: node_doc, template, guide, qa) |
| **0.3** | جدول `agent_metrics` لتسجيل كلّ استدعاء LLM (tokens, cost, latency, success) |
| **0.4** | جدول `feedback_events` لتسجيل thumbs up/down مع full context |
| **0.5** | جدول `kpi_snapshots` لتسجيل قياسات KPIs الأسبوعيّة |
| **0.6** | خدمة `embeddings.service.ts` تُغلِّف `text-embedding-3-small` مع caching |
| **0.7** | جدول `feature_flags` (key, enabled, rollout_percent) للتدوير الآمن |
| **0.8** | باقة `@workspace/observability` لتوحيد logger بنفس الـ context |

### الملفّات المُنشأة/المعدَّلة في Phase 0

```
lib/db/src/schema/embeddings_index.ts         (جديد)
lib/db/src/schema/agent_metrics.ts            (جديد)
lib/db/src/schema/feedback_events.ts          (جديد)
lib/db/src/schema/kpi_snapshots.ts            (جديد)
lib/db/src/schema/feature_flags.ts            (جديد)
lib/db/migrations/XXXX_pgvector_init.sql      (جديد)
artifacts/api-server/src/services/embeddings.service.ts  (جديد)
artifacts/api-server/src/lib/featureFlags.ts             (جديد)
artifacts/api-server/src/lib/metrics.ts                  (جديد)
.env.example                                  (تحديث: EMBEDDINGS_MODEL)
```

### مخطّط جدول `embeddings_index` (مقترَح)

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE embeddings_index (
  id            BIGSERIAL PRIMARY KEY,
  source_type   TEXT NOT NULL,            -- 'node_doc' | 'template' | 'guide' | 'qa' | 'workflow'
  source_id     TEXT NOT NULL,            -- foreign key (varies by type)
  language      TEXT NOT NULL,            -- 'ar' | 'en'
  chunk_index   INTEGER NOT NULL,         -- index within source
  chunk_text    TEXT NOT NULL,            -- original text (for citation)
  chunk_tokens  INTEGER NOT NULL,
  embedding     vector(1536) NOT NULL,    -- text-embedding-3-small dim
  source_sha    TEXT NOT NULL,            -- to detect staleness
  metadata      JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (source_type, source_id, language, chunk_index)
);

CREATE INDEX idx_embeddings_vec ON embeddings_index 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_embeddings_source ON embeddings_index (source_type, source_id, language);
```

### خطّة الاختبار لـ Phase 0

| اختبار | الأداة | المتوقَّع |
|---|---|---|
| `embeddings.service.test.ts` | vitest | كائن نصّ → vector بطول 1536 + caching يمنع استدعاء OpenAI الثاني |
| migration up + down | drizzle-kit | لا diff بعد up→down→up |
| `featureFlags.test.ts` | vitest | flag معطَّل → false. مفعَّل بـ rollout 50% → true لـ ~50% من user IDs |
| Stress: 10k embeddings insert | bench script | < 60 ثانية، استخدام ذاكرة < 500MB |

### خطّة التوثيق لـ Phase 0

ملحق في هذا الملف بعنوان "Phase 0 — مكتمل" يحوي:
- ملخّص الـ migrations المطبَّقة
- جدول الجداول الجديدة + الحقول
- مثال كود لاستخدام `embeddings.service` و `featureFlags`
- أيّ قرارات معماريّة مأخوذة (مثل: لماذا ivfflat بدل hnsw؟)

### معايير القبول لـ Phase 0

- [ ] كلّ migration تطبَّق بنجاح على DB فارغ + DB موجود
- [ ] `embeddings.service` يستدعي OpenAI API بنجاح ويُعيد vectors
- [ ] caching يخفّض استدعاءات API بـ 90%+ في تكرار نفس النصّ
- [ ] feature flag بـ rollout=0 يحجب الميزة 100%
- [ ] لا تأثير سلبيّ على endpoint موجود (smoke test ينجح)

---

## Phase 1 — المكاسب الفوريّة (Quick Wins)

> **المدّة المقدَّرة:** 8-10 أيّام عمل.  
> **الفلسفة:** أعلى نسبة (أثر / جهد). كلّ بند هنا يُحَلّ مشكلة محسوسة للمستخدم اليوم.  
> **عدد البنود:** 5 (R20, R12, R23, R6, R7).

### R20 — حلقة التغذية الراجعة (Feedback Loop)

#### الهدف
تحويل thumbs up/down من زرّ بلا أثر إلى مصدر بيانات منظَّم يقود التحسينات اللاحقة.

#### المبرّر
بدون feedback مُهيكَل، أيّ تحسين لاحق سيكون "نظنّ أنّه أفضل" بدل "قِسنا أنّه أفضل".

#### الملفّات المتأثّرة
| الملفّ | التعديل |
|---|---|
| `lib/db/src/schema/feedback_events.ts` | جديد (Phase 0) |
| `artifacts/api-server/src/routes/chat.routes.ts` | إضافة `POST /messages/:id/feedback` |
| `artifacts/api-server/src/services/feedback.service.ts` | جديد |
| `artifacts/n8n-manager/src/pages/chat.tsx` | تفعيل الأزرار + إرسال + UI تأكيد |

#### خطوات التنفيذ
1. تصميم schema `feedback_events`: `message_id`, `user_id`, `rating` (`up`|`down`), `reason_tags` (JSONB array), `comment` (TEXT, optional), `context_snapshot` (JSONB يحوي tools called, model, score)، `created_at`.
2. Endpoint `POST /api/chat/messages/:id/feedback` يقبل `{rating, reasonTags?, comment?}`.
3. عند الضغط على 👎، popover يطلب اختيار سبب من قائمة (`workflow_failed`, `wrong_node`, `missing_step`, `verbose`, `slow`, `other`).
4. تخزين `context_snapshot` يجلَب من `agent_metrics` المرتبطة بنفس message_id.
5. لوحة مراقبة بسيطة `/admin/feedback` (للأدمن فقط) تُظهر معدّلات أسبوعيّة + breakdown حسب reason_tags.

#### خطّة الاختبار
| اختبار | السيناريو | المتوقَّع |
|---|---|---|
| Unit | إرسال feedback مرّتين لنفس message | الثاني يُحدّث، لا يُنشئ duplicate |
| Unit | feedback بـ rating غير صالح | 400 Bad Request |
| Integration | feedback مع context_snapshot | snapshot يُحفَظ كاملاً + قابل للاستعلام |
| E2E | نقر 👎 → اختيار سبب → تأكيد بصري | toast "شكراً، سنحسّن" + الأيقونة تبقى مظلَّلة |
| Smoke | لوحة `/admin/feedback` تعرض آخر 7 أيّام | جدول صحيح + رسوم |

#### خطّة التوثيق
- شرح schema `feedback_events` في الملحق
- وصف الـ endpoints الجديدة
- صورة ل lوحة `/admin/feedback`
- وصف كلّ `reason_tag` ومتى يُستخدَم

#### معايير القبول
- [ ] 99% من رسائل المساعد تظهر فيها أزرار feedback
- [ ] إرسال feedback أقلّ من 200ms (p95)
- [ ] لوحة الأدمن تُجدّد كلّ 5 دقائق
- [ ] Snapshot يحوي **كامل** context القرار (لا حقل null أساسي)

#### التقدير
**الجهد:** 1.5 يوم | **الخطورة:** منخفضة | **الأثر:** 🔴 حرج (أساس كلّ التحسينات اللاحقة)

---

### R12 — فرع الاستفسار يستخدم الأدوات

#### الهدف
عندما يصنّف `intentDetector` الرسالة بـ `query`، يجب أن يعمل المساعد بنفس قوّة الـ agentic loop (مع أدوات RAG مفعّلة)، لا أن يجاوب من ذاكرة GPT-4o التدريبيّة.

#### المبرّر
سؤال "ما عقد قواعد البيانات المتاحة؟" حالياً يُجاب من training data لـ GPT-4o (قد يذكر nodes غير موجودة في n8n الحالي). الحلّ: نفس الـ tool-calling لكن بـ system prompt مختلف يحضّ على الاستشهاد.

#### الملفّات المتأثّرة
| الملفّ | التعديل |
|---|---|
| `artifacts/api-server/src/routes/chat.routes.ts` | فرع `query` يستدعي `runQueryAgent` بدل GPT-4o مباشر |
| `artifacts/api-server/src/services/queryAgent.service.ts` | جديد |
| `artifacts/api-server/src/services/agentTools.ts` | إضافة `find_similar_template` (stub، يكتمل في R1) |

#### خطوات التنفيذ
1. إنشاء `queryAgent.service.ts` بـ GPT-4o + subset أدوات: `lookup_node_catalog`, `lookup_node_docs`, `list_available_workflows`, `get_workflow_details`, `find_similar_template`.
2. System prompt مخصّص: "أنت مساعد معرفي عن n8n الخاصّ بالمستخدم. **يجب** أن تستشهد بمصادرك في صيغة `[المصدر: <اسم العقدة|ID المسار>]`. إن لم تجد المعلومة في الأدوات، قُل ذلك صراحةً ولا تخمّن."
3. منع الـ JSON output لفرع query (يُعرَض كنصّ + citations).
4. رسائل query تخزَّن بـ `metadata.kind = "qa"` لتمييزها في analytics لاحقاً.

#### خطّة الاختبار
| سيناريو | الأداة | المتوقَّع |
|---|---|---|
| "ما العقد المتاحة لإرسال SMS؟" | E2E | يستدعي `lookup_node_catalog("sms")` و يذكر العقد المتوفّرة فعلاً + روابط |
| "ما الفرق بين Set و Edit Fields؟" | E2E | يستدعي `lookup_node_docs` للاثنين ويقارن |
| "كم workflow عندي؟" | E2E | يستدعي `list_available_workflows` ويعطي عدد دقيق |
| سؤال خارج النطاق ("ما الطقس؟") | E2E | يردّ "هذا خارج اختصاصي، أنا مساعد n8n" |
| Hallucination test (سؤال عن node موهوم) | E2E | يقول "لا أجد عقدة بهذا الاسم" بدل اختراع إجابة |

#### خطّة التوثيق
- ملحق "كيف يستجيب المساعد للأسئلة" مع 5 أمثلة كاملة (سؤال + tools called + إجابة + citations)
- شرح الفرق بين `runAgenticEngine` (للبناء) و `runQueryAgent` (للأسئلة)

#### معايير القبول
- [ ] 90%+ من إجابات query تحوي citation واحدة على الأقلّ
- [ ] Hallucination rate < 2% على مجموعة اختبار 50 سؤال
- [ ] متوسّط زمن إجابة query ≤ 8 ثوانٍ

#### التقدير
**الجهد:** 1.5 يوم | **الخطورة:** منخفضة | **الأثر:** 🔴 حرج (يُصلح أكبر فجوة في فهم القاعدة المعرفيّة)

---

### R23 — مفسّر الأخطاء بالعربيّة الواضحة

#### الهدف
تحويل أخطاء n8n التقنيّة الخامّة ("ECONNREFUSED 127.0.0.1:5432") إلى توصيف عربي مفهوم لمستخدم غير تقني، مع اقتراح خطوة تالية.

#### المبرّر
المستخدم العربي غير التقني يتلقّى اليوم أخطاء n8n الإنكليزيّة الخامّة في `AnalysisReport` و `self_heal_attempt`. هذا يحوّل تجربة "حلّ سحري" إلى "حائط مسدود".

#### الملفّات المتأثّرة
| الملفّ | التعديل |
|---|---|
| `artifacts/api-server/src/services/errorExplainer.service.ts` | جديد |
| `artifacts/api-server/src/services/selfHealingLoop.service.ts` | يستدعي `explainError()` قبل بثّ event |
| `artifacts/api-server/src/services/workflowAnalyzer.service.ts` | نفس الشيء |
| `artifacts/n8n-manager/src/pages/chat.tsx` | يعرض `humanFriendlyError` + `suggestedAction` بدل raw |

#### خطوات التنفيذ
1. كتالوج أخطاء معروفة في `errorExplainer.catalog.ts`:
   ```ts
   {
     pattern: /ECONNREFUSED.*:(\d+)/,
     ar: { title: "تعذّر الاتّصال بالخدمة على المنفذ {1}", action: "تأكّد من تشغيل الخدمة وصحّة الـ credentials" },
     en: { title: "Cannot connect to service on port {1}", action: "Verify the service is running and credentials are correct" }
   }
   ```
2. ~30 نمطاً شائعاً (auth failed، timeout، rate limit، invalid JSON، missing required field، إلخ).
3. Fallback: إذا لم يطابق نمطاً، استدعاء GPT-4o-mini للترجمة + تبسيط (مع كاش بـ MD5 من الخطأ).
4. تحديث UI: عند خطأ، يظهر العنوان بالعربيّة + زرّ "اعرض الأصلي" يُظهر الخطأ التقني.

#### خطّة الاختبار
| سيناريو | المتوقَّع |
|---|---|
| ECONNREFUSED 5432 | "تعذّر الاتّصال بقاعدة بيانات Postgres على المنفذ 5432..." |
| 401 Unauthorized من Slack | "Slack رفض الطلب — credentials غير صالحة أو منتهية" |
| Rate limit 429 من OpenAI | "تجاوزنا الحدّ المسموح من طلبات OpenAI — حاول بعد دقيقة" |
| خطأ غير معروف | يستدعي fallback LLM + يُخزَّن في cache |
| نفس الخطأ مرّتين | الثانية من cache (< 50ms) |

#### خطّة التوثيق
- جدول الأنماط الـ 30 المعتمدة
- مثال before/after للمستخدم
- كيف يُضاف نمط جديد

#### معايير القبول
- [ ] 80%+ من أخطاء production تُغطَّى بأنماط معروفة (لا fallback LLM)
- [ ] متوسّط طول explanation العربي بين 30-150 حرف
- [ ] كلّ explanation يحوي `suggestedAction`

#### التقدير
**الجهد:** 2 يوم | **الخطورة:** منخفضة | **الأثر:** 🔴 حرج (UX حاسم لمستخدم غير تقني)

---

### R6 — الوعي بالـ Credentials المتوفّرة

#### الهدف
أداة جديدة `list_available_credentials()` تكشف للوكيل قائمة credentials المعرّفة في n8n الحالي. الوكيل يربطها تلقائياً للعقد بدل ترك `credentials: {}` فارغاً.

#### المبرّر
أكبر سبب لفشل استيراد workflow اليوم: العقد تتطلّب credentials لكنّ JSON المُولَّد فارغ منها. n8n يرفض الاستيراد.

#### الملفّات المتأثّرة
| الملفّ | التعديل |
|---|---|
| `artifacts/api-server/src/services/n8n.service.ts` | إضافة `getCredentials()` يستدعي `GET /api/v1/credentials` |
| `artifacts/api-server/src/services/agentTools.ts` | تعريف + executor `list_available_credentials` |
| `artifacts/api-server/src/services/agenticEngine.service.ts` | تحديث system prompt: "إذا احتاجت العقدة credential، استدعِ list_available_credentials أوّلاً" |

#### خطوات التنفيذ
1. تنفيذ `getCredentials()` يُرجِع `[{id, name, type, createdAt}]` فقط (بدون secrets).
2. تعريف الأداة كـ ChatCompletionTool:
   ```ts
   {
     name: "list_available_credentials",
     description: "List credentials configured in the user's n8n. Use before adding any node that requires authentication.",
     parameters: { type: "object", properties: { credential_type?: { type: "string" } }, required: [] }
   }
   ```
3. تحديث system prompt بقاعدة جديدة: "FIFTH RULE: Any node that needs credentials MUST be wired to an existing credential ID returned by `list_available_credentials`. If none exists, document the missing credential in your final response."
4. عند عدم وجود credential مناسبة، الوكيل يُضمّن في الردّ ملاحظة: "⚠️ هذا المسار يحتاج credential من نوع `slackApi` — أضفه من إعدادات n8n أوّلاً."
5. Caching: نتيجة الأداة تُخزَّن في `n8nCache` لـ 5 دقائق.

#### خطّة الاختبار
| سيناريو | المتوقَّع |
|---|---|
| طلب workflow بـ Slack + يوجد credential من نوع slackApi | الوكيل يستخدمه في `node.credentials.slackApi.id` |
| طلب workflow بـ Stripe + لا يوجد credential | تحذير ظاهر في الردّ + JSON بدون credential field |
| credential بـ name مشابه ("Slack-Marketing" مع طلب يذكر "marketing") | الوكيل يفضّله |
| استدعاء الأداة مرّتين خلال 5 دقائق | الثانية من cache |

#### خطّة التوثيق
- شرح الـ tool الجديدة + parameters
- جدول credential types المدعومة في n8n مع متطلّباتها
- كيف يتعامل المساعد مع غياب credential

#### معايير القبول
- [ ] فشل استيراد بسبب credentials = صفر (للحالات التي يوجد فيها credential مناسب)
- [ ] إذا لم يوجد credential، الردّ يُحذّر بوضوح
- [ ] الـ tool لا تكشف secrets (فقط ID + name + type)

#### التقدير
**الجهد:** 1.5 يوم | **الخطورة:** منخفضة | **الأثر:** 🔴 حرج (يُصلح أكبر فشل استيراد)

---

### R7 — مُحلِّل URL الـ Webhook

#### الهدف
عند توليد `webhookTrigger`، الردّ يتضمّن full webhook URL جاهزاً للاستخدام (test + production) بدل أن يبحث المستخدم عنه يدوياً في n8n.

#### المبرّر
تجربة UX صغيرة لكنّها تعكس الاحترافيّة: المساعد يعرف base URL لـ n8n المربوط، فلماذا يجبر المستخدم على البحث؟

#### الملفّات المتأثّرة
| الملفّ | التعديل |
|---|---|
| `artifacts/api-server/src/services/n8n.service.ts` | `getWebhookBaseUrl()` (قراءة من إعدادات + env) |
| `artifacts/api-server/src/services/agenticEngine.service.ts` | post-processing: إذا workflow فيه webhook، أضف `_meta.webhookUrls[]` |
| `artifacts/n8n-manager/src/pages/chat.tsx` | شريط معلومات أزرق فيه الـ URLs + زرّ نسخ |

#### خطوات التنفيذ
1. قراءة `n8n_settings.base_url` + بناء `${baseUrl}/webhook/${node.parameters.path}` و `${baseUrl}/webhook-test/${path}`.
2. حقل metadata `_meta.webhookUrls` يُلحق بالـ workflow JSON قبل البثّ.
3. UI: chip يعرض الـ URL مع زرّ نسخ + اختيار test/production.

#### خطّة الاختبار
| سيناريو | المتوقَّع |
|---|---|
| workflow بـ webhook على path = "orders" | URL = `https://n8n.example.com/webhook/orders` يظهر |
| workflow بدون webhook | لا يظهر شريط |
| نسخ الـ URL | clipboard يحوي القيمة الصحيحة |
| n8n base URL غير معدّ | لا يظهر شريط (لا تتعطّل الواجهة) |

#### معايير القبول
- [ ] أيّ workflow فيه webhook يعرض الـ URL تلقائياً
- [ ] دعم test + production URLs بشكل واضح
- [ ] زرّ النسخ يعمل بـ Clipboard API

#### التقدير
**الجهد:** 0.5 يوم | **الخطورة:** منخفضة | **الأثر:** 🟢 منخفض-متوسّط (UX polish)

---

### مخرجات Phase 1 الكاملة

| المخرج | الكمّيّة |
|---|---|
| ملفّات جديدة | 6 (services + 1 schema) |
| ملفّات معدَّلة | 5 |
| اختبارات وحدة | ~22 |
| اختبارات تكامل | ~8 |
| اختبارات E2E | ~6 |
| تحديث هذا الملف | بقعة "Phase 1 — مكتمل" + ملحق نتائج اختبار |

### بوّابة الانتقال إلى Phase 2

- [ ] جميع KPIs Phase 1 مُقاسة ومسجَّلة في `kpi_snapshots`
- [ ] WSR ارتفع بـ ≥ 8 نقاط مئويّة (نتيجة R6)
- [ ] Hallucination rate انخفض بـ ≥ 50% (نتيجة R12)
- [ ] CSAT أوّل قياس > 75% (نتيجة R20 + R23)
- [ ] صفر regression على endpoints قائمة

---

## Phase 2 — القفزة المعرفيّة (Knowledge Leap)

> **المدّة المقدَّرة:** 18-24 يوم عمل.  
> **الفلسفة:** تحويل المساعد من "يعرف n8n عموماً" إلى "يعرف n8n الخاصّ بهذا المستخدم بكلّ تفاصيله".  
> **عدد البنود:** 6 (R11, R1, R16, R17, R13, R15).

### R11 — البحث الدلاليّ الهجين (Embeddings + BM25)

#### الهدف
تكميل BM25 الحاليّ ببحث دلاليّ عبر embeddings + reciprocal rank fusion (RRF) لإنتاج "Hybrid Search" يلتقط الصياغات المختلفة.

#### المبرّر
G1 الحرجة: المستخدم يكتب "كيف أنبّه فريقي عند فشل الدفع" — BM25 لا يجد "send a message" في وثيقة Slack. embeddings تجده.

#### الملفّات المتأثّرة
| الملفّ | التعديل |
|---|---|
| `artifacts/api-server/src/services/embeddings.service.ts` | جاهز من Phase 0 |
| `artifacts/api-server/src/services/hybridSearch.service.ts` | جديد |
| `artifacts/api-server/src/services/nodeDocs.service.ts` | `searchWithinNodeDoc` يستدعي hybrid |
| `artifacts/api-server/src/services/docsAdvanced.service.ts` | `globalDocsSearch` كذلك |
| `artifacts/api-server/src/services/embeddingsSync.service.ts` | جديد — يُنشئ/يحدّث embeddings عند تغيير المصدر |
| `artifacts/api-server/src/jobs/embeddingsBackfill.job.ts` | جديد — backfill أوّلي للـ catalog كاملاً |

#### خطوات التنفيذ
1. **Backfill أوّلي**: cron job يقرأ كلّ `node_docs` و `templates` و `guides`، يقطّعها إلى chunks بـ ~400 token، يولّد embeddings، يخزّنها.
2. **Sync incrementiel**: عند تحديث `source_sha` لأيّ مصدر → trigger يحدّث embeddings الخاصّة به.
3. **Hybrid query**:
   ```ts
   const semantic = await pgvector.search(queryEmbedding, k=20, filter)
   const keyword = await bm25Search(query, k=20, filter)
   const fused = reciprocalRankFusion([semantic, keyword], k=10)
   ```
4. RRF formula: `score(d) = Σ 1 / (60 + rank_i(d))` للنتائج من كلّ مصدر.
5. Threshold = 0.55 cosine + BM25 score normalised. خفّض threshold للاستعلامات القصيرة.

#### خطّة الاختبار
| اختبار | الأداة | المتوقَّع |
|---|---|---|
| Recall@5 على 100 query قياس | bench script | ≥ 90% (مقابل 58% baseline) |
| Latency hybrid search | bench | p95 < 250ms |
| نفس الاستعلام مرّتين | unit | يُرجع نفس النتائج (deterministic) |
| استعلام عربي | E2E | embeddings العربيّة تعمل (model يدعمها) |
| استعلام طويل (500 token) | unit | لا تجاوز embedding limits |
| Backfill 1000 nodes | bench | < 10 دقائق |

#### خطّة التوثيق
- ملحق "Hybrid Search architecture"
- شرح RRF + لماذا (مقابل linear weighting)
- جدول قياس Recall@5 قبل/بعد لكلّ نوع مصدر
- كيف يُعاد بناء الـ index لو فسد

#### معايير القبول
- [ ] Recall@5 ≥ 90% على dataset 100 سؤال محدَّد
- [ ] Hybrid search ≤ 250ms p95
- [ ] Backfill كامل ≤ 30 دقيقة
- [ ] Embeddings تتحدّث تلقائياً عند تغيير source_sha
- [ ] Cost < $5 لـ backfill كامل من scratch

#### التقدير
**الجهد:** 5 أيّام | **الخطورة:** متوسّطة (تحسين البحث قد يكشف bugs مخفيّة) | **الأثر:** 🔴 حرج (أساس كلّ معرفة المساعد)

---

### R1 — التوليد المبنيّ على القوالب (Template-First Generation)

#### الهدف
قبل بناء workflow من الصفر، البحث عن template مشابه في `/templates`. عند تشابه ≥ 0.78، استخدمه كنواة + عدّل، بدل توليد كامل.

#### المبرّر
G3: قاعدة templates لدى المستخدم لا تُستفاد منها. هذا يضرب الجودة + السرعة + التكلفة.

#### الملفّات المتأثّرة
| الملفّ | التعديل |
|---|---|
| `artifacts/api-server/src/services/agentTools.ts` | `find_similar_template` تكمل (كانت stub في R12) |
| `artifacts/api-server/src/services/templateSearch.service.ts` | جديد |
| `artifacts/api-server/src/services/agenticEngine.service.ts` | system prompt: "قبل البناء، استدعِ find_similar_template" |
| `lib/db/src/schema/templates.ts` | يضاف `description_for_search` (مفهرَس) |

#### خطوات التنفيذ
1. كلّ template يُحدَّد له embedding من `name + description + tags`.
2. الأداة:
   ```ts
   {
     name: "find_similar_template",
     description: "Find templates similar to the user's intent. Returns up to 3 templates with similarity score. Use as a starting point.",
     parameters: { type: "object", properties: { intent_description: { type: "string" } } }
   }
   ```
3. عند استخدام template، system prompt يحضّ الوكيل على: (1) ذكر "بُني على قالب: X" في الردّ، (2) تعديل العقد بدلاً من إعادة بنائها، (3) الحفاظ على بنية الاتّصالات قدر الإمكان.
4. عتبة 0.78 cosine — تحت ذلك يبني من الصفر.

#### خطّة الاختبار
| سيناريو | المتوقَّع |
|---|---|
| طلب يطابق template موجود (similarity > 0.85) | الردّ يبدأ بـ "بُني على قالب X" |
| طلب فريد (similarity < 0.6) | بناء من الصفر، لا ذكر template |
| 3 طلبات متشابهة | كلّها تستخدم نفس template |
| Template-based generation vs from-scratch (A/B) | متوسّط quality أعلى بـ 12+ نقطة |
| Time-to-workflow A/B | أسرع بـ 35%+ |

#### خطّة التوثيق
- ملحق "Template-First Generation flow"
- جدول 10 أمثلة قبل/بعد لـ similarity scores
- كيف يضيف المستخدم template جديد + كيف يدخل embedding تلقائياً

#### معايير القبول
- [ ] 40%+ من generations تستخدم template (للمستخدمين الذين لديهم > 5 templates)
- [ ] Quality score المتوسّط لـ template-based ≥ 88
- [ ] لا regression على from-scratch generations
- [ ] Embeddings الـ templates تُجدَّد عند CRUD

#### التقدير
**الجهد:** 4 أيّام | **الخطورة:** متوسّطة | **الأثر:** 🔴 حرج (يضاعف جودة + سرعة)

---

### R16 — كتالوج الأنماط المضادّة (Anti-Patterns Catalog)

#### الهدف
ملفّ JSON يحدّد ~25 anti-pattern في workflows مع كاشف لكلّ نمط (regex/AST). `workflowAnalyzer` يُشغّلها قبل LLM للحصول على تحليل ثابت سريع موثوق.

#### المبرّر
G9: التحليل الحاليّ يعتمد على LLM 100% — بطيء، مكلف، غير ثابت. الأنماط المعروفة يجب أن تُكشَف بقواعد، LLM فقط للأمور الدقيقة.

#### الملفّات المتأثّرة
| الملفّ | التعديل |
|---|---|
| `artifacts/api-server/src/data/antiPatterns.json` | جديد |
| `artifacts/api-server/src/services/antiPatternDetector.service.ts` | جديد |
| `artifacts/api-server/src/services/workflowAnalyzer.service.ts` | يُشغّل detector قبل LLM |

#### قائمة الأنماط الأوّليّة (~25)

| # | النمط | الكاشف | الشدّة |
|---|---|---|---|
| AP-01 | HTTP Request بدون error branch | لا connection من `node.error` | high |
| AP-02 | Code node بـ < 5 أسطر يمكن استبداله بـ Set | AST لـ JS code | low |
| AP-03 | Credentials في query string بدل header | regex على URL | critical |
| AP-04 | Webhook بدون authentication | `parameters.authentication == "none"` | critical |
| AP-05 | استخدام `eval()` أو `Function()` في Code node | regex AST | critical |
| AP-06 | Wait node بـ amount > 60s داخل loop | structural | high |
| AP-07 | Schedule trigger بـ cron expression غير صالح | parser | critical |
| AP-08 | عقدة معزولة (لا inputs ولا outputs) | graph | medium |
| AP-09 | Node deprecated typeVersion | مقارنة مع `nodeSchemas.recommendedTypeVersion` | medium |
| AP-10 | Postgres node مع query فيه `${...}` بدون parameterised | regex | critical (SQL injection) |
| AP-11 | Loop بدون break condition محدّد | structural | high |
| AP-12 | Email node بدون to field | parameters check | critical |
| AP-13 | Workflow بـ > 50 node بدون sticky notes | structural | low (maintainability) |
| AP-14 | عقد متطابقة الاسم تماماً | duplicate names | medium |
| AP-15 | استخدام `httpRequest` للـ APIs الموجودة لها node مخصّصة | type → catalog lookup | low |
| AP-16 | Trigger مكرّر (2× scheduleTrigger في نفس workflow) | structural | high |
| AP-17 | Set node فارغ من assignments | parameters check | low |
| AP-18 | If node بدون false branch | connections check | medium |
| AP-19 | Webhook path يحوي `/api/` (تضارب) | path regex | medium |
| AP-20 | Output من node لا يُستخدَم في أيّ node لاحق | graph | low |
| AP-21 | Credentials بـ environment variable مفقود | env scan | high |
| AP-22 | Workflow active بدون trigger | structural | critical |
| AP-23 | استخدام `Function` بدل `Function (Legacy)` لكن code يستخدم API قديمة | code AST | medium |
| AP-24 | Slack/Telegram node يرسل لكلّ المستخدمين (channel = '@all') | parameters check | high |
| AP-25 | Workflow اسمه افتراضي ("My workflow") | name check | low |

#### خطوات التنفيذ
1. تعريف schema لكلّ pattern: `id`, `name_ar`, `name_en`, `severity`, `detector` (function name)، `fix_suggestion_ar`, `fix_suggestion_en`, `auto_fixable`, `references[]`.
2. كلّ detector function بسيطة: `(workflow: N8nWorkflow) => Issue[]`.
3. `workflowAnalyzer` يجمع issues من detectors + يستدعي LLM لـ "هل توجد مشاكل أخرى لم تكشفها القواعد؟" بـ context محدود.
4. UI يصنّف الـ issues حسب severity بألوان موحَّدة (critical=red, high=orange, medium=yellow, low=blue).

#### خطّة الاختبار
| سيناريو | المتوقَّع |
|---|---|
| 25 workflow كلّ واحد فيه نمط واحد محدَّد | الكاشف يلتقط النمط الصحيح + لا إنذارات كاذبة |
| Workflow نظيف (golden master) | صفر issues |
| Workflow فيه 5 anti-patterns | كلّ الـ 5 تُكشَف |
| Performance: تحليل workflow 100 node | < 200ms |
| تحليل قبل/بعد + LLM | الـ patterns المعروفة تكشف بـ rules فقط، LLM يكشف الباقي |

#### خطّة التوثيق
- جدول الـ 25 نمط مع أمثلة JSON و fixes
- كيف يضاف نمط جديد (ملفّ + test)
- كيف تتعامل الواجهة مع كلّ شدّة

#### معايير القبول
- [ ] الـ 25 نمط مغطّاة بـ unit tests (تُكشَف عند وجودها، لا تُكشَف خطأً)
- [ ] متوسّط issues per analysis ≥ 1.5 على dataset workflows production
- [ ] False-positive rate ≤ 3%
- [ ] LLM يستدعى فقط بعد rule-based + بـ token budget محدود

#### التقدير
**الجهد:** 4 أيّام | **الخطورة:** منخفضة-متوسّطة | **الأثر:** 🔴 حرج (تحليل احترافي ثابت) |

---

### R17 — التعديل المبني على Diff (Diff-based Modification)

#### الهدف
عند `intent=modify`، توليد JSON Patch (RFC 6902) بدل إعادة كتابة كامل الـ workflow. الـ diff يُعرَض في الواجهة (additions/deletions ملوّنة) قبل التطبيق.

#### المبرّر
حالياً، تعديل workflow يُعيد بناءه من الصفر — يستهلك tokens، يخاطر بكسر أجزاء سليمة، يُربك المستخدم في رؤية ما تغيَّر بالضبط.

#### الملفّات المتأثّرة
| الملفّ | التعديل |
|---|---|
| `artifacts/api-server/src/services/workflowModifier.service.ts` | إعادة كتابة لإنتاج JSON Patch |
| `artifacts/api-server/src/services/agentTools.ts` | أداة جديدة `apply_workflow_patch(workflow_id, patch)` |
| `artifacts/n8n-manager/src/components/WorkflowDiffViewer.tsx` | جديد (يستخدم monaco diff) |
| `artifacts/n8n-manager/src/pages/chat.tsx` | يعرض diff viewer قبل "Apply Fix" |

#### خطوات التنفيذ
1. خدمة جديدة: GPT-4o يحصل على workflow الأصلي + طلب التعديل + يجب أن يُرجع `JSON Patch operations[]` فقط (response_format JSON).
2. تحقّق من الـ patch بـ `fast-json-patch` قبل التطبيق (محاكاة، رفض إذا كسر validation).
3. UI: monaco-editor diff side-by-side. زرّ "Apply" مع تأكيد ثاني للـ critical changes.
4. كلّ patch يُسجَّل في `workflow_versions` ليكون قابلاً للتراجع.

#### خطّة الاختبار
| سيناريو | المتوقَّع |
|---|---|
| "أضف Slack notification بعد عقدة Postgres" | patch بـ ~3 ops (add node + add connection + adjust positions) |
| "غيّر اسم workflow" | patch بـ 1 op (replace name) |
| "احذف العقدة Slack" | patch بـ 2 ops (remove node + remove connection) |
| Patch ينتج workflow غير صالح | رفض + رسالة للوكيل ليُعيد |
| Apply ثمّ rollback | الـ workflow يعود للحالة السابقة بدقّة |

#### خطّة التوثيق
- شرح بنية JSON Patch + لماذا اخترناها (vs custom format)
- 5 أمثلة diff كاملة
- كيف يستخدم المستخدم viewer + rollback

#### معايير القبول
- [ ] متوسّط tokens لـ modify request انخفض بـ ≥ 60%
- [ ] 95%+ من الـ patches صالحة من أوّل محاولة
- [ ] UI diff واضح وملوَّن صحيحاً (additions أخضر، deletions أحمر)
- [ ] Rollback يعمل 100%

#### التقدير
**الجهد:** 5 أيّام | **الخطورة:** متوسّطة-عالية | **الأثر:** 🔴 حرج (تجربة احترافيّة + توفير cost) |

---

### R13 — الاستشهاد الصريح في الإجابات (Citations)

#### الهدف
كلّ إجابة من المساعد تتضمّن مصادر مرئيّة قابلة للضغط (`[1] node_docs/Slack#sending-messages`, `[2] template/customer-onboarding`).

#### المبرّر
G6 + الثقة. المستخدم يحتاج التحقّق من أنّ الإجابة مبنيّة على بيانات حقيقيّة لا اختراع.

#### الملفّات المتأثّرة
| الملفّ | التعديل |
|---|---|
| `artifacts/api-server/src/services/queryAgent.service.ts` | يجمع citations من tool calls |
| `artifacts/n8n-manager/src/components/MessageCitations.tsx` | جديد |
| `artifacts/n8n-manager/src/pages/chat.tsx` | يعرض citations chips |

#### خطوات التنفيذ
1. كلّ tool call يُضمّن في النتيجة `_source: { type, id, url? }`.
2. `queryAgent` يجمع كلّ المصادر، يدمج المتشابهة، يعطي كلّ واحد رقم.
3. System prompt يطلب من LLM استخدام `[1]`, `[2]` في النصّ.
4. UI: chips تحت الرسالة. الضغط على chip يفتح المصدر (nodes-catalog modal أو templates page أو guide page).

#### خطّة الاختبار
| سيناريو | المتوقَّع |
|---|---|
| سؤال يستدعي 2 أداة بحث | إجابة فيها `[1]` و `[2]` + chips |
| سؤال لا يحتاج أدوات | لا citations (إجابة عامّة) |
| ضغط chip لـ node_doc | يفتح nodes-catalog على القسم الصحيح |
| ضغط chip لـ template | يفتح templates page بـ template مفلتر |

#### معايير القبول
- [ ] 85%+ من إجابات query فيها citation واحد على الأقلّ
- [ ] كلّ chip قابل للضغط ويفتح المصدر بدقّة
- [ ] لا citation broken (404)

#### التقدير
**الجهد:** 2.5 يوم | **الخطورة:** منخفضة | **الأثر:** 🟡 متوسّط (مصداقيّة + UX)

---

### R15 — كاش الأسئلة الشائعة (Q&A Cache)

#### الهدف
أسئلة شائعة تُخزَّن مع إجاباتها في `qa_cache`. عند سؤال جديد، embedding similarity ≥ 0.92 → إجابة فوريّة بلا LLM.

#### المبرّر
50%+ من أسئلة المستخدمين متكرّرة ("ما الفرق بين Set و Edit Fields؟"). دفع cost LLM لكلّ مرّة هدر.

#### الملفّات المتأثّرة
| الملفّ | التعديل |
|---|---|
| `lib/db/src/schema/qa_cache.ts` | جديد (`question`, `question_embedding`, `answer`, `citations`, `hit_count`, `created_at`) |
| `artifacts/api-server/src/services/qaCache.service.ts` | جديد |
| `artifacts/api-server/src/services/queryAgent.service.ts` | يفحص cache قبل LLM |

#### خطوات التنفيذ
1. عند query جديد: embed → بحث في `qa_cache` بـ cosine ≥ 0.92.
2. على hit: زيادة `hit_count`، إرجاع الإجابة المخزَّنة (مع disclaimer "إجابة محفوظة من سؤال مشابه").
3. على miss: تشغيل LLM، تخزين النتيجة في cache مع embedding.
4. TTL: حذف entries غير مستعملة منذ 30 يوماً وعدد hits < 3.
5. Invalidation: عند تغيير source_sha لأيّ مصدر مذكور في الـ citations، حذف الـ entry.

#### خطّة الاختبار
| سيناريو | المتوقَّع |
|---|---|
| سؤال جديد ثمّ نفس السؤال | الثاني من cache (< 100ms) |
| سؤال متشابه (similarity 0.94) | من cache مع disclaimer |
| سؤال متشابه ضعيفاً (similarity 0.85) | LLM جديد |
| Source تغيّر | الـ entry المتعلّق يُحذَف |
| Hit-rate بعد أسبوع | ≥ 30% (production data) |

#### معايير القبول
- [ ] Hit-rate ≥ 30% بعد 7 أيّام
- [ ] Cache lookup < 100ms p95
- [ ] صفر إجابات outdated (invalidation تعمل)
- [ ] cost الإجمالي للأسئلة انخفض ≥ 25%

#### التقدير
**الجهد:** 2.5 يوم | **الخطورة:** منخفضة-متوسّطة | **الأثر:** 🟢 متوسّط (cost saving) |

---

### مخرجات Phase 2 الكاملة

| المخرج | الكمّيّة |
|---|---|
| ملفّات جديدة | 11 |
| ملفّات معدَّلة | 8 |
| اختبارات وحدة | ~45 |
| اختبارات تكامل | ~15 |
| اختبارات E2E | ~12 |
| Schema migrations | 3 |
| تحديث هذا الملف | بقعة "Phase 2 — مكتمل" + ملحقَين (Hybrid Search + Anti-Patterns) |

### بوّابة الانتقال إلى Phase 3

- [ ] Recall@5 ≥ 90%
- [ ] WSR ≥ 75% (مقابل Phase 1 ≥ 63%)
- [ ] متوسّط quality score ≥ 85
- [ ] cost-per-workflow انخفض ≥ 20% (من R17 + R15)
- [ ] صفر critical regression

---

## Phase 3 — جودة الإنتاج (Production Quality)

> **المدّة المقدَّرة:** 16-22 يوم عمل.  
> **الفلسفة:** رفع جودة المخرجات من "جيّد" إلى "احترافي". منع الفشل، لا فقط إصلاحه.  
> **عدد البنود:** 5 (R2, R3, R9, R14, R8).

### R2 — مُدقّق توافق الاتّصالات الدلاليّ

#### الهدف
قبل إغلاق المسار، فحص كلّ `connections[A]→B` للتأكّد أنّ output schema لـ A يحوي حقول الـ input المطلوبة لـ B.

#### المبرّر
G2: workflow صحيح بنيوياً قد يفشل تشغيليّاً. هذا الفحص يقطع 30-50% من فشل التشغيل قبل الاستيراد.

#### الملفّات المتأثّرة
- `artifacts/api-server/src/services/connectionValidator.service.ts` (جديد)
- `artifacts/api-server/src/services/jsonValidator.service.ts` (يستدعي connectionValidator)
- `artifacts/api-server/src/services/agentTools.ts` (validate يحوي الفحص الجديد)
- `lib/db/src/schema/node_io_schemas.ts` (جديد — تخزين output/input schemas)

#### خطوات التنفيذ
1. بناء جدول `node_io_schemas`: لكلّ node type، تخزين typical output schema (من الوثائق + sample outputs المخزَّنة).
2. خوارزمية: لكلّ edge في graph: `outputSchemaA ⊇ requiredInputsB?`. إن لا، إنذار.
3. فحوص خاصّة: expressions `={{ $json.field }}` تُحلَّل لمعرفة الحقول المطلوبة.
4. النتائج تُضمَّن في validation result كـ `connectionWarnings`.

#### خطّة الاختبار
| سيناريو | المتوقَّع |
|---|---|
| Slack بعد Postgres يستخدم `={{ $json.email }}` لكنّ Postgres يُرجع `mail` فقط | warning "field 'email' غير موجود في output Postgres — استخدم 'mail'" |
| Workflow متّسق دلاليّاً | صفر warnings |
| Set node يضيف الحقل المطلوب وسط slack postgres | لا warning |

#### معايير القبول
- [ ] False-positive rate ≤ 5%
- [ ] يكشف ≥ 80% من فشل التشغيل المتعلّق بـ data shape (قياس على dataset)
- [ ] لا يبطّئ validation بـ > 100ms

#### التقدير
**الجهد:** 5 أيّام | **الخطورة:** عالية (تطلّب بنية I/O schemas) | **الأثر:** 🔴 حرج

---

### R3 — حلقة Refinement التكراريّة

#### الهدف
بدل refinement واحد عند نتيجة < 75، دورة Gemini→fix→Gemini→fix... حتى تستقرّ النتيجة (Δ < 3) أو 4 دورات أو تجاوز ميزانيّة tokens.

#### الملفّات المتأثّرة
- `artifacts/api-server/src/services/agenticEngine.service.ts` (تحديث logic)

#### خطوات التنفيذ
1. تحويل `if (score < threshold) { refine() }` إلى `while (score < threshold && iter < 4 && tokens < budget) { refine(); rescore(); }`.
2. تتبّع Δ بين iterations: إذا < 3 لمدّة 2 iterations → استقرار، توقّف.
3. ميزانيّة افتراضيّة: 8000 token إجمالي للـ refinement loop.
4. SSE event `refinement_iteration` لكلّ دورة.

#### خطّة الاختبار
| سيناريو | المتوقَّع |
|---|---|
| Workflow بنتيجة 60 ابتدائية | يصل إلى 85+ خلال 3 iterations |
| Workflow بنتيجة 85 ابتدائية | iteration واحدة فقط (ضمن threshold) |
| Workflow عالق عند 70 (لا تحسّن) | يتوقّف بعد 2 iterations بدون تحسّن |
| تجاوز ميزانيّة tokens | يتوقّف ويُرجع آخر نسخة |

#### معايير القبول
- [ ] متوسّط quality score ≥ 90
- [ ] متوسّط iterations ≤ 2.2
- [ ] لا تجاوز ميزانيّة في > 5% من الحالات

#### التقدير
**الجهد:** 2 يوم | **الخطورة:** منخفضة | **الأثر:** 🔴 حرج (يرفع سقف الجودة)

---

### R9 — مكتبة أنماط أخطاء التنفيذ (Execution Error Patterns)

#### الهدف
تصنيف أخطاء n8n الشائعة في DB مع fix templates. Self-Heal يطابق الخطأ بنمط معروف **قبل** استدعاء GPT-4o.

#### الملفّات المتأثّرة
- `lib/db/src/schema/n8n_error_patterns.ts` (جديد)
- `artifacts/api-server/src/services/errorPatternMatcher.service.ts` (جديد)
- `artifacts/api-server/src/services/selfHealingLoop.service.ts` (يستدعي matcher أوّلاً)

#### خطوات التنفيذ
1. كتالوج أوّلي: ~40 نمط شائع مع `pattern` (regex)، `fix_strategy` (function name)، `confidence` (0-1).
2. أمثلة:
   - "Cannot read property 'X' of undefined" → fix: إضافة default value في expression
   - "Authentication failed" → fix: إعادة ربط credential
   - "Webhook path conflict" → fix: تغيير path
3. عند self-heal: matcher يفحص الخطأ → إن وجد نمط بـ confidence > 0.8 → يطبّق fix بدون LLM.
4. عند فشل rule-based fix → fallback لـ GPT-4o.

#### خطّة الاختبار
| سيناريو | المتوقَّع |
|---|---|
| Workflow بـ "Cannot read property 'email'" | rule-fix يضيف default + لا LLM |
| Workflow بخطأ غير معروف | LLM fallback |
| Pattern مع confidence 0.5 | LLM (لا يكفي confidence) |
| 100 self-heal | ≥ 60% بدون LLM |

#### معايير القبول
- [ ] Cost للـ self-healing انخفض ≥ 60%
- [ ] متوسّط زمن self-heal ≤ 3 ثوانٍ (rule-based)
- [ ] لا regression على success rate الإجمالي

#### التقدير
**الجهد:** 4 أيّام | **الخطورة:** متوسّطة | **الأثر:** 🟡 متوسّط-عالٍ (cost saving + سرعة)

---

### R14 — ذاكرة المحادثات الهرميّة (Conversational Memory v2)

#### الهدف
ذاكرة بـ 3 طبقات: (a) per-message: full text، (b) per-conversation: summary، (c) per-user: facts خام (credentials available, preferred patterns, common workflows).

#### الملفّات المتأثّرة
- `artifacts/api-server/src/services/agentMemory.service.ts` (إعادة كتابة)
- `lib/db/src/schema/user_facts.ts` (جديد)
- `lib/db/src/schema/conversation_summaries.ts` (جديد)

#### خطوات التنفيذ
1. **Per-conversation summary**: عند كلّ 10 رسائل، GPT-4o-mini يُلخّص الأخيرة في 200 token.
2. **Per-user facts**: استخراج آلي من المحادثات بـ GPT-4o-mini ("ذكر المستخدم credentials اسمها X")، تخزين كـ `{fact, source_message_id, confidence, last_seen}`.
3. عند بدء conversation جديد، النظام يحقن: آخر summary + relevant user facts (semantic search على facts).
4. UI: قسم "ما يعرفه عنك المساعد" في الإعدادات يعرض facts قابلة للحذف.

#### خطّة الاختبار
| سيناريو | المتوقَّع |
|---|---|
| ذكر "أستخدم credential اسمه Slack-Marketing" | بعد محادثة جديدة، المساعد يستخدمها بدون سؤال |
| 30 رسالة في محادثة | summary يُولَّد + يدخل context بدل full history |
| المستخدم يحذف fact | لا يستخدمه المساعد لاحقاً |
| محادثات مختلفة لنفس المستخدم | facts مشتركة |

#### معايير القبول
- [ ] متوسّط prompt size لكلّ generation انخفض ≥ 30% (نتيجة summarisation)
- [ ] دقّة استخراج facts ≥ 85% (sample manual eval)
- [ ] الواجهة تعرض facts بشفافيّة + قابلة للتعديل

#### التقدير
**الجهد:** 5 أيّام | **الخطورة:** متوسّطة-عالية | **الأثر:** 🟡 متوسّط-عالٍ (UX طويل الأمد)

---

### R8 — Pre-deploy Dry-Run

#### الهدف
قبل الاستيراد الفعلي، استدعاء `POST /workflows/test` (إن وُجد في n8n version) للتحقّق دون تخزين. لو غير مدعوم، fallback للسلوك الحالي.

#### الملفّات المتأثّرة
- `artifacts/api-server/src/services/n8n.service.ts` (إضافة `dryRunWorkflow()`)
- `artifacts/api-server/src/services/selfHealingLoop.service.ts` (يستدعيه قبل import)

#### خطوات التنفيذ
1. التحقّق من n8n version → دعم endpoint `/workflows/test` في v1.50+.
2. عند الدعم: dry-run قبل import. الفشل لا يلوّث n8n.
3. عند عدم الدعم: السلوك الحالي.

#### خطّة الاختبار
| سيناريو | المتوقَّع |
|---|---|
| n8n v1.50+ + workflow صالح | dry-run ينجح ثمّ import |
| n8n v1.50+ + workflow فاشل | dry-run يكشف، self-heal، لا تلويث |
| n8n قديم | fallback للسلوك الحالي |

#### معايير القبول
- [ ] صفر workflows فاشلة في n8n لمن يدعم dry-run
- [ ] لا تأثير على n8n قديم

#### التقدير
**الجهد:** 1.5 يوم | **الخطورة:** منخفضة | **الأثر:** 🟡 متوسّط

---

### مخرجات Phase 3 الكاملة

| المخرج | الكمّيّة |
|---|---|
| ملفّات جديدة | 7 |
| ملفّات معدَّلة | 5 |
| اختبارات وحدة | ~35 |
| اختبارات تكامل | ~12 |
| Schema migrations | 4 |
| تحديث هذا الملف | بقعة "Phase 3 — مكتمل" + ملحق "Connection Validation Architecture" |

### بوّابة الانتقال إلى Phase 4

- [ ] WSR ≥ 88%
- [ ] متوسّط quality score ≥ 90
- [ ] Self-heal-rate ≤ 18%
- [ ] cost-per-workflow ≤ baseline × 0.85

---

## Phase 4 — التميّز وتجربة المستخدم

> **المدّة المقدَّرة:** 14-18 يوم عمل.  
> **الفلسفة:** التحويل من "أداة تعمل بشكل ممتاز" إلى "تجربة تُحَبّ". تفاصيل polish + ميزات advanced.  
> **عدد البنود:** 9 (R4, R5, R10, R18, R19, R21, R22, R24, R25).

### R4 — مكتبة Workflow Patterns

| الجانب | التفصيل |
|---|---|
| الهدف | ملفّ JSON بـ ~15 pattern ("error branch إلزامي للعقد الخارجيّة"...). يُحقَن في system prompt حسب intent. |
| الأمثلة | "Always-error-branch", "Sanitize-before-DB-write", "Rate-limit-external-calls", "Idempotent-webhook-handlers", "Dry-run-destructive-ops" |
| الجهد | 2 يوم |
| الاختبار | quality score يرتفع ≥ 3 نقاط |
| التوثيق | جدول الـ 15 pattern + متى يطبَّق |

### R5 — Auto-Layout للعقد

| الجانب | التفصيل |
|---|---|
| الهدف | استبدال heuristic 200-250px spacing بـ Sugiyama layout |
| الأداة | `dagre` library |
| الجهد | 1 يوم |
| الاختبار | workflows مرتّبة بصرياً عند الاستيراد |

### R10 — مزامنة ثنائيّة الاتّجاه

| الجانب | التفصيل |
|---|---|
| الهدف | عند تعديل المستخدم لـ workflow في n8n مباشرة، النظام يلتقط الفرق و"يتعلّم" تفضيلاته |
| الجهد | 4 أيّام |
| الاختبار | بعد 5 تعديلات يدويّة، المساعد يتبنّى نمط التسمية الجديد |

### R18 — أداة Health Check

| الجانب | التفصيل |
|---|---|
| الهدف | `analyze_workflow_health(id)` تجمع: anti-patterns + execution stats (نسبة فشل آخر 30 يوماً) + unused nodes + credentials منتهية |
| الواجهة | "Fitness Report" بطاقة شاملة |
| الجهد | 2.5 يوم |
| الاختبار | تقرير دقيق على 10 workflows production |

### R19 — اقتراحات إصلاح بنقرة

| الجانب | التفصيل |
|---|---|
| الهدف | كلّ مشكلة في `AnalysisReport` تأتي مع `applyFix: workflowJsonPatch` جاهز |
| الجهد | 3 أيّام (يعتمد على R17) |
| الاختبار | 80%+ من المشاكل لها auto-fix يعمل |

### R21 — Streaming Reasoning

| الجانب | التفصيل |
|---|---|
| الهدف | بثّ `thinking_step` بين tool calls يشرح "لماذا أستدعي هذه الأداة" |
| الجهد | 1.5 يوم |
| الاختبار | UX subjective + التحقّق من التدفّق |

### R22 — اقتراحات الخطوات التالية الذكيّة

| الجانب | التفصيل |
|---|---|
| الهدف | بعد إنجاز workflow، اقتراح خطوات تالية ("اختبره بالـ data المُرفَقة"، "أضف notification عند الفشل") |
| الجهد | 1.5 يوم |
| الاختبار | engagement rate على الاقتراحات > 25% |

### R24 — مكتبة المسارات الشخصيّة

| الجانب | التفصيل |
|---|---|
| الهدف | قسم "مساراتي المُولَّدة" مع تقييم لكلّ واحد + إعادة استخدام كقالب |
| الجهد | 2 يوم |
| الاختبار | الواجهة + DB integration |

### R25 — إدخال صوتي

| الجانب | التفصيل |
|---|---|
| الهدف | Whisper API للإملاء العربي |
| الجهد | 1.5 يوم |
| الاختبار | accuracy العربي ≥ 90% |

### بوّابة إنهاء Phase 4

- [ ] CSAT ≥ 88%
- [ ] Re-prompt rate ≤ 8%
- [ ] median-time-to-workflow ≤ 18s

---

## Phase 5 — ضمان الجودة الشامل والنتائج المرجوّة

> **المدّة المقدَّرة:** 8-10 أيّام عمل.  
> **الفلسفة:** قياس شامل، تحقّق من النتائج، توثيق نهائي للمنتج.

### 5.1 — مجموعات الاختبار الذهبيّة

ستُبنى **3 مجموعات قياس** قابلة للتكرار:

#### Golden Set 1 — Workflow Generation (50 سيناريو)

كلّ سيناريو: `prompt → expected_workflow_skeleton → quality_threshold`.

| فئة | عدد السيناريوهات | أمثلة |
|---|---|---|
| Triggers بسيطة | 8 | webhook→slack، schedule→email، manualTrigger→http |
| Data pipelines | 12 | API→transform→DB، CSV→clean→sheet |
| Conditional logic | 8 | if/switch بفروع متعدّدة |
| Loops | 5 | splitInBatches مع iteration |
| Error handling | 7 | error branches، retry، fallback |
| Multi-system | 10 | Slack+Postgres+Stripe، Sheet+OpenAI+Telegram |

**معيار النجاح لكلّ سيناريو:** quality score ≥ 85 + استيراد ينجح + dry-run ينجح.

#### Golden Set 2 — Q&A (40 سؤال)

| فئة | عدد |
|---|---|
| أسئلة عن node معيّن | 10 |
| أسئلة مقارنة بين nodes | 5 |
| أسئلة عن workflows موجودة للمستخدم | 8 |
| أسئلة عن credentials | 4 |
| أسئلة procedural ("كيف أفعل X؟") | 8 |
| أسئلة خارج النطاق | 5 |

**معيار النجاح:** citation ≥ 1، hallucination = 0، إجابة صحيحة (manual eval).

#### Golden Set 3 — Modify/Analyze (30 سيناريو)

| فئة | عدد |
|---|---|
| Add node | 6 |
| Remove node | 4 |
| Change parameters | 5 |
| Replace integration | 4 |
| Fix anti-patterns | 6 |
| Optimize structure | 5 |

**معيار النجاح:** patch صالح + ينطبق + يحقّق التغيير المطلوب + لا regression.

### 5.2 — مصفوفة الاختبار النهائيّة

| نوع الاختبار | الأداة | عدد الحالات | معيار النجاح |
|---|---|---|---|
| Unit | vitest | ~250 | 100% pass، coverage ≥ 80% |
| Integration | vitest + n8n staging | ~60 | 100% pass |
| E2E (Golden Sets) | playwright | 120 | ≥ 95% pass |
| Performance | k6 / autocannon | 10 سيناريو حمل | لا regression > 15% |
| Security | npm audit + sast | — | لا critical/high |
| Accessibility | axe-core | كلّ الصفحات | 0 critical violations |
| Bilingual | manual + axe | عيّنة 20 صفحة | RTL/LTR مكافئتان |

### 5.3 — قياس KPIs الإجمالي

تشغيل bench كامل قبل/بعد كلّ مرحلة، نشر تقرير في `docs/kpi-reports/`.

| KPI | Baseline | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Target |
|---|---|---|---|---|---|---|
| WSR | 55% | 65% | 78% | 88% | 92% | ≥ 90% |
| Quality Score | 74 | 76 | 86 | 90 | 92 | ≥ 90 |
| Self-Heal Rate | 38% | 30% | 22% | 15% | 12% | ≤ 15% |
| Recall@5 | 58% | 60% | 92% | 92% | 93% | ≥ 90% |
| Hallucination | 12% | 4% | 1.5% | 1% | 0.8% | ≤ 1% |
| Citation Coverage | 0% | 70% | 85% | 88% | 90% | ≥ 85% |
| Median TTW | 28s | 26s | 22s | 19s | 17s | ≤ 18s |
| CSAT | n/a | 78% | 84% | 88% | 90% | ≥ 88% |
| Cost/Workflow | n/a | $0.32 | $0.24 | $0.18 | $0.16 | ≤ $0.18 |

### 5.4 — اختبار الانحدار الكامل

قبل إعلان "Phase 5 مكتمل":
1. تشغيل **كلّ** اختبارات الوحدة (250+).
2. تشغيل **كلّ** سيناريوهات E2E (120 من Golden Sets).
3. تشغيل **bench performance**: 100 طلب متوازٍ، قياس p50/p95/p99.
4. **Manual smoke**: 14 صفحة في التطبيق، فحص بصري + وظيفي.
5. **Bilingual review**: نفس 14 صفحة بالعربيّة والإنكليزيّة.
6. **Migration rollback test**: تطبيق كلّ migrations down→up→down→up على DB نسخة من production.

### 5.5 — وثيقة "حالة المنتج النهائيّة"

ملحق نهائي في هذا الملف يحوي:
- ملخّص ما تحقّق (vs الخارطة)
- ما لم يتحقّق + لماذا
- تقرير KPIs النهائي
- درس مستفاد (lessons learned)
- خارطة طريق ما بعد Phase 5 (نسخة 2.0)

### 5.6 — النتائج المرجوّة الإجماليّة

#### من ناحية الجودة

> **قبل:** 55% من المسارات تعمل من أوّل محاولة، 38% تحتاج إصلاحاً، متوسّط جودة 74/100.  
> **بعد:** 92%+ تعمل من أوّل محاولة، أقلّ من 12% تحتاج إصلاحاً، متوسّط جودة 92/100.

#### من ناحية المعرفة

> **قبل:** المساعد يجيب من ذاكرة LLM التدريبيّة، 12% hallucination rate، صفر استشهاد.  
> **بعد:** المساعد يستشهد بمصادر فعليّة، < 1% hallucination، 90% من الإجابات بـ citations.

#### من ناحية التجربة

> **قبل:** المستخدم ينتظر 28s للحصول على workflow، يضطرّ لإصلاح credentials يدوياً، أخطاء n8n تقنيّة بالإنكليزيّة.  
> **بعد:** workflow في 17s مع credentials مربوطة + URLs جاهزة + أخطاء بعربيّة فصحى مع اقتراحات إصلاح.

#### من ناحية التشغيل

> **قبل:** cost لكلّ workflow غير مُقاس، self-heal مكلف، لا feedback loop.  
> **بعد:** $0.16 متوسّط، self-heal بـ rule-based قبل LLM، feedback يقود تحسينات أسبوعيّة.

#### من ناحية التحليل

> **قبل:** تحليل workflows يعتمد LLM 100%، نتائج غير ثابتة، 2.1 critical issue متوسّط.  
> **بعد:** 25 anti-pattern detector منهجي، تحليل في < 200ms، 0.3 critical issue متوسّط، auto-fix بنقرة لـ 80% من المشاكل.

---

## الملاحق

### الملحق أ — ملخّص تغييرات Schema المتراكمة

| Phase | الجداول الجديدة | الحقول المضافة |
|---|---|---|
| 0 | embeddings_index, agent_metrics, feedback_events, kpi_snapshots, feature_flags | — |
| 1 | — | (تفعيل feedback_events) |
| 2 | qa_cache | templates.description_for_search |
| 3 | node_io_schemas, n8n_error_patterns, user_facts, conversation_summaries | — |
| 4 | workflow_patterns_library | workflows.last_user_modified_at |
| **الإجمالي** | **10 جداول جديدة** | **3 حقول مضافة** |

### الملحق ب — مصفوفة الاعتماديّة بين البنود

```
Phase 0 (foundation) ────┬──> R20 (feedback)
                         ├──> R12 (query agent) ──> R13 (citations)
                         ├──> R11 (embeddings) ──> R1 (templates) ──> R4
                         │                     └──> R15 (qa cache)
                         ├──> R6 (credentials)
                         └──> R23 (errors AR)

R17 (diff) ──> R19 (auto-repair)
R16 (anti-patterns) ──> R18 (health check) ──> R19
R2 (connection validator) ──> R3 (refinement loop)
R14 (memory) standalone
R21, R22, R24, R25 standalone
```

### الملحق ج — متطلّبات البيئة الجديدة

| المتغيّر | الغرض | المرحلة |
|---|---|---|
| `EMBEDDINGS_MODEL` | افتراضي: text-embedding-3-small | Phase 0 |
| `EMBEDDINGS_DIM` | افتراضي: 1536 | Phase 0 |
| `QA_CACHE_TTL_DAYS` | افتراضي: 30 | Phase 2 |
| `REFINEMENT_TOKEN_BUDGET` | افتراضي: 8000 | Phase 3 |
| `MEMORY_FACTS_AUTO_EXTRACT` | true/false | Phase 3 |
| `WHISPER_API_KEY` | للإدخال الصوتي | Phase 4 |

### الملحق د — قائمة المهامّ المؤجَّلة بعد Phase 5 (نسخة 2.0)

- Multi-agent orchestration (وكلاء متخصّصون لكلّ نوع integration)
- Workflow performance optimization assistant (يُحلّل executions ويقترح تحسينات)
- Marketplace integration (templates مشتركة بين مستخدمين)
- Voice + audio output (text-to-speech للإجابات)
- Mobile companion app (notifications + quick approvals)
- A/B testing infrastructure للـ system prompts
- Fine-tuning نموذج صغير على بيانات user-specific

### الملحق هـ — حساب التكلفة الإجماليّة المتوقَّعة

| البند | تقدير |
|---|---|
| OpenAI (GPT-4o + embeddings) — شهري للمنتج بعد Phase 5 | $80-150 لكلّ 1000 active users |
| Gemini 2.5 Pro — شهري | $30-60 لكلّ 1000 active users |
| pgvector storage | داخل PostgreSQL الحالي (لا تكلفة إضافيّة) |
| Whisper (R25) | ~$0.006/minute صوت |
| **الإجماليّ المتوقَّع** | **$110-210/1000 user/month** بعد Phase 5 |

### الملحق و — نموذج تتبّع التقدّم

عند بدء كلّ phase، نسخ هذا الجدول وملؤه:

```markdown
## Phase X — تتبّع التقدّم

| البند | الحالة | الـ PR | التاريخ | المسؤول |
|---|---|---|---|---|
| RXX | ⏳/🚧/✅ | #123 | 2026-XX-XX | name |
```

عند إنجاز phase كامل، إضافة بقعة "Phase X — مكتمل" بنفس صيغة `UNIFIED_DESIGN_SYSTEM_AR.md`:
- ما أُنجز
- ملفّات معدَّلة
- نتائج اختبارات
- KPIs قبل/بعد
- درس مستفاد
- ما أُجّل ولماذا

---

**نهاية الإصدار 1.0 من خارطة الطريق.**

> هذا الملف وثيقة حيّة. يُحدَّث في نهاية كلّ phase بنتائجها الفعليّة وأيّ انحراف عن الخطّة الأصليّة. الإصدار التالي (2.0) يُكتَب بعد إنجاز Phase 5 ويُركّز على ما بعد المنتج الحاليّ.
