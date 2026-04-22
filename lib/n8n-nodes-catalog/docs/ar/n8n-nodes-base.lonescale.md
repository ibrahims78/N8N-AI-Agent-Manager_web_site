# عقدة LoneScale

استخدم عقدة LoneScale لأتمتة سير العمل (Workflow) في LoneScale ودمج LoneScale مع تطبيقات أخرى. تدعم n8n بشكل مدمج إدارة القوائم (Lists) والعناصر (Items) في LoneScale.

ستجد في هذه الصفحة قائمة بالعمليات (Operations) التي تدعمها عقدة LoneScale، وروابط لموارد إضافية.

> **بيانات الاعتماد (Credentials)**
>
> يمكن العثور على معلومات المصادقة (Authentication) لهذه العقدة [هنا](/integrations/builtin/credentials/lonescale.md).

## العمليات (Operations)

*   القائمة (List)
    *   إنشاء
*   العنصر (Item)
    *   إنشاء

## القوالب (Templates) والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

ارجع إلى [توثيق LoneScale](https://help-center.lonescale.com/en/articles/6454360-lonescale-public-api) للمزيد من المعلومات حول الخدمة.

توفر n8n عقدة مُحفِّز (Trigger) لـ LoneScale. يمكنك العثور على وثائق عقدة المُحفِّز [هنا](/integrations/builtin/trigger-nodes/n8n-nodes-base.lonescaletrigger.md).

## ماذا تفعل إذا كانت عمليتك (Operation) غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية (Operation) التي ترغب في تنفيذها، يمكنك استخدام [عقدة HTTP Request](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء واجهة برمجة تطبيقات (API) الخدمة.

يمكنك استخدام بيانات الاعتماد (Credential) التي أنشأتها لهذه الخدمة في عقدة HTTP Request:

1.  في عقدة HTTP Request، اختر **المصادقة (Authentication)** > **نوع بيانات الاعتماد المُحددة مسبقًا (Predefined Credential Type)**.
2.  اختر الخدمة التي ترغب في الاتصال (Connection) بها.
3.  اختر بيانات الاعتماد (Credential) الخاصة بك.

ارجع إلى [عمليات API المخصصة](/integrations/custom-operations.md) للمزيد من المعلومات.