# Google Business Profile node

Use the Google Business Profile node to automate work in Google Business Profile and integrate Google Business Profile with other applications. n8n has built-in support for a wide range of Google Business Profile features, which includes creating, updating, and deleting posts and reviews.

On this page, you'll find a list of operations the Google Business Profile node supports, and links to more resources.

> **Credentials**
>
> You can find authentication information for this node [here](/integrations/builtin/credentials/google/index.md).

## Operations

* Post
	* Create
	* Delete
	* Get
	* Get Many
	* Update
* Review
	* Delete Reply
	* Get
	* Get Many
	* Reply

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Related resources

n8n provides a trigger node for Google Business Profile. You can find the trigger node docs [here](/integrations/builtin/trigger-nodes/n8n-nodes-base.googlebusinessprofiletrigger.md).

Refer to [Google Business Profile's documentation](https://developers.google.com/my-business/reference/rest) for more information about the service.

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.