# عقدة Google Drive Trigger

[Google Drive](https://drive.google.com) هي خدمة تخزين ومزامنة للملفات طورتها Google. تسمح للمستخدمين بتخزين الملفات على خوادمهم، ومزامنة الملفات عبر الأجهزة، ومشاركة الملفات.

> **بيانات الاعتماد**
>
> يمكن العثور على معلومات المصادقة لهذه العقدة [هنا](/integrations/builtin/credentials/google/index.md).

> **أمثلة وقوالب**
>
> للحصول على أمثلة استخدام وقوالب لمساعدتك على البدء، ارجع إلى صفحة [تكاملات Google Drive Trigger](https://n8n.io/integrations/google-drive-trigger/) الخاصة بـ n8n.

> **التنفيذ اليدوي مقابل التفعيل**
>
> عند التنفيذ اليدوي، ستُرجع هذه العقدة آخر حدث يطابق معايير البحث الخاصة بها. إذا لم يطابق أي حدث المعايير (على سبيل المثال، لأنك تراقب إنشاء الملفات ولكن لم يتم إنشاء أي ملفات حتى الآن)، فسيتم إلقاء خطأ. بمجرد الحفظ والتفعيل، ستتحقق العقدة بانتظام من أي أحداث مطابقة وستُحفِّز سير العمل الخاص بك لكل حدث يتم العثور عليه.

## مشكلات شائعة

للحصول على الأسئلة أو المشكلات الشائعة والحلول المقترحة، ارجع إلى [مشكلات شائعة](/integrations/builtin/trigger-nodes/n8n-nodes-base.googledrivetrigger/common-issues.md).

---

# مشكلات شائعة في عقدة Google Drive Trigger

فيما يلي بعض الأخطاء والمشكلات الشائعة المتعلقة بـ [عقدة Google Drive Trigger](/integrations/builtin/trigger-nodes/n8n-nodes-base.googledrivetrigger/index.md) وخطوات حلها أو استكشافها.

## خطأ 401 غير مصرح به

النص الكامل للخطأ يبدو كالتالي:
<!--vale off-->
```
401 - {"error":"unauthorized_client","error_description":"Client is unauthorized to retrieve access tokens using this method, or client not authorized for any of the scopes requested."}
```
<!--vale on-->

يحدث هذا الخطأ عندما تكون هناك مشكلة في بيانات الاعتماد التي تستخدمها ونطاقاتها أو أذوناتها.

لحل المشكلة:

1. بالنسبة لبيانات اعتماد [OAuth2](/integrations/builtin/credentials/google/oauth-single-service.md)، تأكد من تمكين Google Drive API في **APIs & Services > Library**. ارجع إلى [Google OAuth2 Single Service - Enable APIs](/integrations/builtin/credentials/google/oauth-single-service.md#enable-apis) لمزيد من المعلومات.
2. بالنسبة لبيانات اعتماد [Service Account](/integrations/builtin/credentials/google/service-account.md):
    1. [قم بتمكين التفويض على مستوى النطاق (domain-wide delegation)](/integrations/builtin/credentials/google/service-account.md#enable-domain-wide-delegation).
    2. تأكد من إضافة Google Drive API كجزء من تهيئة التفويض على مستوى النطاق.

## التعامل مع أكثر من تغيير واحد للملف

تستعلم عقدة Google Drive Trigger من Google Drive عن التغييرات على فترات زمنية محددة (مرة واحدة كل دقيقة افتراضيًا).

إذا حدثت تغييرات متعددة لمعايير **Watch For** خلال فترة الاستعلام، فسيحدث حدث Google Drive Trigger واحد يحتوي على التغييرات كعناصر. للتعامل مع هذا، يجب أن يأخذ سير العمل الخاص بك في الاعتبار الأوقات التي قد تحتوي فيها البيانات على أكثر من عنصر واحد.

يمكنك استخدام [عقدة if](/integrations/builtin/core-nodes/n8n-nodes-base.if.md) أو [عقدة switch](/integrations/builtin/core-nodes/n8n-nodes-base.switch.md) لتغيير سلوك سير العمل الخاص بك اعتمادًا على ما إذا كانت البيانات من عقدة Google Drive Trigger تحتوي على عنصر واحد أو عناصر متعددة.