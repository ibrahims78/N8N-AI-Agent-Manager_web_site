# Embeddings AWS Bedrock node

Use the Embeddings AWS Bedrock node to generate [embeddings](/glossary.md#ai-embedding) for a given text.

On this page, you'll find the node parameters for the Embeddings AWS Bedrock node, and links to more resources.

> **Credentials**
>
> You can find authentication information for this node [here](/integrations/builtin/credentials/aws.md).

> **Parameter resolution in sub-nodes**
>
> Sub-nodes behave differently to other nodes when processing multiple items using an expression.
> 
> Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `` resolves to each name in turn.
> 
> In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `` always resolves to the first name.

## Node parameters

* **Model**: Select the model to use to generate the embedding.

Learn more about available models in the [Amazon Bedrock documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html). 

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Related resources

Refer to [LangChains's AWS Bedrock embeddings documentation](https://js.langchain.com/docs/integrations/platforms/aws/#text-embedding-models) and the [AWS Bedrock documentation](https://docs.aws.amazon.com/bedrock/) for more information about AWS Bedrock.

View n8n's [Advanced AI](/advanced-ai/index.md) documentation.