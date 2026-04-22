# عقدة WooCommerce

استخدم عقدة WooCommerce (WooCommerce node) لأتمتة سير العمل في WooCommerce، ودمج WooCommerce مع التطبيقات الأخرى. تدعم n8n بشكل مدمج مجموعة واسعة من ميزات WooCommerce، بما في ذلك إنشاء وحذف العملاء، الطلبات، والمنتجات.

في هذه الصفحة، ستجد قائمة بالعمليات التي تدعمها عقدة WooCommerce وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد WooCommerce](/integrations/builtin/credentials/woocommerce.md) للحصول على إرشادات حول إعداد المصادقة.

> **يمكن استخدام هذه العقدة كأداة ذكاء اصطناعي**
>
> يمكن استخدام هذه العقدة لتعزيز قدرات وكيل الذكاء الاصطناعي. عند استخدامها بهذه الطريقة، يمكن تعيين العديد من المعاملات تلقائيًا، أو باستخدام معلومات موجهة بواسطة الذكاء الاصطناعي - اكتشف المزيد في [توثيق معاملات أداة الذكاء الاصطناعي](/advanced-ai/examples/using-the-fromai-function.md).

## العمليات

*   Customer (العميل)
    *   Create a customer (إنشاء عميل)
    *   Delete a customer (حذف عميل)
    *   Retrieve a customer (استرداد عميل)
    *   Retrieve all customers (استرداد جميع العملاء)
    *   Update a customer (تحديث عميل)
*   Order (الطلب)
    *   Create a order (إنشاء طلب)
    *   Delete a order (حذف طلب)
    *   Get a order (الحصول على طلب)
    *   Get all orders (الحصول على جميع الطلبات)
    *   Update an order (تحديث طلب)
*   Product (المنتج)
    *   Create a product (إنشاء منتج)
    *   Delete a product (حذف منتج)
    *   Get a product (الحصول على منتج)
    *   Get all products (الحصول على جميع المنتجات)
    *   Update a product (تحديث منتج)

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في القيام بها، يمكنك استخدام [عقدة HTTP Request](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء واجهة برمجة التطبيقات (API) للخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة HTTP Request:

1.  في عقدة HTTP Request، حدد **Authentication** > **Predefined Credential Type**.
2.  حدد الخدمة التي ترغب في الاتصال بها.
3.  حدد بيانات الاعتماد الخاصة بك.

ارجع إلى [عمليات API المخصصة](/integrations/custom-operations.md) لمزيد من المعلومات.