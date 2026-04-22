# SendGrid node documentation

> Learn how to use the SendGrid node in n8n. Follow technical documentation to integrate SendGrid node into your workflows.

# SendGrid node

Use the SendGrid node to automate work in SendGrid, and integrate SendGrid with other applications. n8n has built-in support for a wide range of SendGrid features, including creating, updating, deleting, and getting contacts, and lists, as well as sending emails. 

On this page, you'll find a list of operations the SendGrid node supports and links to more resources.

> **Credentials**
>
> Refer to [SendGrid credentials](https://docs.n8n.io/integrations/builtin/credentials/sendgrid/) for guidance on setting up authentication.

> **This node can be used as an AI tool**
>
> This node can be used to enhance the capabilities of an AI agent. When used in this way, many parameters can be set automatically, or with information directed by AI - find out more in the [AI tool parameters documentation](https://docs.n8n.io/advanced-ai/examples/using-the-fromai-function/).

## Operations

* Contact
    * Create/update a contact
    * Delete a contact
    * Get a contact by ID
    * Get all contacts
* List
    * Create a list
    * Delete a list
    * Get a list
    * Get all lists
    * Update a list
* Mail
    * Send an email.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for sendgrid at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.sendgrid/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.sendgrid/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](https://docs.n8n.io/integrations/custom-operations/) for more information.