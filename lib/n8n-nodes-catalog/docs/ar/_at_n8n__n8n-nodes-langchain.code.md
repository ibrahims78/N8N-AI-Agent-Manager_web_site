# عقدة LangChain Code

استخدم عقدة LangChain Code لاستيراد LangChain. هذا يعني أنه إذا كانت هناك وظائف تحتاجها ولم تُنشئ n8n عقدة لها، فلا يزال بإمكانك استخدامها. من خلال تهيئة موصلات عقدة LangChain Code، يمكنك استخدامها كعقدة عادية، أو عقدة جذر، أو عقدة فرعية.

في هذه الصفحة، ستجد معاملات العقدة، وإرشادات حول تهيئة العقدة، وروابط لموارد إضافية.

> **غير متوفر على السحابة**
>
> هذه العقدة متاحة فقط على n8n المستضافة ذاتياً.

## معاملات العقدة

### إضافة كود

أضف الكود المخصص الخاص بك. اختر إما وضع **التنفيذ (Execute)** أو **توفير البيانات (Supply Data)**. يمكنك استخدام وضع واحد فقط.

على عكس [عقدة Code](/integrations/builtin/core-nodes/n8n-nodes-base.code/index.md)، لا تدعم عقدة LangChain Code لغة بايثون (Python).

*   **التنفيذ (Execute)**: استخدم عقدة LangChain Code مثل عقدة Code الخاصة بـ n8n. تأخذ هذه العقدة بيانات المدخلات من سير العمل، وتعالجها، وتعيدها كمخرجات للعقدة. يتطلب هذا الوضع مدخلاً ومخرجاً رئيسيين. يجب عليك إنشاء هذه الاتصالات في **المدخلات (Inputs)** و**المخرجات (Outputs)**.
*   **توفير البيانات (Supply Data)**: استخدم عقدة LangChain Code كعقدة فرعية، لإرسال البيانات إلى عقدة جذر. يستخدم هذا الوضع مخرجاً بخلاف المخرج الرئيسي.

بشكل افتراضي، لا يمكنك تحميل الوحدات النمطية المدمجة أو الخارجية في هذه العقدة. يمكن للمستخدمين المستضافين ذاتياً [تمكين الوحدات النمطية المدمجة والخارجية](/hosting/configuration/configuration-methods.md).

### المدخلات

اختر أنواع المدخلات.

المدخل الرئيسي هو الموصل العادي الموجود في جميع سير العمل في n8n. إذا كان لديك مدخل ومخرج رئيسيان محددين في العقدة، فإن كود **التنفيذ (Execute)** مطلوب.

### المخرجات

اختر أنواع المخرجات.

المخرج الرئيسي هو الموصل العادي الموجود في جميع سير العمل في n8n. إذا كان لديك مدخل ومخرج رئيسيان محددين في العقدة، فإن كود **التنفيذ (Execute)** مطلوب.

## تهيئة مدخلات ومخرجات العقدة

من خلال تهيئة موصلات عقدة LangChain Code (المدخلات والمخرجات)، يمكنك استخدامها كعقدة تطبيق، أو عقدة جذر، أو عقدة فرعية.

![لقطة شاشة لسير عمل يحتوي على أربع عقد LangChain، مهيأة كأنواع مختلفة من العقد](/_images/integrations/builtin/cluster-nodes/langchaincode/create-node-types.png)

| نوع العقدة                | المدخلات                   | المخرجات                                                               | وضع الكود         |
| :------------------------ | :------------------------- | :--------------------------------------------------------------------- | :---------------- |
| عقدة تطبيق. مشابهة لـ [عقدة Code](/integrations/builtin/core-nodes/n8n-nodes-base.code/index.md). | رئيسي                     | رئيسي                                                                  | التنفيذ (Execute) |
| عقدة جذر                   | رئيسي؛ نوع واحد آخر على الأقل | رئيسي                                                                  | التنفيذ (Execute) |
| عقدة فرعية                 | -                          | نوع بخلاف الرئيسي. يجب أن يتطابق مع نوع المدخل الذي تريد الاتصال به. | توفير البيانات (Supply Data) |
| عقدة فرعية ذات عقد فرعية | نوع بخلاف الرئيسي         | نوع بخلاف الرئيسي. يجب أن يتطابق مع نوع المدخل الذي تريد الاتصال به. | توفير البيانات (Supply Data) |

