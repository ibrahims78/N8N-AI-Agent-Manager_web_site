# MongoDB Chat Memory node

Use the MongoDB Chat Memory node to use MongoDB as a [memory](/glossary.md#ai-memory) server for storing chat history.

On this page, you'll find a list of operations the MongoDB Chat Memory node supports, and links to more resources.

> **Credentials**
>
> You can find authentication information for this node [here](/integrations/builtin/credentials/mongodb.md).

> **Parameter resolution in sub-nodes**
>
> Sub-nodes behave differently to other nodes when processing multiple items using an expression.
> 
> Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `` resolves to each name in turn.
> 
> In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `` always resolves to the first name.

## Node parameters

* **Session Key**: Enter the key to use to store the memory in the workflow data.
* **Collection Name**: Enter the name of the collection to store the chat history in. The system will create the collection if it doesn't exist.
* **Database Name**: Enter the name of the database to store the chat history in. If not provided, the database from credentials will be used.
* **Context Window Length**: Enter the number of previous interactions to consider for context.

## Related resources

Refer to [LangChain's MongoDB Chat Message History documentation](https://js.langchain.com/docs/integrations/memory/mongodb) for more information about the service.

View n8n's [Advanced AI](/advanced-ai/index.md) documentation.

## Single memory instance