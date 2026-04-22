# عقدة Embeddings AWS Bedrock

استخدم عقدة Embeddings AWS Bedrock لتوليد [التضمينات](/glossary.md#ai-embedding) لنص معين.

في هذه الصفحة، ستجد المعاملات الخاصة بعقدة Embeddings AWS Bedrock، وروابط لموارد إضافية.

> **بيانات الاعتماد**
>
> يمكنك العثور على معلومات المصادقة لهذه العقدة [هنا](/integrations/builtin/credentials/aws.md).

> **حل المعاملات في العقد الفرعية**
>
> تتصرف العقد الفرعية بشكل مختلف عن العقد الأخرى عند معالجة عناصر متعددة باستخدام تعبير.
>
> تقبل معظم العقد، بما في ذلك العقد الجذرية، أي عدد من العناصر كمدخلات، وتقوم بمعالجة هذه العناصر، وتُخرج النتائج. يمكنك استخدام التعبيرات للإشارة إلى عناصر المدخلات، وتقوم العقدة بحل التعبير لكل عنصر على حدة. على سبيل المثال، بالنظر إلى مدخلات تتكون من خمس قيم `name`، يتم حل التعبير `` لكل اسم على حدة.
>
> في العقد الفرعية، يتم حل التعبير دائمًا للعنصر الأول. على سبيل المثال، بالنظر إلى مدخلات تتكون من خمس قيم `name`، يتم حل التعبير `` دائمًا للاسم الأول.

## معاملات العقدة

* **Model**: حدد النموذج المراد استخدامه لتوليد التضمين.

تعرف على المزيد حول النماذج المتاحة في [توثيق Amazon Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html).

## القوالب والأمثلة

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## الموارد ذات الصلة

ارجع إلى [توثيق تضمينات AWS Bedrock الخاص بـ LangChain](https://js.langchain.com/docs/integrations/platforms/aws/#text-embedding-models) و[توثيق AWS Bedrock](https://docs.aws.amazon.com/bedrock/) لمزيد من المعلومات حول AWS Bedrock.

اطلع على [توثيق الذكاء الاصطناعي المتقدم](/advanced-ai/index.md) الخاص بـ n8n.