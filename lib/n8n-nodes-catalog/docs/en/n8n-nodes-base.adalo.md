# Adalo node

Use the Adalo node to automate work in Adalo, and integrate Adalo with other applications. n8n has built-in support for a wide range of Adalo features, including like creating, getting, updating and deleting databases, records, and collections.

On this page, you'll find a list of operations the Adalo node supports and links to more resources.

> **Credentials**
>
> Refer to [Adalo credentials](/integrations/builtin/credentials/adalo.md) for guidance on setting up authentication.	

## Operations

* Collection
	* Create
	* Delete
	* Get
	* Get Many
	* Update

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Related resources

Refer to [Adalo's documentation](https://help.adalo.com/) for more information on using Adalo. Their [External Collections with APIs](https://help.adalo.com/integrations/external-collections-with-apis) page gives more detail about what you can do with Adalo collections.

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.