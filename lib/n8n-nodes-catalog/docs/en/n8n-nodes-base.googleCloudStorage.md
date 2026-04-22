# Google Cloud Storage node documentation

> Learn how to use the Google Cloud Storage node in n8n. Follow technical documentation to integrate Google Cloud Storage node into your workflows.

# Google Cloud Storage node

Use the Google Cloud Storage node to automate work in Google Cloud Storage, and integrate Google Cloud Storage with other applications. n8n has built-in support for a wide range of Google Cloud Storage features, including creating, updating, deleting, and getting buckets and objects. 

On this page, you'll find a list of operations the Google Cloud Storage node supports and links to more resources.

> **Credentials**
>
> Refer to [Google Cloud Storage credentials](https://docs.n8n.io//) for guidance on setting up authentication.

## Operations

* Bucket
	* Create
	* Delete
	* Get
	* Get Many
	* Update
* Object
	* Create
	* Delete
	* Get
	* Get Many
	* Update

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for google-cloud-storage at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlecloudstorage/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlecloudstorage/)

## Related resources

Refer to Google's [Cloud Storage API documentation](https://cloud.google.com/storage/docs/apis) for detailed information about the API that this node integrates with.

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io//) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.