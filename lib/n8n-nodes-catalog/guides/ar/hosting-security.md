---
title: تأمين n8n
contentType: overview
---

# تأمين n8n

يمكن أن يتخذ تأمين نسخة n8n عدة أشكال.

على مستوى عالٍ، يمكنك:

* إجراء [تدقيق أمني](/hosting/securing/security-audit.md) لتحديد مخاطر الأمن.
* [إعداد SSL](/hosting/securing/set-up-ssl.md) لفرض الاتصالات الآمنة.
* [إعداد الدخول الموحد](/hosting/securing/set-up-sso.md) لإدارة حسابات المستخدمين.
* استخدام [المصادقة الثنائية (2FA)](/user-management/two-factor-auth.md) لمستخدميك.

يمكنك أيضاً حماية البيانات الحساسة المعالجة من خلال سير العمل الخاصة بك:

* [إخفاء بيانات التنفيذ](/workflows/executions/execution-data-redaction.md) لإخفاء المدخلات والمخرجات من تنفيذات سير العمل.

بشكل أكثر دقة، فكر في حظر أو اختيار عدم الاشتراك في الميزات أو جمع البيانات التي لا تريدها:

* [تعطيل واجهة برمجة التطبيقات العامة](/hosting/securing/disable-public-api.md) إذا لم تكن تستخدمها.
* [الانسحاب من جمع بيانات القياس](/hosting/securing/telemetry-opt-out.md) من البيانات المجهولة التي تجمعها n8n تلقائياً.
* [حظر عُقَد معينة](/hosting/securing/blocking-nodes.md) من أن تكون متاحة لمستخدميك.
* [الحماية من هجمات SSRF](/hosting/securing/ssrf-protection.md) للسيطرة على العناوين المضيفة ونطاقات IP التي يمكن لعقد سير العمل الاتصال بها.
* [تقييد تسجيل الحسابات](/hosting/securing/restrict-by-email-verification.md) لمستخدمي البريد الإلكتروني المؤكد.