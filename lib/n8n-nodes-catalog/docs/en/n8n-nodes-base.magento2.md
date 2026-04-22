# Magento 2 node

Use the Magento 2 node to automate work in Magento 2, and integrate Magento 2 with other applications. n8n has built-in support for a wide range of Magento 2 features, including creating, updating, deleting, and getting customers, invoices, orders, and projects. 

On this page, you'll find a list of operations the Magento 2 node supports and links to more resources.

> **Credentials**
>
> Refer to [Magento 2 credentials](/integrations/builtin/credentials/magento2.md) for guidance on setting up authentication.

## Operations

* Customer
    * Create a new customer
    * Delete a customer
    * Get a customer
    * Get all customers
    * Update a customer
* Invoice
    * Create an invoice
* Order
    * Cancel an order
    * Get an order
    * Get all orders
    * Ship an order
* Product
    * Create a product
    * Delete a product
    * Get a product
    * Get all products
    * Update a product

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.