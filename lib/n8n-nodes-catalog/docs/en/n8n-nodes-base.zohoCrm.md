# Zoho CRM node

Use the Zoho CRM node to automate work in Zoho CRM, and integrate Zoho CRM with other applications. n8n has built-in support for a wide range of Zoho CRM features, including creating and deleting accounts, contacts, and deals. 

On this page, you'll find a list of operations the Zoho CRM node supports and links to more resources.

> **Credentials**
>
> Refer to [Zoho CRM credentials](/integrations/builtin/credentials/zoho.md) for guidance on setting up authentication.

> **This node can be used as an AI tool**
>
> This node can be used to enhance the capabilities of an AI agent. When used in this way, many parameters can be set automatically, or with information directed by AI - find out more in the [AI tool parameters documentation](/advanced-ai/examples/using-the-fromai-function.md).

## Operations

* Account
    * Create an account
    * Create a new record, or update the current one if it already exists (upsert)
    * Delete an account
    * Get an account
    * Get all accounts
    * Update an account
* Contact
    * Create a contact
    * Create a new record, or update the current one if it already exists (upsert)
    * Delete a contact
    * Get a contact
    * Get all contacts
    * Update a contact
* Deal
    * Create a deal
    * Create a new record, or update the current one if it already exists (upsert)
    * Delete a contact
    * Get a contact
    * Get all contacts
    * Update a contact
* Invoice
    * Create an invoice
    * Create a new record, or update the current one if it already exists (upsert)
    * Delete an invoice
    * Get an invoice
    * Get all invoices
    * Update an invoice
* Lead
    * Create a lead
    * Create a new record, or update the current one if it already exists (upsert)
    * Delete a lead
    * Get a lead
    * Get all leads
    * Get lead fields
    * Update a lead
* Product
    * Create a product
    * Create a new record, or update the current one if it already exists (upsert)
    * Delete a product
    * Get a product
    * Get all products
    * Update a product
* Purchase Order
    * Create a purchase order
    * Create a new record, or update the current one if it already exists (upsert)
    * Delete a purchase order
    * Get a purchase order
    * Get all purchase orders
    * Update a purchase order
* Quote
    * Create a quote
    * Create a new record, or update the current one if it already exists (upsert)
    * Delete a quote
    * Get a quote
    * Get all quotes
    * Update a quote
* Sales Order
    * Create a sales order
    * Create a new record, or update the current one if it already exists (upsert)
    * Delete a sales order
    * Get a sales order
    * Get all sales orders
    * Update a sales order
* Vendor
    * Create a vendor
    * Create a new record, or update the current one if it already exists (upsert)
    * Delete a vendor
    * Get a vendor
    * Get all vendors
    * Update a vendor

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.