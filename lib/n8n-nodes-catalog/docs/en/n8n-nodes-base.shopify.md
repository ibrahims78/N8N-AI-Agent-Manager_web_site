# Shopify node documentation

> Learn how to use the Shopify node in n8n. Follow technical documentation to integrate Shopify node into your workflows.

# Shopify node

Use the Shopify node to automate work in Shopify, and integrate Shopify with other applications. n8n has built-in support for a wide range of Shopify features, including creating, updating, deleting, and getting orders and products. 

On this page, you'll find a list of operations the Shopify node supports and links to more resources.

> **Credentials**
>
> Refer to [Shopify credentials](https://docs.n8n.io/integrations/builtin/credentials/shopify/) for guidance on setting up authentication.

## Operations

* Order
    * Create an order
    * Delete an order
    * Get an order
    * Get all orders
    * Update an order
* Product
    * Create a product
    * Delete a product
    * Get a product
    * Get all products
    * Update a product

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for shopify at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.shopify/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.shopify/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](https://docs.n8n.io/integrations/custom-operations/) for more information.