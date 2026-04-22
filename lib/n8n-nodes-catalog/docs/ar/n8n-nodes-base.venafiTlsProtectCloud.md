# عقدة Venafi TLS Protect Cloud

استخدم عقدة Venafi TLS Protect Cloud (خدمة حماية طبقة النقل الآمنة من Venafi) لأتمتة سير العمل في Venafi TLS Protect Cloud، ودمج Venafi TLS Protect Cloud مع تطبيقات أخرى. تدعم n8n بشكل مدمج مجموعة واسعة من ميزات Venafi TLS Protect Cloud، بما في ذلك حذف وتنزيل الشهادات، بالإضافة إلى إنشاء طلبات الشهادات.

في هذه الصفحة، ستجد قائمة بالعمليات التي تدعمها عقدة Venafi TLS Protect Cloud وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد Venafi TLS Protect Cloud](/integrations/builtin/credentials/venafitlsprotectcloud.md) للحصول على إرشادات حول إعداد المصادقة.

## العمليات

*   الشهادة
    *   حذف
    *   تنزيل
    *   جلب
    *   جلب متعدد
    *   تجديد
*   طلب الشهادة
    *   إنشاء
    *   جلب
    *   جلب متعدد

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

ارجع إلى [توثيق REST API الخاص بـ Venafi](https://docs.venafi.cloud/api/vaas-rest-api/) لمزيد من المعلومات حول هذه الخدمة.

توفر n8n أيضًا:
<!-- vale off -->
*   [عقدة مُحفِّز](/integrations/builtin/trigger-nodes/n8n-nodes-base.venafitlsprotectcloudtrigger.md) لـ Venafi TLS Protect Cloud.
*   [عقدة](/integrations/builtin/app-nodes/n8n-nodes-base.venafitlsprotectdatacenter.md) لـ Venafi TLS Protect Datacenter.
<!-- vale on -->

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في تنفيذها، يمكنك استخدام [عقدة طلب HTTP](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء واجهة برمجة تطبيقات الخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة طلب HTTP:

1.  في عقدة طلب HTTP، حدد **المصادقة** > **نوع بيانات الاعتماد المُعرّف مسبقًا**.
2.  حدد الخدمة التي ترغب في الاتصال بها.
3.  حدد بيانات الاعتماد الخاصة بك.

ارجع إلى [عمليات API المخصصة](/integrations/custom-operations.md) لمزيد من المعلومات.