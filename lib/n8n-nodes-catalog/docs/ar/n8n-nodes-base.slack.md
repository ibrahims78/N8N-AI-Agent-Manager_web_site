# عقدة Slack

استخدم عقدة Slack لأتمتة سير العمل في Slack، ودمج Slack مع التطبيقات الأخرى. تدعم n8n مجموعة واسعة من ميزات Slack بشكل مدمج، بما في ذلك إنشاء القنوات وأرشفتها وإغلاقها، والحصول على المستخدمين والملفات، بالإضافة إلى حذف الرسائل.

في هذه الصفحة، ستجد قائمة بالعمليات التي تدعمها عقدة Slack وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد Slack](/integrations/builtin/credentials/slack.md) للحصول على إرشادات حول إعداد المصادقة.

> **التدخل البشري في حلقات استدعاء أدوات الذكاء الاصطناعي**
>
> يمكن استخدام هذه العقدة كخطوة مراجعة بشرية لاستدعاءات أدوات وكيل الذكاء الاصطناعي. عند تهيئتها بهذه الطريقة، سيتوقف وكيل الذكاء الاصطناعي ويطلب موافقة بشرية عبر هذه الخدمة قبل تنفيذ الأدوات التي تتطلب إشرافًا. تعرّف على المزيد في [التدخل البشري في حلقات استدعاء أدوات الذكاء الاصطناعي](/advanced-ai/human-in-the-loop-tools.md).

## العمليات

*   **القناة**
    *   **أرشفة** قناة.
    *   **إغلاق** رسالة مباشرة أو رسالة مباشرة متعددة الأشخاص.
    *   **إنشاء** محادثة عامة أو خاصة قائمة على القنوات.
    *   **الحصول على** معلومات حول قناة.
    *   **الحصول على العديد**: الحصول على قائمة بالقنوات في Slack.
    *   **السجل**: الحصول على سجل القناة من الرسائل والأحداث.
    *   **دعوة** مستخدم إلى قناة.
    *   **الانضمام** إلى قناة موجودة.
    *   **الطرد**: إزالة مستخدم من قناة.
    *   **مغادرة** قناة.
    *   **العضو**: سرد أعضاء القناة.
    *   **فتح** أو استئناف رسالة مباشرة أو رسالة مباشرة متعددة الأشخاص.
    *   **إعادة تسمية** قناة.
    *   **الردود**: الحصول على سلسلة رسائل منشورة في قناة.
    *   **تعيين الغرض** من قناة.
    *   **تعيين الموضوع** من قناة.
    *   **إلغاء أرشفة** قناة.
*   **الملف**
    *   **الحصول على** ملف.
    *   **الحصول على العديد**: الحصول على ملفات الفريق وتصفيتها.
    *   **الرفع**: إنشاء ملف أو رفع ملف موجود.
*   **الرسالة**
    *   **حذف** رسالة
    *   **الحصول على الرابط الدائم**: الحصول على الرابط الدائم لرسالة.
    *   **البحث** عن الرسائل
    *   **إرسال** رسالة
    *   **إرسال وانتظار الرد**: إرسال رسالة وانتظار رد من المستلم قبل المتابعة.
    *   **تحديث** رسالة
*   **التفاعل**
    *   **إضافة** تفاعل إلى رسالة.
    *   **الحصول على** تفاعلات رسالة.
    *   **إزالة** تفاعل من رسالة.
*   **النجمة**
    *   **إضافة** نجمة إلى عنصر.
    *   **حذف** نجمة من عنصر.
    *   **الحصول على العديد**: الحصول على قائمة بنجوم المستخدم المصادق عليه.
*   **المستخدم**
    *   **الحصول على** معلومات حول مستخدم.
    *   **الحصول على العديد**: الحصول على قائمة بالمستخدمين.
    *   **الحصول على ملف تعريف المستخدم**.
    *   **الحصول على حالة المستخدم**.
    *   **تحديث ملف تعريف المستخدم**.
*   **مجموعة المستخدمين**
    *   **إنشاء** مجموعة مستخدمين.
    *   **تعطيل** مجموعة مستخدمين.
    *   **تمكين** مجموعة مستخدمين.
    *   **الحصول على العديد**: الحصول على قائمة بمجموعات المستخدمين.
    *   **تحديث** مجموعة مستخدمين.

## القوالب والأمثلة

## الموارد ذات الصلة

