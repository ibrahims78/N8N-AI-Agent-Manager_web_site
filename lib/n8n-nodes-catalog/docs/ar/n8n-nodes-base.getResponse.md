# عقدة GetResponse

استخدم عقدة GetResponse لأتمتة سير العمل في GetResponse، ودمج GetResponse مع تطبيقات أخرى. تدعم n8n بشكل مدمج مجموعة واسعة من ميزات GetResponse، بما في ذلك إنشاء جهات الاتصال وتحديثها وحذفها والحصول عليها.

ستجد في هذه الصفحة قائمة بالعمليات التي تدعمها عقدة GetResponse وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد GetResponse](/integrations/builtin/credentials/getresponse.md) للحصول على إرشادات حول إعداد المصادقة.

## العمليات

*   جهة الاتصال
    *   إنشاء جهة اتصال جديدة
    *   حذف جهة اتصال
    *   الحصول على جهة اتصال
    *   الحصول على جميع جهات الاتصال
    *   تحديث خصائص جهة الاتصال

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في تنفيذها، يمكنك استخدام [عقدة HTTP Request](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء واجهة برمجة تطبيقات الخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة HTTP Request:

1.  في عقدة HTTP Request، حدد **Authentication** > **Predefined Credential Type**.
2.  حدد الخدمة التي ترغب في الاتصال بها.
3.  حدد بيانات الاعتماد الخاصة بك.

ارجع إلى [عمليات API المخصصة](/integrations/custom-operations.md) لمزيد من المعلومات.