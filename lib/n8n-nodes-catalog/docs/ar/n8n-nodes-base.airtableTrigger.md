# عقدة Airtable Trigger

[Airtable](https://airtable.com/) هو مزيج هجين بين جداول البيانات وقواعد البيانات، يجمع ميزات قاعدة البيانات ويطبقها على جدول البيانات. تشبه الحقول في جدول Airtable الخلايا في جدول البيانات، ولكنها تحتوي على أنواع مثل 'مربع اختيار' (checkbox)، و'رقم هاتف' (phone number)، و'قائمة منسدلة' (drop-down list)، ويمكنها الإشارة إلى مرفقات الملفات مثل الصور.

في هذه الصفحة، ستجد قائمة بالأحداث التي يمكن لعقدة Airtable Trigger الاستجابة لها وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> يمكن العثور على معلومات المصادقة لهذه العقدة [هنا](/integrations/builtin/credentials/airtable.md).

## الأحداث

* **حدث Airtable جديد**

## الموارد ذات الصلة

توفر n8n عقدة تطبيق لـ Airtable. يمكن العثور على توثيق العقدة [هنا](/integrations/builtin/app-nodes/n8n-nodes-base.airtable/index.md).

يمكن عرض [سير العمل الأمثلة والمحتوى ذي الصلة](https://n8n.io/integrations/airtable-trigger/) على موقع n8n الإلكتروني.

ارجع إلى [توثيق Airtable](https://airtable.com/developers/web/api/introduction) للحصول على تفاصيل حول واجهة برمجة التطبيقات (API) الخاصة بهم.

## معاملات العقدة

استخدم هذه المعاملات لتكوين العقدة الخاصة بك.

### Poll Times

تستخدم عقدة Airtable في n8n الاستقصاء للتحقق من التحديثات على موارد Airtable المكونة. يقوم المعامل **Poll Times** بتكوين تكرار الاستعلام:

* كل دقيقة
* كل ساعة
* كل يوم
* كل أسبوع
* كل شهر
* كل X: التحقق من التحديثات كل عدد معين من الدقائق أو الساعات.
* مخصص: تخصيص فترة الاستقصاء عن طريق توفير [تعبير cron](https://en.wikipedia.org/wiki/Cron).

استخدم زر **Add Poll Time** لإضافة فترات استقصاء إضافية.

### Base

[قاعدة Airtable](https://support.airtable.com/docs/airtable-bases-overview) التي ترغب في التحقق من التحديثات عليها. يمكنك توفير عنوان URL الخاص بقاعدتك أو [معرف القاعدة](https://support.airtable.com/docs/finding-airtable-ids#finding-base-table-and-view-ids-from-urls).

### Table

[جدول Airtable](https://support.airtable.com/docs/tables-overview) داخل قاعدة Airtable الذي ترغب في التحقق من التحديثات عليه. يمكنك توفير عنوان URL الخاص بالجدول أو [معرف الجدول](https://support.airtable.com/docs/finding-airtable-ids#finding-base-table-and-view-ids-from-urls).

### Trigger Field

حقل تم إنشاؤه أو تعديله مؤخرًا في جدولك. تستخدم عقدة Airtable Trigger هذا لتحديد التحديثات التي حدثت منذ الفحص السابق.

### Download Attachments

ما إذا كان سيتم تنزيل المرفقات من الجدول. عند التمكين، يحدد المعامل **Download Fields** حقول المرفقات.

### Download Fields

عند تمكين مفتاح التبديل **Download Attachments**، يحدد هذا الحقل حقول الجدول التي سيتم تنزيلها. أسماء الحقول حساسة لحالة الأحرف. استخدم فاصلة لفصل أسماء الحقول المتعددة.

### Additional Fields

استخدم زر **Add Field** لإضافة المعاملات التالية:

*   **Fields**: قائمة مفصولة بفاصلات للحقول المراد تضمينها في المخرجات. إذا لم تحدد أي شيء هنا، فستحتوي المخرجات على **Trigger Field** فقط.
*   **Formula**: [صيغة Airtable](https://support.airtable.com/docs/formula-field-reference) لزيادة تصفية النتائج. يمكنك استخدام هذا لإضافة قيود إضافية على الأحداث التي تُحفِّز سير العمل. لاحظ أن قيم الصيغة لا تؤخذ في الاعتبار لعمليات التنفيذ اليدوية، بل فقط للاستقصاء في بيئة الإنتاج.
*   **View ID**: اسم أو معرف عرض جدول. عند التحديد، يتم إرجاع السجلات المتاحة في العرض المحدد فقط.