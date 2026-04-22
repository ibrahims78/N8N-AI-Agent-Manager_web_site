---
title: OpenAI node documentation
description: Learn how to use the OpenAI node in n8n. Follow technical documentation to integrate OpenAI node into your workflows.
contentType: [integration, reference]
priority: critical
search:
    boost: 3
---

# OpenAI node

Use the OpenAI node to automate work in OpenAI and integrate OpenAI with other applications. n8n has built-in support for a wide range of OpenAI features, including creating images and assistants, as well as chatting with models. 

On this page, you'll find a list of operations the OpenAI node supports and links to more resources.

/// note | Previous node versions
The OpenAI node replaces the OpenAI assistant node from version 1.29.0 on.
n8n version 1.117.0 introduces V2 of the OpenAI node that supports the OpenAI Responses API and removes support for the [to-be-deprecated Assistants API](https://platform.openai.com/docs/assistants/migration).
///

/// note | Credentials
Refer to [OpenAI credentials](/integrations/builtin/credentials/openai.md) for guidance on setting up authentication. 
///

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

# OpenAI Assistant operations

Use this operation to create, delete, list, message, or update an assistant in OpenAI. Refer to [OpenAI](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/index.md) for more information on the OpenAI node itself.

/// note | Assistant operations deprecated in OpenAI node V2
n8n version 1.117.0 introduces V2 of the OpenAI node that supports the OpenAI Responses API and removes support for the [to-be-deprecated Assistants API](https://platform.openai.com/docs/assistants/migration).
///

## Create an Assistant

Use this operation to create a new assistant.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [OpenAI credential](/integrations/builtin/credentials/openai.md).
- **Resource**: Select **Assistant**.
- **Operation**: Select **Create an Assistant**.
- **Model**: Select the model that the assistant will use. If you’re not sure which model to use, try `gpt-4o` if you need high intelligence or `gpt-4o-mini` if you need the fastest speed and lowest cost. Refer to [Models overview | OpenAI Platform](https://platform.openai.com/docs/models) for more information. 
- **Name**: Enter the name of the assistant. The maximum length is 256 characters.
- **Description**: Enter the description of the assistant. The maximum length is 512 characters.
  ```
  A virtual assistant that helps users with daily tasks, including setting reminders, answering general questions, and providing quick information.
  ```
- **Instructions**: Enter the system instructions that the assistant uses. The maximum length is 32,768 characters. Use this to specify the persona used by the model in its replies. 
  ```
  Always respond in a friendly and engaging manner. When a user asks a question, provide a concise answer first, followed by a brief explanation or additional context if necessary. If the question is open-ended, offer a suggestion or ask a clarifying question to guide the conversation. Keep the tone positive and supportive, and avoid technical jargon unless specifically requested by the user.
  ```
- **Code Interpreter**: Turn on to enable the code interpreter for the assistant, where it can write and execute code in a sandbox environment. Enable this tool for tasks that require computations, data analysis, or any logic-based processing.
- **Knowledge Retrieval**: Turn on to enable knowledge retrieval for the assistant, allowing it to access external sources or a connected knowledge base. Refer to [File Search | OpenAI Platform](https://platform.openai.com/docs/assistants/tools/file-search) for more information. 
    - **Files**: Select a file to upload for your external knowledge source. Use **Upload a File** operation to add more files. 

### Options

- **Output Randomness (Temperature)**: Adjust the randomness of the response. The range is between `0.0` (deterministic) and `1.0` (maximum randomness). We recommend altering this or **Output Randomness (Top P)** but not both. Start with a medium temperature (around 0.7) and adjust based on the outputs you observe. If the responses are too repetitive or rigid, increase the temperature. If they’re too chaotic or off-track, decrease it. Defaults to `1.0`. 
- **Output Randomness (Top P)**: Adjust the Top P setting to control the diversity of the assistant's responses. For example, `0.5` means half of all likelihood-weighted options are considered. We recommend altering this or **Output Randomness (Temperature)** but not both. Defaults to `1.0`. 
- **Fail if Assistant Already Exists**: If enabled, the operation will fail if an assistant with the same name already exists. 

Refer to [Create assistant | OpenAI](https://platform.openai.com/docs/api-reference/assistants/createAssistant) documentation for more information. 

## Delete an Assistant

Use this operation to delete an existing assistant from your account.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [OpenAI credential](/integrations/builtin/credentials/openai.md).
- **Resource**: Select **Assistant**.
- **Operation**: Select **Delete an Assistant**.
- **Assistant**: Select the assistant you want to delete **From list** or **By ID**.

Refer to [Delete assistant | OpenAI](https://platform.openai.com/docs/api-reference/assistants/deleteAssistant) documentation for more information. 

## List Assistants

Use this operation to retrieve a list of assistants in your organization.

- **Credential to connect with**: Create or select an existing [OpenAI credential](/integrations/builtin/credentials/openai.md).
- **Resource**: Select **Assistant**.
- **Operation**: Select **List Assistants**.

### Options

- **Simplify Output**: Turn on to return a simplified version of the response instead of the raw data. This option is enabled by default. 

Refer to [List assistants | OpenAI](https://platform.openai.com/docs/api-reference/assistants/listAssistants) documentation for more information. 
  
## Message an Assistant

Use this operation to send a message to an assistant and receive a response.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [OpenAI credential](/integrations/builtin/credentials/openai.md).
- **Resource**: Select **Assistant**.
- **Operation**: Select **Message an Assistant**.
- **Assistant**: Select the assistant you want to message.
- **Prompt**: Enter the text prompt or message that you want to send to the assistant.
    - **Connected Chat Trigger Node**: Automatically use the input from a previous node's `chatInput` field.
    - **Define Below**: Manually define the prompt by entering static text or using an expression to reference data from previous nodes.

### Options

- **Base URL**: Enter the base URL that the assistant should use for making API requests. This option is useful for directing the assistant to use endpoints provided by other LLM providers that offer an OpenAI-compatible API.
- **Max Retries**: Specify the number of times the assistant should retry an operation in case of failure. 
- **Timeout**: Set the maximum amount of time in milliseconds, that the assistant should wait for a response before timing out. Use this option to prevent long waits during operations.
- **Preserve Original Tools**: Turn off to remove the original tools associated with the assistant. Use this if you want to temporarily remove tools for this specific operation.

Refer to [Assistants | OpenAI](https://platform.openai.com/docs/api-reference/assistants) documentation for more information. 

## Update an Assistant

Use this operation to update the details of an existing assistant.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [OpenAI credential](/integrations/builtin/credentials/openai.md).
- **Resource**: Select **Assistant**.
- **Operation**: Select **Update an Assistant**.
- **Assistant**: Select the assistant you want to update.

### Options

- **Code Interpreter**: Turn on to enable the code interpreter for the assistant, where it can write and execute code in a sandbox environment. Enable this tool for tasks that require computations, data analysis, or any logic-based processing.
- **Description**: Enter the description of the assistant. The maximum length is 512 characters.
  ```
  A virtual assistant that helps users with daily tasks, including setting reminders, answering general questions, and providing quick information.
  ```
- **Instructions**: Enter the system instructions that the assistant uses. The maximum length is 32,768 characters. Use this to specify the persona used by the model in its replies. 
  ```
  Always respond in a friendly and engaging manner. When a user asks a question, provide a concise answer first, followed by a brief explanation or additional context if necessary. If the question is open-ended, offer a suggestion or ask a clarifying question to guide the conversation. Keep the tone positive and supportive, and avoid technical jargon unless specifically requested by the user.
  ```
- **Knowledge Retrieval**: Turn on to enable knowledge retrieval for the assistant, allowing it to access external sources or a connected knowledge base. Refer to [File Search | OpenAI Platform](https://platform.openai.com/docs/assistants/tools/file-search) for more information. 
- **Files**: Select a file to upload for your external knowledge source. Use [**Upload a File**](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/file-operations.md#upload-a-file) operation to add more files. Note that this only updates the [Code Interpreter](https://platform.openai.com/docs/assistants/tools/code-interpreter) tool, not the [File Search](https://platform.openai.com/docs/assistants/tools/file-search) tool.
- **Model**: Select the model that the assistant will use. If you’re not sure which model to use, try `gpt-4o` if you need high intelligence or `gpt-4o-mini` if you need the fastest speed and lowest cost. Refer to [Models overview | OpenAI Platform](https://platform.openai.com/docs/models) for more information. 
- **Name**: Enter the name of the assistant. The maximum length is 256 characters.
- **Remove All Custom Tools (Functions)**: Turn on to remove all custom tools (functions) from the assistant. 
- **Output Randomness (Temperature)**: Adjust the randomness of the response. The range is between `0.0` (deterministic) and `1.0` (maximum randomness). We recommend altering this or **Output Randomness (Top P)** but not both. Start with a medium temperature (around 0.7) and adjust based on the outputs you observe. If the responses are too repetitive or rigid, increase the temperature. If they’re too chaotic or off-track, decrease it. Defaults to `1.0`. 
- **Output Randomness (Top P)**: Adjust the Top P setting to control the diversity of the assistant's responses. For example, `0.5` means half of all likelihood-weighted options are considered. We recommend altering this or **Output Randomness (Temperature)** but not both. Defaults to `1.0`. 

Refer to [Modify assistant | OpenAI](https://platform.openai.com/docs/api-reference/assistants/modifyAssistant) documentation for more information.

## Common issues

For common errors or issues and suggested resolution steps, refer to [Common Issues](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/common-issues.md).

---

# OpenAI Audio operations

Use this operation to generate an audio, or transcribe or translate a recording in OpenAI. Refer to [OpenAI](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/index.md) for more information on the OpenAI node itself.

## Generate Audio

Use this operation to create audio from a text prompt. 

Enter these parameters:

- **Credential to connect with**: Create or select an existing [OpenAI credential](/integrations/builtin/credentials/openai.md).
- **Resource**: Select **Audio**.
- **Operation**: Select **Generate Audio**.
- **Model**: Select the model you want to use to generate the audio. Refer to [TTS | OpenAI](https://platform.openai.com/docs/models/tts) for more information.
    - **TTS-1**: Use this to optimize for speed.
    - **TTS-1-HD**:	Use this to optimize for quality.
- **Text Input**: Enter the text to generate the audio for. The maximum length is 4096 characters.
- **Voice**: Select a voice to use when generating the audio. Listen to the previews of the voices in [Text to speech guide | OpenAI](https://platform.openai.com/docs/guides/text-to-speech/quickstart).

### Options

- **Response Format**: Select the format for the audio response. Choose from **MP3** (default), **OPUS**, **AAC**, **FLAC**, **WAV**, and **PCM**.
- **Audio Speed**: Enter the speed for the generated audio from a value from `0.25` to `4.0`. Defaults to `1`.
- **Put Output in Field**: Defaults to `data`. Enter the name of the output field to put the binary file data in. 

Refer to [Create speech | OpenAI](https://platform.openai.com/docs/api-reference/audio/createSpeech) documentation for more information.

## Transcribe a Recording

Use this operation to transcribe audio into text. OpenAI API limits the size of the audio file to 25 MB. OpenAI will use the `whisper-1` model by default. 

Enter these parameters:

- **Credential to connect with**: Create or select an existing [OpenAI credential](/integrations/builtin/credentials/openai.md).
- **Resource**: Select **Audio**.
- **Operation**: Select **Transcribe a Recording**.
- **Input Data Field Name**: Defaults to `data`. Enter the name of the binary property that contains the audio file in one of these formats: `.flac`, `.mp3`, `.mp4`, `.mpeg`, `.mpga`, `.m4a`, `.ogg`, `.wav`, or `.webm`. 

### Options

- **Language of the Audio File**: Enter the language of the input audio in  [ISO-639-1](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes). Use this option to improve accuracy and latency.
- **Output Randomness (Temperature)**: Defaults to `1.0`. Adjust the randomness of the response. The range is between `0.0` (deterministic) and `1.0` (maximum randomness). We recommend altering this or **Output Randomness (Top P)** but not both. Start with a medium temperature (around 0.7) and adjust based on the outputs you observe. If the responses are too repetitive or rigid, increase the temperature. If they’re too chaotic or off-track, decrease it. 

Refer to [Create transcription | OpenAI](https://platform.openai.com/docs/api-reference/audio/createTranscription) documentation for more information.

## Translate a Recording

Use this operation to translate audio into English. OpenAI API limits the size of the audio file to 25 MB. OpenAI will use the `whisper-1` model by default. 

Enter these parameters:

- **Credential to connect with**: Create or select an existing [OpenAI credential](/integrations/builtin/credentials/openai.md).
- **Resource**: Select **Audio**.
- **Operation**: Select **Translate a Recording**.
- **Input Data Field Name**: Defaults to `data`. Enter the name of the binary property that contains the audio file in one of these formats: `.flac`, `.mp3`, `.mp4`, `.mpeg`, `.mpga`, `.m4a`, `.ogg`, `.wav`, or `.webm`. 

### Options

- **Output Randomness (Temperature)**: Defaults to `1.0`. Adjust the randomness of the response. The range is between `0.0` (deterministic) and `1.0` (maximum randomness). We recommend altering this or **Output Randomness (Top P)** but not both. Start with a medium temperature (around 0.7) and adjust based on the outputs you observe. If the responses are too repetitive or rigid, increase the temperature. If they’re too chaotic or off-track, decrease it. 

Refer to [Create transcription | OpenAI](https://platform.openai.com/docs/api-reference/audio/createTranscription) documentation for more information.

## Common issues

For common errors or issues and suggested resolution steps, refer to [Common Issues](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/common-issues.md).

---

# OpenAI node common issues

Here are some common errors and issues with the [OpenAI node](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/index.md) and steps to resolve or troubleshoot them.

--8<-- "_snippets/integrations/openai-api-issues.md"
--8<-- "_snippets/integrations/referenced-node-unexecuted.md"

---

# OpenAI Conversation operations

Use this operation to create, get, update, or remove a conversation in OpenAI. Refer to [OpenAI](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/index.md) for more information on the OpenAI node itself.

## Create a Conversation

Use this operation to create a new conversation.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [OpenAI credential](/integrations/builtin/credentials/openai.md).
- **Resource**: Select **Conversation**.
- **Operation**: Select **Create a Conversation**.
- **Messages**: A message input to the model. Messages with the `system` role take precedence over instructions given with the `user` role. Messages with the `assistant` role will be assumed to have been generated by the model in previous interactions.

### Options

- **Metadata**: A set of key-value pairs for storing structured information. You can attach up to 16 pairs to an object, which is useful for adding custom data that can be used for searching via the API or in the dashboard.

Refer to [Conversations | OpenAI](https://platform.openai.com/docs/api-reference/conversations/create) documentation for more information. 

## Get a Conversation

Use this operation to retrieve an existing conversation.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [OpenAI credential](/integrations/builtin/credentials/openai.md).
- **Resource**: Select **Conversation**.
- **Operation**: Select **Get Conversation**.
- **Conversation ID**: The ID of the conversation to retrieve.

Refer to [Conversations | OpenAI](https://platform.openai.com/docs/api-reference/conversations/create) documentation for more information. 

## Remove a Conversation

Use this operation to remove an existing conversation.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [OpenAI credential](/integrations/builtin/credentials/openai.md).
- **Resource**: Select **Conversation**.
- **Operation**: Select **Remove Conversation**.
- **Conversation ID**: The ID of the conversation to remove.

Refer to [Conversations | OpenAI](https://platform.openai.com/docs/api-reference/conversations/create) documentation for more information. 

## Update a Conversation

Use this operation to update an existing conversation.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [OpenAI credential](/integrations/builtin/credentials/openai.md).
- **Resource**: Select **Conversation**.
- **Operation**: Select **Update a Conversation**.
- **Conversation ID**: The ID of the conversation to update.

### Options

- **Metadata**: A set of key-value pairs for storing structured information. You can attach up to 16 pairs to an object, which is useful for adding custom data that can be used for searching via the API or in the dashboard.

Refer to [Conversations | OpenAI](https://platform.openai.com/docs/api-reference/conversations/create) documentation for more information.

---

# OpenAI File operations

Use this operation to create, delete, list, message, or update a file in OpenAI. Refer to [OpenAI](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/index.md) for more information on the OpenAI node itself.

## Delete a File

Use this operation to delete a file from the server.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [OpenAI credential](/integrations/builtin/credentials/openai.md).
- **Resource**: Select **File**.
- **Operation**: Select **Delete a File**.
- **File**: Enter the ID of the file to use for this operation or select the file name from the dropdown.

Refer to [Delete file | OpenAI](https://platform.openai.com/docs/api-reference/files/delete) documentation for more information.

## List Files

Use this operation to list files that belong to the user's organization. 

Enter these parameters:

- **Credential to connect with**: Create or select an existing [OpenAI credential](/integrations/builtin/credentials/openai.md).
- **Resource**: Select **File**.
- **Operation**: Select **List Files**.

### Options

- **Purpose**: Use this to only return files with the given purpose. Use **Assistants** to return only files related to Assistants and Message operations. Use **Fine-Tune** for files related to [Fine-tuning](https://platform.openai.com/docs/api-reference/fine-tuning).

Refer to [List files | OpenAI](https://platform.openai.com/docs/api-reference/files/list) documentation for more information.

## Upload a File

Use this operation to upload a file. This can be used across various operations. 

Enter these parameters:

- **Credential to connect with**: Create or select an existing [OpenAI credential](/integrations/builtin/credentials/openai.md).
- **Resource**: Select **File**.
- **Operation**: Select **Upload a File**.
- **Input Data Field Name**: Defaults to `data`. Enter the name of the binary property which contains the file. The size of individual files can be a maximum of 512 MB or 2 million tokens for Assistants.

### Options

- **Purpose**: Enter the intended purpose of the uploaded file. Use **Assistants** for files associated with Assistants and Message operations. Use **Fine-Tune** for [Fine-tuning](https://platform.openai.com/docs/api-reference/fine-tuning).

Refer to [Upload file | OpenAI](https://platform.openai.com/docs/api-reference/files/create) documentation for more information.

## Common issues

For common errors or issues and suggested resolution steps, refer to [Common Issues](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/common-issues.md).

---

# OpenAI Image operations

Use this operation to analyze or generate an image in OpenAI. Refer to [OpenAI](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/index.md) for more information on the OpenAI node itself.

## Analyze Image

Use this operation to take in images and answer questions about them.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [OpenAI credential](/integrations/builtin/credentials/openai.md).
- **Resource**: Select **Image**.
- **Operation**: Select **Analayze Image**.
- **Model**: Select the model you want to use to analyze an image. 
- **Text Input**: Ask a question about the image.
- **Input Type**: Select how you'd like to input the image. Options include:
    - **Image URL(s)**: Enter the **URL(s)** of the image(s) to analyze. Add multiple URLs in a comma-separated list.
    - **Binary File(s)**: Enter the name of the binary property which contains the image(s) in the **Input Data Field Name**.

### Options

- **Detail**: Specify the balance between response time versus token usage. 
- **Length of Description (Max Tokens)**: Defaults to 300. Fewer tokens will result in shorter, less detailed image description.

Refer to [Images | OpenAI](https://platform.openai.com/docs/api-reference/images) documentation for more information.

## Generate an Image

Use this operation to create an image from a text prompt.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [OpenAI credential](/integrations/builtin/credentials/openai.md).
- **Resource**: Select **Image**.
- **Operation**: Select **Generate an Image**.
- **Model**: Select the model you want to use to generate an image. 
- **Prompt**: Enter the text description of the desired image(s). The maximum length is 1000 characters for `dall-e-2` and 4000 characters for `dall-e-3`.

### Options

- **Quality**: The quality of the image you generate. **HD** creates images with finer details and greater consistency across the image. This option is only supported for `dall-e-3`. Otherwise, choose **Standard**.
- **Resolution**: Select the resolution of the generated images. Select **1024x1024** for `dall-e-2`. Select one of **1024x1024**, **1792x1024**, or **1024x1792** for `dall-e-3` models.
- **Style**: Select the style of the generated images. This option is only supported for `dall-e-3`. 
    - **Natural**: Use this to produce more natural looking images.
    - **Vivid**: Use this to produce hyper-real and dramatic images.
- **Respond with image URL(s)**: Whether to return image URL(s) instead of binary file(s).
- **Put Output in Field**: Defaults to `data`. Enter the name of the output field to put the binary file data in. Only available if **Respond with image URL(s)** is turned off.

Refer to [Create image | OpenAI](https://platform.openai.com/docs/api-reference/images/create) documentation for more information.

## Edit an Image

Use this operation to edit an image from a text prompt.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [OpenAI credential](/integrations/builtin/credentials/openai.md).
- **Resource**: Select **Image**.
- **Operation**: Select **Edit Image**.
- **Model**: Select the model you want to use to generate an image. Supports `dall-e-2` and `gpt-image-1`.
- **Prompt**: Enter the text description of the desired edits to the input image(s).
- **Image(s)**: Add one or more binary fields to include images with your prompt. Each image should be a png, webp, or jpg file less than 50MB. You can provide up to 16 images.
- **Number of Images**: The number of images to generate. Must be between 1 and 10.
- **Size**: The size and dimensions of the generated images (in px).
- **Quality**: The quality of the image that will be generated (auto, low, medium, high, standard). Only supported for `gpt-image-1`.
- **Output Format**: The format in which the generated images are returned (png, webp, or jpg). Only supported for gpt-image-1.
- **Output Compression**: The compression level (0-100%) for the generated images. Only supported for `gpt-image-1` with webp or jpeg output formats.

### Options
- **Background**: Allows to set transparency for the background of the generated image(s). Only supported for `gpt-image-1`.
- **Input Fidelity**: Control how much effort the model will exert to match the style and features of input images. Only supported for `gpt-image-1`.
- **Image Mask**: Name of the binary property that contains the image. A second image whose fully transparent areas (for example, where alpha is zero) shows where the image should be edited. If there are multiple images provided, the mask will be applied on the first image. Must be a valid PNG file, less than 4MB, and have the same dimensions as image.
- **User**: A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse.

## Common issues

For common errors or issues and suggested resolution steps, refer to [Common Issues](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/common-issues.md).

---

# OpenAI Text operations

Use this operation to message a model or classify text for violations in OpenAI. Refer to [OpenAI](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/index.md) for more information on the OpenAI node itself.

/// note | Previous node versions
n8n version 1.117.0 introduces the OpenAI node V2 that supports the OpenAI Responses API. It renames the 'Message a Model' operation to 'Generate a Chat Completion' to clarify its association with the Chat Completions API and introduces a separate 'Generate a Model Response' operation that uses the Responses API.
///

## Generate a Chat Completion

Use this operation to send a message or prompt to an OpenAI model - using the Chat Completions API - and receive a response.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [OpenAI credential](/integrations/builtin/credentials/openai.md).
- **Resource**: Select **Text**.
- **Operation**: Select **Generate a Chat Completion**.
- **Model**: Select the model you want to use. If you’re not sure which model to use, try `gpt-4o` if you need high intelligence or `gpt-4o-mini` if you need the fastest speed and lowest cost. Refer to [Models overview | OpenAI Platform](https://platform.openai.com/docs/models) for more information. 
- **Messages**: Enter a **Text** prompt and assign a **Role** that the model will use to generate responses. Refer to [Prompt engineering | OpenAI](https://platform.openai.com/docs/guides/prompt-engineering) for more information on how to write a better prompt by using these roles. Choose from one of these roles: 
    - **User**: Sends a message as a user and gets a response from the model. 
    - **Assistant**: Tells the model to adopt a specific tone or personality. 
    - **System**: By default, there is no system message. You can define instructions in the user message, but the instructions set in the system message are more effective. You can set more than one system message per conversation. Use this to set the model's behavior or context for the next user message. 
- **Simplify Output**: Turn on to return a simplified version of the response instead of the raw data. 
- **Output Content as JSON**: Turn on to attempt to return the response in JSON format. Compatible with `GPT-4 Turbo` and all `GPT-3.5 Turbo` models newer than `gpt-3.5-turbo-1106`.

### Options

- **Frequency Penalty**: Apply a penalty to reduce the model's tendency to repeat similar lines. The range is between `0.0` and `2.0`.
- **Maximum Number of Tokens**: Set the maximum number of tokens for the response. One token is roughly four characters for standard English text. Use this to limit the length of the output. 
- **Number of Completions**: Defaults to 1. Set the number of completions you want to generate for each prompt. Use carefully since setting a high number will quickly consume your tokens. 
- **Presence Penalty**: Apply a penalty to influence the model to discuss new topics. The range is between `0.0` and `2.0`.
- **Output Randomness (Temperature)**: Adjust the randomness of the response. The range is between `0.0` (deterministic) and `1.0` (maximum randomness). We recommend altering this or **Output Randomness (Top P)** but not both. Start with a medium temperature (around `0.7`) and adjust based on the outputs you observe. If the responses are too repetitive or rigid, increase the temperature. If they’re too chaotic or off-track, decrease it. Defaults to `1.0`. 
- **Output Randomness (Top P)**: Adjust the Top P setting to control the diversity of the assistant's responses. For example, `0.5` means half of all likelihood-weighted options are considered. We recommend altering this or **Output Randomness (Temperature)** but not both. Defaults to `1.0`. 

Refer to [Chat Completions | OpenAI](https://platform.openai.com/docs/api-reference/chat) documentation for more information.

## Generate a Model Response

Use this operation to send a message or prompt to an OpenAI model - using the Responses API - and receive a response.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [OpenAI credential](/integrations/builtin/credentials/openai.md).
- **Resource**: Select **Text**.
- **Operation**: Select **Generate a Model Response**.
- **Model**: Select the model you want to use. Refer to [Models overview | OpenAI Platform](https://platform.openai.com/docs/models) for an overview. 
- **Messages**: Choose from one of these a **Message Types**:
    - **Text**: Enter a **Text** prompt and assign a **Role** that the model will use to generate responses. Refer to [Prompt engineering | OpenAI](https://platform.openai.com/docs/guides/prompt-engineering) for more information on how to write a better prompt by using these roles. 
    - **Image**: Provide an **Image** either through an Image URL, a File ID (using the [OpenAI Files API](https://platform.openai.com/docs/api-reference/files)) or by passing binary data from an earlier node in your workflow.
    - **File**: Provide a **File** in a supported format (currently: PDF only), either through a File URL, a File ID (using the [OpenAI Files API](https://platform.openai.com/docs/api-reference/files)) or by passing binary data from an earlier node in your workflow.
    - For any message type, you can choose from one of these roles: 
        - **User**: Sends a message as a user and gets a response from the model. 
        - **Assistant**: Tells the model to adopt a specific tone or personality. 
        - **System**: By default, the system message is `"You are a helpful assistant"`. You can define instructions in the user message, but the instructions set in the system message are more effective. You can only set one system message per conversation. Use this to set the model's behavior or context for the next user message.
- **Simplify Output**: Turn on to return a simplified version of the response instead of the raw data. 

### Built-in Tools
The OpenAI Responses API provides a range of [built-in tools](https://platform.openai.com/docs/guides/tools) to enrich the model's response:

- **Web Search**: Allows models to search the web for the latest information before generating a response.
- **MCP Servers**: Allows models to connect to remote MCP servers. Find out more about using remote MCP servers as tools [here](https://platform.openai.com/docs/guides/tools-connectors-mcp).
- **File Search**: Allow models to search your knowledgebase from previously uploaded files for relevant information before generating a response. Refer to the [OpenAI documentation](https://platform.openai.com/docs/guides/tools-file-search) for more information.
- **Code Interpreter**: Allows models to write and run Python code in a sandboxed environment.

### Options

- **Maximum Number of Tokens**: Set the maximum number of tokens for the response. One token is roughly four characters for standard English text. Use this to limit the length of the output. 
- **Output Randomness (Temperature)**: Adjust the randomness of the response. The range is between `0.0` (deterministic) and `1.0` (maximum randomness). We recommend altering this or **Output Randomness (Top P)** but not both. Start with a medium temperature (around `0.7`) and adjust based on the outputs you observe. If the responses are too repetitive or rigid, increase the temperature. If they’re too chaotic or off-track, decrease it. Defaults to `1.0`. 
- **Output Randomness (Top P)**: Adjust the Top P setting to control the diversity of the assistant's responses. For example, `0.5` means half of all likelihood-weighted options are considered. We recommend altering this or **Output Randomness (Temperature)** but not both. Defaults to `1.0`.
- **Conversation ID**: The conversation that this response belongs to. Input items and output items from this response are automatically added to this conversation after this response completes.
- **Previous Response ID**: The ID of the previous response to continue from. Can't be used in conjunction with Conversation ID.
- **Reasoning**: The level of reasoning effort the model should spend to generate the response. Includes the ability to return a **Summary** of the reasoning performed by the model (for example, for debugging purposes).
- **Store**: Whether to store the generated model response for later retrieval via API. Defaults to `true`.
- **Output Format**: Whether to return the response as **Text**, in a specified **JSON Schema** or as a **JSON Object**.
- **Background**: Whether to run the model in [background mode](https://platform.openai.com/docs/guides/background). This allows executing long-running tasks more reliably.

Refer to [Responses | OpenAI](https://platform.openai.com/docs/api-reference/responses/create) documentation for more information.

## Classify Text for Violations

Use this operation to identify and flag content that might be harmful. OpenAI model will analyze the text and return a response containing:

- `flagged`: A boolean field indicating if the content is potentially harmful.
- `categories`: A list of category-specific violation flags.
- `category_scores`: Scores for each category.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [OpenAI credential](/integrations/builtin/credentials/openai.md).
- **Resource**: Select **Text**.
- **Operation**: Select **Classify Text for Violations**.
- **Text Input**: Enter text to classify if it violates the moderation policy. 
- **Simplify Output**: Turn on to return a simplified version of the response instead of the raw data.

### Options

- **Use Stable Model**: Turn on to use the stable version of the model instead of the latest version, accuracy may be slightly lower.

Refer to [Moderations | OpenAI](https://platform.openai.com/docs/api-reference/moderations) documentation for more information.

## Common issues

For common errors or issues and suggested resolution steps, refer to [Common Issues](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/common-issues.md).

---

# OpenAI Video operations

Use this operation to generate a video in OpenAI. Refer to [OpenAI](/integrations/builtin/app-nodes/n8n-nodes-langchain.openai/index.md) for more information on the OpenAI node itself.

## Generate Video

Use this operation to generate a video from a text prompt.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [OpenAI credential](/integrations/builtin/credentials/openai.md).
- **Resource**: Select **Video**.
- **Operation**: Select **Generate Video**.
- **Model**: Select the model you want to use to generate a video. Currently supports `sora-2` and `sora-2-pro`.
- **Prompt**: The prompt to generate a video from.
- **Seconds**: Clip duration in seconds (up to 25).
- **Size**: Output resolution formatted as width x height. 1024x1792 and 1792x1024 are only supported by Sora 2 Pro.

### Options

- **Reference**: Optional image reference that guides generation. Has to be passed in as a binary item.
- **Wait Timeout**: Time to wait for the video to be generated in seconds. Defaults to 300.
- **Output Field Name**: The name of the output field to put the binary file data in. Defaults to `data`.

Refer to [Video Generation | OpenAI](https://platform.openai.com/docs/guides/video-generation) for more information.