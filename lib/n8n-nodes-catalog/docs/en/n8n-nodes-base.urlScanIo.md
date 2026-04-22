# urlscan.io node documentation

> Learn how to use the urlscan.io node in n8n. Follow technical documentation to integrate urlscan.io node into your workflows.

# urlscan.io node

Use the urlscan.io node to automate work in urlscan.io, and integrate urlscan.io with other applications. n8n has built-in support for a wide range of urlscan.io features, including getting and performing scans. 

On this page, you'll find a list of operations the urlscan.io node supports and links to more resources.

> **Credentials**
>
> Refer to [urlscan.io credentials](https://docs.n8n.io/integrations/builtin/credentials/urlscanio/) for guidance on setting up authentication.

> **This node can be used as an AI tool**
>
> This node can be used to enhance the capabilities of an AI agent. When used in this way, many parameters can be set automatically, or with information directed by AI - find out more in the [AI tool parameters documentation](https://docs.n8n.io/advanced-ai/examples/using-the-fromai-function/).

## Operations

* Scan
    * Get
    * Get All
    * Perform

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for urlscanio at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.urlscanio/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.urlscanio/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](https://docs.n8n.io/integrations/custom-operations/) for more information.