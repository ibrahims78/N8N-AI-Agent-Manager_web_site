# عقدة Google Cloud Storage

استخدم عقدة Google Cloud Storage لأتمتة سير العمل في Google Cloud Storage، وتكامل Google Cloud Storage مع تطبيقات أخرى. تدعم n8n بشكل مدمج مجموعة واسعة من ميزات Google Cloud Storage، بما في ذلك إنشاء السِلال (buckets) والكائنات (objects)، وتحديثها، وحذفها، واستردادها.

في هذه الصفحة، ستجد قائمة بالعمليات التي تدعمها عقدة Google Cloud Storage وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد Google Cloud Storage](/integrations/builtin/credentials/google/index.md) للحصول على إرشادات حول إعداد المصادقة.

## العمليات

* السِلة (Bucket)
	* إنشاء
	* حذف
	* استرداد
	* استرداد متعدد
	* تحديث
* الكائن (Object)
	* إنشاء
	* حذف
	* استرداد
	* استرداد متعدد
	* تحديث

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

ارجع إلى وثائق [Cloud Storage API](https://cloud.google.com/storage/docs/apis) من Google للحصول على معلومات مفصلة حول واجهة برمجة التطبيقات (API) التي تتكامل معها هذه العقدة.

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في تنفيذها، يمكنك استخدام [عقدة HTTP Request](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء واجهة برمجة التطبيقات (API) الخاصة بالخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة HTTP Request:

1.  في عقدة HTTP Request، حدد **Authentication** > **Predefined Credential Type**.
2.  حدد الخدمة التي ترغب في الاتصال بها.
3.  حدد بيانات الاعتماد الخاصة بك.

ارجع إلى [عمليات API المخصصة](/integrations/custom-operations.md) لمزيد من المعلومات.