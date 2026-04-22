# Zep node documentation

> Learn how to use the Zep node in n8n. Follow technical documentation to integrate Zep node into your workflows.

# Zep node

> **Deprecated**
>
> This node is deprecated, and will be removed in a future version.

Use the Zep node to use Zep as a [memory](https://docs.n8n.io/glossary/#ai-memory) server.

On this page, you'll find a list of operations the Zep node supports, and links to more resources.

> **Credentials**
>
> You can find authentication information for this node [here](https://docs.n8n.io/integrations/builtin/credentials/zep/).

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

> **🔗 Templates & examples:** browse ready-made workflows for zep at [https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.memoryzep/](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.memoryzep/)

## Related resources

Refer to [LangChain's Zep documentation](https://js.langchain.com/docs/integrations/memory/zep_memory) for more information about the service.

View n8n's [Advanced AI](https://docs.n8n.io/advanced-ai/) documentation.

## Single memory instance