# Pushbullet node documentation

> Learn how to use the Pushbullet node in n8n. Follow technical documentation to integrate Pushbullet node into your workflows.

# Pushbullet node

Use the Pushbullet node to automate work in Pushbullet, and integrate Pushbullet with other applications. n8n has built-in support for a wide range of Pushbullet features, including creating, updating, deleting, and getting a push. 

On this page, you'll find a list of operations the Pushbullet node supports and links to more resources.

> **Credentials**
>
> Refer to [Pushbullet credentials](/integrations/builtin/credentials/pushbullet.md) for guidance on setting up authentication.

## Operations

* Push
    * Create a push
    * Delete a push
    * Get all pushes
    * Update a push

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for pushbullet at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.pushbullet/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.pushbullet/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io//) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.