# Wekan node documentation

> Learn how to use the Wekan node in n8n. Follow technical documentation to integrate Wekan node into your workflows.

# Wekan node

Use the Wekan node to automate work in Wekan, and integrate Wekan with other applications. n8n has built-in support for a wide range of Wekan features, including creating, updating, deleting, and getting boards and cards. 

On this page, you'll find a list of operations the Wekan node supports and links to more resources.

> **Credentials**
>
> Refer to [Wekan credentials](https://docs.n8n.io/integrations/builtin/credentials/wekan/) for guidance on setting up authentication.

## Operations

* Board
    * Create a new board
    * Delete a board
    * Get the data of a board
    * Get all user boards
* Card
    * Create a new card
    * Delete a card
    * Get a card
    * Get all cards
    * Update a card
* Card Comment
    * Create a comment on a card
    * Delete a comment from a card
    * Get a card comment
    * Get all card comments
* Checklist
    * Create a new checklist
    * Delete a checklist
    * Get the data of a checklist
    * Returns all checklists for the card
* Checklist Item
    * Delete a checklist item
    * Get a checklist item
    * Update a checklist item
* List
    * Create a new list
    * Delete a list
    * Get the data of a list
    * Get all board lists

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for wekan at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.wekan/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.wekan/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](https://docs.n8n.io/integrations/custom-operations/) for more information.

## Load all the parameters for the node

To load all the parameters, for example, Author ID, you need to give admin permissions to the user. Refer to the [Wekan documentation](https://github.com/wekan/wekan/wiki/Features#members-click-member-initials-or-avatar--permissions-adminnormalcomment-only) to learn how to change permissions.