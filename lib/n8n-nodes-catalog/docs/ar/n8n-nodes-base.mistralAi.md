# عقدة Mistral AI

استخدم عقدة Mistral AI لأتمتة سير العمل في Mistral AI وتكامل Mistral AI مع التطبيقات الأخرى. تدعم n8n بشكل مدمج استخراج النص باستخدام نماذج وأنواع ملفات وطرق إدخال متنوعة.

في هذه الصفحة، ستجد قائمة بالعمليات التي تدعمها عقدة Mistral AI، وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> يمكنك العثور على معلومات المصادقة لهذه العقدة [هنا](/integrations/builtin/credentials/mistral.md).

## معاملات العقدة

*   **Resource**: المورد الذي يجب أن تعمل عليه Mistral AI. يدعم التنفيذ الحالي المورد "Document".
*   **Operation**: العملية المطلوب تنفيذها:
    *   **Extract Text**: تستخرج النص من مستند أو صورة باستخدام التعرف البصري على الحروف (OCR).
*   **Model**: النموذج المراد استخدامه للعملية المحددة. يتطلب الإصدار الحالي نموذج `mistral-ocr-latest`.
*   **Document Type**: تنسيق المستند المراد معالجته. يمكن أن يكون "Document" أو "Image".
*   **Input Type**: كيفية إدخال المستند:
    *   **Binary Data**: تمرير المستند إلى هذه العقدة كحقل ثنائي.
    *   **URL**: جلب المستند من URL محدد.
*   **Input Binary Field**: عند استخدام نوع الإدخال "Binary Data"، يحدد اسم حقل الإدخال الثنائي الذي يحتوي على الملف.
*   **URL**: عند استخدام نوع الإدخال "URL"، هو URL المستند أو الصورة المراد معالجتها.

## خيارات العقدة

*   **Enable Batch Processing**: ما إذا كان سيتم معالجة مستندات متعددة في نفس استدعاء API. قد يقلل هذا من تكاليفك عن طريق تجميع الطلبات.
*   **Batch Size**: عند استخدام "Enable Batch Processing"، يحدد الحد الأقصى لعدد المستندات المراد معالجتها لكل دفعة.
*   **Delete Files After Processing**: عند استخدام "Enable Batch Processing"، ما إذا كان سيتم حذف الملفات من Mistral Cloud بعد المعالجة.

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

<!-- add a link to the service's documentation. This should usually go direct to the API docs -->
ارجع إلى [توثيق Mistral AI](https://docs.mistral.ai/api/) لمزيد من المعلومات حول الخدمة.

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في تنفيذها، يمكنك استخدام [عقدة HTTP Request](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء API الخاص بالخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة HTTP Request:

1.  في عقدة HTTP Request، حدد **Authentication** > **Predefined Credential Type**.
2.  حدد الخدمة التي ترغب في الاتصال بها.
3.  حدد بيانات الاعتماد الخاصة بك.

ارجع إلى [عمليات API المخصصة](/integrations/custom-operations.md) لمزيد من المعلومات.