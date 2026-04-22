# npm node documentation

> Learn how to use the npm node in n8n. Follow technical documentation to integrate npm node into your workflows.

# npm node

Use the npm node to automate work in npm, and integrate npm with other applications.

On this page, you'll find a list of operations the npm node supports and links to more resources.

> **Credentials**
>
> Refer to [npm credentials](/integrations/builtin/credentials/npm.md) for guidance on setting up authentication.

## Operations

* Package
	* Get Package Metadata
	* Get Package Versions
	* Search for Packages
* Distribution Tag
	* Get All Tags
	* Update a Tag

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for npm at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.npm/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.npm/)

## Related resources

Refer to [npm's documentation](https://docs.npmjs.com/) for more information about the service.

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io//) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.