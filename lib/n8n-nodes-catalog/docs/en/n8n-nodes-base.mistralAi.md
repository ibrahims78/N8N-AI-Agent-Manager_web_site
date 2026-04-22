# MistralAI node documentation

> Learn how to use the Mistral AI node in n8n. Follow technical documentation to integrate Mistral AI node into your workflows.

# Mistral AI node

Use the Mistral AI node to automate work in Mistral AI and integrate Mistral AI with other applications. n8n has built-in support for extracting text with various models, file types, and input methods.

On this page, you'll find a list of operations the Mistral AI node supports, and links to more resources.

> **Credentials**
>
> You can find authentication information for this node [here](/integrations/builtin/credentials/mistral.md).

## Node parameters

* **Resource**: The resource that Mistral AI should operate on. The current implementation supports the "Document" resource.
* **Operation**: The operation to perform:
	* **Extract Text**: Extracts text from a document or image using optical character recognition (OCR).
* **Model**: The model to use for the given operation. The current version requires the `mistral-ocr-latest` model.
* **Document Type**: The document format to process. Can be "Document" or "Image".
* **Input Type**: How to input the document:
	* **Binary Data**: Pass the document to this node as a binary field.
	* **URL**: Fetch the document from a given URL.
* **Input Binary Field**: When using the "Binary Data" input type, defines the name of the input binary field containing the file.
* **URL**: When using the "URL" input type, the URL of the document or image to process.

## Node options

* **Enable Batch Processing**: Whether to process multiple documents in the same API call. This may reduce your costs by bundling requests.
* **Batch Size**: When using "Enable Batch Processing", sets the maximum number of documents to process per batch.
* **Delete Files After Processing**: When using "Enable Batch Processing", whether to delete the files from Mistral Cloud after processing.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for mistral-ai at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.mistralai/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.mistralai/)

## Related resources

<!-- add a link to the service's documentation. This should usually go direct to the API docs -->
Refer to [Mistral AI's documentation](https://docs.mistral.ai/api/) for more information about the service.

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io//) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.