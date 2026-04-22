# عقدة Pushbullet

استخدم عقدة Pushbullet لأتمتة سير العمل في Pushbullet، ودمج Pushbullet مع تطبيقات أخرى. تدعم n8n بشكل مدمج مجموعة واسعة من ميزات Pushbullet، بما في ذلك إنشاء إشعار، وتحديثه، وحذفه، واسترداده.

في هذه الصفحة، ستجد قائمة بالعمليات التي تدعمها عقدة Pushbullet وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد Pushbullet](/integrations/builtin/credentials/pushbullet.md) للحصول على إرشادات حول إعداد المصادقة.

## العمليات

* الإشعارات
    * إنشاء إشعار
    * حذف إشعار
    * استرداد جميع الإشعارات
    * تحديث إشعار

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في تنفيذها، يمكنك استخدام [عقدة HTTP Request](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء واجهة برمجة تطبيقات الخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة HTTP Request:

1. في عقدة HTTP Request، حدد **Authentication** > **Predefined Credential Type**.
2. حدد الخدمة التي ترغب في الاتصال بها.
3. حدد بيانات الاعتماد الخاصة بك.

ارجع إلى [عمليات API المخصصة](/integrations/custom-operations.md) للمزيد من المعلومات.