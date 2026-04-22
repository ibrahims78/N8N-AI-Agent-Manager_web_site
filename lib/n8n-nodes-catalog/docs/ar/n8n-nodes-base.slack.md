# عقدة Slack (سلاك)

استخدم عقدة Slack لأتمتة العمل في سلاك وتكامل سلاك مع تطبيقات أخرى. يدعم n8n مدمجاً مجموعة واسعة من ميزات سلاك، بما في ذلك إنشاء القنوات وأرشفتها وإغلاقها، والحصول على المستخدمين والملفات، بالإضافة إلى حذف الرسائل.

في هذه الصفحة، ستجد قائمة بالـ عمليات التي تدعمها عقدة سلاك وروابط إلى موارد إضافية.

> **بيانات الاعتماد**
>
> راجع [Slack credentials](/integrations/builtin/credentials/slack.md) للحصول على إرشادات حول إعداد المصادقة.

> **المراجعة البشرية لمكالمات أدوات AI**
>
> يمكن استخدام هذه العقدة كخطوة مراجعة بشرية لمكالمات وكيل الذكاء الاصطناعي. عند تكوينها بهذه الطريقة، سيتوقف وكيل الذكاء الاصطناعي ويطلب موافقة بشرية من خلال هذه الخدمة قبل تنفيذ الأدوات التي تتطلب إشرافاً. اعرف المزيد في [Human-in-the-loop for AI tool calls](/advanced-ai/human-in-the-loop-tools.md).

## Operations

* **القناة**  
    * **أرشفة** قناة.  
    * **إغلاق** رسالة مباشرة أو رسالة جماعية.  
    * **إنشاء** محادثة عامة أو خاصة قائمة على القناة.  
    * **الحصول على** معلومات حول قناة.  
    * **الحصول على الكثير**: الحصول على قائمة القنوات في سلاك.  
    * **التاريخ**: الحصول على تاريخ الرسائل والأحداث في قناة.  
    * **دعوة** مستخدم إلى قناة.  
    * **الانضمام** إلى قناة موجودة.  
    * **طرد**: إزالة مستخدم من قناة.  
    * **المغادرة** من قناة.  
    * **الأعضاء**: سرد أعضاء قناة.  
    * **فتح** أو استئناف رسالة مباشرة أو رسالة جماعية.  
    * **إعادة تسمية** قناة.  
    * **الردود**: الحصول على سلسلة رسائل منشورة في قناة.  
    * **تحديد الغرض** لقناة.  
    * **تحديد الموضوع** لقناة.  
    * **إلغاء الأرشفة** قناة.
* **الملف**  
    * **الحصول على الملف**.  
    * **الحصول على العديد**: الحصول على ملفات الفريق وتصفيتها.  
    * **رفع**: إنشاء أو رفع ملف موجود.
* **الرسالة**  
    * **حذف** رسالة.  
    * **الحصول على الرابط الثابت**: الحصول على الرابط الثابت للرسالة.  
    * **البحث** عن رسائل.  
    * **إرسال** رسالة.  
    * **إرسال والانتظار للرد**: إرسال رسالة والانتظار حتى يتلقى المستلم رداً قبل المتابعة.  
    * **تحديث** رسالة.
* **التفاعل**  
    * **إضافة** تفاعل إلى رسالة.  
    * **الحصول على** تفاعلات رسالة.  
    * **إزالة** تفاعل من رسالة.
* **المفضلة**  
    * **إضافة** نجمة إلى عنصر.  
    * **حذف** نجمة من عنصر.  
    * **الحصول على كثير من النجوم**: الحصول على قائمة نجوم المستخدم المصادق.  
* **المستخدم**  
    * **الحصول على** معلومات حول مستخدم.  
    * **الحصول على الكثير**: الحصول على قائمة المستخدمين.  
    * **الحصول على ملف تعريف المستخدم**.  
    * **الحصول على حالة المستخدم**.  
    * **تحديث ملف تعريف المستخدم**.
* **مجموعة المستخدمين**  
    * **إنشاء** مجموعة مستخدمين.  
    * **تعطيل** مجموعة مستخدمين.  
    * **تمكين** مجموعة مستخدمين.  
    * **الحصول على الكثير**: الحصول على قائمة مجموعات المستخدمين.  
    * **تحديث** مجموعة مستخدمين.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

انظر في [توثيق سلاك](/) لمزيد من المعلومات حول الخدمة.

## المجالات المطلوبة

