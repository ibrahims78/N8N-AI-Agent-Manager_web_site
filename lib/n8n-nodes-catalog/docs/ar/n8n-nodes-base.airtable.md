عقدة Airtable (أيرتيبل)

استخدم عقدة Airtable لأتمتة العمل في Airtable وربط Airtable مع تطبيقات أخرى. يوفر n8n دعمًا مدمجًا لمجموعة واسعة من ميزات Airtable، بما في ذلك إنشاء، قراءة، سرد، تحديث وحذف الجداول.

في هذه الصفحة، ستجد قائمة بالعمليات التي تدعمها العقدة Airtable وروابط إلى موارد إضافية.

> **بيانات الاعتماد**  
> راجع [Airtable credentials](/integrations/builtin/credentials/airtable.md) للحصول على إرشادات حول إعداد المصادقة.

## العمليات

* أضِف البيانات إلى جدول
* احذف البيانات من جدول
* سرد البيانات من جدول
* قراءة البيانات من جدول
* حدث البيانات في جدول

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

توفر n8n عقدة مُحفّز لـ Airtable. يمكنك العثور على مستندات عقدة المُحفّز [here](/integrations/builtin/trigger-nodes/n8n-nodes-base.airtabletrigger.md).

راجع [Airtable's documentation](https://airtable.com/developers/web/api/introduction) لمزيد من المعلومات حول الخدمة.

## ماذا تفعل إذا لم تكن العملية مدعومة

إذا لم تدعم هذه العقدة العملية التي تريد تنفيذها، يمكنك استخدام عقدة [HTTP Request node](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء API الخاص بالخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة HTTP Request:

1. في عقدة HTTP Request، اختر **Authentication** > **Predefined Credential Type**.
2. اختر الخدمة التي ترغب في الاتصال بها.
3. اختر بيانات الاعتماد الخاصة بك.

راجع [Custom API operations](/integrations/custom-operations.md) لمزيد من المعلومات.

## مرجع العقدة

### الحصول على Record ID (معرّف السجل)

لجلب البيانات لسجل معين، تحتاج إلى Record ID (معرّف السجل). هناك طريقتان للحصول على هذا المعرف.

### إنشاء عمود Record ID في Airtable (أيرتيبل)

لإنشاء عمود `Record ID` في جدولك، راجع هذا [المقال](https://support.airtable.com/docs/finding-airtable-ids). يمكنك بعد ذلك استخدام هذا Record ID في عقدة Airtable.

### استخدام عملية List

للحصول على معرف السجل لبياناتك، يمكنك استخدام عملية **List** من عقدة Airtable. ستعيد هذه العملية معرف السجل مع الحقول. ثم يمكنك استخدام هذا Record ID في عقدة Airtable.

### ترشيح السجلات عند استخدام عملية List

لترشيح السجلات من قاعدة Airtable الخاصة بك، استخدم خيار **Filter By Formula**. على سبيل المثال، إذا كنت تريد إعادة جميع المستخدمين الذين ينتمون إلى المؤسسة `n8n`، فاتبِع الخطوات التالية:

1. اختر 'List' من قائمة **Operation** المنسدلة.
2. أدخل معرف القاعدة واسم الجدول في حقول **Base ID** و**Table** على التوالي.
3. انقر على **Add Option** واختر 'Filter By Formula' من القائمة المنسدلة.
4. أدخل الصيغة التالية في حقل **Filter By Formula**: `{Organization}='n8n'`.

وبالمثل، إذا أردت إعادة جميع المستخدمين الذين لا ينتمون إلى المؤسسة `n8n`، استخدم الصيغة التالية: `NOT({Organization}='n8n')`.

راجع مستندات Airtable [documentation](https://support.airtable.com/hc/en-us/articles/203255215-Formula-Field-Reference) لمعرفة المزيد عن الصيغ.

## المشاكل الشائعة

لأخطاء شائعة ومشكلات واقتراحات الحل، راجع [Common Issues](/integrations/builtin/app-nodes/n8n-nodes-base.airtable/common-issues.md).