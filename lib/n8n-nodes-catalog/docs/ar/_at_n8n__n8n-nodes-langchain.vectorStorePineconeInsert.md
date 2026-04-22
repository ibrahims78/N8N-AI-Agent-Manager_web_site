# عقدة Pinecone Vector Store

استخدم عقدة Pinecone للتفاعل مع قاعدة بيانات Pinecone الخاصة بك كـ [متجر متجهات](/glossary.md#ai-vector-store). يمكنك إدراج المستندات في قاعدة بيانات متجهات، والحصول على المستندات من قاعدة بيانات متجهات، واسترداد المستندات لتزويدها لمسترد متصل بـ [سلسلة](/glossary.md#ai-chain)، أو الاتصال مباشرة بـ [وكيل](/glossary.md#ai-agent) كـ [أداة](/glossary.md#ai-tool). يمكنك أيضًا تحديث عنصر في قاعدة بيانات متجهات باستخدام معرفه.

في هذه الصفحة، ستجد معاملات العقدة لعقدة Pinecone، وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> يمكنك العثور على معلومات المصادقة لهذه العقدة [هنا](/integrations/builtin/credentials/pinecone.md).

> **حل المعاملات في العقد الفرعية**
>
> تتصرف العقد الفرعية بشكل مختلف عن العقد الأخرى عند معالجة عناصر متعددة باستخدام تعبير.
>
> تأخذ معظم العقد، بما في ذلك العقد الجذرية، أي عدد من العناصر كمدخل، وتعالج هذه العناصر، وتخرج النتائج. يمكنك استخدام التعبيرات للإشارة إلى عناصر المدخلات، وتحل العقدة التعبير لكل عنصر على حدة. على سبيل المثال، بالنظر إلى مدخل من خمس قيم `name`، يحل التعبير `` لكل اسم على حدة.
>
> في العقد الفرعية، يحل التعبير دائمًا إلى العنصر الأول. على سبيل المثال، بالنظر إلى مدخل من خمس قيم `name`، يحل التعبير `` دائمًا إلى الاسم الأول.

## أنماط استخدام العقدة

يمكنك استخدام عقدة Pinecone Vector Store بالأنماط التالية.

### الاستخدام كعقدة عادية لإدراج المستندات وتحديثها واستردادها

يمكنك استخدام Pinecone Vector Store كعقدة عادية لإدراج المستندات أو تحديثها أو الحصول عليها. يضع هذا النمط Pinecone Vector Store في تدفق الاتصال العادي دون استخدام وكيل.

يمكنك رؤية مثال على ذلك في السيناريو 1 من [هذا القالب](https://n8n.io/workflows/2165-chat-with-pdf-docs-using-ai-quoting-sources/).

### الاتصال مباشرة بوكيل AI كأداة

يمكنك توصيل عقدة Pinecone Vector Store مباشرة بموصل الأداة الخاص بـ [وكيل AI](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md) لاستخدام متجر متجهات كمورد عند الإجابة على الاستعلامات.

هنا، سيكون الاتصال: وكيل AI (موصل الأدوات) -> عقدة Pinecone Vector Store.

### استخدام مُسترجِع لجلب المستندات

يمكنك استخدام العقدة [Vector Store Retriever](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.retrievervectorstore.md) مع عقدة Pinecone Vector Store لجلب المستندات من عقدة Pinecone Vector Store. يُستخدم هذا غالبًا مع العقدة [Question and Answer Chain](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.chainretrievalqa/index.md) لجلب المستندات من مخزن المتجهات التي تتطابق مع مدخلات الدردشة المعطاة.

مثال على [تدفق الاتصال](https://n8n.io/workflows/1960-ask-questions-about-a-pdf-using-ai/) سيكون: Question and Answer Chain (موصل Retriever) -> Vector Store Retriever (موصل Vector Store) -> Pinecone Vector Store.

### استخدام أداة Vector Store Question Answer للإجابة على الأسئلة

يستخدم نمط آخر [أداة Vector Store Question Answer](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolvectorstore.md) لتلخيص النتائج والإجابة على الأسئلة من عقدة Pinecone Vector Store. بدلاً من ربط Pinecone Vector Store مباشرة كأداة، يستخدم هذا النمط أداة مصممة خصيصًا لتلخيص البيانات في مخزن المتجهات.

سيبدو [تدفق الاتصالات](https://n8n.io/workflows/2705-chat-with-github-api-documentation-rag-powered-chatbot-with-pinecone-and-openai/) في هذه الحالة كالتالي: AI agent (موصل الأدوات) -> Vector Store Question Answer Tool (موصل Vector Store) -> Pinecone Vector store.
	
## معاملات العقدة

### وضع العملية

تحتوي عقدة Vector Store هذه على خمسة أوضاع: **Get Many**، **Insert Documents**، **Retrieve Documents (As Vector Store for Chain/Tool)**، **Retrieve Documents (As Tool for AI Agent)**، و **Update Documents**. يحدد الوضع الذي تختاره العمليات التي يمكنك إجراؤها باستخدام العقدة، وما هي المدخلات والمخرجات المتاحة.

<!-- vale off -->
#### Get Many

في هذا الوضع، يمكنك استرداد مستندات متعددة من قاعدة بيانات المتجهات الخاصة بك عن طريق توفير موجه. سيتم تضمين الموجه واستخدامه للبحث عن التشابه. ستُرجع العقدة المستندات الأكثر تشابهًا مع الموجه، بالإضافة إلى درجة التشابه الخاصة بها. هذا مفيد إذا كنت ترغب في استرداد قائمة بالمستندات المتشابهة وتمريرها إلى وكيل كسياق إضافي.
<!-- vale on -->

#### إدراج المستندات

استخدم وضع Insert Documents لإدراج مستندات جديدة في قاعدة بيانات المتجهات الخاصة بك.

#### استرجاع المستندات (كمخزن متجهات للسلسلة/الأداة)

استخدم وضع Retrieve Documents (As Vector Store for Chain/Tool) مع مسترجع مخزن المتجهات لاسترجاع المستندات من قاعدة بيانات المتجهات وتوفيرها للمسترجع المتصل بسلسلة. في هذا الوضع، يجب ربط العقدة بعقدة مسترجع أو عقدة جذر.

#### استرجاع المستندات (كأداة لوكيل الذكاء الاصطناعي)

استخدم وضع Retrieve Documents (As Tool for AI Agent) لاستخدام مخزن المتجهات كمورد أداة عند الإجابة على الاستعلامات. عند صياغة الاستجابات، يستخدم الوكيل مخزن المتجهات عندما يتطابق اسم مخزن المتجهات ووصفه مع تفاصيل السؤال.

#### تحديث المستندات

استخدم وضع Update Documents لتحديث المستندات في قاعدة بيانات المتجهات باستخدام المعرّف. املأ حقل **ID** بمعرّف إدخال التضمين المراد تحديثه.

### إعادة ترتيب النتائج

يُمكّن [إعادة الترتيب](/glossary.md#ai-reranking). إذا قمت بتمكين هذا الخيار، يجب عليك ربط عقدة إعادة الترتيب بمخزن المتجهات. ستقوم تلك العقدة بعد ذلك بإعادة ترتيب النتائج للاستعلامات. يمكنك استخدام هذا الخيار مع أوضاع `Get Many` و`Retrieve Documents (As Vector Store for Chain/Tool)` و`Retrieve Documents (As Tool for AI Agent)`.

<!-- vale from-write-good.Weasel = NO -->
### معاملات Get Many
<!-- vale from-write-good.Weasel = YES -->

*   **Pinecone Index**: حدد أو أدخل فهرس Pinecone المراد استخدامه.
*   **Prompt**: أدخل استعلام البحث الخاص بك.
*   **Limit**: أدخل عدد النتائج المراد استرجاعها من مخزن المتجهات. على سبيل المثال، اضبط هذا على `10` للحصول على أفضل عشر نتائج.

### معاملات Insert Documents

*   **Pinecone Index**: حدد أو أدخل فهرس Pinecone المراد استخدامه.

### معاملات Retrieve Documents (As Vector Store for Chain/Tool)

*   **Pinecone Index**: حدد أو أدخل فهرس Pinecone المراد استخدامه.

### معاملات Retrieve Documents (As Tool for AI Agent)

*   **Name**: اسم مخزن المتجهات.
*   **Description**: اشرح لنموذج اللغة الكبير (LLM) ما تفعله هذه الأداة. يسمح الوصف الجيد والمحدد لنموذج اللغة الكبير (LLM) بإنتاج النتائج المتوقعة بشكل متكرر.
*   **Pinecone Index**: حدد أو أدخل فهرس Pinecone المراد استخدامه.
*   **Limit**: أدخل عدد النتائج المراد استرجاعها من مخزن المتجهات. على سبيل المثال، اضبط هذا على `10` للحصول على أفضل عشر نتائج.

### المعاملات لتحديث المستندات

*   المعرّف

## خيارات العقدة

### مساحة اسم Pinecone

خيار فصل آخر لكيفية تخزين بياناتك داخل الفهرس.

### مُصفّي البيانات الوصفية

متاح في وضع **الحصول على العديد**. عند البحث عن البيانات، استخدم هذا للمطابقة مع البيانات الوصفية المرتبطة بالمستند.

هذا `استعلام AND`. إذا حددت أكثر من حقل واحد لمُصفّي البيانات الوصفية، فيجب أن تتطابق جميعها.

عند إدراج البيانات، يتم تعيين البيانات الوصفية باستخدام مُحمّل المستندات. ارجع إلى [مُحمّل البيانات الافتراضي](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.documentdefaultdataloader.md) لمزيد من المعلومات حول تحميل المستندات.

### مسح مساحة الاسم

متاح في وضع **إدراج المستندات**. يحذف جميع البيانات من مساحة الاسم قبل إدراج البيانات الجديدة.

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

ارجع إلى [توثيق Pinecone الخاص بـ LangChain](https://js.langchain.com/docs/integrations/vectorstores/pinecone/) لمزيد من المعلومات حول الخدمة.

اطلع على توثيق [الذكاء الاصطناعي المتقدم](/advanced-ai/index.md) الخاص بـ n8n.

### ابحث عن فهرس Pinecone ومساحة الاسم الخاصة بك

يتوفر فهرس Pinecone ومساحة الاسم الخاصة بك في حساب Pinecone الخاص بك.

![Screenshot of a Pinecone account, with the Pinecone index labelled](/_images/integrations/builtin/cluster-nodes/vectorstorepinecone/pinecone-index-namespace.png)