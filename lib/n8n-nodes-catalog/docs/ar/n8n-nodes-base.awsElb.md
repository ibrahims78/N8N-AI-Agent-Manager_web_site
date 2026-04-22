# عقدة AWS Elastic Load Balancing

استخدم عقدة AWS Elastic Load Balancing (موازنة التحميل المرنة من AWS) لأتمتة سير العمل في AWS ELB، وتكامل AWS ELB مع التطبيقات الأخرى. تدعم n8n بشكل مدمج مجموعة واسعة من ميزات AWS ELB، بما في ذلك إضافة الشهادات وموازنات التحميل وجلبها وإزالتها وحذفها.

في هذه الصفحة، ستجد قائمة بالعمليات التي تدعمها عقدة AWS ELB وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد AWS ELB](/integrations/builtin/credentials/aws.md) للحصول على إرشادات حول إعداد المصادقة.

## العمليات

*   شهادة المُستمع
    *   إضافة
    *   جلب العديد
    *   إزالة
*   موازن التحميل
    *   إنشاء
    *   حذف
    *   جلب
    *   جلب العديد

تدعم هذه العقدة إنشاء وإدارة موازنات التحميل للتطبيقات والشبكات. ولا تدعم حاليًا موازنات التحميل للبوابات.

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

ارجع إلى [توثيق AWS ELB](https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html) لمزيد من المعلومات حول هذه الخدمة.

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في تنفيذها، يمكنك استخدام [عقدة طلب HTTP](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء واجهة برمجة تطبيقات الخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة طلب HTTP:

1.  في عقدة HTTP Request، حدد **Authentication** > **Predefined Credential Type**.
2.  حدد الخدمة التي ترغب في الاتصال بها.
3.  حدد بيانات الاعتماد الخاصة بك.

ارجع إلى [عمليات API المخصصة](/integrations/custom-operations.md) لمزيد من المعلومات.