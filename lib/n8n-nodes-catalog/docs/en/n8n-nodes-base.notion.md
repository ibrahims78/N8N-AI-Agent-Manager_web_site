# Notion node documentation

> Learn how to use the Notion node in n8n. Follow technical documentation to integrate Notion node into your workflows.

# Notion node

Use the Notion node to automate work in Notion, and integrate Notion with other applications. n8n has built-in support for a wide range of Notion features, including getting and searching databases, creating pages, and getting users.

On this page, you'll find a list of operations the Notion node supports and links to more resources.

> **Credentials**
>
> Refer to [Notion credentials](https://docs.n8n.io/integrations/builtin/credentials/notion/) for guidance on setting up authentication.

> **This node can be used as an AI tool**
>
> This node can be used to enhance the capabilities of an AI agent. When used in this way, many parameters can be set automatically, or with information directed by AI - find out more in the [AI tool parameters documentation](https://docs.n8n.io/advanced-ai/examples/using-the-fromai-function/).

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

> **🔗 Templates & examples:** browse ready-made workflows for notion at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.notion/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.notion/)

## Related resources

n8n provides an app node for Notion. You can find the trigger node docs [here](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.notiontrigger/).

Refer to [Notion's documentation](https://developers.notion.com/) for details about their API.

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](https://docs.n8n.io/integrations/custom-operations/) for more information.

## Common issues

For common errors or issues and suggested resolution steps, refer to [Common issues](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.notion/common-issues/).

---

<!-- sibling:common-issues.md -->
## Common Issues

# Notion node common issues

Here are some common errors and issues with the [Notion node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.notion/) and steps to resolve or troubleshoot them.

## Relation property not displaying

The Notion node only supports displaying the data relation property for [two-way relations](https://www.notion.com/help/relations-and-rollups). When you connect two Notion databases with a two-way relationship, you can select or filter by the relation property when working with the Notion node's **Database Page** resource.

To enable two-way relations, edit the relation property in Notion and enable the **Show on [name of related database]** option to create a reverse relation. Select a name to use for the relation in the new context. The relation is now accessible in n8n when filtering or selecting.

If you need to work with Notion databases with one-way relationship, you can use the [HTTP Request](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) with your existing Notion credentials. For example, to update a one-way relationship, you can send a `PATCH` request to the following URL:

```
https://api.notion.com/v1/pages/<page_id>
```

Enable **Send Body**, set the **Body Content Type** to **JSON**, and set **Specify Body** to **Using JSON**.  Afterward, you can enter a JSON object like the following into the **JSON** field:

```json
{
	"properties": {
		"Account": {
			"relation": [
				{
					"id": "<your_relation_ID>"
				}
			]
		}
	}
}
```

## Create toggle heading

The Notion node allows you to create headings and toggles when adding blocks to **Page**, **Database Page**, or **Block** resources. Creating toggleable headings isn't yet supported by the Notion node itself.

You can work around this be creating a regular heading and then modifying it to enable the [`is_toggleable` property](https://developers.notion.com/reference/block#headings):

1. Add a heading with Notion node.
2. Select the resource you want to add a heading to:
	* To add a new page with a heading, select the **Page** or **Database Page** resources with the **Create** operation.
	* To add a heading to an existing page, select the **Block** resource with the **Append After** operation.
3. Select **Add Block** and set the **Type Name or ID** to either **Heading 1**, **Heading 2**, or **Heading 3**.
4. Add an [HTTP Request](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) node connected to the Notion node and select the `GET` method.
5. Set the **URL** to `https://api.notion.com/v1/blocks/<block_ID>`. For example, if your added the heading to an existing page, you could use the following URL: `https://api.notion.com/v1/blocks/`. If you created a new page instead of appending a block, you may need to discover the block ID by querying the page contents first.
6. Select **Predefined Credential Type** and connect your existing Notion credentials.
7. Add an [Edit Fields (Set)](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.set/) node after the HTTP Request node.
8. Add `heading_1.is_toggleable` as a new **Boolean** field set to `true`. Swap `heading_1` for a different heading number as necessary.
9. Add a second HTTP Request node after the Edit Fields (Set) node.
10. Set the **Method** to `PATCH` and use `https://api.notion.com/v1/blocks/` as the **URL** value.
11. Select **Predefined Credential Type** and connect your existing Notion credentials.
12. Enable **Send Body** and set a parameter.
13. Set the parameter **Name** to `heading_1` (substitute `heading_1` for the heading level you are using).
14. Set the parameter **Value** to `` (substitute `heading_1` for the heading level you are using).

The above sequence will create a regular heading block. It will query the newly created header, add the `is_toggleable` property, and update the heading block.

## Handle null and empty values

You may receive a validation error when working with the Notion node if you submit fields with empty or null values. This can occur any time you populate fields from previous nodes when that data is missing.

To work around this, check for the existence of the field data before sending it to Notion or use a default value.

To check for the data before executing the Notion node, use an [If](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.if/) node to check whether the field is unset. This allows you to use the [Edit Fields (Set)](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.set/) node to conditionally remove the field when it doesn't have a valid value.

As an alternative, you can set a default value if the incoming data doesn't provide one.