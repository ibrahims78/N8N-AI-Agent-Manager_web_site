# Wolfram|Alpha tool node

Use the Wolfram|Alpha tool node to connect your [agents](/glossary.md#ai-agent) and [chains](/glossary.md#ai-chain) to Wolfram|Alpha's computational intelligence engine.

> **Credentials**
>
> You can find authentication information for this node [here](/integrations/builtin/credentials/wolframalpha.md).

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

Refer to [Wolfram|Alpha's documentation](https://products.wolframalpha.com/api) for more information about the service. You can also view [LangChain's documentation on their WolframAlpha Tool](https://js.langchain.com/docs/integrations/tools/wolframalpha/).

View n8n's [Advanced AI](/advanced-ai/index.md) documentation.