# GoToWebinar node

Use the GoToWebinar node to automate work in GoToWebinar, and integrate GoToWebinar with other applications. n8n has built-in support for a wide range of GoToWebinar features, including creating, getting, and deleting attendees, organizers, and registrants.

On this page, you'll find a list of operations the GoToWebinar node supports and links to more resources.

> **Credentials**
>
> Refer to [GoToWebinar credentials](/integrations/builtin/credentials/gotowebinar.md) for guidance on setting up authentication.

## Operations

* Attendee
    * Get
    * Get All
    * Get Details
* Co-Organizer
    * Create
    * Delete
    * Get All
    * Re-invite
* Panelist
    * Create
    * Delete
    * Get All
    * Re-invite
* Registrant
    * Create
    * Delete
    * Get
    * Get All
* Session
    * Get
    * Get All
    * Get Details
* Webinar
    * Create
    * Get
    * Get All
    * Update

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.