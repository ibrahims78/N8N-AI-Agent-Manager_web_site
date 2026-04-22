# عقدة MySQL

استخدم عقدة MySQL (قاعدة بيانات علائقية مفتوحة المصدر) لأتمتة سير العمل في MySQL، ودمج MySQL مع تطبيقات أخرى. تدعم n8n مجموعة واسعة من ميزات MySQL بشكل مدمج، بما في ذلك تنفيذ استعلام SQL، بالإضافة إلى إدراج وتحديث الصفوف في قاعدة بيانات.

ستجد في هذه الصفحة قائمة بالعمليات التي تدعمها عقدة MySQL وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد MySQL](/integrations/builtin/credentials/mysql.md) للحصول على إرشادات حول إعداد المصادقة.

> **يمكن استخدام هذه العقدة كأداة ذكاء اصطناعي**
>
> يمكن استخدام هذه العقدة لتعزيز قدرات وكيل الذكاء الاصطناعي. عند استخدامها بهذه الطريقة، يمكن تعيين العديد من المعاملات تلقائيًا، أو بمعلومات موجهة بواسطة الذكاء الاصطناعي - اكتشف المزيد في [توثيق معاملات أداة الذكاء الاصطناعي](/advanced-ai/examples/using-the-fromai-function.md).

## العمليات

*   Delete (حذف)
*   Execute SQL (تنفيذ SQL)
*   Insert (إدراج)
*   Insert or Update (إدراج أو تحديث)
*   Select (تحديد)
*   Update (تحديث)

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

