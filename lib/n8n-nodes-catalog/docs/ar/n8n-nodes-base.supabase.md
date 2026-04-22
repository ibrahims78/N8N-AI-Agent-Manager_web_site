# عقدة Supabase

استخدم عقدة Supabase لأتمتة سير العمل في Supabase، ودمج Supabase مع تطبيقات أخرى. تدعم n8n بشكل مدمج مجموعة واسعة من ميزات Supabase، بما في ذلك إنشاء الصفوف وحذفها واستردادها.

ستجد في هذه الصفحة قائمة بالعمليات التي تدعمها عقدة Supabase وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد Supabase](/integrations/builtin/credentials/supabase.md) للحصول على إرشادات حول إعداد المصادقة.

> **يمكن استخدام هذه العقدة كأداة ذكاء اصطناعي**
>
> يمكن استخدام هذه العقدة لتعزيز قدرات وكيل الذكاء الاصطناعي. عند استخدامها بهذه الطريقة، يمكن تعيين العديد من المعاملات تلقائيًا، أو باستخدام معلومات موجهة بواسطة الذكاء الاصطناعي - اكتشف المزيد في [توثيق معاملات أداة الذكاء الاصطناعي](/advanced-ai/examples/using-the-fromai-function.md).

## العمليات

* الصف
    * إنشاء صف جديد
    * حذف صف
    * استرداد صف
    * استرداد جميع الصفوف
    * تحديث صف

## استخدام المخططات المخصصة

بشكل افتراضي، تسترد عقدة Supabase المخطط `public` فقط. لاسترداد [المخططات المخصصة](https://supabase.com/docs/guides/api/using-custom-schemas)، قم بتمكين **Use Custom Schema**.

في حقل **Schema** الجديد، قم بتوفير المخطط المخصص الذي يجب أن تستخدمه عقدة Supabase.

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في تنفيذها، يمكنك استخدام [عقدة HTTP Request](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء واجهة برمجة تطبيقات الخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة HTTP Request:

1.  في عقدة HTTP Request، حدد **المصادقة** > **Predefined Credential Type**.
2.  حدد الخدمة التي ترغب في الاتصال بها.
3.  حدد بيانات الاعتماد الخاصة بك.

ارجع إلى [عمليات API المخصصة](/integrations/custom-operations.md) لمزيد من المعلومات.

## المشكلات الشائعة

للاطلاع على الأخطاء أو المشكلات الشائعة وخطوات الحل المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/app-nodes/n8n-nodes-base.supabase/common-issues.md).

---

# المشكلات الشائعة في العقدة Supabase

فيما يلي بعض الأخطاء والمشكلات الشائعة في العقدة [Supabase](/integrations/builtin/app-nodes/n8n-nodes-base.supabase/index.md) وخطوات حلها أو استكشاف أخطائها وإصلاحها.

## تصفية الصفوف باستخدام البيانات الوصفية

لتصفية الصفوف باستخدام [البيانات الوصفية لـ Supabase](https://supabase.com/docs/guides/ai/python/metadata)، عيّن **نوع التحديد (Select Type)** إلى **سلسلة نصية (String)**.

من هناك، يمكنك إنشاء استعلام في المعامل **المرشحات (سلسلة نصية) (Filters (String))** لتصفية البيانات الوصفية باستخدام [لغة الاستعلام للبيانات الوصفية لـ Supabase](https://supabase.com/docs/guides/ai/python/metadata#metadata-query-language)، المستوحاة من تنسيق [مُحدّدات MongoDB](https://www.mongodb.com/docs/manual/reference/operator/query/). يمكنك الوصول إلى خصائص البيانات الوصفية باستخدام عامل JSON السهمي `->>` الخاص بـ [Postgres](https://www.postgresql.org/docs/current/functions-json.html#FUNCTIONS-JSON-PROCESSING) على النحو التالي (تشير الأقواس المعقوفة إلى المكونات التي يجب ملؤها):

```
metadata->>{your-property}={comparison-operator}.{comparison-value}
```

على سبيل المثال، للوصول إلى خاصية `age` في البيانات الوصفية وإرجاع نتائج أكبر من أو تساوي 21، يمكنك إدخال ما يلي في حقل **المرشحات (سلسلة نصية) (Filters (String))**:

```
metadata->>age=gte.21
```

يمكنك دمج هذه العوامل لإنشاء استعلامات أكثر تعقيدًا.

## تعذر الاتصال بقاعدة بيانات Supabase محلية عند استخدام Docker

عند تشغيل Supabase في Docker، تحتاج إلى تكوين الشبكة بحيث يمكن لـ n8n الاتصال بـ Supabase.

يعتمد الحل على كيفية استضافة المكونين.

### إذا كانت Supabase فقط في Docker

إذا كانت Supabase فقط تعمل في Docker، فإن ملف Docker Compose المستخدم في [دليل الاستضافة الذاتية](https://supabase.com/docs/guides/self-hosting/docker) يقوم بالفعل بتشغيل Supabase المرتبطة بالواجهات الصحيحة.

عند تكوين [بيانات اعتماد Supabase](/integrations/builtin/credentials/supabase.md)، يجب أن يعمل عنوان `localhost` دون مشكلة (عيّن **المضيف (Host)** إلى `localhost`).

### إذا كانت Supabase و n8n تعملان في حاويات Docker منفصلة

إذا كانت كل من n8n و Supabase تعملان في Docker في حاويات منفصلة، يمكنك استخدام شبكات Docker لربطهما.

قم بتكوين Supabase للاستماع على جميع الواجهات عن طريق الربط بـ `0.0.0.0` داخل الحاوية (يقوم تكوين Docker Compose الرسمي بذلك بالفعل). أضف كلاً من مكوني Supabase و n8n إلى نفس [شبكة الجسر المعرفة من قبل المستخدم](https://docs.docker.com/engine/network/drivers/bridge/) إذا لم تكن تديرهما معًا بالفعل في نفس ملف Docker Compose.

عند تكوين [بيانات اعتماد Supabase](/integrations/builtin/credentials/supabase.md)، استخدم اسم حاوية بوابة API الخاصة بـ Supabase (`supabase-kong` افتراضيًا) كعنوان للمضيف بدلاً من `localhost`. على سبيل المثال، إذا كنت تستخدم التكوين الافتراضي، فستعيّن **المضيف (Host)** إلى `http://supabase-kong:8000`.

## يمكن الوصول إلى السجلات عبر Postgres ولكن ليس Supabase

إذا كانت الاستعلامات عن السجلات تُرجع نتائج فارغة باستخدام عقدة Supabase، ولكنها متاحة عبر عقدة [Postgres](/integrations/builtin/app-nodes/n8n-nodes-base.postgres/index.md) أو باستخدام عميل Postgres، فقد يكون هناك تعارض مع سياسة [أمان مستوى الصفوف (RLS)](https://supabase.com/docs/guides/database/postgres/row-level-security) الخاصة بـ Supabase.

تُفعّل Supabase دائمًا RLS عند إنشاء جدول في مخطط عام باستخدام محرر الجداول. عندما يكون RLS نشطًا، لا تُرجع واجهة برمجة التطبيقات (API) أي بيانات باستخدام مفتاح `anon` العام حتى تقوم بإنشاء سياسات. هذا إجراء أمني لضمان عدم كشف سوى البيانات التي تنوي كشفها.

للوصول إلى البيانات من جدول مُفعّل فيه RLS بصفتك دور `anon`، [أنشئ سياسة](https://supabase.com/docs/guides/database/postgres/row-level-security#creating-policies) لتمكين أنماط الوصول التي تنوي استخدامها.