# عقدة Cloudflare

استخدم عقدة Cloudflare لأتمتة سير العمل في Cloudflare، ودمج Cloudflare مع تطبيقات أخرى. تدعم n8n بشكل مدمج مجموعة واسعة من ميزات Cloudflare، بما في ذلك حذف شهادات المنطقة (zone certificates)، واستردادها، ورفعها.

ستجد في هذه الصفحة قائمة بالعمليات التي تدعمها عقدة Cloudflare وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد Cloudflare](/integrations/builtin/credentials/cloudflare.md) للحصول على إرشادات حول إعداد المصادقة.

## العمليات

* شهادة المنطقة (Zone Certificate)
	* حذف
	* استرداد
	* استرداد متعدد
	* رفع

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

ارجع إلى [توثيق API الخاص بـ Cloudflare حول المصادقة على مستوى المنطقة (zone-level authentication)](https://api.cloudflare.com/#zone-level-authenticated-origin-pulls-properties) لمزيد من المعلومات حول هذه الخدمة.

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في تنفيذها، يمكنك استخدام [عقدة طلب HTTP (HTTP Request)](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء API الخاص بالخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة طلب HTTP (HTTP Request):

1. في عقدة طلب HTTP (HTTP Request)، حدد **المصادقة (Authentication)** > **نوع بيانات الاعتماد المُحددة مسبقًا (Predefined Credential Type)**.
2. حدد الخدمة التي ترغب في الاتصال بها.
3. حدد بيانات الاعتماد الخاصة بك.

ارجع إلى [عمليات API المخصصة (Custom API operations)](/integrations/custom-operations.md) لمزيد من المعلومات.