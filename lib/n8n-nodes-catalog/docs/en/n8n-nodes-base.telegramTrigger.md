# Telegram Trigger node documentation

> Learn how to use the Telegram Trigger node in n8n. Follow technical documentation to integrate Telegram Trigger node into your workflows.

# Telegram Trigger node

[Telegram](https://telegram.org/) is a cloud-based instant messaging and voice over IP service. Users can send messages and exchange photos, videos, stickers, audio, and files of any type. On this page, you'll find a list of events the Telegram Trigger node can respond to and links to more resources.

> **Credentials**
>
> You can find authentication information for this node [here](https://docs.n8n.io/integrations/builtin/credentials/telegram/).

> **Examples and templates**
>
> For usage examples and templates to help you get started, refer to n8n's [Telegram Trigger integrations](https://n8n.io/integrations/telegram-trigger/) page.

## Events

- **`*`**: All updates except "Chat Member", "Message Reaction", and "Message Reaction Count" (default behavior of Telegram API as they produces a lot of calls of updates).
- **Business Connection**: Trigger when the bot is connected to or disconnected from a business account, or a user edited an existing connection with the bot.
- **Business Message**: Trigger on a new message from a connected business account.
- **Callback Query**: Trigger on new incoming callback query.
- **Channel Post**: Trigger on new incoming channel post of any kind — including text, photo, sticker, and so on.
- **Chat Boost**: Trigger when a chat boost is added or changed. The bot must be an administrator in the chat to receive these updates.
- **Chat Join Request**: Trigger when a request to join the chat is sent. The bot must have the `can_invite_users` administrator right in the chat to receive these updates.
- **Chat Member**: Trigger when a chat member's status is updated. The bot must be an administrator in the chat.
- **Chosen Inline Result**: Trigger when the result of an inline query chosen by a user is sent. Please see Telegram's API documentation on [feedback collection](https://core.telegram.org/bots/inline#collecting-feedback) for details on how to enable these updates for your bot.
- **Deleted Business Messages**: Trigger when messages are deleted from a connected business account.
- **Edited Business Message**: Trigger on new version of a message from a connected business account.
- **Edited Channel Post**: Trigger on new version of a channel post that is known to the bot is edited.
- **Edited Message**: Trigger on new version of a channel post that is known to the bot is edited.
- **Inline Query**: Trigger on new incoming inline query.
- **Message**: Trigger on new incoming message of any kind — text, photo, sticker, and so on.
- **Message Reaction**: Trigger when a reaction to a message is changed by a user. The bot must be an administrator in the chat. The update isn't received for reactions set by bots.
- **Message Reaction Count**: Trigger when reactions to a message with anonymous reactions are changed. The bot must be an administrator in the chat. The updates are grouped and can be sent with delay up to a few minutes.
- **My Chat Member**: Trigger when the bot's chat member status is updated in a chat. For private chats, this update is received only when the bot is blocked or unblocked by the user.
- **Poll**: Trigger on new poll state. Bots only receive updates about stopped polls and polls which are sent by the bot.
- **Poll Answer**: Trigger when user changes their answer in a non-anonymous poll. Bots only receive new votes in polls that were sent by the bot itself.
- **Pre-Checkout Query**: Trigger on new incoming pre-checkout query. Contains full information about checkout.
- **Purchased Paid Media**: Trigger when a user purchases paid media with a non-empty payload sent by the bot in a non-channel chat.
- **Removed Chat Boost**: Trigger when a boost is removed from a chat. The bot must be an administrator in the chat to receive these updates.
- **Shipping Query**: Trigger on new incoming shipping query. Only for invoices with flexible price.

Some **events may require additional permissions**, see [Telegram's API documentation](https://core.telegram.org/bots/api#getting-updates) for more information.

## Options

- **Download Images/Files**: Whether to download attached images or files to include in the output data.
	- **Image Size**: When you enable **Download Images/Files**, this configures the size of image to download. Downloads large images by default.
- **Restrict to Chat IDs**: Only trigger for events with the listed chat IDs. You can include multiple chat IDs separated by commas.
- **Restrict to User IDs**: Only trigger for events with the listed user IDs. You can include multiple user IDs separated by commas.

## Related resources

n8n provides an app node for Telegram. You can find the node docs [here](https://docs.n8n.io/integrations/builtin/credentials/telegram/).

View [example workflows and related content](https://n8n.io/integrations/telegram-trigger/) on n8n's website.

Refer to [Telegram's API documentation](https://core.telegram.org/bots/api) for details about their API.

## Common issues

For common questions or issues and suggested solutions, refer to [Common issues](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/common-issues/).

---

<!-- sibling:common-issues.md -->
## Common Issues

# Telegram Trigger node common issues

Here are some common errors and issues with the [Telegram Trigger node](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/) and steps to resolve or troubleshoot them.

## Stuck waiting for trigger event

When testing the Telegram Trigger node with the **Execute step** or **Execute workflow** buttons, the execution may appear stuck and unable to stop listening for events. If this occurs, you may need to exit the workflow and open it again to reset the canvas.

Stuck listening events often occur due to issues with your network configuration outside of n8n. Specifically, this behavior often occurs when you run n8n behind a reverse proxy without configuring websocket proxying.

To resolve this issue, check your reverse proxy configuration (Nginx, Caddy, Apache HTTP Server, Traefik, etc.) to enable websocket support.

<!-- vale off -->
## Bad request: bad webhook: An HTTPS URL must be provided for webhook
<!-- vale on -->

This error occurs when you run n8n behind a reverse proxy and there is a problem with your instance's webhook URL.

When running n8n behind a reverse proxy, you must [configure the `WEBHOOK_URL` environment variable](https://docs.n8n.io/hosting/configuration/configuration-examples/webhook-url/) with the public URL where your n8n instance is running. For Telegram, this URL must use HTTPS.

To fix this issue, configure TLS/SSL termination in your reverse proxy. Afterward, update your `WEBHOOK_URL` environment variable to use the HTTPS address.

## Workflow only works in testing or production

Telegram only allows you to register a single webhook per app. This means that every time you switch from using the testing URL to the production URL (and vice versa), Telegram overwrites the registered webhook URL. 

You may have trouble with this if you try to test a workflow that's also active in production. The Telegram bot will only send events to one of the two webhook URLs, so the other will never receive event notifications.

To work around this, you can either disable your workflow when testing or create separate Telegram bots for testing and production.

To create a separate telegram bot for testing, repeat the process you completed to create your first bot. Reference [Telegram's bot documentation](https://core.telegram.org/bots) and the [Telegram bot API reference](https://core.telegram.org/bots/api) for more information.

To disable your workflow when testing, try the following:

> **Halts production traffic**
>
> This workaround temporarily disables your production workflow for testing. Your workflow will no longer receive production traffic while it's deactivated.

1. Go to your workflow page.
2. Toggle the **Active** switch in the top panel to disable the workflow temporarily.
3. Test your workflow using the test webhook URL.
4. When you finish testing, toggle the **Inactive** toggle to enable the workflow again. The production webhook URL should resume working.