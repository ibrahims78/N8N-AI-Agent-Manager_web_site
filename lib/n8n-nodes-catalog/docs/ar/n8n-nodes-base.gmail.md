# عقدة Gmail

استخدم عقدة Gmail لأتمتة سير العمل في Gmail، ودمج Gmail مع تطبيقات أخرى. تدعم n8n بشكل مدمج مجموعة واسعة من ميزات Gmail، بما في ذلك إنشاء المسودات والرسائل والتصنيفات والمحادثات وتحديثها وحذفها والحصول عليها.

في هذه الصفحة، ستجد قائمة بالعمليات التي تدعمها عقدة Gmail وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد Google](/integrations/builtin/credentials/google/index.md) للحصول على إرشادات حول إعداد المصادقة.

> **يمكن استخدام هذه العقدة كأداة ذكاء اصطناعي**
>
> يمكن استخدام هذه العقدة لتعزيز قدرات وكيل الذكاء الاصطناعي. عند استخدامها بهذه الطريقة، يمكن تعيين العديد من المعاملات تلقائيًا، أو باستخدام معلومات موجهة بواسطة الذكاء الاصطناعي - اكتشف المزيد في [توثيق معاملات أداة الذكاء الاصطناعي](/advanced-ai/examples/using-the-fromai-function.md).

## العمليات

