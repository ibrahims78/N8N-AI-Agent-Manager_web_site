# عقدة AWS Certificate Manager

استخدم عقدة AWS Certificate Manager (مدير شهادات AWS) لأتمتة سير العمل في AWS Certificate Manager، ودمج AWS Certificate Manager مع التطبيقات الأخرى. تدعم n8n بشكل مدمج مجموعة واسعة من ميزات AWS Certificate Manager، بما في ذلك إنشاء شهادات SSL وحذفها والحصول عليها وتجديدها.

ستجد في هذه الصفحة قائمة بالعمليات التي تدعمها عقدة AWS Certificate Manager وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد AWS Certificate Manager](/integrations/builtin/credentials/aws.md) للحصول على إرشادات حول إعداد المصادقة.

## العمليات

*   الشهادة
    *   حذف
    *   الحصول
    *   الحصول على العديد
    *   الحصول على البيانات الوصفية
    *   تجديد

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

ارجع إلى [توثيق AWS Certificate Manager](https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html) للمزيد من المعلومات حول هذه الخدمة.

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في تنفيذها، يمكنك استخدام عقدة HTTP Request (طلب HTTP) لاستدعاء واجهة برمجة تطبيقات الخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة HTTP Request:

1.  في عقدة HTTP Request، حدد **المصادقة** > **نوع بيانات الاعتماد المُعرّف مسبقًا**.
2.  حدد الخدمة التي ترغب في الاتصال بها.
3.  حدد بيانات الاعتماد الخاصة بك.

ارجع إلى [عمليات API المخصصة](/integrations/custom-operations.md) للمزيد من المعلومات.