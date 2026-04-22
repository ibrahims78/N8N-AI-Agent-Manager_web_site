# Keap node documentation

> Learn how to use the Keap node in n8n. Follow technical documentation to integrate Keap node into your workflows.

# Keap node

Use the Keap node to automate work in Keap, and integrate Keap with other applications. n8n has built-in support for a wide range of Keap features, including creating, updating, deleting, and getting companies, products, ecommerce orders, emails, and files. 

On this page, you'll find a list of operations the Keap node supports and links to more resources.

> **Credentials**
>
> Refer to [Keap credentials](/integrations/builtin/credentials/keap.md) for guidance on setting up authentication.

## Operations

* Company
    * Create a company
    * Retrieve all companies
* Contact
    * Create/update a contact
    * Delete an contact
    * Retrieve an contact
    * Retrieve all contacts
* Contact Note
    * Create a note
    * Delete a note
    * Get a notes
    * Retrieve all notes
    * Update a note
* Contact Tag
    * Add a list of tags to a contact
    * Delete a contact's tag
    * Retrieve all contact's tags
* Ecommerce Order
    * Create an ecommerce order
    * Get an ecommerce order
    * Delete an ecommerce order
    * Retrieve all ecommerce orders
* Ecommerce Product
    * Create an ecommerce product
    * Delete an ecommerce product
    * Get an ecommerce product
    * Retrieve all ecommerce product
* Email
    * Create a record of an email sent to a contact
    * Retrieve all sent emails
    * Send Email
* File
    * Delete a file
    * Retrieve all files
    * Upload a file

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for keap at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.keap/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.keap/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io//) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.