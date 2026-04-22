# Grafana node documentation

> Learn how to use the Grafana node in n8n. Follow technical documentation to integrate Grafana node into your workflows.

# Grafana node

Use the Grafana node to automate work in Grafana, and integrate Grafana with other applications. n8n has built-in support for a wide range of Grafana features, including creating, updating, deleting, and getting dashboards, teams, and users.

On this page, you'll find a list of operations the Grafana node supports and links to more resources.

> **Credentials**
>
> Refer to [Grafana credentials](/integrations/builtin/credentials/grafana.md) for guidance on setting up authentication.

> **This node can be used as an AI tool**
>
> This node can be used to enhance the capabilities of an AI agent. When used in this way, many parameters can be set automatically, or with information directed by AI - find out more in the [AI tool parameters documentation](/advanced-ai/examples/using-the-fromai-function.md).

## Operations

* Dashboard
    * Create a dashboard
    * Delete a dashboard
    * Get a dashboard
    * Get all dashboards
    * Update a dashboard
* Team
    * Create a team
    * Delete a team
    * Get a team
    * Retrieve all teams
    * Update a team
* Team Member
    * Add a member to a team
    * Retrieve all team members
    * Remove a member from a team
* User
    * Delete a user from the current organization
    * Retrieve all users in the current organization
    * Update a user in the current organization

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for grafana at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.grafana/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.grafana/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io//) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.