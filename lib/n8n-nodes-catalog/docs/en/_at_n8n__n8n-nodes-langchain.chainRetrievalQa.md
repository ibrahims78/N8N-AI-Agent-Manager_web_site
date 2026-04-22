# Question and Answer Chain node documentation

> Learn how to use the Question and Answer Chain node in n8n. Follow technical documentation to integrate Question and Answer Chain node into your workflows.

# Question and Answer Chain node

Use the Question and Answer Chain node to use a [vector store](https://docs.n8n.io/glossary/#ai-vector-store) as a retriever.

On this page, you'll find the node parameters for the Question and Answer Chain node, and links to more resources.

## Node parameters

### Query

The question you want to ask.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for retrieval-qanda-chain at [https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.chainretrievalqa/](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.chainretrievalqa/)

## Related resources

Refer to [LangChain's documentation on retrieval chains](https://js.langchain.com/docs/tutorials/rag/) for examples of how LangChain can use a vector store as a retriever.

View n8n's [Advanced AI](https://docs.n8n.io/advanced-ai/) documentation.

## Common issues

For common errors or issues and suggested resolution steps, refer to [Common Issues](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.chainretrievalqa/common-issues/).

---

<!-- sibling:common-issues.md -->
## Common Issues

# Question and Answer Chain node common issues

Here are some common errors and issues with the [Question and Answer Chain node](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.chainretrievalqa/) and steps to resolve or troubleshoot them.

## No prompt specified error

This error displays when the **Prompt** is empty or invalid.

You might see this in one of two scenarios:

1. When you've set the **Prompt** to **Define below** and have an expression in your **Text** that isn't generating a value.
    * To resolve, enter a valid prompt in the **Text** field.
    * Make sure any expressions reference valid fields and that they resolve to valid input rather than null.
2. When you've set the **Prompt** to **Connected Chat Trigger Node** and the incoming data has null values.
    * To resolve, make sure your input contains a `chatInput` field. Add an [Edit Fields (Set)](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.set/) node to edit an incoming field name to `chatInput`.
    * Remove any null values from the `chatInput` field of the input node.

<!-- vale from-write-good.Passive = NO -->
## A Retriever sub-node must be connected error
<!-- vale from-write-good.Passive = YES -->

This error displays when n8n tries to execute the node without having a Retriever connected.

To resolve this, click the + Retriever button at the bottom of your screen when the node is open, or click the Retriever + connector when the node isn't open. n8n will then open a selection of possible Retrievers to pick from.

## Can't produce longer responses

If you need to generate longer responses than the Question and Answer Chain node produces by default, you can try one or more of the following techniques:

* **Connect a more verbose model**: Some AI models produce more terse results than others. Swapping your model for one with a larger context window and more verbose output can increase the word length of your responses.
* **Increase the maximum number of tokens**: Many model nodes (for example the [OpenAI Chat Model](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatopenai/#maximum-number-of-tokens)) include a **Maximum Number of Tokens** option. You can set this to increase the maximum number of tokens the model can use to produce a response.
* **Build larger responses in stages**: For more detailed answers, you may want to construct replies in stages using a variety of AI nodes. You can use AI split up a single question into multiple prompts and create responses for each. You can then compose a final reply by combining the responses again. Though the details are different, you can find a good example of the general idea in this [template for writing a WordPress post with AI](https://n8n.io/workflows/2187-write-a-wordpress-post-with-ai-starting-from-a-few-keywords/).