# Notion node

Use the Notion node to automate work in Notion, and integrate Notion with other applications. n8n has built-in support for a wide range of Notion features, including getting and searching databases, creating pages, and getting users.

On this page, you'll find a list of operations the Notion node supports and links to more resources.

> **Credentials**
>
> Refer to [Notion credentials](/integrations/builtin/credentials/notion.md) for guidance on setting up authentication.

> **This node can be used as an AI tool**
>
> This node can be used to enhance the capabilities of an AI agent. When used in this way, many parameters can be set automatically, or with information directed by AI - find out more in the [AI tool parameters documentation](/advanced-ai/examples/using-the-fromai-function.md).

## Operations

* Block
	* Append After
	* Get Child Blocks
* Database
	* Get
	* Get Many
	* Search
* Database Page
	* Create
	* Get
	* Get Many
	* Update
* Page
	* Archive
	* Create
	* Search
* User
	* Get
	* Get Many

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Related resources

n8n provides an app node for Notion. You can find the trigger node docs [here](/integrations/builtin/trigger-nodes/n8n-nodes-base.notiontrigger.md).

Refer to [Notion's documentation](https://developers.notion.com/) for details about their API.

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.

## Common issues

For common errors or issues and suggested resolution steps, refer to [Common issues](/integrations/builtin/app-nodes/n8n-nodes-base.notion/common-issues.md).