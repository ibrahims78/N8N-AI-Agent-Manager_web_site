# Gmail node

Use the Gmail node to automate work in Gmail, and integrate Gmail with other applications. n8n has built-in support for a wide range of Gmail features, including creating, updating, deleting, and getting drafts, messages, labels, thread.  

On this page, you'll find a list of operations the Gmail node supports and links to more resources.

> **Credentials**
>
> Refer to [Google credentials](/integrations/builtin/credentials/google/index.md) for guidance on setting up authentication.

> **This node can be used as an AI tool**
>
> This node can be used to enhance the capabilities of an AI agent. When used in this way, many parameters can be set automatically, or with information directed by AI - find out more in the [AI tool parameters documentation](/advanced-ai/examples/using-the-fromai-function.md).

## Operations

* **Draft**
	* [**Create**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/draft-operations.md#create-a-draft) a draft
	* [**Delete**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/draft-operations.md#delete-a-draft) a draft
	* [**Get**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/draft-operations.md#get-a-draft) a draft
	* [**Get Many**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/draft-operations.md#get-many-drafts) drafts
* **Label**
	* [**Create**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/label-operations.md#create-a-label) a label
	* [**Delete**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/label-operations.md#delete-a-label) a label
	* [**Get**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/label-operations.md#get-a-label) a label
	* [**Get Many**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/label-operations.md#get-many-labels) labels
* **Message**
	* [**Add Label**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/message-operations.md#add-label-to-a-message) to a message
	* [**Delete**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/message-operations.md#delete-a-message) a message
	* [**Get**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/message-operations.md#get-a-message) a message
	* [**Get Many**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/message-operations.md#get-many-messages) messages
	* [**Mark as Read**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/message-operations.md#mark-as-read)
	* [**Mark as Unread**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/message-operations.md#mark-as-unread)
	* [**Remove Label**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/message-operations.md#remove-label-from-a-message) from a message
	* [**Reply**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/message-operations.md#reply-to-a-message) to a message
	* [**Send**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/message-operations.md#send-a-message) a message
* **Thread**
	* [**Add Label**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/thread-operations.md#add-label-to-a-thread) to a thread
	* [**Delete**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/thread-operations.md#delete-a-thread) a thread
	* [**Get**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/thread-operations.md#get-a-thread) a thread
	* [**Get Many**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/thread-operations.md#get-many-threads) threads
	* [**Remove Label**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/thread-operations.md#remove-label-from-a-thread) from thread
	* [**Reply**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/thread-operations.md#reply-to-a-message) to a message
	* [**Trash**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/thread-operations.md#trash-a-thread) a thread
	* [**Untrash**](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/thread-operations.md#untrash-a-thread) a thread

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Related resources

Refer to Google's [Gmail API documentation](https://developers.google.com/gmail/api) for detailed information about the API that this node integrates with.

n8n provides a trigger node for Gmail. You can find the trigger node docs [here](/integrations/builtin/trigger-nodes/n8n-nodes-base.gmailtrigger/index.md).

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.

## Common issues

For common errors or issues and suggested resolution steps, refer to [Common Issues](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/common-issues.md).

# Gmail node Draft Operations

Use the Draft operations to create, delete, or get a draft or list drafts in Gmail. Refer to the [Gmail node](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/index.md) for more information on the Gmail node itself.

## Create a draft

Use this operation to create a new draft.

Enter these parameters:

* Select the **Credential to connect with** or create a new one.
* **Resource**: Select **Draft**.
* **Operation**: Select **Create**.
* **Subject**: Enter the subject line.
* Select the **Email Type**. Choose from **Text** or **HTML**.
* **Message**: Enter the email message body.

### Create draft options

Use these options to further refine the node's behavior:

* **Attachments**: Select **Add Attachment** to add an attachment. Enter the **Attachment Field Name (in Input)** to identify which field from the input node contains the attachment.
    * For multiple properties, enter a comma-separated list.
* **BCC**: Enter one or more email addresses for blind copy recipients. Separate multiple email addresses with a comma, for example `jay@gatsby.com, jon@smith.com`.
* **CC**: Enter one or more email addresses for carbon copy recipients. Separate multiple email addresses with a comma, for example `jay@gatsby.com, jon@smith.com`.
* **From Alias Name or ID**: Select an alias to send the draft from. This field populates based on the credential you selected in the parameters.
* **Send Replies To**: Enter an email address to set as the reply to address.
* **Thread ID**: If you want this draft attached to a thread, enter the ID for that thread.
* **To Email**: Enter one or more email addresses for recipients. Separate multiple email addresses with a comma, for example `jay@gatsby.com, jon@smith.com`.

Refer to the [Gmail API Method: users.drafts.create](https://developers.google.com/gmail/api/reference/rest/v1/users.drafts/create) documentation for more information.

## Delete a draft

Use this operation to delete a draft.

Enter these parameters:

* Select the **Credential to connect with** or create a new one.
* **Resource**: Select **Draft**.
* **Operation**: Select **Delete**.
* **Draft ID**: Enter the ID of the draft you wish to delete.

Refer to the [Gmail API Method: users.drafts.delete](https://developers.google.com/gmail/api/reference/rest/v1/users.drafts/delete) documentation for more information.

## Get a draft

Use this operation to get a single draft.

Enter these parameters:

* Select the **Credential to connect with** or create a new one.
* **Resource**: Select **Draft**.
* **Operation**: Select **Get**.
* **Draft ID**: Enter the ID of the draft you wish to get information about.

### Get draft options

Use these options to further refine the node's behavior:

* **Attachment Prefix**: Enter a prefix for the name of the binary property the node should write any attachments to. n8n adds an index starting with `0` to the prefix. For example, if you enter `attachment_' as the prefix, the first attachment saves to 'attachment_0'.
* **Download Attachments**: Select whether the node should download the draft's attachments (turned on) or not (turned off).

Refer to the [Gmail API Method: users.drafts.get](https://developers.google.com/gmail/api/reference/rest/v1/users.drafts/get) documentation for more information.

<!-- vale off -->
## Get Many drafts
<!-- vale on -->

Use this operation to get two or more drafts.

Enter these parameters:

* Select the **Credential to connect with** or create a new one.
* **Resource**: Select **Draft**.
* **Operation**: Select **Get Many**.
* **Return All**: Choose whether the node returns all drafts (turned on) or only up to a set limit (turned off).
* **Limit**: Enter the maximum number of drafts to return. Only used if you've turned off **Return All**.

<!-- vale off -->
### Get Many drafts options
<!-- vale on -->

Use these options to further refine the node's behavior:

* **Attachment Prefix**: Enter a prefix for the name of the binary property the node should write any attachments to. n8n adds an index starting with `0` to the prefix. For example, if you enter `attachment_' as the prefix, the first attachment saves to 'attachment_0'.
* **Download Attachments**: Select whether the node should download the draft's attachments (turned on) or not (turned off).
* **Include Spam and Trash**: Select whether the node should get drafts in the Spam and Trash folders (turned on) or not (turned off).

Refer to the [Gmail API Method: users.drafts.list](https://developers.google.com/gmail/api/reference/rest/v1/users.drafts/list) documentation for more information.

## Common issues

For common errors or issues and suggested resolution steps, refer to [Common Issues](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/common-issues.md).

# Gmail node Message Operations

Use the Message operations to send, reply to, delete, mark read or unread, add a label to, remove a label from, or get a message or get a list of messages in Gmail. Refer to the [Gmail node](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/index.md) for more information on the Gmail node itself.

--8<-- "_snippets/integrations/builtin/app-nodes/hitl-tools.md"

## Add Label to a message

Use this operation to add one or more labels to a message.

Enter these parameters:

* Select the **Credential to connect with** or create a new one.
* **Resource**: Select **Message**.
* **Operation**: Select **Add Label**.
* **Message ID**: Enter the ID of the message you want to add the label to.
* **Label Names or IDs**: Select the Label names you want to add or enter an expression to specify IDs. The dropdown populates based on the **Credential** you selected.

<!-- vale off -->
Refer to the [Gmail API Method: users.messages.modify](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/modify) documentation for more information.
<!-- vale on -->

## Delete a message

Use this operation to immediately and permanently delete a message.

> **Permanent deletion**
>
> This operation can't be undone. For recoverable deletions, use the [Thread Trash operation](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/thread-operations.md#trash-a-thread) instead.

Enter these parameters:

* Select the **Credential to connect with** or create a new one.
* **Resource**: Select **Message**.
* **Operation**: Select **Delete**.
* **Message ID**: Enter the ID of the message you want to delete.

Refer to the [Gmail API Method: users.messages.delete](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/delete) documentation for more information.

## Get a message

Use this operation to get a single message.

Enter these parameters:

* Select the **Credential to connect with** or create a new one.
* **Resource**: Select **Message**.
* **Operation**: Select **Get**.
* **Message ID**: Enter the ID of the message you wish to retrieve.
* **Simplify**: Choose whether to return a simplified version of the response (turned on) or the raw data (turned off). Default is on.
    * This is the same as setting the `format` for the API call to `metadata`, which returns email message IDs, labels, and email headers, including: From, To, CC, BCC, and Subject.

Refer to the [Gmail API Method: users.messages.get](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/get) documentation for more information.

<!-- vale off -->
## Get Many messages
<!-- vale on -->

Use this operation to get two or more messages.

Enter these parameters:

* Select the **Credential to connect with** or create a new one.
* **Resource**: Select **Message**.
* **Operation**: Select **Get Many**.
* **Return All**: Choose whether the node returns all messages (turned on) or only up to a set limit (turned off).
* **Limit**: Enter the maximum number of messages to return. Only used if you've turned off **Return All**.
* **Simplify**: Choose whether to return a simplified version of the response (turned on) or the raw data (turned off). Default is on.
    * This is the same as setting the `format` for the API call to `metadata`, which returns email message IDs, labels, and email headers, including: From, To, CC, BCC, and Subject.

<!-- vale off -->
### Get Many messages filters
<!-- vale on -->

Use these filters to further refine the node's behavior:

* **Include Spam and Trash**: Select whether the node should get messages in the Spam and Trash folders (turned on) or not (turned off).
* **Label Names or IDs**: Only return messages with the selected labels added to them. Select the Label names you want to apply or enter an expression to specify IDs. The dropdown populates based on the **Credential** you selected.
* **Search**: Enter Gmail search refine filters, like `from:`, to filter the messages returned. Refer to [Refine searches in Gmail](https://support.google.com/mail/answer/7190?hl=en) for more information.
* **Read Status**: Choose whether to receive **Unread and read emails**, **Unread emails only** (default), or **Read emails only**.
* **Received After**: Return only those emails received after the specified date and time. Use the date picker to select the day and time or enter an expression to set a date as a string in ISO format or a timestamp in milliseconds. Refer to [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) for more information on formatting the string.
* **Received Before**: Return only those emails received before the specified date and time. Use the date picker to select the day and time or enter an expression to set a date as a string in ISO format or a timestamp in milliseconds. Refer to [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) for more information on formatting the string.
* **Sender**: Enter an email or a part of a sender name to return messages from only that sender.

Refer to the [Gmail API Method: users.messages.list](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/list) documentation for more information.

## Mark as Read

Use this operation to mark a message as read.

Enter these parameters:

* Select the **Credential to connect with** or create a new one.
* **Resource**: Select **Message**.
* **Operation**: Select **Mark as Read**.
* **Message ID**: Enter the ID of the message you wish to mark as read.

<!-- vale off -->
Refer to the [Gmail API Method: users.messages.modify](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/modify) documentation for more information.
<!-- vale on -->

## Mark as Unread

Use this operation to mark a message as unread.

Enter these parameters:

* Select the **Credential to connect with** or create a new one.
* **Resource**: Select **Message**.
* **Operation**: Select **Mark as Unread**.
* **Message ID**: Enter the ID of the message you wish to mark as unread.

<!-- vale off -->
Refer to the [Gmail API Method: users.messages.modify](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/modify) documentation for more information.
<!-- vale on -->

## Remove Label from a message

Use this operation to remove one or more labels from a message.

Enter these parameters:

* Select the **Credential to connect with** or create a new one.
* **Resource**: Select **Message**.
* **Operation**: Select **Remove Label**.
* **Message ID**: Enter the ID of the message you want to remove the label from.
* **Label Names or IDs**: Select the Label names you want to remove or enter an expression to specify IDs. The dropdown populates based on the **Credential** you selected.

<!-- vale off -->
Refer to the [Gmail API Method: users.messages.modify](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/modify) documentation for more information.
<!-- vale on -->

## Reply to a message

Use this operation to send a message as a reply to an existing message.

Enter these parameters:

* Select the **Credential to connect with** or create a new one.
* **Resource**: Select **Message**.
* **Operation**: Select **Reply**.
* **Message ID**: Enter the ID of the message you want to reply to.
* Select the **Email Type**. Choose from **Text** or **HTML**.
* **Message**: Enter the email message body.

### Reply options

Use these options to further refine the node's behavior:

* **Append n8n attribution**: By default, the node appends the statement `This email was sent automatically with n8n` to the end of the email. To remove this statement, turn this option off.
* **Attachments**: Select **Add Attachment** to add an attachment. Enter the **Attachment Field Name (in Input)** to identify which field from the input node contains the attachment.
    * For multiple properties, enter a comma-separated list.
* **BCC**: Enter one or more email addresses for blind copy recipients. Separate multiple email addresses with a comma, for example `jay@gatsby.com, jon@smith.com`.
* **CC**: Enter one or more email addresses for carbon copy recipients. Separate multiple email addresses with a comma, for example `jay@gatsby.com, jon@smith.com`.
* **Sender Name**: Enter the name you want displayed in your recipients' email as the sender.
* **Reply to Sender Only**: Choose whether to reply all (turned off) or reply to the sender only (turned on).

Refer to the [Gmail API Method: users.messages.send](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/send) documentation for more information.

## Send a message

Use this operation to send a message.

Enter these parameters:

* Select the **Credential to connect with** or create a new one.
* **Resource**: Select **Message**.
* **Operation**: Select **Send**.
* **To**: Enter the email address you want the email sent to.
* **Subject**: Enter the subject line.
* Select the **Email Type**. Choose from **Text** or **HTML**.
* **Message**: Enter the email message body.

### Send options

Use these options to further refine the node's behavior:

* **Append n8n attribution**: By default, the node appends the statement `This email was sent automatically with n8n` to the end of the email. To remove this statement, turn this option off.
* **Attachments**: Select **Add Attachment** to add an attachment. Enter the **Attachment Field Name (in Input)** to identify which field from the input node contains the attachment.
    * For multiple properties, enter a comma-separated list.
* **BCC**: Enter one or more email addresses for blind copy recipients. Separate multiple email addresses with a comma, for example `jay@gatsby.com, jon@smith.com`.
* **CC**: Enter one or more email addresses for carbon copy recipients. Separate multiple email addresses with a comma, for example `jay@gatsby.com, jon@smith.com`.
* **Sender Name**: Enter the name you want displayed in your recipients' email as the sender.
* **Send Replies To**: Enter an email address to set as the reply to address.
* **Reply to Sender Only**: Choose whether to reply all (turned off) or reply to the sender only (turned on).

Refer to the [Gmail API Method: users.messages.send](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/send) documentation for more information.

## Send a message and wait for approval

Use this operation to send a message and wait for approval from the recipient before continuing the workflow execution.

> **Use Wait for complex approvals**
>
> The **Send and Wait for Approval** operation is well-suited for simple approval processes. For more complex approvals, consider using the [Wait node](/integrations/builtin/core-nodes/n8n-nodes-base.wait.md).

Enter these parameters:

* Select the **Credential to connect with** or create a new one.
* **Resource**: Select **Message**.
* **Operation**: Select **Send and Wait for Approval**.
* **To**: Enter the email address you want the email sent to.
* **Subject**: Enter the subject line.
* **Message**: Enter the email message body.

### Send and wait for approval options

Use these options to further refine the node's behavior:

* **Type of Approval**: Choose **Approve Only** (default) to include only an approval button or **Approve and Disapprove** to also include a disapproval option.
* **Approve Button Label**: The label to use for the approval button (**Approve** by default).
* **Approve Button Style**: Whether to style the approval button as a **Primary** (default) or **Secondary** button.
* **Disapprove Button Label**: The label to use for the disapproval button (**Decline** by default). Only visible when you set **Type of Approval** to **Approve and Disapprove**.
* **Disapprove Button Style**: Whether to style the disapproval button as a **Primary** or **Secondary** (default) button. Only visible when you set **Type of Approval** to **Approve and Disapprove**.

Refer to the [Gmail API Method: users.messages.send](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/send) documentation for more information.

## Common issues

For common errors or issues and suggested resolution steps, refer to [Common Issues](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/common-issues.md).

---

# Gmail node Thread Operations

Use the Thread operations to delete, reply to, trash, untrash, add/remove labels, get one, or list threads. Refer to the [Gmail node](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/index.md) for more information on the Gmail node itself.

## Add Label to a thread

Use this operation to create a new draft.

Enter these parameters:

* Select the **Credential to connect with** or create a new one.
* **Resource**: Select **Thread**.
* **Operation**: Select **Add Label**.
* **Thread ID**: Enter the ID of the thread you want to add the label to.
* **Label Names or IDs**: Select the Label names you want to apply or enter an expression to specify IDs. The dropdown populates based on the **Credential** you selected.

<!-- vale off -->
Refer to the [Gmail API Method: users.threads.modify](https://developers.google.com/gmail/api/reference/rest/v1/users.threads/modify) documentation for more information.
<!-- vale on -->

## Delete a thread

Use this operation to immediately and permanently delete a thread and all its messages.

> **Permanent deletion**
>
> This operation can't be undone. For recoverable deletions, use the [Trash operation](#trash-a-thread) instead.

Enter these parameters:

* Select the **Credential to connect with** or create a new one.
* **Resource**: Select **Thread**.
* **Operation**: Select **Delete**.
* **Thread ID**: Enter the ID of the thread you want to delete.

Refer to the [Gmail API Method: users.threads.delete](https://developers.google.com/gmail/api/reference/rest/v1/users.threads/delete) documentation for more information.

## Get a thread

Use this operation to get a single thread.

Enter these parameters:

* Select the **Credential to connect with** or create a new one.
* **Resource**: Select **Thread**.
* **Operation**: Select **Get**.
* **Thread ID**: Enter the ID of the thread you wish to retrieve.
* **Simplify**: Choose whether to return a simplified version of the response (turned on) or the raw data (turned off). Default is on.
    * This is the same as setting the `format` for the API call to `metadata`, which returns email message IDs, labels, and email headers, including: From, To, CC, BCC, and Subject.

### Get thread options

Use these options to further refine the node's behavior:

* **Return Only Messages**: Choose whether to return only thread messages (turned on).

Refer to the [Gmail API Method: users.threads.get](https://developers.google.com/gmail/api/reference/rest/v1/users.threads/get) documentation for more information.

<!-- vale off -->
## Get Many threads
<!-- vale on -->

Use this operation to get two or more threads.

Enter these parameters:

* Select the **Credential to connect with** or create a new one.
* **Resource**: Select **Thread**.
* **Operation**: Select **Get Many**.
* **Return All**: Choose whether the node returns all threads (turned on) or only up to a set limit (turned off).
* **Limit**: Enter the maximum number of threads to return. Only used if you've turned off **Return All**.

<!-- vale off -->
### Get Many threads filters
<!-- vale on -->

Use these filters to further refine the node's behavior:

* **Include Spam and Trash**: Select whether the node should get threads in the Spam and Trash folders (turned on) or not (turned off).
* **Label Names or IDs**: Only return threads with the selected labels added to them. Select the Label names you want to apply or enter an expression to specify IDs. The dropdown populates based on the **Credential** you selected.
* **Search**: Enter Gmail search refine filters, like `from:`, to filter the threads returned. Refer to [Refine searches in Gmail](https://support.google.com/mail/answer/7190?hl=en) for more information.
* **Read Status**: Choose whether to receive **Unread and read emails**, **Unread emails only** (default), or **Read emails only**.
* **Received After**: Return only those emails received after the specified date and time. Use the date picker to select the day and time or enter an expression to set a date as a string in ISO format or a timestamp in milliseconds. Refer to [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) for more information on formatting the string.
* **Received Before**: Return only those emails received before the specified date and time. Use the date picker to select the day and time or enter an expression to set a date as a string in ISO format or a timestamp in milliseconds. Refer to [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) for more information on formatting the string.

Refer to the [Gmail API Method: users.threads.list](https://developers.google.com/gmail/api/reference/rest/v1/users.threads/list) documentation for more information.

## Remove label from a thread

Use this operation to remove a label from a thread.

Enter these parameters:

* Select the **Credential to connect with** or create a new one.
* **Resource**: Select **Thread**.
* **Operation**: Select **Remove Label**.
* **Thread ID**: Enter the ID of the thread you want to remove the label from.
* **Label Names or IDs**: Select the Label names you want to remove or enter an expression to specify their IDs. The dropdown populates based on the **Credential** you selected.

<!-- vale off -->
Refer to the [Gmail API Method: users.threads.modify](https://developers.google.com/gmail/api/reference/rest/v1/users.threads/modify) documentation for more information.
<!-- vale on -->

## Reply to a message

Use this operation to reply to a message.

Enter these parameters:

* Select the **Credential to connect with** or create a new one.
* **Resource**: Select **Thread**.
* **Operation**: Select **Reply**.
* **Thread ID**: Enter the ID of the thread you want to reply to.
* **Message Snippet or ID**: Select the Message you want to reply to or enter an expression to specify its ID. The dropdown populates based on the **Credential** you selected.
* Select the **Email Type**. Choose from **Text** or **HTML**.
* **Message**: Enter the email message body.

### Reply options

Use these options to further refine the node's behavior:

* **Attachments**: Select **Add Attachment** to add an attachment. Enter the **Attachment Field Name (in Input)** to identify which field from the input node contains the attachment.
    * For multiple properties, enter a comma-separated list.
* **BCC**: Enter one or more email addresses for blind copy recipients. Separate multiple email addresses with a comma, for example `jay@gatsby.com, jon@smith.com`.
* **CC**: Enter one or more email addresses for carbon copy recipients. Separate multiple email addresses with a comma, for example `jay@gatsby.com, jon@smith.com`.
* **Sender Name**: Enter the name you want displayed in your recipients' email as the sender.
* **Reply to Sender Only**: Choose whether to reply all (turned off) or reply to the sender only (turned on).

Refer to the [Gmail API Method: users.messages.send](https://developers.google.com/gmail/api/reference/rest/v1/users.messages/send) documentation for more information.

## Trash a thread

Use this operation to move a thread and all its messages to the trash.

Enter these parameters:

* Select the **Credential to connect with** or create a new one.
* **Resource**: Select **Thread**.
* **Operation**: Select **Trash**.
* **Thread ID**: Enter the ID of the thread you want to move to the trash.

Refer to the [Gmail API Method: users.threads.trash](https://developers.google.com/gmail/api/reference/rest/v1/users.threads/trash) documentation for more information.

## Untrash a thread

Use this operation to recover a thread and all its messages from the trash.

Enter these parameters:

* Select the **Credential to connect with** or create a new one.
* **Resource**: Select **Thread**.
* **Operation**: Select **Untrash**.
* **Thread ID**: Enter the ID of the thread you want to move to the trash.

Refer to the [Gmail API Method: users.threads.untrash](https://developers.google.com/gmail/api/reference/rest/v1/users.threads/untrash) documentation for more information.

## Common issues

For common errors or issues and suggested resolution steps, refer to [Common Issues](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/common-issues.md).