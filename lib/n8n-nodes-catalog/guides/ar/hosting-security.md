---
title: تأمين n8n
contentType: نظرة عامة
---

# تأمين n8n

يمكن أن يتخذ تأمين نسخة n8n الخاصة بك عدة أشكال.

على مستوى عالٍ، يمكنك:

*   إجراء [تدقيق أمني](/hosting/securing/security-audit.md) لتحديد المخاطر الأمنية.
*   [إعداد SSL](/hosting/securing/set-up-ssl.md) لفرض اتصالات آمنة.
*   [إعداد تسجيل الدخول الموحد](/hosting/securing/set-up-sso.md) لإدارة حسابات المستخدمين.
*   استخدام [المصادقة الثنائية (2FA)](/user-management/two-factor-auth.md) لمستخدميك.

يمكنك أيضًا حماية البيانات الحساسة التي تتم معالجتها بواسطة سير العمل الخاص بك:

*   [حجب بيانات التنفيذ](/workflows/executions/execution-data-redaction.md) لإخفاء بيانات المدخلات والمخرجات من عمليات تنفيذ سير العمل.

بشكل أكثر تفصيلاً، فكر في حظر أو إلغاء الاشتراك في الميزات أو جمع البيانات التي لا ترغب فيها:

*   [تعطيل واجهة برمجة التطبيقات العامة](/hosting/securing/disable-public-api.md) إذا كنت لا تستخدمها.
*   [إلغاء الاشتراك في جمع البيانات](/hosting/securing/telemetry-opt-out.md) للبيانات المجهولة التي يجمعها n8n تلقائيًا.
*   [حظر عقد معينة](/hosting/securing/blocking-nodes.md) من أن تكون متاحة لمستخدميك.
*   [الحماية من هجمات SSRF](/hosting/securing/ssrf-protection.md) للتحكم في المضيفين ونطاقات IP التي يمكن لعقد سير العمل الاتصال بها.
*   [تقييد تسجيل الحسابات](/hosting/securing/restrict-by-email-verification.md) للمستخدمين الذين تم التحقق من بريدهم الإلكتروني.