# Anthropic Chat Model node

Use the Anthropic Chat Model node to use Anthropic's Claude family of chat models with conversational [agents](/glossary.md#ai-agent).

On this page, you'll find the node parameters for the Anthropic Chat Model node, and links to more resources.

> **Credentials**
>
> You can find authentication information for this node [here](/integrations/builtin/credentials/anthropic.md).

> **Parameter resolution in sub-nodes**
>
> Sub-nodes behave differently to other nodes when processing multiple items using an expression.
> 
> Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `` resolves to each name in turn.
> 
> In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `` always resolves to the first name.

## Node parameters

* **Model**: Select the model that generates the completion. Choose from:
	* **Claude**
	* **Claude Instant**

Learn more in the [Anthropic model documentation](https://docs.anthropic.com/claude/reference/selecting-a-model).

## Node options

* **Maximum Number of Tokens**: Enter the maximum number of tokens used, which sets the completion length.
* **Sampling Temperature**: Use this option to control the randomness of the sampling process. A higher temperature creates more diverse sampling, but increases the risk of hallucinations.
* **Top K**: Enter the number of token choices the model uses to generate the next token.
* **Top P**: Use this option to set the probability the completion should use. Use a lower value to ignore less probable options. 

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Related resources

Refer to [LangChains's Anthropic documentation](https://js.langchain.com/docs/integrations/chat/anthropic/) for more information about the service.

View n8n's [Advanced AI](/advanced-ai/index.md) documentation.