# Stripe node

Use the Stripe node to automate work in Stripe, and integrate Stripe with other applications. n8n has built-in support for a wide range of Stripe features, including getting balance, creating charge and meter events, and deleting customers. 

On this page, you'll find a list of operations the Stripe node supports and links to more resources.

> **Credentials**
>
> Refer to [Stripe credentials](/integrations/builtin/credentials/stripe.md) for guidance on setting up authentication.

## Operations

* Balance
    * Get a balance
* Charge
    * Create a charge
    * Get a charge
    * Get all charges
    * Update a charge
* Coupon
    * Create a coupon
    * Get all coupons
* Customer
    * Create a customer
    * Delete a customer
    * Get a customer
    * Get all customers
    * Update a customer
* Customer Card
    * Add a customer card
    * Get a customer card
    * Remove a customer card
* Meter Event
    * Create a meter event
* Source
    * Create a source
    * Delete a source
    * Get a source
* Token
    * Create a token

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.