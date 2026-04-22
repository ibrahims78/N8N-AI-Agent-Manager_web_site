---
title: WhatsApp Business Cloud node documentation
description: Learn how to use the WhatsApp Business Cloud node in n8n. Follow technical documentation to integrate WhatsApp Business Cloud node into your workflows.
contentType: [integration, reference]
priority: high
---

# WhatsApp Business Cloud node

Use the WhatsApp Business Cloud node to automate work in WhatsApp Business, and integrate WhatsApp Business with other applications. n8n has built-in support for a wide range of WhatsApp Business features, including sending messages, and uploading, downloading, and deleting media. 

On this page, you'll find a list of operations the WhatsApp Business Cloud node supports and links to more resources.

/// note | Credentials
Refer to [WhatsApp Business Cloud credentials](/integrations/builtin/credentials/whatsapp.md) for guidance on setting up authentication.
///

## Operations

* Message
	* Send
	* Send and Wait for Response
	* Send Template
* Media
	* Upload
	* Download
	* Delete

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Related resources

Refer to [WhatsApp Business Platform's Cloud API documentation](https://developers.facebook.com/docs/whatsapp/cloud-api) for details about the operations.

## Common issues

For common errors or issues and suggested resolution steps, refer to [Common Issues](/integrations/builtin/app-nodes/n8n-nodes-base.whatsapp/common-issues.md).

---

# WhatsApp Business Cloud node common issues

Here are some common errors and issues with the [WhatsApp Business Cloud node](/integrations/builtin/app-nodes/n8n-nodes-base.whatsapp/index.md) and steps to resolve or troubleshoot them.

## Bad request - please check your parameters

This error occurs when WhatsApp Business Cloud rejects your request because of a problem with its parameters. It's common to see this when using the **Send Template** operation if the data you send doesn't match the format of your template.

To resolve this issue, review the parameters in your [message template](https://www.facebook.com/business/help/2055875911147364?id=2129163877102343). Pay attention to each parameter's data type and the order they're defined in the template.

Check the data that n8n is mapping to the template parameters. If you're using expressions to set parameter values, check the input data to make sure each item resolves to a valid value. You may want to use the [Edit Fields (Set) node](/integrations/builtin/core-nodes/n8n-nodes-base.set.md) or set a fallback value to ensure you send a value with the correct format.

## Working with non-text media

The WhatsApp Business Cloud node can work with non-text messages and media like images, audio, documents, and more.

If your operation includes a **Input Data Field Name** or **Property Name** parameter, set this to the field name itself rather than referencing the data in an expression.

For example, if you are trying to send a message with an "Image" **MessageType** and **Take Image From** set to "n8n", set **Input Data Field Name** to a field name like `data` instead of an expression like ``.