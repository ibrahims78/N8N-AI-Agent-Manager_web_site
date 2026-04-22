# Xero node documentation

> Learn how to use the Xero node in n8n. Follow technical documentation to integrate Xero node into your workflows.

# Xero node

Use the Xero node to automate work in Xero, and integrate Xero with other applications. n8n has built-in support for a wide range of Xero features, including creating, updating, and getting contacts and invoices. 

On this page, you'll find a list of operations the Xero node supports and links to more resources.

> **Credentials**
>
> Refer to [Xero credentials](https://docs.n8n.io/integrations/builtin/credentials/xero/) for guidance on setting up authentication.

## Operations

* Contact
    * Create a contact
    * Get a contact
    * Get all contacts
    * Update a contact
* Invoice
    * Create a invoice
    * Get a invoice
    * Get all invoices
    * Update a invoice

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for xero at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.xero/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.xero/)

## Related resources

Refer to [Xero's API documentation](https://developer.xero.com/documentation/api/accounting/overview) for more information about the service.

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](https://docs.n8n.io/integrations/custom-operations/) for more information.