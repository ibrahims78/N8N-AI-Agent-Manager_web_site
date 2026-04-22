# عقدة Dropcontact

استخدم عقدة Dropcontact لأتمتة سير العمل في Dropcontact، ودمج Dropcontact مع تطبيقات أخرى. تدعم n8n بشكل مدمج مجموعة واسعة من ميزات Dropcontact، بما في ذلك جلب جهات الاتصال.

ستجد في هذه الصفحة قائمة بالعمليات التي تدعمها عقدة Dropcontact وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد Dropcontact](/integrations/builtin/credentials/dropcontact.md) للحصول على إرشادات حول إعداد المصادقة.

## العمليات

**جهة الاتصال**
- إثراء
- جلب الطلب

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في تنفيذها، يمكنك استخدام [عقدة HTTP Request](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء واجهة برمجة تطبيقات الخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة HTTP Request:

1.  في عقدة HTTP Request، حدد **Authentication** > **Predefined Credential Type**.
2.  حدد الخدمة التي ترغب في الاتصال بها.
3.  حدد بيانات الاعتماد الخاصة بك.

ارجع إلى [عمليات API المخصصة](/integrations/custom-operations.md) لمزيد من المعلومات.