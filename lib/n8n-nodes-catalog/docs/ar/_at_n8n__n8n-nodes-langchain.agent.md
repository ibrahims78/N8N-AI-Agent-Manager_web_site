# عقدة وكيل الذكاء الاصطناعي (AI Agent)

وكيل الذكاء الاصطناعي (AI agent) هو نظام مستقل يستقبل البيانات، ويتخذ قرارات منطقية، ويعمل ضمن بيئته لتحقيق أهداف محددة. بيئة وكيل الذكاء الاصطناعي هي كل ما يمكن للوكيل الوصول إليه وليس الوكيل نفسه. يستخدم هذا الوكيل أدوات خارجية (tools) وواجهات برمجة التطبيقات (APIs) لتنفيذ الإجراءات واسترداد المعلومات. يمكنه فهم قدرات الأدوات المختلفة وتحديد الأداة التي يجب استخدامها حسب المهمة.

> **ربط أداة**
>
> يجب عليك ربط عقدة فرعية (sub-node) واحدة على الأقل من نوع أداة بعقدة وكيل الذكاء الاصطناعي (AI Agent).

> **نوع الوكيل**
>
> قبل الإصدار 1.82.0، كانت عقدة وكيل الذكاء الاصطناعي (AI Agent) تحتوي على إعداد للعمل بأنواع وكلاء مختلفة. تمت إزالة هذا الآن، وتعمل جميع عقد وكيل الذكاء الاصطناعي (AI Agent) كـ `Tools Agent`، والذي كان الإعداد الموصى به والأكثر استخدامًا. إذا كنت تعمل بإصدارات أقدم من وكيل الذكاء الاصطناعي (AI Agent) في سير العمل أو القوالب، طالما أنها كانت مضبوطة على 'Tools Agent'، فيجب أن تستمر في العمل كما هو متوقع مع العقدة المحدثة.

## القوالب والأمثلة
<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

