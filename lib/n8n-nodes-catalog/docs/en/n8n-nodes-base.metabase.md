# Metabase node documentation

> Learn how to use the Metabase node in n8n. Follow technical documentation to integrate Metabase node into your workflows.

# Metabase node

Use the Metabase node to automate work in Metabase, and integrate Metabase with other applications. n8n has built-in support for a wide range of Metabase features, including adding, and getting alerts, databases, metrics, and questions. 

On this page, you'll find a list of operations the Metabase node supports and links to more resources.

> **Credentials**
>
> Refer to [Metabase credentials](https://docs.n8n.io/integrations/builtin/credentials/metabase/) for guidance on setting up authentication.

## Operations

* Alert
    * Get
    * Get All
* Database
    * Add
    * Get All
    * Get Fields
* Metric
    * Get
    * Get All
* Question
    * Get
    * Get All
    * Result Data

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for metabase at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.metabase/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.metabase/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](https://docs.n8n.io/integrations/custom-operations/) for more information.