# عقدة Google Business Profile

استخدم عقدة Google Business Profile (ملف تعريف نشاطي التجاري على Google) لأتمتة سير العمل في Google Business Profile وتكامل Google Business Profile مع التطبيقات الأخرى. يدعم n8n بشكل مدمج مجموعة واسعة من ميزات Google Business Profile، والتي تشمل إنشاء المنشورات والمراجعات وتحديثها وحذفها.

في هذه الصفحة، ستجد قائمة بالعمليات التي تدعمها عقدة Google Business Profile، وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> يمكنك العثور على معلومات المصادقة لهذه العقدة [هنا](/integrations/builtin/credentials/google/index.md).

## العمليات

*   المنشور
    *   إنشاء
    *   حذف
    *   جلب
    *   جلب العديد
    *   تحديث
*   المراجعة
    *   حذف الرد
    *   جلب
    *   جلب العديد
    *   الرد

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

يوفر n8n عقدة مُحفِّز لـ Google Business Profile. يمكنك العثور على وثائق عقدة المُحفِّز [هنا](/integrations/builtin/trigger-nodes/n8n-nodes-base.googlebusinessprofiletrigger.md).

ارجع إلى [وثائق Google Business Profile](https://developers.google.com/my-business/reference/rest) لمزيد من المعلومات حول الخدمة.

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في تنفيذها، يمكنك استخدام [عقدة HTTP Request](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء واجهة برمجة تطبيقات (API) للخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة HTTP Request:

1.  في عقدة HTTP Request، حدد **Authentication** > **Predefined Credential Type**.
2.  حدد الخدمة التي ترغب في الاتصال بها.
3.  حدد بيانات الاعتماد الخاصة بك.

ارجع إلى [عمليات API المخصصة](/integrations/custom-operations.md) لمزيد من المعلومات.