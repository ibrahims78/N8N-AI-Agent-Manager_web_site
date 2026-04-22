# Stop And Error

> Documentation for the Stop And Error node in n8n, a workflow automation platform. Includes guidance on usage, and links to examples.

# Stop And Error

Use the Stop And Error node to display custom error messages, cause executions to fail under certain conditions, and send custom error information to error workflows.

## Operations

* Error Message
* Error Object

## Node parameters

Both operations include one node parameter, the **Error Type**. Use this parameter to select the type of error to throw. Choose between the two operations: **Error Message** and **Error Object**.

The other parameters depend on which operation you select.

### Error Message parameters

The Error Message Error Type adds one parameter, the **Error Message** field. Enter the message you'd like to throw.

### Error Object parameters

The Error Object Error Type adds one parameter, the **Error Object**. Enter a JSON object that contains the error properties you'd like to throw.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for stop-and-error at [https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.stopanderror/](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.stopanderror/)

## Related resources

You can use the Stop And Error node with the [Error trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.errortrigger/) node.

Read more about [Error workflows](https://docs.n8n.io/flow-logic/error-handling/) in n8n workflows.