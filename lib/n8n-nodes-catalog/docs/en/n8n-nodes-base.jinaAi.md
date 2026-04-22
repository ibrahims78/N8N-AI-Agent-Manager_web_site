# Jina AI node documentation

> Learn how to use the Jina AI node in n8n. Follow technical documentation to integrate Jina AI node into your workflows.

# Jina AI node

Use the Jina AI node to automate work in Jina AI and integrate Jina AI with other applications. n8n has built-in support for a wide range of Jina AI features.

On this page, you'll find a list of operations the Jina AI node supports, and links to more resources.

> **Credentials**
>
> You can find authentication information for this node [here](/integrations/builtin/credentials/jinaai.md).

## Operations

* **Reader**:
	* **Read**: Fetches content from a URL and converts it to clean, LLM-friendly formats.
	* **Search**: Performs a web search using Jina AI and returns the top results as clean, LLM-friendly formats.
* **Research**:
	* **Deep Research**: Research a topic and generate a structured research report.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for jina-ai at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.jinaai/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.jinaai/)

## Related resources

Refer to [Jina AI's reader API documentation](https://r.jina.ai/docs) and [Jina AI's search API documentation](https://s.jina.ai/docs) for more information about the service.

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io//) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.