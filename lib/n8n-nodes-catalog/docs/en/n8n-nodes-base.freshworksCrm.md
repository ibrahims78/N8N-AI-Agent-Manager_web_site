# Freshworks CRM node documentation

> Learn how to use the Freshworks CRM node in n8n. Follow technical documentation to integrate Freshworks CRM node into your workflows.

# Freshworks CRM node

Use the Freshworks CRM node to automate work in Freshworks CRM, and integrate Freshworks CRM with other applications. n8n has built-in support for a wide range of Freshworks CRM features, including creating, updating, deleting, and retrieve, accounts, appointments, contacts, deals, notes, sales activity and more. 

On this page, you'll find a list of operations the Freshworks CRM node supports and links to more resources.

> **Credentials**
>
> Refer to [Freshworks CRM credentials](https://docs.n8n.io/integrations/builtin/credentials/freshworkscrm/) for guidance on setting up authentication.

## Operations

* Account
    * Create an account
    * Delete an account
    * Retrieve an account
    * Retrieve all accounts
    * Update an account
* Appointment
    * Create an appointment
    * Delete an appointment
    * Retrieve an appointment
    * Retrieve all appointments
    * Update an appointment
* Contact
    * Create a contact
    * Delete a contact
    * Retrieve a contact
    * Retrieve all contacts
    * Update a contact
* Deal
    * Create a deal
    * Delete a deal
    * Retrieve a deal
    * Retrieve all deals
    * Update a deal
* Note
    * Create a note
    * Delete a note
    * Update a note
* Sales Activity
    * Retrieve a sales activity
    * Retrieve all sales activities
* Task
    * Create a task
    * Delete a task
    * Retrieve a task
    * Retrieve all tasks
    * Update a task

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for freshworks-crm at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.freshworkscrm/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.freshworkscrm/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](https://docs.n8n.io/integrations/custom-operations/) for more information.