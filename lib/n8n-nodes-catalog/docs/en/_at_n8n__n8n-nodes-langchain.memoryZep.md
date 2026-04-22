# Zep node

> **Deprecated**
>
> This node is deprecated, and will be removed in a future version.

Use the Zep node to use Zep as a [memory](/glossary.md#ai-memory) server.

On this page, you'll find a list of operations the Zep node supports, and links to more resources.

> **Credentials**
>
> You can find authentication information for this node [here](/integrations/builtin/credentials/zep.md).

> **Parameter resolution in sub-nodes**
>
> Sub-nodes behave differently to other nodes when processing multiple items using an expression.
> 
> Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `` resolves to each name in turn.
> 
> In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `` always resolves to the first name.

## Node parameters

* **Session ID**: Enter the ID to use to store the memory in the workflow data.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Related resources

Refer to [LangChain's Zep documentation](https://js.langchain.com/docs/integrations/memory/zep_memory) for more information about the service.

View n8n's [Advanced AI](/advanced-ai/index.md) documentation.

## Single memory instance