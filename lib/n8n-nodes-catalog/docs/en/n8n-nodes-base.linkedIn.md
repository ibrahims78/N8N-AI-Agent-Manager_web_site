# LinkedIn node documentation

> Learn how to use the LinkedIn node in n8n. Follow technical documentation to integrate LinkedIn node into your workflows.

# LinkedIn node

Use the LinkedIn node to automate work in LinkedIn, and integrate LinkedIn with other applications. n8n supports creating posts.

On this page, you'll find a list of operations the LinkedIn node supports and links to more resources.

> **Credentials**
>
> Refer to [LinkedIn credentials](https://docs.n8n.io/integrations/builtin/credentials/linkedin/) for guidance on setting up authentication.

> **This node can be used as an AI tool**
>
> This node can be used to enhance the capabilities of an AI agent. When used in this way, many parameters can be set automatically, or with information directed by AI - find out more in the [AI tool parameters documentation](https://docs.n8n.io/advanced-ai/examples/using-the-fromai-function/).

## Operations

* Post
    * Create

## Parameters

* **Post As**: choose whether to post as a **Person** or **Organization**.
* **Person Name or ID** and **Organization URN**: enter an identifier for the person or organization.

	/// note | Posting as organization
	If posting as an Organization enter the organization number in the URN field. For example, `03262013` not `urn:li:company:03262013`.
	///
	
* **Text**: the post contents.
* **Media Category**: use this when including images or article URLs in your post.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for linkedin at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.linkedin/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.linkedin/)

## Related resources

Refer to [LinkedIn's API documentation](https://learn.microsoft.com/en-us/linkedin/) for more information about the service.

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](https://docs.n8n.io/integrations/custom-operations/) for more information.