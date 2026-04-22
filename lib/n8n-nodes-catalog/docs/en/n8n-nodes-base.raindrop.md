# Raindrop node documentation

> Learn how to use the Raindrop node in n8n. Follow technical documentation to integrate Raindrop node into your workflows.

# Raindrop node

Use the Raindrop node to automate work in Raindrop, and integrate Raindrop with other applications. n8n has built-in support for a wide range of Raindrop features, including getting users, deleting tags, and creating, updating, deleting and getting collections and bookmarks. 

On this page, you'll find a list of operations the Raindrop node supports and links to more resources.

> **Credentials**
>
> Refer to [Raindrop credentials](/integrations/builtin/credentials/raindrop.md) for guidance on setting up authentication.

## Operations

* Bookmark
    * Create
    * Delete
    * Get
    * Get All
    * Update
* Collection
    * Create
    * Delete
    * Get
    * Get All
    * Update
* Tag
    * Delete
    * Get All
* User
    * Get

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for raindrop at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.raindrop/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.raindrop/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io//) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.