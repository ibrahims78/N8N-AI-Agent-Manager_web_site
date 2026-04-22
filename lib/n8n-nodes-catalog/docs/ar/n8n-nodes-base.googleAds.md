# عقدة Google Ads

استخدم عقدة Google Ads لأتمتة سير العمل في Google Ads، ودمج Google Ads مع تطبيقات أخرى. تدعم n8n بشكل مدمج مجموعة واسعة من ميزات Google Ads، بما في ذلك جلب الحملات.

ستجد في هذه الصفحة قائمة بالعمليات التي تدعمها عقدة Google Ads وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد Google Ads](/integrations/builtin/credentials/google/index.md) للحصول على إرشادات حول إعداد المصادقة.

## العمليات

* الحملة
    * جلب جميع الحملات
    * جلب حملة

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

ارجع إلى [توثيق Google Ads](https://developers.google.com/google-ads/api/docs/start) للحصول على مزيد من المعلومات حول الخدمة.

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في تنفيذها، يمكنك استخدام [عقدة HTTP Request](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء واجهة برمجة تطبيقات الخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة HTTP Request:

1.  في عقدة HTTP Request، حدد **Authentication** > **Predefined Credential Type**.
2.  حدد الخدمة التي ترغب في الاتصال بها.
3.  حدد بيانات الاعتماد الخاصة بك.

ارجع إلى [عمليات API المخصصة](/integrations/custom-operations.md) للحصول على مزيد من المعلومات.