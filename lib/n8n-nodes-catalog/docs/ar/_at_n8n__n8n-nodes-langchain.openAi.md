# عقدة OpenAI

استخدم عقدة OpenAI لأتمتة سير العمل في OpenAI ودمج OpenAI مع التطبيقات الأخرى. تدعم n8n بشكل مدمج مجموعة واسعة من ميزات OpenAI، بما في ذلك إنشاء الصور والمساعدين، بالإضافة إلى الدردشة مع النماذج.

في هذه الصفحة، ستجد قائمة بالعمليات التي تدعمها عقدة OpenAI وروابط لموارد إضافية.

> **إصدارات العقدة السابقة**
>
> تحل عقدة OpenAI محل عقدة مساعد OpenAI بدءًا من الإصدار 1.29.0.
> يقدم الإصدار 1.117.0 من n8n الإصدار الثاني (V2) من عقدة OpenAI الذي يدعم واجهة برمجة تطبيقات استجابات OpenAI (OpenAI Responses API) ويزيل الدعم [لواجهة برمجة تطبيقات المساعدين (Assistants API) التي سيتم إهمالها](https://platform.openai.com/docs/assistants/migration).

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) للحصول على إرشادات حول إعداد المصادقة.

## العمليات

- **النص**
	- [**إنشاء إكمال دردشة**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/text-operations.md#generate-a-chat-completion)
	- [**إنشاء استجابة نموذج**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/text-operations.md#generate-a-model-response)
	- [**تصنيف النص بحثًا عن انتهاكات**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/text-operations.md#classify-text-for-violations)
- **الصورة**
	- [**تحليل الصورة**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/image-operations.md#analyze-image)
	- [**إنشاء صورة**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/image-operations.md#generate-an-image)
	- [**تعديل صورة**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/image-operations.md#edit-an-image)
- **الصوت**
	- [**إنشاء صوت**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/audio-operations.md#generate-audio)
	- [**نسخ تسجيل**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/audio-operations.md#transcribe-a-recording)
	- [**ترجمة تسجيل**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/audio-operations.md#translate-a-recording)
- **الملف**
	- [**حذف ملف**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/file-operations.md#delete-a-file)
	- [**سرد الملفات**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/file-operations.md#list-files)
	- [**رفع ملف**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/file-operations.md#upload-a-file)
- **الفيديو**
	- [**إنشاء فيديو**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/video-operations.md#generate-video)
- **المحادثة**
	- [**إنشاء محادثة**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/conversation-operations.md#create-a-conversation)
	- [**الحصول على محادثة**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/conversation-operations.md#get-a-conversation)
	- [**تحديث محادثة**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/conversation-operations.md#update-a-conversation)
	- [**إزالة محادثة**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/conversation-operations.md#remove-a-conversation)

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

ارجع إلى [توثيق OpenAI](https://beta.openai.com/docs/introduction) لمزيد من المعلومات حول الخدمة.

ارجع إلى [توثيق مساعدي OpenAI](https://platform.openai.com/docs/assistants/how-it-works/objects) لمزيد من المعلومات حول كيفية عمل المساعدين.

للمساعدة في التعامل مع حدود المعدل، ارجع إلى [التعامل مع حدود المعدل](/integrations/builtin/rate-limits.md).

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في القيام بها، يمكنك استخدام [عقدة HTTP Request](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء API الخاص بالخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة HTTP Request:

1.  في عقدة HTTP Request، حدد **المصادقة** > **نوع بيانات الاعتماد المُحددة مسبقًا**.
2.  حدد الخدمة التي ترغب في الاتصال بها.
3.  حدد بيانات الاعتماد الخاصة بك.

ارجع إلى [عمليات API المخصصة](/integrations/custom-operations.md) لمزيد من المعلومات.

## استخدام الأدوات مع مساعدي OpenAI

تسمح بعض العمليات بربط الأدوات. [الأدوات](/advanced-ai/examples/understand-tools.md) تعمل كإضافات يمكن لذكائك الاصطناعي استخدامها للوصول إلى سياق أو موارد إضافية.

حدد موصل **الأدوات** لتصفح الأدوات المتاحة وإضافتها.

بمجرد إضافة اتصال أداة، تصبح عقدة OpenAI [عقدة جذر](/glossary.md#root-node-n8n)، مما يسمح لها بتشكيل [عقدة عنقودية](/glossary.md#cluster-node-n8n) مع [العقد الفرعية](/glossary.md#sub-node-n8n) للأدوات. راجع [أنواع العقد](/integrations/builtin/node-types.md#cluster-nodes) لمزيد من المعلومات حول العقد العنقودية وعقد الجذر.

### العمليات التي تدعم موصلات الأدوات

-   **النص**
    -   [**إنشاء إكمال دردشة**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/text-operations.md#generate-a-chat-completion)
    -   [**إنشاء استجابة نموذج**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/text-operations.md#generate-a-model-response)

## المشكلات الشائعة

للمشكلات أو الأسئلة الشائعة والحلول المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/common-issues.md).

---

# عمليات مساعد OpenAI

تُستخدم هذه العملية لإنشاء مساعد أو حذفه أو إدراجه أو مراسلته أو تحديثه في OpenAI. للمزيد من المعلومات حول عقدة OpenAI نفسها، ارجع إلى [OpenAI](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/index.md).

> **عمليات المساعد مُهملة في الإصدار الثاني من عقدة OpenAI**
>
> يقدم الإصدار 1.117.0 من n8n الإصدار الثاني من عقدة OpenAI الذي يدعم واجهة برمجة تطبيقات استجابات OpenAI ويزيل دعم [واجهة برمجة تطبيقات المساعدين التي سيتم إهمالها](https://platform.openai.com/docs/assistants/migration).

## إنشاء مساعد

تُستخدم هذه العملية لإنشاء مساعد جديد.

أدخل هذه المعاملات:

- **بيانات الاعتماد للاتصال بها**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
- **المورد**: حدد **Assistant**.
- **العملية**: حدد **Create an Assistant**.
- **النموذج**: حدد النموذج الذي سيستخدمه المساعد. إذا لم تكن متأكدًا من النموذج الذي ستستخدمه، فجرّب `gpt-4o` إذا كنت بحاجة إلى ذكاء عالٍ أو `gpt-4o-mini` إذا كنت بحاجة إلى أسرع سرعة وأقل تكلفة. للمزيد من المعلومات، ارجع إلى [نظرة عامة على النماذج | منصة OpenAI](https://platform.openai.com/docs/models).
- **الاسم**: أدخل اسم المساعد. الحد الأقصى للطول هو 256 حرفًا.
- **الوصف**: أدخل وصف المساعد. الحد الأقصى للطول هو 512 حرفًا.
  ```
  A virtual assistant that helps users with daily tasks, including setting reminders, answering general questions, and providing quick information.
  ```
- **التعليمات**: أدخل تعليمات النظام التي يستخدمها المساعد. الحد الأقصى للطول هو 32,768 حرفًا. استخدم هذا لتحديد الشخصية التي يستخدمها النموذج في ردوده.
  ```
  Always respond in a friendly and engaging manner. When a user asks a question, provide a concise answer first, followed by a brief explanation or additional context if necessary. If the question is open-ended, offer a suggestion or ask a clarifying question to guide the conversation. Keep the tone positive and supportive, and avoid technical jargon unless specifically requested by the user.
  ```
- **مفسّر الشفرة**: قم بتشغيله لتمكين مفسّر الشفرة للمساعد، حيث يمكنه كتابة وتنفيذ الشفرة في بيئة معزولة (sandbox). قم بتمكين هذه الأداة للمهام التي تتطلب عمليات حسابية أو تحليل بيانات أو أي معالجة قائمة على المنطق.
- **استرجاع المعرفة**: قم بتشغيله لتمكين استرجاع المعرفة للمساعد، مما يسمح له بالوصول إلى مصادر خارجية أو قاعدة معرفة متصلة. للمزيد من المعلومات، ارجع إلى [البحث عن الملفات | منصة OpenAI](https://platform.openai.com/docs/assistants/tools/file-search).
    - **الملفات**: حدد ملفًا لتحميله لمصدر المعرفة الخارجي الخاص بك. استخدم عملية **Upload a File** لإضافة المزيد من الملفات.

### الخيارات

-   **Output Randomness (Temperature)**: اضبط عشوائية الاستجابة. النطاق يتراوح بين `0.0` (حتمي) و `1.0` (أقصى عشوائية). نوصي بتعديل هذا أو **Output Randomness (Top P)** ولكن ليس كليهما. ابدأ بدرجة حرارة متوسطة (حوالي 0.7) واضبطها بناءً على المخرجات التي تلاحظها. إذا كانت الاستجابات متكررة جدًا أو جامدة، فزد درجة الحرارة. إذا كانت فوضوية جدًا أو خارج المسار، فقللها. القيمة الافتراضية هي `1.0`.
-   **Output Randomness (Top P)**: اضبط إعداد Top P للتحكم في تنوع استجابات المساعد. على سبيل المثال، `0.5` يعني أنه يتم أخذ نصف جميع الخيارات المرجحة بالاحتمالية في الاعتبار. نوصي بتعديل هذا أو **Output Randomness (Temperature)** ولكن ليس كليهما. القيمة الافتراضية هي `1.0`.
-   **Fail if Assistant Already Exists**: إذا تم تمكينه، ستفشل العملية إذا كان مساعد يحمل نفس الاسم موجودًا بالفعل.

ارجع إلى توثيق [إنشاء مساعد | OpenAI](https://platform.openai.com/docs/api-reference/assistants/createAssistant) لمزيد من المعلومات.

## حذف مساعد

استخدم هذه العملية لحذف مساعد موجود من حسابك.

أدخل هذه المعاملات:

-   **Credential to connect with**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
-   **Resource**: حدد **Assistant**.
-   **Operation**: حدد **Delete an Assistant**.
-   **Assistant**: حدد المساعد الذي تريد حذفه **من القائمة** أو **بواسطة ID**.

ارجع إلى توثيق [حذف مساعد | OpenAI](https://platform.openai.com/docs/api-reference/assistants/deleteAssistant) لمزيد من المعلومات.

## سرد المساعدين

استخدم هذه العملية لاسترداد قائمة بالمساعدين في مؤسستك.

-   **Credential to connect with**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
-   **Resource**: حدد **Assistant**.
-   **Operation**: حدد **List Assistants**.

### الخيارات

-   **Simplify Output**: قم بتشغيله لإرجاع نسخة مبسطة من الاستجابة بدلاً من البيانات الخام. هذا الخيار ممكّن افتراضيًا.

ارجع إلى توثيق [سرد المساعدين | OpenAI](https://platform.openai.com/docs/api-reference/assistants/listAssistants) لمزيد من المعلومات.

## إرسال رسالة إلى مساعد

استخدم هذه العملية لإرسال رسالة إلى مساعد وتلقي رد.

أدخل هذه المعاملات:

- **بيانات الاعتماد للاتصال**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
- **المورد**: حدد **Assistant** (المساعد).
- **العملية**: حدد **Message an Assistant** (إرسال رسالة إلى مساعد).
- **Assistant**: حدد المساعد الذي تريد إرسال رسالة إليه.
- **Prompt**: أدخل المطالبة النصية أو الرسالة التي تريد إرسالها إلى المساعد.
    - **Connected Chat Trigger Node** (عقدة مُحفِّز الدردشة المتصلة): استخدم تلقائيًا المدخلات من حقل `chatInput` الخاص بعقدة سابقة.
    - **Define Below** (تحديد أدناه): حدد المطالبة يدويًا عن طريق إدخال نص ثابت أو استخدام تعبير للإشارة إلى البيانات من العقد السابقة.

### الخيارات

- **Base URL**: أدخل عنوان URL الأساسي الذي يجب أن يستخدمه المساعد لإجراء طلبات API. هذا الخيار مفيد لتوجيه المساعد لاستخدام نقاط النهاية التي توفرها موفرو LLM الآخرون الذين يقدمون API متوافقًا مع OpenAI.
- **Max Retries** (الحد الأقصى لإعادة المحاولات): حدد عدد المرات التي يجب أن يعيد فيها المساعد محاولة العملية في حالة الفشل.
- **Timeout** (مهلة الانتهاء): اضبط أقصى مدة زمنية بالمللي ثانية، يجب أن ينتظرها المساعد للحصول على رد قبل انتهاء المهلة. استخدم هذا الخيار لمنع الانتظار الطويل أثناء العمليات.
- **Preserve Original Tools** (الاحتفاظ بالأدوات الأصلية): قم بإيقاف التشغيل لإزالة الأدوات الأصلية المرتبطة بالمساعد. استخدم هذا إذا كنت ترغب في إزالة الأدوات مؤقتًا لهذه العملية المحددة.

ارجع إلى توثيق [Assistants | OpenAI](https://platform.openai.com/docs/api-reference/assistants) لمزيد من المعلومات.

## تحديث مساعد

استخدم هذه العملية لتحديث تفاصيل مساعد موجود.

أدخل هذه المعاملات:

- **بيانات الاعتماد للاتصال**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
- **المورد**: حدد **Assistant** (المساعد).
- **العملية**: حدد **Update an Assistant** (تحديث مساعد).
- **Assistant**: حدد المساعد الذي تريد تحديثه.

### الخيارات

- **Code Interpreter** (مفسر الكود): قم بالتشغيل لتمكين مفسر الكود للمساعد، حيث يمكنه كتابة وتنفيذ الكود في بيئة معزولة. قم بتمكين هذه الأداة للمهام التي تتطلب عمليات حسابية أو تحليل بيانات أو أي معالجة قائمة على المنطق.
- **Description** (الوصف): أدخل وصف المساعد. الحد الأقصى للطول هو 512 حرفًا.
  ```
  A virtual assistant that helps users with daily tasks, including setting reminders, answering general questions, and providing quick information.
  ```
- **Instructions** (التعليمات): أدخل تعليمات النظام التي يستخدمها المساعد. الحد الأقصى للطول هو 32,768 حرفًا. استخدم هذا لتحديد الشخصية التي يستخدمها النموذج في ردوده.
  ```
  Always respond in a friendly and engaging manner. When a user asks a question, provide a concise answer first, followed by a brief explanation or additional context if necessary. If the question is open-ended, offer a suggestion or ask a clarifying question to guide the conversation. Keep the tone positive and supportive, and avoid technical jargon unless specifically requested by the user.
  ```
- **Knowledge Retrieval** (استرجاع المعرفة): قم بالتشغيل لتمكين استرجاع المعرفة للمساعد، مما يسمح له بالوصول إلى مصادر خارجية أو قاعدة معرفة متصلة. ارجع إلى [File Search | OpenAI Platform](https://platform.openai.com/docs/assistants/tools/file-search) لمزيد من المعلومات.
- **Files** (الملفات): حدد ملفًا لتحميله لمصدر المعرفة الخارجي الخاص بك. استخدم عملية [**Upload a File**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/file-operations.md#upload-a-file) لإضافة المزيد من الملفات. لاحظ أن هذا يقوم فقط بتحديث أداة [Code Interpreter](https://platform.openai.com/docs/assistants/tools/code-interpreter)، وليس أداة [File Search](https://platform.openai.com/docs/assistants/tools/file-search).

- **Model**: حدد النموذج الذي ستستخدمه المساعدة. إذا لم تكن متأكدًا من النموذج الذي ستستخدمه، جرب `gpt-4o` إذا كنت بحاجة إلى ذكاء عالٍ أو `gpt-4o-mini` إذا كنت بحاجة إلى أسرع سرعة وأقل تكلفة. ارجع إلى [نظرة عامة على النماذج | منصة OpenAI](https://platform.openai.com/docs/models) لمزيد من المعلومات.
- **Name**: أدخل اسم المساعدة. الحد الأقصى للطول هو 256 حرفًا.
- **Remove All Custom Tools (Functions)**: قم بالتشغيل لإزالة جميع الأدوات المخصصة (الدوال) من المساعدة.
- **Output Randomness (Temperature)**: اضبط عشوائية الاستجابة. يتراوح النطاق بين `0.0` (حتمي) و `1.0` (أقصى عشوائية). نوصي بتعديل هذا أو **عشوائية المخرجات (Top P)** ولكن ليس كليهما. ابدأ بدرجة حرارة متوسطة (حوالي 0.7) واضبط بناءً على المخرجات التي تلاحظها. إذا كانت الاستجابات متكررة جدًا أو جامدة، فزد درجة الحرارة. إذا كانت فوضوية جدًا أو خارج المسار، فقللها. القيمة الافتراضية هي `1.0`.
- **Output Randomness (Top P)**: اضبط إعداد Top P للتحكم في تنوع استجابات المساعدة. على سبيل المثال، `0.5` يعني أنه يتم أخذ نصف جميع الخيارات المرجحة بالاحتمالية في الاعتبار. نوصي بتعديل هذا أو **عشوائية المخرجات (Temperature)** ولكن ليس كليهما. القيمة الافتراضية هي `1.0`.

ارجع إلى توثيق [تعديل المساعد | OpenAI](https://platform.openai.com/docs/api-reference/assistants/modifyAssistant) لمزيد من المعلومات.

## المشكلات الشائعة

للاطلاع على الأخطاء أو المشكلات الشائعة وخطوات الحل المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/common-issues.md).

---

# عمليات الصوت في OpenAI

استخدم هذه العملية لإنشاء صوت، أو نسخ أو ترجمة تسجيل في OpenAI. ارجع إلى [OpenAI](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/index.md) لمزيد من المعلومات حول عقدة OpenAI (OpenAI Node) نفسها.

## إنشاء صوت

استخدم هذه العملية لإنشاء صوت من موجه نصي.

أدخل هذه المعاملات (parameters):

- **Credential to connect with**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
- **Resource**: حدد **Audio**.
- **Operation**: حدد **Generate Audio**.
- **Model**: حدد النموذج الذي تريد استخدامه لإنشاء الصوت. ارجع إلى [TTS | OpenAI](https://platform.openai.com/docs/models/tts) لمزيد من المعلومات.
    - **TTS-1**: استخدم هذا للتحسين من أجل السرعة.
    - **TTS-1-HD**: استخدم هذا للتحسين من أجل الجودة.
- **Text Input**: أدخل النص لإنشاء الصوت منه. الحد الأقصى للطول هو 4096 حرفًا.
- **Voice**: حدد صوتًا لاستخدامه عند إنشاء الصوت. استمع إلى معاينات الأصوات في [دليل تحويل النص إلى كلام | OpenAI](https://platform.openai.com/docs/guides/text-to-speech/quickstart).

### الخيارات

-   **تنسيق الاستجابة**: حدد التنسيق لاستجابة الصوت. اختر من **MP3** (افتراضي)، **OPUS**، **AAC**، **FLAC**، **WAV**، و **PCM**.
-   **سرعة الصوت**: أدخل سرعة الصوت المُولَّد بقيمة تتراوح من `0.25` إلى `4.0`. الافتراضي هو `1`.
-   **وضع المخرجات في حقل**: الافتراضي هو `data`. أدخل اسم حقل المخرجات لوضع بيانات الملف الثنائي فيه.

ارجع إلى توثيق [Create speech | OpenAI](https://platform.openai.com/docs/api-reference/audio/createSpeech) لمزيد من المعلومات.

## نسخ تسجيل

استخدم هذه العملية لنسخ الصوت إلى نص. تحد واجهة برمجة تطبيقات OpenAI حجم ملف الصوت بـ 25 ميجابايت. ستستخدم OpenAI نموذج `whisper-1` افتراضيًا.

أدخل هذه المعاملات:

-   **بيانات الاعتماد للاتصال بـ**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
-   **المورد**: حدد **Audio**.
-   **العملية**: حدد **Transcribe a Recording**.
-   **اسم حقل بيانات المدخلات**: الافتراضي هو `data`. أدخل اسم الخاصية الثنائية التي تحتوي على ملف الصوت بأحد هذه التنسيقات: `.flac`، `.mp3`، `.mp4`، `.mpeg`، `.mpga`، `.m4a`، `.ogg`، `.wav`، أو `.webm`.

### الخيارات

-   **لغة الملف الصوتي**: أدخل لغة الصوت المدخل بتنسيق [ISO-639-1](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes). استخدم هذا الخيار لتحسين الدقة وزمن الاستجابة.
-   **عشوائية المخرجات (درجة الحرارة)**: الافتراضي هو `1.0`. اضبط عشوائية الاستجابة. النطاق يتراوح بين `0.0` (حتمي) و `1.0` (أقصى عشوائية). نوصي بتغيير هذا أو **عشوائية المخرجات (Top P)** ولكن ليس كليهما. ابدأ بدرجة حرارة متوسطة (حوالي 0.7) واضبطها بناءً على المخرجات التي تلاحظها. إذا كانت الاستجابات متكررة جدًا أو جامدة، فزد درجة الحرارة. إذا كانت فوضوية جدًا أو خارج المسار، فقللها.

ارجع إلى توثيق [Create transcription | OpenAI](https://platform.openai.com/docs/api-reference/audio/createTranscription) لمزيد من المعلومات.

## ترجمة تسجيل

استخدم هذه العملية لترجمة الصوت إلى الإنجليزية. تحد واجهة برمجة تطبيقات OpenAI حجم ملف الصوت بـ 25 ميجابايت. ستستخدم OpenAI نموذج `whisper-1` افتراضيًا.

أدخل هذه المعاملات:

-   **بيانات الاعتماد للاتصال بـ**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
-   **المورد**: حدد **Audio**.
-   **العملية**: حدد **Translate a Recording**.
-   **اسم حقل بيانات المدخلات**: الافتراضي هو `data`. أدخل اسم الخاصية الثنائية التي تحتوي على ملف الصوت بأحد هذه التنسيقات: `.flac`، `.mp3`، `.mp4`، `.mpeg`، `.mpga`، `.m4a`، `.ogg`، `.wav`، أو `.webm`.

### الخيارات

-   **Output Randomness (Temperature)**: القيمة الافتراضية هي `1.0`. اضبط عشوائية الاستجابة. النطاق يتراوح بين `0.0` (حتمي) و `1.0` (أقصى عشوائية). نوصي بتعديل هذا أو **Output Randomness (Top P)** ولكن ليس كليهما. ابدأ بدرجة حرارة متوسطة (حوالي 0.7) واضبطها بناءً على المخرجات التي تلاحظها. إذا كانت الاستجابات متكررة جدًا أو جامدة، فزد درجة الحرارة. إذا كانت فوضوية جدًا أو خارجة عن المسار، فقللها.

ارجع إلى [Create transcription | OpenAI](https://platform.openai.com/docs/api-reference/audio/createTranscription) للمزيد من المعلومات.

## مشكلات شائعة

للاطلاع على الأخطاء أو المشكلات الشائعة وخطوات الحل المقترحة، ارجع إلى [Common Issues](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/common-issues.md).

---

# مشكلات عقدة OpenAI الشائعة

فيما يلي بعض الأخطاء والمشكلات الشائعة المتعلقة بعقدة OpenAI (OpenAI node) وخطوات حلها أو استكشافها.

--8<-- "_snippets/integrations/openai-api-issues.md"
--8<-- "_snippets/integrations/referenced-node-unexecuted.md"

---

# عمليات محادثة OpenAI

استخدم هذه العملية لإنشاء محادثة أو الحصول عليها أو تحديثها أو إزالتها في OpenAI. ارجع إلى [OpenAI](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/index.md) للمزيد من المعلومات حول عقدة OpenAI نفسها.

## إنشاء محادثة

استخدم هذه العملية لإنشاء محادثة جديدة.

أدخل هذه المعاملات:

-   **Credential to connect with**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
-   **Resource**: حدد **محادثة**.
-   **Operation**: حدد **إنشاء محادثة**.
-   **Messages**: مدخل رسالة إلى النموذج. تأخذ الرسائل ذات دور `system` الأسبقية على التعليمات المعطاة بدور `user`. يُفترض أن الرسائل ذات دور `assistant` قد تم إنشاؤها بواسطة النموذج في تفاعلات سابقة.

### الخيارات

-   **Metadata**: مجموعة من أزواج المفتاح-القيمة لتخزين المعلومات المهيكلة. يمكنك إرفاق ما يصل إلى 16 زوجًا بكائن، وهو أمر مفيد لإضافة بيانات مخصصة يمكن استخدامها للبحث عبر API أو في لوحة التحكم.

ارجع إلى [Conversations | OpenAI](https://platform.openai.com/docs/api-reference/conversations/create) للمزيد من المعلومات.

## الحصول على محادثة

استخدم هذه العملية لاسترداد محادثة موجودة.

أدخل هذه المعاملات:

- **بيانات الاعتماد للاتصال**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
- **المورد**: حدد **محادثة**.
- **العملية**: حدد **الحصول على محادثة**.
- **Conversation ID**: معرّف المحادثة المراد استردادها.

ارجع إلى [توثيق المحادثات | OpenAI](https://platform.openai.com/docs/api-reference/conversations/create) للمزيد من المعلومات.

## إزالة محادثة

استخدم هذه العملية لإزالة محادثة موجودة.

أدخل هذه المعاملات:

- **بيانات الاعتماد للاتصال**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
- **المورد**: حدد **محادثة**.
- **العملية**: حدد **إزالة محادثة**.
- **Conversation ID**: معرّف المحادثة المراد إزالتها.

ارجع إلى [توثيق المحادثات | OpenAI](https://platform.openai.com/docs/api-reference/conversations/create) للمزيد من المعلومات.

## تحديث محادثة

استخدم هذه العملية لتحديث محادثة موجودة.

أدخل هذه المعاملات:

- **بيانات الاعتماد للاتصال**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
- **المورد**: حدد **محادثة**.
- **العملية**: حدد **تحديث محادثة**.
- **Conversation ID**: معرّف المحادثة المراد تحديثها.

### الخيارات

- **Metadata**: مجموعة من أزواج المفتاح-القيمة لتخزين المعلومات المهيكلة. يمكنك إرفاق ما يصل إلى 16 زوجًا بكائن، وهو مفيد لإضافة بيانات مخصصة يمكن استخدامها للبحث عبر API أو في لوحة التحكم.

ارجع إلى [توثيق المحادثات | OpenAI](https://platform.openai.com/docs/api-reference/conversations/create) للمزيد من المعلومات.

---

# عمليات ملفات OpenAI

استخدم هذه العملية لإنشاء ملف أو حذفه أو إدراجه أو إرساله كرسالة أو تحديثه في OpenAI. ارجع إلى [OpenAI](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/index.md) للمزيد من المعلومات حول عقدة OpenAI (OpenAI node) نفسها.

## حذف ملف

استخدم هذه العملية لحذف ملف من الخادم.

أدخل هذه المعاملات:

- **بيانات الاعتماد للاتصال**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
- **المورد**: حدد **ملف**.
- **العملية**: حدد **حذف ملف**.
- **File**: أدخل معرّف الملف المراد استخدامه لهذه العملية أو حدد اسم الملف من القائمة المنسدلة.

ارجع إلى [توثيق حذف الملف | OpenAI](https://platform.openai.com/docs/api-reference/files/delete) للمزيد من المعلومات.

## سرد الملفات

تُستخدم هذه العملية لسرد الملفات التي تخص مؤسسة المستخدم.

أدخل هذه المعاملات (parameters):

- **بيانات الاعتماد (Credential) للاتصال بـ**: أنشئ أو حدد [OpenAI credential](/integrations/builtin/credentials/openai.md) موجودة.
- **المورد (Resource)**: حدد **File**.
- **العملية (Operation)**: حدد **List Files**.

### الخيارات

- **Purpose**: استخدم هذا لإرجاع الملفات ذات الغرض المحدد فقط. استخدم **Assistants** لإرجاع الملفات المتعلقة بعمليات Assistants و Message فقط. استخدم **Fine-Tune** للملفات المتعلقة بـ [Fine-tuning](https://platform.openai.com/docs/api-reference/fine-tuning).

ارجع إلى توثيق [List files | OpenAI](https://platform.openai.com/docs/api-reference/files/list) لمزيد من المعلومات.

## رفع ملف

تُستخدم هذه العملية لرفع ملف. يمكن استخدام هذا عبر عمليات مختلفة.

أدخل هذه المعاملات (parameters):

- **بيانات الاعتماد (Credential) للاتصال بـ**: أنشئ أو حدد [OpenAI credential](/integrations/builtin/credentials/openai.md) موجودة.
- **المورد (Resource)**: حدد **File**.
- **العملية (Operation)**: حدد **Upload a File**.
- **Input Data Field Name**: القيمة الافتراضية هي `data`. أدخل اسم الخاصية الثنائية التي تحتوي على الملف. يمكن أن يصل حجم الملفات الفردية إلى 512 ميجابايت كحد أقصى أو 2 مليون رمز لـ Assistants.

### الخيارات

- **Purpose**: أدخل الغرض المقصود من الملف المرفوع. استخدم **Assistants** للملفات المرتبطة بعمليات Assistants و Message. استخدم **Fine-Tune** لـ [Fine-tuning](https://platform.openai.com/docs/api-reference/fine-tuning).

ارجع إلى توثيق [Upload file | OpenAI](https://platform.openai.com/docs/api-reference/files/create) لمزيد من المعلومات.

## المشكلات الشائعة

للاطلاع على الأخطاء أو المشكلات الشائعة وخطوات الحل المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/common-issues.md).

---

# عمليات صور OpenAI

تُستخدم هذه العملية لتحليل أو إنشاء صورة في OpenAI. ارجع إلى [OpenAI](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/index.md) لمزيد من المعلومات حول عقدة (Node) OpenAI نفسها.

## تحليل الصورة

تُستخدم هذه العملية لاستقبال الصور والإجابة على الأسئلة المتعلقة بها.

أدخل هذه المعاملات (parameters):

- **بيانات الاعتماد (Credential) للاتصال بـ**: أنشئ أو حدد [OpenAI credential](/integrations/builtin/credentials/openai.md) موجودة.
- **المورد (Resource)**: حدد **Image**.
- **العملية (Operation)**: حدد **Analayze Image**.
- **Model**: حدد النموذج الذي تريد استخدامه لتحليل الصورة.
- **Text Input**: اطرح سؤالاً حول الصورة.
- **Input Type**: حدد كيفية إدخال الصورة. تتضمن الخيارات:
    - **Image URL(s)**: أدخل **عنوان (URL)** أو **عناوين (URLs)** الصور المراد تحليلها. أضف عناوين URL متعددة في قائمة مفصولة بفاصلات.
    - **Binary File(s)**: أدخل اسم الخاصية الثنائية التي تحتوي على الصور في **Input Data Field Name**.

### الخيارات

-   **Detail**: حدد التوازن بين وقت الاستجابة واستخدام الـ token.
-   **Length of Description (Max Tokens)**: القيمة الافتراضية هي 300. سيؤدي استخدام عدد أقل من الـ tokens إلى وصف صورة أقصر وأقل تفصيلاً.

ارجع إلى توثيق [Images | OpenAI](https://platform.openai.com/docs/api-reference/images) لمزيد من المعلومات.

## إنشاء صورة

استخدم هذه العملية لإنشاء صورة من موجه نصي.

أدخل هذه المعاملات:

-   **Credential to connect with**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.openai.md) موجودة.
-   **Resource**: حدد **Image**.
-   **Operation**: حدد **Generate an Image**.
-   **Model**: حدد النموذج الذي تريد استخدامه لإنشاء صورة.
-   **Prompt**: أدخل الوصف النصي للصورة (الصور) المطلوبة. الحد الأقصى للطول هو 1000 حرف لـ `dall-e-2` و 4000 حرف لـ `dall-e-3`.

### الخيارات

-   **Quality**: جودة الصورة التي تنشئها. تُنشئ **HD** صورًا بتفاصيل أدق واتساق أكبر عبر الصورة. هذا الخيار مدعوم فقط لـ `dall-e-3`. وإلا، اختر **Standard**.
-   **Resolution**: حدد دقة الصور التي تم إنشاؤها. حدد **1024x1024** لـ `dall-e-2`. حدد أحد الخيارات **1024x1024**، **1792x1024**، أو **1024x1792** لنماذج `dall-e-3`.
-   **Style**: حدد نمط الصور التي تم إنشاؤها. هذا الخيار مدعوم فقط لـ `dall-e-3`.
    -   **Natural**: استخدم هذا لإنتاج صور تبدو أكثر طبيعية.
    -   **Vivid**: استخدم هذا لإنتاج صور واقعية للغاية ودرامية.
-   **Respond with image URL(s)**: ما إذا كان سيتم إرجاع روابط URL للصور بدلاً من الملفات الثنائية.
-   **Put Output in Field**: القيمة الافتراضية هي `data`. أدخل اسم حقل المخرجات لوضع بيانات الملف الثنائي فيه. متاح فقط إذا تم إيقاف تشغيل **Respond with image URL(s)**.

ارجع إلى توثيق [Create image | OpenAI](https://platform.openai.com/docs/api-reference/images/create) لمزيد من المعلومات.

## تعديل صورة

استخدم هذه العملية لتعديل صورة من موجه نصي.

أدخل هذه المعاملات:

-   **Credential to connect with**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
-   **Resource**: حدد **Image**.
-   **Operation**: حدد **Edit Image**.
-   **Model**: حدد النموذج الذي تريد استخدامه لإنشاء صورة. يدعم `dall-e-2` و `gpt-image-1`.
-   **Prompt**: أدخل الوصف النصي للتعديلات المطلوبة على الصورة (الصور) المدخلة.
-   **Image(s)**: أضف حقلاً ثنائيًا واحدًا أو أكثر لتضمين الصور مع موجهك. يجب أن تكون كل صورة ملف png أو webp أو jpg بحجم أقل من 50 ميجابايت. يمكنك توفير ما يصل إلى 16 صورة.
-   **Number of Images**: عدد الصور المراد إنشاؤها. يجب أن يكون بين 1 و 10.
-   **Size**: حجم وأبعاد الصور التي تم إنشاؤها (بالبكسل).
-   **Quality**: جودة الصورة التي سيتم إنشاؤها (تلقائي، منخفض، متوسط، عالٍ، قياسي). مدعوم فقط لـ `gpt-image-1`.
-   **Output Format**: التنسيق الذي يتم به إرجاع الصور التي تم إنشاؤها (png، webp، أو jpg). مدعوم فقط لـ `gpt-image-1`.
-   **Output Compression**: مستوى الضغط (0-100%) للصور التي تم إنشاؤها. مدعوم فقط لـ `gpt-image-1` مع تنسيقات مخرجات webp أو jpeg.

### الخيارات
- **Background**: يسمح بتعيين الشفافية لخلفية الصورة (الصور) المُنشأة. مدعوم فقط لـ `gpt-image-1`.
- **Input Fidelity**: تتحكم في مقدار الجهد الذي سيبذله النموذج لمطابقة نمط وميزات صور المدخلات. مدعوم فقط لـ `gpt-image-1`.
- **Image Mask**: اسم الخاصية الثنائية التي تحتوي على الصورة. صورة ثانية تظهر مناطقها الشفافة بالكامل (على سبيل المثال، حيث تكون قيمة ألفا صفرًا) المكان الذي يجب تعديل الصورة فيه. إذا تم توفير صور متعددة، فسيتم تطبيق القناع على الصورة الأولى. يجب أن يكون ملف PNG صالحًا، أقل من 4 ميجابايت، وله نفس أبعاد الصورة.
- **User**: مُعرّف فريد يمثل المستخدم النهائي الخاص بك، والذي يمكن أن يساعد OpenAI في مراقبة وكشف إساءة الاستخدام.

## المشكلات الشائعة

للمشكلات أو الأخطاء الشائعة وخطوات الحل المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/common-issues.md).

---

# عمليات نص OpenAI

استخدم هذه العملية لمراسلة نموذج أو تصنيف نص بحثًا عن انتهاكات في OpenAI. ارجع إلى [OpenAI](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/index.md) لمزيد من المعلومات حول عقدة OpenAI نفسها.

> **إصدارات العقدة السابقة**
>
> يقدم الإصدار 1.117.0 من n8n عقدة OpenAI V2 التي تدعم واجهة برمجة تطبيقات استجابات OpenAI. تعيد تسمية عملية "Message a Model" إلى "Generate a Chat Completion" لتوضيح ارتباطها بواجهة برمجة تطبيقات إكمال الدردشة (Chat Completions API) وتقدم عملية منفصلة "Generate a Model Response" تستخدم واجهة برمجة تطبيقات الاستجابات (Responses API).

## إنشاء إكمال دردشة

استخدم هذه العملية لإرسال رسالة أو موجه إلى نموذج OpenAI - باستخدام واجهة برمجة تطبيقات إكمال الدردشة (Chat Completions API) - وتلقي استجابة.

أدخل هذه المعاملات:

- **Credential to connect with**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
- **Resource**: حدد **نص**.
- **Operation**: حدد **إنشاء إكمال دردشة**.
- **Model**: حدد النموذج الذي تريد استخدامه. إذا لم تكن متأكدًا من النموذج الذي ستستخدمه، فجرّب `gpt-4o` إذا كنت بحاجة إلى ذكاء عالٍ أو `gpt-4o-mini` إذا كنت بحاجة إلى أسرع سرعة وأقل تكلفة. ارجع إلى [نظرة عامة على النماذج | منصة OpenAI](https://platform.openai.com/docs/models) لمزيد من المعلومات.
- **Messages**: أدخل موجهًا **نصيًا** وعيّن **دورًا** سيستخدمه النموذج لإنشاء الاستجابات. ارجع إلى [هندسة الموجهات | OpenAI](https://platform.openai.com/docs/guides/prompt-engineering) لمزيد من المعلومات حول كيفية كتابة موجه أفضل باستخدام هذه الأدوار. اختر من أحد هذه الأدوار:
    - **User**: يرسل رسالة كمستخدم ويتلقى استجابة من النموذج.
    - **Assistant**: يخبر النموذج بتبني نبرة أو شخصية معينة.
    - **System**: افتراضيًا، لا توجد رسالة نظام. يمكنك تعريف التعليمات في رسالة المستخدم، لكن التعليمات المحددة في رسالة النظام تكون أكثر فعالية. يمكنك تعيين أكثر من رسالة نظام واحدة لكل محادثة. استخدم هذا لتعيين سلوك النموذج أو سياقه لرسالة المستخدم التالية.
- **Simplify Output**: قم بتشغيله لإرجاع نسخة مبسطة من الاستجابة بدلاً من البيانات الخام.
- **Output Content as JSON**: قم بتشغيله لمحاولة إرجاع الاستجابة بتنسيق JSON. متوافق مع `GPT-4 Turbo` وجميع نماذج `GPT-3.5 Turbo` الأحدث من `gpt-3.5-turbo-1106`.

### خيارات

-   **Frequency Penalty**: طبّق عقوبة لتقليل ميل النموذج لتكرار الأسطر المتشابهة. النطاق يتراوح بين `0.0` و `2.0`.
-   **Maximum Number of Tokens**: عيّن الحد الأقصى لعدد الـ tokens للاستجابة. يمثل الـ token الواحد حوالي أربعة أحرف للنص الإنجليزي القياسي. استخدم هذا لتحديد طول المخرجات.
-   **Number of Completions**: القيمة الافتراضية هي 1. عيّن عدد عمليات الإكمال التي ترغب في إنشائها لكل مطالبة. استخدم بحذر لأن تعيين عدد كبير سيستهلك الـ tokens الخاصة بك بسرعة.
-   **Presence Penalty**: طبّق عقوبة للتأثير على النموذج لمناقشة مواضيع جديدة. النطاق يتراوح بين `0.0` و `2.0`.
-   **Output Randomness (Temperature)**: اضبط عشوائية الاستجابة. النطاق يتراوح بين `0.0` (حتمي) و `1.0` (أقصى عشوائية). نوصي بتعديل هذا أو **Output Randomness (Top P)** ولكن ليس كليهما. ابدأ بدرجة حرارة متوسطة (حوالي `0.7`) واضبطها بناءً على المخرجات التي تلاحظها. إذا كانت الاستجابات متكررة جدًا أو جامدة، فزد درجة الحرارة. إذا كانت فوضوية جدًا أو خارج المسار، فقللها. القيمة الافتراضية هي `1.0`.
-   **Output Randomness (Top P)**: اضبط إعداد Top P للتحكم في تنوع استجابات المساعد. على سبيل المثال، `0.5` يعني أن نصف جميع الخيارات المرجحة بالاحتمالية يتم أخذها في الاعتبار. نوصي بتعديل هذا أو **Output Randomness (Temperature)** ولكن ليس كليهما. القيمة الافتراضية هي `1.0`.

ارجع إلى توثيق [Chat Completions | OpenAI](https://platform.openai.com/docs/api-reference/chat) لمزيد من المعلومات.

## إنشاء استجابة نموذج

استخدم هذه العملية لإرسال رسالة أو مطالبة إلى نموذج OpenAI - باستخدام واجهة برمجة تطبيقات الاستجابات (Responses API) - وتلقي استجابة.

أدخل هذه المعاملات:

-   **Credential to connect with**: أنشئ أو حدد بيانات اعتماد (Credential) [OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
-   **Resource**: حدد **Text**.
-   **Operation**: حدد **Generate a Model Response**.
-   **Model**: حدد النموذج الذي ترغب في استخدامه. ارجع إلى [نظرة عامة على النماذج | منصة OpenAI](https://platform.openai.com/docs/models) للحصول على نظرة عامة.
-   **Messages**: اختر من أحد **أنواع الرسائل** التالية:
    -   **Text**: أدخل مطالبة **Text** وعيّن **Role** (الدور) الذي سيستخدمه النموذج لإنشاء الاستجابات. ارجع إلى [هندسة المطالبات | OpenAI](https://platform.openai.com/docs/guides/prompt-engineering) لمزيد من المعلومات حول كيفية كتابة مطالبة أفضل باستخدام هذه الأدوار.
    -   **Image**: قدّم **صورة** إما عبر عنوان URL للصورة، أو معرّف ملف (باستخدام [OpenAI Files API](https://platform.openai.com/docs/api-reference/files)) أو عن طريق تمرير بيانات ثنائية من عقدة سابقة في سير العمل الخاص بك.
    -   **File**: قدّم **ملفًا** بتنسيق مدعوم (حاليًا: PDF فقط)، إما عبر عنوان URL للملف، أو معرّف ملف (باستخدام [OpenAI Files API](https://platform.openai.com/docs/api-reference/files)) أو عن طريق تمرير بيانات ثنائية من عقدة سابقة في سير العمل الخاص بك.
    -   لأي نوع رسالة، يمكنك الاختيار من أحد هذه الأدوار:
        -   **User**: يرسل رسالة كمستخدم ويتلقى استجابة من النموذج.
        -   **Assistant**: يخبر النموذج بتبني نبرة أو شخصية معينة.
        -   **System**: بشكل افتراضي، رسالة النظام هي `"You are a helpful assistant"`. يمكنك تعريف التعليمات في رسالة المستخدم، لكن التعليمات المحددة في رسالة النظام تكون أكثر فعالية. يمكنك تعيين رسالة نظام واحدة فقط لكل محادثة. استخدم هذا لتعيين سلوك النموذج أو سياقه لرسالة المستخدم التالية.
-   **Simplify Output**: قم بتشغيله لإرجاع نسخة مبسطة من الاستجابة بدلاً من البيانات الخام.

### الأدوات المدمجة
توفر واجهة برمجة تطبيقات استجابات OpenAI مجموعة من [الأدوات المدمجة](https://platform.openai.com/docs/guides/tools) لإثراء استجابة النموذج:

-   **البحث عبر الويب**: تسمح للنماذج بالبحث في الويب عن أحدث المعلومات قبل إنشاء استجابة.
-   **خوادم MCP**: تسمح للنماذج بالاتصال بخوادم MCP البعيدة. اكتشف المزيد حول استخدام خوادم MCP البعيدة كأدوات [هنا](https://platform.openai.com/docs/guides/tools-connectors-mcp).
-   **البحث في الملفات**: تسمح للنماذج بالبحث في قاعدة معارفك من الملفات التي تم تحميلها مسبقًا عن المعلومات ذات الصلة قبل إنشاء استجابة. ارجع إلى [توثيق OpenAI](https://platform.openai.com/docs/guides/tools-file-search) لمزيد من المعلومات.
-   **مفسّر الشفرة**: يسمح للنماذج بكتابة وتشغيل شفرة Python في بيئة معزولة.

### الخيارات

-   **الحد الأقصى لعدد الرموز (Tokens)**: عيّن الحد الأقصى لعدد الرموز (tokens) للاستجابة. الرمز الواحد يعادل تقريبًا أربعة أحرف للنص الإنجليزي القياسي. استخدم هذا لتحديد طول المخرجات.
-   **عشوائية المخرجات (درجة الحرارة)**: اضبط عشوائية الاستجابة. يتراوح النطاق بين `0.0` (حتمي) و `1.0` (أقصى عشوائية). نوصي بتعديل هذا أو **عشوائية المخرجات (Top P)** ولكن ليس كليهما. ابدأ بدرجة حرارة متوسطة (حوالي `0.7`) واضبطها بناءً على المخرجات التي تلاحظها. إذا كانت الاستجابات متكررة جدًا أو جامدة، فزد درجة الحرارة. إذا كانت فوضوية جدًا أو خارج المسار، فقللها. القيمة الافتراضية هي `1.0`.
-   **عشوائية المخرجات (Top P)**: اضبط إعداد Top P للتحكم في تنوع استجابات المساعد. على سبيل المثال، `0.5` يعني أنه يتم أخذ نصف جميع الخيارات المرجحة بالاحتمالية في الاعتبار. نوصي بتعديل هذا أو **عشوائية المخرجات (درجة الحرارة)** ولكن ليس كليهما. القيمة الافتراضية هي `1.0`.
-   **معرّف المحادثة**: المحادثة التي تنتمي إليها هذه الاستجابة. تتم إضافة عناصر المدخلات وعناصر المخرجات من هذه الاستجابة تلقائيًا إلى هذه المحادثة بعد اكتمال هذه الاستجابة.
-   **معرّف الاستجابة السابقة**: معرّف الاستجابة السابقة للمتابعة منها. لا يمكن استخدامه بالتزامن مع معرّف المحادثة.
-   **الاستدلال**: مستوى جهد الاستدلال الذي يجب أن يبذله النموذج لإنشاء الاستجابة. يتضمن القدرة على إرجاع **ملخص** للاستدلال الذي أجراه النموذج (على سبيل المثال، لأغراض التصحيح).
-   **التخزين**: ما إذا كان سيتم تخزين استجابة النموذج التي تم إنشاؤها لاسترجاعها لاحقًا عبر واجهة برمجة التطبيقات (API). القيمة الافتراضية هي `true`.
-   **تنسيق المخرجات**: ما إذا كان سيتم إرجاع الاستجابة كنص (**Text**)، أو في **مخطط JSON** محدد، أو كـ **كائن JSON**.
-   **الخلفية**: ما إذا كان سيتم تشغيل النموذج في [وضع الخلفية](https://platform.openai.com/docs/guides/background). يسمح هذا بتنفيذ المهام طويلة الأمد بشكل أكثر موثوقية.

ارجع إلى توثيق [الاستجابات | OpenAI](https://platform.openai.com/docs/api-reference/responses/create) لمزيد من المعلومات.

## تصنيف النصوص للانتهاكات

استخدم هذه العملية لتحديد المحتوى الذي قد يكون ضارًا والإشارة إليه. سيقوم نموذج OpenAI بتحليل النص وإرجاع استجابة تحتوي على:

- `flagged`: حقل منطقي يشير إلى ما إذا كان المحتوى يحتمل أن يكون ضارًا.
- `categories`: قائمة بعلامات الانتهاك الخاصة بالفئة.
- `category_scores`: درجات لكل فئة.

أدخل هذه المعاملات:

- **بيانات الاعتماد للاتصال**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
- **المورد**: حدد **Text**.
- **العملية**: حدد **Classify Text for Violations**.
- **المدخل النصي**: أدخل النص لتصنيفه إذا كان ينتهك سياسة الإشراف.
- **تبسيط المخرجات**: قم بتشغيله لإرجاع نسخة مبسطة من الاستجابة بدلاً من البيانات الخام.

### الخيارات

- **استخدام النموذج المستقر**: قم بتشغيله لاستخدام النسخة المستقرة من النموذج بدلاً من أحدث نسخة، قد تكون الدقة أقل قليلاً.

ارجع إلى وثائق [Moderations | OpenAI](https://platform.openai.com/docs/api-reference/moderations) لمزيد من المعلومات.

## المشكلات الشائعة

للاطلاع على الأخطاء أو المشكلات الشائعة وخطوات الحل المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/common-issues.md).

---

# عمليات الفيديو في OpenAI

استخدم هذه العملية لإنشاء فيديو في OpenAI. ارجع إلى [OpenAI](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/index.md) لمزيد من المعلومات حول عقدة OpenAI نفسها.

## إنشاء فيديو

استخدم هذه العملية لإنشاء فيديو من موجه نصي.

أدخل هذه المعاملات:

- **بيانات الاعتماد للاتصال**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
- **المورد**: حدد **Video**.
- **العملية**: حدد **Generate Video**.
- **النموذج**: حدد النموذج الذي تريد استخدامه لإنشاء فيديو. يدعم حاليًا `sora-2` و `sora-2-pro`.
- **الموجه**: الموجه لإنشاء فيديو منه.
- **الثواني**: مدة المقطع بالثواني (حتى 25).
- **الحجم**: دقة المخرجات بتنسيق العرض × الارتفاع. 1024x1792 و 1792x1024 مدعومان فقط بواسطة Sora 2 Pro.

### الخيارات

-   **Reference**: مرجع صورة اختياري يوجه عملية التوليد. يجب تمريره كعنصر ثنائي.
-   **Wait Timeout**: الوقت المستغرق لانتظار توليد الفيديو بالثواني. القيمة الافتراضية هي 300.
-   **Output Field Name**: اسم حقل المخرجات لوضع بيانات الملف الثنائي فيه. القيمة الافتراضية هي `data`.

راجع [Video Generation | OpenAI](https://platform.openai.com/docs/guides/video-generation) لمزيد من المعلومات.