بمجرد إنشاء تطبيق سلاك لـ [Slack credentials](/integrations/builtin/credentials/slack.md)، يجب إضافة المجالات المناسبة إلى تطبيق سلاك ليعمل هذا العقدة. ابدأ بالمجالات المذكورة في صفحة [Scopes | Slack credentials](/integrations/builtin/credentials/slack.md#scopes).

إذا لم تكن تلك كافية، استخدم الجدول أدناه للبحث عن المورد والعملية التي ترغب في استخدامها، ثم اتبع الرابط إلى توثيق Slack API لإيجاد أنواع المجالات الصحيحة.

<!-- vale off -->

| **المورد** | **العملية**              | **طريقة Slack API**                                                               |
|--------------|----------------------------|------------------------------------------------------------------------------------|
| القناة      | أرشفة                    | [conversations.archive](https://api.slack.com/methods/conversations.archive)       |
| القناة      | إغلاق                      | [conversations.close](https://api.slack.com/methods/conversations.close)           |
| القناة      | إنشاء                     | [conversations.create](https://api.slack.com/methods/conversations.create)         |
| القناة      | الحصول على                 | [conversations.info](https://api.slack.com/methods/conversations.info)             |
| القناة      | الحصول على الكثير          | [conversations.list](https://api.slack.com/methods/conversations.list)             |
| القناة      | التاريخ                    | [conversations.history](https://api.slack.com/methods/conversations.history)       |
| القناة      | الدعوة                     | [conversations.invite](https://api.slack.com/methods/conversations.invite)         |
| القناة      | الانضمام                    | [conversations.join](https://api.slack.com/methods/conversations.join)             |
| القناة      | الطرد                       | [conversations.kick](https://api.slack.com/methods/conversations.kick)             |
| القناة      | المغادرة                   | [conversations.leave](https://api.slack.com/methods/conversations.leave)           |
| القناة      | الأعضاء                    | [conversations.members](https://api.slack.com/methods/conversations.members)       |
| القناة      | فتح                         | [conversations.open](https://api.slack.com/methods/conversations.open)             |
| القناة      | إعادة تسمية                 | [conversations.rename](https://api.slack.com/methods/conversations.rename)         |
| القناة      | الردود                      | [conversations.replies](https://api.slack.com/methods/conversations.replies)       |
| القناة      | تحديد الغرض                 | [conversations.setPurpose](https://api.slack.com/methods/conversations.setPurpose) |
| القناة      | تحديد الموضوع               | [conversations.setTopic](https://api.slack.com/methods/conversations.setTopic)     |
| القناة      | إلغاء الأرشفة               | [conversations.unarchive](https://api.slack.com/methods/conversations.unarchive)   |

| File (الملف) | Get | [files.info](https://api.slack.com/methods/files.info)                             |
| File | Get Many                   | [files.list](https://api.slack.com/methods/files.list)                             |
| File | Upload                     | [files.upload](https://api.slack.com/methods/files.upload)                         |
| Message (الرسالة) | Delete                     | [chat.delete](https://api.slack.com/methods/chat.delete)                           |
| Message | Get Permalink              | [chat.getPermalink](https://api.slack.com/methods/chat.getPermalink)               |
| Message | Search                     | [search.messages](https://api.slack.com/methods/search.messages)                   |
| Message | Send                       | [chat.postMessage](https://api.slack.com/methods/chat.postMessage)                 |
| Message | Send and Wait for Response | [chat.postMessage](https://api.slack.com/methods/chat.postMessage)                 |
| Message | Update                     | [chat.update](https://api.slack.com/methods/chat.update)                           |
| Reaction (التفاعل) | Add                        | [reactions.add](https://api.slack.com/methods/reactions.add)                       |
| Reaction | Get                        | [reactions.get](https://api.slack.com/methods/reactions.get)                       |
| Reaction | Remove                     | [reactions.remove](https://api.slack.com/methods/reactions.remove)                 |
| Star (النجمة) | Add                        | [stars.add](https://api.slack.com/methods/stars.add)                               |
| Star | Delete                     | [stars.remove](https://api.slack.com/methods/stars.remove)                         |
| Star | Get Many                   | [stars.list](https://api.slack.com/methods/stars.list)                             |
| User (المستخدم) | Get                        | [users.info](https://api.slack.com/methods/users.info)                             |
| User | Get Many                   | [users.list](https://api.slack.com/methods/users.list)                             |
| User | Get User's Profile         | [users.profile.get](https://api.slack.com/methods/users.profile.get)               |
| User | Get User's Status          | [users.getPresence](https://api.slack.com/methods/users.getPresence)               |
| User | Update User's Profile      | [users.profile.set](https://api.slack.com/methods/users.profile.set)               |
| User Group (مجموعة المستخدمين) | Create                     | [usergroups.create](https://api.slack.com/methods/usergroups.create)               |
| User Group | Disable                    | [usergroups.disable](https://api.slack.com/methods/usergroups.disable)             |
| User Group | Enable                     | [usergroups.enable](https://api.slack.com/methods/usergroups.enable)               |
| User Group | Get Many                   | [usergroups.list](https://api.slack.com/methods/usergroups.list)                   |
| User Group | Update                     | [usergroups.update](https://api.slack.com/methods/usergroups.update)               |

<!-- vale on -->

## ماذا تفعل إذا لم تكن العملية مدعومة؟

إذا لم تدعم هذه العقدة العملية التي تريد تنفيذها، يمكنك استخدام عقدة [عقدة طلب HTTP (HTTP Request)](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء API الخاص بالخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة [عقدة طلب HTTP (HTTP Request)](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md):

1. في عقدة طلب HTTP (HTTP Request)، اختر المصادقة > نوع بيانات الاعتماد المعرفة مُسبقاً.
1. اختر الخدمة التي تريد الاتصال بها.
1. اختر بيانات الاعتماد الخاصة بك.

انظر إلى [عمليات API المخصصة](/integrations/custom-operations.md) لمزيد من المعلومات.