# عقدة Philips Hue

استخدم عقدة Philips Hue لأتمتة سير العمل في Philips Hue، ودمج Philips Hue مع تطبيقات أخرى. تدعم n8n مجموعة واسعة من ميزات Philips Hue بشكل مدمج، بما في ذلك حذف الأضواء واستردادها وتحديثها.

ستجد في هذه الصفحة قائمة بالعمليات التي تدعمها عقدة Philips Hue وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> ارجع إلى [Philips Hue credentials](/integrations/builtin/credentials/philipshue.md) للحصول على إرشادات حول إعداد المصادقة.

## العمليات

* الضوء
    * حذف ضوء
    * استرداد ضوء
    * استرداد جميع الأضواء
    * تحديث ضوء

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في تنفيذها، يمكنك استخدام [عقدة HTTP Request](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء API الخاص بالخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة HTTP Request:

1.  في عقدة HTTP Request، حدد **المصادقة** > **نوع بيانات الاعتماد المُحددة مسبقًا**.
2.  حدد الخدمة التي ترغب في الاتصال بها.
3.  حدد بيانات الاعتماد الخاصة بك.

ارجع إلى [Custom API operations](/integrations/custom-operations.md) لمزيد من المعلومات.