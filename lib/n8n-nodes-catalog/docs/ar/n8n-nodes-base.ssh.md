# SSH

تُعد عقدة SSH مفيدة لتنفيذ الأوامر باستخدام بروتوكول Secure Shell.

> **بيانات الاعتماد**
>
> يمكنك العثور على معلومات المصادقة لهذه العقدة [هنا](/integrations/builtin/credentials/ssh.md).

## العمليات

- [**تنفيذ** أمر](#execute-command)
- [**تنزيل** ملف](#download-file)
- [**رفع** ملف](#upload-file)

> **رفع الملفات**
>
> لإرفاق ملف للرفع، ستحتاج إلى استخدام عقدة إضافية مثل عقدة [Read/Write Files from Disk](/integrations/builtin/core-nodes/n8n-nodes-base.readwritefile.md) أو عقدة [HTTP Request](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لتمرير الملف كخاصية بيانات.

### تنفيذ أمر

قم بتكوين هذه العملية باستخدام هذه المعاملات:

- **Credential to connect with**: حدد بيانات اعتماد [SSH](/integrations/builtin/credentials/ssh.md) موجودة أو أنشئ بيانات اعتماد جديدة للاتصال بها.
- **Command**: أدخل الأمر المراد تنفيذه على الجهاز البعيد.
- **Working Directory**: أدخل الدليل الذي يجب أن تقوم n8n بتنفيذ الأمر فيه.

### تنزيل ملف

- **Credential to connect with**: حدد بيانات اعتماد [SSH](/integrations/builtin/credentials/ssh.md) موجودة أو أنشئ بيانات اعتماد جديدة للاتصال بها.
- **Path**: أدخل المسار للملف الذي تريد تنزيله. يجب أن يتضمن هذا المسار اسم الملف. سيستخدم الملف الذي تم تنزيله اسم الملف هذا. لاستخدام اسم مختلف، استخدم خيار **File Name**. ارجع إلى [خيارات تنزيل الملف](#download-file-options) لمزيد من المعلومات.
- **File Property**: أدخل اسم خاصية الكائن التي تحتوي على البيانات الثنائية التي تريد تنزيلها.

#### خيارات تنزيل الملف

يمكنك تكوين هذه العملية بشكل إضافي باستخدام خيار **File Name**. استخدم هذا الخيار لتجاوز اسم ملف البيانات الثنائية إلى اسم من اختيارك.

### رفع ملف

- **Credential to connect with**: حدد بيانات اعتماد [SSH](/integrations/builtin/credentials/ssh.md) موجودة أو أنشئ بيانات اعتماد جديدة للاتصال بها.
- **Input Binary Field**: أدخل اسم حقل الإدخال الثنائي الذي يحتوي على الملف الذي تريد رفعه.
- **Target Directory**: الدليل المراد رفع الملف إليه. يتم أخذ اسم الملف من اسم ملف البيانات الثنائية. لإدخال اسم مختلف، استخدم خيار **File Name**. ارجع إلى [خيارات رفع الملف](#upload-file-options) لمزيد من المعلومات.

#### خيارات رفع الملف

يمكنك تكوين هذه العملية بشكل إضافي باستخدام خيار **File Name**. استخدم هذا الخيار لتجاوز اسم ملف البيانات الثنائية إلى اسم من اختيارك.

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->