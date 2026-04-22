# عقدة Facebook Graph API

استخدم عقدة Facebook Graph API لأتمتة سير العمل في Facebook Graph API، ودمج Facebook Graph API مع تطبيقات أخرى. تدعم n8n بشكل مدمج مجموعة واسعة من ميزات Facebook Graph API، بما في ذلك استخدام استعلامات GET و POST و DELETE للعديد من المعاملات مثل Host URL (عنوان URL المضيف) وطرق الطلب وغير ذلك الكثير.

في هذه الصفحة، ستجد قائمة بالعمليات التي تدعمها عقدة Facebook Graph API وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد Facebook Graph API](/integrations/builtin/credentials/facebookgraph.md) للحصول على إرشادات حول إعداد المصادقة.

## العمليات

*   **افتراضي**
    *   GET
    *   POST
    *   DELETE
*   **تحميلات الفيديو**
    *   GET
    *   POST
    *   DELETE

### المعاملات

> **يمكن استخدام هذه العقدة كأداة ذكاء اصطناعي**
>
> يمكن استخدام هذه العقدة لتعزيز قدرات وكيل الذكاء الاصطناعي. عند استخدامها بهذه الطريقة، يمكن تعيين العديد من المعاملات تلقائيًا، أو باستخدام معلومات موجهة بواسطة الذكاء الاصطناعي - اكتشف المزيد في [توثيق معاملات أداة الذكاء الاصطناعي](/advanced-ai/examples/using-the-fromai-function.md).

*   **Host URL**: عنوان URL المضيف للطلب. الخيارات التالية متاحة:
    *   **افتراضي**: يتم تمرير الطلبات إلى Host URL `graph.facebook.com`. يُستخدم لمعظم الطلبات.
    *   **فيديو**: يتم تمرير الطلبات إلى Host URL `graph-video.facebook.com`. يُستخدم لطلبات تحميل الفيديو فقط.
*   **HTTP Request Method**: الطريقة التي ستُستخدم لهذا الطلب، من الخيارات التالية:
    *   **GET**
    *   **POST**
    *   **DELETE**
*   **Graph API Version**: إصدار [Facebook Graph API](https://developers.facebook.com/docs/graph-api/changelog) الذي سيُستخدم لهذا الطلب.
*   **Node**: العقدة التي سيتم العمل عليها، على سبيل المثال `/<page-id>/feed`. اقرأ المزيد عنها في [توثيق مطوري Facebook الرسمي](https://developers.facebook.com/docs/graph-api/using-graph-api).
*   **Edge**: Edge (الحافة) الخاصة بالعقدة التي سيتم العمل عليها. تمثل Edges مجموعات من الكائنات المرفقة بالعقدة.
*   **Ignore SSL Issues**: تبديل لتنزيل الاستجابة حتى لو لم يكن التحقق من شهادة SSL ممكنًا.
*   **Send Binary File**: متاح لعمليات `POST`. إذا تم تمكينه، يتم إرسال البيانات الثنائية كجسم للطلب. يتطلب تعيين ما يلي:
    *   **Input Binary Field**: اسم الخاصية الثنائية التي تحتوي على بيانات الملف المراد تحميله.

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->