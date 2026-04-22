# Telegram node documentation

> Documentation for the Telegram node in n8n, a workflow automation platform. Includes details of operations and configuration, and links to examples and credentials information.

# Telegram node

Use the Telegram node to automate work in [Telegram](https://telegram.org/) and integrate Telegram with other applications. n8n has built-in support for a wide range of Telegram features, including getting files as well as deleting and editing messages. 

On this page, you'll find a list of operations the Telegram node supports and links to more resources.

> **Credentials**
>
> Refer to [Telegram credentials](https://docs.n8n.io/integrations/builtin/credentials/telegram/) for guidance on setting up authentication.

## Operations

* [**Chat** operations](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/chat-operations/)
    * [**Get**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/chat-operations/#get-chat) up-to-date information about a chat.
    * [**Get Administrators**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/chat-operations/#get-administrators): Get a list of all administrators in a chat.
    * [**Get Member**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/chat-operations/#get-chat-member): Get the details of a chat member.
    * [**Leave**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/chat-operations/#leave-chat) a chat.
    * [**Set Description**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/chat-operations/#set-description) of a chat.
    * [**Set Title**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/chat-operations/#set-title) of a chat.
* [**Callback** operations](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/callback-operations/)
    * [**Answer Query**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/callback-operations/#answer-query): Send answers to callback queries sent from [inline keyboards](https://core.telegram.org/bots/features#inline-keyboards).
    * [**Answer Inline Query**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/callback-operations/#answer-inline-query): Send answers to callback queries sent from inline queries.
* [**File** operations](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/file-operations/)
    * [**Get File**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/file-operations/#get-file) from Telegram.
* [**Message** operations](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations/)
    * [**Delete Chat Message**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations/#delete-chat-message).
    * [**Edit Message Text**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations/#edit-message-text): Edit the text of an existing message.
    * [**Pin Chat Message**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations/#pin-chat-message) for the chat.
    * [**Send Animation**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations/#send-animation) to the chat.
        * For use with GIFs or H.264/MPEG-4 AVC videos without sound up to 50 MB in size.
    * [**Send Audio**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations/#send-audio) file to the chat and display it in the music player.
    * [**Send Chat Action**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations/#send-chat-action): Tell the user that something is happening on the bot's side. The status is set for 5 seconds or less.
    * [**Send Document**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations/#send-document) to the chat.
    * [**Send Location**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations/#send-location): Send a geolocation to the chat.
    * [**Send Media Group**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations/#send-media-group): Send a group of photos and/or videos.
    * [**Send Message**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations/#send-message) to the chat.
    * [**Send Photo**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations/#send-photo) to the chat.
    * [**Send Sticker**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations/#send-sticker) to the chat.
        * For use with static .WEBP, animated .TGS, or video .WEBM stickers.
    * [**Send Video**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations/#send-video) to the chat.
    * [**Unpin Chat Message**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations/#unpin-chat-message) from the chat.
    
    > **Add bot to channel**
>
> To use most of the **Message** operations, you must add your bot to a channel so that it can send messages to that channel. Refer to [Common Issues | Add a bot to a Telegram channel](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues/#add-a-bot-to-a-telegram-channel) for more information.
>     ///
> 
>     ## Templates and examples
> 
> <!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->
> 
> **🔗 Templates & examples:** browse ready-made workflows for telegram at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/)

> 
> ## Related resources
> 
> Refer to [Telegram's API documentation](https://core.telegram.org/bots/api) for more information about the service.
> 
> n8n provides a trigger node for Telegram. Refer to the trigger node docs [here](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/) for more information.
> 
> ## Common issues
> 
> For common errors or issues and suggested resolution steps, refer to [Common Issues](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues/).
> 
> 
> ---
> 
> <!-- sibling:common-issues.md -->
> ## Common Issues
> 
> # Telegram node common issues
> 
> Here are some common errors and issues with the [Telegram node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/) and steps to resolve or troubleshoot them.
> 
> ## Add a bot to a Telegram channel
> 
> For a bot to send a message to a channel, you must add the bot to the channel. If you haven't added the bot to the channel, you'll see an error with a description like:
> `Error: Forbidden: bot is not a participant of the channel`.
> 
> To add a bot to a channel:
> 
> 1. In the Telegram app, access the target channel and select the channel name.
> 2. Label the channel name as **public channel**.
> 3. Select **Administrators** > **Add Admin**.
> 4. Search for the bot's username and select it.
> 5. Select the checkmark on the top-right corner to add the bot to the channel.
> 
> ## Get the Chat ID
> 
> You can only use `@channelusername` on public channels. To interact with a Telegram group, you need that group's Chat ID.
> 
> There are three ways to get that ID:
> 
> 1. From the Telegram Trigger: Use the [Telegram Trigger](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/) node in your workflow to get a Chat ID. This node can trigger on different events and returns a Chat ID on successful execution.
> 2. From your web browser: Open Telegram in a web browser and open the group chat. The group's Chat ID is the series of digits behind the letter "g." Prefix your group Chat ID with a `-` when you enter it in n8n.
> 3. Invite Telegram's [@RawDataBot](https://t.me/RawDataBot) to the group: Once you add it, the bot outputs a JSON file that includes a `chat` object. The `id` for that object is the group Chat ID. Then remove the RawDataBot from your group.
> 
> ## Send more than 30 messages per second
> 
> The Telegram API has a [limitation](https://core.telegram.org/bots/faq#broadcasting-to-users) of sending only 30 messages per second. Follow these steps to send more than 30 messages:
> 
> 1. **Loop Over Items node**: Use the [Loop Over Items](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.splitinbatches/) node to get at most 30 chat IDs from your database.
> 2. **Telegram node**: Connect the Telegram node with the Loop Over Items node. Use the **Expression Editor** to select the Chat IDs from the Loop Over Items node.
> 3. **Code node**: Connect the [Code](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/) node with the Telegram node. Use the Code node to wait for a few seconds before fetching the next batch of chat IDs. Connect this node with the Loop Over Items node.
> 
> You can also use this [workflow](https://n8n.io/workflows/772).
> 
> ## Remove the n8n attribution from sent messages
> 
> If you're using the node to [send Telegram messages](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations/#send-message), the message automatically gets an n8n attribution appended to the end:
> 
> > This message was sent automatically with n8n
> 
> To remove this attribution:
> 
> 1. In the node's **Additional Fields** section, select **Add Field**.
> 2. Select **Append n8n attribution**.
> 3. Turn the toggle off.
> 
> Refer to [Send Message additional fields](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/message-operations/#send-message-additional-fields) for more information.
> 
> ---
> 
> <!-- sibling:callback-operations.md -->
> ## Callback Operations
> 
> # Telegram node Callback operations
> 
> Use these operations to respond to callback queries sent from the in-line keyboard or in-line queries. Refer to [Telegram](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/) for more information on the Telegram node itself.
> 
> --8<-- "_snippets/integrations/builtin/app-nodes/ai-tools.md"
> 
> ## Answer Query
> 
> Use this operation to send answers to callback queries sent from [inline keyboards](https://core.telegram.org/bots/features#inline-keyboards) using the Bot API [answerCallbackQuery](https://core.telegram.org/bots/api#answercallbackquery) method.
> 
> Enter these parameters:
> 
> * **Credential to connect with**: Create or select an existing [Telegram credential](https://docs.n8n.io/integrations/builtin/credentials/telegram/).
> * **Resource**: Select **Callback**.
> * **Operation**: Select **Answer Query**.
> * **Query ID**: Enter the unique identifier of the query you want to answer.
>     * To feed a Query ID directly into this node, use the [Telegram Trigger](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/) node triggered on the **Callback Query**.
> * **Results**: Enter a JSON-serialized array of results you want to use as answers to the query. Refer to the Telegram [InlineQueryResults](https://core.telegram.org/bots/api#inlinequeryresult) documentation for more information on formatting your array.
> 
> Refer to the Telegram Bot API [answerCallbackQuery](https://core.telegram.org/bots/api#answercallbackquery) documentation for more information.
> 
> <!-- vale off -->
> ### Answer Query additional fields
> 
> Use the **Additional Fields** to further refine the behavior of the node. Select **Add Field** to add any of the following:
> 
> * **Cache Time**: Enter the maximum amount of time in seconds that the client may cache the result of the callback query. Telegram defaults to `0` seconds for this method.
> * **Show Alert**: Telegram can display the answer as a notification at the top of the chat screen or as an alert. Choose whether you want to keep the default notification display (turned off) or display the answer as an alert (turned on).
> * **Text**: If you want the answer to show text, enter up to 200 characters of text here.
> * **URL**: Enter a URL that will be opened by the user's client. Refer to the **url** parameter instructions at the Telegram Bot API [answerCallbackQuery](https://core.telegram.org/bots/api#answercallbackquery) documentation for more information.
> <!-- vale on -->
> 
> ## Answer Inline Query
> 
> Use this operation to send answers to callback queries sent from inline queries using the Bot API [answerInlineQuery](https://core.telegram.org/bots/api#answerinlinequery) method.
> 
> Enter these parameters:
> 
> * **Credential to connect with**: Create or select an existing [Telegram credential](https://docs.n8n.io/integrations/builtin/credentials/telegram/).
> * **Resource**: Select **Callback**.
> * **Operation**: Select **Answer Inline Query**.
> * **Query ID**: Enter the unique identifier of the query you want to answer.
>     * To feed a Query ID directly into this node, use the [Telegram Trigger](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/) node triggered on the **Inline Query**.
> * **Results**: Enter a JSON-serialized array of results you want to use as answers to the query. Refer to the Telegram [InlineQueryResults](https://core.telegram.org/bots/api#inlinequeryresult) documentation for more information on formatting your array.
> 
> Telegram allows a maximum of 50 results per query.
> 
> Refer to the Telegram Bot API [answerInlineQuery](https://core.telegram.org/bots/api#answerinlinequery) documentation for more information.
> 
> <!-- vale off -->
> ### Answer Inline Query additional fields
> 
> Use the **Additional Fields** to further refine the behavior of the node. Select **Add Field** to add any of the following:
> 
> * **Cache Time**: The maximum amount of time in seconds that the client may cache the result of the callback query. Telegram defaults to `300` seconds for this method.
> * **Show Alert**: Telegram can display the answer as a notification at the top of the chat screen or as an alert. Choose whether you want to keep the default notification display (turned off) or display the answer as an alert (turned on).
> * **Text**: If you want the answer to show text, enter up to 200 characters of text here.
> * **URL**: Enter a URL that the user's client will open.
> <!-- vale on -->
> 
> ---
> 
> <!-- sibling:chat-operations.md -->
> ## Chat Operations
> 
> # Telegram node Chat operations
> 
> Use these operations to get information about chats, members, administrators, leave chat, and set chat titles and descriptions. Refer to [Telegram](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/) for more information on the Telegram node itself.
> 
> --8<-- "_snippets/integrations/builtin/app-nodes/ai-tools.md"
> 
> ## Get Chat
> 
> Use this operation to get up to date information about a chat using the Bot API [getChat](https://core.telegram.org/bots/api#getchat) method.
> 
> Enter these parameters:
> 
> * **Credential to connect with**: Create or select an existing [Telegram credential](https://docs.n8n.io/integrations/builtin/credentials/telegram/).
> * **Resource**: Select **Chat**.
> * **Operation**: Select **Get**.
> * **Chat ID**: Enter the Chat ID or username of the target channel in the format `@channelusername`.
>     * To feed a Chat ID directly into this node, use the [Telegram Trigger](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/) node. Refer to [Common Issues | Get the Chat ID](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues/#get-the-chat-id) for more information.
> 
> Refer to the Telegram Bot API [getChat](https://core.telegram.org/bots/api#getchat) documentation for more information.
> 
> ## Get Administrators
> 
> Use this operation to get a list of all administrators in a chat using the Bot API [getChatAdministrators](https://core.telegram.org/bots/api#getchatadministrators) method.
> 
> Enter these parameters:
> 
> * **Credential to connect with**: Create or select an existing [Telegram credential](https://docs.n8n.io/integrations/builtin/credentials/telegram/).
> * **Resource**: Select **Chat**.
> * **Operation**: Select **Get Administrators**.
> * **Chat ID**: Enter the Chat ID or username of the target channel in the format `@channelusername`.
>     * To feed a Chat ID directly into this node, use the [Telegram Trigger](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/) node. Refer to [Common Issues | Get the Chat ID](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues/#get-the-chat-id) for more information.
> 
> Refer to the Telegram Bot API [getChatAdministrators](https://core.telegram.org/bots/api#getchatadministrators) documentation for more information.
> 
> ## Get Chat Member
> 
> Use this operation to get the details of a chat member using the Bot API [getChatMember](https://core.telegram.org/bots/api#getchatmember) method.
> 
> Enter these parameters:
> 
> * **Credential to connect with**: Create or select an existing [Telegram credential](https://docs.n8n.io/integrations/builtin/credentials/telegram/).
> * **Resource**: Select **Chat**.
> * **Operation**: Select **Get Member**.
> * **Chat ID**: Enter the Chat ID or username of the target channel in the format `@channelusername`.
>     * To feed a Chat ID directly into this node, use the [Telegram Trigger](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/) node. Refer to [Common Issues | Get the Chat ID](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues/#get-the-chat-id) for more information.
> * **User ID**: Enter the unique identifier of the user whose information you want to get.
> 
> Refer to the Telegram Bot API [getChatMember](https://core.telegram.org/bots/api#getchatmember) documentation for more information.
> 
> ## Leave Chat
> 
> Use this operation to leave a chat using the Bot API [leaveChat](https://core.telegram.org/bots/api#leavechat) method.
> 
> Enter these parameters:
> 
> * **Credential to connect with**: Create or select an existing [Telegram credential](https://docs.n8n.io/integrations/builtin/credentials/telegram/).
> * **Resource**: Select **Chat**.
> * **Operation**: Select **Leave**.
> * **Chat ID**: Enter the Chat ID or username of the channel you wish to leave in the format `@channelusername`.
>     * To feed a Chat ID directly into this node, use the [Telegram Trigger](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/) node. Refer to [Common Issues | Get the Chat ID](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues/#get-the-chat-id) for more information.
> 
> Refer to the Telegram Bot API [leaveChat](https://core.telegram.org/bots/api#leavechat) documentation for more information.
> 
> ## Set Description
> 
> Use this operation to set the description of a chat using the Bot API [setChatDescription](https://core.telegram.org/bots/api#setchatdescription) method.
> 
> Enter these parameters:
> 
> * **Credential to connect with**: Create or select an existing [Telegram credential](https://docs.n8n.io/integrations/builtin/credentials/telegram/).
> * **Resource**: Select **Chat**.
> * **Operation**: Select **Set Description**.
> * **Chat ID**: Enter the Chat ID or username of the channel you wish to leave in the format `@channelusername`.
>     * To feed a Chat ID directly into this node, use the [Telegram Trigger](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/) node. Refer to [Common Issues | Get the Chat ID](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues/#get-the-chat-id) for more information.
> * **Description**: Enter the new description you'd like to set the chat to use, maximum of 255 characters.
> 
> Refer to the Telegram Bot API [setChatDescription](https://core.telegram.org/bots/api#setchatdescription) documentation for more information.
> 
> ## Set Title
> 
> Use this operation to set the title of a chat using the Bot API [setChatTitle](https://core.telegram.org/bots/api#setchattitle) method.
> 
> Enter these parameters:
> 
> * **Credential to connect with**: Create or select an existing [Telegram credential](https://docs.n8n.io/integrations/builtin/credentials/telegram/).
> * **Resource**: Select **Chat**.
> * **Operation**: Select **Set Title**.
> * **Chat ID**: Enter the Chat ID or username of the channel you wish to leave in the format `@channelusername`.
>     * To feed a Chat ID directly into this node, use the [Telegram Trigger](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/) node. Refer to [Common Issues | Get the Chat ID](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues/#get-the-chat-id) for more information.
> * **Title**: Enter the new title you'd like to set the chat to use, maximum of 255 characters.
> 
> Refer to the Telegram Bot API [setChatTitle](https://core.telegram.org/bots/api#setchattitle) documentation for more information.
> 
> ---
> 
> <!-- sibling:file-operations.md -->
> ## File Operations
> 
> # Telegram node File operations
> 
> Use this operation to get a file from Telegram. Refer to [Telegram](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/) for more information on the Telegram node itself.
> 
> --8<-- "_snippets/integrations/builtin/app-nodes/ai-tools.md"
> 
> ## Get File
> 
> Use this operation to get a file from Telegram using the Bot API [getFile](https://core.telegram.org/bots/api#getfile) method.
> 
> Enter these parameters:
> 
> * **Credential to connect with**: Create or select an existing [Telegram credential](https://docs.n8n.io/integrations/builtin/credentials/telegram/).
> * **Resource**: Select **File**.
> * **Operation**: Select **Get**.
> * **File ID**: Enter the ID of the file you want to get.
> * **Download**: Choose whether you want the node to download the file (turned on) or not (turned off).
> 
> Refer to the Telegram Bot API [getFile](https://core.telegram.org/bots/api#getfile) documentation for more information.
> 
> ---
> 
> <!-- sibling:message-operations.md -->
> ## Message Operations
> 
> # Telegram node Message operations
> 
> Use these operations to send, edit, and delete messages in a chat; send files to a chat; and pin/unpin message from a chat. Refer to [Telegram](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/) for more information on the Telegram node itself. note | Add bot to channel
To use most of these operations, you must add your bot to a channel so that it can send messages to that channel. Refer to [Common Issues | Add a bot to a Telegram channel](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues/#add-a-bot-to-a-telegram-channel) for more information.
///

--8<-- "_snippets/integrations/builtin/app-nodes/ai-tools.md"

--8<-- "_snippets/integrations/builtin/app-nodes/hitl-tools.md"

## Delete Chat Message

Use this operation to delete a message from chat using the Bot API [deleteMessage](https://core.telegram.org/bots/api#deletemessage) method.

Enter these parameters:

* **Credential to connect with**: Create or select an existing [Telegram credential](https://docs.n8n.io/integrations/builtin/credentials/telegram/).
* **Resource**: Select **Message**.
* **Operation**: Select **Delete Chat Message**.
* **Chat ID**: Enter the Chat ID or username of the channel you wish to delete in the format `@channelusername`.
    * To feed a Chat ID directly into this node, use the [Telegram Trigger](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/) node. Refer to [Common Issues | Get the Chat ID](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues/#get-the-chat-id) for more information.
* **Message ID**: Enter the unique identifier of the message you want to delete.

Refer to the Telegram Bot API [deleteMessage](https://core.telegram.org/bots/api#deletemessage) documentation for more information.

## Edit Message Text

Use this operation to edit the text of an existing message using the Bot API [editMessageText](https://core.telegram.org/bots/api#editmessagetext) method.

Enter these parameters:

* **Credential to connect with**: Create or select an existing [Telegram credential](https://docs.n8n.io/integrations/builtin/credentials/telegram/).
* **Resource**: Select **Message**.
* **Operation**: Select **Edit Message Text**.
* **Chat ID**: Enter the Chat ID or username of the channel you wish to leave in the format `@channelusername`.
    * To feed a Chat ID directly into this node, use the [Telegram Trigger](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/) node. Refer to [Common Issues | Get the Chat ID](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues/#get-the-chat-id) for more information.
* **Message ID**: Enter the unique identifier of the message you want to edit.
* **Reply Markup**: Select whether to use the **Inline Keyboard** to display the InlineKeyboardMarkup **None** not to. This sets the `reply_markup` parameter. Refer to the [InlineKeyboardMarkup](https://core.telegram.org/bots/api#inlinekeyboardmarkup) documentation for more information.
* **Text**: Enter the text you want to edit the message to.

Refer to the Telegram Bot API [editMessageText](https://core.telegram.org/bots/api#editmessagetext) documentation for more information.

<!-- vale off -->
### Edit Message Text additional fields

Use the **Additional Fields** to further refine the behavior of the node. Select **Add Field** to add any of the following:

* **Disable WebPage Preview**: Select whether you want to enable link previews for links in this message (turned off) or disable link previews for links in this message (turned on). This sets the `link_preview_options` parameter for `is_disabled`. Refer to the [LinkPreviewOptions](https://core.telegram.org/bots/api#linkpreviewoptions) documentation for more information.
* **Parse Mode**: Choose whether the message should be parsed using **HTML** (default), **Markdown (Legacy)**, or **MarkdownV2**. This sets the `parse_mode` parameter.
<!-- vale on -->

## Pin Chat Message

Use this operation to pin a message for the chat using the Bot API [pinChatMessage](https://core.telegram.org/bots/api#pinchatmessage) method.

Enter these parameters:

* **Credential to connect with**: Create or select an existing [Telegram credential](https://docs.n8n.io/integrations/builtin/credentials/telegram/).
* **Resource**: Select **Message**.
* **Operation**: Select **Pin Chat Message**.
* **Chat ID**: Enter the Chat ID or username of the channel you wish to pin the message to in the format `@channelusername`.
    * To feed a Chat ID directly into this node, use the [Telegram Trigger](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/) node. Refer to [Common Issues | Get the Chat ID](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues/#get-the-chat-id) for more information.
* **Message ID**: Enter the unique identifier of the message you want to pin.

Refer to the Telegram Bot API [pinChatMessage](https://core.telegram.org/bots/api#pinchatmessage) documentation for more information.

<!-- vale off -->
### Pin Chat Message additional fields

Use the **Additional Fields** to further refine the behavior of the node. Select **Add Field** to add any of the following:

* **Disable Notifications**: By default, Telegram will notify all chat members that the message has been pinned. If you don't want these notifications to go out, turn this control on. Sets the `disable_notification` parameter to `true`.
<!-- vale on -->

## Send Animation

Use this operation to send GIFs or H.264/MPEG-4 AVC videos without sound up to 50 MB in size to the chat using the Bot API [sendAnimation](https://core.telegram.org/bots/api#sendanimation) method.

Enter these parameters:

* **Credential to connect with**: Create or select an existing [Telegram credential](https://docs.n8n.io/integrations/builtin/credentials/telegram/).
* **Resource**: Select **Message**.
* **Operation**: Select **Send Animation**.
* **Chat ID**: Enter the Chat ID or username of the channel you wish to send the animation to in the format `@channelusername`.
    * To feed a Chat ID directly into this node, use the [Telegram Trigger](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/) node. Refer to [Common Issues | Get the Chat ID](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues/#get-the-chat-id) for more information.
* **Binary File**: To send a binary file from the node itself, turn this option on. If you turn this parameter on, you must enter the **Input Binary Field** containing the file you want to send.
* **Animation**: If you aren't using the **Binary File**, enter the animation to send here. Pass a `file_id` to send a file that exists on the Telegram servers (recommended) or an HTTP URL for Telegram to get a file from the internet.
* **Reply Markup**: Use this parameter to set more interface options. Refer to [Reply Markup parameters](#reply-markup-parameters) for more information on these options and how to use them.

Refer to the Telegram Bot API [sendAnimation](https://core.telegram.org/bots/api#sendanimation) documentation for more information.

<!-- vale off -->
### Send Animation additional fields

Use the **Additional Fields** to further refine the behavior of the node using optional fields in Telegram's sendAnimation method. Select **Add Field** to add any of the following:

* **Caption**: Enter a caption text for the animation, max of 1024 characters.
* **Disable Notification**: Choose whether to send the notification silently (turned on) or with a standard notification (turned off).
* **Duration**: Enter the animation's duration in seconds.
* **Height**: Enter the height of the animation.
* **Parse Mode**: Enter the parser to use for any related text. Options include **HTML** (default), **Markdown (Legacy)**, **MarkdownV2**. Refer to Telegram's [Formatting options](https://core.telegram.org/bots/api#formatting-options) for more information on these options.
* **Reply To Message ID**: If the message is a reply, enter the ID of the message it's replying to.
* **Message Thread ID**: Enter a unique identifier for the target message thread (topic) of the forum; for forum supergroups only.
* **Thumbnail**: Add the thumbnail of the file sent. Ignore this field if thumbnail generation for the file is supported server-side. The thumbnail should meet these specs:
    * JPEG format
    * Less than 200 KB in size
    * Width and height less than 320px.
* **Width**: Enter the width of the video clip.

<!-- vale on -->

### Send Audio

Use this operation to send an audio file to the chat and display it in the music player using the Bot API [sendAudio](https://core.telegram.org/bots/api#sendaudio) method.

Enter these parameters:

* **Credential to connect with**: Create or select an existing [Telegram credential](https://docs.n8n.io/integrations/builtin/credentials/telegram/).
* **Resource**: Select **Message**.
* **Operation**: Select **Send Audio**.
* **Chat ID**: Enter the Chat ID or username of the channel you wish to send the audio to in the format `@channelusername`.
    * To feed a Chat ID directly into this node, use the [Telegram Trigger](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/) node. Refer to [Common Issues | Get the Chat ID](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues/#get-the-chat-id) for more information.
* **Binary File**: To send a binary file from the node itself, turn this option on. If you turn this parameter on, you must enter the **Input Binary Field** containing the file you want to send.
* **Audio**: If you aren't using the **Binary File**, enter the audio to send here. Pass a `file_id` to send a file that exists on the Telegram servers (recommended) or an HTTP URL for Telegram to get a file from the internet.
* **Reply Markup**: Use this parameter to set more interface options. Refer to [Reply Markup parameters](#reply-markup-parameters) for more information on these options and how to use them.

Refer to the Telegram Bot API [sendAudio](https://core.telegram.org/bots/api#sendaudio) documentation for more information.

<!-- vale off -->
### Send Audio additional fields

Use the **Additional Fields** to further refine the behavior of the node using optional fields in Telegram's sendAudio method. Select **Add Field** to add any of the following:

* **Caption**: Enter a caption text for the audio, max of 1024 characters.
* **Disable Notification**: Choose whether to send the notification silently (turned on) or with a standard notification (turned off).
* **Duration**: Enter the audio's duration in seconds.
* **Parse Mode**: Enter the parser to use for any related text. Options include **HTML** (default), **Markdown (Legacy)**, **MarkdownV2**. Refer to Telegram's [Formatting options](https://core.telegram.org/bots/api#formatting-options) for more information on these options.
* **Performer**: Enter the name of the performer.
* **Reply To Message ID**: If the message is a reply, enter the ID of the message it's replying to.
* **Message Thread ID**: Enter a unique identifier for the target message thread (topic) of the forum; for forum supergroups only.
* **Title**: Enter the audio track's name.
* **Thumbnail**: Add the thumbnail of the file sent. Ignore this field if thumbnail generation for the file is supported server-side. The thumbnail should meet these specs:
    * JPEG format
    * Less than 200 KB in size
    * Width and height less than 320px.
<!-- vale on -->

## Send Chat Action

Use this operation when you need to tell the user that something is happening on the bot's side. The status is set for 5 seconds or less using the Bot API [sendChatAction](https://core.telegram.org/bots/api#sendchataction) method.

Enter these parameters:

* **Credential to connect with**: Create or select an existing [Telegram credential](https://docs.n8n.io/integrations/builtin/credentials/telegram/).
* **Resource**: Select **Message**.
* **Operation**: Select **Send Chat Action**.
* **Chat ID**: Enter the Chat ID or username of the channel you wish to send the chat action to in the format `@channelusername`.
    * To feed a Chat ID directly into this node, use the [Telegram Trigger](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/) node. Refer to [Common Issues | Get the Chat ID](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues/#get-the-chat-id) for more information.
* **Action**: Select the action you'd like to broadcast the bot as taking. The options here include: **Find Location**, **Typing**, **Recording** audio or video, and **Uploading** file types.

Refer to Telegram's Bot API [sendChatAction](https://core.telegram.org/bots/api#sendchataction) documentation for more information.

## Send Document

Use this operation to send a document to the chat using the Bot API [sendDocument](https://core.telegram.org/bots/api#senddocument) method.

Enter these parameters:

* **Credential to connect with**: Create or select an existing [Telegram credential](https://docs.n8n.io/integrations/builtin/credentials/telegram/).
* **Resource**: Select **Message**.
* **Operation**: Select **Send Document**.
* **Chat ID**: Enter the Chat ID or username of the channel you wish to send the document to in the format `@channelusername`.
    * To feed a Chat ID directly into this node, use the [Telegram Trigger](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/) node. Refer to [Common Issues | Get the Chat ID](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues/#get-the-chat-id) for more information.
* **Binary File**: To send a binary file from the node itself, turn this option on. If you turn this parameter on, you must enter the **Input Binary Field** containing the file you want to send.
* **Document**: If you aren't using the **Binary File**, enter the document to send here. Pass a `file_id` to send a file that exists on the Telegram servers (recommended) or an HTTP URL for Telegram to get a file from the internet.
* **Reply Markup**: Use this parameter to set more interface options. Refer to [Reply Markup parameters](#reply-markup-parameters) for more information on these options and how to use them.

Refer to Telegram's Bot API [sendDocument](https://core.telegram.org/bots/api#sendchataction) documentation for more information.

<!--vale off-->
### Send Document additional fields

Use the **Additional Fields** to further refine the behavior of the node using optional fields in Telegram's sendDocument method. Select **Add Field** to add any of the following:

* **Caption**: Enter a caption text for the file, max of 1024 characters.
* **Disable Notification**: Choose whether to send the notification silently (turned on) or with a standard notification (turned off).
* **Parse Mode**: Enter the parser to use for any related text. Options include **HTML** (default), **Markdown (Legacy)**, **MarkdownV2**. Refer to [Formatting options](https://core.telegram.org/bots/api#formatting-options) for more information on these options.
* **Reply To Message ID**: If the message is a reply, enter the ID of the message it's replying to.
* **Message Thread ID**: Enter a unique identifier for the target message thread (topic) of the forum; for forum supergroups only.
* **Thumbnail**: Add the thumbnail of the file sent. Ignore this field if thumbnail generation for the file is supported server-side. The thumbnail should meet these specs:
    * JPEG format
    * Less than 200 KB in size
    * Width and height less than 320px.
<!--vale on -->

## Send Location

Use this operation to send a geolocation to the chat using the Bot API [sendLocation](https://core.telegram.org/bots/api#sendlocation) method.

Enter these parameters:

* **Credential to connect with**: Create or select an existing [Telegram credential](https://docs.n8n.io/integrations/builtin/credentials/telegram/).
* **Resource**: Select **Message**.
* **Operation**: Select **Send Location**.
* **Chat ID**: Enter the Chat ID or username of the channel you wish to send the location to in the format `@channelusername`.
    * To feed a Chat ID directly into this node, use the [Telegram Trigger](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/) node. Refer to [Common Issues | Get the Chat ID](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues/#get-the-chat-id) for more information.
* **Latitude**: Enter the latitude of the location.
* **Longitude**: Enter the longitude of the location.
* **Reply Markup**: Use this parameter to set more interface options. Refer to [Reply Markup parameters](#reply-markup-parameters) for more information on these options and how to use them.

Refer to Telegram's Bot API [sendLocation](https://core.telegram.org/bots/api#sendlocation) documentation for more information.

<!-- vale off -->
### Send Location additional fields

Use the **Additional Fields** to further refine the behavior of the node using optional fields in Telegram's sendLocation method. Select **Add Field** to add any of the following:

* **Disable Notification**: Choose whether to send the notification silently (turned on) or with a standard notification (turned off).
* **Reply To Message ID**: If the message is a reply, enter the ID of the message it's replying to.
* **Message Thread ID**: Enter a unique identifier for the target message thread (topic) of the forum; for forum supergroups only.

<!-- vale on -->

## Send Media Group

Use this operation to send a group of photos and/or videos using the Bot API [sendMediaGroup](https://core.telegram.org/bots/api#sendmediagroup) method.

Enter these parameters:

* **Credential to connect with**: Create or select an existing [Telegram credential](https://docs.n8n.io/integrations/builtin/credentials/telegram/).
* **Resource**: Select **Message**.
* **Operation**: Select **Send Media Group**.
* **Chat ID**: Enter the Chat ID or username of the channel you wish to send the media group to in the format `@channelusername`.
    * To feed a Chat ID directly into this node, use the [Telegram Trigger](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/) node. Refer to [Common Issues | Get the Chat ID](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues/#get-the-chat-id) for more information.
* **Media**: Use **Add Media** to add different media types to your media group. For each medium, select:
    * **Type**: The type of media this is. Choose from **Photo** and **Video**.
    * **Media File**: Enter the media file to send. Pass a `file_id` to send a file that exists on the Telegram servers (recommended) or an HTTP URL for Telegram to get a file from the internet.
    * **Additional Fields**: For each media file, you can choose to add these fields:
        * **Caption**: Enter a caption text for the file, max of 1024 characters.
        * **Parse Mode**: Enter the parser to use for any related text. Options include **HTML** (default), **Markdown (Legacy)**, **MarkdownV2**. Refer to [Formatting options](https://core.telegram.org/bots/api#formatting-options) for more information on these options.

Refer to Telegram's Bot API [sendMediaGroup](https://core.telegram.org/bots/api#sendmediagroup) documentation for more information.

<!-- vale off -->
### Send Media Group additional fields

Use the **Additional Fields** to further refine the behavior of the node using optional fields in Telegram's sendMediaGroup method. Select **Add Field** to add any of the following:

* **Disable Notification**: Choose whether to send the notification silently (turned on) or with a standard notification (turned off).
* **Reply To Message ID**: If the message is a reply, enter the ID of the message it's replying to.
* **Message Thread ID**: Enter a unique identifier for the target message thread (topic) of the forum; for forum supergroups only.
<!-- vale on -->

## Send Message

Use this operation to send a message to the chat using the Bot API [sendMessage](https://core.telegram.org/bots/api#sendmessage) method.

Enter these parameters:

* **Credential to connect with**: Create or select an existing [Telegram credential](https://docs.n8n.io/integrations/builtin/credentials/telegram/).
* **Resource**: Select **Message**.
* **Operation**: Select **Send Message**.
* **Chat ID**: Enter the Chat ID or username of the channel you wish to send the message to in the format `@channelusername`.
    * To feed a Chat ID directly into this node, use the [Telegram Trigger](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/) node. Refer to [Common Issues | Get the Chat ID](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues/#get-the-chat-id) for more information.
* **Text**: Enter the text to send, max 4096 characters after entities parsing.

Refer to Telegram's Bot API [sendMessage](https://core.telegram.org/bots/api#sendmessage) documentation for more information.

> **Send Message limits**
>
> Telegram limits the number of messages you can send to 30 per second. If you expect to hit this limit, refer to [Send more than 30 messages per second](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues/#send-more-than-30-messages-per-second) for a suggested workaround.

<!-- vale off -->
### Send Message additional fields

Use the **Additional Fields** to further refine the behavior of the node using optional fields in Telegram's sendMessage method. Select **Add Field** to add any of the following:

* **Append n8n Attribution**: Choose whether to include the phrase `This message was sent automatically with n8n` to the end of the message (turned on, default) or not (turned off).
* **Disable Notification**: Choose whether to send the notification silently (turned on) or with a standard notification (turned off).
* **Disable WebPage Preview**: Select whether you want to enable link previews for links in this message (turned off) or disable link previews for links in this message (turned on). This sets the `link_preview_options` parameter for `is_disabled`. Refer to the [LinkPreviewOptions](https://core.telegram.org/bots/api#linkpreviewoptions) documentation for more information.
* **Parse Mode**: Enter the parser to use for any related text. Options include **HTML** (default), **Markdown (Legacy)**, **MarkdownV2**. Refer to Telegram's [Formatting options](https://core.telegram.org/bots/api#formatting-options) for more information on these options.
* **Reply To Message ID**: If the message is a reply, enter the ID of the message it's replying to.
* **Message Thread ID**: Enter a unique identifier for the target message thread (topic) of the forum; for forum supergroups only.

<!-- vale on -->

## Send and Wait for Response

Use this operation to send a message to the chat using the Bot API [`sendMessage`](https://core.telegram.org/bots/api#sendmessage) method and pause the workflow execution until the user confirms the operation.

Enter these parameters:

* **Credential to connect with**: Create or select an existing [Telegram credential](https://docs.n8n.io/integrations/builtin/credentials/telegram/).
* **Resource**: Select **Message**.
* **Operation**: Select **Send and Wait for Response**.
* **Chat ID**: Enter the Chat ID or username of the channel you wish to send the message to in the format `@channelusername`.
    * To feed a Chat ID directly into this node, use the [Telegram Trigger](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/) node. Refer to [Common Issues | Get the Chat ID](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues/#get-the-chat-id) for more information.
* **Message**: Enter the text to send.
* **Response Type**: The approval or response type to use:
	* **Approval**: Users can approve or disapprove from within the message.
	* **Free Text**: Users can submit a response with a form.
	* **Custom Form**: Users can submit a response with a custom form.

Refer to Telegram's Bot API [`sendMessage`](https://core.telegram.org/bots/api#sendmessage) documentation for more information.

> **Send Message limits**
>
> Telegram limits the number of messages you can send to 30 per second. If you expect to hit this limit, refer to [Send more than 30 messages per second](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues/#send-more-than-30-messages-per-second) for a suggested workaround.

<!-- vale off -->
### Send and Wait for Response additional fields

The additional fields depend on which **Response Type** you choose.

#### Approval

The **Approval** response type adds these options:

* **Type of Approval**: Whether to present only an approval button or both an approval and disapproval buttons.
* **Button Label**: The label for the approval or disapproval button. The default choice is `✅ Approve` and `❌ Decline` for approval and disapproval actions respectively.
* **Limit Wait Time**: Whether the workflow will automatically resume execution after a specified time limit. This can be an interval or a specific wall time.

#### Free Text

When using the Free Text response type, the following options are available:

* **Message Button Label**: The label to use for message button. The default choice is `Respond`.
* **Response Form Title**: The title of the form where users provide their response.
* **Response Form Description**: A description for the form where users provide their response.
* **Response Form Button Label**: The label for the button on the form to submit their response. The default choice is `Submit`.
* **Limit Wait Time**: Whether the workflow will automatically resume execution after a specified time limit. This can be an interval or a specific wall time.

#### Custom Form

When using the Custom Form response type, you build a form using the fields and options you want.

You can customize each form element with the settings outlined in the [n8n Form trigger's form elements](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.formtrigger/#form-elements). To add more fields, select the **Add Form Element** button.

The following options are also available:

* **Message Button Label**: The label to use for message button. The default choice is `Respond`.
* **Response Form Title**: The title of the form where users provide their response.
* **Response Form Description**: A description for the form where users provide their response.
* **Response Form Button Label**: The label for the button on the form to submit their response. The default choice is `Submit`.
* **Limit Wait Time**: Whether the workflow will automatically resume execution after a specified time limit. This can be an interval or a specific wall time.

<!-- vale on -->

## Send Photo

Use this operation to send a photo to the chat using the Bot API [sendPhoto](https://core.telegram.org/bots/api#sendphoto) method.

Enter these parameters:

* **Credential to connect with**: Create or select an existing [Telegram credential](https://docs.n8n.io/integrations/builtin/credentials/telegram/).
* **Resource**: Select **Message**.
* **Operation**: Select **Send Photo**.
* **Chat ID**: Enter the Chat ID or username of the channel you wish to send the photo to in the format `@channelusername`.
    * To feed a Chat ID directly into this node, use the [Telegram Trigger](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/) node. Refer to [Common Issues | Get the Chat ID](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues/#get-the-chat-id) for more information.
* **Binary File**: To send a binary file from the node itself, turn this option on. If you turn this parameter on, you must enter the **Input Binary Field** containing the file you want to send.
* **Photo**: If you aren't using the **Binary File**, enter the photo to send here. Pass a `file_id` to send a file that exists on the Telegram servers (recommended) or an HTTP URL for Telegram to get a file from the internet.
* **Reply Markup**: Use this parameter to set more interface options. Refer to [Reply Markup parameters](#reply-markup-parameters) for more information on these options and how to use them.

Refer to Telegram's Bot API [sendPhoto](https://core.telegram.org/bots/api#sendphoto) documentation for more information.

<!-- vale off -->
### Send Photo additional fields

Use the **Additional Fields** to further refine the behavior of the node using optional fields in Telegram's sendPhoto method. Select **Add Field** to add any of the following:

* **Caption**: Enter a caption text for the file, max of 1024 characters.
* **Disable Notification**: Choose whether to send the notification silently (turned on) or with a standard notification (turned off).
* **Parse Mode**: Enter the parser to use for any related text. Options include **HTML** (default), **Markdown (Legacy)**, **MarkdownV2**. Refer to Telegram's [Formatting options](https://core.telegram.org/bots/api#formatting-options) for more information on these options.
* **Reply To Message ID**: If the message is a reply, enter the ID of the message it's replying to.
* **Message Thread ID**: Enter a unique identifier for the target message thread (topic) of the forum; for forum supergroups only.
<!-- vale on -->

## Send Sticker

Use this method to send static .WEBP, animated .TGS, or video .WEBM stickers using the Bot API [sendSticker](https://core.telegram.org/bots/api#sendsticker) method.

Enter these parameters:

* **Credential to connect with**: Create or select an existing [Telegram credential](https://docs.n8n.io/integrations/builtin/credentials/telegram/).
* **Resource**: Select **Message**.
* **Operation**: Select **Send Sticker**.
* **Chat ID**: Enter the Chat ID or username of the channel you wish to send the sticker to in the format `@channelusername`.
    * To feed a Chat ID directly into this node, use the [Telegram Trigger](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/) node. Refer to [Common Issues | Get the Chat ID](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues/#get-the-chat-id) for more information.
* **Binary File**: To send a binary file from the node itself, turn this option on. If you turn this parameter on, you must enter the **Input Binary Field** containing the file you want to send.
* **Sticker**: If you aren't using the **Binary File**, enter the photo to send here. Pass a `file_id` to send a file that exists on the Telegram servers (recommended) or an HTTP URL for Telegram to get a file from the internet.
* **Reply Markup**: Use this parameter to set more interface options. Refer to [Reply Markup parameters](#reply-markup-parameters) for more information on these options and how to use them.

Refer to Telegram's Bot API [sendSticker](https://core.telegram.org/bots/api#sendsticker) documentation for more information.

<!-- vale off -->
### Send Sticker additional fields

Use the **Additional Fields** to further refine the behavior of the node using optional fields in Telegram's sendSticker method. Select **Add Field** to add any of the following:

* **Disable Notification**: Choose whether to send the notification silently (turned on) or with a standard notification (turned off).
* **Reply To Message ID**: If the message is a reply, enter the ID of the message it's replying to.
* **Message Thread ID**: Enter a unique identifier for the target message thread (topic) of the forum; for forum supergroups only.
<!-- vale on -->

## Send Video

Use this operation to send a video to the chat using the Bot API [sendVideo](https://core.telegram.org/bots/api#sendvideo) method.

Enter these parameters:

* **Credential to connect with**: Create or select an existing [Telegram credential](https://docs.n8n.io/integrations/builtin/credentials/telegram/).
* **Resource**: Select **Message**.
* **Operation**: Select **Send Video**.
* **Chat ID**: Enter the Chat ID or username of the channel you wish to send the video to in the format `@channelusername`.
    * To feed a Chat ID directly into this node, use the [Telegram Trigger](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/) node. Refer to [Common Issues | Get the Chat ID](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues/#get-the-chat-id) for more information.
* **Binary File**: To send a binary file from the node itself, turn this option on. If you turn this parameter on, you must enter the **Input Binary Field** containing the file you want to send.
* **Video**: If you aren't using the **Binary File**, enter the video to send here. Pass a `file_id` to send a file that exists on the Telegram servers (recommended) or an HTTP URL for Telegram to get a file from the internet.
* **Reply Markup**: Use this parameter to set more interface options. Refer to [Reply Markup parameters](#reply-markup-parameters) for more information on these options and how to use them.

Refer to Telegram's Bot API [sendVideo](https://core.telegram.org/bots/api#sendvideo) documentation for more information.

<!-- vale off -->
### Send Video additional fields

Use the **Additional Fields** to further refine the behavior of the node using optional fields in Telegram's sendVideo method. Select **Add Field** to add any of the following:

* **Caption**: Enter a caption text for the video, max of 1024 characters.
* **Disable Notification**: Choose whether to send the notification silently (turned on) or with a standard notification (turned off).
* **Duration**: Enter the video's duration in seconds.
* **Height**: Enter the height of the video.
* **Parse Mode**: Enter the parser to use for any related text. Options include **HTML** (default), **Markdown (Legacy)**, **MarkdownV2**. Refer to Telegram's [Formatting options](https://core.telegram.org/bots/api#formatting-options) for more information on these options.
* **Reply To Message ID**: If the message is a reply, enter the ID of the message it's replying to.
* **Message Thread ID**: Enter a unique identifier for the target message thread (topic) of the forum; for forum supergroups only.
* **Thumbnail**: Add the thumbnail of the file sent. Ignore this field if thumbnail generation for the file is supported server-side. The thumbnail should meet these specs:
    * JPEG format
    * Less than 200 KB in size
    * Width and height less than 320px.
* **Width**: Enter the width of the video.

<!-- vale on -->

## Unpin Chat Message

Use this operation to unpin a message from the chat using the Bot API [unpinChatMessage](https://core.telegram.org/bots/api#unpinchatmessage) method.

Enter these parameters:

* **Credential to connect with**: Create or select an existing [Telegram credential](https://docs.n8n.io/integrations/builtin/credentials/telegram/).
* **Resource**: Select **Message**.
* **Operation**: Select **Pin Chat Message**.
* **Chat ID**: Enter the Chat ID or username of the channel you wish to unpin the message from in the format `@channelusername`.
    * To feed a Chat ID directly into this node, use the [Telegram Trigger](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.telegramtrigger/) node. Refer to [Common Issues | Get the Chat ID](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/common-issues/#get-the-chat-id) for more information.
* **Message ID**: Enter the unique identifier of the message you want to unpin.

Refer to the Telegram Bot API [unpinChatMessage](https://core.telegram.org/bots/api#unpinchatmessage) documentation for more information.

## Reply Markup parameters

For most of the **Message** **Send** actions (such as Send Animation, Send Audio), use the **Reply Markup** parameter to set more interface options:

* **Force Reply**: The Telegram client will act as if the user has selected the bot's message and tapped **Reply**, automatically displaying a reply interface to the user. Refer to [Force Reply parameters](#force-reply-parameters) for further guidance on this option.
* **Inline Keyboard**: Display an inline keyboard right next to the message. Refer to [Inline Keyboard parameters](#inline-keyboard-parameters) for further guidance on this option.
* **Reply Keyboard**: Display a custom keyboard with reply options. Refer to [Reply Keyboard parameters](#reply-keyboard-parameters) for further guidance on this option.
* **Reply Keyboard Remove**: The Telegram client will remove the current custom keyboard and display the default letter-keyboard. Refer to [Reply Keyboard parameters](#reply-keyboard-remove-parameters) for further guidance on this option.

> **Telegram Business accounts**
>
> Telegram restricts the following options in channels and for messages sent on behalf of a Telegram Business account:
> 
> * Force Reply
> * Reply Keyboard
> * Reply Keyboard Remove

### Force Reply parameters

**Force Reply** is useful if you want to create user-friendly step-by-step interfaces without having to sacrifice privacy mode. 

If you select **Reply Markup > Force Reply**, choose from these **Force Reply** parameters:

* **Force Reply**: Turn on to show the reply interface to the user, as described above.
* **Selective**: Turn this on if you want to force reply from these users only:
    * Users that are `@mentioned` in the text of the message.
    * The sender of the original message, if this Send Animation message is a reply to a message.

Refer to [ForceReply](https://core.telegram.org/bots/api#forcereply) for more information.

### Inline Keyboard parameters

If you select **Reply Markup > Inline Keyboard**, define the inline keyboard buttons you want to display using the **Add Button** option. To add more rows to your keyboard, use **Add Keyboard Row**.

Refer to [InlineKeyboardMarkup](https://core.telegram.org/bots/api#inlinekeyboardmarkup) and [InlineKeyboardButtons](https://core.telegram.org/bots/api#inlinekeyboardbutton) for more information.

### Reply Keyboard parameters

If you select **Reply Markup > Reply Keyboard**, use the **Reply Keyboard** section to define the buttons and rows in your Reply Keyboard.

Use the **Reply Keyboard Options** to further refine the keyboard's behavior:

* **Resize Keyboard**: Choose whether to request the Telegram client to resize the keyboard vertically for optimal fit (turned on) or whether to use the same height as the app's standard keyboard (turned off).
* **One Time Keyboard**: Choose whether the Telegram client should hide the keyboard as soon as a user uses it (turned on) or to keep displaying it (turned off).
* **Selective**: Turn this on if you want to show the keyboard to these users only:
    * Users that are `@mentioned` in the text of the message.
    * The sender of the original message, if this Send Animation message is a reply to a message.

Refer to [ReplyKeyboardMarkup](https://core.telegram.org/bots/api#replykeyboardmarkup) for more information.

### Reply Keyboard Remove parameters

If you select **Reply Markup > Reply Keyboard Remove**, choose from these **Reply Keyboard Remove** parameters:

* **Remove Keyboard**: Choose whether to request the Telegram client to remove the custom keyboard (turned on) or to keep it (turned off).
* **Selective**: Turn this on if you want to remove the keyboard for these users only:
    * Users that are `@mentioned` in the text of the message.
    * The sender of the original message, if this Send Animation message is a reply to a message.

Refer to [ReplyKeyboardRemove](https://core.telegram.org/bots/api#replykeyboardremove) for more information.