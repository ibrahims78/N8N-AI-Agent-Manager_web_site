# Perplexity node

Use the Perplexity node to automate work in Perplexity and integrate Perplexity with other applications. n8n has built-in support for messaging a model.

On this page, you'll find a list of operations the Perplexity node supports, and links to more resources.

> **Credentials**
>
> You can find authentication information for this node [here](/integrations/builtin/credentials/perplexity.md).

## Operations

* **Message a Model**: Create one or more completions for a given text.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Related resources

<!-- add a link to the service's documentation. This should usually go direct to the API docs -->
Refer to [Perplexity's documentation](https://docs.perplexity.ai/home) for more information about the service.

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.