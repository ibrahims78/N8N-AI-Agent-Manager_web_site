# عقدة Netscaler ADC

استخدم عقدة Netscaler ADC لأتمتة سير العمل في Netscaler ADC، ودمج Netscaler ADC مع تطبيقات أخرى. تدعم n8n بشكل مدمج مجموعة واسعة من ميزات Netscaler ADC، بما في ذلك إنشاء وتثبيت الشهادات والملفات.

ستجد في هذه الصفحة قائمة بالعمليات التي تدعمها عقدة Netscaler ADC وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد Netscaler ADC](/integrations/builtin/credentials/netscaleradc.md) للحصول على إرشادات حول إعداد المصادقة.

## العمليات

*   الشهادة
    *   إنشاء
    *   تثبيت
*   الملف
    *   حذف
    *   تنزيل
    *   رفع

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

ارجع إلى [توثيق Netscaler ADC](https://docs.citrix.com/en-us/citrix-adc/current-release/) للمزيد من المعلومات حول الخدمة.

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في تنفيذها، يمكنك استخدام [عقدة طلب HTTP](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء واجهة برمجة تطبيقات الخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة طلب HTTP:

1.  في عقدة طلب HTTP، حدد **Authentication** > **Predefined Credential Type**.
2.  حدد الخدمة التي ترغب في الاتصال بها.
3.  حدد بيانات الاعتماد الخاصة بك.

ارجع إلى [عمليات API المخصصة](/integrations/custom-operations.md) للمزيد من المعلومات.