ارجع إلى [توثيق الموصلات وواجهات برمجة التطبيقات (Connectors and APIs) الخاص بـ MySQL](https://dev.mysql.com/doc/index-connectors.html) لمزيد من المعلومات حول الخدمة.

ارجع إلى [توثيق عبارة SELECT الخاص بـ MySQL](https://dev.mysql.com/doc/refman/8.4/en/select.html) لمزيد من المعلومات حول كتابة استعلامات SQL.

## استخدام معاملات الاستعلام

عند إنشاء استعلام لتشغيله على قاعدة بيانات MySQL، يمكنك استخدام حقل **Query Parameters** (معاملات الاستعلام) في قسم **Options** (الخيارات) لتحميل البيانات في الاستعلام. تقوم n8n بتنقية البيانات في معاملات الاستعلام، مما يمنع حقن SQL.

على سبيل المثال، تريد العثور على شخص بواسطة عنوان بريده الإلكتروني. بالنظر إلى بيانات المدخلات التالية:

```js
[
    {
        "email": "alex@example.com",
        "name": "Alex",
        "age": 21 
    },
    {
        "email": "jamie@example.com",
        "name": "Jamie",
        "age": 33 
    }
]
```

يمكنك كتابة استعلام مثل:

```sql
SELECT * FROM $1:name WHERE email = $2;
```

ثم في **Query Parameters**، قم بتوفير قيم الحقول المراد استخدامها. يمكنك توفير قيم ثابتة أو تعبيرات. لهذا المثال، استخدم التعبيرات حتى تتمكن العقدة من سحب عنوان البريد الإلكتروني من كل عنصر مدخلات بدوره:

```js
// users is an example table name
users,  
```

## المشكلات الشائعة

للاطلاع على الأخطاء أو المشكلات الشائعة وخطوات الحل المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/app-nodes/n8n-nodes-base.mysql/common-issues.md).

---

# المشكلات الشائعة في عقدة MySQL

فيما يلي بعض الأخطاء والمشكلات الشائعة المتعلقة بـ [عقدة MySQL](/integrations/builtin/app-nodes/n8n-nodes-base.mysql/index.md) وخطوات حلها أو استكشافها.

## تحديث الصفوف باستخدام مفتاح مركب

تتيح لك عملية (**Operation**) **التحديث** في عقدة MySQL تحديث الصفوف في جدول (**Table**) من خلال توفير **عمود للمطابقة عليه** وقيمة. يعمل هذا مع الجداول التي يمكن فيها لقيم العمود الواحد تحديد الصفوف الفردية بشكل فريد.

لا يمكنك استخدام هذا النمط للجداول التي تستخدم [مفاتيح مركبة](https://en.wikipedia.org/wiki/Composite_key)، حيث تحتاج إلى أعمدة متعددة لتحديد صف بشكل فريد. مثال على ذلك هو جدول \`user\` الخاص بـ MySQL (https://mariadb.com/kb/en/mysql-user-table/) في قاعدة بيانات \`mysql\`، حيث تحتاج إلى كل من عمودي \`user\` و \`host\` لتحديد الصفوف بشكل فريد.

لتحديث الجداول ذات المفاتيح المركبة، اكتب الاستعلام (**Query**) يدويًا باستخدام عملية (**Operation**) **تنفيذ SQL** بدلاً من ذلك. هناك، يمكنك المطابقة على قيم متعددة، كما في هذا المثال الذي يطابق على كل من \`customer_id\` و \`product_id\`:

```sql
UPDATE orders SET quantity = 3 WHERE customer_id = 538 AND product_id = 800;
```

## تعذر الاتصال بخادم MySQL محلي عند استخدام Docker

عند تشغيل n8n أو MySQL في Docker، تحتاج إلى تهيئة الشبكة بحيث يمكن لـ n8n الاتصال بـ MySQL.

يعتمد الحل على كيفية استضافة المكونين.

### إذا كان MySQL فقط في Docker

إذا كان MySQL يعمل في Docker فقط، فقم بتهيئة MySQL للاستماع على جميع الواجهات عن طريق الربط بـ \`0.0.0.0\` داخل الحاوية (الصور الرسمية مهيأة بالفعل بهذه الطريقة).

عند تشغيل الحاوية، [انشر المنفذ](https://docs.docker.com/get-started/docker-concepts/running-containers/publishing-ports/) باستخدام العلامة \`-p\`. بشكل افتراضي، يعمل MySQL على المنفذ 3306، لذا يجب أن يبدو أمر Docker الخاص بك كالتالي:

```shell
docker run -p 3306:3306 --name my-mysql -d mysql:latest
```

عند تهيئة [بيانات اعتماد MySQL](/integrations/builtin/credentials/mysql.md)، يجب أن يعمل عنوان \`localhost\` دون مشكلة (اضبط **المضيف** على \`localhost\`).

### إذا كان n8n يعمل في Docker فقط

إذا كان n8n يعمل في Docker فقط، قم بتكوين MySQL للاستماع على جميع الواجهات عن طريق الربط بـ `0.0.0.0` على المضيف.

إذا كنت تقوم بتشغيل n8n في Docker على **Linux**، استخدم العلامة `--add-host` لربط `host.docker.internal` بـ `host-gateway` عند بدء تشغيل الحاوية. على سبيل المثال:

```shell
docker run -it --rm --add-host host.docker.internal:host-gateway --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
```

إذا كنت تستخدم Docker Desktop، فسيتم تكوين هذا تلقائيًا لك.

عند تكوين [بيانات اعتماد MySQL](/integrations/builtin/credentials/mysql.md)، استخدم `host.docker.internal` كعنوان **المضيف** بدلاً من `localhost`.

### إذا كان MySQL و n8n يعملان في حاويات Docker منفصلة

إذا كان كل من n8n و MySQL يعملان في Docker في حاويات منفصلة، يمكنك استخدام شبكة Docker لربطهما.

قم بتكوين MySQL للاستماع على جميع الواجهات عن طريق الربط بـ `0.0.0.0` داخل الحاوية (الصور الرسمية مُكوّنة بالفعل بهذه الطريقة). أضف حاويتي MySQL و n8n إلى نفس [شبكة الجسر المعرفة من قبل المستخدم](https://docs.docker.com/engine/network/drivers/bridge/).

عند تكوين [بيانات اعتماد MySQL](/integrations/builtin/credentials/mysql.md)، استخدم اسم حاوية MySQL كعنوان المضيف بدلاً من `localhost`. على سبيل المثال، إذا أطلقت على حاوية MySQL اسم `my-mysql`، فستقوم بتعيين **المضيف** إلى `my-mysql`.

### إذا كان MySQL و n8n يعملان في نفس حاوية Docker

إذا كان MySQL و n8n يعملان في نفس حاوية Docker، لا يحتاج عنوان `localhost` إلى أي تكوين خاص. يمكنك تكوين MySQL للاستماع على `localhost` وتكوين **المضيف** في [بيانات اعتماد MySQL في n8n](/integrations/builtin/credentials/ollama.md) لاستخدام `localhost`.

## الأرقام العشرية تُرجع كسلاسل نصية

بشكل افتراضي، تُرجع عقدة MySQL (قاعدة البيانات) قيم [`DECIMAL`](https://dev.mysql.com/doc/refman/8.4/en/fixed-point-types.html) كسلاسل نصية. يتم ذلك عن قصد لتجنب فقدان الدقة الذي يمكن أن يحدث بسبب القيود في طريقة تمثيل JavaScript للأرقام. يمكنك معرفة المزيد حول هذا القرار في توثيق [مكتبة MySQL](https://sidorares.github.io/node-mysql2/docs/api-and-configurations) التي يستخدمها n8n.

لإخراج القيم العشرية كأرقام بدلاً من سلاسل نصية وتجاهل مخاطر فقدان الدقة، قم بتمكين خيار **إخراج الأرقام العشرية كأرقام**. سيؤدي هذا إلى إخراج القيم كأرقام بدلاً من سلاسل نصية.

كبديل، يمكنك التحويل يدويًا من السلسلة النصية إلى رقم عشري باستخدام الدالة `toFloat()` مع [`toFixed()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed) أو باستخدام [عقدة Edit Fields (Set)](/integrations/builtin/core-nodes/n8n-nodes-base.set.md) بعد عقدة MySQL. كن على دراية بأنك قد تحتاج إلى أخذ فقدان محتمل للدقة في الاعتبار.