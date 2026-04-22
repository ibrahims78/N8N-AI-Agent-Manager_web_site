# Workflow Retriever node documentation

> Learn how to use the Workflow Retriever node in n8n. Follow technical documentation to integrate Workflow Retriever node into your workflows.

# Workflow Retriever node

Use the Workflow Retriever node to retrieve data from an n8n workflow for use in a Retrieval QA Chain or another Retriever node.

On this page, you'll find the node parameters for the Workflow Retriever node, and links to more resources.

> **Parameter resolution in sub-nodes**
>
> Sub-nodes behave differently to other nodes when processing multiple items using an expression.
> 
> Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `` resolves to each name in turn.
> 
> In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `` always resolves to the first name.

## Node parameters

### Source

Tell n8n which workflow to call. You can choose either:

* **Database** and enter a workflow ID.
* **Parameter** and copy in a complete [workflow JSON](https://docs.n8n.io/workflows/export-import/).

### Workflow values

Set values to pass to the workflow you're calling.

These values appear in the output data of the trigger node in the workflow you call. You can access these values in expressions in the workflow. For example, if you have:

* **Workflow Values** with a **Name** of `myCustomValue`
* A workflow with an Execute Sub-workflow Trigger node as its trigger

The expression to access the value of `myCustomValue` is ``.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for workflow-retriever at [https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.retrieverworkflow/](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.retrieverworkflow/)

## Related resources

Refer to [LangChain's general retriever documentation](https://js.langchain.com/docs/concepts/retrievers/) for more information about the service.

View n8n's [Advanced AI](https://docs.n8n.io/advanced-ai/) documentation.