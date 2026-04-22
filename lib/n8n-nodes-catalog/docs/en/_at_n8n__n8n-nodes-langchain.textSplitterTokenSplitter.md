# Token Splitter node

The Token Splitter node splits a raw text string by first converting the text into BPE tokens, then splits these tokens into chunks and converts the tokens within a single chunk back into text.

On this page, you'll find the node parameters for the Token Splitter node, and links to more resources.

> **Parameter resolution in sub-nodes**
>
> Sub-nodes behave differently to other nodes when processing multiple items using an expression.
> 
> Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `` resolves to each name in turn.
> 
> In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `` always resolves to the first name.

## Node parameters

* **Chunk Size**: Enter the number of characters in each chunk.
* **Chunk Overlap**: Enter how much overlap to have between chunks.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Related resources

Refer to [LangChain's token documentation](https://js.langchain.com/docs/concepts/tokens/) and [LangChain's text splitter documentation](https://js.langchain.com/docs/concepts/text_splitters/) for more information about the service.

View n8n's [Advanced AI](/advanced-ai/index.md) documentation.