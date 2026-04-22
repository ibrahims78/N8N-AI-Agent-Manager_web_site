# Mailchimp node

Use the Mailchimp node to automate work in Mailchimp, and integrate Mailchimp with other applications. n8n has built-in support for a wide range of Mailchimp features, including creating, updating, and deleting campaigns, as well as getting list groups. 

On this page, you'll find a list of operations the Mailchimp node supports and links to more resources.

> **Credentials**
>
> Refer to [Mailchimp credentials](/integrations/builtin/credentials/mailchimp.md) for guidance on setting up authentication.

## Operations

* Campaign
    * Delete a campaign
    * Get a campaign
    * Get all the campaigns
    * Replicate a campaign
    * Creates a Resend to Non-Openers version of this campaign
    * Send a campaign
* List Group
    * Get all groups
* Member
    * Create a new member on list
    * Delete a member on list
    * Get a member on list
    * Get all members on list
    * Update a new member on list
* Member Tag
    * Add tags from a list member
    * Remove tags from a list member

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.