# عقدة S3

استخدم عقدة S3 لأتمتة سير العمل في تخزين S3 غير AWS ودمج S3 مع تطبيقات أخرى. تدعم n8n مجموعة واسعة من ميزات S3 بشكل مدمج، بما في ذلك إنشاء وحذف والحصول على الدلاء والملفات والمجلدات. لتخزين AWS S3، استخدم [عقدة AWS S3](/integrations/builtin/app-nodes/n8n-nodes-base.awss3.md).

استخدم عقدة S3 لحلول S3 غير AWS مثل:

*   [MinIO](https://min.io/)
*   [Wasabi](https://wasabi.com/)
*   [Digital Ocean spaces](https://www.digitalocean.com/products/spaces)

في هذه الصفحة، ستجد قائمة بالعمليات التي تدعمها عقدة S3 وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد S3](/integrations/builtin/credentials/s3.md) للحصول على إرشادات حول إعداد المصادقة.

> **يمكن استخدام هذه العقدة كأداة ذكاء اصطناعي**
>
> يمكن استخدام هذه العقدة لتعزيز قدرات وكيل الذكاء الاصطناعي. عند استخدامها بهذه الطريقة، يمكن تعيين العديد من المعاملات تلقائيًا، أو بمعلومات يوجهها الذكاء الاصطناعي - اكتشف المزيد في [توثيق معاملات أداة الذكاء الاصطناعي](/advanced-ai/examples/using-the-fromai-function.md).

## العمليات

*   الدلو (Bucket)
    *   إنشاء دلو
    *   حذف دلو
    *   الحصول على جميع الدلاء
    *   البحث داخل دلو
*   الملف (File)
    *   نسخ ملف
    *   حذف ملف
    *   تنزيل ملف
    *   الحصول على جميع الملفات
    *   رفع ملف

    /// note | إرفاق ملف للرفع
    لإرفاق ملف للرفع، استخدم عقدة أخرى لتمرير الملف كخاصية بيانات. تعمل العقد مثل [عقدة قراءة/كتابة الملفات من القرص](/integrations/builtin/core-nodes/n8n-nodes-base.readwritefile.md) أو [عقدة طلب HTTP](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) بشكل جيد.
    ///

*   المجلد (Folder)
    *   إنشاء مجلد
    *   حذف مجلد
    *   الحصول على جميع المجلدات

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## مرجع العقدة

### تعيين أذونات الملفات في Wasabi

عند رفع الملفات إلى [Wasabi](https://wasabi.com/)، يجب عليك تعيين أذونات للملفات باستخدام القائمة المنسدلة **ACL** وليس المفاتيح التبديلية.

![أذونات الملفات عند استخدام عقدة S3 مع Wasabi](/_images/integrations/builtin/app-nodes/s3/acl_dropdown.png)