# ServiceNow node documentation

> Learn how to use the ServiceNow node in n8n. Follow technical documentation to integrate ServiceNow node into your workflows.

# ServiceNow node

Use the ServiceNow node to automate work in ServiceNow, and integrate ServiceNow with other applications. n8n has built-in support for a wide range of ServiceNow features, including getting business services, departments, configuration items, and dictionary as well as creating, updating, and deleting incidents, users, and table records. 

On this page, you'll find a list of operations the ServiceNow node supports and links to more resources.

> **Credentials**
>
> Refer to [ServiceNow credentials](https://docs.n8n.io/integrations/builtin/credentials/servicenow/) for guidance on setting up authentication.

## Operations

* Business Service
    * Get All
* Configuration Items
    * Get All
* Department
    * Get All
* Dictionary
    * Get All
* Incident
    * Create
    * Delete
    * Get
    * Get All
    * Update
* Table Record
    * Create
    * Delete
    * Get
    * Get All
    * Update
* User
    * Create
    * Delete
    * Get
    * Get All
    * Update
* User Group
    * Get All
* User Role
    * Get All

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for servicenow at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.servicenow/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.servicenow/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](https://docs.n8n.io/integrations/custom-operations/) for more information.