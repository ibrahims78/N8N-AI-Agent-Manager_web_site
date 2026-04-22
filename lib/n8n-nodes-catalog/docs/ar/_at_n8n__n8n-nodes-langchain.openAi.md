# عقدة OpenAI

استخدم عقدة OpenAI لأتمتة سير العمل في OpenAI ودمج OpenAI مع تطبيقات أخرى. تدعم n8n بشكل مدمج مجموعة واسعة من ميزات OpenAI، بما في ذلك إنشاء الصور والمساعدين، بالإضافة إلى الدردشة مع النماذج.

في هذه الصفحة، ستجد قائمة بالعمليات التي تدعمها عقدة OpenAI وروابط لموارد إضافية.

> **إصدارات العقدة السابقة**
>
> تحل عقدة OpenAI محل عقدة مساعد OpenAI بدءًا من الإصدار 1.29.0.
> يقدم الإصدار 1.117.0 من n8n الإصدار الثاني (V2) من عقدة OpenAI الذي يدعم واجهة برمجة تطبيقات استجابات OpenAI (OpenAI Responses API) ويزيل دعم [واجهة برمجة تطبيقات المساعدين (Assistants API) التي سيتم إهمالها](https://platform.openai.com/docs/assistants/migration).

> **بيانات الاعتماد**
>
> ارجع إلى [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) للحصول على إرشادات حول إعداد المصادقة.

## العمليات

- **النص**
	- [**إنشاء إكمال دردشة**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/text-operations.md#generate-a-chat-completion)
	- [**إنشاء استجابة نموذج**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/text-operations.md#generate-a-model-response)
	- [**تصنيف النص لتحديد الانتهاكات**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/text-operations.md#classify-text-for-violations)
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

## الموارد ذات الصلة

ارجع إلى [توثيق OpenAI](https://beta.openai.com/docs/introduction) لمزيد من المعلومات حول الخدمة.

ارجع إلى [توثيق مساعدي OpenAI](https://platform.openai.com/docs/assistants/how-it-works/objects) لمزيد من المعلومات حول كيفية عمل المساعدين.

للمساعدة في التعامل مع حدود المعدل، ارجع إلى [التعامل مع حدود المعدل](/integrations/builtin/rate-limits.md).

## ماذا تفعل إذا كانت عمليتك غير مدعومة

إذا كانت هذه العقدة لا تدعم العملية التي ترغب في تنفيذها، يمكنك استخدام [عقدة طلب HTTP](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) لاستدعاء واجهة برمجة تطبيقات الخدمة.

يمكنك استخدام بيانات الاعتماد التي أنشأتها لهذه الخدمة في عقدة طلب HTTP:

1. في عقدة طلب HTTP، حدد **المصادقة** > **نوع بيانات الاعتماد المُحددة مسبقًا**.
2. حدد الخدمة التي ترغب في الاتصال بها.
3. حدد بيانات الاعتماد الخاصة بك.

ارجع إلى [عمليات API المخصصة](/integrations/custom-operations.md) لمزيد من المعلومات.

## استخدام الأدوات مع مساعدي OpenAI

تسمح بعض العمليات بربط الأدوات. تعمل [الأدوات](/advanced-ai/examples/understand-tools.md) كإضافات يمكن لذكائك الاصطناعي استخدامها للوصول إلى سياق أو موارد إضافية.

حدد موصل **الأدوات** لتصفح الأدوات المتاحة وإضافتها.

بمجرد إضافة اتصال أداة، تصبح عقدة OpenAI [عقدة جذر](/glossary.md#root-node-n8n)، مما يسمح لها بتشكيل [عقدة عنقودية](/glossary.md#cluster-node-n8n) مع [العقد الفرعية](/glossary.md#sub-node-n8n) للأدوات. راجع [أنواع العقد](/integrations/builtin/node-types.md#cluster-nodes) لمزيد من المعلومات حول العقد العنقودية وعقد الجذر.

### العمليات التي تدعم موصلات الأدوات

- **النص**
	- [**إنشاء إكمال دردشة**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/text-operations.md#generate-a-chat-completion)
	- [**إنشاء استجابة نموذج**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/text-operations.md#generate-a-model-response)

## المشكلات الشائعة

للاستفسارات أو المشكلات الشائعة والحلول المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/common-issues.md).

---

# عمليات مساعد OpenAI

استخدم هذه العملية لإنشاء مساعد في OpenAI أو حذفه أو إدراجه أو مراسلته أو تحديثه. ارجع إلى [OpenAI](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/index.md) لمزيد من المعلومات حول عقدة OpenAI (OpenAI node) نفسها.

> **عمليات المساعد مهملة في الإصدار الثاني من عقدة OpenAI**
>
> يقدم الإصدار 1.117.0 من n8n الإصدار الثاني (V2) من عقدة OpenAI الذي يدعم واجهة برمجة تطبيقات استجابات OpenAI (OpenAI Responses API) ويزيل دعم واجهة برمجة تطبيقات المساعدين (Assistants API) [التي سيتم إهمالها](https://platform.openai.com/docs/assistants/migration).

## إنشاء مساعد

استخدم هذه العملية لإنشاء مساعد جديد.

أدخل هذه المعاملات (parameters):

- **بيانات الاعتماد للاتصال**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
- **المورد (Resource)**: حدد **Assistant**.
- **العملية (Operation)**: حدد **Create an Assistant**.
- **النموذج (Model)**: حدد النموذج الذي سيستخدمه المساعد. إذا لم تكن متأكدًا من النموذج الذي ستستخدمه، جرب `gpt-4o` إذا كنت بحاجة إلى ذكاء عالٍ أو `gpt-4o-mini` إذا كنت بحاجة إلى أسرع سرعة وأقل تكلفة. ارجع إلى [نظرة عامة على النماذج | منصة OpenAI](https://platform.openai.com/docs/models) لمزيد من المعلومات.
- **الاسم (Name)**: أدخل اسم المساعد. الحد الأقصى للطول هو 256 حرفًا.
- **الوصف (Description)**: أدخل وصف المساعد. الحد الأقصى للطول هو 512 حرفًا.
  ```
  A virtual assistant that helps users with daily tasks, including setting reminders, answering general questions, and providing quick information.
  ```
- **التعليمات (Instructions)**: أدخل تعليمات النظام التي يستخدمها المساعد. الحد الأقصى للطول هو 32,768 حرفًا. استخدم هذا لتحديد الشخصية التي يستخدمها النموذج في ردوده.
  ```
  Always respond in a friendly and engaging manner. When a user asks a question, provide a concise answer first, followed by a brief explanation or additional context if necessary. If the question is open-ended, offer a suggestion or ask a clarifying question to guide the conversation. Keep the tone positive and supportive, and avoid technical jargon unless specifically requested by the user.
  ```
- **مفسر الكود (Code Interpreter)**: قم بتشغيله لتمكين مفسر الكود للمساعد، حيث يمكنه كتابة وتنفيذ الكود في بيئة معزولة (sandbox). قم بتمكين هذه الأداة للمهام التي تتطلب عمليات حسابية أو تحليل بيانات أو أي معالجة قائمة على المنطق.
- **استرجاع المعرفة (Knowledge Retrieval)**: قم بتشغيله لتمكين استرجاع المعرفة للمساعد، مما يسمح له بالوصول إلى مصادر خارجية أو قاعدة معرفية متصلة. ارجع إلى [البحث عن الملفات | منصة OpenAI](https://platform.openai.com/docs/assistants/tools/file-search) لمزيد من المعلومات.
    - **الملفات (Files)**: حدد ملفًا لتحميله كمصدر معرفة خارجي. استخدم عملية **Upload a File** لإضافة المزيد من الملفات.

### الخيارات

- **Output Randomness (Temperature)**: اضبط عشوائية الاستجابة. النطاق يتراوح بين `0.0` (حتمي) و `1.0` (أقصى عشوائية). نوصي بتعديل هذا أو **Output Randomness (Top P)** ولكن ليس كليهما. ابدأ بدرجة حرارة متوسطة (حوالي 0.7) واضبطها بناءً على المخرجات التي تلاحظها. إذا كانت الاستجابات متكررة جدًا أو جامدة، فزد درجة الحرارة. إذا كانت فوضوية جدًا أو خارج المسار، فقللها. القيمة الافتراضية هي `1.0`.
- **Output Randomness (Top P)**: اضبط إعداد Top P للتحكم في تنوع استجابات المساعد. على سبيل المثال، `0.5` يعني أنه يتم أخذ نصف جميع الخيارات المرجحة بالاحتمالية في الاعتبار. نوصي بتعديل هذا أو **Output Randomness (Temperature)** ولكن ليس كليهما. القيمة الافتراضية هي `1.0`.
- **Fail if Assistant Already Exists**: إذا تم تمكين هذا، ستفشل العملية إذا كان مساعد يحمل نفس الاسم موجودًا بالفعل.

ارجع إلى [Create assistant | OpenAI](https://platform.openai.com/docs/api-reference/assistants/createAssistant) للحصول على مزيد من المعلومات.

## حذف مساعد

استخدم هذه العملية لحذف مساعد موجود من حسابك.

أدخل هذه المعاملات:

- **Credential to connect with**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
- **Resource**: حدد **Assistant** (المساعد).
- **Operation**: حدد **Delete an Assistant** (حذف مساعد).
- **Assistant**: حدد المساعد الذي تريد حذفه **من القائمة** أو **بواسطة ID**.

ارجع إلى [Delete assistant | OpenAI](https://platform.openai.com/docs/api-reference/assistants/deleteAssistant) للحصول على مزيد من المعلومات.

## سرد المساعدين

استخدم هذه العملية لاسترداد قائمة بالمساعدين في مؤسستك.

- **Credential to connect with**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
- **Resource**: حدد **Assistant** (المساعد).
- **Operation**: حدد **List Assistants** (سرد المساعدين).

### الخيارات

- **Simplify Output**: قم بتشغيله لإرجاع نسخة مبسطة من الاستجابة بدلاً من البيانات الخام. هذا الخيار ممكّن افتراضيًا.

ارجع إلى [List assistants | OpenAI](https://platform.openai.com/docs/api-reference/assistants/listAssistants) للحصول على مزيد من المعلومات.

## مراسلة مساعد

استخدم هذه العملية لإرسال رسالة إلى مساعد وتلقي رد.

أدخل هذه المعاملات:

- **Credential to connect with**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
- **Resource**: حدد **Assistant** (المساعد).
- **Operation**: حدد **Message an Assistant** (مراسلة مساعد).
- **Assistant**: حدد المساعد الذي تريد مراسلته.
- **Prompt**: أدخل الموجه النصي أو الرسالة التي تريد إرسالها إلى المساعد.
    - **Connected Chat Trigger Node**: استخدم تلقائيًا المدخلات من حقل `chatInput` الخاص بعقدة مُحفِّز الدردشة السابقة.
    - **Define Below**: حدد الموجه يدويًا عن طريق إدخال نص ثابت أو استخدام تعبير للإشارة إلى البيانات من العقد السابقة.

### الخيارات

- **Base URL**: أدخل عنوان URL الأساسي الذي يجب أن يستخدمه المساعد لإجراء طلبات API. هذا الخيار مفيد لتوجيه المساعد لاستخدام نقاط النهاية التي توفرها جهات أخرى من مزودي LLM والتي تقدم API متوافقًا مع OpenAI.
- **Max Retries**: حدد عدد المرات التي يجب أن يعيد فيها المساعد محاولة العملية في حالة الفشل.
- **Timeout**: عيّن أقصى مدة زمنية بالمللي ثانية، يجب أن ينتظرها المساعد للحصول على رد قبل انتهاء المهلة. استخدم هذا الخيار لمنع الانتظار الطويل أثناء العمليات.
- **Preserve Original Tools**: قم بإيقاف التشغيل لإزالة الأدوات الأصلية المرتبطة بالمساعد. استخدم هذا إذا كنت ترغب في إزالة الأدوات مؤقتًا لهذه العملية المحددة.

ارجع إلى توثيق [Assistants | OpenAI](https://platform.openai.com/docs/api-reference/assistants) لمزيد من المعلومات.

## تحديث مساعد

استخدم هذه العملية لتحديث تفاصيل مساعد موجود.

أدخل هذه المعاملات:

- **Credential to connect with**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
- **Resource**: حدد **Assistant** (المساعد).
- **Operation**: حدد **Update an Assistant** (تحديث مساعد).
- **Assistant**: حدد المساعد الذي تريد تحديثه.

### الخيارات

- **Code Interpreter**: قم بالتشغيل لتمكين مفسر الكود للمساعد، حيث يمكنه كتابة وتنفيذ الكود في بيئة معزولة (sandbox). قم بتمكين هذه الأداة للمهام التي تتطلب عمليات حسابية أو تحليل بيانات أو أي معالجة قائمة على المنطق.
- **Description**: أدخل وصف المساعد. الحد الأقصى للطول هو 512 حرفًا.
  ```
  A virtual assistant that helps users with daily tasks, including setting reminders, answering general questions, and providing quick information.
  ```
- **Instructions**: أدخل تعليمات النظام التي يستخدمها المساعد. الحد الأقصى للطول هو 32,768 حرفًا. استخدم هذا لتحديد الشخصية التي يستخدمها النموذج في ردوده.
  ```
  Always respond in a friendly and engaging manner. When a user asks a question, provide a concise answer first, followed by a brief explanation or additional context if necessary. If the question is open-ended, offer a suggestion or ask a clarifying question to guide the conversation. Keep the tone positive and supportive, and avoid technical jargon unless specifically requested by the user.
  ```
- **Knowledge Retrieval**: قم بالتشغيل لتمكين استرجاع المعرفة للمساعد، مما يسمح له بالوصول إلى مصادر خارجية أو قاعدة معرفة متصلة. ارجع إلى [File Search | OpenAI Platform](https://platform.openai.com/docs/assistants/tools/file-search) لمزيد من المعلومات.
- **Files**: حدد ملفًا لتحميله لمصدر المعرفة الخارجي الخاص بك. استخدم عملية [**Upload a File**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/file-operations.md#upload-a-file) لإضافة المزيد من الملفات. لاحظ أن هذا يقوم فقط بتحديث أداة [Code Interpreter](https://platform.openai.com/docs/assistants/tools/code-interpreter)، وليس أداة [File Search](https://platform.openai.com/docs/assistants/tools/file-search).

- **النموذج (Model)**: حدد النموذج الذي سيستخدمه المساعد. إذا لم تكن متأكدًا من النموذج الذي ستستخدمه، جرب `gpt-4o` إذا كنت بحاجة إلى ذكاء عالٍ أو `gpt-4o-mini` إذا كنت بحاجة إلى أسرع سرعة وأقل تكلفة. ارجع إلى [نظرة عامة على النماذج | منصة OpenAI](https://platform.openai.com/docs/models) لمزيد من المعلومات.
- **الاسم (Name)**: أدخل اسم المساعد. الحد الأقصى للطول هو 256 حرفًا.
- **إزالة جميع الأدوات المخصصة (الدوال) (Remove All Custom Tools (Functions))**: قم بتشغيله لإزالة جميع الأدوات المخصصة (الدوال) من المساعد.
- **عشوائية المخرجات (درجة الحرارة) (Output Randomness (Temperature))**: اضبط عشوائية الاستجابة. النطاق يتراوح بين `0.0` (حتمي) و `1.0` (أقصى عشوائية). نوصي بتعديل هذا أو **عشوائية المخرجات (Top P)** ولكن ليس كليهما. ابدأ بدرجة حرارة متوسطة (حوالي 0.7) واضبطها بناءً على المخرجات التي تلاحظها. إذا كانت الاستجابات متكررة جدًا أو جامدة، فزد درجة الحرارة. إذا كانت فوضوية جدًا أو خارج المسار، فقللها. القيمة الافتراضية هي `1.0`.
- **عشوائية المخرجات (Top P) (Output Randomness (Top P))**: اضبط إعداد Top P للتحكم في تنوع استجابات المساعد. على سبيل المثال، `0.5` يعني أنه يتم أخذ نصف جميع الخيارات المرجحة بالاحتمالية في الاعتبار. نوصي بتعديل هذا أو **عشوائية المخرجات (درجة الحرارة)** ولكن ليس كليهما. القيمة الافتراضية هي `1.0`.

ارجع إلى توثيق [تعديل المساعد | OpenAI](https://platform.openai.com/docs/api-reference/assistants/modifyAssistant) لمزيد من المعلومات.

## المشكلات الشائعة

للاطلاع على الأخطاء أو المشكلات الشائعة وخطوات الحل المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/common-issues.md).

---

# عمليات الصوت في OpenAI

استخدم هذه العملية (Operation) لإنشاء صوت، أو نسخ أو ترجمة تسجيل في OpenAI. ارجع إلى [OpenAI](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/index.md) لمزيد من المعلومات حول العقدة (Node) نفسها.

## إنشاء صوت

استخدم هذه العملية (Operation) لإنشاء صوت من موجه نصي.

أدخل هذه المعاملات (parameters):

- **بيانات الاعتماد (Credential) للاتصال بها**: أنشئ أو حدد [بيانات اعتماد (Credential) OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
- **المورد (Resource)**: حدد **صوت**.
- **العملية (Operation)**: حدد **إنشاء صوت**.
- **النموذج (Model)**: حدد النموذج الذي تريد استخدامه لإنشاء الصوت. ارجع إلى [TTS | OpenAI](https://platform.openai.com/docs/models/tts) لمزيد من المعلومات.
    - **TTS-1**: استخدم هذا للتحسين من أجل السرعة.
    - **TTS-1-HD**: استخدم هذا للتحسين من أجل الجودة.
- **المدخلات النصية (Text Input)**: أدخل النص لإنشاء الصوت منه. الحد الأقصى للطول هو 4096 حرفًا.
- **الصوت (Voice)**: حدد صوتًا لاستخدامه عند إنشاء الصوت. استمع إلى معاينات الأصوات في [دليل تحويل النص إلى كلام | OpenAI](https://platform.openai.com/docs/guides/text-to-speech/quickstart).

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

-   **لغة ملف الصوت**: أدخل لغة الصوت المدخل بتنسيق [ISO-639-1](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes). استخدم هذا الخيار لتحسين الدقة وزمن الاستجابة.
-   **عشوائية المخرجات (درجة الحرارة)**: الافتراضي هو `1.0`. اضبط عشوائية الاستجابة. النطاق يتراوح بين `0.0` (حتمي) و `1.0` (أقصى عشوائية). نوصي بتغيير هذا أو **Output Randomness (Top P)** ولكن ليس كليهما. ابدأ بدرجة حرارة متوسطة (حوالي 0.7) واضبطها بناءً على المخرجات التي تلاحظها. إذا كانت الاستجابات متكررة جدًا أو جامدة، فزد درجة الحرارة. إذا كانت فوضوية جدًا أو خارج المسار، فقللها.

ارجع إلى توثيق [Create transcription | OpenAI](https://platform.openai.com/docs/api-reference/audio/createTranscription) لمزيد من المعلومات.

## ترجمة تسجيل

استخدم هذه العملية لترجمة الصوت إلى الإنجليزية. تحد واجهة برمجة تطبيقات OpenAI حجم ملف الصوت بـ 25 ميجابايت. ستستخدم OpenAI نموذج `whisper-1` افتراضيًا.

أدخل هذه المعاملات:

-   **بيانات الاعتماد للاتصال بـ**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
-   **المورد**: حدد **Audio**.
-   **العملية**: حدد **Translate a Recording**.
-   **اسم حقل بيانات المدخلات**: الافتراضي هو `data`. أدخل اسم الخاصية الثنائية التي تحتوي على ملف الصوت بأحد هذه التنسيقات: `.flac`، `.mp3`، `.mp4`، `.mpeg`، `.mpga`، `.m4a`، `.ogg`، `.wav`، أو `.webm`.

### الخيارات

-   **عشوائية المخرجات (Output Randomness) (درجة الحرارة Temperature)**: القيمة الافتراضية هي `1.0`. يُعدّل عشوائية الاستجابة. النطاق يتراوح بين `0.0` (محدد) و `1.0` (أقصى عشوائية). نوصي بتعديل هذا أو **عشوائية المخرجات (Output Randomness) (Top P)** ولكن ليس كليهما. ابدأ بدرجة حرارة متوسطة (حوالي 0.7) وعدّل بناءً على المخرجات التي تلاحظها. إذا كانت الاستجابات متكررة جدًا أو جامدة، فزِد درجة الحرارة. إذا كانت فوضوية جدًا أو خارج المسار، فقلّلها.

ارجع إلى وثائق [Create transcription | OpenAI](https://platform.openai.com/docs/api-reference/audio/createTranscription) لمزيد من المعلومات.

## المشكلات الشائعة

للاطلاع على الأخطاء أو المشكلات الشائعة وخطوات الحل المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/common-issues.md).

---

# المشكلات الشائعة في عقدة OpenAI

فيما يلي بعض الأخطاء والمشكلات الشائعة في عقدة OpenAI (OpenAI node) وخطوات حلها أو استكشافها.

--8<-- "_snippets/integrations/openai-api-issues.md"
--8<-- "_snippets/integrations/referenced-node-unexecuted.md"

---

# عمليات محادثة OpenAI

استخدم هذه العملية لإنشاء محادثة أو الحصول عليها أو تحديثها أو إزالتها في OpenAI. ارجع إلى [OpenAI](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/index.md) لمزيد من المعلومات حول عقدة OpenAI نفسها.

## إنشاء محادثة

استخدم هذه العملية لإنشاء محادثة جديدة.

أدخل هذه المعاملات (parameters):

-   **بيانات الاعتماد (Credential) للاتصال بـ**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
-   **المورد (Resource)**: حدد **Conversation**.
-   **العملية (Operation)**: حدد **Create a Conversation**.
-   **الرسائل (Messages)**: مدخل رسالة إلى النموذج. الرسائل ذات الدور `system` لها الأسبقية على التعليمات المعطاة بالدور `user`. يُفترض أن الرسائل ذات الدور `assistant` قد تم إنشاؤها بواسطة النموذج في التفاعلات السابقة.

### الخيارات

-   **البيانات الوصفية (Metadata)**: مجموعة من أزواج المفتاح-القيمة لتخزين المعلومات المهيكلة. يمكنك إرفاق ما يصل إلى 16 زوجًا بكائن، وهو أمر مفيد لإضافة بيانات مخصصة يمكن استخدامها للبحث عبر API أو في لوحة التحكم.

ارجع إلى وثائق [Conversations | OpenAI](https://platform.openai.com/docs/api-reference/conversations/create) لمزيد من المعلومات.

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

### خيارات

- **Metadata**: مجموعة من أزواج المفتاح-القيمة لتخزين المعلومات المهيكلة. يمكنك إرفاق ما يصل إلى 16 زوجًا بكائن، وهو مفيد لإضافة بيانات مخصصة يمكن استخدامها للبحث عبر API أو في لوحة التحكم.

ارجع إلى [توثيق المحادثات | OpenAI](https://platform.openai.com/docs/api-reference/conversations/create) للمزيد من المعلومات.

---

# عمليات ملفات OpenAI

استخدم هذه العملية لإنشاء ملف أو حذفه أو سرده أو إرسال رسالة إليه أو تحديثه في OpenAI. ارجع إلى [OpenAI (عقدة OpenAI)](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/index.md) للمزيد من المعلومات حول عقدة OpenAI نفسها.

## حذف ملف

استخدم هذه العملية لحذف ملف من الخادم.

أدخل هذه المعاملات:

- **بيانات الاعتماد للاتصال**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
- **المورد**: حدد **ملف**.
- **العملية**: حدد **حذف ملف**.
- **File**: أدخل معرّف الملف المراد استخدامه لهذه العملية أو حدد اسم الملف من القائمة المنسدلة.

ارجع إلى [توثيق حذف الملف | OpenAI](https://platform.openai.com/docs/api-reference/files/delete) للمزيد من المعلومات.

## سرد الملفات

استخدم هذه العملية لسرد الملفات التي تخص مؤسسة المستخدم.

أدخل هذه المعاملات:

- **بيانات الاعتماد للاتصال بـ**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
- **المورد**: حدد **ملف**.
- **العملية**: حدد **سرد الملفات**.

### الخيارات

- **Purpose**: استخدم هذا لإرجاع الملفات ذات الغرض المحدد فقط. استخدم **Assistants** (المساعدين) لإرجاع الملفات المتعلقة بعمليات المساعدين والرسائل فقط. استخدم **Fine-Tune** (الضبط الدقيق) للملفات المتعلقة بـ [الضبط الدقيق](https://platform.openai.com/docs/api-reference/fine-tuning).

ارجع إلى توثيق [سرد الملفات | OpenAI](https://platform.openai.com/docs/api-reference/files/list) لمزيد من المعلومات.

## رفع ملف

استخدم هذه العملية لرفع ملف. يمكن استخدام هذا عبر عمليات مختلفة.

أدخل هذه المعاملات:

- **بيانات الاعتماد للاتصال بـ**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
- **المورد**: حدد **ملف**.
- **العملية**: حدد **رفع ملف**.
- **Input Data Field Name**: القيمة الافتراضية هي `data`. أدخل اسم الخاصية الثنائية التي تحتوي على الملف. يمكن أن يكون حجم الملفات الفردية بحد أقصى 512 ميجابايت أو 2 مليون رمز للمساعدين (Assistants).

### الخيارات

- **Purpose**: أدخل الغرض المقصود من الملف المرفوع. استخدم **Assistants** (المساعدين) للملفات المرتبطة بعمليات المساعدين والرسائل. استخدم **Fine-Tune** (الضبط الدقيق) لـ [الضبط الدقيق](https://platform.openai.com/docs/api-reference/fine-tuning).

ارجع إلى توثيق [رفع الملف | OpenAI](https://platform.openai.com/docs/api-reference/files/create) لمزيد من المعلومات.

## المشكلات الشائعة

للاطلاع على الأخطاء أو المشكلات الشائعة وخطوات الحل المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/common-issues.md).

---

# عمليات صور OpenAI

استخدم هذه العملية لتحليل أو إنشاء صورة في OpenAI. ارجع إلى [OpenAI](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/index.md) لمزيد من المعلومات حول عقدة OpenAI نفسها.

## تحليل الصورة

استخدم هذه العملية لاستقبال الصور والإجابة على الأسئلة المتعلقة بها.

أدخل هذه المعاملات:

- **بيانات الاعتماد للاتصال بـ**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
- **المورد**: حدد **صورة**.
- **العملية**: حدد **تحليل الصورة**.
- **Model**: حدد النموذج الذي تريد استخدامه لتحليل الصورة.
- **Text Input**: اطرح سؤالاً حول الصورة.
- **Input Type**: حدد كيفية إدخال الصورة. تتضمن الخيارات:
    - **Image URL(s)**: أدخل **عنوان (عناوين) URL** للصورة (الصور) المراد تحليلها. أضف عدة عناوين URL في قائمة مفصولة بفواصل.
    - **Binary File(s)**: أدخل اسم الخاصية الثنائية التي تحتوي على الصورة (الصور) في **Input Data Field Name**.

### الخيارات

-   **Detail**: تحديد التوازن بين وقت الاستجابة واستخدام الرموز (tokens).
-   **Length of Description (Max Tokens)**: القيمة الافتراضية هي 300. عدد أقل من الرموز سيؤدي إلى وصف صورة أقصر وأقل تفصيلاً.

ارجع إلى [Images | OpenAI](https://platform.openai.com/docs/api-reference/images) للمزيد من المعلومات.

## إنشاء صورة

استخدم هذه العملية لإنشاء صورة من موجه نصي.

أدخل هذه المعاملات:

-   **Credential to connect with**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
-   **Resource**: حدد **Image** (صورة).
-   **Operation**: حدد **Generate an Image** (إنشاء صورة).
-   **Model**: حدد النموذج الذي ترغب في استخدامه لإنشاء صورة.
-   **Prompt**: أدخل الوصف النصي للصورة (الصور) المطلوبة. الحد الأقصى للطول هو 1000 حرف لـ `dall-e-2` و 4000 حرف لـ `dall-e-3`.

### الخيارات

-   **Quality**: جودة الصورة التي تنشئها. **HD** (عالية الدقة) تنشئ صورًا بتفاصيل أدق واتساق أكبر عبر الصورة. هذا الخيار مدعوم فقط لـ `dall-e-3`. بخلاف ذلك، اختر **Standard** (قياسية).
-   **Resolution**: حدد دقة الصور التي تم إنشاؤها. حدد **1024x1024** لـ `dall-e-2`. حدد أحد الخيارات **1024x1024**، **1792x1014**، أو **1024x1792** لنماذج `dall-e-3`.
-   **Style**: حدد نمط الصور التي تم إنشاؤها. هذا الخيار مدعوم فقط لـ `dall-e-3`.
    -   **Natural**: استخدم هذا لإنتاج صور ذات مظهر طبيعي أكثر.
    -   **Vivid**: استخدم هذا لإنتاج صور واقعية للغاية ودرامية.
-   **Respond with image URL(s)**: ما إذا كان سيتم إرجاع روابط URL للصور بدلاً من الملفات الثنائية.
-   **Put Output in Field**: القيمة الافتراضية هي `data`. أدخل اسم حقل المخرجات لوضع بيانات الملف الثنائي فيه. متاح فقط إذا تم إيقاف تشغيل **Respond with image URL(s)**.

ارجع إلى [Create image | OpenAI](https://platform.openai.com/docs/api-reference/images/create) للمزيد من المعلومات.

## تعديل صورة

استخدم هذه العملية لتعديل صورة من موجه نصي.

أدخل هذه المعاملات:

-   **Credential to connect with**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
-   **Resource**: حدد **Image** (صورة).
-   **Operation**: حدد **Edit Image** (تعديل صورة).
-   **Model**: حدد النموذج الذي ترغب في استخدامه لإنشاء صورة. يدعم `dall-e-2` و `gpt-image-1`.
-   **Prompt**: أدخل الوصف النصي للتعديلات المطلوبة على الصورة (الصور) المدخلة.
-   **Image(s)**: أضف حقلاً ثنائياً واحداً أو أكثر لتضمين الصور مع الموجه الخاص بك. يجب أن تكون كل صورة ملف png أو webp أو jpg بحجم أقل من 50 ميجابايت. يمكنك توفير ما يصل إلى 16 صورة.
-   **Number of Images**: عدد الصور المراد إنشاؤها. يجب أن يكون بين 1 و 10.
-   **Size**: حجم وأبعاد الصور التي تم إنشاؤها (بالبكسل).
-   **Quality**: جودة الصورة التي سيتم إنشاؤها (تلقائي، منخفض، متوسط، عالٍ، قياسي). مدعوم فقط لـ `gpt-image-1`.
-   **Output Format**: التنسيق الذي يتم به إرجاع الصور التي تم إنشاؤها (png، webp، أو jpg). مدعوم فقط لـ `gpt-image-1`.
-   **Output Compression**: مستوى الضغط (0-100%) للصور التي تم إنشاؤها. مدعوم فقط لـ `gpt-image-1` مع تنسيقات مخرجات webp أو jpeg.

### الخيارات
-   **Background**: يسمح بتعيين الشفافية لخلفية الصورة (الصور) المُنشأة. مدعوم فقط لـ `gpt-image-1`.
-   **Input Fidelity**: تتحكم في مقدار الجهد الذي سيبذله النموذج لمطابقة نمط وميزات صور المدخلات. مدعوم فقط لـ `gpt-image-1`.
-   **Image Mask**: اسم الخاصية الثنائية التي تحتوي على الصورة. صورة ثانية تظهر مناطقها الشفافة بالكامل (على سبيل المثال، حيث تكون قيمة ألفا صفرًا) المكان الذي يجب تعديل الصورة فيه. إذا تم توفير صور متعددة، فسيتم تطبيق القناع على الصورة الأولى. يجب أن يكون ملف PNG صالحًا، أقل من 4 ميجابايت، وله نفس أبعاد الصورة.
-   **User**: مُعرّف فريد يمثل المستخدم النهائي الخاص بك، والذي يمكن أن يساعد OpenAI في مراقبة وكشف الانتهاكات.

## المشكلات الشائعة

للمشكلات أو الأخطاء الشائعة وخطوات الحل المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/common-issues.md).

---

# عمليات نص OpenAI

استخدم هذه العملية لمراسلة نموذج أو لتصنيف النص بحثًا عن انتهاكات في OpenAI. ارجع إلى [OpenAI](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/index.md) لمزيد من المعلومات حول عقدة OpenAI نفسها.

> **إصدارات العقدة السابقة**
>
> يقدم الإصدار 1.117.0 من n8n عقدة OpenAI V2 التي تدعم واجهة برمجة تطبيقات استجابات OpenAI (OpenAI Responses API). تعيد تسمية العملية "Message a Model" إلى "Generate a Chat Completion" لتوضيح ارتباطها بواجهة برمجة تطبيقات إكمال الدردشة (Chat Completions API) وتقدم عملية منفصلة "Generate a Model Response" تستخدم واجهة برمجة تطبيقات الاستجابات (Responses API).

## إنشاء إكمال دردشة

استخدم هذه العملية لإرسال رسالة أو مطالبة إلى نموذج OpenAI - باستخدام واجهة برمجة تطبيقات إكمال الدردشة (Chat Completions API) - وتلقي استجابة.

أدخل هذه المعاملات:

-   **Credential to connect with**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
-   **Resource**: حدد **نص**.
-   **Operation**: حدد **إنشاء إكمال دردشة**.
-   **Model**: حدد النموذج الذي تريد استخدامه. إذا لم تكن متأكدًا من النموذج الذي ستستخدمه، فجرّب `gpt-4o` إذا كنت بحاجة إلى ذكاء عالٍ أو `gpt-4o-mini` إذا كنت بحاجة إلى أسرع سرعة وأقل تكلفة. ارجع إلى [نظرة عامة على النماذج | منصة OpenAI](https://platform.openai.com/docs/models) لمزيد من المعلومات.
-   **Messages**: أدخل مطالبة **نصية** وخصص **دورًا** سيستخدمه النموذج لإنشاء الاستجابات. ارجع إلى [هندسة المطالبات | OpenAI](https://platform.openai.com/docs/guides/prompt-engineering) لمزيد من المعلومات حول كيفية كتابة مطالبة أفضل باستخدام هذه الأدوار. اختر من أحد هذه الأدوار:
    -   **User**: يرسل رسالة كمستخدم ويتلقى استجابة من النموذج.
    -   **Assistant**: يخبر النموذج بتبني نبرة أو شخصية معينة.
    -   **System**: بشكل افتراضي، لا توجد رسالة نظام. يمكنك تعريف التعليمات في رسالة المستخدم، لكن التعليمات المحددة في رسالة النظام تكون أكثر فعالية. يمكنك تعيين أكثر من رسالة نظام واحدة لكل محادثة. استخدم هذا لتعيين سلوك النموذج أو سياقه لرسالة المستخدم التالية.
-   **Simplify Output**: قم بتشغيله لإرجاع نسخة مبسطة من الاستجابة بدلاً من البيانات الخام.
-   **Output Content as JSON**: قم بتشغيله لمحاولة إرجاع الاستجابة بتنسيق JSON. متوافق مع `GPT-4 Turbo` وجميع نماذج `GPT-3.5 Turbo` الأحدث من `gpt-3.5-turbo-1106`.

### الخيارات

-   **عقوبة التكرار (Frequency Penalty)**: تطبيق عقوبة لتقليل ميل النموذج لتكرار الأسطر المتشابهة. يتراوح النطاق بين `0.0` و `2.0`.
-   **الحد الأقصى لعدد الرموز (Tokens)**: تعيين الحد الأقصى لعدد الرموز (tokens) للاستجابة. الرمز الواحد يعادل تقريباً أربعة أحرف للنص الإنجليزي القياسي. استخدم هذا لتحديد طول المخرجات (output).
-   **عدد الإكماليات (Number of Completions)**: القيمة الافتراضية هي 1. عيّن عدد الإكماليات التي ترغب في إنشائها لكل مطالبة. استخدم بحذر لأن تعيين عدد كبير سيستهلك الرموز (tokens) بسرعة.
-   **عقوبة الحضور (Presence Penalty)**: تطبيق عقوبة للتأثير على النموذج لمناقشة مواضيع جديدة. يتراوح النطاق بين `0.0` و `2.0`.
-   **عشوائية المخرجات (درجة الحرارة) (Output Randomness (Temperature))**: ضبط عشوائية الاستجابة. يتراوح النطاق بين `0.0` (حتمي) و `1.0` (أقصى عشوائية). نوصي بتغيير هذا أو **عشوائية المخرجات (Top P)** ولكن ليس كليهما. ابدأ بدرجة حرارة متوسطة (حوالي `0.7`) واضبطها بناءً على المخرجات (outputs) التي تلاحظها. إذا كانت الاستجابات متكررة جداً أو جامدة، زد درجة الحرارة. إذا كانت فوضوية جداً أو خارج المسار، قللها. القيمة الافتراضية هي `1.0`.
-   **عشوائية المخرجات (Top P) (Output Randomness (Top P))**: ضبط إعداد Top P للتحكم في تنوع استجابات المساعد. على سبيل المثال، `0.5` يعني أنه يتم أخذ نصف جميع الخيارات المرجحة بالاحتمالية في الاعتبار. نوصي بتغيير هذا أو **عشوائية المخرجات (درجة الحرارة)** ولكن ليس كليهما. القيمة الافتراضية هي `1.0`.

الرجوع إلى [Chat Completions | OpenAI](https://platform.openai.com/docs/api-reference/chat) توثيق لمزيد من المعلومات.

## إنشاء استجابة نموذج

استخدم هذه العملية (operation) لإرسال رسالة أو مطالبة إلى نموذج OpenAI - باستخدام واجهة برمجة تطبيقات الاستجابات (Responses API) - وتلقي استجابة.

أدخل هذه المعاملات (parameters):

-   **بيانات الاعتماد (Credential) للاتصال بـ**: أنشئ أو حدد [بيانات اعتماد (credential) OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
-   **المورد (Resource)**: حدد **نص**.
-   **العملية (Operation)**: حدد **إنشاء استجابة نموذج**.
-   **النموذج (Model)**: حدد النموذج الذي تريد استخدامه. ارجع إلى [نظرة عامة على النماذج | منصة OpenAI](https://platform.openai.com/docs/models) للحصول على نظرة عامة.
-   **الرسائل (Messages)**: اختر من بين أنواع الرسائل (Message Types) التالية:
    -   **نص (Text)**: أدخل مطالبة **نصية** وعيّن **دوراً** سيستخدمه النموذج لإنشاء الاستجابات. ارجع إلى [هندسة المطالبات | OpenAI](https://platform.openai.com/docs/guides/prompt-engineering) لمزيد من المعلومات حول كيفية كتابة مطالبة أفضل باستخدام هذه الأدوار.
    -   **صورة (Image)**: قدم **صورة** إما عبر رابط URL للصورة، أو معرف ملف (باستخدام [OpenAI Files API](https://platform.openai.com/docs/api-reference/files))، أو عن طريق تمرير بيانات ثنائية من عقدة (node) سابقة في سير العمل (workflow) الخاص بك.
    -   **ملف (File)**: قدم **ملفاً** بتنسيق مدعوم (حاليًا: PDF فقط)، إما عبر رابط URL للملف، أو معرف ملف (باستخدام [OpenAI Files API](https://platform.openai.com/docs/api-reference/files))، أو عن طريق تمرير بيانات ثنائية من عقدة (node) سابقة في سير العمل (workflow) الخاص بك.
    -   لأي نوع رسالة، يمكنك الاختيار من بين هذه الأدوار:
        -   **المستخدم (User)**: يرسل رسالة كمستخدم ويتلقى استجابة من النموذج.
        -   **المساعد (Assistant)**: يخبر النموذج بتبني نبرة أو شخصية معينة.
        -   **النظام (System)**: بشكل افتراضي، رسالة النظام هي `"You are a helpful assistant"`. يمكنك تعريف التعليمات في رسالة المستخدم، ولكن التعليمات المحددة في رسالة النظام تكون أكثر فعالية. يمكنك تعيين رسالة نظام واحدة فقط لكل محادثة. استخدم هذا لتعيين سلوك النموذج أو السياق لرسالة المستخدم التالية.
-   **تبسيط المخرجات (Simplify Output)**: قم بالتشغيل لإرجاع نسخة مبسطة من الاستجابة بدلاً من البيانات الخام.

### الأدوات المدمجة
توفر واجهة برمجة تطبيقات استجابات OpenAI مجموعة من [الأدوات المدمجة](https://platform.openai.com/docs/guides/tools) لإثراء استجابة النموذج:

- **البحث عبر الويب**: يسمح للنماذج بالبحث في الويب عن أحدث المعلومات قبل إنشاء استجابة.
- **خوادم MCP**: يسمح للنماذج بالاتصال بخوادم MCP البعيدة. اكتشف المزيد حول استخدام خوادم MCP البعيدة كأدوات [هنا](https://platform.openai.com/docs/guides/tools-connectors-mcp).
- **البحث في الملفات**: يسمح للنماذج بالبحث في قاعدة معارفك من الملفات التي تم تحميلها مسبقًا عن المعلومات ذات الصلة قبل إنشاء استجابة. ارجع إلى [توثيق OpenAI](https://platform.openai.com/docs/guides/tools-file-search) لمزيد من المعلومات.
- **مفسّر الشفرة**: يسمح للنماذج بكتابة وتشغيل شفرة Python في بيئة معزولة.

### الخيارات

- **الحد الأقصى لعدد الرموز (Tokens)**: عيّن الحد الأقصى لعدد الرموز للاستجابة. الرمز الواحد يعادل تقريبًا أربعة أحرف للنص الإنجليزي القياسي. استخدم هذا لتحديد طول المخرجات.
- **عشوائية المخرجات (درجة الحرارة)**: اضبط عشوائية الاستجابة. النطاق يتراوح بين `0.0` (حتمي) و `1.0` (أقصى عشوائية). نوصي بتعديل هذا أو **عشوائية المخرجات (Top P)** ولكن ليس كليهما. ابدأ بدرجة حرارة متوسطة (حوالي `0.7`) واضبط بناءً على المخرجات التي تلاحظها. إذا كانت الاستجابات متكررة جدًا أو جامدة، فزد درجة الحرارة. إذا كانت فوضوية جدًا أو خارجة عن الموضوع، فقللها. القيمة الافتراضية هي `1.0`.
- **عشوائية المخرجات (Top P)**: اضبط إعداد Top P للتحكم في تنوع استجابات المساعد. على سبيل المثال، `0.5` يعني أن نصف الخيارات المرجحة بالاحتمالية يتم أخذها في الاعتبار. نوصي بتعديل هذا أو **عشوائية المخرجات (درجة الحرارة)** ولكن ليس كليهما. القيمة الافتراضية هي `1.0`.
- **معرّف المحادثة**: المحادثة التي تنتمي إليها هذه الاستجابة. تتم إضافة عناصر المدخلات وعناصر المخرجات من هذه الاستجابة تلقائيًا إلى هذه المحادثة بعد اكتمال هذه الاستجابة.
- **معرّف الاستجابة السابقة**: معرّف الاستجابة السابقة للمتابعة منها. لا يمكن استخدامه بالتزامن مع معرّف المحادثة.
- **الاستدلال**: مستوى جهد الاستدلال الذي يجب أن يبذله النموذج لإنشاء الاستجابة. يتضمن القدرة على إرجاع **ملخص** للاستدلال الذي أجراه النموذج (على سبيل المثال، لأغراض التصحيح).
- **التخزين**: ما إذا كان سيتم تخزين استجابة النموذج التي تم إنشاؤها لاسترجاعها لاحقًا عبر واجهة برمجة التطبيقات (API). القيمة الافتراضية هي `true`.
- **تنسيق المخرجات**: ما إذا كان سيتم إرجاع الاستجابة كنص (**Text**)، أو في **مخطط JSON** محدد، أو كـ **كائن JSON**.
- **الخلفية**: ما إذا كان سيتم تشغيل النموذج في [وضع الخلفية](https://platform.openai.com/docs/guides/background). يسمح هذا بتنفيذ المهام طويلة الأمد بشكل أكثر موثوقية.

ارجع إلى توثيق [الاستجابات | OpenAI](https://platform.openai.com/docs/api-reference/responses/create) لمزيد من المعلومات.

## تصنيف النص بحثاً عن انتهاكات

تُستخدم هذه العملية لتحديد المحتوى الذي قد يكون ضاراً ووضع علامة عليه. سيقوم نموذج OpenAI بتحليل النص وإرجاع استجابة تحتوي على:

- `flagged`: حقل منطقي يشير إلى ما إذا كان المحتوى ضاراً محتملاً.
- `categories`: قائمة بعلامات الانتهاك الخاصة بالفئة.
- `category_scores`: درجات لكل فئة.

أدخل هذه المعاملات:

- **بيانات الاعتماد للاتصال بها**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
- **المورد**: حدد **Text**.
- **العملية**: حدد **Classify Text for Violations**.
- **المدخلات النصية**: أدخل النص لتصنيفه إذا كان ينتهك سياسة الإشراف.
- **تبسيط المخرجات**: قم بتشغيلها لإرجاع نسخة مبسطة من الاستجابة بدلاً من البيانات الخام.

### الخيارات

- **استخدام النموذج المستقر**: قم بتشغيلها لاستخدام النسخة المستقرة من النموذج بدلاً من أحدث نسخة، قد تكون الدقة أقل قليلاً.

ارجع إلى توثيق [Moderations | OpenAI](https://platform.openai.com/docs/api-reference/moderations) لمزيد من المعلومات.

## المشكلات الشائعة

للاطلاع على الأخطاء أو المشكلات الشائعة وخطوات الحل المقترحة، ارجع إلى [المشكلات الشائعة](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/common-issues.md).

---

# عمليات فيديو OpenAI

تُستخدم هذه العملية لإنشاء فيديو في OpenAI. ارجع إلى [OpenAI](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/index.md) لمزيد من المعلومات حول عقدة OpenAI نفسها.

## إنشاء فيديو

تُستخدم هذه العملية لإنشاء فيديو من موجه نصي.

أدخل هذه المعاملات:

- **بيانات الاعتماد للاتصال بها**: أنشئ أو حدد [بيانات اعتماد OpenAI](/integrations/builtin/credentials/openai.md) موجودة.
- **المورد**: حدد **Video**.
- **العملية**: حدد **Generate Video**.
- **النموذج**: حدد النموذج الذي تريد استخدامه لإنشاء فيديو. يدعم حالياً `sora-2` و `sora-2-pro`.
- **الموجه**: الموجه لإنشاء فيديو منه.
- **الثواني**: مدة المقطع بالثواني (حتى 25).
- **الحجم**: دقة المخرجات بتنسيق العرض × الارتفاع. لا يدعم Sora 2 Pro سوى 1024x1792 و 1792x1024.

### الخيارات

-   **Reference**: مرجع صورة اختياري يوجه عملية التوليد. يجب تمريره كعنصر ثنائي.
-   **Wait Timeout**: الوقت المستغرق لانتظار توليد الفيديو بالثواني. القيمة الافتراضية هي 300.
-   **Output Field Name**: اسم حقل المخرجات لوضع بيانات الملف الثنائي فيه. القيمة الافتراضية هي `data`.

للمزيد من المعلومات، ارجع إلى [توليد الفيديو | OpenAI](https://platform.openai.com/docs/guides/video-generation).