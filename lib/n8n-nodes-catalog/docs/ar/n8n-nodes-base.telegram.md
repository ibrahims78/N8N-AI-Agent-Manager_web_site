# عقدة Telegram

استخدم عقدة Telegram لأتمتة سير العمل في [Telegram](https://telegram.org/) ودمج Telegram مع تطبيقات أخرى. تدعم n8n بشكل مدمج مجموعة واسعة من ميزات Telegram، بما في ذلك الحصول على الملفات، وحذف الرسائل وتعديلها.

في هذه الصفحة، ستجد قائمة بالعمليات التي تدعمها عقدة Telegram وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد Telegram](/integrations/builtin/credentials/telegram.md) للحصول على إرشادات حول إعداد المصادقة.

## العمليات

*   [عمليات **الدردشة**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/chat-operations.md)
    *   [**الحصول**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/chat-operations.md#get-chat) على معلومات حديثة حول دردشة.
    *   [**الحصول على المسؤولين**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/chat-operations.md#get-administrators): الحصول على قائمة بجميع المسؤولين في دردشة.
    *   [**الحصول على عضو**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/chat-operations.md#get-chat-member): الحصول على تفاصيل عضو في دردشة.
    *   [**المغادرة**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/chat-operations.md) دردشة.
    *   [**تعيين الوصف**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/chat-operations.md#set-description) لدردشة.
    *   [**تعيين العنوان**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/chat-operations.md#set-title) لدردشة.
*   [عمليات **الاستدعاء العكسي**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/callback-operations.md)
    *   [**الإجابة على الاستعلام**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/callback-operations.md#answer-query): إرسال إجابات لاستعلامات الاستدعاء العكسي المرسلة من [لوحات المفاتيح المضمنة (inline keyboards)](https://core.telegram.org/bots/features#inline-keyboards).
    *   [**الإجابة على الاستعلام المضمن**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/callback-operations.md#answer-inline-query): إرسال إجابات لاستعلامات الاستدعاء العكسي المرسلة من الاستعلامات المضمنة.
*   [عمليات **الملفات**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/file-operations.md)
    *   [**الحصول على ملف**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/file-operations.md#get-file) من Telegram.
*   [عمليات **الرسائل**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md)
    *   [**حذف رسالة الدردشة**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#delete-chat-message).
    *   [**تعديل نص الرسالة**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#edit-message-text): تعديل نص رسالة موجودة.
    *   [**تثبيت رسالة الدردشة**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#pin-chat-message) للدردشة.
    *   [**إرسال رسوم متحركة**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#send-animation) إلى الدردشة.
        *   للاستخدام مع صور GIF أو مقاطع فيديو H.264/MPEG-4 AVC بدون صوت بحجم يصل إلى 50 ميجابايت.
    *   [**إرسال صوت**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#send-audio) ملف صوتي إلى الدردشة وعرضه في مشغل الموسيقى.
    *   [**إرسال إجراء الدردشة**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#send-chat-action): إبلاغ المستخدم بأن شيئًا ما يحدث من جانب البوت. يتم تعيين الحالة لمدة 5 ثوانٍ أو أقل.
    *   [**إرسال مستند**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#send-document) إلى الدردشة.

*   [**إرسال الموقع**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#send-location): لإرسال موقع جغرافي إلى الدردشة.
*   [**إرسال مجموعة وسائط**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#send-media-group): لإرسال مجموعة من الصور و/أو مقاطع الفيديو.
*   [**إرسال رسالة**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#send-message) إلى الدردشة.
*   [**إرسال صورة**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#send-photo) إلى الدردشة.
*   [**إرسال ملصق**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#send-sticker) إلى الدردشة.
    *   للاستخدام مع الملصقات الثابتة بصيغة .WEBP، أو المتحركة بصيغة .TGS، أو ملصقات الفيديو بصيغة .WEBM.
*   [**إرسال فيديو**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#send-video) إلى الدردشة.
*   [**إلغاء تثبيت رسالة الدردشة**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#unpin-chat-message) من الدردشة.

/// note | إضافة البوت إلى القناة
لاستخدام معظم عمليات **الرسائل**، يجب إضافة البوت الخاص بك إلى قناة ليتمكن من إرسال الرسائل إلى تلك القناة. ارجع إلى [المشكلات الشائعة | إضافة بوت إلى قناة تيليجرام](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues.md#add-a-bot-to-a-telegram-channel) لمزيد من المعلومات.
///

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

ارجع إلى [توثيق API الخاص بـ Telegram](https://core.telegram.org/bots/api) لمزيد من المعلومات حول الخدمة.

توفر n8n عقدة مُحفِّز لـ Telegram. ارجع إلى توثيق عقدة المُحفِّز [هنا](/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/index.md) لمزيد من المعلومات.

## المشكلات الشائعة

للاطلاع على الأخطاء أو المشكلات الشائعة وخطوات الحل المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues.md).

---

# المشكلات الشائعة في عقدة Telegram

فيما يلي بعض الأخطاء والمشكلات الشائعة المتعلقة بـ [عقدة Telegram (تيليجرام)](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/index.md) وخطوات حلها أو استكشافها.

## إضافة بوت إلى قناة تيليجرام

لكي يتمكن البوت من إرسال رسالة إلى قناة، يجب عليك إضافته إلى القناة. إذا لم تقم بإضافة البوت إلى القناة، فستظهر لك رسالة خطأ بوصف مشابه لما يلي:
`Error: Forbidden: bot is not a participant of the channel`.

لإضافة بوت إلى قناة:

1.  في تطبيق تيليجرام، ادخل إلى القناة المستهدفة وحدد اسم القناة.
2.  صنّف اسم القناة كـ **قناة عامة**.
3.  حدد **المسؤولون** > **إضافة مسؤول**.
4.  ابحث عن اسم مستخدم البوت وحدده.
5.  حدد علامة الصح في الزاوية العلوية اليمنى لإضافة البوت إلى القناة.

## الحصول على معرّف الدردشة (Chat ID)

يمكنك استخدام `@channelusername` فقط في القنوات العامة. للتفاعل مع مجموعة تيليجرام، تحتاج إلى معرّف الدردشة (Chat ID) الخاص بتلك المجموعة.

هناك ثلاث طرق للحصول على هذا المعرّف:

1.  من مُحفِّز تيليجرام (Telegram Trigger): استخدم عقدة [مُحفِّز تيليجرام](/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/index.md) (Telegram Trigger) في سير العمل الخاص بك للحصول على معرّف الدردشة (Chat ID). يمكن لهذه العقدة أن تُحفَّز بناءً على أحداث مختلفة وتُرجع معرّف الدردشة (Chat ID) عند التنفيذ الناجح.
2.  من متصفح الويب الخاص بك: افتح تيليجرام في متصفح الويب وافتح دردشة المجموعة. معرّف الدردشة (Chat ID) الخاص بالمجموعة هو سلسلة الأرقام التي تلي الحرف "g". أضف بادئة `-` إلى معرّف الدردشة (Chat ID) الخاص بمجموعتك عند إدخاله في n8n.
3.  ادعُ بوت تيليجرام [@RawDataBot](https://t.me/RawDataBot) إلى المجموعة: بمجرد إضافته، سيُخرج البوت ملف JSON يتضمن كائن `chat`. الـ `id` الخاص بهذا الكائن هو معرّف الدردشة (Chat ID) الخاص بالمجموعة. ثم قم بإزالة RawDataBot من مجموعتك.

## إرسال أكثر من 30 رسالة في الثانية

يحتوي واجهة برمجة تطبيقات تيليجرام (Telegram API) على [قيود](https://core.telegram.org/bots/faq#broadcasting-to-users) تسمح بإرسال 30 رسالة فقط في الثانية. اتبع هذه الخطوات لإرسال أكثر من 30 رسالة:

1.  **عقدة التكرار على العناصر (Loop Over Items)**: استخدم عقدة [التكرار على العناصر](/integrations/builtin/core-nodes/n8n-nodes-base.splitinbatches.md) (Loop Over Items) للحصول على 30 معرّف دردشة (Chat ID) كحد أقصى من قاعدة البيانات الخاصة بك.
2.  **عقدة تيليجرام (Telegram)**: قم بتوصيل عقدة تيليجرام (Telegram) بعقدة التكرار على العناصر (Loop Over Items). استخدم **محرر التعبيرات (Expression Editor)** لتحديد معرّفات الدردشة (Chat IDs) من عقدة التكرار على العناصر (Loop Over Items).
3.  **عقدة الكود (Code)**: قم بتوصيل عقدة [الكود](/integrations/builtin/core-nodes/n8n-nodes-base.code/index.md) (Code) بعقدة تيليجرام (Telegram). استخدم عقدة الكود (Code) للانتظار لبضع ثوانٍ قبل جلب الدفعة التالية من معرّفات الدردشة (Chat IDs). قم بتوصيل هذه العقدة بعقدة التكرار على العناصر (Loop Over Items).

يمكنك أيضًا استخدام [سير العمل](https://n8n.io/workflows/772) هذا.

## إزالة إسناد n8n من الرسائل المُرسلة

إذا كنت تستخدم العقدة لـ [إرسال رسائل Telegram](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#send-message)، يتم تلقائيًا إلحاق إسناد n8n بالرسالة في نهايتها:

> تم إرسال هذه الرسالة تلقائيًا باستخدام n8n

لإزالة هذا الإسناد:

1.  في قسم **الحقول الإضافية** الخاص بالعقدة، حدد **إضافة حقل**.
2.  حدد **إلحاق إسناد n8n**.
3.  أوقف تشغيل المفتاح التبديلي.

ارجع إلى [الحقول الإضافية لإرسال الرسائل](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#send-message-additional-fields) لمزيد من المعلومات.