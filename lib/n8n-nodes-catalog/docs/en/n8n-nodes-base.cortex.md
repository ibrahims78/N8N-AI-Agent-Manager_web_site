# Cortex node documentation

> Learn how to use the Cortex node in n8n. Follow technical documentation to integrate Cortex node into your workflows.

# Cortex node

Use the Cortex node to automate work in Cortex, and integrate Cortex with other applications. n8n has built-in support for a wide range of Cortex features, including executing analyzers, and responders, as well as getting job details.

On this page, you'll find a list of operations the Cortex node supports and links to more resources.

> **Credentials**
>
> Refer to [Cortex credentials](/integrations/builtin/credentials/cortex.md) for guidance on setting up authentication.

## Operations

* Analyzer
    * Execute Analyzer
* Job
    * Get job details
    * Get job report
* Responder
    * Execute Responder

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for cortex at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.cortex/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.cortex/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io//) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.