# LoneScale node documentation

> Learn how to use the LoneScale node in n8n. Follow technical documentation to integrate LoneScale node into your workflows.

# LoneScale node

Use the LoneScale node to automate work in LoneScale and integrate LoneScale with other applications. n8n has built-in support for managing Lists and Items in LoneScale. 

On this page, you'll find a list of operations the LoneScale node supports, and links to more resources.

> **Credentials**
>
> You can find authentication information for this node [here](/integrations/builtin/credentials/lonescale.md).

## Operations

* List
	* Create
* Item
	* Create

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for lonescale at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.lonescale/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.lonescale/)

## Related resources

Refer to [LoneScales documentation](https://help-center.lonescale.com/en/articles/6454360-lonescale-public-api) for more information about the service.

n8n provides a trigger node for LoneScale. You can find the trigger node docs [here](/integrations/builtin/trigger-nodes/n8n-nodes-base.lonescaletrigger.md).

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io//) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.