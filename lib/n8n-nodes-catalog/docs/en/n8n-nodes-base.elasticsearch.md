# Elasticsearch node documentation

> Learn how to use the Elasticsearch node in n8n. Follow technical documentation to integrate Elasticsearch node into your workflows.

# Elasticsearch node

Use the Elasticsearch node to automate work in Elasticsearch, and integrate Elasticsearch with other applications. n8n has built-in support for a wide range of Elasticsearch features, including creating, updating, deleting, and getting documents and indexes. 

On this page, you'll find a list of operations the Elasticsearch node supports and links to more resources.

> **Credentials**
>
> Refer to [Elasticsearch credentials](/integrations/builtin/credentials/elasticsearch.md) for guidance on setting up authentication.

> **This node can be used as an AI tool**
>
> This node can be used to enhance the capabilities of an AI agent. When used in this way, many parameters can be set automatically, or with information directed by AI - find out more in the [AI tool parameters documentation](/advanced-ai/examples/using-the-fromai-function.md).

## Operations

* Document
    * Create a document
    * Delete a document
    * Get a document
    * Get all documents
    * Update a document
* Index
    * Create
    * Delete
    * Get
    * Get All

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for elasticsearch at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.elasticsearch/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.elasticsearch/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io//) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.