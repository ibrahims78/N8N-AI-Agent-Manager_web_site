# Help Scout node documentation

> Learn how to use the Help Scout node in n8n. Follow technical documentation to integrate Help Scout node into your workflows.

# Help Scout node

Use the Help Scout node to automate work in Help Scout, and integrate Help Scout with other applications. n8n has built-in support for a wide range of Help Scout features, including creating, updating, deleting, and getting conversations, and customers.

On this page, you'll find a list of operations the Help Scout node supports and links to more resources.

> **Credentials**
>
> Refer to [Help Scout credentials](/integrations/builtin/credentials/helpscout.md) for guidance on setting up authentication.

## Operations

* Conversation
    * Create a new conversation
    * Delete a conversation
    * Get a conversation
    * Get all conversations
* Customer
    * Create a new customer
    * Get a customer
    * Get all customers
    * Get customer property definitions
    * Update a customer
* Mailbox
    * Get data of a mailbox
    * Get all mailboxes
* Thread
    * Create a new chat thread
    * Get all chat threads

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for helpscout at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.helpscout/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.helpscout/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io//) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.