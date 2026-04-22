# GitHub node documentation

> Learn how to use the GitHub node in n8n. Follow technical documentation to integrate GitHub node into your workflows.

# GitHub node

Use the GitHub node to automate work in GitHub, and integrate GitHub with other applications. n8n has built-in support for a wide range of GitHub features, including creating, updating, deleting, and editing files, repositories, issues, releases, and users. 

On this page, you'll find a list of operations the GitHub node supports and links to more resources.

> **Credentials**
>
> Refer to [GitHub credentials](https://docs.n8n.io/integrations/builtin/credentials/github/) for guidance on setting up authentication.

> **This node can be used as an AI tool**
>
> This node can be used to enhance the capabilities of an AI agent. When used in this way, many parameters can be set automatically, or with information directed by AI - find out more in the [AI tool parameters documentation](https://docs.n8n.io/advanced-ai/examples/using-the-fromai-function/).

## Operations

* File
	* Create
	* Delete
	* Edit
	* Get
	* List
* Issue
	* Create
	* Create Comment
	* Edit
	* Get
	* Lock
* Organization
	* Get Repositories
* Release
	* Create
	* Delete
	* Get
	* Get Many
	* Update
* Repository
    * Get
	* Get Issues
	* Get License
	* Get Profile
	* Get Pull Requests
	* List Popular Paths
	* List Referrers
* Review
	* Create
	* Get
	* Get Many
	* Update
* User
    * Get Repositories
    * Invite
* Workflow
	* Disable
	* Dispatch
	* Enable
	* Get
	* Get Usage
	* List

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for github at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.github/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.github/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](https://docs.n8n.io/integrations/custom-operations/) for more information.