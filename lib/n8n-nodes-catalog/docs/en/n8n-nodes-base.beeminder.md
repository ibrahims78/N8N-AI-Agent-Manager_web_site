# Beeminder node documentation

> Learn how to use the Beeminder node in n8n. Follow technical documentation to integrate Beeminder node into your workflows.

# Beeminder node

Use the Beeminder node to automate work in Beeminder, and integrate Beeminder with other applications. n8n has built-in support for a wide range of Beeminder features, including creating, deleting, and updating data points.

On this page, you'll find a list of operations the Beeminder node supports and links to more resources.

> **Credentials**
>
> Refer to [Beeminder credentials](/integrations/builtin/credentials/beeminder.md) for guidance on setting up authentication.

## Operations

**data point**
- Create data point for a goal
- Delete a data point
- Get all data points for a goal
- Update a data point

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for beeminder at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.beeminder/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.beeminder/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io//) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.