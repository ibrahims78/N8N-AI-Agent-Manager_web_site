# AWS Certificate Manager node (عقدة إدارة شهادات AWS)

Use the AWS Certificate Manager node to automate work in AWS Certificate Manager, and integrate AWS Certificate Manager with other applications. n8n has built-in support for a wide range of AWS Certificate Manager features, including creating, deleting, getting, and renewing SSL certificates.

On this page, you'll find a list of operations the AWS Certificate Manager node supports and links to more resources.

> **بيانات الاعتماد**
>
> يرجى الاطلاع على [بيانات اعتماد AWS Certificate Manager](/integrations/builtin/credentials/aws.md) للحصول على إرشادات حول إعداد المصادقة.

## العمليات

* شهادة
	* حذف
	* الحصول
	* الحصول على عدة عناصر
	* الحصول على بيانات التعريف
	* التجديد

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

انظر إلى [توثيق AWS Certificate Manager](/docs.aws.amazon.com/acm/latest/userguide/acm-overview.html) لمزيد من المعلومات حول هذه الخدمة.

## ماذا تفعل إذا لم تكن العملية مدعومة

إذا لم تدعم هذه العقدة العملية التي تريد تنفيذها، فيمكنك استخدام عقدة HTTP Request (عقدة طلب HTTP) لاستدعاء API الخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة HTTP Request: 

1. في عقدة HTTP Request، اختر Authentication (المصادقة) > نوع بيانات الاعتماد المعرفة مسبقاً.
1. اختر الخدمة التي تريد الاتصال بها.
1. اختر بيانات الاعتماد الخاصة بك.

انظر إلى [عمليات API المخصصة](/integrations/custom-operations.md) لمزيد من المعلومات.