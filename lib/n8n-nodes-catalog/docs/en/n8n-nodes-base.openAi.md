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