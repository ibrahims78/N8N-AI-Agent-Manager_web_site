# Dropbox node documentation

> Learn how to use the Dropbox node in n8n. Follow technical documentation to integrate Dropbox node into your workflows.

# Dropbox node

Use the Dropbox node to automate work in Dropbox, and integrate Dropbox with other applications. n8n has built-in support for a wide range of Dropbox features, including creating, downloading, moving, and copying files and folders.

On this page, you'll find a list of operations the Dropbox node supports and links to more resources.

> **Credentials**
>
> Refer to [Dropbox credentials](/integrations/builtin/credentials/dropbox.md) for guidance on setting up authentication.

> **This node can be used as an AI tool**
>
> This node can be used to enhance the capabilities of an AI agent. When used in this way, many parameters can be set automatically, or with information directed by AI - find out more in the [AI tool parameters documentation](/advanced-ai/examples/using-the-fromai-function.md).

## Operations

* File
    * Copy a file
    * Delete a file
    * Download a file
    * Move a file
    * Upload a file
* Folder
    * Copy a folder
    * Create a folder
    * Delete a folder
    * Return the files and folders in a given folder
    * Move a folder
* Search
    * Query

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for dropbox at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.dropbox/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.dropbox/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io//) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.