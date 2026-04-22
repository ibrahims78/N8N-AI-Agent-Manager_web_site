# Invoice Ninja node documentation

> Learn how to use the Invoice Ninja node in n8n. Follow technical documentation to integrate Invoice Ninja node into your workflows.

# Invoice Ninja node

Use the Invoice Ninja node to automate work in Invoice Ninja, and integrate Invoice Ninja with other applications. n8n has built-in support for a wide range of Invoice Ninja features, including creating, updating, deleting, and getting clients, expense, invoice, payments and quotes. 

On this page, you'll find a list of operations the Invoice Ninja node supports and links to more resources.

> **Credentials**
>
> Refer to [Invoice Ninja credentials](/integrations/builtin/credentials/invoiceninja.md) for guidance on setting up authentication.

## Operations

* Client
    * Create a new client
    * Delete a client
    * Get data of a client
    * Get data of all clients
* Expense
    * Create a new expense
    * Delete an expense
    * Get data of an expense
    * Get data of all expenses
* Invoice
    * Create a new invoice
    * Delete a invoice
    * Email an invoice
    * Get data of a invoice
    * Get data of all invoices
* Payment
    * Create a new payment
    * Delete a payment
    * Get data of a payment
    * Get data of all payments
* Quote
    * Create a new quote
    * Delete a quote
    * Email an quote
    * Get data of a quote
    * Get data of all quotes
* Task
    * Create a new task
    * Delete a task
    * Get data of a task
    * Get data of all tasks

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for invoice-ninja at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.invoiceninja/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.invoiceninja/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io//) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.