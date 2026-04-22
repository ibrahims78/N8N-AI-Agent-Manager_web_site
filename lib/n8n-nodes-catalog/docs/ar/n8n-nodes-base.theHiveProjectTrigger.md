# عقدة المُحفِّز TheHive 5

استخدم عقدة المُحفِّز TheHive 5 للاستجابة للأحداث في [TheHive](https://strangebee.com/thehive/) ولدمج TheHive مع التطبيقات الأخرى. يدعم n8n بشكل مدمج مجموعة واسعة من أحداث TheHive، بما في ذلك التنبيهات، الحالات، التعليقات، الصفحات، والمهام.

ستجد في هذه الصفحة قائمة بالأحداث التي يمكن لعقدة المُحفِّز TheHive5 الاستجابة لها وروابط لموارد إضافية.

> **TheHive و TheHive 5**
>
> يوفر n8n عقدتين لـ TheHive. استخدم هذه العقدة (المُحفِّز TheHive 5) إذا كنت ترغب في استخدام واجهة برمجة التطبيقات (API) للإصدار 5 من TheHive. إذا كنت ترغب في استخدام الإصدار 3 أو 4، فاستخدم [المُحفِّز TheHive](/integrations/builtin/trigger-nodes/n8n-nodes-base.thehivetrigger.md).

> **أمثلة وقوالب**
>
> للحصول على أمثلة استخدام وقوالب لمساعدتك على البدء، ارجع إلى صفحة [تكاملات المُحفِّز TheHive 5](https://n8n.io/integrations/thehive-5-trigger/) الخاصة بـ n8n.

## الأحداث

*   تنبيه
    *   تم الإنشاء
    *   تم الحذف
    *   تم التحديث
*   حالة
    *   تم الإنشاء
    *   تم الحذف
    *   تم التحديث
*   تعليق
    *   تم الإنشاء
    *   تم الحذف
    *   تم التحديث
*   ملاحظة
    *   تم الإنشاء
    *   تم الحذف
    *   تم التحديث
*   صفحة
    *   تم الإنشاء
    *   تم الحذف
    *   تم التحديث
*   مهمة
    *   تم الإنشاء
    *   تم الحذف
    *   تم التحديث
*   سجل المهام
    *   تم الإنشاء
    *   تم الحذف
    *   تم التحديث

## الموارد ذات الصلة

يوفر n8n عقدة تطبيق لـ TheHive 5. يمكنك العثور على وثائق العقدة [هنا](/integrations/builtin/app-nodes/n8n-nodes-base.thehive5.md).

ارجع إلى [وثائق](https://docs.strangebee.com/) TheHive لمزيد من المعلومات حول الخدمة.

## تكوين ويب هوك في TheHive

لتكوين الويب هوك لنسخة TheHive الخاصة بك:

1.  انسخ عناوين URL لويب هوك الاختبار والإنتاج من عقدة المُحفِّز TheHive.
2.  أضف الأسطر التالية إلى ملف `application.conf`. هذا هو ملف تكوين TheHive:

    ```
    notification.webhook.endpoints = [
        {
            name: TESTING_WEBHOOK_NAME
            url: TESTING_WEBHOOK_URL
            version: 1
            wsConfig: {}
            includedTheHiveOrganisations: ["ORGANIZATION_NAME"]
            excludedTheHiveOrganisations: []
        },
        {
            name: PRODUCTION_WEBHOOK_NAME
            url: PRODUCTION_WEBHOOK_URL
            version: 1
            wsConfig: {}
            includedTheHiveOrganisations: ["ORGANIZATION_NAME"]
            excludedTheHiveOrganisations: []
        }
    ]
    ```

3.  استبدل `TESTING_WEBHOOK_URL` و `PRODUCTION_WEBHOOK_URL` بعناوين URL التي نسختها في الخطوة السابقة.
4.  استبدل `TESTING_WEBHOOK_NAME` و `PRODUCTION_WEBHOOK_NAME` بأسماء نقاط النهاية المفضلة لديك.
5.  استبدل `ORGANIZATION_NAME` باسم مؤسستك.
6.  نفّذ أمر cURL التالي لتمكين الإشعارات:
    ```sh
    curl -XPUT -uTHEHIVE_USERNAME:THEHIVE_PASSWORD -H 'Content-type: application/json' THEHIVE_URL/api/config/organisation/notification -d '
    {
        "value": [
            {
            "delegate": false,
            "trigger": { "name": "AnyEvent"},
            "notifier": { "name": "webhook", "endpoint": "TESTING_WEBHOOK_NAME" }
            },
            {
            "delegate": false,
            "trigger": { "name": "AnyEvent"},
            "notifier": { "name": "webhook", "endpoint": "PRODUCTION_WEBHOOK_NAME" }
            }
        ]
    }'
    ```