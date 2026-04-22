# Box node documentation

> Learn how to use the Box node in n8n. Follow technical documentation to integrate Box node into your workflows.

# Box node

Use the Box node to automate work in Box, and integrate Box with other applications. n8n has built-in support for a wide range of Box features, including creating, copying, deleting, searching, uploading, and downloading files and folders.

On this page, you'll find a list of operations the Box node supports and links to more resources.

> **Credentials**
>
> Refer to [Box credentials](/integrations/builtin/credentials/box.md) for guidance on setting up authentication.
 

## Operations

* File
    * Copy a file
    * Delete a file
    * Download a file
    * Get a file
    * Search files
    * Share a file
    * Upload a file
* Folder
    * Create a folder
    * Get a folder
    * Delete a folder
    * Search files
    * Share a folder
    * Update folder

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for box at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.box/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.box/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io//) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.