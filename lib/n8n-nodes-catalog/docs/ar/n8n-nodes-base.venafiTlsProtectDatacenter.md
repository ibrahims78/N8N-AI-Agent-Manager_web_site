<!-- vale off -->
<!-- disabled vale because of "Datacenter" Don't want to general approve it, but it's the brand name -->
# عقدة Venafi TLS Protect Datacenter

استخدم عقدة Venafi TLS Protect Datacenter لأتمتة سير العمل في Venafi TLS Protect Datacenter، ودمج Venafi TLS Protect Datacenter مع تطبيقات أخرى. تدعم n8n بشكل مدمج مجموعة واسعة من ميزات Venafi TLS Protect Datacenter، بما في ذلك إنشاء الشهادات وحذفها والحصول عليها.

في هذه الصفحة، ستجد قائمة بالعمليات التي تدعمها عقدة Venafi TLS Protect Datacenter وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد Venafi TLS Protect Datacenter](/integrations/builtin/credentials/venafitlsprotectdatacenter.md) للحصول على إرشادات حول إعداد المصادقة.

## العمليات

* الشهادة
	* إنشاء
	* حذف
	* تنزيل
	* الحصول على
	* الحصول على العديد
	* تجديد
* السياسة
	* الحصول على

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

توفر n8n أيضاً:

* [عقدة](/integrations/builtin/app-nodes/n8n-nodes-base.venafitlsprotectcloud.md) و [عقدة مُحفِّز](/integrations/builtin/trigger-nodes/n8n-nodes-base.venafitlsprotectcloudtrigger.md) لـ Venafi TLS Protect Cloud.

<!-- vale on -->

## ماذا تفعل إذا لم تكن عمليتك مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في تنفيذها، يمكنك استخدام [عقدة طلب HTTP](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء واجهة برمجة تطبيقات الخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة طلب HTTP:

1. في عقدة طلب HTTP، حدد **المصادقة** > **نوع بيانات الاعتماد المُحددة مسبقاً**.
1. حدد الخدمة التي ترغب في الاتصال بها.
1. حدد بيانات الاعتماد الخاصة بك.

ارجع إلى [عمليات API المخصصة](/integrations/custom-operations.md) لمزيد من المعلومات.