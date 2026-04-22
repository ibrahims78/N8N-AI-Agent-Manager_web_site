# عقدة Databricks

استخدم عقدة Databricks لأتمتة العمل في Databricks، ودمج Databricks مع تطبيقات أخرى. يدعم n8n مجموعة واسعة من ميزات Databricks، بما في ذلك تنفيذ استعلامات SQL، وإدارة كائنات Unity Catalog، والاستعلام عن نقاط نهاية خدمة نماذج التعلم الآلي (ML)، والعمل مع فهارس البحث المتجهي.

في هذه الصفحة، ستجد قائمة بالعمليات التي تدعمها عقدة Databricks وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد Databricks](/integrations/builtin/credentials/databricks.md) للحصول على إرشادات حول إعداد المصادقة.

> **يمكن استخدام هذه العقدة كأداة ذكاء اصطناعي**
>
> يمكن استخدام هذه العقدة لتعزيز قدرات وكيل ذكاء اصطناعي. عند استخدامها بهذه الطريقة، يمكن تعيين العديد من المعاملات تلقائيًا، أو باستخدام معلومات موجهة بواسطة الذكاء الاصطناعي - اكتشف المزيد في [وثائق معاملات أداة الذكاء الاصطناعي](/advanced-ai/examples/using-the-fromai-function.md).

## العمليات

*   Databricks SQL
    *   تنفيذ استعلام (Execute Query)
*   File (ملف)
    *   إنشاء دليل (Create Directory)
    *   حذف دليل (Delete Directory)
    *   حذف ملف (Delete File)
    *   تنزيل ملف (Download File)
    *   الحصول على بيانات تعريف الملف (Get File Metadata)
    *   سرد الدليل (List Directory)
    *   رفع ملف (Upload File)
*   Genie
    *   إنشاء رسالة محادثة (Create Conversation Message)
    *   تنفيذ استعلام SQL للرسالة (Execute Message SQL Query)
    *   الحصول على رسالة محادثة (Get Conversation Message)
    *   الحصول على مساحة Genie (Get Genie Space)
    *   الحصول على نتائج الاستعلام (Get Query Results)
    *   بدء محادثة (Start Conversation)
*   Model Serving (خدمة النماذج)
    *   الاستعلام عن نقطة النهاية (Query Endpoint)
*   Unity Catalog
    *   إنشاء كتالوج (Create Catalog)
    *   إنشاء دالة (Create Function)
    *   إنشاء وحدة تخزين (Create Volume)
    *   حذف كتالوج (Delete Catalog)
    *   حذف دالة (Delete Function)
    *   حذف وحدة تخزين (Delete Volume)
    *   الحصول على كتالوج (Get Catalog)
    *   الحصول على دالة (Get Function)
    *   الحصول على جدول (Get Table)
    *   الحصول على وحدة تخزين (Get Volume)
    *   سرد الكتالوجات (List Catalogs)
    *   سرد الدوال (List Functions)
    *   سرد الجداول (List Tables)
    *   سرد وحدات التخزين (List Volumes)
    *   تحديث كتالوج (Update Catalog)
*   Vector Search (البحث المتجهي)
    *   إنشاء فهرس (Create Index)
    *   الحصول على فهرس (Get Index)
    *   سرد الفهارس (List Indexes)
    *   الاستعلام عن الفهرس (Query Index)

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

ارجع إلى [وثائق REST API الخاصة بـ Databricks](https://docs.databricks.com/api/) للحصول على تفاصيل حول واجهة برمجة التطبيقات الخاصة بهم.

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في القيام بها، يمكنك استخدام [عقدة HTTP Request](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء API الخاص بالخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة HTTP Request:

1.  في عقدة HTTP Request، حدد **Authentication** > **Predefined Credential Type**.
2.  حدد الخدمة التي تريد الاتصال بها.
3.  حدد بيانات الاعتماد الخاصة بك.

ارجع إلى [عمليات API المخصصة](/integrations/custom-operations.md) لمزيد من المعلومات.