# عقدة Google Cloud Natural Language

استخدم عقدة Google Cloud Natural Language لأتمتة العمل في Google Cloud Natural Language، ودمج Google Cloud Natural Language مع تطبيقات أخرى. يدعم n8n بشكل مدمج مجموعة واسعة من ميزات Google Cloud Natural Language، بما في ذلك تحليل المستندات.

في هذه الصفحة، ستجد قائمة بالعمليات التي تدعمها عقدة Google Cloud Natural Language وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد Google Cloud Natural Language](/integrations/builtin/credentials/google/index.md) للحصول على إرشادات حول إعداد المصادقة.

## العمليات

*   المستند
    *   تحليل المشاعر

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في تنفيذها، يمكنك استخدام [عقدة HTTP Request](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء واجهة برمجة تطبيقات الخدمة (API).

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة HTTP Request:

1.  في عقدة HTTP Request، حدد **Authentication** > **Predefined Credential Type**.
1.  حدد الخدمة التي ترغب في الاتصال بها.
1.  حدد بيانات الاعتماد الخاصة بك.

ارجع إلى [عمليات API المخصصة](/integrations/custom-operations.md) لمزيد من المعلومات.