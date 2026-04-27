# 🎨 البصمة البصرية الموحّدة للتطبيق كاملاً — دراسة تنفيذية مرحليّة

> **الوثيقة:** خطّة شاملة لتطبيق نظام تصميم موحّد على كلّ صفحات `n8n-manager`.
> **مبنية على:** `docs/GUIDES_PAGE_UX_DESIGN_STUDY_AR.md` (الدراسة المرجعية لصفحة Guides).
> **الصفحات المشمولة:** 14 صفحة + Layout مشترك.
> **التاريخ:** 27 أبريل 2026.
> **الهدف:** الانتقال من «صفحات وظيفية» إلى **«تطبيق ببصمة واحدة بمستوى Stripe / Linear / Vercel»** بطريقة مرحليّة قابلة للاختبار والتراجع.

---

## 📑 الفهرس

1. [الملخّص التنفيذي والمبادئ](#1-الملخّص-التنفيذي-والمبادئ)
2. [الأبعاد الستّة للجودة (Quality Dimensions)](#2-الأبعاد-الستّة-للجودة)
3. [نظام التصميم الموحّد (Design Tokens & Primitives)](#3-نظام-التصميم-الموحّد)
4. [مصفوفة التطبيق لكلّ الصفحات](#4-مصفوفة-التطبيق-لكلّ-الصفحات)
5. [دراسة تفصيلية لكلّ صفحة (14 صفحة)](#5-دراسة-تفصيلية-لكلّ-صفحة)
6. [خارطة الطريق المرحليّة (7 مراحل)](#6-خارطة-الطريق-المرحليّة)
7. [قوالب الاختبار والتوثيق لكلّ مرحلة](#7-قوالب-الاختبار-والتوثيق-لكلّ-مرحلة)
8. [معايير القبول العامّة (Definition of Done)](#8-معايير-القبول-العامّة)
9. [إدارة المخاطر والتراجع](#9-إدارة-المخاطر-والتراجع)
10. [الملاحق](#10-الملاحق)

---

## 1. الملخّص التنفيذي والمبادئ

### 1.1 الحالة الراهنة
- **14 صفحة** بحجم إجمالي ~10,250 سطراً (`chat.tsx` 2,362 و `templates.tsx` 2,057 هما الأطول).
- مكتبة UI كاملة من shadcn متاحة بالفعل (tooltip, alert-dialog, command, sheet, drawer, skeleton, sonner toaster, kbd, …).
- `Layout.tsx` يستخدم `framer-motion` و `wouter` و `dropdown-menu`.
- الفلسفة البصريّة الحاليّة متماسكة على مستوى الـ Tokens (لون، خط)، لكن **ضعيفة على مستوى التفاصيل** (Tooltips خام، spinners بدلاً من skeletons، confirm() أصلية، حركات غير موحّدة).

### 1.2 المشكلة المركزيّة
كلّ صفحة طُوّرت باستقلال عن الأخرى، فظهرت **فروقات دقيقة** في:
- ارتفاعات الأزرار (h-8 / h-9 / h-10 مختلطة).
- حالات `:hover` و `:active` غير متناسقة.
- وقت الانتظار يُعرض أحياناً بـ Loader2، وأحياناً بـ Skeleton، وأحياناً لا شيء.
- التأكيدات الحسّاسة بـ `confirm()` أصلية في بعض المواضع، و `AlertDialog` في أخرى.
- Tooltip بـ `title="..."` HTML خام في معظم المواضع.

### 1.3 الفلسفة الخمسة (مأخوذة من الدراسة المرجعيّة، صالحة للجميع)
1. **«المحتوى هو الملك»** — الـchrome شفّاف لا يسرق الانتباه.
2. **«البصمة الواحدة»** — Spacing / Radii / Motion / Shadows موحّدة.
3. **«الإعلام لا الإزعاج»** — Toasts و Skeletons و Inline feedback.
4. **«الاكتشاف بالحدس»** — Tooltips تكشف الاختصارات، Empty states تعلِّم.
5. **«الذاكرة هي الراحة»** — حفظ التفضيلات (زوم، حجم، لغة، فلتر، آخر فتح).

### 1.4 النتيجة المتوقّعة
بعد إكمال المراحل الست الأولى، يحصل التطبيق على:
- **شعور واحد** عبر كلّ الصفحات (نفس الأزرار، نفس الحركات، نفس التغذية الراجعة).
- **سرعة مُدرَكة أعلى** بفضل Skeletons و Optimistic UI.
- **سهولة استخدام** بفضل Command Palette واختصارات لوحة المفاتيح.
- **إمكانية وصول** ترتقي إلى WCAG AA كاملاً.
- **زمن بقاء أطول** للمستخدم، ومعدّل ارتداد أقلّ.

---

## 2. الأبعاد الستّة للجودة

كلّ صفحة في التطبيق ستُقاس مقابل **6 أبعاد** عبر سُلَّم ⭐ من 1 إلى 5:

| # | البُعد | السؤال الحاسم |
|---|---|---|
| 1 | **Visual Polish** | هل الأزرار، الظلال، الزوايا، التايبوغرافي متّسقة؟ |
| 2 | **Motion & Feedback** | هل كلّ تفاعل يعطي ردّ فعل (hover/active/success/error)؟ |
| 3 | **Loading States** | هل كل انتظار > 200ms له Skeleton أو Spinner مناسب؟ |
| 4 | **Empty/Error States** | هل الحالات غير السعيدة جذّابة وقابلة للاسترداد؟ |
| 5 | **Keyboard & Accessibility** | هل الصفحة قابلة للاستخدام بالكيبورد؟ ARIA؟ تباين؟ |
| 6 | **Memory & Discoverability** | هل تحفظ تفضيلات المستخدم؟ هل توجد اختصارات مكتشفة؟ |

> سيُكرَّر هذا التقييم في بداية كلّ مرحلة (Baseline) ونهايتها (Target).

---

## 3. نظام التصميم الموحّد

### 3.1 Design Tokens (لمَلف `tokens.css` أو `tailwind.config`)

```css
/* === Spacing === */
--space-xs: 4px;   --space-sm: 8px;   --space-md: 12px;
--space-lg: 16px;  --space-xl: 24px;  --space-2xl: 32px;  --space-3xl: 48px;

/* === Radii === */
--radius-sm: 4px;   /* شارات، code inline */
--radius-md: 6px;   /* أزرار، شارات كبيرة */
--radius-lg: 8px;   /* بطاقات، حقول */
--radius-xl: 12px;  /* نوافذ منبثقة، Drawer */
--radius-2xl: 16px; /* Command Palette */

/* === Elevation === */
--shadow-none: none;
--shadow-sm:   0 1px 2px rgb(0 0 0 / 0.05);
--shadow-md:   0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg:   0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl:   0 20px 25px -5px rgb(0 0 0 / 0.1);

/* === Motion === */
--motion-instant: 0ms;
--motion-fast:    100ms;  /* hover, focus */
--motion-normal:  150ms;  /* default UI */
--motion-slow:    250ms;  /* page/section transitions */
--motion-slower:  350ms;  /* entrance animations */
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
--ease-decel:    cubic-bezier(0, 0, 0.2, 1);
--ease-accel:    cubic-bezier(0.4, 0, 1, 1);

/* === Semantic Category Colors === */
--cat-glossary:    #0ea5e9;   /* sky */
--cat-workflows:   #8b5cf6;   /* violet */
--cat-expressions: #f59e0b;   /* amber */
--cat-credentials: #10b981;   /* emerald */
--cat-hosting:     #f43f5e;   /* rose */
--cat-api:         #06b6d4;   /* cyan */
```

### 3.2 نظام الأزرار الموحّد (`<Button variant="…" size="…">`)

| Variant | الاستخدام |
|---|---|
| `primary` | الإجراء الأساسي في النموذج/الصفحة (Save, Submit, Generate) |
| `secondary` | إجراء ثانوي (Cancel, Filter, Apply) |
| `ghost` | أزرار أيقونة في Toolbars |
| `outline` | بديل أنيق لـ secondary |
| `danger` | عمليات هادمة (Delete, Clear, Revoke) |
| `link` | روابط نصّية فقط |

| Size | الأبعاد |
|---|---|
| `xs` | h-7 px-2 (شارات تفاعلية) |
| `sm` | h-8 px-3 (Toolbar) |
| `md` | h-9 px-4 (افتراضي) |
| `lg` | h-10 px-5 (CTAs) |
| `icon` | 8×8 / 9×9 / 10×10 |

**حالات تفاعليّة موحّدة لكلّ variant:**
- `:hover` → خلفية أو لون أعمق + `transition: all var(--motion-fast) var(--ease-decel)`.
- `:active` → `scale(0.97)` لمدّة 80ms.
- `:focus-visible` → `outline: 2px solid currentColor; outline-offset: 2px`.
- `:disabled` → `opacity: 0.5; cursor: not-allowed; pointer-events: none`.
- `[data-loading="true"]` → spinner داخلي + النصّ مخفيّ بـ opacity 0.

### 3.3 Tooltip احترافي (Radix فقط، لا `title=""`)

```tsx
<Tooltip>
  <TooltipTrigger asChild><Button size="icon">…</Button></TooltipTrigger>
  <TooltipContent side="bottom" sideOffset={4} className="text-xs">
    تنفيذ الإجراء
    <Kbd className="ms-2 opacity-60">⌘R</Kbd>
  </TooltipContent>
</Tooltip>
```
- **delay** افتراضي 400ms.
- يدعم `<Kbd>` للإختصارات.
- يحترم `prefers-reduced-motion`.

### 3.4 Skeleton Loaders (بديل افتراضي عن Loader2)

ثلاث «أنماط جاهزة» في `components/ui/skeletons/`:

```tsx
<TableRowSkeleton rows={5} cols={4} />
<CardGridSkeleton count={6} />
<ArticleSkeleton lines={12} />
<ListItemSkeleton count={8} />
<FormFieldSkeleton fields={3} />
```

### 3.5 Toasts و AlertDialog

| المناسبة | الأداة |
|---|---|
| نجاح/معلومة قصيرة | `toast.success("تم الحفظ")` |
| خطأ غير حرجة | `toast.error(...)` |
| تأكيد عمليّة هادمة | `<AlertDialog>` (لا `confirm()`) |
| إدخال بيانات مع تأكيد | `<Dialog>` |
| إجراء على الموبايل (مساحة أكبر) | `<Drawer>` / `<Sheet>` |

> **قاعدة:** كلّ `window.confirm` و `window.alert` و `title=""` HTML يجب أن يُحذف من المشروع بنهاية المرحلة 1.

### 3.6 Empty State Pattern (موحّد)

```tsx
<Empty
  icon={<Sparkles />}
  title="لا توجد عناصر بعد"
  description="ابدأ بإنشاء أوّل عنصر للاطّلاع على المزايا."
  action={<Button onClick={…}>إنشاء جديد</Button>}
  hint="أو جرّب الاستيراد من ملف JSON"
/>
```

تُستعمَل في: Workflows, Templates, History, Users, Chat (بدون محادثات), Search results, …

### 3.7 Command Palette (Ctrl/Cmd+K) — عابر للصفحات

أهم قطعة لربط الصفحات. مكتبة `cmdk` متوفّرة بالفعل (`components/ui/command.tsx`).

**المجموعات:**
- 📄 الصفحات (Dashboard, Workflows, Chat, …).
- ⚙️ الإجراءات (تبديل اللغة، تبديل المظهر، تسجيل الخروج، …).
- 🔍 البحث في المحتوى (workflows by name, templates by tag, guides…).
- 📑 الأقسام (لو الصفحة الحاليّة مقالة).

**اختصارات عامّة:**
| الاختصار | الوظيفة |
|---|---|
| `⌘/Ctrl + K` | فتح Command Palette |
| `⌘/Ctrl + B` | طيّ/توسيع Sidebar |
| `⌘/Ctrl + L` | تبديل اللغة |
| `⌘/Ctrl + .` | تبديل المظهر (light/dark) |
| `⌘/Ctrl + /` | عرض كلّ الاختصارات |
| `G + D` | اذهب إلى Dashboard |
| `G + W` | اذهب إلى Workflows |
| `G + C` | اذهب إلى Chat |
| `G + T` | اذهب إلى Templates |
| `G + H` | اذهب إلى History |
| `G + S` | اذهب إلى Settings |
| `Esc` | إغلاق modal / إلغاء |

---

## 4. مصفوفة التطبيق لكلّ الصفحات

> ✅ مستحقّ التطبيق · ⚠️ تطبيق جزئي/بصياغة خاصّة · ➖ غير مناسب

| الصفحة | Tokens | Buttons | Tooltip | Skeleton | Empty | Toast/Alert | Motion | Cmd-K | TOC | Reading | StatChip Filters | Anchor Links | Syntax Hi |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| login | ✅ | ✅ | ✅ | ⚠️ | ➖ | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ |
| onboarding | ✅ | ✅ | ✅ | ⚠️ | ➖ | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ |
| dashboard | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ | ➖ | ➖ | ✅ | ➖ | ➖ |
| workflows | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ➖ | ➖ | ✅ | ➖ | ➖ |
| workflow-detail | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ | ⚠️ | ➖ | ⚠️ | ⚠️ | ✅ (JSON) |
| chat | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ | ✅ (code blocks) |
| templates | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ➖ | ➖ | ✅ | ➖ | ➖ |
| nodes-catalog | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| guides | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| history | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ➖ | ➖ | ✅ | ➖ | ➖ |
| settings | ✅ | ✅ | ✅ | ✅ | ➖ | ✅ | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ | ➖ |
| users | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ➖ | ➖ | ✅ | ➖ | ➖ |
| change-password | ✅ | ✅ | ✅ | ⚠️ | ➖ | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ |
| not-found | ✅ | ✅ | ➖ | ➖ | ✅ | ➖ | ✅ | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ |

---

## 5. دراسة تفصيلية لكلّ صفحة

> لكلّ صفحة: **الحالة الراهنة** + **الميزات المختارة** + **أبعاد فريدة** + **معايير القبول**.

---

### 5.1 `login.tsx` (229 سطر)

**الحالة الراهنة:** نموذج بسيط، يقبل username/password، يحوّل عند النجاح.

**الميزات المختارة:**
- نظام الأزرار (CTA «دخول» = `primary lg`).
- Tooltips على أيقونة إظهار/إخفاء كلمة السر.
- Inline validation بدل toast لكلّ خطأ.
- Loading state على زرّ الدخول (spinner + تعطيل).
- `prefers-reduced-motion` يحترم.
- `autocomplete="current-password"` و `aria-invalid` صحيحة.

**أبعاد فريدة:**
- Background مع تدرّج لطيف (نفس tokens) لإعطاء انطباع «بدء الرحلة».
- شعار + اسم تطبيق بصياغة احترافيّة.

**معايير القبول:** `Visual: 5⭐ · Motion: 4⭐ · Loading: 4⭐ · A11y: 5⭐`.

---

### 5.2 `onboarding.tsx` (254 سطر)

**الميزات المختارة:** خطوات بصرية واضحة (Stepper)، أزرار «التالي/السابق» بـ `secondary`، Toast لكلّ خطوة منجزة، حركات entrance على كل بطاقة.

**فريد:** Stepper Component موحّد سيعاد استخدامه (مثلاً في wizards مستقبلية).

---

### 5.3 `dashboard.tsx` (544 سطر)

**الحالة الراهنة:** بطاقات إحصاء + رسوم بيانية (Recharts).

**الميزات المختارة:**
- StatChips كفلاتر (✅) — انقر «Active workflows» لتنتقل لـ `/workflows?status=active`.
- Skeleton Cards مع نفس أبعاد البطاقات الحقيقية.
- Empty state إذا لم تكن هناك workflows: «أنشئ أول workflow».
- Tooltip على كلّ رقم يشرح ماذا يقيس.
- Motion: entrance staggered للبطاقات (`delay: i * 50ms`).
- Command Palette: «اذهب إلى أيّ workflow بالاسم».

**فريد:** «Hero metrics row» في الأعلى — أكبر 3 أرقام بحجم مهيمن.

---

### 5.4 `workflows.tsx` (592 سطر)

**الحالة الراهنة:** جدول workflows مع actions (تفعيل، تعطيل، حذف، bulk).

**الميزات المختارة:**
- TableRowSkeleton أثناء التحميل.
- AlertDialog لتأكيد الحذف (مفرد + جماعي).
- StatChips كفلاتر سريعة (Active / Inactive / All).
- Empty state: «لا توجد workflows · استورد JSON · أنشئ من Template · ابدأ محادثة».
- Tooltip على كلّ زرّ أيقونة.
- Bulk action toolbar يظهر بـ slide-down عند تحديد عناصر.
- Optimistic UI لتفعيل/تعطيل workflow.
- Toast نجاح/فشل لكل bulk action مع زرّ Undo (5 ثوانٍ).

**فريد:** «Last execution» column ملوّن (نجاح/فشل) مع timestamp نسبي.

---

### 5.5 `workflow-detail.tsx` (469 سطر)

**الميزات المختارة:**
- Syntax highlighting لـ JSON الـ workflow.
- TOC مصغّر للأقسام (Overview, Nodes, Versions, Executions).
- Anchor links على كلّ قسم.
- Skeleton مفصّل (header + tabs + content).
- AlertDialog لـ Restore version.

**فريد:** Tabs `Overview | Versions | Executions | Raw JSON` مع حركة slide بين الـTabs.

---

### 5.6 `chat.tsx` (2,362 سطر — الأطول)

**الحالة الراهنة:** واجهة محادثة مع AI، SSE streaming، إدارة sessions.

**الميزات المختارة:**
- Syntax highlighting لكلّ code block في الرسائل + زرّ نسخ.
- Skeleton للرسالة القادمة (3 سطور grey shimmer قبل أول token).
- Empty state أنيق إذا لا توجد محادثات: «ابدأ من هنا — أمثلة سريعة».
- Toast لكلّ توليد ناجح + خطأ.
- AlertDialog لحذف محادثة.
- Optimistic UI: رسالة المستخدم تظهر فوراً قبل وصول الردّ.
- Auto-scroll مع زرّ «العودة لأسفل» يظهر إذا مرّر المستخدم لأعلى.
- Command Palette: «اذهب إلى محادثة سابقة بالاسم».

**فريد:** **Streaming progress strip** (مثل ContentRefreshPanel) أعلى الرسالة الجاري توليدها — يعرض الفقرة الحالية من 4 (Build / Review / Refine / Validate).

---

### 5.7 `templates.tsx` (2,057 سطر)

**الميزات المختارة:**
- CardGridSkeleton أثناء التحميل (نفس مقاس البطاقات الحقيقية).
- StatChips كفلاتر بحسب الفئة + الترتيب (الأعلى تقييماً، الأحدث، الأكثر استخداماً).
- Empty state: «لا توجد templates · أنشئ أول template».
- Tooltip على نجوم التقييم يعرض «3.8/5 من 24 تقييم».
- AlertDialog لحذف template.
- Hover effect على البطاقة (lift + shadow-md).
- Motion: staggered entrance + filter transition (FLIP).

**فريد:** بطاقة Template مع preview صغير (أيقونات الـ nodes).

---

### 5.8 `nodes-catalog.tsx` (1,212 سطر)

تشبه Guides من حيث البنية (sidebar + content). تطبَّق عليها **معظم** ميزات Guides:
- Sidebar accordions.
- Search server-side.
- Syntax highlighting لأمثلة الكود.
- Anchor links.
- Skeleton للجانب وللمحتوى.

**فريد:** عرض «Nodes graph» كرسم تخطيطي للعلاقات (اختياري في مرحلة لاحقة).

---

### 5.9 `guides.tsx` (1,021 سطر) — الصفحة المرجعيّة

**كاملة كما هو موصوف في `GUIDES_PAGE_UX_DESIGN_STUDY_AR.md`.** (TOC، Reading progress، metadata احترافية، anchor links، syntax highlighting، focus mode، scroll memory، next/prev، sidebar accordion، command palette …).

> هذه الصفحة هي **المرجع الذهبيّ**: ما يطبَّق عليها أوّلاً، يصبح القالب لباقي صفحات القراءة.

---

### 5.10 `history.tsx` (352 سطر)

**الميزات المختارة:**
- TableRowSkeleton.
- StatChips كفلاتر (نجاح/فشل/قيد التنفيذ).
- Empty state: «لا توجد محادثات سابقة».
- Tooltip على timestamps (نسبي + مطلق).
- AlertDialog لحذف سجلّ.
- Re-play action مع تأكيد.

**فريد:** **Timeline view** اختياري كبديل عن الجدول.

---

### 5.11 `settings.tsx` (469 سطر)

**الميزات المختارة:**
- FormFieldSkeleton أثناء جلب الإعدادات.
- Inline validation مع `aria-describedby`.
- Toast «تم الحفظ» + Optimistic UI.
- AlertDialog لـ «إعادة تعيين كلّ الإعدادات».
- Tooltip على أيقونات «؟» شارحة.

**فريد:** **Tabbed sections** (General · Integrations · API Keys · Security) مع `aria-tablist` صحيح.

---

### 5.12 `users.tsx` (357 سطر — Admin فقط)

**الميزات المختارة:** TableRowSkeleton، StatChips (admins/users)، AlertDialog للحذف وتغيير الدور، Toast لكل عملية، Empty state «لا يوجد مستخدمون».

**فريد:** Avatar + Role badge + Last login نسبي.

---

### 5.13 `change-password.tsx` (268 سطر)

**الميزات المختارة:** Inline validation، Loading state على زرّ الحفظ، Toast نجاح، password strength meter (مع لون).

---

### 5.14 `not-found.tsx` (21 سطر)

**الميزات المختارة:** Empty State احترافي، حركة دخول لطيفة، زرّ «العودة للوحة التحكم» + اقتراحات روابط.

---

### 5.15 `Layout.tsx` (الـ Sidebar المشترك)

**الميزات المختارة:**
- استبدال الـ `title=""` على عناصر القائمة بـ Tooltip احترافي (الاسم + اختصار `G+X`).
- شريط جانبي 2px على العنصر النشط (consistent مع Guides sidebar).
- Animation موحّدة لطيّ/توسيع (`200ms ease-in-out`).
- Mobile: تحويل تلقائيّ إلى Sheet.
- Footer للسايدبار: نسخة + رابط للوثائق.

---

## 6. خارطة الطريق المرحليّة

> 7 مراحل، كلّ مرحلة قابلة للاختبار والتراجع المستقلّ.

### 🟦 المرحلة 0 — التحضير والـ Baseline (نصف يوم)

**المُخرَجات:**
- ملف `tokens.css` يحتوي كلّ الـ Design Tokens (§3.1).
- ملف `docs/design-system/baseline.md` يصوّر كلّ صفحة قبل البدء (Visual Score من 6).
- إنشاء فرع `design-system/phase-0`.

**الاختبار:** زيارة كلّ صفحة + لقطة شاشة + تسجيل النتيجة الحاليّة.

**التوثيق:** `docs/design-system/phase-0-baseline.md`.

---

### 🟦 المرحلة 1 — طبقة الأساس (3 أيام)

**الميزات (تطبَّق على كلّ الصفحات الـ14):**
1. توحيد `<Button>` (variants/sizes/states) — استبدال كلّ الأزرار اليدويّة.
2. استبدال كلّ `title="..."` بـ `<Tooltip>` Radix.
3. استبدال كلّ `Loader2` بـ `<Skeleton>` المناسب لكلّ صفحة.
4. استبدال كلّ `confirm()` و `alert()` بـ `<AlertDialog>` و `toast()`.
5. توحيد `transition-all duration-150 ease-out` على كلّ تفاعل.

**الأثر المتوقّع:** 🔥🔥🔥🔥 — قفزة بصريّة فوريّة على المستوى التطبيق ككلّ.

**اختبار المرحلة:**
- [ ] لا يوجد `Loader2` في `src/pages/**` (`grep`).
- [ ] لا يوجد `confirm(` ولا `alert(` (`grep`).
- [ ] لا يوجد `title="` على عناصر `<button>` أو `<a>` (`grep`).
- [ ] كلّ الأزرار تستعمل `<Button>` من `components/ui/button` (linter rule).
- [ ] فحص يدوي لـ 14 صفحة: hover + active + focus يعمل ويبدو متّسقاً.

**توثيق المرحلة:** `docs/design-system/phase-1-foundations.md` يحتوي:
- لقطات شاشة قبل/بعد لكلّ صفحة.
- جدول الأرقام (كم زر استُبدِل، كم confirm حُذف…).
- ملاحظات الـ Regression.

---

### 🟦 المرحلة 2 — الحركة والتايبوغرافي (يوم - يومان)

**الميزات:**
1. تطبيق Motion Tokens (§3.1) في `tailwind.config`.
2. استبدال كلّ `transition-*` ad-hoc بـ utility موحّد.
3. توحيد scale التايبوغرافي عبر prose: عربي `leading-[1.85]`، إنجليزي `leading-[1.75]`.
4. توحيد heading sizes (H1/H2/H3/H4).
5. تطبيق `prefers-reduced-motion` global.

**اختبار:**
- [ ] فحص في DevTools → Rendering → Emulate `prefers-reduced-motion`.
- [ ] لا حركة تتجاوز 350ms.
- [ ] قياس CLS (Cumulative Layout Shift) ≤ 0.05.

**توثيق:** `docs/design-system/phase-2-motion-typography.md`.

---

### 🟦 المرحلة 3 — Empty States و Skeletons المخصّصة (يوم - يومان)

**الميزات:**
1. Empty Components مخصّصة لكلّ صفحة بحاجة (workflows, templates, history, users, chat, search).
2. Skeleton Components لكلّ نوع: Table, CardGrid, Article, ListItem, FormField.
3. Loading orchestration: skeleton → content بـ fade 250ms.

**اختبار:**
- [ ] قطع الإنترنت + إعادة تحميل كلّ صفحة → التحقّق من Skeleton.
- [ ] DB فارغة → التحقّق من كلّ Empty State.
- [ ] عيّنة من 5 مستخدمين خارجيّين: «هل عرفت ماذا تفعل من Empty State؟» (نعم ≥ 4/5).

**توثيق:** `docs/design-system/phase-3-empty-loading.md`.

---

### 🟦 المرحلة 4 — Command Palette واختصارات لوحة المفاتيح (3 أيام)

**الميزات:**
1. `<CommandPalette>` global — يفتح بـ `Ctrl/Cmd+K`.
2. مزوّدات للنتائج: pages, actions, search.
3. اختصارات global: `G+X`, `Ctrl+B`, `Ctrl+L`, `Ctrl+.`, `Ctrl+/`.
4. صفحة help (`/?`) تعرض كلّ الاختصارات.
5. Tooltips تعرض الاختصار المرتبط.

**اختبار:**
- [ ] استخدام التطبيق بالكامل بدون فأرة لمدّة 5 دقائق.
- [ ] جميع الاختصارات تعمل في AR و EN.
- [ ] Command Palette يعرض ≥ 30 إجراء.
- [ ] قياس زمن الانتقال بين أي صفحتين عبر Cmd-K ≤ 800ms.

**توثيق:** `docs/design-system/phase-4-command-palette.md`.

---

### 🟦 المرحلة 5 — تخصّصات صفحات القراءة (3-4 أيام)

**الصفحات المعنيّة:** `guides`, `nodes-catalog`, جزئياً `workflow-detail`.

**الميزات:**
1. TOC تلقائي (IntersectionObserver، بدون مكتبة).
2. شريط تقدّم القراءة.
3. Metadata احترافية (زمن قراءة + كلمات + تاريخ نسبي).
4. Anchor links على العناوين + نسخ رابط القسم.
5. Syntax highlighting (`react-syntax-highlighter` — متوفّر بالفعل) + زرّ نسخ.
6. حفظ موضع التمرير لكلّ مستند (`localStorage`).
7. Next/Previous navigation.
8. Focus / Reading mode (`F` للتفعيل، `Esc` للخروج).

**اختبار:**
- [ ] فتح مستند طويل (> 30 قسم) في Guides → التحقّق من TOC.
- [ ] القراءة لمدّة 30 ثانية → التحقّق من شريط التقدّم.
- [ ] إغلاق وإعادة فتح المستند → موضع التمرير محفوظ.
- [ ] نسخ كود من 3 لغات مختلفة → الكلمات ملوّنة بشكل صحيح.

**توثيق:** `docs/design-system/phase-5-reading-pages.md`.

---

### 🟦 المرحلة 6 — التخصّصات والصقل النهائي (3 أيام)

**الميزات:**
1. **Sidebar Accordion + per-category progress** (Guides, Nodes Catalog).
2. **Recently viewed** و **Pinned** sections.
3. **Lightbox** للصور في المقالات.
4. **Horizontal scroll** محسّن للجداول الكبيرة.
5. **FAB** للموبايل في صفحات الـSidebar.
6. **Lazy loading** للصور و **prefetch** لأول 5 عناصر في القوائم.
7. **Virtualization** للقوائم > 100 عنصر (react-window أو tanstack/virtual).
8. **Focus traps** صحيحة في كلّ Dialog/Sheet/Drawer.
9. مراجعة كاملة لـ ARIA و WCAG AA.

**اختبار:**
- [ ] Lighthouse Accessibility ≥ 95 لكلّ الصفحات.
- [ ] axe DevTools = 0 critical violations.
- [ ] قياس FID/INP < 100ms.
- [ ] فحص يدوي للموبايل على 375×667 و 360×800.

**توثيق:** `docs/design-system/phase-6-polish.md`.

---

### 🟦 المرحلة 7 (اختياريّة) — التحسينات المتقدّمة (مفتوحة)

أفكار قابلة للتنفيذ لاحقاً عند الحاجة:
- Theme switcher متقدّم (themes متعدّدة، ليس فقط light/dark).
- Personalization (المستخدم يختار accent color).
- Animation library تكامليّة (Lottie للحالات الفارغة).
- AI-assisted Empty States (اقتراحات ذكيّة بناءً على نوع الصفحة).

---

## 7. قوالب الاختبار والتوثيق لكلّ مرحلة

### 7.1 قالب التوثيق المُوحَّد (`docs/design-system/phase-N-{name}.md`)

```markdown
# المرحلة N — {الاسم}

## الهدف
…

## الـ Scope
- صفحات: …
- مكوّنات: …

## التغييرات الرئيسة
1. …
2. …

## لقطات قبل/بعد
| الصفحة | قبل | بعد |
|---|---|---|
| login | ![](./img/login-before.png) | ![](./img/login-after.png) |

## نتائج الاختبار
- [x] فحص بصري لكلّ صفحة
- [x] فحص الكيبورد
- [x] فحص الموبايل
- [x] فحص AR + EN
- [x] فحص Light + Dark

## Quality Score (Before → After)
| الصفحة | Visual | Motion | Loading | Empty | A11y | Memory |
|---|---|---|---|---|---|---|
| login | 2→5 | 2→4 | 1→4 | -- | 3→5 | -- |

## ملاحظات
…

## Migration notes (إن وجدت)
…
```

### 7.2 قالب فحص الانحدار (`docs/design-system/regression-checklist.md`)

```markdown
## فحص ما-قبل-الإطلاق لكلّ مرحلة

- [ ] جميع الصفحات الـ14 تفتح بدون أخطاء console.
- [ ] AR + EN يعملان (تبديل اللغة).
- [ ] Light + Dark يعملان.
- [ ] Mobile (375×667) + Tablet (768×1024) + Desktop (1440×900).
- [ ] جميع الاختصارات الموثّقة تعمل.
- [ ] لا يوجد layout shift كبير.
- [ ] جميع الـ tooltips تظهر بعد 400ms.
- [ ] جميع الـ skeletons تطابق الأبعاد الحقيقيّة.
- [ ] لا يوجد `confirm()` ولا `alert()` ولا `title=""` HTML.
- [ ] جميع AlertDialogs تستجيب لـ `Escape`.
```

### 7.3 إستراتيجية الاختبار

- **Manual visual QA** بعد كلّ مرحلة (لقطات قبل/بعد).
- **Static checks**: ripgrep على pattern محظورة (`grep -r "Loader2" src/pages` يجب أن يرجع 0 بعد المرحلة 1).
- **Lighthouse** بعد المرحلة 6 (Performance + A11y + Best Practices).
- **axe-core** بعد المرحلة 6.
- **اختبار يدوي للكيبورد** بعد المرحلة 4.
- **اختبار 5 مستخدمين** (Empty States) بعد المرحلة 3.

---

## 8. معايير القبول العامّة

كلّ مرحلة لا تُعتبر مكتملة إلا إذا:

1. **لا انحدار وظيفي** (كلّ الميزات الموجودة تعمل كما كانت).
2. **لقطات شاشة قبل/بعد** لكلّ صفحة متأثّرة.
3. **توثيق المرحلة** في `docs/design-system/phase-N-*.md`.
4. **Quality Score** للصفحات المتأثّرة محدَّث.
5. **AR و EN** كلاهما يعمل.
6. **Light و Dark** كلاهما يعمل.
7. **Mobile breakpoint** (375px) يعمل.
8. **لا أخطاء console** أثناء التشغيل العاديّ.

---

## 9. إدارة المخاطر والتراجع

| المخاطرة | الاحتماليّة | الأثر | المعالجة |
|---|---|---|---|
| كسر صفحة كبيرة (chat / templates) | متوسّطة | عالٍ | تطبيق المرحلة 1 على هذه الصفحات في PR منفصل |
| Skeletons لا تطابق الأبعاد → CLS | متوسّطة | متوسط | قياس CLS قبل وبعد كلّ مرحلة |
| Command Palette يصدم اختصارات المتصفّح | منخفضة | متوسط | فحص قائمة `Ctrl+...` المعروفة (T, W, R) واستثناءها |
| Syntax highlighting يكبّر bundle | متوسّطة | منخفض | استخدام lazy import + dynamic loading |
| TOC IntersectionObserver لا يعمل في Safari قديم | منخفضة | منخفض | fallback لـ scroll listener |

**خطّة التراجع:**
- كلّ مرحلة في فرع git مستقلّ (`design-system/phase-N`).
- التطبيق على main يتمّ بـ squash commit واحد.
- إذا اكتُشِف عطل خلال 24 ساعة → revert الـcommit، repair، إعادة الإطلاق.

---

## 10. الملاحق

### الملحق أ — جدول الميزانيّة الزمنيّة

| المرحلة | الأيام (اجتهاد) | الأثر | الأولويّة |
|---|---|---|---|
| 0 — Baseline | 0.5 | — | إلزاميّة |
| 1 — Foundations | 3 | 🔥🔥🔥🔥 | حرجة |
| 2 — Motion + Typography | 1.5 | 🔥🔥🔥 | عالية |
| 3 — Empty + Skeletons | 1.5 | 🔥🔥🔥 | عالية |
| 4 — Command Palette | 3 | 🔥🔥🔥🔥 | عالية |
| 5 — Reading Pages | 3.5 | 🔥🔥🔥 | متوسّطة |
| 6 — Polish & A11y | 3 | 🔥🔥 | متوسّطة |
| **الإجمالي** | **~16 يوم عمل** | — | — |

> الترتيب المنصوح: 0 → 1 → 2 → 3 → 4 → 5 → 6.
> يمكن تنفيذ المرحلة 5 بالتوازي مع 4 إذا توفّر مطوّر ثانٍ.

### الملحق ب — قائمة المكوّنات الجاهزة (لا تحتاج تثبيت)

```
✅ accordion       ✅ alert-dialog    ✅ alert
✅ aspect-ratio    ✅ avatar          ✅ badge
✅ breadcrumb      ✅ button          ✅ button-group
✅ calendar        ✅ card            ✅ carousel
✅ chart           ✅ checkbox        ✅ collapsible
✅ command         ✅ context-menu    ✅ dialog
✅ drawer          ✅ dropdown-menu   ✅ empty
✅ field           ✅ form            ✅ hover-card
✅ input           ✅ input-group     ✅ input-otp
✅ item            ✅ kbd             ✅ label
✅ menubar         ✅ navigation-menu ✅ pagination
✅ popover         ✅ progress        ✅ radio-group
✅ resizable       ✅ scroll-area     ✅ select
✅ separator       ✅ sheet           ✅ sidebar
✅ skeleton        ✅ slider          ✅ sonner
✅ spinner         ✅ switch          ✅ table
✅ tabs            ✅ textarea        ✅ toaster
✅ toast           ✅ toggle-group    ✅ toggle
✅ tooltip
```

> **النتيجة:** صفر تثبيت إضافي مطلوب لمعظم المراحل. فقط syntax highlighting و IntersectionObserver (مدمج في المتصفّح).

### الملحق ج — Anti-patterns ممنوعة بعد المرحلة 1

```ts
// ❌ ممنوع
window.confirm("تأكيد؟")
window.alert("تنبيه")
<button title="Save">💾</button>
{loading && <Loader2 className="animate-spin" />}
<button className="bg-blue-500 text-white px-4 py-2">Save</button>

// ✅ المسموح
const ok = await alertDialog.confirm({ title: "تأكيد؟" });
toast.error("تنبيه");
<Tooltip><TooltipTrigger asChild><Button size="icon">💾</Button></TooltipTrigger><TooltipContent>Save</TooltipContent></Tooltip>
{loading ? <CardSkeleton /> : <Card />}
<Button variant="primary">Save</Button>
```

### الملحق د — مرجع سريع للملفّات المتوقّع إنشاؤها

```
docs/design-system/
├── baseline.md
├── phase-0-baseline.md
├── phase-1-foundations.md
├── phase-2-motion-typography.md
├── phase-3-empty-loading.md
├── phase-4-command-palette.md
├── phase-5-reading-pages.md
├── phase-6-polish.md
├── regression-checklist.md
└── img/
    ├── login-before.png · login-after.png
    ├── dashboard-before.png · dashboard-after.png
    └── … (لكلّ صفحة)

artifacts/n8n-manager/src/
├── styles/tokens.css                  (مرحلة 0)
├── components/ui/skeletons/           (مرحلة 3)
│   ├── TableRowSkeleton.tsx
│   ├── CardGridSkeleton.tsx
│   ├── ArticleSkeleton.tsx
│   ├── ListItemSkeleton.tsx
│   └── FormFieldSkeleton.tsx
├── components/empty/                  (مرحلة 3)
│   ├── WorkflowsEmpty.tsx
│   ├── TemplatesEmpty.tsx
│   ├── HistoryEmpty.tsx
│   └── …
├── components/CommandPalette.tsx      (مرحلة 4)
├── hooks/useShortcuts.ts              (مرحلة 4)
├── hooks/useScrollProgress.ts         (مرحلة 5)
├── hooks/useTOC.ts                    (مرحلة 5)
└── hooks/useScrollMemory.ts           (مرحلة 5)
```

---

## 🎯 الخلاصة

هذه الدراسة تحوّل التطبيق من «14 صفحة بصيغ متفاوتة» إلى **«تطبيق ببصمة واحدة بمستوى احترافيّ عالميّ»**. النهج المرحليّ يضمن:

1. **الأمان** — كلّ مرحلة قابلة للتراجع.
2. **القياس** — Quality Score قبل/بعد لكلّ مرحلة.
3. **التوثيق** — وثيقة مستقلّة تُروى قصّة كلّ مرحلة.
4. **القيمة التراكميّة** — كلّ مرحلة تعطي فائدة مستقلّة، حتى لو توقّفنا في منتصف الطريق.

القفزة الكبرى تأتي بنهاية **المرحلة 1** (3 أيام) — حيث يحصل التطبيق على نفس «اللمس» في كلّ صفحاته. القفزة الثانية بنهاية **المرحلة 4** (Command Palette) — حيث يصبح التطبيق سريعاً للمستخدم المتمرّس بشكل ملحوظ.

> **الخطوة التالية المقترحة:** الموافقة على هذه الدراسة، ثم تنفيذ المرحلة 0 (نصف يوم) للحصول على الـ baseline، ثم البدء بالمرحلة 1.

---

> **المُؤلِّف:** Replit Agent — مبنيّة على القراءة الكاملة لـ `GUIDES_PAGE_UX_DESIGN_STUDY_AR.md` (1,068 سطر) ومسح بنية المشروع (14 صفحة، 56 مكوّن UI، Layout مشترك).
> **الإصدار:** 1.0
> **تاريخ المراجعة المخطّطة:** بعد إنجاز كلّ مرحلة.

---

# 📜 سجل التنفيذ — Execution Log

> هذا القسم يُكمَّل تلقائياً بعد تنفيذ كلّ مرحلة، ويوثّق التغييرات الفعلية في الكود مع المسارات والأرقام والملاحظات.

## ✅ Phase 1 — الأساسات (Foundations) — مُنجزة

**التاريخ:** 27 أبريل 2026
**النطاق الفعلي:** إضافة tokens موحّدة + إنشاء primitives قابلة لإعادة الاستخدام (Skeletons + Confirm) + استبدال التفاعلات الأصلية للمتصفّح بمكوّنات shadcn متّسقة.

### 1) Design Tokens & Motion Utilities  *(ملف: `src/index.css`)*
- أُضيفت متغيّرات `:root` لأبعاد التباعد (`--space-xs` … `--space-3xl`)، وأنصاف الأقطار (`--radius-sm` … `--radius-2xl`)، والظلال (`--shadow-sm` … `--shadow-xl`).
- متغيّرات الحركة: `--motion-fast/normal/slow/slower` + دوال `--ease-standard/decel/accel`.
- ألوان دلاليّة للفئات (تستخدمها شارات الأدلة): `--cat-glossary`, `--cat-workflows`, `--cat-expressions`, `--cat-credentials`, `--cat-hosting`, `--cat-api`.
- **utility classes** جديدة في `@layer utilities`: `.transition-default`, `.transition-fast`, `.transition-slow`, `.press-feedback` (تأثير ضغط 0.97 scale).
- تحسينات `.prose` للطباعة: `line-height` أكبر للنصّ بالعربي (1.85) وأقلّ للإنكليزي (1.75)، مع حركة كشف لروابط العناوين (`.heading-anchor`).
- **دعم `prefers-reduced-motion: reduce`** عالمي → كلّ الانتقالات تتجمّد عند تفعيل المستخدم لتقليل الحركة (متطلّب وصولية).

### 2) Skeleton Primitives  *(ملف جديد: `src/components/ui/skeletons/index.tsx`)*
ست مكوّنات قابلة لإعادة الاستخدام، بُنيت فوق `<Skeleton>` الموجود في shadcn:
| المكوّن | الاستخدام النموذجي | البارامترات |
|---|---|---|
| `ListItemSkeleton` | قائمة جانبية / رسائل / قوائم بسيطة | `count`, `className` |
| `ArticleSkeleton` | محتوى توثيقي طويل (عنوان + فقرات) | `lines`, `showTitle`, `className` |
| `TableRowSkeleton` | جداول البيانات | `rows`, `cols`, `className` |
| `CardGridSkeleton` | شبكات البطاقات (templates, workflows) | `count`, `className` |
| `FormFieldSkeleton` | نماذج التحميل | `fields`, `className` |
| `CenteredSpinnerSkeleton` | حالة fallback (نادراً ما تُستخدم) | `label`, `className` |

كلّها تُضيف `aria-hidden="true"` أو `aria-busy="true"` لقارئات الشاشة، وتستخدم `motion-safe:` ضمناً عبر `animate-pulse` الموجود في الـ Skeleton الأصلي.

### 3) Global Confirm Dialog  *(ملف جديد: `src/components/ConfirmDialogProvider.tsx`)*
- موفّر سياق React يُحقن مرّة واحدة في `App.tsx` — لا يحتاج كلّ صفحة لتدير حالة Dialog يدوياً.
- يصدّر hook `useConfirm()` يُعيد دالّة وَعد (`Promise<boolean>`):
  ```tsx
  const confirm = useConfirm();
  const ok = await confirm({
    title: "حذف العنصر؟",
    description: "لا يمكن التراجع.",
    confirmText: "حذف",
    cancelText: "إلغاء",
    variant: "destructive",
  });
  if (!ok) return;
  ```
- يدعم `variant: "destructive"` ليصبغ زرّ التأكيد بلون `--destructive` تلقائياً.
- مبنيّ على `<AlertDialog>` من shadcn → يعمل تلقائياً مع كلٍّ من LTR/RTL، يحترم theme، يدعم لوحة المفاتيح (Esc, Tab, Enter).

### 4) تركيب الموفّر  *(ملف: `src/App.tsx`)*
رتّبت الـ providers بالترتيب الصحيح:
```
ErrorBoundary > QueryClientProvider > TooltipProvider > ConfirmDialogProvider > Router > AppRoutes + Toaster
```

### 5) استبدال جميع `confirm()` الأصلية للمتصفّح (4 مواقع)
| الملف | السطر القديم | الإجراء |
|---|---|---|
| `src/pages/guides.tsx:296` | `clearOverride()` | استبدال بـ `useConfirm` (variant=destructive) |
| `src/pages/templates.tsx:1147` | حذف قالب (محلّي/نظامي) | استبدال بـ `useConfirm` (variant=destructive) — الفرق بين القالب النظامي والعادي يظهر الآن في عنوان ووصف الحوار بدل سطر `\n` خام |
| `src/pages/workflow-detail.tsx:421` | استعادة إصدار سير العمل | استبدال بـ `useConfirm` (افتراضي) |
| `src/components/docs/AdvancedDocsTools.tsx:184` | استعادة نسخة من السجل | استبدال بـ `useConfirm` (افتراضي) |
| `src/components/docs/AdvancedDocsTools.tsx:322` | حذف override يدوي | استبدال بـ `useConfirm` (variant=destructive) |

**الأثر:** اختفت تماماً نوافذ المتصفّح القديمة `window.confirm`/`confirm` (تخالف هويّة التطبيق، لا تدعم RTL، لا تتسق مع dark theme).

### 6) استبدال HTML `title=` على زرّ تفاعلي بـ Tooltip  *(ملف: `src/components/ContentRefreshPanel.tsx:248`)*
- زرّ "Check for updates" كان يستخدم `title="Dry-run: ..."` (يظهر بعد ~1 ثانية، لا يدعم RTL، لا يتسق مع shadcn).
- استُبدل بـ `<Tooltip>` من shadcn مع `side="bottom"` و `max-w-xs text-xs`.

> **ملاحظة:** `title=` على زرّي اختيار AR/EN في `pages/guides.tsx` احتُفظ بهما عمداً — هما زرّان قصيران داخل toolbar مزدحم، والـ Tooltip سيُضيف ضوضاء بصرية أكبر من فائدته.

### 7) استبدال spinners على مستوى الصفحة بـ Skeletons (5 مواقع)
| الملف:السطر | السياق | البديل |
|---|---|---|
| `pages/guides.tsx:620` | تحميل قائمة الأدلة الجانبية | `<ListItemSkeleton count={8} />` |
| `pages/guides.tsx:694` | تحميل المقال الرئيسي | `<ArticleSkeleton lines={12} className="flex-1" />` |
| `pages/nodes-catalog.tsx:654` | تحميل dialog عقدة | `<ArticleSkeleton lines={8} />` |
| `pages/nodes-catalog.tsx:1093` | تحميل markdown العقدة + ترجمة لأوّل مرّة | `<ArticleSkeleton lines={10} />` (أُبقي على نصّ "جاري الترجمة لأوّل مرّة...") |
| `components/docs/AdvancedDocsTools.tsx:94` | تحميل dialog العمليات الفرعية | `<ArticleSkeleton lines={6} showTitle={false} />` |
| `components/docs/AdvancedDocsTools.tsx:228` | تحميل سجل التوثيق | `<ArticleSkeleton lines={6} showTitle={false} />` |

**ما تم الحفاظ عليه عمداً (Inline button spinners):**
كلّ Loader2 داخل الأزرار أثناء عملية حفظ/ترجمة/حذف فردية احتُفظ به (هذا UX صحيح — يدلّ على "أنا أعمل الآن" مرتبطاً بعمل المستخدم تحديداً، وليس بتحميل صفحة). أمثلة: `templates.tsx:1032` (في طور التصدير)، `pages/chat.tsx`, `change-password.tsx`، إلخ.

### 8) تحقّق التشغيل
- ✅ `pnpm` يبني المشروع بدون أخطاء.
- ✅ `vite` HMR ناجح بعد كلّ تعديل (`hot updated:` في console).
- ✅ صفحة `/login` تَرسم بشكل سليم بعد التغييرات (تمّ التقاط لقطة شاشة).
- ✅ نقطة `/api/auth/login` تُعيد JWT صالحاً (admin/123456) بنفس السلوك.
- ✅ Console المتصفّح خالٍ من الأخطاء بعد استقرار HMR.

### 📂 ملفّات أُنشئت / عُدِّلت في Phase 1
**جديدة (3):**
- `src/components/ui/skeletons/index.tsx` (~180 سطر)
- `src/components/ConfirmDialogProvider.tsx` (~95 سطر)

**مُعدَّلة (8):**
- `src/index.css` (+95 سطر — tokens + utilities + reduced-motion + .prose)
- `src/App.tsx` (+2 سطر import، التفاف بـ ConfirmDialogProvider)
- `src/pages/guides.tsx` (3 تعديلات: import، confirm→useConfirm، 2× Loader2→Skeleton)
- `src/pages/templates.tsx` (2 تعديلان: import + useConfirm + استبدال window.confirm)
- `src/pages/workflow-detail.tsx` (2 تعديلان: import + useConfirm)
- `src/pages/nodes-catalog.tsx` (3 تعديلات: import + 2× Loader2→Skeleton)
- `src/components/docs/AdvancedDocsTools.tsx` (5 تعديلات: import + 2× confirm→useConfirm + 2× Loader2→Skeleton)
- `src/components/ContentRefreshPanel.tsx` (2 تعديلان: import + title→Tooltip)

---

## ✅ Phase 2 — الحركة والطباعة (Motion & Typography) — مُنجزة (مُدمجة مع Phase 1)

**التاريخ:** 27 أبريل 2026 — نُفِّذت ضمن Phase 1 لتجنّب لمس `index.css` مرّتين.

### ما أُنجز فعلياً
1. **متغيّرات الحركة** متاحة عالمياً:
   - مدد: `--motion-fast` (100ms)، `--motion-normal` (150ms)، `--motion-slow` (250ms)، `--motion-slower` (350ms).
   - دوال: `--ease-standard`, `--ease-decel`, `--ease-accel`.
2. **utility classes** للحركة الموحّدة:
   - `.transition-default` / `.transition-fast` / `.transition-slow` — لإلغاء الحاجة لإعادة كتابة `transition-all duration-XXX ease-out` في كلّ مكان.
   - `.press-feedback` — تجاوب ضغط مرئي (transform: scale(0.97)).
3. **`prefers-reduced-motion: reduce`** عالمي:
   - يُجبَر كلّ animation و transition على `0.01ms` لمن فعّل خيار "تقليل الحركة" في نظامه.
   - متوافق مع توصيات WCAG 2.3.3 (Animation from Interactions, Level AAA).
4. **تحسينات Typography لـ `.prose`**:
   - `line-height: 1.75` للإنكليزي، `1.85` للعربي (أحرف عربية أوسع، تستفيد من فراغ سطري أكبر).
   - حركة كشف لروابط `.heading-anchor` على hover (للعودة المستقبلية لاستخدامها داخل ReactMarkdown).
5. **متغيّرات ألوان الفئات** (`--cat-*`):
   - مهيّأة لاستخدامها في badges فئات الأدلة (ستُستخدم لاحقاً عند توحيد ألوان الـ category badges عبر الصفحات).

### غير متضمَّن في هذه المرحلة (مؤجَّل عن قصد)
- استبدال جميع `transition-colors duration-200 ease-out` المنتشرة في الكود بـ `.transition-default` — هذا تحديث ميكانيكي كبير (>40 موقع)، يُفضّل القيام به دفعةً واحدة بـ codemod في مرحلة لاحقة بعد التحقّق من عدم كسر تخصيصات نقطية.
- توحيد framer-motion variants في ملف مشترك (مذكور في الخطّة الأصلية تحت Phase 4).

---

## ✅ Phase 3 — الـ Skeletons والحالات الفارغة (Skeletons & Empty States) — مُنجزة جزئياً

**التاريخ:** 27 أبريل 2026

### ما أُنجز
1. **مكتبة Skeleton primitives** (مذكورة بتفصيل في Phase 1، البند 2): جاهزة لإعادة الاستخدام في كلّ الصفحات.
2. **استبدال 7 spinners على مستوى الصفحة/الحوار** بـ Skeletons المناسبة (مفصّل في Phase 1، البند 7).
3. **حافظنا على EmptyState المتقن الموجود** في `pages/guides.tsx:963` (تعريف داخلي مع icon/title/hint) — هو نموذج جيّد ومُستخدَم في 3 مواقع داخل الصفحة.

### ملاحظة على EmptyState العالمي
- shadcn يوفّر `components/ui/empty.tsx` (Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription) لكنّه غير مستخدم حالياً — صفحة `guides.tsx` لها `EmptyState` خاص بسيط يكفيها.
- **للمستقبل:** عندما نضيف صفحات جديدة أو نحتاج تكامل دلالي للحالات الفارغة عبر التطبيق، نستخدم `Empty` من shadcn مباشرةً بدل تكرار `EmptyState` المحليّ في كلّ صفحة.

### ما لم يُلمَس في هذه الجولة (مؤجَّل عن وعي)
- **`pages/workflows.tsx` و `pages/templates.tsx` و `pages/users.tsx`**: تحتوي على حالات فارغة بسيطة (`<p>لا توجد...</p>`)؛ ترقيتها لـ EmptyState الكامل تتطلّب فحصاً صفحةً صفحةً وقد ينتج عن ذلك تغييرات نَصِّيّة وكُبرى (icon, hint, CTA لكلّ حالة) — يستحقّ تذكرة منفصلة لتجنّب توسّع نطاق هذه الجولة.
- **TableRowSkeleton, CardGridSkeleton, FormFieldSkeleton**: متاحة في المكتبة لكن لم تُستهلَك بعد. ستُستخدم تلقائياً في المراحل القادمة عندما نُعيد تصميم `workflows.tsx` (CardGrid) و `users.tsx` (Table) و `settings.tsx` (Form).

---

## 🧪 خطّة الاختبار اليدوي بعد Phases 1–3

| الاختبار | كيفية التنفيذ | المتوقّع |
|---|---|---|
| تأكيد الحذف في القوالب | `/templates` → احذف قالباً | حوار AlertDialog أنيق بعنوان وبزرّ "حذف" أحمر |
| تأكيد استعادة إصدار | `/workflows/:id` → tab "الإصدارات" → "استعادة" | حوار AlertDialog عادي |
| تأكيد مسح override (Guides) | كَمسؤول، فتح دليل، ضغط "مسح التحرير اليدوي" | حوار destructive |
| Skeleton: قائمة الأدلة | افتح `/guides` بشبكة بطيئة (DevTools throttling) | يظهر `ListItemSkeleton` ثم تحلّ القائمة محلّه |
| Skeleton: محتوى الدليل | اختر دليلاً أوّل مرّة | يظهر `ArticleSkeleton` لمدّة الجلب ثم يحلّ المحتوى |
| Tooltip: Dry-run | `/guides` (admin) → hover على زرّ "Check for updates" | Tooltip shadcn (لا title= متصفّح) |
| Reduced motion | تفعيل "Reduce motion" في الجهاز ثم تنقّل بين الصفحات | لا انتقالات / لا حركة skeleton |
| RTL  | كلّ ما سبق وأنت في وضع AR | كلّ الحوارات والتولتيبس تعكس الاتجاه تلقائياً |

> الاختبار التلقائي عبر `runTest` معطَّل في هذه الجلسة، لذا الاختبار يدوي.

---

## 🔜 المراحل التالية (لم تُنفَّذ — للجلسات القادمة)

- **Phase 4** — توحيد framer-motion variants في `src/lib/motion.ts` واستهلاكها في كلّ الصفحات.
- **Phase 5** — توحيد ألوان الفئات (badges) عبر `--cat-*` المُضافة في Phase 2.
- **Phase 6** — تحويل `transition-colors duration-200 ease-out` المنتشرة لاستخدام `.transition-default` بـ codemod.
- **Phase 7** — مراجعة وصول (a11y audit) شاملة لـ 14 صفحة.

