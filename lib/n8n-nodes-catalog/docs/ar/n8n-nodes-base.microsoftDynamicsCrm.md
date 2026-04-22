# عقدة Microsoft Dynamics CRM

استخدم عقدة Microsoft Dynamics CRM (نظام إدارة علاقات العملاء من مايكروسوفت) لأتمتة سير العمل في Microsoft Dynamics CRM، وتكامل Microsoft Dynamics CRM مع التطبيقات الأخرى. تدعم n8n بشكل مدمج إنشاء حسابات Microsoft Dynamics CRM وتحديثها وحذفها واستردادها.

ستجد في هذه الصفحة قائمة بالعمليات التي تدعمها عقدة Microsoft Dynamics CRM وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> يُرجى الرجوع إلى [بيانات اعتماد Microsoft](/integrations/builtin/credentials/microsoft.md) للحصول على إرشادات حول إعداد المصادقة.

## العمليات

*   الحساب
    *   إنشاء
    *   حذف
    *   استرداد
    *   استرداد الكل
    *   تحديث

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في تنفيذها، يمكنك استخدام عقدة HTTP Request (طلب HTTP) لاستدعاء واجهة برمجة تطبيقات (API) الخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة HTTP Request:

1.  في عقدة HTTP Request، حدد **Authentication** > **Predefined Credential Type**.
2.  حدد الخدمة التي ترغب في الاتصال بها.
3.  حدد بيانات الاعتماد الخاصة بك.

يُرجى الرجوع إلى [عمليات API المخصصة](/integrations/custom-operations.md) لمزيد من المعلومات.