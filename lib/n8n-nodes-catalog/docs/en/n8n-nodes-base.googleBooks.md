# Google Books node documentation

> Learn how to use the Google Books node in n8n. Follow technical documentation to integrate Google Books node into your workflows.

# Google Books node

Use the Google Books node to automate work in Google Books, and integrate Google Books with other applications. n8n has built-in support for a wide range of Google Books features, including retrieving a specific bookshelf resource for the specified user, adding volume to a bookshelf, and getting volume.

On this page, you'll find a list of operations the Google Books node supports and links to more resources.

> **Credentials**
>
> Refer to [Google credentials](https://docs.n8n.io/integrations/builtin/credentials/google/) for guidance on setting up authentication.

## Operations

* Bookshelf
    * Retrieve a specific bookshelf resource for the specified user
    * Get all public bookshelf resource for the specified user
* Bookshelf Volume
    * Add a volume to a bookshelf
    * Clears all volumes from a bookshelf
    * Get all volumes in a specific bookshelf for the specified user
    * Moves a volume within a bookshelf
    * Removes a volume from a bookshelf
* Volume
    * Get a volume resource based on ID
    * Get all volumes filtered by query

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for google-books at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlebooks/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlebooks/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](https://docs.n8n.io/integrations/custom-operations/) for more information.