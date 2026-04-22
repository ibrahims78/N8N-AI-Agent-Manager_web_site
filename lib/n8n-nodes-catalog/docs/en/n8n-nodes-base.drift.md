# Drift node documentation

> Learn how to use the Drift node in n8n. Follow technical documentation to integrate Drift node into your workflows.

# Drift node

Use the Drift node to automate work in Drift, and integrate Drift with other applications. n8n has built-in support for a wide range of Drift features, including creating, updating, deleting, and getting contacts. 

On this page, you'll find a list of operations the Drift node supports and links to more resources.

> **Credentials**
>
> Refer to [Drift credentials](/integrations/builtin/credentials/drift.md) for guidance on setting up authentication.

## Operations

* Contact
    * Create a contact
    * Get custom attributes
    * Delete a contact
    * Get a contact
    * Update a contact

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for drift at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.drift/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.drift/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io//) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.