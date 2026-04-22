# Embeddings Google Vertex node

Use the Embeddings Google Vertex node to generate [embeddings](/glossary.md#ai-embedding) for a given text.

On this page, you'll find the node parameters for the Embeddings Google Vertex node, and links to more resources.

> **Credentials**
>
> You can find authentication information for this node [here](/integrations/builtin/credentials/google/service-account.md).

> **Parameter resolution in sub-nodes**
>
> Sub-nodes behave differently to other nodes when processing multiple items using an expression.
> 
> Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `` resolves to each name in turn.
> 
> In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `` always resolves to the first name.

## Node parameters

- **Model**: Select the model to use to generate the embedding.

Learn more about available embedding models in [Google VertexAI embeddings API documentation](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/text-embeddings-api).

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Related resources

Refer to [LangChain's Google Generative AI embeddings documentation](https://js.langchain.com/docs/integrations/text_embedding/google_generativeai) for more information about the service.

View n8n's [Advanced AI](/advanced-ai/index.md) documentation.