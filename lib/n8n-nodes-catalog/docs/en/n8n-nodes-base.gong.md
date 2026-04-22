# Gong node documentation

> Learn how to use the Gong node in n8n. Follow technical documentation to integrate Gong node into your workflows.

# Gong node

Use the Gong node to automate work in Gong and integrate Gong with other applications. n8n has built-in support for a wide range of Gong features, which includes getting one or more calls and users.

On this page, you'll find a list of operations the Gong node supports, and links to more resources.

> **Credentials**
>
> You can find authentication information for this node [here](https://docs.n8n.io/integrations/builtin/credentials/gong/).

## Operations

<!-- vale off -->
* Call
	* Get
	* Get Many
* User
	* Get
	* Get Many
<!-- vale on -->

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for gong at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.gong/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.gong/)

## Related resources

Refer to [Gong's documentation](https://gong.app.gong.io/settings/api/documentation) for more information about the service.

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](https://docs.n8n.io/integrations/custom-operations/) for more information.