# عقدة Okta (أوكتا)

استخدم عقدة Okta لأتمتة سير العمل في Okta ودمج Okta مع تطبيقات أخرى. يدعم n8n بشكل مدمج مجموعة واسعة من ميزات Okta، والتي تشمل إنشاء المستخدمين وتحديثهم وحذفهم.

في هذه الصفحة، ستجد قائمة بالعمليات التي تدعمها عقدة Okta، وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> يمكنك العثور على معلومات المصادقة لهذه العقدة [هنا](/integrations/builtin/credentials/okta.md).

## العمليات

- المستخدم
    - إنشاء مستخدم جديد
    - حذف مستخدم موجود
    - الحصول على تفاصيل مستخدم
    - الحصول على عدة مستخدمين
    - تحديث مستخدم موجود

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

<!-- add a link to the service's documentation. This should usually go direct to the API docs -->
ارجع إلى [وثائق Okta](https://developer.okta.com/docs/guides/) لمزيد من المعلومات حول الخدمة.

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في القيام بها، يمكنك استخدام عقدة طلب HTTP (HTTP Request) [HTTP Request node](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء واجهة برمجة تطبيقات الخدمة (API).

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة HTTP Request:

1.  في عقدة HTTP Request، اختر **المصادقة (Authentication)** > **نوع بيانات الاعتماد المُحددة مسبقًا (Predefined Credential Type)**.
2.  اختر الخدمة التي ترغب في الاتصال بها.
3.  اختر بيانات الاعتماد الخاصة بك.

ارجع إلى [عمليات API المخصصة](/integrations/custom-operations.md) لمزيد من المعلومات.