ارجع إلى [توثيق LangChain حول الوكلاء](https://js.langchain.com/docs/concepts/agents/) لمزيد من المعلومات حول الخدمة.

هل أنت جديد على وكلاء الذكاء الاصطناعي؟ اقرأ [مقدمة مدونة n8n لوكلاء الذكاء الاصطناعي](https://blog.n8n.io/ai-agents/).

اطلع على [توثيق n8n للذكاء الاصطناعي المتقدم](/advanced-ai/index.md).

## المشكلات الشائعة

للاطلاع على الأخطاء أو المشكلات الشائعة وخطوات الحل المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/common-issues.md).

---

# المشكلات الشائعة في عقدة وكيل الذكاء الاصطناعي (AI Agent)

فيما يلي بعض الأخطاء والمشكلات الشائعة في [عقدة وكيل الذكاء الاصطناعي (AI Agent)](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md) وخطوات حلها أو استكشافها.

## خطأ داخلي: 400 قيمة غير صالحة لـ 'content'

قد تبدو رسالة الخطأ الكاملة كما يلي:

```
Internal error
Error: 400 Invalid value for 'content': expected a string, got null.
<stack-trace>
```

يمكن أن يحدث هذا الخطأ إذا كان مدخل **Prompt** يحتوي على قيمة فارغة (null).

قد ترى هذا في أحد السيناريوهين التاليين:

1.  عندما تكون قد ضبطت **Prompt** على **Define below** ولديك تعبير في **Text** الخاص بك لا يُنشئ قيمة.
    *   لحل المشكلة، تأكد من أن تعبيراتك تشير إلى حقول صالحة وأنها تُحل إلى مدخلات صالحة بدلاً من قيمة فارغة (null).
2.  عندما تكون قد ضبطت **Prompt** على **Connected Chat Trigger Node** والبيانات الواردة تحتوي على قيم فارغة (null).
    *   لحل المشكلة، أزل أي قيم فارغة (null) من حقل `chatInput` في عقدة المدخلات.

## خطأ في العقدة الفرعية Simple Memory

يظهر هذا الخطأ عندما تواجه n8n مشكلة مع العقدة الفرعية [Simple Memory](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.memorybufferwindow/index.md).

يحدث هذا غالبًا عندما يستخدم سير العمل الخاص بك أو قالب سير العمل الذي نسخته إصدارًا أقدم من عقدة Simple Memory (المعروفة سابقًا باسم "Window Buffer Memory").

حاول إزالة عقدة Simple Memory من سير العمل الخاص بك وإعادة إضافتها، مما يضمن استخدامك لأحدث إصدار من العقدة.

## خطأ: يجب توصيل عقدة فرعية من نوع Chat Model

يظهر هذا الخطأ عندما تحاول n8n تنفيذ العقدة دون توصيل Chat Model.

لحل هذه المشكلة، انقر على زر + Chat Model في أسفل الشاشة عندما تكون العقدة مفتوحة، أو انقر على موصل Chat Model + عندما تكون العقدة مغلقة. ستفتح n8n بعد ذلك مجموعة مختارة من Chat Models المحتملة للاختيار من بينها.

## خطأ: لم يتم تحديد موجه

يحدث هذا الخطأ عندما يتوقع الوكيل الحصول على الموجه تلقائيًا من العقدة السابقة. يحدث هذا عادةً عند استخدام [عقدة Chat Trigger](/integrations/builtin/core-nodes/n8n-nodes-langchain.chattrigger/index.md).

لحل هذه المشكلة، ابحث عن المعامل **Prompt** لعقدة AI Agent وقم بتغييره من **Connected Chat Trigger Node** إلى **Define below**. يتيح لك هذا بناء الموجه يدويًا عن طريق الإشارة إلى بيانات المخرجات من العقد الأخرى أو عن طريق إضافة نص ثابت.

---

# عقدة Conversational AI Agent

> **ميزة تمت إزالتها**
>
> أزالت n8n هذه الوظيفة في فبراير 2025.

يُجري وكيل المحادثة (Conversational Agent) محادثات شبيهة بالمحادثات البشرية. يمكنه الحفاظ على السياق، وفهم نية المستخدم، وتقديم إجابات ذات صلة. يُستخدم هذا الوكيل عادةً لبناء روبوتات الدردشة والمساعدين الافتراضيين وأنظمة دعم العملاء.

يصف وكيل المحادثة (Conversational Agent) [الأدوات](/glossary.md#ai-tool) في موجه النظام ويحلل استجابات JSON لاستدعاءات الأدوات. إذا كان نموذج الذكاء الاصطناعي المفضل لديك لا يدعم استدعاء الأدوات أو كنت تتعامل مع تفاعلات أبسط، فإن هذا الوكيل يعد خيارًا عامًا جيدًا. إنه أكثر مرونة ولكنه قد يكون أقل دقة من [وكيل الأدوات (Tools Agent)](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/tools-agent.md).

ارجع إلى [AI Agent](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md) لمزيد من المعلومات حول عقدة AI Agent نفسها.

--8<-- "_snippets/integrations/builtin/cluster-nodes/use-with-chat-trigger.md"

## معاملات العقدة

قم بتكوين وكيل المحادثة باستخدام المعاملات التالية.

### Prompt

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/prompt.md"

### Require Specific Output Format

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/output-format.md"

## خيارات العقدة

حسّن سلوك عقدة وكيل المحادثة باستخدام هذه الخيارات:

### Human Message

أخبر الوكيل عن الأدوات التي يمكنه استخدامها وأضف سياقًا لمدخلات المستخدم.

يجب عليك تضمين هذه التعبيرات والمتغيرات:

*   `{tools}`: تعبير LangChain يوفر سلسلة من الأدوات التي قمت بتوصيلها بالوكيل. قدم بعض السياق أو الشرح حول من يجب أن يستخدم الأدوات وكيف يجب استخدامها.
*   `{format_instructions}`: تعبير LangChain يوفر المخطط أو التنسيق من عقدة محلل المخرجات التي قمت بتوصيلها. نظرًا لأن التعليمات بحد ذاتها هي سياق، فلا تحتاج إلى توفير سياق لهذا التعبير.
*   ``: متغير LangChain يحتوي على مطالبة المستخدم. يتم ملء هذا المتغير بقيمة المعامل **Prompt**. قدم بعض السياق بأن هذا هو مدخل المستخدم.

إليك مثال على كيفية استخدامك لهذه السلاسل:

مثال:

```
TOOLS
------
Assistant can ask the user to use tools to look up information that may be helpful in answering the user's original question. The tools the human can use are:

{tools}

{format_instructions}

USER'S INPUT
--------------------
Here is the user's input (remember to respond with a markdown code snippet of a JSON blob with a single action, and NOTHING else):

```

### System Message

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/system-message.md"

### Max Iterations

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/max-iterations.md"

### Return Intermediate Steps

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/return-intermediate-steps.md"

### Tracing Metadata

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/tracing-metadata.md"

## القوالب والأمثلة

ارجع إلى قسم [القوالب والأمثلة](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md#templates-and-examples) الخاص بعقدة وكيل الذكاء الاصطناعي الرئيسية.

## المشكلات الشائعة

للاستفسارات أو المشكلات الشائعة والحلول المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/common-issues.md).

---

# عقدة وكيل وظائف OpenAI

استخدم عقدة وكيل وظائف OpenAI (OpenAI Functions Agent) لاستخدام [نموذج وظائف OpenAI](https://platform.openai.com/docs/guides/function-calling). هذه نماذج تكتشف متى يجب استدعاء دالة وتستجيب بالمدخلات التي يجب تمريرها إلى الدالة.

ارجع إلى [وكيل الذكاء الاصطناعي](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md) لمزيد من المعلومات حول عقدة وكيل الذكاء الاصطناعي (AI Agent) نفسها.

--8<-- "_snippets/integrations/builtin/cluster-nodes/use-with-chat-trigger.md"

> **نموذج دردشة OpenAI مطلوب**
>
> يجب عليك استخدام [نموذج دردشة OpenAI](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatopenai/index.md) مع هذا الوكيل.

## معاملات العقدة

قم بتكوين وكيل وظائف OpenAI (OpenAI Functions Agent) باستخدام المعاملات التالية.

### الموجه

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/prompt.md"

### طلب تنسيق مخرجات محدد

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/output-format.md"

## خيارات العقدة

صقل سلوك عقدة وكيل وظائف OpenAI (OpenAI Functions Agent) باستخدام هذه الخيارات:

### رسالة النظام

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/system-message.md"

### الحد الأقصى للتكرارات

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/max-iterations.md"

### إرجاع الخطوات الوسيطة

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/return-intermediate-steps.md"

### بيانات تتبع التعريف الوصفية

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/tracing-metadata.md"

## القوالب والأمثلة

ارجع إلى قسم [القوالب والأمثلة](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md#templates-and-examples) الخاص بعقدة وكيل الذكاء الاصطناعي (AI Agent) الرئيسية.

## المشكلات الشائعة

للاستفسارات أو المشكلات الشائعة والحلول المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/common-issues.md).

---

# عقدة وكيل التخطيط والتنفيذ (Plan and Execute Agent)

يشبه وكيل التخطيط والتنفيذ (Plan and Execute Agent) وكيل ReAct، ولكنه يركز على التخطيط. يقوم أولاً بإنشاء خطة عالية المستوى لحل المهمة المحددة ثم ينفذ الخطة خطوة بخطوة. يُعد هذا الوكيل مفيدًا بشكل خاص للمهام التي تتطلب نهجًا منظمًا وتخطيطًا دقيقًا.

ارجع إلى [وكيل الذكاء الاصطناعي (AI Agent)](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md) لمزيد من المعلومات حول عقدة وكيل الذكاء الاصطناعي نفسها.

## معاملات العقدة

قم بتكوين وكيل التخطيط والتنفيذ (Plan and Execute Agent) باستخدام المعاملات التالية.

### الموجه

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/prompt.md"

### طلب تنسيق مخرجات محدد

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/output-format.md"

## خيارات العقدة

حسّن سلوك عقدة وكيل التخطيط والتنفيذ (Plan and Execute Agent) باستخدام هذه الخيارات:

### قالب رسالة المستخدم

أدخل رسالة سترسلها n8n إلى الوكيل أثناء تنفيذ كل خطوة.

تعبيرات LangChain المتاحة:

*   `{previous_steps}`: يحتوي على معلومات حول الخطوات السابقة التي أكملها الوكيل بالفعل.
*   `{current_step}`: يحتوي على معلومات حول الخطوة الحالية.
*   `{agent_scratchpad}`: معلومات لتذكرها للتكرار التالي.

### بيانات تتبع التعريف

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/tracing-metadata.md"

## القوالب والأمثلة

ارجع إلى قسم [القوالب والأمثلة](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md#templates-and-examples) الخاص بعقدة وكيل الذكاء الاصطناعي (AI Agent) الرئيسية.

## المشكلات الشائعة

للأسئلة أو المشكلات الشائعة والحلول المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/common-issues.md).

---

# عقدة وكيل ReAct للذكاء الاصطناعي (ReAct AI Agent)

> **ميزة تمت إزالتها**
>
> أزالت n8n هذه الوظيفة في فبراير 2025.

تطبق عقدة وكيل ReAct (ReAct Agent) منطق [ReAct](https://react-lm.github.io/). يجمع ReAct (الاستدلال والتصرف) بين قدرات الاستدلال لتوجيه سلسلة الأفكار وتوليد خطة العمل.

يستدل وكيل ReAct (ReAct Agent) حول مهمة معينة، ويحدد الإجراءات الضرورية، ثم ينفذها. يتبع دورة الاستدلال والتصرف حتى يكمل المهمة. يمكن لوكيل ReAct تقسيم المهام المعقدة إلى مهام فرعية أصغر، وتحديد أولوياتها، وتنفيذها الواحدة تلو الأخرى.

ارجع إلى [وكيل الذكاء الاصطناعي (AI Agent)](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md) لمزيد من المعلومات حول عقدة وكيل الذكاء الاصطناعي نفسها.

> **لا توجد ذاكرة**
>
> لا يدعم وكيل ReAct (ReAct Agent) العقد الفرعية للذاكرة. هذا يعني أنه لا يمكنه استدعاء الموجهات السابقة أو محاكاة محادثة مستمرة.

## معاملات العقدة

قم بتهيئة وكيل ReAct باستخدام المعاملات التالية.

### الموجه

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/prompt.md"

### طلب تنسيق مخرجات محدد

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/output-format.md"

## خيارات العقدة

استخدم الخيارات لإنشاء رسالة لإرسالها إلى الوكيل في بداية المحادثة. يعتمد نوع الرسالة على النموذج الذي تستخدمه:

*   **نماذج الدردشة**: تحتوي هذه النماذج على مفهوم ثلاثة مكونات تتفاعل (الذكاء الاصطناعي، النظام، والإنسان). يمكنها استقبال رسائل النظام ورسائل الإنسان (الموجهات).
*   **نماذج التعليمات**: لا تحتوي هذه النماذج على مفهوم مكونات منفصلة للذكاء الاصطناعي، النظام، والإنسان. تستقبل نصًا واحدًا، وهو رسالة التعليمات.

### قالب رسالة الإنسان

استخدم هذا الخيار لتوسيع موجه المستخدم. هذه طريقة للوكيل لتمرير المعلومات من تكرار إلى آخر.

تعبيرات LangChain المتاحة:

*   `{input}`: يحتوي على موجه المستخدم.
*   `{agent_scratchpad}`: معلومات لتذكرها للتكرار التالي.

### رسالة البادئة

أدخل نصًا ليكون بادئة لقائمة الأدوات في بداية المحادثة. لا تحتاج إلى إضافة قائمة الأدوات. يضيف LangChain قائمة الأدوات تلقائيًا.

### رسالة اللاحقة لنموذج الدردشة

أضف نصًا ليلحق بعد قائمة الأدوات في بداية المحادثة عندما يستخدم الوكيل نموذج دردشة. لا تحتاج إلى إضافة قائمة الأدوات. يضيف LangChain قائمة الأدوات تلقائيًا.

### رسالة اللاحقة للنموذج العادي

أضف نصًا ليلحق بعد قائمة الأدوات في بداية المحادثة عندما يستخدم الوكيل نموذجًا عاديًا/تعليميًا. لا تحتاج إلى إضافة قائمة الأدوات. يضيف LangChain قائمة الأدوات تلقائيًا.

### إرجاع الخطوات الوسيطة

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/return-intermediate-steps.md"

### بيانات تتبع التعريف

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/tracing-metadata.md"

## الموارد ذات الصلة

ارجع إلى توثيق [وكلاء ReAct](https://js.langchain.com/docs/concepts/agents/) الخاص بـ LangChain لمزيد من المعلومات.

## القوالب والأمثلة

ارجع إلى قسم [القوالب والأمثلة](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md#templates-and-examples) الخاص بالعقدة الرئيسية AI Agent.

## المشكلات الشائعة

للاطلاع على الأسئلة أو المشكلات الشائعة والحلول المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/common-issues.md).

---

# عقدة SQL AI Agent

> **الميزة مُزالة**
>
> أزالت n8n هذه الوظيفة في فبراير 2025.

تستخدم عقدة SQL Agent قاعدة بيانات SQL كمصدر للبيانات. يمكنها فهم الأسئلة باللغة الطبيعية، وتحويلها إلى استعلامات SQL، وتنفيذ الاستعلامات، وتقديم النتائج بتنسيق سهل الاستخدام. تُعد هذه العقدة ذات قيمة لبناء واجهات لغة طبيعية لقواعد البيانات.

ارجع إلى [AI Agent](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md) لمزيد من المعلومات حول عقدة AI Agent نفسها.

## معاملات العقدة

يمكن تهيئة عقدة SQL Agent باستخدام المعاملات التالية.

### مصدر البيانات

اختر قاعدة البيانات لاستخدامها كمصدر للبيانات للعقدة. تشمل الخيارات:

*   **MySQL**: حدد هذا الخيار لاستخدام قاعدة بيانات MySQL.
    *   حدد أيضًا **بيانات اعتماد MySQL**.
*   **SQLite**: حدد هذا الخيار لاستخدام قاعدة بيانات SQLite.
    *   يجب عليك إضافة عقدة [Read/Write File From Disk](/integrations/builtin/core-nodes/n8n-nodes-base.readwritefile.md) قبل عقدة Agent لقراءة ملف SQLite الخاص بك.
    *   أدخل أيضًا اسم **Input Binary Field** لملف SQLite الخاص بك القادم من عقدة Read/Write File From Disk.
*   **Postgres**: حدد هذا الخيار لاستخدام قاعدة بيانات Postgres.
    *   حدد أيضًا **بيانات اعتماد Postgres**.

> **عقد Postgres و MySQL Agent**
>
> إذا كنت تستخدم [Postgres](/integrations/builtin/credentials/postgres.md) أو [MySQL](/integrations/builtin/credentials/mysql.md)، فإن هذه العقدة لا تدعم خيارات نفق بيانات الاعتماد.

### المُطالبة

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/prompt.md"

## خيارات العقدة

صقل سلوك عقدة SQL Agent باستخدام هذه الخيارات:

### الجداول المتجاهلة

إذا كنت ترغب في أن تتجاهل العقدة أي جداول من قاعدة البيانات، فأدخل قائمة بالجداول مفصولة بفواصل ترغب في تجاهلها.

إذا تُرك فارغًا، فلن تتجاهل العقدة أي جداول.

### تضمين صفوف العينات

أدخل عدد صفوف العينات لتضمينها في الموجه إلى الوكيل. الافتراضي هو `3`.

تساعد صفوف العينات الوكيل على فهم المخطط (Schema) الخاص بقاعدة البيانات، ولكنها تزيد أيضًا من عدد الرموز المميزة المستخدمة.

### الجداول المضمنة

إذا كنت ترغب فقط في تضمين جداول (Tables) محددة من قاعدة البيانات، فأدخل قائمة مفصولة بفواصل من الجداول (Tables) لتضمينها.

إذا تُرك فارغًا، يقوم الوكيل بتضمين جميع الجداول (Tables).

### موجه البادئة

أدخل رسالة ترغب في إرسالها إلى الوكيل قبل نص **الموجه**. يمكن لهذه الرسالة الأولية توفير المزيد من السياق والإرشادات للوكيل حول ما يمكنه وما لا يمكنه فعله، وكيفية تنسيق الاستجابة.

يملأ n8n هذا الحقل بمثال.

### موجه اللاحقة

أدخل رسالة ترغب في إرسالها إلى الوكيل بعد نص **الموجه**.

تعبيرات LangChain المتاحة:

* `{chatHistory}`: سجل للرسائل في هذه المحادثة، مفيد للحفاظ على السياق.
* `{input}`: يحتوي على موجه المستخدم.
* `{agent_scratchpad}`: معلومات لتذكرها للتكرار التالي.

يملأ n8n هذا الحقل بمثال.

### الحد الأقصى

أدخل الحد الأقصى لعدد النتائج المراد إرجاعها.

الافتراضي هو `10`.

### بيانات تعريف التتبع

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/tracing-metadata.md"

## القوالب والأمثلة

ارجع إلى قسم [القوالب والأمثلة](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md#templates-and-examples) الخاص بالعقدة (Node) الرئيسية لوكيل الذكاء الاصطناعي (AI Agent).

## المشكلات الشائعة

للأسئلة أو المشكلات الشائعة والحلول المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/common-issues.md).

---

# عقدة وكيل الأدوات (Tools AI Agent)

يستخدم وكيل الأدوات (Tools Agent) [أدوات](/glossary.md#ai-tool) وواجهات برمجة تطبيقات (APIs) خارجية لتنفيذ الإجراءات واسترداد المعلومات. يمكنه فهم قدرات الأدوات المختلفة وتحديد الأداة التي يجب استخدامها بناءً على المهمة. يساعد هذا الوكيل في تكامل نماذج اللغة الكبيرة (LLMs) مع مختلف الخدمات وقواعد البيانات الخارجية.

يتمتع هذا الوكيل بقدرة معززة على العمل مع الأدوات ويمكنه ضمان تنسيق مخرجات (Output) قياسي.

يطبق وكيل الأدوات (Tools Agent) واجهة [استدعاء الأدوات (tool calling) الخاصة بـ Langchain](https://js.langchain.com/docs/concepts/tool_calling/). تصف هذه الواجهة الأدوات المتاحة ومخططاتها (Schemas). يتمتع الوكيل أيضًا بقدرات تحليل مخرجات (Output) محسّنة، حيث يمرر المحلل إلى النموذج كأداة تنسيق.

ارجع إلى [وكيل الذكاء الاصطناعي (AI Agent)](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md) لمزيد من المعلومات حول عقدة (Node) وكيل الذكاء الاصطناعي (AI Agent) نفسها.

--8<-- "_snippets/integrations/builtin/cluster-nodes/use-with-chat-trigger.md"

يدعم هذا الوكيل نماذج الدردشة التالية:

* [نموذج دردشة OpenAI](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatopenai/index.md)
* [نموذج دردشة Groq](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatgroq.md)
* [نموذج دردشة Mistral Cloud](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatmistralcloud.md)
* [نموذج دردشة Anthropic](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatanthropic.md)
* [نموذج دردشة Azure OpenAI](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatazureopenai.md)

??? Details "يمكن لوكيل الأدوات (Tools Agent) استخدام الأدوات التالية..."
    * [استدعاء سير عمل (Workflow) n8n](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolworkflow.md)
    * [الكود](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolcode.md)
    * [طلب HTTP](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolhttprequest.md)

*   [Action Network](/integrations/builtin/app-nodes/n8n-nodes-base.actionnetwork.md)
*   [ActiveCampaign](/integrations/builtin/app-nodes/n8n-nodes-base.activecampaign.md)
*   [Affinity](/integrations/builtin/app-nodes/n8n-nodes-base.affinity.md)
*   [Agile CRM](/integrations/builtin/app-nodes/n8n-nodes-base.agilecrm.md)
*   [Airtable](/integrations/builtin/app-nodes/n8n-nodes-base.airtable/index.md)
*   [APITemplate.io](/integrations/builtin/app-nodes/n8n-nodes-base.apitemplateio.md)
*   [Asana](/integrations/builtin/app-nodes/n8n-nodes-base.asana.md)
*   [AWS Lambda](/integrations/builtin/app-nodes/n8n-nodes-base.awslambda.md)
*   [AWS S3](/integrations/builtin/app-nodes/n8n-nodes-base.awss3.md)
*   [AWS SES](/integrations/builtin/app-nodes/n8n-nodes-base.awsses.md)
*   [AWS Textract](/integrations/builtin/app-nodes/n8n-nodes-base.awstextract.md)
*   [AWS Transcribe](/integrations/builtin/app-nodes/n8n-nodes-base.awstranscribe.md)
*   [Baserow](/integrations/builtin/app-nodes/n8n-nodes-base.baserow.md)
*   [Bubble](/integrations/builtin/app-nodes/n8n-nodes-base.bubble.md)
*   [Calculator](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolcalculator.md)
*   [ClickUp](/integrations/builtin/app-nodes/n8n-nodes-base.clickup.md)
*   [CoinGecko](/integrations/builtin/app-nodes/n8n-nodes-base.coingecko.md)
*   [Compression](/integrations/builtin/core-nodes/n8n-nodes-base.compression.md)
*   [Crypto](/integrations/builtin/core-nodes/n8n-nodes-base.crypto.md)
*   [DeepL](/integrations/builtin/app-nodes/n8n-nodes-base.deepl.md)
*   [DHL](/integrations/builtin/app-nodes/n8n-nodes-base.dhl.md)
*   [Discord](/integrations/builtin/app-nodes/n8n-nodes-base.discord/index.md)
*   [Dropbox](/integrations/builtin/app-nodes/n8n-nodes-base.dropbox.md)
*   [Elasticsearch](/integrations/builtin/app-nodes/n8n-nodes-base.elasticsearch.md)
*   [ERPNext](/integrations/builtin/app-nodes/n8n-nodes-base.erpnext.md)
*   [Facebook Graph API](/integrations/builtin/app-nodes/n8n-nodes-base.facebookgraphapi.md)
*   [FileMaker](/integrations/builtin/app-nodes/n8n-nodes-base.filemaker.md)
*   [Ghost](/integrations/builtin/app-nodes/n8n-nodes-base.ghost.md)
*   [Git](/integrations/builtin/core-nodes/n8n-nodes-base.git.md)
*   [GitHub](/integrations/builtin/app-nodes/n8n-nodes-base.github.md)
*   [GitLab](/integrations/builtin/app-nodes/n8n-nodes-base.gitlab.md)
*   [Gmail](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/index.md)
*   [Google Analytics](/integrations/builtin/app-nodes/n8n-nodes-base.googleanalytics.md)
*   [Google BigQuery](/integrations/builtin/app-nodes/n8n-nodes-base.googlebigquery.md)
*   [Google Calendar](/integrations/builtin/app-nodes/n8n-nodes-base.googlecalendar/index.md)
*   [Google Chat](/integrations/builtin/app-nodes/n8n-nodes-base.googlechat.md)
*   [Google Cloud Firestore](/integrations/builtin/app-nodes/n8n-nodes-base.googlecloudfirestore.md)
*   [Google Cloud Realtime Database](/integrations/builtin/app-nodes/n8n-nodes-base.googlecloudrealtimedatabase.md)
*   [Google Contacts](/integrations/builtin/app-nodes/n8n-nodes-base.googlecontacts.md)
*   [Google Docs](/integrations/builtin/app-nodes/n8n-nodes-base.googledocs.md)
*   [Google Drive](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/index.md)
*   [Google Sheets](/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/index.md)
*   [Google Slides](/integrations/builtin/app-nodes/n8n-nodes-base.googleslides.md)

* [Google Tasks (مهام جوجل)](/integrations/builtin/app-nodes/n8n-nodes-base.googletasks.md)
* [Google Translate (ترجمة جوجل)](/integrations/builtin/app-nodes/n8n-nodes-base.googletranslate.md)
* [Google Workspace Admin (إدارة مساحة عمل جوجل)](/integrations/builtin/app-nodes/n8n-nodes-base.gsuiteadmin.md)
* [Gotify (نظام إشعارات)](/integrations/builtin/app-nodes/n8n-nodes-base.gotify.md)
* [Grafana (منصة تحليل ومراقبة)](/integrations/builtin/app-nodes/n8n-nodes-base.grafana.md)
* [GraphQL (لغة استعلام للـ API)](/integrations/builtin/core-nodes/n8n-nodes-base.graphql.md)
* [Hacker News (أخبار هاكر)](/integrations/builtin/app-nodes/n8n-nodes-base.hackernews.md)
* [Home Assistant (مساعد المنزل)](/integrations/builtin/app-nodes/n8n-nodes-base.homeassistant.md)
* [HubSpot (منصة تسويق ومبيعات)](/integrations/builtin/app-nodes/n8n-nodes-base.hubspot.md)
* [Jenkins (خادم أتمتة)](/integrations/builtin/app-nodes/n8n-nodes-base.jenkins.md)
* [Jira Software (برنامج جيرا)](/integrations/builtin/app-nodes/n8n-nodes-base.jira.md)
* [JWT (رمز ويب JSON)](/integrations/builtin/core-nodes/n8n-nodes-base.jwt.md)
* [Kafka (منصة بث موزع)](/integrations/builtin/app-nodes/n8n-nodes-base.kafka.md)
* [LDAP (بروتوكول الوصول إلى الدليل الخفيف)](/integrations/builtin/core-nodes/n8n-nodes-base.ldap.md)
* [Line (تطبيق مراسلة)](/integrations/builtin/app-nodes/n8n-nodes-base.line.md)
* [LinkedIn (شبكة مهنية)](/integrations/builtin/app-nodes/n8n-nodes-base.linkedin.md)
* [Mailcheck (خدمة التحقق من البريد الإلكتروني)](/integrations/builtin/app-nodes/n8n-nodes-base.mailcheck.md)
* [Mailgun (خدمة بريد إلكتروني للمطورين)](/integrations/builtin/app-nodes/n8n-nodes-base.mailgun.md)
* [Mattermost (منصة مراسلة للفرق)](/integrations/builtin/app-nodes/n8n-nodes-base.mattermost.md)
* [Mautic (منصة أتمتة التسويق)](/integrations/builtin/app-nodes/n8n-nodes-base.mautic.md)
* [Medium (منصة نشر محتوى)](/integrations/builtin/app-nodes/n8n-nodes-base.medium.md)
* [Microsoft Excel 365 (برنامج جداول بيانات)](/integrations/builtin/app-nodes/n8n-nodes-base.microsoftexcel.md)
* [Microsoft OneDrive (خدمة تخزين سحابي)](/integrations/builtin/app-nodes/n8n-nodes-base.microsoftonedrive.md)
* [Microsoft Outlook (عميل بريد إلكتروني)](/integrations/builtin/app-nodes/n8n-nodes-base.microsoftoutlook.md)
* [Microsoft SQL (قاعدة بيانات مايكروسوفت SQL)](/integrations/builtin/app-nodes/n8n-nodes-base.microsoftsql.md)
* [Microsoft Teams (منصة تعاون)](/integrations/builtin/app-nodes/n8n-nodes-base.microsoftteams.md)
* [Microsoft To Do (تطبيق إدارة المهام)](/integrations/builtin/app-nodes/n8n-nodes-base.microsofttodo.md)
* [Monday.com (منصة إدارة عمل)](/integrations/builtin/app-nodes/n8n-nodes-base.mondaycom.md)
* [MongoDB (قاعدة بيانات NoSQL)](/integrations/builtin/app-nodes/n8n-nodes-base.mongodb.md)
* [MQTT (بروتوكول مراسلة إنترنت الأشياء)](/integrations/builtin/app-nodes/n8n-nodes-base.mqtt.md)
* [MySQL (قاعدة بيانات علائقية)](/integrations/builtin/app-nodes/n8n-nodes-base.mysql/index.md)
* [NASA (وكالة الفضاء الأمريكية)](/integrations/builtin/app-nodes/n8n-nodes-base.nasa.md)
* [Nextcloud (منصة سحابية خاصة)](/integrations/builtin/app-nodes/n8n-nodes-base.nextcloud.md)
* [NocoDB (قاعدة بيانات مفتوحة المصدر)](/integrations/builtin/app-nodes/n8n-nodes-base.nocodb.md)
* [Notion (مساحة عمل متكاملة)](/integrations/builtin/app-nodes/n8n-nodes-base.notion/index.md)
* [Odoo (نظام تخطيط موارد المؤسسات)](/integrations/builtin/app-nodes/n8n-nodes-base.odoo.md)
* [OpenWeatherMap (خدمة بيانات الطقس)](/integrations/builtin/app-nodes/n8n-nodes-base.openweathermap.md)
* [Pipedrive (نظام إدارة علاقات العملاء)](/integrations/builtin/app-nodes/n8n-nodes-base.pipedrive.md)
* [Postgres (قاعدة بيانات PostgreSQL)](/integrations/builtin/app-nodes/n8n-nodes-base.postgres/index.md)
* [Pushover (خدمة إشعارات فورية)](/integrations/builtin/app-nodes/n8n-nodes-base.pushover.md)
* [QuickBooks Online (برنامج محاسبة)](/integrations/builtin/app-nodes/n8n-nodes-base.quickbooks.md)
* [QuickChart (خدمة إنشاء رسوم بيانية)](/integrations/builtin/app-nodes/n8n-nodes-base.quickchart.md)
* [RabbitMQ (وسيط رسائل)](/integrations/builtin/app-nodes/n8n-nodes-base.rabbitmq.md)
* [Reddit (منصة مجتمعات ومناقشات)](/integrations/builtin/app-nodes/n8n-nodes-base.reddit.md)
* [Redis (مخزن بيانات في الذاكرة)](/integrations/builtin/app-nodes/n8n-nodes-base.redis.md)

* [RocketChat](/integrations/builtin/app-nodes/n8n-nodes-base.rocketchat.md)
* [S3](/integrations/builtin/app-nodes/n8n-nodes-base.s3.md)
* [Salesforce](/integrations/builtin/app-nodes/n8n-nodes-base.salesforce.md)
* [Send Email](/integrations/builtin/core-nodes/n8n-nodes-base.sendemail.md)
* [SendGrid](/integrations/builtin/app-nodes/n8n-nodes-base.sendgrid.md)
* [SerpApi (Google Search)](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolserpapi.md)
* [Shopify](/integrations/builtin/app-nodes/n8n-nodes-base.shopify.md)
* [Slack](/integrations/builtin/app-nodes/n8n-nodes-base.slack.md)
* [Spotify](/integrations/builtin/app-nodes/n8n-nodes-base.spotify.md)
* [Stripe](/integrations/builtin/app-nodes/n8n-nodes-base.stripe.md)
* [Supabase](/integrations/builtin/app-nodes/n8n-nodes-base.supabase/index.md)
* [Telegram](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/index.md)
* [Todoist](/integrations/builtin/app-nodes/n8n-nodes-base.todoist.md)
* [TOTP](/integrations/builtin/core-nodes/n8n-nodes-base.totp.md)
* [Trello](/integrations/builtin/app-nodes/n8n-nodes-base.trello.md)
* [Twilio](/integrations/builtin/app-nodes/n8n-nodes-base.twilio.md)
* [urlscan.io](/integrations/builtin/app-nodes/n8n-nodes-base.urlscanio.md)
* [Vector Store](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolvectorstore.md)
* [Webflow](/integrations/builtin/app-nodes/n8n-nodes-base.webflow.md)
* [Wikipedia](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolwikipedia.md)
* [Wolfram|Alpha](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolwolframalpha.md)
* [WooCommerce](/integrations/builtin/app-nodes/n8n-nodes-base.woocommerce.md)
* [Wordpress](/integrations/builtin/app-nodes/n8n-nodes-base.wordpress.md)
* [X (Formerly Twitter)](/integrations/builtin/app-nodes/n8n-nodes-base.twitter.md)
* [YouTube](/integrations/builtin/app-nodes/n8n-nodes-base.youtube.md)
* [Zendesk](/integrations/builtin/app-nodes/n8n-nodes-base.zendesk.md)
* [Zoho CRM](/integrations/builtin/app-nodes/n8n-nodes-base.zohocrm.md)
* [Zoom](/integrations/builtin/app-nodes/n8n-nodes-base.zoom.md)

## معاملات العقدة

قم بتكوين وكيل الأدوات (Tools Agent) باستخدام المعاملات التالية.

### الموجه (Prompt)

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/prompt.md"

### طلب تنسيق مخرجات محدد

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/output-format.md"

## خيارات العقدة

حسّن سلوك عقدة وكيل الأدوات (Tools Agent) باستخدام هذه الخيارات:

### رسالة النظام (System Message)

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/system-message.md"

### الحد الأقصى للتكرارات (Max Iterations)

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/max-iterations.md"

### إرجاع الخطوات الوسيطة (Return Intermediate Steps)

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/return-intermediate-steps.md"

### بيانات تتبع التعريف (Tracing Metadata)

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/tracing-metadata.md"

<!-- vale off -->
### تمرير الصور الثنائية تلقائيًا (Automatically Passthrough Binary Images)
<!-- vale on -->

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/binary-images.md"

### تمكين البث (Streaming)

عند التمكين، يرسل وكيل الذكاء الاصطناعي (AI Agent) البيانات إلى المستخدم في الوقت الفعلي أثناء إنشائه للإجابة. هذا مفيد لعمليات الإنشاء طويلة الأمد. يتم تمكين هذا افتراضيًا.

> **متطلبات البث (Streaming)**
>
> لكي يعمل البث، يجب أن يستخدم سير العمل الخاص بك مُحفِّزًا يدعم استجابات البث، مثل عقدة [مُحفِّز الدردشة (Chat Trigger)](/integrations/builtin/core-nodes/n8n-nodes-langchain.chattrigger/index.md) أو [ويب هوك (Webhook)](/integrations/builtin/core-nodes/n8n-nodes-base.webhook/index.md) مع تعيين **وضع الاستجابة (Response Mode)** على **بث (Streaming)**.

## القوالب والأمثلة

ارجع إلى قسم [القوالب والأمثلة](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md#templates-and-examples) الخاص بعقدة وكيل الذكاء الاصطناعي (AI Agent) الرئيسية.

## المعاملات الديناميكية للأدوات باستخدام `$fromAI()`

لمعرفة كيفية تعبئة المعاملات ديناميكيًا لأدوات عقدة التطبيق، ارجع إلى [دع الذكاء الاصطناعي يحدد معاملات الأداة باستخدام `$fromAI()`](/advanced-ai/examples/using-the-fromai-function.md).

## المراجعة البشرية لاستدعاءات الأدوات

يمكنك طلب موافقة بشرية قبل أن ينفذ وكيل الذكاء الاصطناعي (AI Agent) أدوات معينة. هذا مفيد للأدوات التي تؤدي إجراءات حساسة مثل إرسال الرسائل أو تعديل السجلات أو حذف البيانات.

لإضافة خطوة مراجعة بشرية:

1.  انقر على موصل الأداة في عقدة وكيل الذكاء الاصطناعي (AI Agent).
2.  في لوحة الأدوات (Tools Panel)، ابحث عن قسم **المراجعة البشرية (Human review)**.
3.  حدد قناة الموافقة المفضلة لديك (الدردشة، Slack، Telegram، والمزيد) وقم بتكوينها.
4.  صل الأدوات التي تتطلب موافقة بخطوة المراجعة البشرية.

عندما يرغب الذكاء الاصطناعي في استخدام أداة مقيدة، يتوقف سير العمل مؤقتًا ويرسل طلب موافقة عبر القناة التي اخترتها. يمكن للمستلم الموافقة (تُنفذ الأداة) أو الرفض (يُلغى الإجراء).

للحصول على تعليمات الإعداد التفصيلية وأفضل الممارسات، ارجع إلى [التدخل البشري في استدعاءات أدوات الذكاء الاصطناعي (Human-in-the-loop for AI tool calls)](/advanced-ai/human-in-the-loop-tools.md).

## المشكلات الشائعة

للأسئلة أو المشكلات الشائعة والحلول المقترحة، يُرجى الرجوع إلى [المشكلات الشائعة](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/common-issues.md).