# عقدة Google Drive

استخدم عقدة Google Drive لأتمتة سير العمل في Google Drive، ودمج Google Drive مع التطبيقات الأخرى. تدعم n8n مجموعة واسعة من ميزات Google Drive بشكل مدمج، بما في ذلك إنشاء، وتحديث، وسرد، وحذف، والحصول على محركات الأقراص، والملفات، والمجلدات.

في هذه الصفحة، ستجد قائمة بالعمليات التي تدعمها عقدة Google Drive وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد Google Drive](/integrations/builtin/credentials/google/index.md) للحصول على إرشادات حول إعداد المصادقة.

## العمليات

*   **الملف**
    *   [**نسخ**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/file-operations.md#copy-a-file) ملفًا
    *   [**إنشاء من نص**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/file-operations.md#create-from-text)
    *   [**حذف**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/file-operations.md#delete-a-file) ملفًا
    *   [**تنزيل**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/file-operations.md#download-a-file) ملفًا
    *   [**نقل**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/file-operations.md#move-a-file) ملفًا
    *   [**مشاركة**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/file-operations.md#share-a-file) ملفًا
    *   [**تحديث**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/file-operations.md#update-a-file) ملفًا
    *   [**رفع**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/file-operations.md#upload-a-file) ملفًا
*   **ملف/مجلد**
    *   [**بحث**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/file-folder-operations.md#search-files-and-folders) عن الملفات والمجلدات
*   **المجلد**
    *   [**إنشاء**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/folder-operations.md#create-a-folder) مجلدًا
    *   [**حذف**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/folder-operations.md#delete-a-folder) مجلدًا
    *   [**مشاركة**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/folder-operations.md#share-a-folder) مجلدًا
*   **محرك الأقراص المشترك**
    *   [**إنشاء**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/shared-drive-operations.md#create-a-shared-drive) محرك أقراص مشترك
    *   [**حذف**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/shared-drive-operations.md#delete-a-shared-drive) محرك أقراص مشترك
    *   [**الحصول على**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/shared-drive-operations.md#get-a-shared-drive) محرك أقراص مشترك
    *   [**الحصول على العديد**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/shared-drive-operations.md#get-many-shared-drives) من محركات الأقراص المشتركة
    *   [**تحديث**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/shared-drive-operations.md#update-a-shared-drive) محرك أقراص مشترك

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## المشكلات الشائعة

للأسئلة أو المشكلات الشائعة والحلول المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/common-issues.md).

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في تنفيذها، يمكنك استخدام [عقدة طلب HTTP](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء واجهة برمجة تطبيقات الخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة طلب HTTP:

1.  في عقدة طلب HTTP، حدد **Authentication** > **Predefined Credential Type**.
2.  حدد الخدمة التي ترغب في الاتصال بها.
3.  حدد بيانات الاعتماد الخاصة بك.

ارجع إلى [عمليات API المخصصة](/integrations/custom-operations.md) لمزيد من المعلومات.

---

# المشكلات الشائعة لعقدة Google Drive

فيما يلي بعض الأخطاء والمشكلات الشائعة مع [عقدة Google Drive](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/index.md) وخطوات لحلها أو استكشاف أخطائها وإصلاحها.

## لم تتحقق Google من هذا التطبيق

--8<-- "_snippets/integrations/builtin/credentials/google/unverified-app.md"

## تطبيق Google Cloud يصبح غير مصرح به

--8<-- "_snippets/integrations/builtin/credentials/google/app-becoming-unauthorized.md"

## خطأ OAuth في Google Drive

إذا كنت تستخدم طريقة مصادقة OAuth، قد تظهر لك رسالة خطأ تشير إلى أنك لا تستطيع تسجيل الدخول لأن التطبيق لا يفي بتوقعات Google للحفاظ على أمان التطبيقات.

في أغلب الأحيان، السبب الفعلي لهذه المشكلة هو أن عناوين URL لا تتطابق بين إعدادات OAuth في Google و n8n. لتجنب ذلك، ابدأ بمراجعة أي روابط مضمنة في رسالة خطأ Google. سيحتوي هذا على تفاصيل حول الخطأ الدقيق الذي حدث.

إذا كنت تستضيف n8n ذاتيًا، تحقق من عناصر إعداد n8n المستخدمة لإنشاء عناوين URL خارجية. تحقق من أن متغيرات البيئة [`N8N_EDITOR_BASE_URL`](/hosting/configuration/environment-variables/deployment.md) و [`WEBHOOK_URL`](/hosting/configuration/configuration-examples/webhook-url.md) تستخدم نطاقات مؤهلة بالكامل.

## الحصول على الملفات الحديثة من Google Drive

لاسترداد الملفات الحديثة من Google Drive، تحتاج إلى فرز الملفات حسب وقت التعديل. للقيام بذلك، تحتاج إلى البحث عن الملفات الموجودة واسترداد أوقات تعديلها. بعد ذلك، يمكنك فرز الملفات للعثور على أحدث ملف واستخدام عقدة Google Drive أخرى لاستهداف الملف بواسطة المعرّف (ID).

تبدو العملية كالتالي:

1.  أضف عقدة **Google Drive** (جوجل درايف) إلى لوحة العمل الخاصة بك.
2.  حدد المورد **ملف/مجلد** والعملية **بحث**.
3.  قم بتمكين **إرجاع الكل** لفرز جميع الملفات.
4.  اضبط مرشح **ماذا تبحث عنه** إلى **ملفات**.
5.  في **الخيارات**، اضبط **الحقول** إلى **الكل**.
6.  اربط عقدة **فرز** بمخرجات عقدة Google Drive.
7.  اختر نوع الفرز **بسيط**.
8.  أدخل `modifiedTime` كـ **اسم الحقل** في قسم **الحقول للفرز حسب**.
9.  اختر ترتيب الفرز **تنازلي**.
10. أضف عقدة **تحديد** إلى مخرجات عقدة **فرز**.
11. اضبط **الحد الأقصى للعناصر** إلى **1** للاحتفاظ بأحدث ملف.
12. اربط عقدة Google Drive أخرى بمخرجات عقدة **تحديد**.
13. حدد **ملف** كـ **المورد** والعملية التي تختارها.
14. في تحديد **الملف**، اختر **بواسطة المعرّف (ID)**.
15. حدد **التعبير** وأدخل `` كـ التعبير.