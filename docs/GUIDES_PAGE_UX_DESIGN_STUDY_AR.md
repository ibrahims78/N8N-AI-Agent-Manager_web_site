# 📚 صفحة الأدلة (Guides) — دراسة UX/UI شاملة وخطّة تطوير احترافية

> **الوثيقة:** دراسة تحليلية ومقترحات تصميم مفصّلة لصفحة `/guides`
> **الملف المُحلَّل:** `artifacts/n8n-manager/src/pages/guides.tsx` (1,022 سطراً)
> **التاريخ:** 27 أبريل 2026
> **الهدف:** رفع الصفحة من «وظيفية» إلى «احترافية بمستوى Stripe Docs / Linear / Vercel» لزيادة المتعة، السلاسة، وزمن البقاء.

---

## 📑 الفهرس

1. [الملخّص التنفيذي](#1-الملخّص-التنفيذي)
2. [تشريح الحالة الحالية](#2-تشريح-الحالة-الحالية)
3. [تقييم نقاط القوة](#3-تقييم-نقاط-القوة)
4. [نقاط الضعف ومناطق الألم](#4-نقاط-الضعف-ومناطق-الألم)
5. [الفلسفة التصميمية المقترحة](#5-الفلسفة-التصميمية-المقترحة)
6. [النظام البصري المقترح (Design System)](#6-النظام-البصري-المقترح-design-system)
7. [تحسينات تجربة القراءة](#7-تحسينات-تجربة-القراءة)
8. [تحسينات الأزرار والتحكّم](#8-تحسينات-الأزرار-والتحكّم)
9. [تحسينات القائمة الجانبية](#9-تحسينات-القائمة-الجانبية)
10. [تحسينات شريط الأدوات العلوي](#10-تحسينات-شريط-الأدوات-العلوي)
11. [الحالات الخاصّة (تحميل، فارغ، خطأ)](#11-الحالات-الخاصّة-تحميل-فارغ-خطأ)
12. [الحركة والانتقالات (Motion)](#12-الحركة-والانتقالات-motion)
13. [إمكانية الوصول والاستجابة](#13-إمكانية-الوصول-والاستجابة)
14. [الأداء المُدرَك (Perceived Performance)](#14-الأداء-المُدرَك-perceived-performance)
15. [خارطة الطريق التنفيذية](#15-خارطة-الطريق-التنفيذية)
16. [قائمة فحص النهائية (Polish Checklist)](#16-قائمة-فحص-النهائية-polish-checklist)

---

## 1. الملخّص التنفيذي

صفحة الأدلة الحالية **متينة وظيفياً** وتحوي ميزات متقدّمة (بحث server-side، تحرير يدوي، SSE للترجمة، تكبير، قابل للتغيير الحجم). لكنّها تعاني من **ضعف في الجاذبية البصرية وتجربة القراءة** يحول دون أن يستمتع المستخدم بالبقاء فيها.

| البُعد | التقييم الحالي | الهدف |
|---|---|---|
| الوظائف | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| الجاذبية البصرية | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| سلاسة القراءة | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| تنظيم المعلومات | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| التغذية الراجعة (Feedback) | ⭐⭐ | ⭐⭐⭐⭐ |
| الإمكانية القرائية (Discoverability) | ⭐⭐ | ⭐⭐⭐⭐ |

**أعلى 5 توصيات أثراً (Top 5 Impact):**
1. **فهرس محتوى تلقائي (TOC)** على يسار/يمين المقالة مع تظليل القسم النشط.
2. **شريط تقدّم القراءة** + **زمن قراءة متوقّع** + **عدّاد كلمات** كـ metadata احترافية.
3. **Command Palette (Ctrl+K)** للبحث والتنقّل الفوري.
4. **تمييز صياغة الكود (Syntax Highlighting)** مع **زرّ نسخ** لكلّ كتلة.
5. **ترقية بصرية للقائمة الجانبية**: أيقونات للفئات، شريط تقدّم لكل فئة، طيّ/توسيع، وقسم «الأخيرة».

---

## 2. تشريح الحالة الحالية

### 2.1 البنية الهيكلية

```
┌─────────────────────────────────────────────────────────────────┐
│  COMPACT TOOLBAR (h-12, slim)                                   │
│  [☰] [📘 Guides] [Stats Chips...] ──spacer── [🔍] [AR/EN] [⟲▾] │
├─────────────────────────────────────────────────────────────────┤
│  (Mobile: stat chips row)                                       │
│  (Optional: Refresh progress strip)                             │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                  │
│   SIDEBAR    │   CONTENT                                        │
│   PANEL      │   ┌────────────────────────────────────────┐    │
│   (24%)      │   │ Doc header: Breadcrumb › Title         │    │
│              │   │ Badges • timestamps • [-100%+] [⎘][⬇]  │    │
│   Folder     │ ║ ├────────────────────────────────────────┤    │
│   ├─ list    │ ║ │                                        │    │
│   │  items   │ ║ │   article (prose, max-w 48rem,         │    │
│              │ ║ │   ReactMarkdown + remarkGfm)           │    │
│              │ ║ │                                        │    │
│              │ ║ └────────────────────────────────────────┘    │
│              │ │                                                │
│              │ Resize handle (withHandle, double-click=collapse)│
└──────────────┴──────────────────────────────────────────────────┘
```

### 2.2 الميزات الحاليّة بالتفصيل

#### الشريط العلوي (Toolbar)
| العنصر | الأبعاد | الوظيفة |
|---|---|---|
| `Sidebar Toggle` | `h-8 w-8` | يطوي/يوسّع القائمة (`PanelLeftClose/Open`) |
| `Brand mark` | `7×7` icon + `text-sm` | شعار `BookOpen` + «أدلة n8n» |
| `Stat Chips` | `h-7 px-2` (يظهر على `lg:` فقط) | Total / EN / AR / Edits |
| `Search input` | `h-8 w-44→72` | بحث server-side debounced 250ms |
| `Lang toggle` | `text-[11px] h-auto p-0.5` | AR/EN لمحتوى الأدلة فقط |
| `Admin Refresh` | `h-8` Dropdown | تحقّق / جلب / جلب+ترجمة |

#### القائمة الجانبية (Sidebar)
- **Resizable Panel** (`defaultSize: 24%, min: 14%, max: 45%, collapsible`)
- **حفظ الحجم** عبر `autoSaveId="guides-layout"`
- **مقبض سحب** (`withHandle`) مع نقر مزدوج للطيّ
- محتوى مجمّع حسب الفئة (`Folder > items`)
- شارة عدد لكل فئة (مظلّلة بلون الفئة)
- زرّ لكل دليل: عنوان + أيقونة `Pencil` (إن كان محرّر يدوياً) + `AlertCircle/CheckCircle2` (التوفّر)
- **نتائج البحث**: تظهر بنفس المساحة بدلاً من القائمة، مع snippet + عدد الـ hits

#### رأس المستند (Doc Header)
- **Breadcrumb**: `Folder > Category > Title`
- عنوان `H2` + شارات (Manual / Error)
- Metadata: تاريخ التحديث + عدد الأحرف + رابط المصدر
- **شريط الأزرار** (icon-only):
  - مجموعة Zoom (`-`, `100%`, `+`) في حاوية واحدة
  - `Copy`, `Download`
  - فاصل عمودي
  - (للأدمن) `Re-fetch`, `Edit`, `Clear override`
  - (في وضع التحرير) `Cancel`, `Save`

#### المقالة (Article)
- `<article>` مع `prose prose-sm md:prose-base dark:prose-invert`
- **زوم ديناميكي**: `fontSize: ${zoom*16}px` و `maxWidth: ${48*zoom}rem`
- Tailwind Typography classes للعناوين، الكود، الجداول، الاقتباسات، الصور
- `ReactMarkdown` + `remarkGfm` (يدعم الجداول، شرطة شطب، روابط، إلخ.)
- اختصارات لوحة مفاتيح: `Ctrl/Cmd +/-/0`

#### وضع التحرير (Edit Mode)
- شبكة `md:grid-cols-2`: محرّر `<textarea>` + معاينة حيّة
- زوم في كلتا اللوحتين

### 2.3 نظام الألوان الحالي

```ts
glossary    : blue   (bg-blue-500/10 text-blue-700 border-blue-500/30)
workflows   : purple
expressions : amber
credentials : emerald
hosting     : rose
api         : cyan
```

✅ نظام نظيف ومتسق، لكن **لا يُستخدم بشكل بصري قوي** خارج الشارات الصغيرة.

---

## 3. تقييم نقاط القوة

### ✅ ما يعمل جيداً

| النقطة | لماذا هي قوّة |
|---|---|
| **Toolbar نحيل (h-12)** | يوفّر مساحة قراءة كبيرة |
| **بحث Debounced server-side** | استجابة فورية وسلسة |
| **Resizable + Collapsible Sidebar** | تحكّم كامل بالعرض |
| **Zoom مع حفظ + اختصارات** | تجربة قراءة شخصية |
| **حفظ تلقائي لحجم الـ Layout** | يستعيد تفضيل المستخدم |
| **i18n RTL/LTR كامل** | تعامل صحيح مع `dir`، `prose-rtl`، الفواصل المنطقية (`me-/ms-`) |
| **Dropdown للأدمن** | لا يلوّث واجهة المستخدم العادي |
| **تصنيف بالألوان** | تمييز فوري بين الأنواع |
| **شارات حالة (Manual/Error)** | شفافية تامّة عن مصدر المحتوى |
| **SSE Progress Strip** | تغذية راجعة حيّة للعمليات الطويلة |

---

## 4. نقاط الضعف ومناطق الألم

### ❌ المشاكل المرصودة (مرتّبة حسب الأثر)

#### 🔴 **مشاكل عالية الأثر**

**ع1. لا يوجد فهرس تنقّل داخل المقالة (TOC)**
- المقالات الطويلة (مثل `hosting-configuration` أو `glossary`) قد تكون 30+ قسماً.
- المستخدم يضطرّ للتمرير المكثّف للوصول لقسم معيّن.
- لا يعرف «أين أنا الآن» داخل المستند.

**ع2. كتل الكود بلا تمييز صياغة (Syntax Highlighting)**
- `prose-pre:bg-muted/70` فقط يعطي خلفية رمادية.
- لا ألوان للكلمات المفتاحية، السلاسل، التعليقات.
- لا زرّ نسخ — يجب تحديد يدوي.
- هذا أكبر «خرّيب احترافية» في صفحات الوثائق.

**ع3. غياب metadata قراءة احترافية**
- لا «زمن قراءة متوقّع» (`5 min read`).
- لا «عدد كلمات».
- عدد الأحرف معروض، لكنه أقلّ فائدة من زمن القراءة.
- لا «آخر تحديث» بصيغة نسبيّة («منذ يومين»).

**ع4. لا شريط تقدّم قراءة**
- المستخدم لا يعرف موقعه من نهاية المستند.
- معيار صناعي في كل مدوّنة/توثيق احترافي.

**ع5. حالة فارغة باهتة**
- «اختر دليلاً للبدء» مع أيقونة `Sparkles` صغيرة.
- لا اقتراحات، لا قائمة بأشهر الأدلة، لا call-to-action.

**ع6. لا «ابحث في كل مكان» (Command Palette)**
- المستخدم المتمرّس يتوقّع `Ctrl+K`.
- البحث الحالي محصور في الشريط العلوي.

#### 🟡 **مشاكل متوسطة الأثر**

**م1. القائمة الجانبية بلا تنظيم بصري قوي**
- الفئات لا تنطوي/تتوسّع (Accordion).
- لا أيقونات مميّزة لكل فئة (كلها `Folder` رمادي).
- لا يوجد «الأخيرة» / «المفضّلة».
- لا شريط تقدّم لكل فئة (مثلاً: 80% مترجم).

**م2. شارات الإحصاء جامدة**
- StatChips تعرض أرقاماً لكنها **غير قابلة للنقر**.
- يجب أن تصبح فلاتر فورية: انقر AR لتعرض المتوفرة بالعربية فقط.

**م3. أزرار بصرية ضعيفة**
- Hover states خفيفة جداً (`hover:bg-muted`).
- لا تأثيرات لمسة (active scale).
- Tooltips بسيطة (`title` HTML الافتراضي القبيح، بدلاً من Radix Tooltip).
- الفصل بين أزرار الأدمن `<div className="w-px h-5 bg-border mx-1" />` بدائي.

**م4. رأس المستند مزدحم على الشاشات الصغيرة**
- Breadcrumb + Title + Badges + Metadata + 7 أزرار في صف واحد قد تتداخل.

**م5. لا «نسخ رابط القسم» (Anchor Links)**
- العناوين بلا `#` يظهر عند Hover.
- لا يمكن مشاركة رابط مباشر لقسم معيّن.

**م6. لا حفظ موضع التمرير لكل دليل**
- العودة لدليل سبق فتحه = يبدأ من الأعلى.

**م7. الانتقالات مفاجئة**
- لا `fade` بين تبديل المستندات.
- لا skeleton loaders، فقط `Loader2` دوّار.

#### 🟢 **مشاكل منخفضة الأثر (Polish)**

**ص1.** زرّ Toggle للقائمة يستخدم `title` العادي بدلاً من Tooltip احترافي.
**ص2.** زرّ Trash للأدمن (`Clear override`) أحمر مباشر — يحتاج تأكيد بـ AlertDialog بدل `confirm()` الأصلي القبيح.
**ص3.** Stat Chips على الموبايل تظهر في صف منفصل — تشغل سطراً كاملاً.
**ص4.** الصور في المقالة بلا lightbox (نقر للتكبير).
**ص5.** الجداول الكبيرة قد تتجاوز عرض المقالة بدون scroll أفقي واضح.
**ص6.** Footer للمستند مفقود (لا «إلى الأعلى»، لا «التالي/السابق»).

---

## 5. الفلسفة التصميمية المقترحة

### 🎨 المبادئ الخمسة

#### المبدأ 1: **«المحتوى هو الملك»** (Content-First)
- كل بكسل خارج المقالة يجب أن يبرّر وجوده.
- الـ chrome (toolbars, sidebars) رمادي/شفاف لا يسرق الانتباه.
- المقالة ذات تباين عالٍ، تباعد سخي، typography ممتازة.

#### المبدأ 2: **«البصمة الواحدة»** (Single Visual Voice)
- نظام spacing موحّد (`4 / 8 / 12 / 16 / 24 / 32` فقط).
- نظام radii موحّد (`md = 6px`, `lg = 8px`, `xl = 12px`).
- حركة موحّدة (`150ms ease-out` للجميع).
- ظلال موحّدة (`shadow-sm` للأزرار النشطة، `shadow-lg` للنوافذ المنبثقة).

#### المبدأ 3: **«الإعلام لا الإزعاج»** (Inform, Don't Interrupt)
- Toasts مكان `confirm()` و `alert()`.
- Skeletons مكان spinners كلّما أمكن.
- Inline feedback (`✓ Saved`) مكان نوافذ منبثقة.

#### المبدأ 4: **«الاكتشاف بالحدس»** (Intuitive Discovery)
- اختصارات لوحة المفاتيح مرئية في tooltips.
- Empty states تعرّف بالميزات الأساسية.
- Hover hints لا تعطّل لكن تكشف.

#### المبدأ 5: **«الذاكرة هي الراحة»** (Memory = Comfort)
- يحفظ الزوم، الحجم، اللغة، الموضع، الفلتر.
- يستعيد آخر مستند مفتوح (اختياري).

---

## 6. النظام البصري المقترح (Design System)

### 6.1 Typography Scale (للمقالة)

```css
/* النصّ الأساسي */
--prose-base:        16px / 1.7  (current: 16 / 1.5)  ✅
--prose-base-ar:     16px / 1.85 (current ✅)

/* العناوين — مع scale متناغم */
H1:  28px / 1.25  font-bold     border-b border-border pb-3 mb-6
H2:  22px / 1.3   font-semibold mt-10 mb-4 + ID anchor
H3:  18px / 1.4   font-semibold mt-7  mb-3 + ID anchor
H4:  16px / 1.5   font-semibold mt-5  mb-2

/* النص المنفّذ */
code (inline):  0.875em + 4px h-padding + 2px v-padding + radius 4px
pre (block):    14px / 1.6 + شريط رأس مع لغة + زر نسخ
```

### 6.2 لوحة الألوان (Semantic Tokens)

```css
/* تنويعات الفئات — مكثّفة بصرياً للأيقونات */
glossary    : sky    (#0ea5e9 + ring 10%)
workflows   : violet (#8b5cf6 + ring 10%)
expressions : amber  (#f59e0b + ring 10%)
credentials : emerald(#10b981 + ring 10%)
hosting     : rose   (#f43f5e + ring 10%)
api         : cyan   (#06b6d4 + ring 10%)

/* حالات */
manual-edit : amber-500 (hint of premium/curated)
upstream    : neutral-400
error       : rose-500
loading     : zinc-400 (animated)
```

### 6.3 Spacing & Sizing

```
xs : 4px   sm : 8px    md : 12px   lg : 16px
xl : 24px  2xl: 32px   3xl: 48px

أزرار أيقونة فقط : 32×32 (h-8 w-8)
أزرار مع نص    : h-9 px-3
شريط أدوات    : h-12 (current ✅)
رأس المستند   : auto (يتنفّس)
```

### 6.4 Radii & Elevation

```
أزرار/شارات : rounded-md (6px)
بطاقات     : rounded-lg (8px)
نوافذ منبثقة: rounded-xl (12px)

بدون ظل   : افتراضي
shadow-sm : أزرار في الحالة النشطة
shadow-md : Hover على البطاقات
shadow-lg : Dropdown / Popover / Dialog
shadow-xl : Command Palette
```

### 6.5 Motion Tokens

```ts
const motion = {
  instant : 0,
  fast    : 100, // hover, focus
  normal  : 150, // default
  slow    : 250, // page transitions
  slower  : 350, // entrance animations
  ease: {
    standard : "cubic-bezier(0.4, 0, 0.2, 1)",
    decel    : "cubic-bezier(0, 0, 0.2, 1)",
    accel    : "cubic-bezier(0.4, 0, 1, 1)",
  }
}
```

---

## 7. تحسينات تجربة القراءة

### 7.1 🌟 فهرس المحتوى (Table of Contents)

**الوصف:** عمود ثالث يسار/يمين المقالة (يختفي على الشاشات الصغيرة) يولّد تلقائياً من عناوين `H2`/`H3`.

**المواصفات:**
```
- العرض: 220px ثابت
- العمود: sticky top-16
- الخط: text-xs
- Indent: H3 = 12px
- العنصر النشط: text-accent + شريط 2px على اليمين/اليسار
- العنصر العادي: text-muted-foreground hover:text-foreground
- Smooth scroll on click
- Highlights via IntersectionObserver (بدون مكتبة)
- Toggle: زرّ في رأس المستند (List icon) لإظهار/إخفاء
- يحفظ التفضيل في localStorage (guides:toc:visible)
```

**القيمة المضافة:** يحوّل المستندات الطويلة من «شريط طويل» إلى «خريطة قابلة للملاحة».

---

### 7.2 شريط تقدّم القراءة (Reading Progress)

**المواصفات:**
```
- ارتفاع: 2px
- موقع: تحت Toolbar مباشرة (sticky top-12)
- لون: bg-gradient from-accent/60 to-accent
- يملأ تدريجياً مع التمرير
- يختفي عندما يكون المستند قصيراً (< viewport)
```

**التطبيق:** `useScrollProgress` hook + CSS transform لأداء مثالي.

---

### 7.3 Metadata قراءة احترافية

**استبدال الشريط الحالي:**
```
[🕐 Apr 27, 2026 03:42 PM] [📄 12,453 chars] [🔗 source]
```
**بـ:**
```
[📖 ≈8 min read] [📝 1,892 words] [🕐 محدّث منذ 3 أيام] [🔗 المصدر]
```

**الحساب:**
- الكلمات: `text.split(/\s+/).length`
- زمن القراءة: `Math.ceil(words / (lang === "ar" ? 180 : 220))`
- التاريخ النسبي: `Intl.RelativeTimeFormat`

---

### 7.4 Anchor Links على العناوين

**التطبيق:**
- كل عنوان يحصل على `id` مولّد من النص (slug).
- عند Hover على العنوان، يظهر `#` بجانبه.
- النقر ينسخ الرابط الكامل: `/guides/{slug}#section-id`.
- Toast: «تم نسخ رابط القسم».

**CSS:**
```css
.prose h2:hover .heading-anchor { opacity: 1 }
.heading-anchor {
  opacity: 0;
  margin-inline-start: 8px;
  color: var(--muted-foreground);
  font-weight: normal;
  transition: opacity 150ms;
}
```

---

### 7.5 تمييز صياغة الكود (Syntax Highlighting)

**المكتبة الموصى بها:** `react-syntax-highlighter` مع `Prism` (`prism-tomorrow` للداكن، `prism` للفاتح).
**أو الأخفّ:** `rehype-pretty-code` + Shiki (يعمل وقت البناء، أداء صفري وقت التشغيل).

**التغليف المقترح لكل كتلة:**
```jsx
<div className="rounded-lg border border-border overflow-hidden my-4">
  <div className="bg-muted/40 border-b border-border px-3 py-1.5
                  flex items-center justify-between text-[11px]">
    <span className="font-mono text-muted-foreground">{language}</span>
    <button onClick={copy} className="hover:text-foreground transition">
      {copied ? <Check size={12}/> : <Copy size={12}/>}
      <span className="ms-1">{copied ? "Copied!" : "Copy"}</span>
    </button>
  </div>
  <SyntaxHighlighter language={language} style={theme}>
    {code}
  </SyntaxHighlighter>
</div>
```

**القيمة:** هذا بمفرده يرفع الانطباع البصري بنسبة 40%.

---

### 7.6 ترقية Typography المقالة

**التحسينات:**
1. **عرض السطر المثالي:** `max-w-[68ch]` (بدلاً من `48rem` الحالي) — قراءة أمثل علمياً.
2. **تباعد الأسطر:**
   - عربي: `leading-[1.85]` ✅ موجود
   - إنجليزي: `leading-[1.75]` (حالياً 1.5)
3. **First-line indent على `p`:** `text-indent: 0` (افتراضي) لكن مع `mt-4` بين الفقرات.
4. **Drop-cap اختياري** على أول حرف من المقدّمة (للأناقة):
   ```css
   .prose > p:first-of-type::first-letter {
     font-size: 3.2em; line-height: 0.9;
     font-weight: 700; float: inline-start;
     margin-inline-end: 8px; margin-top: 4px;
     color: var(--accent);
   }
   ```
5. **Pull quotes للاقتباسات:** `border-s-4 border-accent` ✅ + `text-lg italic` للاقتباسات الطويلة.

---

### 7.7 وضع التركيز (Focus / Reading Mode)

**زرّ في رأس المستند (أيقونة `Maximize`)** يفعّل وضعاً يخفي:
- Toolbar العلوي.
- القائمة الجانبية.
- يكبّر المقالة لتشغل العرض الكامل (مع `max-w` معقول).
- يبقى زرّ خروج صغير عائم في الزاوية.
- اختصار: `F` أو `Esc` للخروج.

---

### 7.8 حفظ موضع التمرير لكل دليل

```ts
// localStorage key: guides:scroll:{slug}
// عند فتح دليل، استعد الموضع
// عند التمرير (debounced 500ms)، احفظ
```

**القيمة:** المستخدم العائد للدليل يستأنف بالضبط من حيث توقّف.

---

### 7.9 «التالي / السابق» في نهاية المستند

```jsx
<nav className="flex justify-between border-t pt-6 mt-12">
  <a href="#" className="group">
    <span className="text-xs text-muted-foreground">← السابق</span>
    <div className="font-semibold group-hover:text-accent">
      {prevDoc.title}
    </div>
  </a>
  <a href="#" className="text-end group">
    <span className="text-xs text-muted-foreground">التالي →</span>
    <div className="font-semibold group-hover:text-accent">
      {nextDoc.title}
    </div>
  </a>
</nav>
```

---

## 8. تحسينات الأزرار والتحكّم

### 8.1 نظام الأزرار الموحّد

**المستويات الثلاثة:**

| المستوى | الاستخدام | المظهر |
|---|---|---|
| **Primary** | Save, Confirm, CTA رئيسي | `bg-accent text-accent-foreground shadow-sm` |
| **Secondary** | Cancel, Filter, Action ثانوي | `border border-border bg-background hover:bg-muted` |
| **Ghost** | أزرار أيقونة، actions في الـ header | `hover:bg-muted/70 active:bg-muted` |
| **Danger** | Delete, Clear override | `text-rose-600 hover:bg-rose-500/10 hover:text-rose-700` |

**حالات تفاعلية موحّدة:**
```css
button {
  transition: all 150ms ease-out;
  /* Hover */
  &:hover { background: ...; }
  /* Active (touch feedback) */
  &:active { transform: scale(0.97); }
  /* Focus (a11y) */
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  /* Disabled */
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}
```

### 8.2 ترقية مجموعة Zoom

**الحالي:** أزرار `−` `100%` `+` في حاوية.
**المقترح:**
- إضافة **مؤشر slider** صغير تحت الأرقام عند فتح dropdown.
- تظليل القيمة الحالية مع أنماط preset: `80%` `100%` `125%` `150%`.
- إخفاء «100%» إذا كانت القيمة 100% (نظافة).
- تحويل الزرّ كاملاً إلى `Popover` صغير عند النقر على النسبة:
  ```
  [- 110% +]  →  click 110%  →  popover with slider + presets
  ```

### 8.3 ترقية أزرار الأدمن

**الحالي:** 3 أزرار منفصلة + فاصل.
**المقترح:** دمج في `DropdownMenu` واحد بأيقونة `MoreHorizontal`:
```
[⋯] (admin)
  ├ ✏️  تحرير يدوي
  ├ 🔄  إعادة الجلب
  ├ 📋  نسخ Markdown
  ├ ⬇️  تنزيل .md
  ├ 🔗  نسخ رابط القسم
  ├ 📤  مشاركة
  └ 🗑️  مسح التحرير اليدوي  (red, مع AlertDialog)
```

**لماذا:** يقلّل الضوضاء البصرية ويوحّد جميع الإجراءات.

### 8.4 Tooltip احترافي

**استبدل** `title="..."` HTML الافتراضي **بـ** `<Tooltip>` من Radix:
```jsx
<Tooltip>
  <TooltipTrigger asChild>
    <Button>...</Button>
  </TooltipTrigger>
  <TooltipContent side="bottom" sideOffset={4}>
    <span>إعادة الجلب</span>
    <kbd className="ms-2 text-[10px] opacity-60">⌘R</kbd>
  </TooltipContent>
</Tooltip>
```
- يظهر بعد 400ms (لا يزعج).
- يحوي اختصار لوحة المفاتيح.
- ظلّ خفيف + سهم.

### 8.5 شارات الإحصاء التفاعلية

**اجعل StatChips قابلة للنقر كفلاتر:**
```
[📄 511 Total]   ← انقر = إعادة تعيين الفلتر
[✓ 511 EN 100%]  ← انقر = اعرض المستندات بالإنجليزية فقط (حالياً اللغة EN)
[🌐 510 AR 99%]  ← انقر = اعرض المتوفرة بالعربية
[✏️ 12 Edits]    ← انقر = اعرض المحرّرة يدوياً فقط
```
- شارة نشطة: `ring-2 ring-accent` + `font-bold`.
- زرّ مسح بجانبها عند التفعيل.

### 8.6 زرّ الإجراء العائم (FAB) للموبايل

على الشاشات الصغيرة، أضف زرّاً عائماً في أسفل اليمين/اليسار:
- يفتح Sheet جانبي للقائمة.
- لون accent، حجم 48×48، ظل قوي.
- يظهر فقط عند طيّ القائمة.

---

## 9. تحسينات القائمة الجانبية

### 9.1 رأس القائمة الذكي

**أضف رأساً للقائمة (مفقود حالياً):**
```
┌────────────────────────────────┐
│ 🔍 Filter in nav...        [⌘K]│  ← فلتر محلي سريع (مختلف عن البحث الشامل)
├────────────────────────────────┤
│ 🕐 Recently viewed       [show]│  ← قسم قابل للطيّ
│   ├ Glossary                   │
│   ├ API Auth                   │
│   └ Hosting Setup              │
├────────────────────────────────┤
│ ⭐ Pinned                       │  ← مفضّلات (يضيفها المستخدم)
│   └ Workflow Basics            │
└────────────────────────────────┘
```

### 9.2 فئات قابلة للطيّ (Accordion)

كل فئة تصبح:
```jsx
<div>
  <button className="w-full flex items-center justify-between
                     px-2 py-1.5 hover:bg-muted/40 rounded-md group">
    <div className="flex items-center gap-2">
      <ChevronRight className="transition-transform group-data-[open]:rotate-90" />
      <CategoryIcon className={categoryIconColor} />
      <span className="font-semibold text-xs">{label}</span>
    </div>
    <div className="flex items-center gap-1.5">
      {/* شريط تقدّم الترجمة */}
      <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-accent" style={{width: `${pct}%`}} />
      </div>
      <span className="text-[10px] text-muted-foreground">{count}</span>
    </div>
  </button>
  {/* الأطفال — مع تأثير fade/slide عند الفتح */}
</div>
```

### 9.3 أيقونات لكل فئة

```ts
const categoryIcons = {
  glossary    : BookText,
  workflows   : Workflow,
  expressions : Code2,
  credentials : KeyRound,
  hosting     : Server,
  api         : Webhook,
};
```

كل أيقونة بلون فئتها، حجم `14px`.

### 9.4 عناصر القائمة الأنيقة

**تحسينات على زرّ كل دليل:**
```jsx
<button className="
  group relative
  w-full text-start px-2.5 py-2 rounded-md text-xs
  transition-all duration-150
  hover:bg-muted/70 hover:translate-x-0.5  /* انزلاق خفيف */
  data-[active=true]:bg-accent/10
  data-[active=true]:text-accent
  data-[active=true]:font-medium
  data-[active=true]:shadow-sm
">
  {/* شريط جانبي للنشط */}
  <span className="absolute inset-y-1 start-0 w-0.5 rounded-full
                   bg-accent opacity-0 group-data-[active=true]:opacity-100" />

  <span className="flex-1 truncate">{title}</span>

  {/* شارات الحالة */}
  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100">
    {hasOverride && <Pencil size={10} className="text-amber-500" />}
    {!hasMarkdown && <AlertCircle size={10} className="text-rose-500" />}
  </div>
</button>
```

**التحسينات الدقيقة:**
- شريط جانبي 2px أنيق للعنصر النشط.
- انزلاق خفيف عند Hover (`translate-x-0.5`).
- شارات الحالة تتلاشى/تظهر بسلاسة.

### 9.5 شريط تقدّم الفئة

في رأس كل فئة:
```
📚 المعجم        ████████░░  82/95
⚙️ Workflows    ██████████ 100/100
🔌 API           ███░░░░░░░  3/12
```
- بصمة بصرية فورية لمعدّل التغطية.
- لون التقدّم = لون الفئة.

---

## 10. تحسينات شريط الأدوات العلوي

### 10.1 إعادة هيكلة مدروسة

**الحالي:**
```
[☰] [📘 Brand] [Stats×4] ─── [🔍] [AR/EN] [⟲▾]
```

**المقترح:**
```
[☰] [📘 Brand]           [🔍 Search...    ⌘K]    [📊 Filters] [AR/EN] [⋯]
                                                    ↑ chip group
```
- البحث **في الوسط** (المركز البصري الطبيعي).
- شارات الإحصاء تتحوّل إلى **أزرار فلتر** قابلة للطيّ في dropdown «Filters».
- جميع إجراءات الأدمن في `[⋯]` واحد.

### 10.2 Command Palette (Ctrl+K)

**التطبيق:**
- مكتبة: `cmdk` (موصى بها، تشبه Linear/Vercel).
- يفتح بـ `Ctrl/Cmd + K`.
- يبحث في **عناوين الأدلة + المحتوى + الأقسام (headings)**.
- مجموعات النتائج:
  ```
  📄 Guides
    ├ Glossary
    ├ Workflow basics
  📑 Sections (in current doc)
    ├ # Authentication
    ├ # Rate limits
  ⚡ Actions
    ├ Toggle sidebar          ⌘B
    ├ Switch to Arabic         ⌘L
    ├ Refresh all (admin)      ⌘R
  ```
- تنقّل بأسهم لوحة المفاتيح، Enter للتفعيل.

**القيمة:** يفتح عالماً جديداً من السرعة للمستخدم المتمرّس.

### 10.3 بحث ذكي مع اقتراحات

**حالياً:** بحث يظهر النتائج في القائمة الجانبية.
**مقترح:** dropdown مباشر تحت حقل البحث:
```
🔍 [auth_______________]
   ├ 📄 API Authentication       (3 hits)
   │   ...generates a Bearer token for...
   ├ 📄 Credentials Overview     (1 hit)
   │   ...auth method for OAuth2...
   └ View all 8 results →
```
- أسرع وأكثر سياقاً.
- يبقى الـ sidebar للتصفّح.

---

## 11. الحالات الخاصّة (تحميل، فارغ، خطأ)

### 11.1 Skeleton Loaders

**استبدل** `<Loader2 className="animate-spin" />` **بـ** هياكل عظمية تحاكي المحتوى:

```jsx
// قائمة Skeleton
<div className="space-y-2 p-3">
  {[1,2,3,4,5].map(i => (
    <div key={i} className="flex items-center gap-2">
      <Skeleton className="h-3 w-3 rounded" />
      <Skeleton className="h-3 flex-1 max-w-[180px]" />
    </div>
  ))}
</div>

// مقالة Skeleton
<div className="space-y-4 p-8 max-w-3xl">
  <Skeleton className="h-8 w-3/4" />        {/* العنوان */}
  <Skeleton className="h-4 w-1/3" />        {/* metadata */}
  <div className="space-y-2 pt-4">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
  </div>
</div>
```

**التأثير:** المستخدم يدرك الموقع والحجم فوراً، يقلّل الإحساس بالانتظار.

### 11.2 الحالة الفارغة الذكيّة

**بدل:** «اختر دليلاً للبدء»
**اعرض:** صفحة هبوط داخلية:
```
                 ✨
       مرحباً بك في أدلة n8n

  511 دليل بالإنجليزية، 510 بالعربية، جاهزة للاستكشاف.

   ┌──────────── ابدأ من هنا ─────────────┐
   │                                       │
   │ 🚀 Getting Started      → 5 min read │
   │ 📚 Glossary             → مرجع المصطلحات│
   │ 🔐 API Authentication   → 8 min read │
   │ ⚙️ Workflow Basics      → 12 min read│
   │                                       │
   └───────────────────────────────────────┘

         أو ابحث في كل المحتوى   [⌘K]
```

### 11.3 حالات الخطأ الأنيقة

**بدل** Toast فقط، **أضف** خط زمني للخطأ في رأس المستند:
```
⚠️ تعذّر تحديث هذا الدليل من المصدر  ·  محاولة قبل ساعتين
   [Try again]  [View error details ▾]
```

---

## 12. الحركة والانتقالات (Motion)

### 12.1 جدول الحركات الموصى بها

| الحدث | الحركة | المدّة | المنحنى |
|---|---|---|---|
| فتح dropdown | fade + slide-up 4px | 150ms | ease-out |
| إغلاق dropdown | fade + slide-down 4px | 100ms | ease-in |
| تبديل المستند | fade-out → fade-in | 250ms | ease |
| Hover على زر | bg + scale(1.02) | 100ms | ease-out |
| Active على زر | scale(0.97) | 80ms | ease-out |
| فتح/طيّ القائمة | width transition | 200ms | ease-in-out |
| ظهور Toast | slide-in من اليمين | 200ms | ease-out |
| فتح فئة (accordion) | height + fade | 200ms | ease-in-out |
| التمرير لقسم (anchor) | smooth scroll | 400ms | ease |
| ظهور TOC الجانبي | slide-in من الجانب | 250ms | ease-out |

### 12.2 تطبيق:

```css
/* في tailwind.config أو global */
@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px) } to { opacity: 1; transform: none } }

/* للمكوّنات الديناميكية */
.transition-default { transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1); }
```

### 12.3 احترام `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important; }
}
```

---

## 13. إمكانية الوصول والاستجابة

### 13.1 لوحة المفاتيح الكاملة

| اختصار | الوظيفة |
|---|---|
| `⌘/Ctrl + K` | فتح Command Palette |
| `⌘/Ctrl + B` | طيّ/توسيع القائمة |
| `⌘/Ctrl + L` | تبديل اللغة (AR/EN) |
| `⌘/Ctrl + +/-/0` | زوم (✅ موجود) |
| `⌘/Ctrl + S` | حفظ التحرير (في وضع التحرير) |
| `J / K` | الدليل التالي/السابق في القائمة |
| `/` | تركيز حقل البحث |
| `?` | عرض جميع الاختصارات |
| `F` | وضع التركيز |
| `Esc` | إغلاق modal / إلغاء تحرير |
| `G G` | الذهاب لأعلى المستند |
| `G E` | الذهاب لأسفل المستند |

### 13.2 ARIA & Semantics

- جميع الأزرار `aria-label`.
- `<nav aria-label="Guides navigation">` للقائمة.
- `<main>` للمقالة.
- `aria-current="page"` للدليل النشط.
- `role="search"` لحقل البحث.
- `aria-live="polite"` لـ Toast.

### 13.3 تباين الألوان (WCAG AA)

- جميع النصوص ≥ 4.5:1.
- `text-muted-foreground` يجب فحصه — قد يكون 3.5:1 فقط.

### 13.4 الاستجابة (Responsive)

| العرض | السلوك |
|---|---|
| `< 480px` | القائمة Drawer + FAB لفتحها، Toolbar في صفّين |
| `480–768px` | القائمة قابلة للطيّ، TOC مخفي |
| `768–1024px` | Layout كامل بدون TOC |
| `> 1024px` | + TOC جانبي + Stat chips كاملة |
| `> 1440px` | + max-width للمقالة 72ch لراحة العين |

---

## 14. الأداء المُدرَك (Perceived Performance)

### 14.1 تقنيات السرعة المُدرَكة

1. **Optimistic UI** للأكشنات الفورية (تبديل اللغة، إغلاق dropdown).
2. **Prefetch** لأول 5 أدلة في القائمة (`onMouseEnter` → fetch + cache).
3. **Stale-while-revalidate** لقائمة الأدلة (يعرض القديم فوراً، يحدّث بصمت).
4. **Image lazy loading** + `decoding="async"`.
5. **Code splitting** لـ ReactMarkdown إن كان كبيراً.
6. **Virtualization** للقائمة الجانبية إذا تجاوزت 100 عنصر.

### 14.2 تحسينات React

- `useMemo` للقائمة المجمّعة (✅ موجود).
- `useCallback` للـ handlers الممرّرة لمكوّنات أبناء.
- `React.memo` لـ `StatChip`, `SearchResults`, عناصر القائمة.

---

## 15. خارطة الطريق التنفيذية

### 🥇 المرحلة 1 — أساسيات الاحترافية (1-2 يوم)
**الهدف:** قفزة واضحة في الانطباع البصري.

| # | الميزة | التعقيد | الأثر |
|---|---|---|---|
| 1 | تمييز صياغة الكود + زر نسخ | متوسط | 🔥🔥🔥 |
| 2 | شريط تقدّم القراءة | منخفض | 🔥🔥 |
| 3 | Metadata احترافية (زمن قراءة + كلمات + تاريخ نسبي) | منخفض | 🔥🔥🔥 |
| 4 | Skeleton loaders | منخفض | 🔥🔥 |
| 5 | Tooltip احترافي (استبدال title) | منخفض | 🔥🔥 |
| 6 | حالة فارغة ذكية | منخفض | 🔥🔥 |

### 🥈 المرحلة 2 — تجربة قراءة متقدّمة (2-3 أيام)
| # | الميزة | التعقيد | الأثر |
|---|---|---|---|
| 7 | فهرس محتوى تلقائي (TOC) | متوسط | 🔥🔥🔥🔥 |
| 8 | Anchor links على العناوين | منخفض | 🔥🔥 |
| 9 | حفظ موضع التمرير لكل دليل | منخفض | 🔥🔥 |
| 10 | تحسين typography المقالة | منخفض | 🔥🔥 |
| 11 | «التالي / السابق» في الذيل | منخفض | 🔥 |
| 12 | وضع التركيز (Focus mode) | متوسط | 🔥🔥 |

### 🥉 المرحلة 3 — قوّة المستخدم المتمرّس (3-4 أيام)
| # | الميزة | التعقيد | الأثر |
|---|---|---|---|
| 13 | Command Palette (Ctrl+K) | عالٍ | 🔥🔥🔥🔥 |
| 14 | اختصارات لوحة المفاتيح الشاملة | متوسط | 🔥🔥 |
| 15 | شارات الإحصاء كفلاتر تفاعلية | متوسط | 🔥🔥 |
| 16 | بحث dropdown مباشر | متوسط | 🔥🔥 |

### 🏅 المرحلة 4 — صقل القائمة الجانبية (2 يوم)
| # | الميزة | التعقيد | الأثر |
|---|---|---|---|
| 17 | أيقونات للفئات | منخفض | 🔥 |
| 18 | فئات قابلة للطيّ | متوسط | 🔥🔥 |
| 19 | شريط تقدّم لكل فئة | منخفض | 🔥 |
| 20 | قسم «الأخيرة» | متوسط | 🔥🔥 |
| 21 | مفضّلات (Pinned) | متوسط | 🔥 |
| 22 | فلتر داخلي للقائمة | منخفض | 🔥 |

### 🎯 المرحلة 5 — لمسات نهائية (1-2 يوم)
| # | الميزة | التعقيد | الأثر |
|---|---|---|---|
| 23 | AlertDialog لتأكيد المسح | منخفض | 🔥 |
| 24 | Lightbox للصور | منخفض | 🔥 |
| 25 | Scroll أفقي محسّن للجداول | منخفض | 🔥 |
| 26 | حركات polished (motion tokens) | متوسط | 🔥🔥 |
| 27 | اختبار شامل WCAG AA | متوسط | 🔥 |
| 28 | تحسين الموبايل (FAB + Drawer) | متوسط | 🔥🔥 |

---

## 16. قائمة فحص النهائية (Polish Checklist)

### بصري
- [ ] كل زرّ له hover, active, focus, disabled states موحّدة.
- [ ] جميع الانتقالات `150ms ease-out` (إلا لو محدّد).
- [ ] لا توجد خطوط منقطعة عشوائية.
- [ ] الظلال متدرّجة (sm/md/lg) حسب الارتفاع.
- [ ] الزوايا متناسقة (md/lg/xl حسب المكوّن).
- [ ] التباين WCAG AA لجميع النصوص.

### تفاعلي
- [ ] كل عمل يأخذ > 200ms له spinner / skeleton.
- [ ] كل عمل ناجح يعطي toast / inline confirmation.
- [ ] كل خطأ مرئي وقابل للاسترداد.
- [ ] لا `confirm()` / `alert()` HTML أصلية.

### قراءة
- [ ] أرقام كلمات وزمن قراءة لكل مستند.
- [ ] فهرس TOC للمستندات الطويلة (> 3 H2).
- [ ] شريط تقدّم القراءة.
- [ ] أزرار نسخ على كل code block.

### تنقّل
- [ ] Command Palette يعمل بـ Ctrl/Cmd+K.
- [ ] جميع الاختصارات موثّقة (Ctrl/Cmd+?).
- [ ] حفظ موضع التمرير.
- [ ] التالي/السابق في نهاية المستند.

### حالات
- [ ] حالة فارغة جذّابة وتعليمية.
- [ ] حالات تحميل skeletons لا spinners.
- [ ] حالة خطأ قابلة للاسترداد بضغطة زر.
- [ ] حالة لا-نتائج للبحث ودودة.

### الإمكانية
- [ ] جميع `aria-label` موجودة.
- [ ] لوحة المفاتيح كاملة بدون فأرة.
- [ ] `prefers-reduced-motion` مُحترَم.
- [ ] الموبايل قابل للاستخدام بإصبع واحد.

### الذاكرة
- [ ] الزوم محفوظ.
- [ ] حجم القائمة محفوظ.
- [ ] اللغة محفوظة.
- [ ] موضع التمرير محفوظ لكل دليل.
- [ ] آخر مستند مفتوح يستعاد (اختياري).

---

## 🎯 الخلاصة

صفحة الأدلة الحالية وصلت إلى **«الكفاءة الوظيفية»** بامتياز. القفزة التالية هي **«الفخامة التجريبية»** — تلك اللمسة التي تجعل المستخدم يقول:

> «هذه الصفحة تشبه Stripe Docs / Linear / Vercel.»

التركيز يجب أن يكون على:
1. **القراءة كتجربة** (TOC، تقدّم، typography، code highlighting).
2. **الأزرار كصناعة** (states موحّدة، tooltips احترافية، حركات دقيقة).
3. **التنقّل كقوّة** (Command Palette، اختصارات، ذاكرة).
4. **التغذية الراجعة كحوار** (skeletons، toasts، حالات تفاعلية).

تنفيذ المرحلتين الأولى والثانية وحدها (4-5 أيام) يحوّل الصفحة بصرياً وتجريبياً تحوّلاً جذرياً، ويرفع من زمن البقاء وراحة المستخدم بشكل ملموس.

---

> **المُؤلِّف:** Replit Agent — تحليل مبني على القراءة الكاملة لـ `guides.tsx` (1,022 سطر) وفحص جميع المكوّنات المرتبطة (Resizable, Dropdown, ScrollArea, ContentRefreshPanel).
>
> **الخطوة التالية المقترحة:** ابدأ بالمرحلة 1 (يوم واحد) للحصول على قفزة بصرية فورية، ثم تابع بالمرحلة 2.
