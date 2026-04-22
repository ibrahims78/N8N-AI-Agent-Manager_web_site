# Medium node documentation

> Learn how to use the Medium node in n8n. Follow technical documentation to integrate Medium node into your workflows.

# Medium node

Use the Medium node to automate work in Medium, and integrate Medium with other applications. n8n has built-in support for a wide range of Medium features, including creating posts, and getting publications. 

On this page, you'll find a list of operations the Medium node supports and links to more resources.

> **Medium API no longer supported**
>
> Medium has stopped supporting the Medium API. The Medium node still appears within n8n, but you won't be able to configure new API keys to authenticate with.
> 
> Refer to [Medium credentials](https://docs.n8n.io/integrations/builtin/credentials/medium/) for guidance on setting up existing API keys.

> **This node can be used as an AI tool**
>
> This node can be used to enhance the capabilities of an AI agent. When used in this way, many parameters can be set automatically, or with information directed by AI - find out more in the [AI tool parameters documentation](https://docs.n8n.io/advanced-ai/examples/using-the-fromai-function/).

## Operations

* Post
    * Create a post
* Publication
    * Get all publications

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for medium at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.medium/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.medium/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](https://docs.n8n.io/integrations/custom-operations/) for more information.