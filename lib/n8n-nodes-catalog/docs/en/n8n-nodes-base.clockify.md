# Clockify node

Use the Clockify node to automate work in Clockify, and integrate Clockify with other applications. n8n has built-in support for a wide range of Clockify features, including creating, updating, getting, and deleting tasks, time entries, projects, and tags.

On this page, you'll find a list of operations the Clockify node supports and links to more resources.

> **Credentials**
>
> Refer to [Clockify credentials](/integrations/builtin/credentials/clockify.md) for guidance on setting up authentication.

## Operations

* Project
    * Create a project
    * Delete a project
    * Get a project
    * Get all projects
    * Update a project
* Tag
    * Create a tag
    * Delete a tag
    * Get all tags
    * Update a tag
* Task
    * Create a task
    * Delete a task
    * Get a task
    * Get all tasks
    * Update a task
* Time Entry
    * Create a time entry
    * Delete a time entry
    * Get time entry
    * Update a time entry

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.