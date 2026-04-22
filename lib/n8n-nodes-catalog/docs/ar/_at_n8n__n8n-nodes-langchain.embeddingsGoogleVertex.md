# عقدة Embeddings Google Vertex

استخدم عقدة Embeddings Google Vertex لتوليد [التضمينات](/glossary.md#ai-embedding) لنص معين.

في هذه الصفحة، ستجد معاملات العقدة لعقدة Embeddings Google Vertex، وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> يمكنك العثور على معلومات المصادقة لهذه العقدة [هنا](/integrations/builtin/credentials/google/service-account.md).

> **حل المعاملات في العقد الفرعية**
>
> تتصرف العقد الفرعية بشكل مختلف عن العقد الأخرى عند معالجة عناصر متعددة باستخدام تعبير.
>
> معظم العقد، بما في ذلك العقد الجذرية، تأخذ أي عدد من العناصر كمدخلات، تعالج هذه العناصر، وتخرج النتائج. يمكنك استخدام التعبيرات للإشارة إلى عناصر المدخلات، وتحل العقدة التعبير لكل عنصر على حدة. على سبيل المثال، بالنظر إلى مدخلات من خمس قيم `name`، يتم حل التعبير `` لكل اسم على حدة.
>
> في العقد الفرعية، يتم حل التعبير دائمًا إلى العنصر الأول. على سبيل المثال، بالنظر إلى مدخلات من خمس قيم `name`، يتم حل التعبير `` دائمًا إلى الاسم الأول.

## معاملات العقدة

- **Model**: حدد النموذج المراد استخدامه لتوليد التضمين.

تعرف على المزيد حول نماذج التضمين المتاحة في [توثيق API لتضمينات Google VertexAI](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/text-embeddings-api).

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

ارجع إلى [توثيق تضمينات Google Generative AI الخاص بـ LangChain](https://js.langchain.com/docs/integrations/text_embedding/google_generativeai) لمزيد من المعلومات حول الخدمة.

اطلع على [توثيق الذكاء الاصطناعي المتقدم](/advanced-ai/index.md) الخاص بـ n8n.