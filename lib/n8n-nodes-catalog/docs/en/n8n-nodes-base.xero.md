# Xero node

Use the Xero node to automate work in Xero, and integrate Xero with other applications. n8n has built-in support for a wide range of Xero features, including creating, updating, and getting contacts and invoices. 

On this page, you'll find a list of operations the Xero node supports and links to more resources.

> **Credentials**
>
> Refer to [Xero credentials](/integrations/builtin/credentials/xero.md) for guidance on setting up authentication.

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

## Related resources

Refer to [Xero's API documentation](https://developer.xero.com/documentation/api/accounting/overview) for more information about the service.

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.