## الأساليب المضمنة

توفر n8n هذه الأساليب لتسهيل أداء المهام الشائعة في عقدة LangChain Code.

| الأسلوب | الوصف |
| ------ | ----------- |
| `this.addInputData(inputName, data)` | تعبئة بيانات مدخل غير رئيسي محدد. مفيد لمحاكاة البيانات.<ul><li>`inputName` هو نوع اتصال المدخل، ويجب أن يكون أحد الأنواع التالية: `ai_agent`, `ai_chain`, `ai_document`, `ai_embedding`, `ai_languageModel`, `ai_memory`, `ai_outputParser`, `ai_retriever`, `ai_textSplitter`, `ai_tool`, `ai_vectorRetriever`, `ai_vectorStore`</li><li>`data` يحتوي على البيانات التي ترغب في إضافتها. ارجع إلى [هيكل البيانات](/data/data-structure.md) للحصول على معلومات حول هيكل البيانات المتوقع من n8n.</li></ul> |
| `this.addOutputData(outputName, data)` | تعبئة بيانات مخرج غير رئيسي محدد. مفيد لمحاكاة البيانات.<ul><li>`outputName` هو نوع اتصال المدخل، ويجب أن يكون أحد الأنواع التالية: `ai_agent`, `ai_chain`, `ai_document`, `ai_embedding`, `ai_languageModel`, `ai_memory`, `ai_outputParser`, `ai_retriever`, `ai_textSplitter`, `ai_tool`, `ai_vectorRetriever`, `ai_vectorStore`</li><li>`data` يحتوي على البيانات التي ترغب في إضافتها. ارجع إلى [هيكل البيانات](/data/data-structure.md) للحصول على معلومات حول هيكل البيانات المتوقع من n8n.</li></ul> |
| `this.getInputConnectionData(inputName, itemIndex, inputIndex?)` | الحصول على بيانات من مدخل غير رئيسي محدد.<ul><li>`inputName` هو نوع اتصال المدخل، ويجب أن يكون أحد الأنواع التالية: `ai_agent`, `ai_chain`, `ai_document`, `ai_embedding`, `ai_languageModel`, `ai_memory`, `ai_outputParser`, `ai_retriever`, `ai_textSplitter`, `ai_tool`, `ai_vectorRetriever`, `ai_vectorStore`</li><li>`itemIndex` يجب أن يكون دائمًا `0` (سيتم استخدام هذا المعامل في وظائف قادمة)</li><li>استخدم `inputIndex` إذا كانت هناك أكثر من عقدة متصلة بالمدخل المحدد.</li></ul> |
| `this.getInputData(inputIndex?, inputName?)` | الحصول على بيانات من المدخل الرئيسي. |
| `this.getNode()` | الحصول على العقدة الحالية. |
| `this.getNodeOutputs()` | الحصول على مخرجات العقدة الحالية. |
| `this.getExecutionCancelSignal()` | استخدم هذا لإيقاف تنفيذ دالة عند توقف سير العمل. في معظم الحالات، تتولى n8n معالجة ذلك، ولكن قد تحتاج إلى استخدامه إذا كنت تقوم بإنشاء سلاسل أو وكلاء خاصة بك. إنه يحل محل كود [Cancelling a running LLMChain](https://js.langchain.com/docs/modules/chains/foundational/llm_chain#cancelling-a-running-llmchain) الذي قد تستخدمه إذا كنت تقوم بإنشاء تطبيق LangChain بشكل طبيعي. |

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

اطلع على توثيق n8n الخاص بـ [الذكاء الاصطناعي المتقدم](/advanced-ai/index.md).