*   **مسودة**
    *   [**إنشاء**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/draft-operations.md#create-a-draft) مسودة
    *   [**حذف**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/draft-operations.md#delete-a-draft) مسودة
    *   [**الحصول على**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/draft-operations.md#get-a-draft) مسودة
    *   [**الحصول على العديد من**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/draft-operations.md#get-many-drafts) المسودات
*   **تصنيف**
    *   [**إنشاء**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/label-operations.md#create-a-label) تصنيف
    *   [**حذف**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/label-operations.md#delete-a-label) تصنيف
    *   [**الحصول على**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/label-operations.md#get-a-label) تصنيف
    *   [**الحصول على العديد من**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/label-operations.md#get-many-labels) التصنيفات
*   **رسالة**
    *   [**إضافة تصنيف**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/message-operations.md#add-label-to-a-message) إلى رسالة
    *   [**حذف**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/message-operations.md#delete-a-message) رسالة
    *   [**الحصول على**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/message-operations.md#get-a-message) رسالة
    *   [**الحصول على العديد من**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/message-operations.md#get-many-messages) الرسائل
    *   [**وضع علامة "مقروءة"**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/message-operations.md#mark-as-read)
    *   [**وضع علامة "غير مقروءة"**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/message-operations.md#mark-as-unread)
    *   [**إزالة تصنيف**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/message-operations.md#remove-label-from-a-message) من رسالة
    *   [**الرد**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/message-operations.md#reply-to-a-message) على رسالة
    *   [**إرسال**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/message-operations.md#send-a-message) رسالة
*   **محادثة**
    *   [**إضافة تصنيف**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/thread-operations.md#add-label-to-a-thread) إلى محادثة
    *   [**حذف**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/thread-operations.md#delete-a-thread) محادثة
    *   [**الحصول على**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/thread-operations.md#get-a-thread) محادثة
    *   [**الحصول على العديد من**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/thread-operations.md#get-many-threads) المحادثات
    *   [**إزالة تصنيف**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/thread-operations.md#remove-label-from-a-thread) من محادثة
    *   [**الرد**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/thread-operations.md#reply-to-a-message) على رسالة

*   [**نقل محادثة إلى المهملات**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/thread-operations.md#trash-a-thread)
*   [**إزالة محادثة من المهملات**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/thread-operations.md#untrash-a-thread)

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

ارجع إلى [توثيق Gmail API](https://developers.google.com/gmail/api) من Google للحصول على معلومات مفصلة حول الـ API الذي تتكامل معه هذه العقدة.

توفر n8n عقدة مُحفِّز لـ Gmail. يمكنك العثور على توثيق عقدة المُحفِّز [هنا](/integrations/builtin/trigger-nodes/n8n-nodes-base.gmailtrigger/index.md).

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في القيام بها، يمكنك استخدام [عقدة HTTP Request](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء API الخاص بالخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة HTTP Request:

1.  في عقدة HTTP Request، حدد **Authentication** > **Predefined Credential Type**.
2.  حدد الخدمة التي تريد الاتصال بها.
3.  حدد بيانات الاعتماد الخاصة بك.

ارجع إلى [عمليات API المخصصة](/integrations/custom-operations.md) لمزيد من المعلومات.

## المشكلات الشائعة

للأخطاء أو المشكلات الشائعة وخطوات الحل المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/common-issues.md).

---

# المشكلات الشائعة في عقدة Gmail

فيما يلي بعض الأخطاء والمشكلات الشائعة في [عقدة Gmail](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/index.md) وخطوات حلها أو استكشاف أخطائها وإصلاحها.

## إزالة إسناد n8n من الرسائل المرسلة

إذا كنت تستخدم العقدة [لإرسال رسالة](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/message-operations.md#send-a-message) أو [الرد على رسالة](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/message-operations.md#reply-to-a-message)، فإن العقدة تُلحق هذه العبارة في نهاية البريد الإلكتروني:

> تم إرسال هذا البريد الإلكتروني تلقائيًا باستخدام n8n

لإزالة هذا الإسناد:

1.  في قسم **Options** الخاص بالعقدة، حدد **Add option**.
2.  حدد **Append n8n attribution**.
3.  أوقف تشغيل المفتاح.

ارجع إلى [خيارات الإرسال](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/message-operations.md#send-options) و[خيارات الرد](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/message-operations.md#reply-options) لمزيد من المعلومات.

## محظور - ربما تحقق من بيانات الاعتماد الخاصة بك

يظهر هذا الخطأ بجانب بعض القوائم المنسدلة في العقدة، مثل القائمة المنسدلة **Label Names or IDs**. النص الكامل يبدو كالتالي:

```
There was a problem loading the parameter options from server: "Forbidden - perhaps check your credentials?"
```

يظهر الخطأ غالبًا عند استخدام حساب خدمة Google كبيانات اعتماد، وأن بيانات الاعتماد لا تحتوي على خيار **Impersonate a User** مفعّلًا.

راجع [Google Service Account: Finish your n8n credential](/integrations/builtin/credentials/google/service-account.md#finish-your-n8n-credential) لمزيد من المعلومات.

## خطأ 401 غير مصرح به

النص الكامل للخطأ يبدو كالتالي:
<!--vale off-->
```
401 - {"error":"unauthorized_client","error_description":"Client is unauthorized to retrieve access tokens using this method, or client not authorized for any of the scopes requested."}
```
<!--vale on-->

يحدث هذا الخطأ عند وجود مشكلة في بيانات الاعتماد التي تستخدمها وفي نطاقاتها أو أذوناتها.

لحل المشكلة:

1.  بالنسبة لبيانات اعتماد [OAuth2](/integrations/builtin/credentials/google/oauth-single-service.md)، تأكد من تمكين Gmail API في **APIs & Services > Library**. راجع [Google OAuth2 Single Service - Enable APIs](/integrations/builtin/credentials/google/oauth-single-service.md#enable-apis) لمزيد من المعلومات.
2.  بالنسبة لبيانات اعتماد [Service Account](/integrations/builtin/credentials/google/service-account.md):
    1.  [قم بتمكين التفويض على مستوى النطاق](/integrations/builtin/credentials/google/service-account.md#enable-domain-wide-delegation).
    2.  تأكد من إضافة Gmail API كجزء من تهيئة التفويض على مستوى النطاق.

## طلب سيء - يرجى التحقق من المعاملات الخاصة بك

يحدث هذا الخطأ غالبًا إذا أدخلت Message ID أو Thread ID أو Label ID غير موجود.

جرّب عملية **Get** باستخدام الـ ID للتأكد من وجوده.

---

# عمليات المسودات في عقدة Gmail

استخدم عمليات المسودات لإنشاء مسودة أو حذفها أو الحصول عليها أو سرد المسودات في Gmail. راجع [عقدة Gmail](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/index.md) لمزيد من المعلومات حول عقدة Gmail نفسها.

## إنشاء مسودة

استخدم هذه العملية لإنشاء مسودة جديدة.

أدخل هذه المعاملات:

*   حدد **Credential to connect with** أو أنشئ بيانات اعتماد جديدة.
*   **Resource**: حدد **Draft**.
*   **Operation**: حدد **Create**.
*   **Subject**: أدخل سطر الموضوع.
*   حدد **Email Type**. اختر من **Text** أو **HTML**.
*   **Message**: أدخل نص رسالة البريد الإلكتروني.

### خيارات إنشاء المسودة

استخدم هذه الخيارات لتحسين سلوك العقدة بشكل أكبر:

*   **Attachments**: حدد **Add Attachment** لإضافة مرفق. أدخل **Attachment Field Name (in Input)** لتحديد الحقل من عقدة المدخلات الذي يحتوي على المرفق.
    *   لخصائص متعددة، أدخل قائمة مفصولة بفاصلات.
*   **BCC**: أدخل عنوان بريد إلكتروني واحدًا أو أكثر للمستلمين المخفيين. افصل عناوين البريد الإلكتروني المتعددة بفاصلة، على سبيل المثال `jay@gatsby.com, jon@smith.com`.
*   **CC**: أدخل عنوان بريد إلكتروني واحدًا أو أكثر لمستلمي النسخة الكربونية. افصل عناوين البريد الإلكتروني المتعددة بفاصلة، على سبيل المثال `jay@gatsby.com, jon@smith.com`.
*   **From Alias Name or ID**: حدد اسمًا مستعارًا لإرسال المسودة منه. يتم ملء هذا الحقل بناءً على بيانات الاعتماد التي حددتها في المعاملات.
*   **Send Replies To**: أدخل عنوان بريد إلكتروني لتعيينه كعنوان للردود.
*   **Thread ID**: إذا كنت تريد إرفاق هذه المسودة بسلسلة محادثات، فأدخل المعرّف الخاص بتلك السلسلة.
*   **To Email**: أدخل عنوان بريد إلكتروني واحدًا أو أكثر للمستلمين. افصل عناوين البريد الإلكتروني المتعددة بفاصلة، على سبيل المثال `jay@gatsby.com, jon@smith.com`.

ارجع إلى توثيق [Gmail API Method: users.drafts.create](https://developers.google.com/gmail/api/reference/rest/v1/users.drafts/create) لمزيد من المعلومات.

## حذف مسودة

استخدم هذه العملية لحذف مسودة.

أدخل هذه المعاملات:

*   حدد **Credential to connect with** أو أنشئ بيانات اعتماد جديدة.
*   **Resource**: حدد **Draft**.
*   **Operation**: حدد **Delete**.
*   **Draft ID**: أدخل معرّف المسودة التي ترغب في حذفها.

ارجع إلى توثيق [Gmail API Method: users.drafts.delete](https://developers.google.com/gmail/api/reference/rest/v1/users.drafts/delete) لمزيد من المعلومات.

## الحصول على مسودة

استخدم هذه العملية للحصول على مسودة واحدة.

أدخل هذه المعاملات:

*   حدد **Credential to connect with** أو أنشئ بيانات اعتماد جديدة.
*   **Resource**: حدد **Draft**.
*   **Operation**: حدد **Get**.
*   **Draft ID**: أدخل معرّف المسودة التي ترغب في الحصول على معلومات عنها.

### خيارات الحصول على مسودة

استخدم هذه الخيارات لتحسين سلوك العقدة بشكل أكبر:

*   **Attachment Prefix**: أدخل بادئة لاسم الخاصية الثنائية التي يجب أن تكتب العقدة أي مرفقات إليها. يضيف n8n فهرسًا يبدأ بـ `0` إلى البادئة. على سبيل المثال، إذا أدخلت `attachment_` كبادئة، فسيتم حفظ المرفق الأول في `attachment_0`.
*   **Download Attachments**: حدد ما إذا كان يجب على العقدة تنزيل مرفقات المسودة (مفعل) أم لا (معطل).

ارجع إلى توثيق [Gmail API Method: users.drafts.get](https://developers.google.com/gmail/api/reference/rest/v1/users.drafts/get) لمزيد من المعلومات.

## الحصول على مسودات متعددة

استخدم هذه العملية للحصول على مسودتين أو أكثر.

أدخل هذه المعاملات:

*   حدد **Credential to connect with** أو أنشئ بيانات اعتماد جديدة.
*   **Resource**: حدد **Draft**.
*   **Operation**: حدد **Get Many**.
*   **Return All**: اختر ما إذا كانت العقدة تُرجع جميع المسودات (مفعل) أو فقط حتى حد معين (معطل).
*   **Limit**: أدخل العدد الأقصى للمسودات المراد إرجاعها. يُستخدم فقط إذا قمت بتعطيل **Return All**.

### خيارات الحصول على مسودات متعددة

استخدم هذه الخيارات لتحسين سلوك العقدة بشكل أكبر:

*   **Attachment Prefix**: أدخل بادئة لاسم الخاصية الثنائية التي يجب أن تكتب العقدة أي مرفقات إليها. يضيف n8n فهرسًا يبدأ بـ `0` إلى البادئة. على سبيل المثال، إذا أدخلت `attachment_` كبادئة، فسيتم حفظ المرفق الأول في `attachment_0`.
*   **Download Attachments**: حدد ما إذا كان يجب على العقدة تنزيل مرفقات المسودة (مفعل) أم لا (معطل).
*   **Include Spam and Trash**: حدد ما إذا كان يجب على العقدة الحصول على المسودات الموجودة في مجلدات البريد العشوائي والمهملات (مفعل) أم لا (معطل).

ارجع إلى توثيق [Gmail API Method: users.drafts.list](https://developers.google.com/gmail/api/reference/rest/v1/users.drafts/list) لمزيد من المعلومات.

## المشكلات الشائعة

للاطلاع على الأخطاء أو المشكلات الشائعة وخطوات الحل المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/common-issues.md).

---

# عمليات التسمية (Label) لـ Gmail (العقدة)

استخدم عمليات التسمية (Label) لإنشاء تسمية أو حذفها أو الحصول عليها أو سرد التسميات في Gmail. ارجع إلى [عقدة Gmail](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/index.md) لمزيد من المعلومات حول عقدة Gmail نفسها.

## إنشاء تسمية

استخدم هذه العملية لإنشاء تسمية جديدة.

أدخل المعاملات التالية:

*   حدد **بيانات الاعتماد (Credential) للاتصال بها** أو أنشئ بيانات اعتماد جديدة.
*   **المورد (Resource)**: حدد **التسمية (Label)**.
*   **العملية (Operation)**: حدد **إنشاء (Create)**.
*   **الاسم (Name)**: أدخل اسم عرض للتسمية.

### خيارات إنشاء التسمية

استخدم هذه الخيارات لتحسين سلوك العقدة بشكل أكبر:

*   **رؤية قائمة التسميات (Label List Visibility)**: تحدد رؤية التسمية في قائمة التسميات في واجهة ويب Gmail. اختر من بين:
    *   **إخفاء (Hide)**: لا تعرض التسمية في قائمة التسميات.
    *   **إظهار (Show)** (افتراضي): اعرض التسمية في قائمة التسميات.
    *   **إظهار إذا كانت غير مقروءة (Show if Unread)**: اعرض التسمية إذا كانت هناك أي رسائل غير مقروءة تحمل تلك التسمية.
*   **رؤية قائمة الرسائل (Message List Visibility)**: تحدد رؤية الرسائل التي تحمل هذه التسمية في قائمة الرسائل في واجهة ويب Gmail. اختر ما إذا كنت تريد **إظهار (Show)** أو **إخفاء (Hide)** الرسائل التي تحمل هذه التسمية.

ارجع إلى وثائق [Gmail API Method: users.labels.create](https://developers.google.com/gmail/api/reference/rest/v1/users.labels/create) لمزيد من المعلومات.

## حذف تسمية

استخدم هذه العملية لحذف تسمية موجودة.

أدخل المعاملات التالية:

*   حدد **بيانات الاعتماد (Credential) للاتصال بها** أو أنشئ بيانات اعتماد جديدة.
*   **المورد (Resource)**: حدد **التسمية (Label)**.
*   **العملية (Operation)**: حدد **حذف (Delete)**.
*   **معرّف التسمية (Label ID)**: أدخل معرّف التسمية التي تريد حذفها.

ارجع إلى وثائق [Gmail API Method: users.labels.delete](https://developers.google.com/gmail/api/reference/rest/v1/users.labels/delete) لمزيد من المعلومات.

## الحصول على تسمية

استخدم هذه العملية للحصول على تسمية موجودة.

أدخل المعاملات التالية:

*   حدد **بيانات الاعتماد (Credential) للاتصال بها** أو أنشئ بيانات اعتماد جديدة.
*   **المورد (Resource)**: حدد **التسمية (Label)**.
*   **العملية (Operation)**: حدد **الحصول (Get)**.
*   **معرّف التسمية (Label ID)**: أدخل معرّف التسمية التي تريد الحصول عليها.

ارجع إلى وثائق [Gmail API Method: users.labels.get](https://developers.google.com/gmail/api/reference/rest/v1/users.labels/get) لمزيد من المعلومات.

<!-- vale off -->

## الحصول على العديد من التصنيفات

استخدم هذه العملية للحصول على تصنيفين أو أكثر.

أدخل المعاملات التالية:

* حدد **بيانات الاعتماد للاتصال بها** أو أنشئ بيانات اعتماد جديدة.
* **المورد**: حدد **Label** (التصنيف).
* **العملية**: حدد **Get Many** (الحصول على العديد).
* **Return All** (إرجاع الكل): اختر ما إذا كانت العقدة تُرجع جميع التصنيفات (مفعلة) أو فقط حتى حد معين (معطلة).
* **Limit** (الحد الأقصى): أدخل العدد الأقصى للتصنيفات المراد إرجاعها. يُستخدم فقط إذا قمت بتعطيل **Return All**.

ارجع إلى وثائق [Gmail API Method: users.labels.list](https://developers.google.com/gmail/api/reference/rest/v1/users.labels/list) لمزيد من المعلومات.

## المشكلات الشائعة

للاطلاع على الأخطاء أو المشكلات الشائعة وخطوات الحل المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/common-issues.md).

---

# عمليات الرسائل في عقدة Gmail

استخدم عمليات الرسائل لإرسال رسالة، أو الرد عليها، أو حذفها، أو وضع علامة "مقروءة" أو "غير مقروءة" عليها، أو إضافة تصنيف إليها، أو إزالة تصنيف منها، أو الحصول على رسالة، أو الحصول على قائمة بالرسائل في Gmail. ارجع إلى [عقدة Gmail](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/index.md) لمزيد من المعلومات حول عقدة Gmail نفسها.

--8<-- "_snippets/integrations/builtin/app-nodes/hitl-tools.md"

## إضافة تصنيف إلى رسالة

استخدم هذه العملية لإضافة تصنيف واحد أو أكثر إلى رسالة.

أدخل المعاملات التالية:

* حدد **بيانات الاعتماد للاتصال بها** أو أنشئ بيانات اعتماد جديدة.
* **المورد**: حدد **Message** (الرسالة).
* **العملية**: حدد **Add Label** (إضافة تصنيف).
* **Message ID**: أدخل معرف الرسالة التي تريد إضافة التصنيف إليها.
* **Label Names or IDs**: حدد أسماء التصنيفات التي تريد إضافتها أو أدخل تعبيراً لتحديد المعرفات. يتم ملء القائمة المنسدلة بناءً على **بيانات الاعتماد** التي حددتها.

ارجع إلى وثائق [Gmail API Method: users.messages.modify](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/modify) لمزيد من المعلومات.

## حذف رسالة

استخدم هذه العملية لحذف رسالة فوراً وبشكل دائم.

> **حذف دائم**
>
> لا يمكن التراجع عن هذه العملية. للحذف القابل للاسترداد، استخدم [عملية نقل المحادثة إلى المهملات](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/thread-operations.md#trash-a-thread) بدلاً من ذلك.

أدخل المعاملات التالية:

* حدد **بيانات الاعتماد للاتصال بها** أو أنشئ بيانات اعتماد جديدة.
* **المورد**: حدد **Message** (الرسالة).
* **العملية**: حدد **Delete** (حذف).
* **Message ID**: أدخل معرف الرسالة التي تريد حذفها.

ارجع إلى وثائق [Gmail API Method: users.messages.delete](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/delete) لمزيد من المعلومات.

## الحصول على رسالة

استخدم هذه العملية للحصول على رسالة واحدة.

أدخل هذه المعاملات:

*   حدد **بيانات الاعتماد للاتصال بها** أو أنشئ بيانات اعتماد جديدة.
*   **Resource**: حدد **Message** (رسالة).
*   **Operation**: حدد **Get** (الحصول).
*   **Message ID**: أدخل معرف الرسالة التي ترغب في استردادها.
*   **Simplify**: اختر ما إذا كنت تريد إرجاع نسخة مبسطة من الاستجابة (مفعلة) أو البيانات الخام (معطلة). الافتراضي هو مفعل.
    *   هذا يعادل تعيين `format` لاستدعاء API إلى `metadata`، والذي يُرجع معرفات رسائل البريد الإلكتروني، والتصنيفات، ورؤوس البريد الإلكتروني، بما في ذلك: From, To, CC, BCC, و Subject.

ارجع إلى توثيق [Gmail API Method: users.messages.get](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/get) لمزيد من المعلومات.

<!-- vale off -->
## الحصول على رسائل متعددة
<!-- vale on -->

استخدم هذه العملية للحصول على رسالتين أو أكثر.

أدخل هذه المعاملات:

*   حدد **بيانات الاعتماد للاتصال بها** أو أنشئ بيانات اعتماد جديدة.
*   **Resource**: حدد **Message**.
*   **Operation**: حدد **Get Many** (الحصول على العديد).
*   **Return All**: اختر ما إذا كانت العقدة تُرجع جميع الرسائل (مفعلة) أو فقط حتى حد معين (معطلة).
*   **Limit**: أدخل العدد الأقصى للرسائل المراد إرجاعها. يُستخدم فقط إذا قمت بتعطيل **Return All**.
*   **Simplify**: اختر ما إذا كنت تريد إرجاع نسخة مبسطة من الاستجابة (مفعلة) أو البيانات الخام (معطلة). الافتراضي هو مفعل.
    *   هذا يعادل تعيين `format` لاستدعاء API إلى `metadata`، والذي يُرجع معرفات رسائل البريد الإلكتروني، والتصنيفات، ورؤوس البريد الإلكتروني، بما في ذلك: From, To, CC, BCC, و Subject.

<!-- vale off -->
### مرشحات الحصول على رسائل متعددة
<!-- vale on -->

استخدم هذه المرشحات لتحسين سلوك العقدة بشكل أكبر:

*   **Include Spam and Trash**: حدد ما إذا كان يجب على العقدة الحصول على الرسائل في مجلدات البريد العشوائي والمهملات (مفعلة) أم لا (معطلة).
*   **Label Names or IDs**: أرجع فقط الرسائل التي تحتوي على التصنيفات المحددة المضافة إليها. حدد أسماء التصنيفات التي تريد تطبيقها أو أدخل تعبيراً لتحديد المعرفات. يتم ملء القائمة المنسدلة بناءً على **بيانات الاعتماد** التي حددتها.
*   **Search**: أدخل مرشحات تحسين البحث في Gmail، مثل `from:`، لتصفية الرسائل المرتجعة. ارجع إلى [تحسين عمليات البحث في Gmail](https://support.google.com/mail/answer/7190?hl=en) لمزيد من المعلومات.
*   **Read Status**: اختر ما إذا كنت تريد تلقي **رسائل البريد الإلكتروني غير المقروءة والمقروءة**، أو **رسائل البريد الإلكتروني غير المقروءة فقط** (الافتراضي)، أو **رسائل البريد الإلكتروني المقروءة فقط**.
*   **Received After**: أرجع فقط رسائل البريد الإلكتروني التي تم استلامها بعد التاريخ والوقت المحددين. استخدم منتقي التاريخ لتحديد اليوم والوقت أو أدخل تعبيراً لتعيين تاريخ كسلسلة بتنسيق ISO أو طابع زمني بالمللي ثانية. ارجع إلى [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) لمزيد من المعلومات حول تنسيق السلسلة.
*   **Received Before**: أرجع فقط رسائل البريد الإلكتروني التي تم استلامها قبل التاريخ والوقت المحددين. استخدم منتقي التاريخ لتحديد اليوم والوقت أو أدخل تعبيراً لتعيين تاريخ كسلسلة بتنسيق ISO أو طابع زمني بالمللي ثانية. ارجع إلى [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) لمزيد من المعلومات حول تنسيق السلسلة.
*   **Sender**: أدخل بريداً إلكترونياً أو جزءاً من اسم مرسل لإرجاع الرسائل من ذلك المرسل فقط.

ارجع إلى توثيق [Gmail API Method: users.messages.list](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/list) لمزيد من المعلومات.

## وضع علامة مقروء

استخدم هذه العملية لوضع علامة على رسالة كمقروءة.

أدخل المعاملات التالية:

*   حدد **بيانات الاعتماد للاتصال بها** أو أنشئ بيانات اعتماد جديدة.
*   **المورد**: حدد **Message**.
*   **العملية**: حدد **Mark as Read**.
*   **Message ID**: أدخل معرف الرسالة التي ترغب في وضع علامة عليها كمقروءة.

<!-- vale off -->
ارجع إلى توثيق [Gmail API Method: users.messages.modify](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/modify) لمزيد من المعلومات.
<!-- vale on -->

## وضع علامة غير مقروء

استخدم هذه العملية لوضع علامة على رسالة كغير مقروءة.

أدخل المعاملات التالية:

*   حدد **بيانات الاعتماد للاتصال بها** أو أنشئ بيانات اعتماد جديدة.
*   **المورد**: حدد **Message**.
*   **العملية**: حدد **Mark as Unread**.
*   **Message ID**: أدخل معرف الرسالة التي ترغب في وضع علامة عليها كغير مقروءة.

<!-- vale off -->
ارجع إلى توثيق [Gmail API Method: users.messages.modify](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/modify) لمزيد من المعلومات.
<!-- vale on -->

## إزالة تسمية من رسالة

استخدم هذه العملية لإزالة تسمية واحدة أو أكثر من رسالة.

أدخل المعاملات التالية:

*   حدد **بيانات الاعتماد للاتصال بها** أو أنشئ بيانات اعتماد جديدة.
*   **المورد**: حدد **Message**.
*   **العملية**: حدد **Remove Label**.
*   **Message ID**: أدخل معرف الرسالة التي تريد إزالة التسمية منها.
*   **Label Names or IDs**: حدد أسماء التسميات التي تريد إزالتها أو أدخل تعبيراً لتحديد المعرفات. يتم ملء القائمة المنسدلة بناءً على **بيانات الاعتماد** التي حددتها.

<!-- vale off -->
ارجع إلى توثيق [Gmail API Method: users.messages.modify](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/modify) لمزيد من المعلومات.
<!-- vale on -->

## الرد على رسالة

استخدم هذه العملية لإرسال رسالة كرد على رسالة موجودة.

أدخل المعاملات التالية:

*   حدد **بيانات الاعتماد للاتصال بها** أو أنشئ بيانات اعتماد جديدة.
*   **المورد**: حدد **Message**.
*   **العملية**: حدد **Reply**.
*   **Message ID**: أدخل معرف الرسالة التي تريد الرد عليها.
*   حدد **Email Type**. اختر من **Text** أو **HTML**.
*   **Message**: أدخل نص الرسالة الإلكترونية.

### خيارات الرد

استخدم هذه الخيارات لتحسين سلوك العقدة بشكل أكبر:

*   **Append n8n attribution**: بشكل افتراضي، تُلحق العقدة العبارة `This email was sent automatically with n8n` بنهاية البريد الإلكتروني. لإزالة هذه العبارة، قم بإيقاف تشغيل هذا الخيار.
*   **Attachments**: حدد **Add Attachment** لإضافة مرفق. أدخل **Attachment Field Name (in Input)** لتحديد الحقل الذي يحتوي على المرفق من عقدة المدخلات.
    *   لخصائص متعددة، أدخل قائمة مفصولة بفواصل.
*   **BCC**: أدخل عنوان بريد إلكتروني واحدًا أو أكثر للمستلمين في النسخة المخفية الوجهة. افصل عناوين البريد الإلكتروني المتعددة بفاصلة، على سبيل المثال `jay@gatsby.com, jon@smith.com`.
*   **CC**: أدخل عنوان بريد إلكتروني واحدًا أو أكثر للمستلمين في النسخة الكربونية. افصل عناوين البريد الإلكتروني المتعددة بفاصلة، على سبيل المثال `jay@gatsby.com, jon@smith.com`.
*   **Sender Name**: أدخل الاسم الذي ترغب في عرضه في بريد المستلمين كاسم للمُرسِل.
*   **Reply to Sender Only**: اختر ما إذا كنت تريد الرد على الجميع (مُعطّل) أو الرد على المُرسِل فقط (مُفعّل).

ارجع إلى توثيق [Gmail API Method: users.messages.send](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/send) لمزيد من المعلومات.

## إرسال رسالة

استخدم هذه العملية لإرسال رسالة.

أدخل هذه المعاملات:

*   حدد **Credential to connect with** أو أنشئ بيانات اعتماد جديدة.
*   **Resource**: حدد **Message**.
*   **Operation**: حدد **Send**.
*   **To**: أدخل عنوان البريد الإلكتروني الذي تريد إرسال البريد إليه.
*   **Subject**: أدخل سطر الموضوع.
*   حدد **Email Type**. اختر من **Text** أو **HTML**.
*   **Message**: أدخل نص رسالة البريد الإلكتروني.

### خيارات الإرسال

استخدم هذه الخيارات لتحسين سلوك العقدة بشكل أكبر:

*   **Append n8n attribution**: بشكل افتراضي، تُلحق العقدة العبارة `This email was sent automatically with n8n` بنهاية البريد الإلكتروني. لإزالة هذه العبارة، قم بإيقاف تشغيل هذا الخيار.
*   **Attachments**: حدد **Add Attachment** لإضافة مرفق. أدخل **Attachment Field Name (in Input)** لتحديد الحقل الذي يحتوي على المرفق من عقدة المدخلات.
    *   لخصائص متعددة، أدخل قائمة مفصولة بفواصل.
*   **BCC**: أدخل عنوان بريد إلكتروني واحدًا أو أكثر للمستلمين في النسخة المخفية الوجهة. افصل عناوين البريد الإلكتروني المتعددة بفاصلة، على سبيل المثال `jay@gatsby.com, jon@smith.com`.
*   **CC**: أدخل عنوان بريد إلكتروني واحدًا أو أكثر للمستلمين في النسخة الكربونية. افصل عناوين البريد الإلكتروني المتعددة بفاصلة، على سبيل المثال `jay@gatsby.com, jon@smith.com`.
*   **Sender Name**: أدخل الاسم الذي ترغب في عرضه في بريد المستلمين كاسم للمُرسِل.
*   **Send Replies To**: أدخل عنوان بريد إلكتروني لتعيينه كعنوان للرد عليه.
*   **Reply to Sender Only**: اختر ما إذا كنت تريد الرد على الجميع (مُعطّل) أو الرد على المُرسِل فقط (مُفعّل).

ارجع إلى توثيق [Gmail API Method: users.messages.send](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/send) لمزيد من المعلومات.

## إرسال رسالة وانتظار الموافقة

استخدم هذه العملية لإرسال رسالة وانتظار الموافقة من المستلم قبل متابعة تنفيذ سير العمل.

> **استخدم العقدة Wait للموافقات المعقدة**
>
> تُعد عملية **Send and Wait for Approval** مناسبة تمامًا لعمليات الموافقة البسيطة. للموافقات الأكثر تعقيدًا، فكر في استخدام [العقدة Wait](/integrations/builtin/core-nodes/n8n-nodes-base.wait.md).

أدخل هذه المعاملات:

*   حدد **بيانات الاعتماد للاتصال بها** أو أنشئ بيانات اعتماد جديدة.
*   **المورد**: حدد **Message**.
*   **العملية**: حدد **Send and Wait for Approval**.
*   **إلى**: أدخل عنوان البريد الإلكتروني الذي تريد إرسال الرسالة إليه.
*   **الموضوع**: أدخل سطر الموضوع.
*   **الرسالة**: أدخل نص الرسالة الإلكترونية.

### خيارات الإرسال والانتظار للموافقة

استخدم هذه الخيارات لتحسين سلوك العقدة بشكل أكبر:

*   **Type of Approval**: اختر **Approve Only** (افتراضي) لتضمين زر موافقة فقط أو **Approve and Disapprove** لتضمين خيار عدم الموافقة أيضًا.
*   **Approve Button Label**: التسمية التي ستُستخدم لزر الموافقة (**Approve** افتراضيًا).
*   **Approve Button Style**: ما إذا كان سيتم تصميم زر الموافقة كزر **Primary** (افتراضي) أو **Secondary**.
*   **Disapprove Button Label**: التسمية التي ستُستخدم لزر عدم الموافقة (**Decline** افتراضيًا). مرئي فقط عند تعيين **Type of Approval** إلى **Approve and Disapprove**.
*   **Disapprove Button Style**: ما إذا كان سيتم تصميم زر عدم الموافقة كزر **Primary** أو **Secondary** (افتراضي). مرئي فقط عند تعيين **Type of Approval** إلى **Approve and Disapprove**.

ارجع إلى وثائق [Gmail API Method: users.messages.send](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/send) لمزيد من المعلومات.

## المشكلات الشائعة

للاطلاع على الأخطاء أو المشكلات الشائعة وخطوات الحل المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/common-issues.md).

---

# عمليات Thread في عقدة Gmail

استخدم عمليات Thread لحذف، الرد على، نقل إلى المهملات، استعادة من المهملات، إضافة/إزالة التسميات، الحصول على Thread واحد، أو سرد Threads. ارجع إلى [عقدة Gmail](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/index.md) لمزيد من المعلومات حول عقدة Gmail نفسها.

## إضافة تسمية إلى سلسلة محادثات

استخدم هذه العملية لإنشاء مسودة جديدة.

أدخل هذه المعاملات:

*   حدد **بيانات الاعتماد للاتصال بها** أو أنشئ بيانات اعتماد جديدة.
*   **المورد**: حدد **سلسلة المحادثات**.
*   **العملية**: حدد **إضافة تسمية**.
*   **معرّف سلسلة المحادثات (Thread ID)**: أدخل معرّف سلسلة المحادثات التي ترغب في إضافة التسمية إليها.
*   **أسماء التسميات أو معرّفاتها (Label Names or IDs)**: حدد أسماء التسميات التي ترغب في تطبيقها أو أدخل تعبيراً لتحديد المعرّفات. يتم ملء القائمة المنسدلة بناءً على **بيانات الاعتماد** التي حددتها.

<!-- vale off -->
ارجع إلى توثيق [Gmail API Method: users.threads.modify](https://developers.google.com/gmail/api/reference/rest/v1/users.threads/modify) لمزيد من المعلومات.
<!-- vale on -->

## حذف سلسلة محادثات

استخدم هذه العملية لحذف سلسلة محادثات وجميع رسائلها بشكل فوري ودائم.

> **حذف دائم**
>
> لا يمكن التراجع عن هذه العملية. للحذف القابل للاسترداد، استخدم [عملية النقل إلى المهملات](#trash-a-thread) بدلاً من ذلك.

أدخل هذه المعاملات:

*   حدد **بيانات الاعتماد للاتصال بها** أو أنشئ بيانات اعتماد جديدة.
*   **المورد**: حدد **سلسلة المحادثات**.
*   **العملية**: حدد **حذف**.
*   **معرّف سلسلة المحادثات (Thread ID)**: أدخل معرّف سلسلة المحادثات التي ترغب في حذفها.

ارجع إلى توثيق [Gmail API Method: users.threads.delete](https://developers.google.com/gmail/api/reference/rest/v1/users.threads/delete) لمزيد من المعلومات.

## الحصول على سلسلة محادثات

استخدم هذه العملية للحصول على سلسلة محادثات واحدة.

أدخل هذه المعاملات:

*   حدد **بيانات الاعتماد للاتصال بها** أو أنشئ بيانات اعتماد جديدة.
*   **المورد**: حدد **سلسلة المحادثات**.
*   **العملية**: حدد **الحصول**.
*   **معرّف سلسلة المحادثات (Thread ID)**: أدخل معرّف سلسلة المحادثات التي ترغب في استردادها.
*   **تبسيط (Simplify)**: اختر ما إذا كنت تريد إرجاع نسخة مبسطة من الاستجابة (مفعلة) أو البيانات الخام (معطلة). الافتراضي هو مفعل.
    *   هذا يعادل تعيين `format` لاستدعاء API إلى `metadata`، والذي يُرجع معرّفات رسائل البريد الإلكتروني، والتسميات، ورؤوس البريد الإلكتروني، بما في ذلك: From, To, CC, BCC, و Subject.

### خيارات الحصول على سلسلة المحادثات

استخدم هذه الخيارات لتحسين سلوك العقدة بشكل أكبر:

*   **إرجاع الرسائل فقط (Return Only Messages)**: اختر ما إذا كنت تريد إرجاع رسائل سلسلة المحادثات فقط (مفعلة).

ارجع إلى توثيق [Gmail API Method: users.threads.get](https://developers.google.com/gmail/api/reference/rest/v1/users.threads/get) لمزيد من المعلومات.

<!-- vale off -->

## الحصول على سلاسل محادثات متعددة

استخدم هذه العملية للحصول على سلسلتي محادثات أو أكثر.

أدخل هذه المعاملات:

*   حدد **بيانات الاعتماد للاتصال بها** أو أنشئ بيانات اعتماد جديدة.
*   **المورد**: حدد **سلسلة المحادثات** (Thread).
*   **العملية**: حدد **الحصول على متعدد**.
*   **إرجاع الكل**: اختر ما إذا كانت العقدة تُرجع جميع سلاسل المحادثات (مفعل) أو فقط حتى حد معين (معطل).
*   **الحد الأقصى**: أدخل العدد الأقصى لسلاسل المحادثات المراد إرجاعها. يُستخدم فقط إذا قمت بتعطيل **إرجاع الكل**.

### مرشحات الحصول على سلاسل محادثات متعددة

استخدم هذه المرشحات لتحسين سلوك العقدة بشكل أكبر:

*   **تضمين البريد العشوائي والمهملات**: حدد ما إذا كان يجب على العقدة الحصول على سلاسل المحادثات الموجودة في مجلدات البريد العشوائي والمهملات (مفعل) أم لا (معطل).
*   **أسماء التسميات أو المعرفات**: أرجع فقط سلاسل المحادثات التي أُضيفت إليها التسميات المحددة. حدد أسماء التسميات التي تريد تطبيقها أو أدخل تعبيراً لتحديد المعرفات. تُملأ القائمة المنسدلة بناءً على **بيانات الاعتماد** التي حددتها.
*   **البحث**: أدخل مرشحات تحسين البحث في Gmail، مثل `from:`، لتصفية سلاسل المحادثات المرجعة. ارجع إلى [Refine searches in Gmail](https://support.google.com/mail/answer/7190?hl=en) لمزيد من المعلومات.
*   **حالة القراءة**: اختر ما إذا كنت تريد تلقي **رسائل البريد الإلكتروني غير المقروءة والمقروءة**، أو **رسائل البريد الإلكتروني غير المقروءة فقط** (افتراضي)، أو **رسائل البريد الإلكتروني المقروءة فقط**.
*   **تلقي بعد**: أرجع فقط رسائل البريد الإلكتروني التي تم تلقيها بعد التاريخ والوقت المحددين. استخدم منتقي التاريخ لتحديد اليوم والوقت أو أدخل تعبيراً لتعيين تاريخ كسلسلة بتنسيق ISO أو طابع زمني بالمللي ثانية. ارجع إلى [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) لمزيد من المعلومات حول تنسيق السلسلة.
*   **تلقي قبل**: أرجع فقط رسائل البريد الإلكتروني التي تم تلقيها قبل التاريخ والوقت المحددين. استخدم منتقي التاريخ لتحديد اليوم والوقت أو أدخل تعبيراً لتعيين تاريخ كسلسلة بتنسيق ISO أو طابع زمني بالمللي ثانية. ارجع إلى [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) لمزيد من المعلومات حول تنسيق السلسلة.

ارجع إلى وثائق [Gmail API Method: users.threads.list](https://developers.google.com/gmail/api/reference/rest/v1/users.threads/list) لمزيد من المعلومات.

## إزالة تسمية من سلسلة محادثات

استخدم هذه العملية لإزالة تسمية من سلسلة محادثات.

أدخل هذه المعاملات:

*   حدد **بيانات الاعتماد للاتصال بها** أو أنشئ بيانات اعتماد جديدة.
*   **المورد**: حدد **سلسلة المحادثات**.
*   **العملية**: حدد **إزالة تسمية**.
*   **معرّف سلسلة المحادثات**: أدخل معرّف سلسلة المحادثات التي تريد إزالة التسمية منها.
*   **أسماء التسميات أو معرّفاتها**: حدد أسماء التسميات التي تريد إزالتها أو أدخل تعبيراً لتحديد معرّفاتها. يتم ملء القائمة المنسدلة بناءً على **بيانات الاعتماد** التي حددتها.

<!-- vale off -->
ارجع إلى وثائق [Gmail API Method: users.threads.modify](https://developers.google.com/gmail/api/reference/rest/v1/users.threads/modify) لمزيد من المعلومات.
<!-- vale on -->

## الرد على رسالة

استخدم هذه العملية للرد على رسالة.

أدخل هذه المعاملات:

*   حدد **بيانات الاعتماد للاتصال بها** أو أنشئ بيانات اعتماد جديدة.
*   **المورد**: حدد **سلسلة المحادثات**.
*   **العملية**: حدد **رد**.
*   **معرّف سلسلة المحادثات**: أدخل معرّف سلسلة المحادثات التي تريد الرد عليها.
*   **مقتطف الرسالة أو معرّفها**: حدد الرسالة التي تريد الرد عليها أو أدخل تعبيراً لتحديد معرّفها. يتم ملء القائمة المنسدلة بناءً على **بيانات الاعتماد** التي حددتها.
*   حدد **نوع البريد الإلكتروني**. اختر من **نص** أو **HTML**.
*   **الرسالة**: أدخل نص رسالة البريد الإلكتروني.

### خيارات الرد

استخدم هذه الخيارات لتحسين سلوك العقدة بشكل أكبر:

*   **المرفقات**: حدد **إضافة مرفق** لإضافة مرفق. أدخل **اسم حقل المرفق (في المدخلات)** لتحديد الحقل من عقدة المدخلات الذي يحتوي على المرفق.
    *   بالنسبة للخصائص المتعددة، أدخل قائمة مفصولة بفواصل.
*   **نسخة مخفية (BCC)**: أدخل عنوان بريد إلكتروني واحدًا أو أكثر للمستلمين في النسخة المخفية. افصل عناوين البريد الإلكتروني المتعددة بفاصلة، على سبيل المثال `jay@gatsby.com, jon@smith.com`.
*   **نسخة كربونية (CC)**: أدخل عنوان بريد إلكتروني واحدًا أو أكثر للمستلمين في النسخة الكربونية. افصل عناوين البريد الإلكتروني المتعددة بفاصلة، على سبيل المثال `jay@gatsby.com, jon@smith.com`.
*   **اسم المُرسِل**: أدخل الاسم الذي تريد عرضه في بريد المستلمين الإلكتروني كمرسل.
*   **الرد على المُرسِل فقط**: اختر ما إذا كنت تريد الرد على الجميع (معطل) أو الرد على المُرسِل فقط (مفعل).

ارجع إلى وثائق [Gmail API Method: users.messages.send](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/send) لمزيد من المعلومات.

## نقل محادثة إلى المهملات

استخدم هذه العملية لنقل محادثة وجميع رسائلها إلى المهملات.

أدخل هذه المعاملات:

*   حدد **بيانات الاعتماد** للاتصال بها أو أنشئ بيانات اعتماد جديدة.
*   **المورد**: حدد **Thread**.
*   **العملية**: حدد **Trash**.
*   **Thread ID**: أدخل معرف المحادثة التي ترغب في نقلها إلى المهملات.

ارجع إلى توثيق [Gmail API Method: users.threads.trash](https://developers.google.com/gmail/api/reference/rest/v1/users.threads/trash) للمزيد من المعلومات.

## استعادة محادثة من المهملات

استخدم هذه العملية لاستعادة محادثة وجميع رسائلها من المهملات.

أدخل هذه المعاملات:

*   حدد **بيانات الاعتماد** للاتصال بها أو أنشئ بيانات اعتماد جديدة.
*   **المورد**: حدد **Thread**.
*   **العملية**: حدد **Untrash**.
*   **Thread ID**: أدخل معرف المحادثة التي ترغب في استعادتها من المهملات.

ارجع إلى توثيق [Gmail API Method: users.threads.untrash](https://developers.google.com/gmail/api/reference/rest/v1/users.threads/untrash) للمزيد من المعلومات.

## المشكلات الشائعة

للاطلاع على الأخطاء أو المشكلات الشائعة وخطوات الحل المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/common-issues.md).