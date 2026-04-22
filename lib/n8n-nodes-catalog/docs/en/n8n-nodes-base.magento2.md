# Magento 2 node documentation

> Learn how to use the Magento 2 node in n8n. Follow technical documentation to integrate Magento 2 node into your workflows.

# Magento 2 node

Use the Magento 2 node to automate work in Magento 2, and integrate Magento 2 with other applications. n8n has built-in support for a wide range of Magento 2 features, including creating, updating, deleting, and getting customers, invoices, orders, and projects. 

On this page, you'll find a list of operations the Magento 2 node supports and links to more resources.

> **Credentials**
>
> Refer to [Magento 2 credentials](https://docs.n8n.io/integrations/builtin/credentials/magento2/) for guidance on setting up authentication.

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

> **🔗 Templates & examples:** browse ready-made workflows for magento-2 at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.magento2/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.magento2/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](https://docs.n8n.io/integrations/custom-operations/) for more information.