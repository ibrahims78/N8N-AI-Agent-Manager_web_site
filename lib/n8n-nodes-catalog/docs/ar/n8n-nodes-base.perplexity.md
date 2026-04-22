# عقدة Perplexity

استخدم عقدة Perplexity لأتمتة سير العمل في Perplexity ودمج Perplexity مع التطبيقات الأخرى. تدعم n8n بشكل مدمج إرسال الرسائل إلى نموذج.

ستجد في هذه الصفحة قائمة بالعمليات التي تدعمها عقدة Perplexity، وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> يمكن العثور على معلومات المصادقة لهذه العقدة [هنا](/integrations/builtin/credentials/perplexity.md).

## العمليات

*   **إرسال رسالة إلى نموذج**: إنشاء إكمال واحد أو أكثر لنص معين.

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

<!-- add a link to the service's documentation. This should usually go direct to the API docs -->
ارجع إلى [توثيق Perplexity](https://docs.perplexity.ai/home) لمزيد من المعلومات حول الخدمة.

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في تنفيذها، يمكنك استخدام [عقدة طلب HTTP (HTTP Request)](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء واجهة برمجة تطبيقات (API) الخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة طلب HTTP (HTTP Request):

1.  في عقدة طلب HTTP (HTTP Request)، حدد **المصادقة (Authentication)** > **نوع بيانات الاعتماد المُحددة مسبقًا (Predefined Credential Type)**.
2.  حدد الخدمة التي ترغب في الاتصال بها.
3.  حدد بيانات الاعتماد الخاصة بك.

ارجع إلى [عمليات API المخصصة](/integrations/custom-operations.md) لمزيد من المعلومات.