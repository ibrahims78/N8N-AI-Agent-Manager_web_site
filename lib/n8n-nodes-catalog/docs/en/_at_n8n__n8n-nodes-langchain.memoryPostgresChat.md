# Postgres Chat Memory node

Use the Postgres Chat Memory node to use Postgres as a [memory](/glossary.md#ai-memory) server for storing chat history.

On this page, you'll find a list of operations the Postgres Chat Memory node supports, and links to more resources.

> **Credentials**
>
> You can find authentication information for this node [here](/integrations/builtin/credentials/postgres.md).

> **Parameter resolution in sub-nodes**
>
> Sub-nodes behave differently to other nodes when processing multiple items using an expression.
> 
> Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `` resolves to each name in turn.
> 
> In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `` always resolves to the first name.

## Node parameters

* **Session Key**: Enter the key to use to store the memory in the workflow data.
* **Table Name**: Enter the name of the table to store the chat history in. The system will create the table if doesn't exist.
* **Context Window Length**: Enter the number of previous interactions to consider for context.

## Related resources

Refer to [LangChain's Postgres Chat Message History documentation](https://js.langchain.com/docs/integrations/memory/postgres) for more information about the service.

View n8n's [Advanced AI](/advanced-ai/index.md) documentation.

## Single memory instance