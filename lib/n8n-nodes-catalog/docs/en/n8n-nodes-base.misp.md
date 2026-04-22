# MISP node documentation

> Learn how to use the MISP node in n8n. Follow technical documentation to integrate MISP node into your workflows.

# MISP node

Use the MISP node to automate work in MISP, and integrate MISP with other applications. n8n has built-in support for a wide range of MISP features, including creating, updating, deleting and getting events, feeds, and organizations. 

On this page, you'll find a list of operations the MISP node supports and links to more resources.

> **Credentials**
>
> Refer to [MISP credentials](/integrations/builtin/credentials/misp.md) for guidance on setting up authentication.

## Operations

* Attribute
    * Create
    * Delete
    * Get
    * Get All
	* Search
    * Update
* Event
    * Create
    * Delete
    * Get
    * Get All
    * Publish
	* Search
    * Unpublish
    * Update
* Event Tag
    * Add
    * Remove
* Feed
    * Create
    * Disable
    * Enable
    * Get
    * Get All
    * Update
* Galaxy
    * Delete
    * Get
    * Get All
* Noticelist
    * Get
    * Get All
* Object
	* Search
* Organisation
    * Create
    * Delete
    * Get
    * Get All
    * Update
* Tag
    * Create
    * Delete
    * Get All
    * Update
* User
    * Create
    * Delete
    * Get
    * Get All
    * Update
* Warninglist
    * Get
    * Get All

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for misp at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.misp/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.misp/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io//) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.