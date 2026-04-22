# Segment node documentation

> Learn how to use the Segment node in n8n. Follow technical documentation to integrate Segment node into your workflows.

# Segment node

Use the Segment node to automate work in Segment, and integrate Segment with other applications. n8n has built-in support for a wide range of Segment features, including adding users to groups, creating identities, and tracking activities. 

On this page, you'll find a list of operations the Segment node supports and links to more resources.

> **Credentials**
>
> Refer to [Segment credentials](/integrations/builtin/credentials/segment.md) for guidance on setting up authentication.

## Operations

* Group
    * Add a user to a group
* Identify
    * Create an identity
* Track
    * Record the actions your users perform. Every action triggers an event, which can also have associated properties.
    * Record page views on your website, along with optional extra information about the page being viewed.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for segment at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.segment/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.segment/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io//) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.