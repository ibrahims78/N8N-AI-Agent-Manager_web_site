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