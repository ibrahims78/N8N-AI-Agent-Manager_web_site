# Google Contacts node

Use the Google Contacts node to automate work in Google Contacts, and integrate Google Contacts with other applications. n8n has built-in support for a wide range of Google Contacts features, including creating, updating, retrieving, deleting, and getting contacts. 

On this page, you'll find a list of operations the Google Contacts node supports and links to more resources.

> **Credentials**
>
> Refer to [Google Contacts credentials](/integrations/builtin/credentials/google/index.md) for guidance on setting up authentication.

> **This node can be used as an AI tool**
>
> This node can be used to enhance the capabilities of an AI agent. When used in this way, many parameters can be set automatically, or with information directed by AI - find out more in the [AI tool parameters documentation](/advanced-ai/examples/using-the-fromai-function.md).

## Operations

* Contact
    * Create a contact
    * Delete a contact
    * Get a contact
    * Retrieve all contacts
    * Update a contact

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.