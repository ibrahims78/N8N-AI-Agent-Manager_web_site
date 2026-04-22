# جداول بيانات Google

استخدم عقدة Google Sheets (جداول بيانات Google) لأتمتة سير العمل في جداول بيانات Google، ودمج جداول بيانات Google مع تطبيقات أخرى. تدعم n8n بشكل مدمج مجموعة واسعة من ميزات جداول بيانات Google، بما في ذلك إنشاء المستندات وتحديثها وحذفها وإلحاقها وإزالتها واستردادها.

في هذه الصفحة، ستجد قائمة بالعمليات التي تدعمها عقدة Google Sheets وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد Google Sheets](/integrations/builtin/credentials/google/index.md) للحصول على إرشادات حول إعداد المصادقة.

## العمليات

*   **المستند**
    *   [**إنشاء**](/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/document-operations.md#create-a-spreadsheet) جدول بيانات.
    *   [**حذف**](/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/document-operations.md#delete-a-spreadsheet) جدول بيانات.
*   **الورقة داخل المستند**
    *   [**إلحاق صف أو تحديثه**](/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/sheet-operations.md#append-or-update-row): إلحاق صف جديد، أو تحديث الصف الحالي إذا كان موجودًا بالفعل.
    *   [**إلحاق صف**](/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/sheet-operations.md#append-row): إنشاء صف جديد.
    *   [**مسح**](/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/sheet-operations.md#clear-a-sheet) جميع البيانات من ورقة.
    *   [**إنشاء**](/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/sheet-operations.md#create-a-new-sheet) ورقة جديدة.
    *   [**حذف**](/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/sheet-operations.md#delete-a-sheet) ورقة.
    *   [**حذف صفوف أو أعمدة**](/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/sheet-operations.md#delete-rows-or-columns): حذف الأعمدة والصفوف من ورقة.
    *   [**استرداد صف (صفوف)**](/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/sheet-operations.md#get-rows): قراءة جميع الصفوف في ورقة.
    *   [**تحديث صف**](/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/sheet-operations.md#update-row): تحديث صف في ورقة.

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

ارجع إلى [توثيق API الخاص بـ Google Sheets](https://developers.google.com/sheets/api) لمزيد من المعلومات حول الخدمة.

<!-- ## Examples
This example uses the Customer Datastore node to provide sample data to load into Google Sheets. It assumes you've already set up your [credentials](/integrations/builtin/credentials/google/index.md).	
	1. Set up a Google Sheet with two columns, `test1` and `test`. In `test1`, enter the names from the Customer Datastore node:  
	![The spreadsheet set up for testing](/_images/integrations/builtin/app-nodes/googlesheets/test-sheet-before.png)  
	2. Create the workflow: use the manual trigger, Customer Datastore, and Google Sheets nodes.  
	![The spreadsheet set up for testing](/_images/integrations/builtin/app-nodes/googlesheets/workflow.png)  
	3. Open the Customer Datastore node, enable **Return All**, then select **Execute step**.
	4. In the Google Sheets node, go through the steps above, using these settings:
		* Select **Update Row** as the **Operation**.
		* In **Column to Match On**, select `test1`.
		* For the first field of **Values to Update**, drag in the **name** from the input view.
		* For the second field of **Values to Update**, drag in the **email** from the input view.
	5. Select **Execute step**.
	6. View your spreadsheet. **test2** should now contain the email addresses that match to the names in the input data.  
	![The spreadsheet set up for testing](/_images/integrations/builtin/app-nodes/googlesheets/test-sheet-after.png)   -->

## المشكلات الشائعة

للاستفسارات أو المشكلات الشائعة والحلول المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/common-issues.md).

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في تنفيذها، يمكنك استخدام [عقدة طلب HTTP (HTTP Request node)](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء API الخاص بالخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة طلب HTTP:

1. في عقدة طلب HTTP، حدد **المصادقة** (Authentication) > **نوع بيانات الاعتماد المُعرّف مسبقًا** (Predefined Credential Type).
2. حدد الخدمة التي ترغب في الاتصال بها.
3. حدد بيانات الاعتماد الخاصة بك.

ارجع إلى [عمليات API المخصصة](/integrations/custom-operations.md) لمزيد من المعلومات.

---

# قضايا شائعة في عقدة Google Sheets

فيما يلي بعض الأخطاء والقضايا الشائعة المتعلقة بـ [عقدة Google Sheets](/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/index.md) وخطوات حلها أو استكشاف الأخطاء وإصلاحها.

## إلحاق مصفوفة

لإدراج مصفوفة من البيانات في Google Sheets، يجب عليك تحويل المصفوفة إلى تنسيق JSON صالح (مفتاح، قيمة).

للقيام بذلك، فكر في استخدام:

1.  عقدة [Split Out](/integrations/builtin/core-nodes/n8n-nodes-base.splitout.md).
2.  عقدة [AI Transform](/integrations/builtin/core-nodes/n8n-nodes-base.aitransform.md). على سبيل المثال، حاول إدخال شيء مثل:
    ```
    Convert 'languages' array to JSON (key, value) pairs.
    ```
3.  عقدة [Code](/integrations/builtin/core-nodes/n8n-nodes-base.code/index.md).

<!-- vale off -->
## تم تحديث أسماء الأعمدة بعد إعداد العقدة
<!-- vale on -->

ستتلقى هذا الخطأ إذا تغيرت أسماء أعمدة Google Sheet منذ أن قمت بإعداد العقدة.

لتحديث أسماء الأعمدة، أعد تحديد **وضع تعيين الأعمدة**. يجب أن يدفع هذا العقدة لجلب أسماء الأعمدة مرة أخرى.

بمجرد تحديث أسماء الأعمدة، حدّث معاملات العقدة.