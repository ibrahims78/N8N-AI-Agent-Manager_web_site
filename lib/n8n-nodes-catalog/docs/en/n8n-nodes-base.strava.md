# Strava node

Use the Strava node to automate work in Strava, and integrate Strava with other applications. n8n has built-in support for a wide range of Strava features, including creating new activities, and getting activity information. 

On this page, you'll find a list of operations the Strava node supports and links to more resources.

> **Credentials**
>
> Refer to [Strava credentials](/integrations/builtin/credentials/strava.md) for guidance on setting up authentication.

## Operations

* Activity
    * Create a new activity
    * Get an activity
    * Get all activities
    * Get all activity comments
    * Get all activity kudos
    * Get all activity laps
    * Get all activity zones
    * Update an activity

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.