ارجع إلى [توثيق Slack](https://api.slack.com/) لمزيد من المعلومات حول الخدمة.

## النطاقات المطلوبة

بمجرد إنشاء تطبيق Slack لـ [بيانات اعتماد Slack](/integrations/builtin/credentials/slack.md) الخاصة بك، يجب عليك إضافة النطاقات المناسبة إلى تطبيق Slack الخاص بك لكي تعمل هذه العقدة. ابدأ بالنطاقات المدرجة في صفحة [النطاقات | بيانات اعتماد Slack](/integrations/builtin/credentials/slack.md#scopes).

إذا لم تكن هذه كافية، استخدم الجدول أدناه للبحث عن المورد والعملية التي ترغب في استخدامها، ثم اتبع الرابط إلى توثيق Slack API للعثور على النطاقات الصحيحة.

| **المورد** | **العملية**       | **طريقة Slack API**                                                               |
|------------|--------------------|------------------------------------------------------------------------------------|
| Channel    | أرشفة              | [conversations.archive](https://api.slack.com/methods/conversations.archive)       |
| Channel    | إغلاق              | [conversations.close](https://api.slack.com/methods/conversations.close)           |
| Channel    | إنشاء              | [conversations.create](https://api.slack.com/methods/conversations.create)         |
| Channel    | الحصول             | [conversations.info](https://api.slack.com/methods/conversations.info)             |
| Channel    | الحصول على العديد | [conversations.list](https://api.slack.com/methods/conversations.list)             |
| Channel    | السجل              | [conversations.history](https://api.slack.com/methods/conversations.history)       |
| Channel    | دعوة               | [conversations.invite](https://api.slack.com/methods/conversations.invite)         |
| Channel    | انضمام             | [conversations.join](https://api.slack.com/methods/conversations.join)             |
| Channel    | طرد                | [conversations.kick](https://api.slack.com/methods/conversations.kick)             |
| Channel    | مغادرة             | [conversations.leave](https://api.slack.com/methods/conversations.leave)           |
| Channel    | عضو                | [conversations.members](https://api.slack.com/methods/conversations.members)       |
| Channel    | فتح                | [conversations.open](https://api.slack.com/methods/conversations.open)             |
| Channel    | إعادة تسمية        | [conversations.rename](https://api.slack.com/methods/conversations.rename)         |
| Channel    | الردود             | [conversations.replies](https://api.slack.com/methods/conversations.replies)       |
| Channel    | تعيين الغرض        | [conversations.setPurpose](https://api.slack.com/methods/conversations.setPurpose) |
| Channel    | تعيين الموضوع      | [conversations.setTopic](https://api.slack.com/methods/conversations.setTopic)     |
| Channel    | إلغاء الأرشفة      | [conversations.unarchive](https://api.slack.com/methods/conversations.unarchive)   |
| File       | الحصول             | [files.info](https://api.slack.com/methods/files.info)                             |
| File       | الحصول على العديد | [files.list](https://api.slack.com/methods/files.list)                             |

| ملف               | رفع                        | [files.upload](https://api.slack.com/methods/files.upload)                         |
| رسالة             | حذف                       | [chat.delete](https://api.slack.com/methods/chat.delete)                           |
| رسالة             | الحصول على رابط دائم       | [chat.getPermalink](https://api.slack.com/methods/chat.getPermalink)               |
| رسالة             | بحث                        | [search.messages](https://api.slack.com/methods/search.messages)                   |
| رسالة             | إرسال                      | [chat.postMessage](https://api.slack.com/methods/chat.postMessage)                 |
| رسالة             | إرسال وانتظار الرد         | [chat.postMessage](https://api.slack.com/methods/chat.postMessage)                 |
| رسالة             | تحديث                      | [chat.update](https://api.slack.com/methods/chat.update)                           |
| تفاعل             | إضافة                     | [reactions.add](https://api.slack.com/methods/reactions.add)                       |
| تفاعل             | الحصول                    | [reactions.get](https://api.slack.com/methods/reactions.get)                       |
| تفاعل             | إزالة                      | [reactions.remove](https://api.slack.com/methods/reactions.remove)                 |
| نجمة              | إضافة                     | [stars.add](https://api.slack.com/methods/stars.add)                               |
| نجمة              | حذف                       | [stars.remove](https://api.slack.com/methods/stars.remove)                         |
| نجمة              | الحصول على العديد          | [stars.list](https://api.slack.com/methods/stars.list)                             |
| مستخدم            | الحصول                    | [users.info](https://api.slack.com/methods/users.info)                             |
| مستخدم            | الحصول على العديد          | [users.list](https://api.slack.com/methods/users.list)                             |
| مستخدم            | الحصول على ملف تعريف المستخدم | [users.profile.get](https://api.slack.com/methods/users.profile.get)               |
| مستخدم            | الحصول على حالة المستخدم   | [users.getPresence](https://api.slack.com/methods/users.getPresence)               |
| مستخدم            | تحديث ملف تعريف المستخدم   | [users.profile.set](https://api.slack.com/methods/users.profile.set)               |
| مجموعة المستخدمين | إنشاء                     | [usergroups.create](https://api.slack.com/methods/usergroups.create)               |
| مجموعة المستخدمين | تعطيل                     | [usergroups.disable](https://api.slack.com/methods/usergroups.disable)             |
| مجموعة المستخدمين | تمكين                     | [usergroups.enable](https://api.slack.com/methods/usergroups.enable)               |
| مجموعة المستخدمين | الحصول على العديد          | [usergroups.list](https://api.slack.com/methods/usergroups.list)                   |
| مجموعة المستخدمين | تحديث                      | [usergroups.update](https://api.slack.com/methods/usergroups.update)               |

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في تنفيذها، يمكنك استخدام [عقدة طلب HTTP (HTTP Request)](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء واجهة برمجة تطبيقات (API) الخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة طلب HTTP (HTTP Request):

1.  في عقدة طلب HTTP (HTTP Request)، اختر **المصادقة (Authentication)** > **نوع بيانات الاعتماد المُحددة مسبقًا (Predefined Credential Type)**.
2.  اختر الخدمة التي ترغب في الاتصال بها.
3.  اختر بيانات الاعتماد الخاصة بك.

ارجع إلى [عمليات API المخصصة (Custom API operations)](/integrations/custom-operations.md) لمزيد من المعلومات.