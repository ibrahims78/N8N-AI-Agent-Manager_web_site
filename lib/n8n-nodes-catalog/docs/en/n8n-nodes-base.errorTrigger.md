# Error Trigger node documentation

> Learn how to use the Error Trigger node in n8n. Follow technical documentation to integrate Error Trigger node into your workflows.

# Error Trigger node

You can use the Error Trigger node to create error workflows. When another linked workflow fails, this node gets details about the failed workflow and the errors, and runs the error workflow.

## Usage

1. Create a new workflow, with the Error Trigger as the first node. 
2. Give the workflow a name, for example `Error Handler`. 
3. Select **Save**.
4. In the workflow where you want to use this error workflow:
	1. Select **Options** <span class="n8n-inline-image">![Options menu icon](/api/catalog/docs/assets/n8n-nodes-base.errorTrigger/three-dot-options-menu.png){.off-glb}</span> > **Settings**.
	2. In **Error workflow**, select the workflow you just created. For example, if you used the name Error Handler, select **Error handler**.
	3. Select **Save**.
	Now, when this workflow errors, the related error workflow runs.

Note the following:

* If a workflow uses the Error Trigger node, you don't have to publish the workflow.
* If a workflow contains the Error Trigger node, by default, the workflow uses itself as the error workflow.
* You can't test error workflows when running workflows manually. The Error Trigger only runs when an automatic workflow errors.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for error-trigger at [https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.errortrigger/](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.errortrigger/)

## Related resources

You can use the [Stop And Error](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.stopanderror/) node to send custom messages to the Error Trigger.

Read more about [Error workflows](https://docs.n8n.io/flow-logic/error-handling/) in n8n workflows. 

## Error data

The default error data received by the Error Trigger is:

```json
[
	{
		"execution": {
			"id": "231",
			"url": "https://n8n.example.com/execution/231",
			"retryOf": "34",
			"error": {
				"message": "Example Error Message",
				"stack": "Stacktrace"
			},
			"lastNodeExecuted": "Node With Error",
			"mode": "manual"
		},
		"workflow": {
			"id": "1",
			"name": "Example Workflow"
		}
	}
]

```

All information is always present, except:

- `execution.id`: requires the execution to be saved in the database. Not present if the error is in the trigger node of the main workflow, as the workflow doesn't execute.
- `execution.url`: requires the execution to be saved in the database. Not present if the error is in the trigger node of the main workflow, as the workflow doesn't execute.
- `execution.retryOf`: only present when the execution is a retry of a failed execution.

If the error is caused by the trigger node of the main workflow, rather than a later stage, the data sent to the error workflow is different. There's less information in `execution{}` and more in `trigger{}`:

```json
{
  "trigger": {
    "error": {
      "context": {},
      "name": "WorkflowActivationError",
      "cause": {
        "message": "",
        "stack": ""
      },
      "timestamp": 1654609328787,
      "message": "",
      "node": {
        . . . 
      }
    },
    "mode": "trigger"
  },
  "workflow": {
    "id": "",
    "name": ""
  }
}
```