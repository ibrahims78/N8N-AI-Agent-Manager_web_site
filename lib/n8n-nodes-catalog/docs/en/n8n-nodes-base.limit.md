# Limit

> Documentation for the Limit node in n8n, a workflow automation platform. Includes guidance on usage, and links to examples.

# Limit

Use the Limit node to remove items beyond a defined maximum number. You can choose whether n8n takes the items from the beginning or end of the input data.

## Node parameters

Configure this node using the following parameters.

### Max Items

Enter the maximum number of items that n8n should keep. If the input data contains more than this value, n8n removes the items.

### Keep

If the node has to remove items, select where it keeps the input items from:

* **First Items**: Keeps the **Max Items** number of items from the beginning of the input data.
* **Last Items**: Keeps the **Max Items** number of items from the end of the input data.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for limit at [https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.limit/](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.limit/)

## Related resources

Learn more about [data structure and data flow](https://docs.n8n.io/data/) in n8n workflows.