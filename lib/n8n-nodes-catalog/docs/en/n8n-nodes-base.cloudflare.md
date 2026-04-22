# Cloudflare node

Use the Cloudflare node to automate work in Cloudflare, and integrate Cloudflare with other applications. n8n has built-in support for a wide range of Cloudflare features, including deleting, getting, and uploading zone certificates.

On this page, you'll find a list of operations the Cloudflare node supports and links to more resources.

> **Credentials**
>
> Refer to [Cloudflare  credentials](/integrations/builtin/credentials/cloudflare.md) for guidance on setting up authentication.

## Operations

* Zone Certificate
	* Delete
	* Get
	* Get Many
	* Upload

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Related resources

Refer to [Cloudflare's API documentation on zone-level authentication](https://api.cloudflare.com/#zone-level-authenticated-origin-pulls-properties) for more information on this service.

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.