# HTTP Request Tool node

> **Legacy tool version**
>
> New instances of the HTTP Request tool node that you add to workflows use the standard [HTTP Request](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) node as a tool. This page is describes the legacy, standalone HTTP Request tool node.
> 
> You can identify which tool version is in your workflow by checking if the node has an **Add option** property when you open the node on the canvas. If that button is present, you're using the new version, not the one described on this page.

The HTTP Request tool works just like the [HTTP Request](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) node, but it's designed to be used with an [AI agent](/glossary.md#ai-agent) as a tool to collect information from a website or API.

On this page, you'll find a list of operations the HTTP Request node supports and links to more resources.

> **Credentials**
>
> Refer to [HTTP Request credentials](/integrations/builtin/credentials/httprequest.md) for guidance on setting up authentication.

> **Parameter resolution in sub-nodes**
>
> Sub-nodes behave differently to other nodes when processing multiple items using an expression.
> 
> Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `` resolves to each name in turn.
> 
> In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `` always resolves to the first name.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Related resources

Refer to [LangChain's documentation on tools](https://langchain-ai.github.io/langgraphjs/how-tos/tool-calling/) for more information about tools in LangChain.

View n8n's [Advanced AI](/advanced-ai/index.md) documentation.