# عقدة HuggingFace Inference للـ Embeddings

استخدم عقدة HuggingFace Inference للـ Embeddings لإنشاء [التضمينات](/glossary.md#ai-embedding) لنص معين.

في هذه الصفحة، ستجد معاملات العقدة لـ Embeddings HuggingFace Inference، وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> يمكنك العثور على معلومات المصادقة لهذه العقدة [هنا](/integrations/builtin/credentials/huggingface.md).

> **حل المعاملات في العقد الفرعية**
>
> تتصرف العقد الفرعية بشكل مختلف عن العقد الأخرى عند معالجة عناصر متعددة باستخدام تعبير.
>
> معظم العقد، بما في ذلك العقد الجذرية، تأخذ أي عدد من العناصر كمدخلات، وتعالج هذه العناصر، وتُخرج النتائج. يمكنك استخدام التعبيرات للإشارة إلى عناصر المدخلات، وتحل العقدة التعبير لكل عنصر على حدة. على سبيل المثال، بالنظر إلى مدخلات من خمس قيم `name`، يُحل التعبير `` لكل اسم على حدة.
>
> في العقد الفرعية، يُحل التعبير دائمًا إلى العنصر الأول. على سبيل المثال، بالنظر إلى مدخلات من خمس قيم `name`، يُحل التعبير `` دائمًا إلى الاسم الأول.

## معاملات العقدة

*   **Model**: حدد النموذج المراد استخدامه لإنشاء الـ embedding.

ارجع إلى [توثيق نماذج Hugging Face](https://huggingface.co/models?other=embeddings) للاطلاع على النماذج المتاحة.

## خيارات العقدة

*   **Custom Inference Endpoint**: أدخل عنوان URL لنموذجك المنشور، المستضاف بواسطة HuggingFace. إذا قمت بتعيين هذا، تتجاهل n8n اسم **Model Name**.

ارجع إلى [دليل HuggingFace للاستدلال](https://huggingface.co/inference-endpoints) لمزيد من المعلومات.

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

ارجع إلى [توثيق Langchain لـ HuggingFace Inference embeddings](https://js.langchain.com/docs/integrations/text_embedding/hugging_face_inference/) لمزيد من المعلومات حول الخدمة.

اطلع على توثيق n8n [للذكاء الاصطناعي المتقدم](/advanced-ai/index.md).