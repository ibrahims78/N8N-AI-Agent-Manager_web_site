# Telegram node

Use the Telegram node to automate work in [Telegram](https://telegram.org/) and integrate Telegram with other applications. n8n has built-in support for a wide range of Telegram features, including getting files as well as deleting and editing messages. 

On this page, you'll find a list of operations the Telegram node supports and links to more resources.

> **Credentials**
>
> Refer to [Telegram credentials](/integrations/builtin/credentials/telegram.md) for guidance on setting up authentication.

## Operations

* [**Chat** operations](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/chat-operations.md)
    * [**Get**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/chat-operations.md#get-chat) up-to-date information about a chat.
    * [**Get Administrators**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/chat-operations.md#get-administrators): Get a list of all administrators in a chat.
    * [**Get Member**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/chat-operations.md#get-chat-member): Get the details of a chat member.
    * [**Leave**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/chat-operations.md#leave-chat) a chat.
    * [**Set Description**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/chat-operations.md#set-description) of a chat.
    * [**Set Title**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/chat-operations.md#set-title) of a chat.
* [**Callback** operations](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/callback-operations.md)
    * [**Answer Query**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/callback-operations.md#answer-query): Send answers to callback queries sent from [inline keyboards](https://core.telegram.org/bots/features#inline-keyboards).
    * [**Answer Inline Query**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/callback-operations.md#answer-inline-query): Send answers to callback queries sent from inline queries.
* [**File** operations](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/file-operations.md)
    * [**Get File**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/file-operations.md#get-file) from Telegram.
* [**Message** operations](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md)
    * [**Delete Chat Message**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#delete-chat-message).
    * [**Edit Message Text**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#edit-message-text): Edit the text of an existing message.
    * [**Pin Chat Message**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#pin-chat-message) for the chat.
    * [**Send Animation**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#send-animation) to the chat.
        * For use with GIFs or H.264/MPEG-4 AVC videos without sound up to 50 MB in size.
    * [**Send Audio**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#send-audio) file to the chat and display it in the music player.
    * [**Send Chat Action**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#send-chat-action): Tell the user that something is happening on the bot's side. The status is set for 5 seconds or less.
    * [**Send Document**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#send-document) to the chat.
    * [**Send Location**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#send-location): Send a geolocation to the chat.
    * [**Send Media Group**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#send-media-group): Send a group of photos and/or videos.
    * [**Send Message**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#send-message) to the chat.
    * [**Send Photo**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#send-photo) to the chat.
    * [**Send Sticker**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#send-sticker) to the chat.
        * For use with static .WEBP, animated .TGS, or video .WEBM stickers.
    * [**Send Video**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#send-video) to the chat.
    * [**Unpin Chat Message**](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#unpin-chat-message) from the chat.
    
    /// note | Add bot to channel
    To use most of the **Message** operations, you must add your bot to a channel so that it can send messages to that channel. Refer to [Common Issues | Add a bot to a Telegram channel](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues.md#add-a-bot-to-a-telegram-channel) for more information.
    ///

    ## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Related resources

Refer to [Telegram's API documentation](https://core.telegram.org/bots/api) for more information about the service.

n8n provides a trigger node for Telegram. Refer to the trigger node docs [here](/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/index.md) for more information.

## Common issues

For common errors or issues and suggested resolution steps, refer to [Common Issues](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues.md).

---

# Telegram node common issues

Here are some common errors and issues with the [Telegram node](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/index.md) and steps to resolve or troubleshoot them.

## Add a bot to a Telegram channel

For a bot to send a message to a channel, you must add the bot to the channel. If you haven't added the bot to the channel, you'll see an error with a description like:
`Error: Forbidden: bot is not a participant of the channel`.

To add a bot to a channel:

1. In the Telegram app, access the target channel and select the channel name.
2. Label the channel name as **public channel**.
3. Select **Administrators** > **Add Admin**.
4. Search for the bot's username and select it.
5. Select the checkmark on the top-right corner to add the bot to the channel.

## Get the Chat ID

You can only use `@channelusername` on public channels. To interact with a Telegram group, you need that group's Chat ID.

There are three ways to get that ID:

1. From the Telegram Trigger: Use the [Telegram Trigger](/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/index.md) node in your workflow to get a Chat ID. This node can trigger on different events and returns a Chat ID on successful execution.
2. From your web browser: Open Telegram in a web browser and open the group chat. The group's Chat ID is the series of digits behind the letter "g." Prefix your group Chat ID with a `-` when you enter it in n8n.
3. Invite Telegram's [@RawDataBot](https://t.me/RawDataBot) to the group: Once you add it, the bot outputs a JSON file that includes a `chat` object. The `id` for that object is the group Chat ID. Then remove the RawDataBot from your group.

## Send more than 30 messages per second

The Telegram API has a [limitation](https://core.telegram.org/bots/faq#broadcasting-to-users) of sending only 30 messages per second. Follow these steps to send more than 30 messages:

1. **Loop Over Items node**: Use the [Loop Over Items](/integrations/builtin/core-nodes/n8n-nodes-base.splitinbatches.md) node to get at most 30 chat IDs from your database.
2. **Telegram node**: Connect the Telegram node with the Loop Over Items node. Use the **Expression Editor** to select the Chat IDs from the Loop Over Items node.
3. **Code node**: Connect the [Code](/integrations/builtin/core-nodes/n8n-nodes-base.code/index.md) node with the Telegram node. Use the Code node to wait for a few seconds before fetching the next batch of chat IDs. Connect this node with the Loop Over Items node.

You can also use this [workflow](https://n8n.io/workflows/772).

## Remove the n8n attribution from sent messages

If you're using the node to [send Telegram messages](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#send-message), the message automatically gets an n8n attribution appended to the end:

> This message was sent automatically with n8n

To remove this attribution:

1. In the node's **Additional Fields** section, select **Add Field**.
2. Select **Append n8n attribution**.
3. Turn the toggle off.

Refer to [Send Message additional fields](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations.md#send-message-additional-fields) for more information.