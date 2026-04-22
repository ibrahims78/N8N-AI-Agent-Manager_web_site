# عقدة مُحمِّل البيانات الافتراضي (Default Data Loader)

استخدم عقدة مُحمِّل البيانات الافتراضي (Default Data Loader) لتحميل ملفات البيانات الثنائية أو بيانات JSON لمخازن المتجهات [vector stores](/glossary.md#ai-vector-store) أو التلخيص.

في هذه الصفحة، ستجد قائمة بالمعاملات (parameters) التي تدعمها عقدة مُحمِّل البيانات الافتراضي (Default Data Loader)، وروابط لموارد إضافية.

> **حل المعاملات (Parameter resolution) في العقد الفرعية**
>
> تتصرف العقد الفرعية بشكل مختلف عن العقد الأخرى عند معالجة عناصر متعددة باستخدام تعبير (expression).
>
> تأخذ معظم العقد، بما في ذلك العقد الجذرية، أي عدد من العناصر (items) كمدخلات (input)، وتعالج هذه العناصر، وتُخرج النتائج (output). يمكنك استخدام التعبيرات (expressions) للإشارة إلى عناصر المدخلات، وتقوم العقدة بحل التعبير لكل عنصر على حدة. على سبيل المثال، عند إعطاء مدخلات تتكون من خمس قيم `name`، يتم حل التعبير `` لكل اسم على حدة.
>
> في العقد الفرعية، يتم حل التعبير دائمًا إلى العنصر الأول. على سبيل المثال، عند إعطاء مدخلات تتكون من خمس قيم `name`، يتم حل التعبير `` دائمًا إلى الاسم الأول.

## معاملات العقدة (Node parameters)

*   **تقسيم النص (Text Splitting)**: اختر من:
    *   **بسيط (Simple)**: يستخدم [مُقسِّم النص التكراري للأحرف (Recursive Character Text Splitter)](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.textsplitterrecursivecharactertextsplitter.md) بحجم جزء (chunk size) يبلغ 1000 وتداخل (overlap) يبلغ 200.
    *   **مخصص (Custom)**: يسمح لك بربط مُقسِّم نص من اختيارك.
*   **نوع البيانات (Type of Data)**: اختر **ثنائي (Binary)** أو **JSON**.
*   **الوضع (Mode)**: اختر من:
    *   **تحميل جميع بيانات المدخلات (Load All Input Data)**: استخدم جميع بيانات المدخلات (input data) الخاصة بالعقدة.
    *   **تحميل بيانات محددة (Load Specific Data)**: استخدم [التعبيرات (expressions)](/data/expressions.md) لتحديد البيانات التي تريد تحميلها. يمكنك إضافة نص بالإضافة إلى التعبيرات (expressions). هذا يعني أنه يمكنك إنشاء مستند مخصص من مزيج من النص والتعبيرات (expressions).
*   **تنسيق البيانات (Data Format)**: يظهر عند تعيين **نوع البيانات (Type of Data)** إلى **ثنائي (Binary)**. اختر نوع MIME للملف لبياناتك الثنائية. عيّن على **اكتشاف تلقائي حسب نوع MIME (Automatically Detect by MIME Type)** إذا كنت تريد أن تقوم n8n بتعيين تنسيق البيانات لك. إذا قمت بتعيين تنسيق بيانات محدد ولم يتطابق نوع MIME للملف الوارد معه، فستحدث العقدة خطأ (error). إذا استخدمت **اكتشاف تلقائي حسب نوع MIME (Automatically Detect by MIME Type)**، فستعود العقدة إلى تنسيق النص إذا لم تتمكن من مطابقة نوع MIME للملف مع تنسيق بيانات مدعوم.

## خيارات العقدة (Node options)

*   **البيانات الوصفية (Metadata)**: عيّن البيانات الوصفية التي يجب أن تصاحب المستند في مخزن المتجهات (vector store). هذا هو ما تطابقه باستخدام خيار **مرشح البيانات الوصفية (Metadata Filter)** عند استرداد البيانات باستخدام عقد مخزن المتجهات (vector store).

## القوالب (Templates) والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

*   ارجع إلى [وثائق LangChain حول مُحمِّلات المستندات (document loaders)](https://js.langchain.com/docs/modules/data_connection/document_loaders/integrations/file_loaders/) لمزيد من المعلومات حول الخدمة.
*   اطلع على وثائق n8n حول [الذكاء الاصطناعي المتقدم (Advanced AI)](/advanced-ai/index.md).