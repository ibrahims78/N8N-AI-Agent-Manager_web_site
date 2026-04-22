# Microsoft To Do node documentation

> Learn how to use the Microsoft To Do node in n8n. Follow technical documentation to integrate Microsoft To Do node into your workflows.

# Microsoft To Do node

Use the Microsoft To Do node to automate work in Microsoft To Do, and integrate Microsoft To Do with other applications. n8n has built-in support for a wide range of Microsoft To Do features, including creating, updating, deleting, and getting linked resources, lists, and tasks. 

On this page, you'll find a list of operations the Microsoft To Do node supports and links to more resources.

> **Credentials**
>
> Refer to [Microsoft credentials](/integrations/builtin/credentials/microsoft.md) for guidance on setting up authentication.

> **Government Cloud Support**
>
> If you're using a government cloud tenant (US Government, US Government DOD, or China), make sure to select the appropriate **Microsoft Graph API Base URL** in your Microsoft credentials configuration.

> **This node can be used as an AI tool**
>
> This node can be used to enhance the capabilities of an AI agent. When used in this way, many parameters can be set automatically, or with information directed by AI - find out more in the [AI tool parameters documentation](/advanced-ai/examples/using-the-fromai-function.md).

## Operations

* Linked Resource
    * Create
    * Delete
    * Get
    * Get All
    * Update
* List
    * Create
    * Delete
    * Get
    * Get All
    * Update
* Task
    * Create
    * Delete
    * Get
    * Get All
    * Update

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for microsoft-to-do at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.microsofttodo/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.microsofttodo/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io//) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.