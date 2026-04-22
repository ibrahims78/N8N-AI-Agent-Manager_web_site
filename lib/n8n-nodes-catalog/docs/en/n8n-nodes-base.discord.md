---
title: Discord node documentation
description: Learn how to use the Discord node in n8n. Follow technical documentation to integrate Discord node into your workflows.
contentType: [integration, reference]
priority: high
---

# Discord node

Use the Discord node to automate work in Discord, and integrate Discord with other applications. n8n has built-in support for a wide range of Discord features, including sending messages in a Discord channel and managing channels.

On this page, you'll find a list of operations the Discord node supports and links to more resources.

/// note | Credentials
Refer to [Discord credentials](/integrations/builtin/credentials/discord.md) for guidance on setting up authentication. 
///

## Operations
<!-- vale off -->
<!-- "Many" triggers warnings -->

- Channel
	- Create
	- Delete
	- Get
	- Get Many
	- Update
- Message
	- Delete
	- Get
	- Get Many
	- React with Emoji
	- Send
	* Send and Wait for Response
- Member
	- Get Many
	- Role Add
	- Role Remove

<!-- vale on -->

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Related resources

Refer to [Discord's documentation](https://discord.com/developers/docs/intro) for more information about the service.

## Common issues

For common errors or issues and suggested resolution steps, refer to [Common Issues](/integrations/builtin/app-nodes/n8n-nodes-base.discord/common-issues.md).

---

# Discord node common issues

Here are some common errors and issues with the [Discord node](/integrations/builtin/app-nodes/n8n-nodes-base.discord/index.md) and steps to resolve or troubleshoot them.

## Add extra fields to embeds

Discord messages can optionally include embeds, a rich preview component that can include a title, description, image, link, and more.

The Discord node supports embeds when using the **Send** operation on the **Message** resource. Select **Add Embeds** to set extra fields including Description, Author, Title, URL, and URL Image.

To add fields that aren't included by default, set **Input Method** to **Raw JSON**. From here, add a JSON object to the **Value** parameter defining the [field names](https://discord.com/developers/docs/resources/message#embed-object) and values you want to include.

For example, to include `footer` and `fields`, neither of which are available using the **Enter Fields** Input Method, you could use a JSON object like this:

```json
{
    "author": "My Name",
	"url": "https://discord.js.org",
	"fields": [
		{
			"name": "Regular field title",
			"value": "Some value here"
		}
	],
	"footer": {
		"text": "Some footer text here",
		"icon_url": "https://i.imgur.com/AfFp7pu.png"
	}
}
```

You can learn more about embeds in [Using Webhooks and Embeds | Discord](https://discord.com/safety/using-webhooks-and-embeds).

If you experience issues when working with embeds with the Discord node, you can use the [HTTP Request](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) with your existing Discord credentials to `POST` to the following URL:

```
https://discord.com/api/v10/channels/<CHANNEL_ID>/messages
```

In the body, include your embed information in the message content like this:

```json
{
	"content": "Test",
	"embeds": [
		{
			"author": "My Name",
			"url": "https://discord.js.org",
			"fields": [
				{
					"name": "Regular field title",
					"value": "Some value here"
				}
			],
			"footer": {
				"text": "Some footer text here",
				"icon_url": "https://i.imgur.com/AfFp7pu.png"
			}
		}
	]
}
```

## Mention users and channels

To mention users and channels in Discord messages, you need to format your message according to [Discord's message formatting guidelines](https://discord.com/developers/docs/reference#message-formatting).

To mention a user, you need to know the Discord user's user ID. Keep in mind that the user ID is different from the user's display name. Similarly, you need a channel ID to link to a specific channel.

You can learn how to enable developer mode and copy the user or channel IDs in [Discord's documentation on finding User/Server/Message IDs](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID).

Once you have the user or channel ID, you can format your message with the following syntax:

* **User**: `<@USER_ID>`
* **Channel**: `<#CHANNEL_ID>`
* **Role**: `<@&ROLE_ID>`