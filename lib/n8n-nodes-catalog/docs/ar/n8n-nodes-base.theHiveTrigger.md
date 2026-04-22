# عقدة مُحفِّز TheHive

في هذه الصفحة، ستجد قائمة بالأحداث التي يمكن لعقدة مُحفِّز TheHive (TheHive Trigger node) الاستجابة لها وروابط لموارد إضافية.

> **TheHive و TheHive 5**
>
> توفر n8n عقدتين لـ TheHive. استخدم هذه العقدة (TheHive Trigger) إذا كنت ترغب في استخدام واجهة برمجة التطبيقات (API) للإصدار 3 أو 4 من TheHive. إذا كنت ترغب في استخدام الإصدار 5، فاستخدم [مُحفِّز TheHive 5](/integrations/builtin/trigger-nodes/n8n-nodes-base.thehive5trigger.md).

> **أمثلة وقوالب**
>
> للحصول على أمثلة استخدام وقوالب لمساعدتك على البدء، ارجع إلى صفحة [تكاملات مُحفِّز TheHive](https://n8n.io/integrations/thehive-trigger/) الخاصة بـ n8n.

## الأحداث

*   تنبيه (Alert)
    *   تم الإنشاء
    *   تم الحذف
    *   تم التحديث
*   حالة (Case)
    *   تم الإنشاء
    *   تم الحذف
    *   تم التحديث
*   سجل (Log)
    *   تم الإنشاء
    *   تم الحذف
    *   تم التحديث
*   قابل للملاحظة (Observable)
    *   تم الإنشاء
    *   تم الحذف
    *   تم التحديث
*   مهمة (Task)
    *   تم الإنشاء
    *   تم الحذف
    *   تم التحديث

## الموارد ذات الصلة

توفر n8n عقدة تطبيق لـ TheHive. يمكنك العثور على وثائق العقدة [هنا](/integrations/builtin/app-nodes/n8n-nodes-base.thehive.md).

شاهد [أمثلة سير العمل والمحتوى ذي الصلة](https://n8n.io/integrations/thehive-trigger/) على موقع n8n الإلكتروني.

ارجع إلى وثائق TheHive لمزيد من المعلومات حول الخدمة:

*   [الإصدار 3](https://docs.thehive-project.org/thehive/legacy/thehive3/api/)
*   [الإصدار 4](https://docs.thehive-project.org/cortex/api/api-guide/)

## تهيئة ويب هوك في TheHive

لتهيئة الويب هوك لنسخة TheHive الخاصة بك:

1.  انسخ عناوين URL لـ ويب هوك الخاصة بالاختبار والإنتاج من عقدة مُحفِّز TheHive (TheHive Trigger node).
2.  أضف الأسطر التالية إلى ملف `application.conf`. هذا هو ملف تهيئة TheHive:

    ```
    notification.webhook.endpoints = [
    	{
    		name: TESTING_WEBHOOK_NAME
    		url: TESTING_WEBHOOK_URL
    		version: 0
    		wsConfig: {}
    		includedTheHiveOrganisations: ["ORGANIZATION_NAME"]
    		excludedTheHiveOrganisations: []
    	},
    	{
    		name: PRODUCTION_WEBHOOK_NAME
    		url: PRODUCTION_WEBHOOK_URL
    		version: 0
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