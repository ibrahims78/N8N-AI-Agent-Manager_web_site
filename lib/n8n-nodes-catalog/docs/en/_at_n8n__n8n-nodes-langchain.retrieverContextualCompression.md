# Contextual Compression Retriever node documentation

> Learn how to use the Contextual Compression Retriever node in n8n. Follow technical documentation to integrate Contextual Compression Retriever node into your workflows.

# Contextual Compression Retriever node

The Contextual Compression Retriever node improves the answers returned from [vector store](https://docs.n8n.io/glossary/#ai-vector-store) document similarity searches by taking into account the context from the query.

> **Parameter resolution in sub-nodes**
>
> Sub-nodes behave differently to other nodes when processing multiple items using an expression.
> 
> Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `` resolves to each name in turn.
> 
> In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `` always resolves to the first name.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for contextual-compression-retriever at [https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.retrievercontextualcompression/](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.retrievercontextualcompression/)

## Related resources

Refer to [LangChain's contextual compression retriever documentation](https://js.langchain.com/docs/how_to/contextual_compression/) for more information about the service.

View n8n's [Advanced AI](https://docs.n8n.io/advanced-ai/) documentation.