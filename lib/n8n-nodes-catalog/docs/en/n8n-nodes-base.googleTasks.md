# Google Tasks node documentation

> Learn how to use the Google Tasks node in n8n. Follow technical documentation to integrate Google Tasks node into your workflows.

# Google Tasks node

Use the Google Tasks node to automate work in Google Tasks, and integrate Google Tasks with other applications. n8n has built-in support for a wide range of Google Tasks features, including adding, updating, and retrieving contacts. 

On this page, you'll find a list of operations the Google Tasks node supports and links to more resources.

> **Credentials**
>
> Refer to [Google Tasks credentials](https://docs.n8n.io//) for guidance on setting up authentication.

> **This node can be used as an AI tool**
>
> This node can be used to enhance the capabilities of an AI agent. When used in this way, many parameters can be set automatically, or with information directed by AI - find out more in the [AI tool parameters documentation](/advanced-ai/examples/using-the-fromai-function.md).

## Operations

* Task
    * Add a task to task list
    * Delete a task
    * Retrieve a task
    * Retrieve all tasks from a task list
    * Update a task

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for google-tasks at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googletasks/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googletasks/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io//) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.