# عقدة Google BigQuery

استخدم عقدة Google BigQuery لأتمتة سير العمل في Google BigQuery، ودمج Google BigQuery مع تطبيقات أخرى. تدعم n8n بشكل مدمج مجموعة واسعة من ميزات Google BigQuery، بما في ذلك إنشاء السجلات واستردادها.

ستجد في هذه الصفحة قائمة بالعمليات التي تدعمها عقدة Google BigQuery وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد Google BigQuery](/integrations/builtin/credentials/google/index.md) للحصول على إرشادات حول إعداد المصادقة.

> **يمكن استخدام هذه العقدة كأداة ذكاء اصطناعي**
>
> يمكن استخدام هذه العقدة لتعزيز قدرات وكيل الذكاء الاصطناعي. عند استخدامها بهذه الطريقة، يمكن تعيين العديد من المعاملات تلقائيًا، أو بمعلومات موجهة بواسطة الذكاء الاصطناعي - اكتشف المزيد في [توثيق معاملات أداة الذكاء الاصطناعي](/advanced-ai/examples/using-the-fromai-function.md).

## العمليات

- تنفيذ الاستعلام
- إدراج

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

ارجع إلى [توثيق Google BigQuery](https://cloud.google.com/bigquery/docs/reference/rest) للمزيد من المعلومات حول الخدمة.

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في تنفيذها، يمكنك استخدام [عقدة HTTP Request](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء واجهة برمجة تطبيقات (API) الخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة HTTP Request:

1.  في عقدة HTTP Request، حدد **Authentication** > **Predefined Credential Type**.
2.  حدد الخدمة التي ترغب في الاتصال بها.
3.  حدد بيانات الاعتماد الخاصة بك.

ارجع إلى [عمليات API المخصصة](/integrations/custom-operations.md) للمزيد من المعلومات.