# GetResponse node documentation

> Learn how to use the GetResponse node in n8n. Follow technical documentation to integrate GetResponse node into your workflows.

# GetResponse node

Use the GetResponse node to automate work in GetResponse, and integrate GetResponse with other applications. n8n has built-in support for a wide range of GetResponse features, including creating, updating, deleting, and getting contacts. 

On this page, you'll find a list of operations the GetResponse node supports and links to more resources.

> **Credentials**
>
> Refer to [GetResponse credentials](https://docs.n8n.io/integrations/builtin/credentials/getresponse/) for guidance on setting up authentication.

## Operations

* Contact
    * Create a new contact
    * Delete a contact
    * Get a contact
    * Get all contacts
    * Update contact properties

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for getresponse at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.getresponse/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.getresponse/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](https://docs.n8n.io/integrations/custom-operations/) for more information.