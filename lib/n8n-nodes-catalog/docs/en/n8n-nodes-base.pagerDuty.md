# PagerDuty node documentation

> Learn how to use the PagerDuty node in n8n. Follow technical documentation to integrate PagerDuty node into your workflows.

# PagerDuty node

Use the PagerDuty node to automate work in PagerDuty, and integrate PagerDuty with other applications. n8n has built-in support for a wide range of PagerDuty features, including creating incident notes, as well as updating, and getting all log entries and users. 

On this page, you'll find a list of operations the PagerDuty node supports and links to more resources.

> **Credentials**
>
> Refer to [PagerDuty credentials](/integrations/builtin/credentials/pagerduty.md) for guidance on setting up authentication.

## Operations

* Incident
    * Create an incident
    * Get an incident
    * Get all incidents
    * Update an incident
* Incident Note
    * Create an incident note
    * Get all incident's notes
* Log Entry
    * Get a log entry
    * Get all log entries
* User
    * Get a user

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for pagerduty at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.pagerduty/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.pagerduty/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io//) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.