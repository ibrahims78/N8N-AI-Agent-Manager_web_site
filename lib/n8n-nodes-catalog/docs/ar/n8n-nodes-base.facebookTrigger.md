# عقدة Facebook Trigger

[فيسبوك (Facebook)](https://www.facebook.com/) هو موقع للتواصل الاجتماعي يهدف إلى الربط والمشاركة مع العائلة والأصدقاء عبر الإنترنت.

استخدم عقدة Facebook Trigger (المُحفِّز) لتشغيل سير عمل عند وقوع أحداث في فيسبوك.

> **بيانات الاعتماد**
>
> يمكن العثور على معلومات المصادقة لهذه العقدة [هنا](/integrations/builtin/credentials/facebookapp.md).

> **أمثلة وقوالب**
>
> للحصول على أمثلة استخدام وقوالب لمساعدتك على البدء، ارجع إلى صفحة [تكاملات Facebook Trigger](https://n8n.io/integrations/facebook-trigger/) الخاصة بـ n8n.

## الكائنات

-   [**Ad Account**](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/ad-account.md): احصل على تحديثات لتغييرات إعلانات معينة.
-   [**Application**](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/application.md): احصل على التحديثات المرسلة إلى التطبيق.
-   [**Certificate Transparency**](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/certificate-transparency.md): احصل على تحديثات عند إنشاء شهادات أمان جديدة لنطاقاتك المشتركة، بما في ذلك الشهادات الجديدة ومحاولات التصيد الاحتيالي المحتملة.
-   النشاط والأحداث في [**Group**](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/group.md).
-   [**Instagram**](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/instagram.md): احصل على تحديثات عندما يعلق شخص ما على كائنات الوسائط الخاصة بمستخدمي تطبيقك؛ أو يذكر مستخدمي تطبيقك (@mentions)؛ أو عندما تنتهي صلاحية قصص مستخدمي تطبيقك.
-   [**Link**](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/link.md): احصل على تحديثات حول الروابط للمعاينة الغنية من قبل مزود خارجي.
-   تحديثات [**Page**](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/page.md).
-   [**Permissions**](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/permissions.md): تحديثات عند منح أو إلغاء الأذونات.
-   تحديثات ملف تعريف [**User**](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/user.md).
-   [**WhatsApp Business Account**](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/whatsapp.md)

    > **استخدم عقدة WhatsApp Trigger**
    >
    > توصي n8n باستخدام [عقدة WhatsApp Trigger](/integrations/builtin/trigger-nodes/n8n-nodes-base.whatsapptrigger.md) مع [بيانات اعتماد WhatsApp](/integrations/builtin/credentials/whatsapp.md) بدلاً من عقدة Facebook Trigger لهذه الأحداث. تحتوي عقدة WhatsApp Trigger على المزيد من الأحداث للاستماع إليها.

-   [**Workplace Security**](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/workplace-security.md)

لكل **كائن (Object)**، استخدم القائمة المنسدلة **Field Names or IDs (أسماء الحقول أو المعرفات)** لتحديد المزيد من التفاصيل حول البيانات التي سيتم استلامها. ارجع إلى الصفحات المرتبطة لمزيد من التفاصيل.

## الموارد ذات الصلة

شاهد [أمثلة سير العمل والمحتوى ذي الصلة](https://n8n.io/integrations/facebook-trigger/) على موقع n8n الإلكتروني.

ارجع إلى [توثيق Graph API](https://developers.facebook.com/docs/graph-api/webhooks/reference) الخاص بـ Meta للحصول على تفاصيل حول واجهة برمجة التطبيقات الخاصة بهم.

---

# كائن Facebook Trigger Ad Account

استخدم هذا الكائن لتلقي التحديثات حول تغييرات إعلانات معينة في حساب إعلاني (Ad Account). ارجع إلى [Facebook Trigger](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/index.md) لمزيد من المعلومات حول المُحفِّز نفسه.

> **بيانات الاعتماد**
> يمكن العثور على معلومات المصادقة لهذه العقدة [هنا](/integrations/builtin/credentials/facebookapp.md).

> **أمثلة وقوالب**
>
> للحصول على أمثلة استخدام وقوالب لمساعدتك على البدء، ارجع إلى صفحة [تكاملات Facebook Trigger](https://n8n.io/integrations/facebook-trigger/) الخاصة بـ n8n.

## تكوين المُحفِّز

لتكوين المُحفِّز باستخدام هذا الكائن:

1.  حدد **بيانات الاعتماد للاتصال بها**. اختر بيانات اعتماد موجودة أو أنشئ بيانات اعتماد جديدة لتطبيق فيسبوك (Facebook App).
2.  أدخل **معرّف التطبيق (APP ID)** للتطبيق المتصل ببيانات الاعتماد الخاصة بك. ارجع إلى توثيق بيانات اعتماد تطبيق فيسبوك (Facebook App) لمزيد من المعلومات.
3.  حدد **حساب إعلاني (Ad Account)** كـ **الكائن**.
4.  **أسماء الحقول أو المعرفات (Field Names or IDs)**: بشكل افتراضي، ستقوم العقدة بتشغيل المُحفِّز على جميع أحداث الحساب الإعلاني المتاحة باستخدام عامل التصفية الشامل `*`. إذا كنت ترغب في تحديد الأحداث، استخدم `X` لإزالة النجمة واستخدم القائمة المنسدلة أو التعبير لتحديد التحديثات التي تهمك. تتضمن الخيارات:
    *   **كائنات إعلانية قيد المعالجة (In Process Ad Objects)**: تُعلمك عندما تخرج حملة أو مجموعة إعلانية أو إعلان من حالة `IN_PROCESS`. ارجع إلى [المعالجة اللاحقة لإنشاء الإعلانات وتعديلها](https://developers.facebook.com/docs/marketing-api/using-the-api/post-processing/) من Meta لمزيد من المعلومات.
    *   **كائنات إعلانية بها مشكلات (With Issues Ad Objects)**: تُعلمك عندما تتلقى حملة أو مجموعة إعلانية أو إعلان ضمن الحساب الإعلاني حالة `WITH_ISSUES`.
5.  في **الخيارات (Options)**، قم بتشغيل مفتاح التبديل لـ **تضمين القيم (Include Values)**. يفشل نوع الكائن هذا بدون تمكين هذا الخيار.

## الموارد ذات الصلة

ارجع إلى [الويب هوكس للحسابات الإعلانية (Webhooks for Ad Accounts)](https://developers.facebook.com/docs/graph-api/webhooks/getting-started/webhooks-for-ad-accounts) ومرجع [الحساب الإعلاني (Ad Account)](https://developers.facebook.com/docs/graph-api/webhooks/reference/ad-account/) Graph API من Meta لمزيد من المعلومات.

---

# كائن تطبيق مُحفِّز فيسبوك (Facebook Trigger Application object)

استخدم هذا الكائن لتلقي التحديثات المرسلة إلى تطبيق معين. ارجع إلى [مُحفِّز فيسبوك (Facebook Trigger)](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/index.md) لمزيد من المعلومات حول المُحفِّز نفسه.

> **بيانات الاعتماد**
>
> يمكنك العثور على معلومات المصادقة لهذه العقدة [هنا](/integrations/builtin/credentials/facebookapp.md).

> **أمثلة وقوالب**
>
> للحصول على أمثلة استخدام وقوالب لمساعدتك على البدء، ارجع إلى صفحة [تكاملات مُحفِّز فيسبوك (Facebook Trigger)](https://n8n.io/integrations/facebook-trigger/) الخاصة بـ n8n.

## إعداد المُحفِّز

لإعداد المُحفِّز باستخدام هذا الكائن:

1.  حدد **بيانات الاعتماد** للاتصال بها. اختر بيانات اعتماد موجودة أو أنشئ [بيانات اعتماد تطبيق فيسبوك](/integrations/builtin/credentials/facebookapp.md) جديدة.
2.  أدخل **APP ID** (معرّف التطبيق) الخاص بالتطبيق المتصل ببيانات الاعتماد الخاصة بك. ارجع إلى وثائق [بيانات اعتماد تطبيق فيسبوك](/integrations/builtin/credentials/facebookapp.md) لمزيد من المعلومات.
3.  حدد **Application** (التطبيق) كـ **الكائن**.
4.  **أسماء الحقول أو المعرّفات**: بشكل افتراضي، ستقوم العقدة بتشغيل جميع الأحداث المتاحة باستخدام مرشح الأحرف البديلة `*`. إذا كنت ترغب في تحديد الأحداث، استخدم `X` لإزالة النجمة واستخدم القائمة المنسدلة أو التعبير لتحديد التحديثات التي تهتم بها. تتضمن الخيارات:
    *   **Add Account**
    *   **Ads Rules Engine**
    *   **Async Requests**
    *   **Async Sessions**
    *   **Group Install**
    *   **Oe Reseller Onboarding Request Created**
    *   **Plugin Comment**
    *   **Plugin Comment Reply**
5.  في **الخيارات**، قم بتشغيل المفتاح التبديلي لـ **Include Values** (تضمين القيم). يفشل نوع الكائن هذا بدون تمكين هذا الخيار.

## الموارد ذات الصلة

ارجع إلى مرجع Graph API الخاص بـ Meta لـ [Application](https://developers.facebook.com/docs/graph-api/webhooks/reference/application/) لمزيد من المعلومات.

---

# كائن شفافية الشهادة (Certificate Transparency) لمُحفِّز فيسبوك

استخدم هذا الكائن لتلقي تحديثات حول الشهادات الصادرة حديثًا لأي نطاقات اشتركت فيها لتنبيهات الشهادات أو تنبيهات التصيد الاحتيالي. ارجع إلى [مُحفِّز فيسبوك (Facebook Trigger)](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/index.md) لمزيد من المعلومات حول المُحفِّز نفسه.

> **بيانات الاعتماد**
>
> يمكنك العثور على معلومات المصادقة لهذه العقدة [هنا](/integrations/builtin/credentials/facebookapp.md).

> **أمثلة وقوالب**
>
> لأمثلة الاستخدام والقوالب لمساعدتك على البدء، ارجع إلى صفحة [تكاملات مُحفِّز فيسبوك (Facebook Trigger)](https://n8n.io/integrations/facebook-trigger/) الخاصة بـ n8n.

## إعداد المُحفِّز

لإعداد المُحفِّز باستخدام هذا الكائن:

1.  حدد **بيانات الاعتماد** للاتصال بها. اختر بيانات اعتماد موجودة أو أنشئ [بيانات اعتماد تطبيق فيسبوك](/integrations/builtin/credentials/facebookapp.md) جديدة.
2.  أدخل **APP ID** (معرّف التطبيق) الخاص بالتطبيق المتصل ببيانات الاعتماد الخاصة بك. ارجع إلى وثائق [بيانات اعتماد تطبيق فيسبوك](/integrations/builtin/credentials/facebookapp.md) لمزيد من المعلومات.
3.  حدد **Certificate Transparency** (شفافية الشهادة) كـ **الكائن**.
4.  **أسماء الحقول أو المعرّفات**: بشكل افتراضي، ستقوم العقدة بتشغيل جميع الأحداث المتاحة باستخدام مرشح الأحرف البديلة `*`. إذا كنت ترغب في تحديد الأحداث، استخدم `X` لإزالة النجمة واستخدم القائمة المنسدلة أو التعبير لتحديد التحديثات التي تهتم بها. تتضمن الخيارات:
    *   **Certificate** (الشهادة): يُعلمك عندما يُصدر شخص ما شهادة جديدة لنطاقاتك المشترك بها. ستحتاج إلى الاشتراك بنطاقك لتنبيهات الشهادات.
    *   **Phishing** (التصيد الاحتيالي): يُعلمك عندما يُصدر شخص ما شهادة جديدة قد تكون تصيدًا احتياليًا لأحد نطاقاتك المشروعة المشترك بها.
5.  في **الخيارات**، قم بتشغيل المفتاح التبديلي لـ **Include Values** (تضمين القيم). يفشل نوع الكائن هذا بدون تمكين هذا الخيار.

لهذه التنبيهات، ستحتاج إلى الاشتراك بنطاقك في التنبيهات ذات الصلة:

*   ارجع إلى [تنبيهات الشهادات (Certificate Alerts)](https://developers.facebook.com/docs/certificate-transparency-api#certificate-alerts-subscribing) لاشتراكات تنبيهات الشهادات.
*   ارجع إلى [تنبيهات التصيد الاحتيالي (Phishing Alerts)](https://developers.facebook.com/docs/certificate-transparency-api#phishing-alerts-subscribing) لاشتراكات تنبيهات التصيد الاحتيالي.

## الموارد ذات الصلة

ارجع إلى [ويب هوكس لشفافية الشهادات (Webhooks for Certificate Transparency)](https://developers.facebook.com/docs/graph-api/webhooks/getting-started/webhooks-for-certificate-transparency) ومرجع Meta لـ [شفافية الشهادات (Certificate Transparency)](https://developers.facebook.com/docs/graph-api/webhooks/reference/certificate-transparency/) Graph API لمزيد من المعلومات.

---

# كائن مجموعة مُحفِّز Facebook

استخدم هذا الكائن لتلقي التحديثات حول الأنشطة والأحداث في مجموعة. ارجع إلى [مُحفِّز Facebook](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/index.md) لمزيد من المعلومات حول المُحفِّز نفسه.

> **بيانات الاعتماد**
>
> يمكن العثور على معلومات المصادقة لهذه العقدة [هنا](/integrations/builtin/credentials/facebookapp.md).

> **أمثلة وقوالب**
>
> للحصول على أمثلة استخدام وقوالب لمساعدتك على البدء، ارجع إلى صفحة [تكاملات مُحفِّز Facebook](https://n8n.io/integrations/facebook-trigger/) الخاصة بـ n8n.

## إعداد المُحفِّز

لإعداد المُحفِّز باستخدام هذا الكائن:

1.  حدد **بيانات الاعتماد للاتصال بها**. حدد بيانات اعتماد [تطبيق Facebook](/integrations/builtin/credentials/facebookapp.md) موجودة أو أنشئ بيانات اعتماد جديدة.
2.  أدخل **معرّف التطبيق (APP ID)** الخاص بالتطبيق المتصل ببيانات الاعتماد الخاصة بك. ارجع إلى توثيق [بيانات اعتماد تطبيق Facebook](/integrations/builtin/credentials/facebookapp.md) لمزيد من المعلومات.
3.  حدد **Group** كـ **الكائن**.
4.  **أسماء الحقول أو المعرفات**: بشكل افتراضي، ستقوم العقدة (Node) بالتحفيز على جميع الأحداث المتاحة باستخدام عامل التصفية `*` (wildcard). إذا كنت ترغب في تحديد الأحداث، استخدم `X` لإزالة النجمة واستخدم القائمة المنسدلة أو تعبيرًا (expression) لتحديد التحديثات التي تهتم بها.
5.  في **الخيارات (Options)**، قم بتشغيل مفتاح التبديل لـ **تضمين القيم (Include Values)**. يفشل نوع الكائن هذا بدون تمكين هذا الخيار.

## الموارد ذات الصلة

ارجع إلى مرجع [Groups](https://developers.facebook.com/docs/workplace/reference/webhooks/#groups) Workplace API الخاص بـ Meta لمزيد من المعلومات.

---

# كائن Instagram لمُحفِّز Facebook

استخدم هذا الكائن لتلقي التحديثات عندما يعلق شخص ما على كائنات الوسائط (Media objects) الخاصة بمستخدمي تطبيقك؛ أو يذكر (@mentions) مستخدمي تطبيقك؛ أو عندما تنتهي صلاحية قصص (Stories) مستخدمي تطبيقك. ارجع إلى [مُحفِّز Facebook](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/index.md) لمزيد من المعلومات حول المُحفِّز نفسه.

> **بيانات الاعتماد**
>
> يمكن العثور على معلومات المصادقة لهذه العقدة [هنا](/integrations/builtin/credentials/facebookapp.md).

> **أمثلة وقوالب**
>
> للحصول على أمثلة استخدام وقوالب لمساعدتك على البدء، ارجع إلى صفحة [تكاملات مُحفِّز Facebook](https://n8n.io/integrations/facebook-trigger/) الخاصة بـ n8n.

## إعداد المُحفِّز

لإعداد المُحفِّز باستخدام هذا الكائن:

1.  حدد **بيانات الاعتماد للاتصال بها**. حدد بيانات اعتماد [تطبيق Facebook] (Facebook App) موجودة أو أنشئ بيانات اعتماد جديدة.
2.  أدخل **APP ID** للتطبيق المتصل ببيانات الاعتماد الخاصة بك. ارجع إلى توثيق [بيانات اعتماد تطبيق Facebook] (Facebook App credential) لمزيد من المعلومات.
3.  حدد **Instagram** كـ **الكائن**.
4.  **أسماء الحقول أو المعرفات**: بشكل افتراضي، ستقوم العقدة بتشغيل جميع الأحداث المتاحة باستخدام عامل التصفية `*` (wildcard). إذا كنت ترغب في تحديد الأحداث، استخدم `X` لإزالة النجمة واستخدم القائمة المنسدلة أو التعبير لتحديد التحديثات التي تهتم بها. تتضمن الخيارات:
    *   **التعليقات** (Comments): تُعلمك عندما يعلق أي شخص على وسائط Instagram (IG Media) مملوكة لمستخدم Instagram الخاص بتطبيقك.
    *   **تسليم الرسائل** (Messaging Handover)
    *   **الإشارات** (Mentions): تُعلمك عندما يقوم مستخدم Instagram بـ @إشارة إلى حساب تجاري أو منشئ محتوى على Instagram في تعليق أو وصف.
    *   **الرسائل** (Messages): تُعلمك عندما يرسل أي شخص رسالة إلى مستخدم Instagram الخاص بتطبيقك.
    *   **الرسائل المشاهدة** (Messaging Seen): تُعلمك عندما يرى شخص ما رسالة أرسلها مستخدم Instagram الخاص بتطبيقك.
    *   **وضع الاستعداد** (Standby)
    *   **رؤى القصص** (Story Insights): تُعلمك بعد ساعة واحدة من انتهاء صلاحية القصة بمقاييس تصف التفاعلات على القصة.
5.  في **الخيارات** (Options)، قم بتشغيل مفتاح التبديل لـ **تضمين القيم** (Include Values). يفشل نوع الكائن هذا بدون تمكين هذا الخيار.

## الموارد ذات الصلة

ارجع إلى [الويب هوكس لـ Instagram] (Webhooks for Instagram) ومرجع [Instagram] (Instagram) Graph API الخاص بـ Meta لمزيد من المعلومات.

---

# كائن رابط مُحفِّز Facebook

استخدم هذا الكائن لتلقي التحديثات حول الروابط للمعاينة الغنية من قبل مزود خارجي. ارجع إلى [مُحفِّز Facebook] (Facebook Trigger) لمزيد من المعلومات حول المُحفِّز نفسه.

> **بيانات الاعتماد**
>
> يمكنك العثور على معلومات المصادقة لهذه العقدة [هنا](/integrations/builtin/credentials/facebookapp.md).

> **أمثلة وقوالب**
>
> للحصول على أمثلة استخدام وقوالب لمساعدتك على البدء، ارجع إلى صفحة [تكاملات مُحفِّز Facebook] (Facebook Trigger integrations) الخاصة بـ n8n.

## تهيئة المُحفِّز

لتهيئة المُحفِّز باستخدام هذا الكائن:

1.  اختر **بيانات الاعتماد للاتصال بها**. اختر بيانات اعتماد تطبيق Facebook موجودة أو أنشئ بيانات اعتماد جديدة.
2.  أدخل **معرّف التطبيق (APP ID)** الخاص بالتطبيق المتصل ببيانات الاعتماد الخاصة بك. ارجع إلى توثيق [بيانات اعتماد تطبيق Facebook](/integrations/builtin/credentials/facebookapp.md) لمزيد من المعلومات.
3.  اختر **Link** كـ **الكائن**.
4.  **أسماء الحقول أو المعرّفات**: بشكل افتراضي، ستقوم العقدة (Node) بتشغيل المُحفِّز على جميع الأحداث المتاحة باستخدام عامل التصفية `*` (wildcard). إذا كنت ترغب في تحديد الأحداث، استخدم `X` لإزالة النجمة واستخدم القائمة المنسدلة أو تعبيرًا (Expression) لتحديد التحديثات التي تهتم بها.
5.  في **الخيارات (Options)**، قم بتشغيل مفتاح التبديل لـ **تضمين القيم (Include Values)**. يفشل نوع الكائن هذا بدون تمكين هذا الخيار.

## الموارد ذات الصلة

ارجع إلى مرجع [Links](https://developers.facebook.com/docs/workplace/reference/webhooks/#links) Workplace API الخاص بـ Meta لمزيد من المعلومات.

---

# كائن صفحة مُحفِّز Facebook

استخدم هذا الكائن لتلقي التحديثات عند حدوث تحديثات لحقول ملف تعريف صفحتك أو إعدادات ملف التعريف أو عندما يذكر شخص ما صفحتك. ارجع إلى [مُحفِّز Facebook](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/index.md) لمزيد من المعلومات حول المُحفِّز نفسه.

> **بيانات الاعتماد**
>
> يمكنك العثور على معلومات المصادقة (Authentication) لهذه العقدة (Node) [هنا](/integrations/builtin/credentials/facebookapp.md).

> **أمثلة وقوالب**
>
> للحصول على أمثلة استخدام وقوالب (Templates) لمساعدتك على البدء، ارجع إلى صفحة [تكاملات (Integrations) مُحفِّز Facebook](https://n8n.io/integrations/facebook-trigger/) الخاصة بـ n8n.

## المتطلبات المسبقة

يتطلب هذا الكائن بعض التهيئة في تطبيقك وصفحتك قبل أن تتمكن من استخدام المُحفِّز:

1.  يحتاج مسؤول صفحة واحد على الأقل إلى منح إذن `manage_pages` لتطبيقك.
2.  يحتاج مسؤول الصفحة إلى امتلاك صلاحيات مشرف (moderator) على الأقل. إذا لم يكن لديهم ذلك، فلن يتلقوا كل المحتوى.
3.  ستحتاج أيضًا إلى إضافة التطبيق إلى صفحتك، وقد تحتاج إلى الانتقال إلى [مستكشف Graph API](https://developers.facebook.com/tools/explorer/) وتنفيذ هذه الاستدعاء باستخدام رمز التطبيق الخاص بك:

    ```
    {page-id}/subscribed_apps?subscribed_fields=feed
    ```

## تكوين المُحفِّز

لتكوين المُحفِّز باستخدام هذا الكائن:

1.  اختر **بيانات الاعتماد (Credential)** للاتصال. اختر بيانات اعتماد موجودة أو أنشئ بيانات اعتماد جديدة لتطبيق فيسبوك (Facebook App) [Facebook App credential](/integrations/builtin/credentials/facebookapp.md).
2.  أدخل **APP ID** (معرّف التطبيق) الخاص بالتطبيق المتصل ببيانات الاعتماد الخاصة بك. ارجع إلى توثيق بيانات اعتماد تطبيق فيسبوك (Facebook App) [Facebook App credential](/integrations/builtin/credentials/facebookapp.md) لمزيد من المعلومات.
3.  اختر **صفحة (Page)** كـ **كائن (Object)**.
4.  **أسماء الحقول أو المعرّفات (Field Names or IDs)**: بشكل افتراضي، ستقوم العقدة (Node) بتشغيل المُحفِّز على جميع الأحداث المتاحة باستخدام عامل التصفية `*` (wildcard). إذا كنت ترغب في تحديد الأحداث، استخدم `X` لإزالة النجمة واستخدم القائمة المنسدلة أو تعبير (Expression) لتحديد التحديثات التي تهتم بها. تتضمن الخيارات حقول الملف الشخصي الفردية، بالإضافة إلى:
    *   **الموجز (Feed)**: يصف معظم التغييرات التي تطرأ على موجز الصفحة، بما في ذلك المنشورات والإعجابات والمشاركات وما إلى ذلك.
    *   **توليد العملاء المحتملين (Leadgen)**: يُعلمك عندما تتغير إعدادات توليد العملاء المحتملين للصفحة.
    *   **مقاطع الفيديو المباشرة (Live Videos)**: يُعلمك عندما تتغير حالة الفيديو المباشر للصفحة.
    *   **الإشارة (Mention)**: يُعلمك عندما تحدث إشارات جديدة في الصفحات والتعليقات وما إلى ذلك.
    *   **مراجعة التاجر (Merchant Review)**: يُعلمك عندما تتغير إعدادات مراجعة التاجر للصفحة.
    *   **اقتراح تغيير الصفحة (Page Change Proposal)**: يُعلمك عندما يقترح فيسبوك تغييرات مقترحة لصفحتك على فيسبوك.
    *   **تغيير الصفحة القادم (Page Upcoming Change)**: يُعلمك بالتغييرات القادمة التي ستحدث على صفحتك على فيسبوك. اقترح فيسبوك هذه التغييرات وقد يكون لها موعد نهائي للقبول أو الرفض قبل أن تصبح سارية المفعول تلقائيًا.
    *   **مراجعة المنتج (Product Review)**: يُعلمك عندما تتغير إعدادات مراجعة المنتج للصفحة.
    *   **التقييمات (Ratings)**: يُعلمك عندما تتغير تقييمات الصفحة، بما في ذلك التقييمات الجديدة أو عندما يعلق مستخدم على تقييم أو يتفاعل معه.
    *   **مقاطع الفيديو (Videos)**: يُعلمك عندما تتغير حالة ترميز الفيديو على الصفحة.
5.  في **الخيارات (Options)**، قم بتشغيل مفتاح التبديل لـ **تضمين القيم (Include Values)**. يفشل نوع الكائن هذا بدون تمكين هذا الخيار.

## الموارد ذات الصلة

ارجع إلى [Webhooks for Pages](https://developers.facebook.com/docs/graph-api/webhooks/getting-started/webhooks-for-pages) ومرجع [Page](https://developers.facebook.com/docs/graph-api/webhooks/reference/page/) Graph API الخاص بـ Meta لمزيد من المعلومات.

---

# كائن أذونات مُحفِّز Facebook (Facebook Trigger Permissions object)

استخدم هذا الكائن لتلقي التحديثات عندما يمنح مستخدم أو يلغي إذنًا لتطبيقك. ارجع إلى [Facebook Trigger](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/index.md) لمزيد من المعلومات حول المُحفِّز نفسه.

> **بيانات الاعتماد**
>
> يمكنك العثور على معلومات المصادقة لهذه العقدة [هنا](/integrations/builtin/credentials/facebookapp.md).

> **أمثلة وقوالب**
>
> للاطلاع على أمثلة الاستخدام والقوالب لمساعدتك على البدء، ارجع إلى صفحة [تكاملات Facebook Trigger](https://n8n.io/integrations/facebook-trigger/) الخاصة بـ n8n.

## إعدادات المُحفِّز

لتكوين المُحفِّز باستخدام هذا الكائن:

1.  حدد **بيانات الاعتماد للاتصال بها**. حدد بيانات اعتماد [تطبيق Facebook](/integrations/builtin/credentials/facebookapp.md) موجودة أو أنشئ بيانات اعتماد جديدة.
2.  أدخل **معرّف التطبيق (APP ID)** الخاص بالتطبيق المتصل ببيانات الاعتماد الخاصة بك. ارجع إلى وثائق [بيانات اعتماد تطبيق Facebook](/integrations/builtin/credentials/facebookapp.md) لمزيد من المعلومات.
3.  حدد **الأذونات (Permissions)** كـ **كائن (Object)**.
4.  **أسماء الحقول أو المعرفات (Field Names or IDs)**: بشكل افتراضي، ستقوم العقدة بتشغيل المُحفِّز على جميع الأحداث المتاحة باستخدام عامل التصفية `*` (wildcard). إذا كنت ترغب في تحديد الأحداث، استخدم `X` لإزالة النجمة واستخدم القائمة المنسدلة أو تعبيرًا لتحديد التحديثات التي تهتم بها.
5.  في **الخيارات (Options)**، اختر ما إذا كنت تريد تشغيل مفتاح التبديل **تضمين القيم (Include Values)**. عند تشغيله، تتضمن العقدة القيم الجديدة للتغييرات.

## الموارد ذات الصلة

ارجع إلى مرجع [Permissions](https://developers.facebook.com/docs/graph-api/webhooks/reference/permissions/) Graph API الخاص بـ Meta لمزيد من المعلومات.

---

# كائن مستخدم مُحفِّز Facebook (Facebook Trigger User object)

استخدم هذا الكائن لتلقي التحديثات عند حدوث تغييرات في ملف تعريف المستخدم. ارجع إلى [Facebook Trigger](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/index.md) لمزيد من المعلومات حول المُحفِّز نفسه.

> **بيانات الاعتماد**
>
> يمكنك العثور على معلومات المصادقة لهذه العقدة [هنا](/integrations/builtin/credentials/facebookapp.md).

> **أمثلة وقوالب**
>
> للاطلاع على أمثلة الاستخدام والقوالب لمساعدتك على البدء، ارجع إلى صفحة [تكاملات Facebook Trigger](https://n8n.io/integrations/facebook-trigger/) الخاصة بـ n8n.

## تكوين المُحفِّز

لتكوين المُحفِّز باستخدام هذا الكائن:

1.  حدد **بيانات الاعتماد للاتصال بها**. حدد بيانات اعتماد تطبيق Facebook موجودة أو أنشئ بيانات اعتماد جديدة.
2.  أدخل **معرّف التطبيق (APP ID)** الخاص بالتطبيق المتصل ببيانات الاعتماد الخاصة بك. ارجع إلى وثائق بيانات اعتماد تطبيق Facebook لمزيد من المعلومات.
3.  حدد **المستخدم (User)** كـ **الكائن (Object)**.
4.  **أسماء الحقول أو المعرّفات (Field Names or IDs)**: بشكل افتراضي، ستقوم العقدة بتشغيل جميع الأحداث المتاحة باستخدام عامل التصفية الشامل `*`. إذا كنت ترغب في تحديد الأحداث، استخدم `X` لإزالة النجمة واستخدم القائمة المنسدلة أو التعبير لتحديد التحديثات التي تهتم بها.
5.  في **الخيارات (Options)**، اختر ما إذا كنت تريد تشغيل مفتاح التبديل لـ **تضمين القيم (Include Values)**. عند تشغيله، تتضمن العقدة القيم الجديدة للتغييرات.

## الموارد ذات الصلة

ارجع إلى مرجع واجهة برمجة تطبيقات Graph الخاص بـ Meta لـ [المستخدم (User)](https://developers.facebook.com/docs/graph-api/webhooks/reference/user/) لمزيد من المعلومات.

---

# كائن حساب واتساب التجاري لمُحفِّز Facebook

استخدم هذا الكائن لتلقي التحديثات عند تغيير حسابك التجاري على واتساب (WABA). ارجع إلى [مُحفِّز Facebook](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/index.md) لمزيد من المعلومات حول المُحفِّز نفسه.

> **استخدم مُحفِّز واتساب**
>
> توصي n8n باستخدام [عقدة مُحفِّز واتساب](/integrations/builtin/trigger-nodes/n8n-nodes-base.whatsapptrigger.md) مع [بيانات اعتماد واتساب](/integrations/builtin/credentials/whatsapp.md) بدلاً من عقدة مُحفِّز Facebook. تتضمن عقدة المُحفِّز هذه ضعف عدد الأحداث للاشتراك فيها.

> **بيانات الاعتماد**
>
> يمكنك العثور على معلومات المصادقة لهذه العقدة [هنا](/integrations/builtin/credentials/facebookapp.md).

> **أمثلة وقوالب**
>
> للحصول على أمثلة الاستخدام والقوالب لمساعدتك على البدء، ارجع إلى صفحة [تكاملات مُحفِّز Facebook](https://n8n.io/integrations/facebook-trigger/) الخاصة بـ n8n.

## المتطلبات المسبقة

يتطلب هذا الكائن بعض التكوين في تطبيقك وحساب واتساب الخاص بك قبل أن تتمكن من استخدام المُحفِّز:

1.  اشترك بتطبيقك ضمن حسابك التجاري على واتساب. يجب عليك الاشتراك بتطبيق مملوك لعملك. لا يمكن للتطبيقات المشتركة مع عملك تلقي إشعارات الويب هوك.
2.  إذا كنت تعمل كشريك حلول، فتأكد من أن تطبيقك قد أكمل مراجعة التطبيق (App Review) وطلب إذن `whatsapp_business_management`.

## إعدادات المُحفِّز

لتهيئة المُحفِّز باستخدام هذا الكائن:

1.  حدد **بيانات الاعتماد للاتصال بها**. حدد بيانات اعتماد [تطبيق Facebook](/integrations/builtin/credentials/facebookapp.md) موجودة أو أنشئ بيانات اعتماد جديدة.
2.  أدخل **معرّف التطبيق (APP ID)** للتطبيق المتصل ببيانات الاعتماد الخاصة بك. ارجع إلى توثيق [بيانات اعتماد تطبيق Facebook](/integrations/builtin/credentials/facebookapp.md) لمزيد من المعلومات.
3.  حدد **حساب واتساب للأعمال (WhatsApp Business Account)** كـ **الكائن**.
4.  **أسماء الحقول أو المعرّفات (IDs)**: بشكل افتراضي، ستقوم العقدة بالتحفيز على جميع الأحداث المتاحة باستخدام عامل تصفية الأحرف البديلة `*`. إذا كنت ترغب في تحديد الأحداث، استخدم `X` لإزالة النجمة واستخدم القائمة المنسدلة أو التعبير لتحديد التحديثات التي تهتم بها. تتضمن الخيارات:
    *   **تحديث حالة قالب الرسالة**
    *   **تحديث اسم رقم الهاتف**
    *   **تحديث جودة رقم الهاتف**
    *   **تحديث مراجعة الحساب**
    *   **تحديث الحساب**
5.  في **الخيارات (Options)**، قم بتشغيل مفتاح التبديل لـ **تضمين القيم (Include Values)**. يفشل نوع الكائن هذا بدون تمكين هذا الخيار.

ارجع إلى [الويب هوكس لحسابات واتساب للأعمال](https://developers.facebook.com/docs/graph-api/webhooks/getting-started/webhooks-for-whatsapp) ومرجع [حساب واتساب للأعمال](https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account/) الخاص بـ Meta Graph API لمزيد من المعلومات.

---

# كائن أمان مكان العمل (Workplace Security) لمُحفِّز Facebook

استخدم هذا الكائن لتلقي التحديثات عند وقوع أحداث أمان مكان العمل (Workplace)، مثل إضافة أو إزالة المسؤولين، وانضمام المستخدمين إلى مكان عمل أو مغادرتهم، والمزيد. ارجع إلى [مُحفِّز Facebook](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/index.md) لمزيد من المعلومات حول المُحفِّز نفسه.

> **بيانات الاعتماد**
>
> يمكنك العثور على معلومات المصادقة لهذه العقدة [هنا](/integrations/builtin/credentials/facebookapp.md).

> **أمثلة وقوالب**
>
> للحصول على أمثلة استخدام وقوالب لمساعدتك على البدء، ارجع إلى صفحة [تكاملات مُحفِّز Facebook](https://n8n.io/integrations/facebook-trigger/) الخاصة بـ n8n.

## إعدادات المُحفِّز

لتهيئة المُحفِّز باستخدام هذا الكائن:

1.  حدد **بيانات الاعتماد للاتصال بها**. حدد بيانات اعتماد [تطبيق Facebook](/integrations/builtin/credentials/facebookapp.md) موجودة أو أنشئ بيانات اعتماد جديدة.
2.  أدخل **معرّف التطبيق (APP ID)** للتطبيق المتصل ببيانات الاعتماد الخاصة بك. ارجع إلى توثيق [بيانات اعتماد تطبيق Facebook](/integrations/builtin/credentials/facebookapp.md) لمزيد من المعلومات.
3.  حدد **أمان مكان العمل (Workplace Security)** كـ **الكائن**.
4.  **أسماء الحقول أو المعرّفات (IDs)**: بشكل افتراضي، ستقوم العقدة بالتحفيز على جميع الأحداث المتاحة باستخدام عامل تصفية الأحرف البديلة `*`. إذا كنت ترغب في تحديد الأحداث، استخدم `X` لإزالة النجمة واستخدم القائمة المنسدلة أو التعبير لتحديد التحديثات التي تهتم بها.
5.  في **الخيارات (Options)**، قم بتشغيل مفتاح التبديل لـ **تضمين القيم (Include Values)**. يفشل نوع الكائن هذا بدون تمكين هذا الخيار.

## الموارد ذات الصلة

راجع مرجع API الخاص بـ Workplace من Meta حول [الأمان](https://developers.facebook.com/docs/workplace/reference/webhooks/#security) لمزيد من المعلومات.