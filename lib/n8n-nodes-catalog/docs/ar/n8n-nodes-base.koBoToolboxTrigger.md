# عقدة مُحفِّز KoboToolbox

[KoboToolbox](https://www.kobotoolbox.org/) هي أداة مسح ميداني وجمع بيانات لتصميم نماذج تفاعلية يمكن إكمالها دون اتصال بالإنترنت من الأجهزة المحمولة. وهي متاحة كحل سحابي مجاني أو كنسخة مستضافة ذاتياً.

> **بيانات الاعتماد (Credentials)**
>
> يمكن العثور على معلومات المصادقة (Authentication) لهذه العقدة [هنا](/integrations/builtin/credentials/kobotoolbox.md).

> **أمثلة وقوالب (Templates)**
>
> للحصول على أمثلة الاستخدام والقوالب (Templates) لمساعدتك على البدء، ارجع إلى صفحة [تكاملات (Integrations) مُحفِّز KoboToolbox](https://n8n.io/integrations/kobotoolbox-trigger/) الخاصة بـ n8n.

تبدأ هذه العقدة سير عمل (Workflow) عند تقديم نماذج جديدة من نموذج محدد. تتولى عقدة المُحفِّز (Trigger) إنشاء/حذف الـ hook، لذلك لا تحتاج إلى إجراء أي إعداد في KoboToolbox.

تعمل بنفس طريقة عملية (Operation) جلب التقديمات (Get Submission) في عقدة [KoboToolbox](/integrations/builtin/app-nodes/n8n-nodes-base.kobotoolbox.md)، بما في ذلك دعم نفس خيارات إعادة التنسيق.