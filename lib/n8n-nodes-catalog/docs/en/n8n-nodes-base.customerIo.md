# Customer.io node documentation

> Learn how to use the Customer.io node in n8n. Follow technical documentation to integrate Customer.io node into your workflows.

# Customer.io node

Use the Customer.io node to automate work in Customer.io, and integrate Customer.io with other applications. n8n has built-in support for a wide range of Customer.io features, including creating and updating customers, tracking events, and getting campaigns.

On this page, you'll find a list of operations the Customer.io node supports and links to more resources.

> **Credentials**
>
> Refer to [Customer.io credentials](https://docs.n8n.io/integrations/builtin/credentials/customerio/) for guidance on setting up authentication.

## Operations

* Customer
    * Create/Update a customer.
    * Delete a customer.
* Event
    * Track a customer event.
    * Track an anonymous event.
* Campaign
    * Get
    * Get All
    * Get Metrics
* Segment
    * Add Customer
    * Remove Customer

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for customerio at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.customerio/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.customerio/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](https://docs.n8n.io/integrations/custom-operations/) for more information.