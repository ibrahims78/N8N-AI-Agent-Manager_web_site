# HighLevel node

Use the HighLevel node to automate work in HighLevel, and integrate HighLevel with other applications. n8n has built-in support for a wide range of HighLevel features, including creating, updating, deleting, and getting contacts, opportunities, and tasks, as well as booking appointments and getting free time slots in calendars. 

On this page, you'll find a list of operations the HighLevel node supports and links to more resources.

> **Credentials**
>
> Refer to [HighLevel credentials](/integrations/builtin/credentials/highlevel.md) for guidance on setting up authentication.

## Operations

* Contact
	* Create or update
	* Delete
	* Get
	* Get many
	* Update
* Opportunity
	* Create
	* Delete
	* Get
	* Get many
	* Update
* Task
	* Create
	* Delete
	* Get
	* Get many
	* Update
* Calendar
	* Book an appointment
	* Get free slots

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Related resources

Refer to [HighLevel's API documentation and support forums](https://help.gohighlevel.com/support/solutions/articles/48001060529-highlevel-api) for more information about the service.

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.