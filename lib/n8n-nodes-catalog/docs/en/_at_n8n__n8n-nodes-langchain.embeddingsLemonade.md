# Embeddings Lemonade node

Use the Embeddings Lemonade node to generate vector embeddings using models hosted and managed by a Lemonade server. This node is useful for workflows that perform semantic search, clustering, similarity matching, or any task that requires numerical vector representations of text.

On this page, you'll find a list of operations the Embeddings Lemonade node supports, and links to more resources.

> **Credentials**
>
> You can find authentication information for this node [here](/integrations/builtin/credentials/lemonade.md).

> **Parameter resolution in sub-nodes**
>
> Sub-nodes behave differently to other nodes when processing multiple items using an expression.
> 
> Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `` resolves to each name in turn.
> 
> In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `` always resolves to the first name.

## Node parameters

Configure the node with the following parameters.

### Model

The model which will generate the embeddings. Models are loaded and managed through the Lemonade server configured for this node. Select the desired model from the list of available options served by your Lemonade instance.

## Templates and examples

## Related resources

Refer to [Lemonade Server's documentation](https://lemonade-server.ai/docs/) for more information about the service.

View n8n's [Advanced AI](/advanced-ai/index.md) documentation.