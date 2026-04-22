# OpenAI node

Use the OpenAI node to automate work in OpenAI and integrate OpenAI with other applications. n8n has built-in support for a wide range of OpenAI features, including creating images and assistants, as well as chatting with models. 

On this page, you'll find a list of operations the OpenAI node supports and links to more resources.

> **Previous node versions**
>
> The OpenAI node replaces the OpenAI assistant node from version 1.29.0 on.
> n8n version 1.117.0 introduces V2 of the OpenAI node that supports the OpenAI Responses API and removes support for the [to-be-deprecated Assistants API](https://platform.openai.com/docs/assistants/migration).

> **Credentials**
>
> Refer to [OpenAI credentials](/integrations/builtin/credentials/openai.md) for guidance on setting up authentication.

## Operations

- **Text**
	- [**Generate a Chat Completion**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/text-operations.md#generate-a-chat-completion)
	- [**Generate a Model Response**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/text-operations.md#generate-a-model-response)
	- [**Classify Text for Violations**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/text-operations.md#classify-text-for-violations)
- **Image**
	- [**Analyze Image**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/image-operations.md#analyze-image)
	- [**Generate an Image**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/image-operations.md#generate-an-image)
	- [**Edit an Image**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/image-operations.md#edit-an-image)
- **Audio**
	- [**Generate Audio**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/audio-operations.md#generate-audio)
	- [**Transcribe a Recording**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/audio-operations.md#transcribe-a-recording)
	- [**Translate a Recording**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/audio-operations.md#translate-a-recording)
- **File**
	- [**Delete a File**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/file-operations.md#delete-a-file)
	- [**List Files**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/file-operations.md#list-files)
	- [**Upload a File**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/file-operations.md#upload-a-file)
- **Video**
	- [**Generate a Video**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/video-operations.md#generate-video)
- **Conversation**
	- [**Create a Conversation**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/conversation-operations.md#create-a-conversation)
	- [**Get a Conversation**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/conversation-operations.md#get-a-conversation)
	- [**Update a Conversation**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/conversation-operations.md#update-a-conversation)
	- [**Remove a Conversation**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/conversation-operations.md#remove-a-conversation)

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Related resources

Refer to [OpenAI's documentation](https://beta.openai.com/docs/introduction) for more information about the service.

Refer to [OpenAI's assistants documentation](https://platform.openai.com/docs/assistants/how-it-works/objects) for more information about how assistants work.

For help dealing with rate limits, refer to [Handling rate limits](/integrations/builtin/rate-limits.md).

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.

## Using tools with OpenAI assistants

Some operations allow you to connect tools. [Tools](/advanced-ai/examples/understand-tools.md) act like addons that your AI can use to access extra context or resources.

Select the **Tools** connector to browse the available tools and add them.

Once you add a tool connection, the OpenAI node becomes a [root node](/glossary.md#root-node-n8n), allowing it to form a [cluster node](/glossary.md#cluster-node-n8n) with the tools [sub-nodes](/glossary.md#sub-node-n8n). See [Node types](/integrations/builtin/node-types.md#cluster-nodes) for more information on cluster nodes and root nodes.

### Operations that support tool connectors

- **Text**
	- [**Generate a Chat Completion**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/text-operations.md#generate-a-chat-completion)
	- [**Generate a Model Response**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/text-operations.md#generate-a-model-response)

## Common issues

For common questions or issues and suggested solutions, refer to [Common issues](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/common-issues.md).

---

# OpenAI node common issues

Here are some common errors and issues with the [OpenAI node](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/index.md) and steps to resolve or troubleshoot them.

--8<-- "_snippets/integrations/openai-api-issues.md"
--8<-- "_snippets/integrations/referenced-node-unexecuted.md"