# عقدة Airtable

استخدم عقدة Airtable لأتمتة سير العمل في Airtable، ودمج Airtable مع تطبيقات أخرى. تدعم n8n بشكل مدمج مجموعة واسعة من ميزات Airtable، بما في ذلك إنشاء الجداول وقراءتها وسردها وتحديثها وحذفها.

في هذه الصفحة، ستجد قائمة بالعمليات التي تدعمها عقدة Airtable وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد Airtable](/integrations/builtin/credentials/airtable.md) للحصول على إرشادات حول إعداد المصادقة.

## العمليات

*   إلحاق البيانات بجدول
*   حذف البيانات من جدول
*   سرد البيانات من جدول
*   قراءة البيانات من جدول
*   تحديث البيانات في جدول

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

توفر n8n عقدة مُحفِّز (trigger node) لـ Airtable. يمكنك العثور على وثائق عقدة المُحفِّز [هنا](/integrations/builtin/trigger-nodes/n8n-nodes-base.airtabletrigger.md).

ارجع إلى [وثائق Airtable](https://airtable.com/developers/web/api/introduction) لمزيد من المعلومات حول الخدمة.

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في تنفيذها، يمكنك استخدام [عقدة HTTP Request](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء واجهة برمجة تطبيقات (API) للخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة HTTP Request:

1.  في عقدة HTTP Request، حدد **Authentication** > **Predefined Credential Type**.
2.  حدد الخدمة التي ترغب في الاتصال بها.
3.  حدد بيانات الاعتماد الخاصة بك.

ارجع إلى [عمليات API المخصصة](/integrations/custom-operations.md) لمزيد من المعلومات.

## مرجع العقدة

### الحصول على معرّف السجل (Record ID)

لجلب البيانات لسجل معين، تحتاج إلى `Record ID`. هناك طريقتان للحصول على `Record ID`.

### إنشاء عمود `Record ID` في Airtable

لإنشاء عمود `Record ID` في جدولك، ارجع إلى هذه [المقالة](https://support.airtable.com/docs/finding-airtable-ids). يمكنك بعد ذلك استخدام `Record ID` هذا في عقدة Airtable الخاصة بك.

### استخدام عملية السرد (List)

للحصول على `Record ID` لسجلك، يمكنك استخدام عملية **List** في عقدة Airtable. ستُرجع هذه العملية `Record ID` بالإضافة إلى الحقول. يمكنك بعد ذلك استخدام `Record ID` هذا في عقدة Airtable الخاصة بك.

### تصفية السجلات عند استخدام عملية القائمة (List operation)

لتصفية السجلات من قاعدة بيانات Airtable الخاصة بك، استخدم خيار **التصفية بواسطة صيغة** (Filter By Formula). على سبيل المثال، إذا كنت ترغب في إرجاع جميع المستخدمين الذين ينتمون إلى مؤسسة `n8n`، فاتبع الخطوات المذكورة أدناه:

1.  حدد 'List' من القائمة المنسدلة **العملية** (Operation).
2.  أدخل معرف القاعدة (Base ID) واسم الجدول (Table) في حقلي **معرف القاعدة** و **الجدول**، على التوالي.
3.  انقر على **إضافة خيار** (Add Option) وحدد 'Filter By Formula' من القائمة المنسدلة.
4.  أدخل الصيغة التالية في حقل **التصفية بواسطة صيغة** (Filter By Formula): `{Organization}='n8n'`.

وبالمثل، إذا كنت ترغب في إرجاع جميع المستخدمين الذين لا ينتمون إلى مؤسسة `n8n`، استخدم الصيغة التالية: `NOT({Organization}='n8n')`.

ارجع إلى [توثيق](https://support.airtable.com/hc/en-us/articles/203255215-Formula-Field-Reference) Airtable لمعرفة المزيد عن الصيغ.

## المشكلات الشائعة

للاطلاع على الأخطاء (Errors) أو المشكلات الشائعة وخطوات الحل المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/app-nodes/n8n-nodes-base.airtable/common-issues.md).

---

# المشكلات الشائعة لعقدة Airtable

فيما يلي بعض الأخطاء (Errors) والمشكلات الشائعة المتعلقة بـ [عقدة Airtable](/integrations/builtin/app-nodes/n8n-nodes-base.airtable/index.md) وخطوات حلها أو استكشافها.

## محظور - ربما تحقق من بيانات الاعتماد الخاصة بك

يظهر هذا الخطأ (Error) عند محاولة تنفيذ عمليات (Operations) غير مسموح بها بمستوى الوصول الحالي الخاص بك. النص الكامل يبدو كالتالي:

```
There was a problem loading the parameter options from server: "Forbidden - perhaps check your credentials?"
```

يظهر الخطأ (Error) غالبًا عندما لا تحتوي بيانات الاعتماد (Credential) التي تستخدمها على النطاقات (scopes) المطلوبة للموارد (Resources) التي تحاول إدارتها.

ارجع إلى [بيانات اعتماد Airtable](/integrations/builtin/credentials/airtable.md) و [توثيق نطاقات Airtable](https://airtable.com/developers/web/api/scopes) لمزيد من المعلومات.

## الخدمة تتلقى عددًا كبيرًا جدًا من الطلبات منك

تفرض Airtable حدًا صارمًا على واجهة برمجة التطبيقات (API) لعدد الطلبات التي يتم إنشاؤها باستخدام رموز الوصول الشخصية.

إذا أرسلت أكثر من خمسة طلبات في الثانية لكل قاعدة، ستتلقى خطأ (Error) برمز 429، مما يشير إلى أنك أرسلت عددًا كبيرًا جدًا من الطلبات. سيتعين عليك الانتظار 30 ثانية قبل استئناف الطلبات. ينطبق هذا الحد نفسه على إرسال أكثر من 50 طلبًا عبر جميع القواعد لكل رمز وصول.

يمكنك معرفة المزيد في [توثيق حدود معدل Airtable](https://airtable.com/developers/web/api/rate-limits). إذا واجهت حدود المعدل (rate limits) مع عقدة Airtable، ففكر في تطبيق أحد الاقتراحات الموجودة في صفحة [التعامل مع حدود المعدل](/integrations/builtin/rate-limits.md).