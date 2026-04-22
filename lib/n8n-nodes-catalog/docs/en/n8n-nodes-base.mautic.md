# Mautic node documentation

> Learn how to use the Mautic node in n8n. Follow technical documentation to integrate Mautic node into your workflows.

# Mautic node

Use the Mautic node to automate work in Mautic, and integrate Mautic with other applications. n8n has built-in support for a wide range of Mautic features, including creating, updating, deleting, and getting companies, and contacts, as well as adding and removing campaign contacts. 

On this page, you'll find a list of operations the Mautic node supports and links to more resources.

> **Credentials**
>
> Refer to [Mautic credentials](https://docs.n8n.io/integrations/builtin/credentials/mautic/) for guidance on setting up authentication.

> **This node can be used as an AI tool**
>
> This node can be used to enhance the capabilities of an AI agent. When used in this way, many parameters can be set automatically, or with information directed by AI - find out more in the [AI tool parameters documentation](https://docs.n8n.io/advanced-ai/examples/using-the-fromai-function/).

## Operations

* Campaign Contact
    * Add contact to a campaign
    * Remove contact from a campaign
* Company
    * Create a new company
    * Delete a company
    * Get data of a company
    * Get data of all companies
    * Update a company
* Company Contact
    * Add contact to a company
    * Remove a contact from a company
* Contact
    * Create a new contact
    * Delete a contact
    * Edit contact's points
    * Add/remove contacts from/to the don't contact list
    * Get data of a contact
    * Get data of all contacts
    * Send email to contact
    * Update a contact
* Contact Segment
    * Add contact to a segment
    * Remove contact from a segment
* Segment Email
    * Send

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for mautic at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.mautic/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.mautic/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](https://docs.n8n.io/integrations/custom-operations/) for more information.