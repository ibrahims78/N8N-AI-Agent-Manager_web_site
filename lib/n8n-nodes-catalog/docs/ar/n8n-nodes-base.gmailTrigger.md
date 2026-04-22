# عقدة مُحفِّز Gmail

[Gmail](https://www.gmail.com) هي خدمة بريد إلكتروني طورتها Google. يمكن لعقدة مُحفِّز Gmail بدء سير عمل بناءً على الأحداث في Gmail.

> **بيانات الاعتماد**
>
> يمكن العثور على معلومات المصادقة لهذه العقدة [هنا](/integrations/builtin/credentials/google/index.md).

> **أمثلة وقوالب**
>
> للاطلاع على أمثلة الاستخدام والقوالب لمساعدتك على البدء، ارجع إلى صفحة [تكاملات مُحفِّز Gmail](https://n8n.io/integrations/gmail-trigger/) الخاصة بـ n8n.

## الأحداث

*   **استلام رسالة**: تُحفِّز العقدة للرسائل الجديدة في **وقت الاستقصاء** (Poll Time) المحدد.

## معاملات العقدة

قم بتكوين العقدة باستخدام هذه المعاملات:

*   **بيانات الاعتماد للاتصال بها** (Credential to connect with): حدد أو أنشئ بيانات اعتماد Google جديدة لاستخدامها للمُحفِّز. ارجع إلى [بيانات اعتماد Google](/integrations/builtin/credentials/google/index.md) لمزيد من المعلومات حول إعداد بيانات اعتماد جديدة.
*   **أوقات الاستقصاء** (Poll Times): حدد **الوضع** (Mode) للاستقصاء لتعيين عدد مرات تشغيل الاستقصاء. سيؤدي اختيارك لـ **الوضع** إلى إضافة أو إزالة الحقول ذات الصلة. ارجع إلى [خيارات وضع الاستقصاء](/integrations/builtin/trigger-nodes/n8n-nodes-base.gmailtrigger/poll-mode-options.md) لتكوين المعاملات لكل نوع وضع.
*   **تبسيط** (Simplify): اختر ما إذا كنت تريد إرجاع نسخة مبسطة من الاستجابة (مفعلة، افتراضي) أو البيانات الخام (معطلة).
    *   تُرجع النسخة المبسطة معرفات رسائل البريد الإلكتروني، والتصنيفات (labels)، ورؤوس البريد الإلكتروني، بما في ذلك: From, To, CC, BCC, و Subject.

## فلاتر العقدة

استخدم هذه الفلاتر لتحسين سلوك العقدة بشكل أكبر:

*   **تضمين البريد العشوائي والمهملات** (Include Spam and Trash): حدد ما إذا كان يجب أن تُحفِّز العقدة على الرسائل الجديدة في مجلدات البريد العشوائي (Spam) والمهملات (Trash) (مفعلة) أم لا (معطلة).
*   **أسماء التصنيفات أو المعرفات** (Label Names or IDs): تُحفِّز فقط على الرسائل التي أُضيفت إليها التصنيفات المحددة. حدد أسماء التصنيفات التي تريد تطبيقها أو أدخل تعبيراً لتحديد المعرفات. تُملأ القائمة المنسدلة بناءً على **بيانات الاعتماد** (Credential) التي حددتها.
*   **بحث** (Search): أدخل فلاتر تحسين البحث في Gmail، مثل `from:`, لتُحفِّز العقدة على الشروط المفلترة فقط. ارجع إلى [تحسين عمليات البحث في Gmail](https://support.google.com/mail/answer/7190?hl=en) لمزيد من المعلومات.
*   **حالة القراءة** (Read Status): اختر ما إذا كنت تريد استلام **رسائل البريد الإلكتروني غير المقروءة والمقروءة** (Unread and read emails)، أو **رسائل البريد الإلكتروني غير المقروءة فقط** (Unread emails only) (افتراضي)، أو **رسائل البريد الإلكتروني المقروءة فقط** (Read emails only).
*   **المرسل** (Sender): أدخل بريداً إلكترونياً أو جزءاً من اسم مرسل لتُحفِّز فقط على الرسائل الواردة من ذلك المرسل.

## الموارد ذات الصلة

توفر n8n عقدة تطبيق لـ Gmail. يمكنك العثور على وثائق العقدة [هنا](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/index.md).

اطلع على [سير العمل الأمثلة والمحتوى ذي الصلة](https://n8n.io/integrations/gmail-trigger/) على موقع n8n الإلكتروني.

ارجع إلى [وثائق Gmail API من Google](https://developers.google.com/gmail/api/guides) للحصول على تفاصيل حول واجهة برمجة التطبيقات الخاصة بهم.

## المشكلات الشائعة

للاستفسارات أو المشكلات الشائعة والحلول المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/trigger-nodes/n8n-nodes-base.gmailtrigger/common-issues.md).

---

# المشكلات الشائعة لعقدة مُحفِّز Gmail

فيما يلي بعض الأخطاء والمشكلات الشائعة المتعلقة بـ [عقدة مُحفِّز Gmail](/integrations/builtin/trigger-nodes/n8n-nodes-base.gmailtrigger/index.md) وخطوات حلها أو استكشافها.

## خطأ 401 غير مصرح به

النص الكامل للخطأ يبدو كالتالي:
<!--vale off-->
```
401 - {"error":"unauthorized_client","error_description":"Client is unauthorized to retrieve access tokens using this method, or client not authorized for any of the scopes requested."}
```
<!--vale on-->

يحدث هذا الخطأ عندما تكون هناك مشكلة في بيانات الاعتماد التي تستخدمها ونطاقاتها أو أذوناتها.

لحل المشكلة:

1.  بالنسبة لـ [بيانات اعتماد OAuth2](/integrations/builtin/credentials/google/oauth-single-service.md)، تأكد من تمكين Gmail API في **APIs & Services > Library**. ارجع إلى [Google OAuth2 Single Service - تمكين واجهات برمجة التطبيقات](/integrations/builtin/credentials/google/oauth-single-service.md#enable-apis) لمزيد من المعلومات.
2.  بالنسبة لـ [بيانات اعتماد حساب الخدمة](/integrations/builtin/credentials/google/service-account.md):
    1.  [قم بتمكين التفويض على مستوى النطاق](/integrations/builtin/credentials/google/service-account.md#enable-domain-wide-delegation).
    2.  تأكد من إضافة Gmail API كجزء من تهيئة التفويض على مستوى النطاق.

---

# خيارات وضع الاستقصاء لعقدة مُحفِّز Gmail

استخدم المعامل **Poll Time** الخاص بـ [عقدة مُحفِّز Gmail](/integrations/builtin/trigger-nodes/n8n-nodes-base.gmailtrigger/index.md) لتعيين عدد مرات تشغيل الاستقصاء. سيؤدي اختيارك لـ **Mode** إلى إضافة أو إزالة الحقول ذات الصلة.

## خيارات وضع الاستقصاء

راجع الأقسام أدناه للحصول على تفاصيل حول استخدام كل **وضع**.

--8<-- "_snippets/integrations/builtin/poll-modes.md"