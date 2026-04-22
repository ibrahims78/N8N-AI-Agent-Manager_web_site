# Webex by Cisco node documentation

> Learn how to use the Webex by Cisco node in n8n. Follow technical documentation to integrate Webex by Cisco node into your workflows.

# Webex by Cisco node

Use the Webex by Cisco node to automate work in Webex, and integrate Webex with other applications. n8n has built-in support for a wide range of Webex features, including creating, getting, updating, and deleting meetings and messages.

On this page, you'll find a list of operations the Webex node supports and links to more resources.

> **Credentials**
>
> Refer to [Webex credentials](/integrations/builtin/credentials/ciscowebex.md) for guidance on setting up authentication.
> **Examples and Templates**
>
> For usage examples and templates to help you get started, take a look at n8n's [Webex integrations](https://n8n.io/integrations/webex-by-cisco/) list.

## Operations

* Meeting
    * Create
    * Delete
    * Get
    * Get All
    * Update
* Message
    * Create
    * Delete
    * Get
    * Get All
    * Update

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for webex-by-cisco at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.ciscowebex/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.ciscowebex/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io//) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.