# Mailjet node documentation

> Learn how to use the Mailjet node in n8n. Follow technical documentation to integrate Mailjet node into your workflows.

# Mailjet node

Use the Mailjet node to automate work in Mailjet, and integrate Mailjet with other applications. n8n has built-in support for a wide range of Mailjet features, including sending emails, and SMS. 

On this page, you'll find a list of operations the Mailjet node supports and links to more resources.

> **Credentials**
>
> Refer to [Mailjet credentials](/integrations/builtin/credentials/mailjet.md) for guidance on setting up authentication.

## Operations

* Email
    * Send an email
    * Send an email template
* SMS
    * Send an SMS

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for mailjet at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.mailjet/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.mailjet/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io//) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.