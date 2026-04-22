# عقدة Error Trigger (مُحفِّز الخطأ)

يمكنك استخدام عقدة Error Trigger لإنشاء سير عمل الأخطاء. عندما يفشل سير عمل آخر مرتبط، تستقبل هذه العقدة تفاصيل حول سير العمل الفاشل والأخطاء، وتُشغّل سير عمل الخطأ.

## الاستخدام

1.  أنشئ سير عمل جديدًا، مع عقدة Error Trigger كالعقدة الأولى.
2.  امنح سير العمل اسمًا، على سبيل المثال `Error Handler`.
3.  حدد **حفظ**.
4.  في سير العمل الذي ترغب في استخدام سير عمل الخطأ هذا فيه:
    1.  حدد **الخيارات** <span class="n8n-inline-image">![Options menu icon](/_images/common-icons/three-dot-options-menu.png){.off-glb}</span> > **الإعدادات**.
    2.  في **Error workflow**، حدد سير العمل الذي أنشأته للتو. على سبيل المثال، إذا استخدمت الاسم Error Handler، فحدد **Error handler**.
    3.  حدد **حفظ**.
    الآن، عندما يحدث خطأ في سير العمل هذا، يتم تشغيل سير عمل الخطأ المرتبط.

لاحظ ما يلي:

*   إذا كان سير العمل يستخدم عقدة Error Trigger، فلا يتعين عليك نشر سير العمل.
*   إذا كان سير العمل يحتوي على عقدة Error Trigger، فافتراضيًا، يستخدم سير العمل نفسه كسير عمل للخطأ.
*   لا يمكنك اختبار سير عمل الأخطاء عند تشغيل سير العمل يدويًا. يتم تشغيل Error Trigger فقط عندما يحدث خطأ في سير عمل تلقائي.

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

يمكنك استخدام عقدة [Stop And Error (الإيقاف والخطأ)](/integrations/builtin/core-nodes/n8n-nodes-base.stopanderror.md) لإرسال رسائل مخصصة إلى Error Trigger.

اقرأ المزيد حول [سير عمل الأخطاء](/flow-logic/error-handling.md) في سير عمل n8n.

## بيانات الخطأ

بيانات الخطأ الافتراضية التي تستقبلها Error Trigger هي:

```json
[
	{
		"execution": {
			"id": "231",
			"url": "https://n8n.example.com/execution/231",
			"retryOf": "34",
			"error": {
				"message": "Example Error Message",
				"stack": "Stacktrace"
			},
			"lastNodeExecuted": "Node With Error",
			"mode": "manual"
		},
		"workflow": {
			"id": "1",
			"name": "Example Workflow"
		}
	}
]
```

تكون جميع المعلومات موجودة دائمًا، باستثناء:

-   `execution.id`: يتطلب حفظ التنفيذ في قاعدة البيانات. لا يكون موجودًا إذا كان الخطأ في عقدة المُحفِّز لسير العمل الرئيسي، حيث لا يتم تنفيذ سير العمل.
-   `execution.url`: يتطلب حفظ التنفيذ في قاعدة البيانات. لا يكون موجودًا إذا كان الخطأ في عقدة المُحفِّز لسير العمل الرئيسي، حيث لا يتم تنفيذ سير العمل.
-   `execution.retryOf`: يكون موجودًا فقط عندما يكون التنفيذ إعادة محاولة لتنفيذ فاشل.

إذا كان الخطأ ناتجًا عن عقدة المُحفِّز لسير العمل الرئيسي، بدلاً من مرحلة لاحقة، فإن البيانات المرسلة إلى سير عمل الخطأ تكون مختلفة. توجد معلومات أقل في `execution{}` وأكثر في `trigger{}`:

```json
{
  "trigger": {
    "error": {
      "context": {},
      "name": "WorkflowActivationError",
      "cause": {
        "message": "",
        "stack": ""
      },
      "timestamp": 1654609328787,
      "message": "",
      "node": {
        . . . 
      }
    },
    "mode": "trigger"
  },
  "workflow": {
    "id": "",
    "name": ""
  }
}
```