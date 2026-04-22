# AWS DynamoDB node documentation

> Learn how to use the AWS DynamoDB node in n8n. Follow technical documentation to integrate AWS DynamoDB node into your workflows.

# AWS DynamoDB node

Use the AWS DynamoDB node to automate work in AWS DynamoDB, and integrate AWS DynamoDB with other applications. n8n has built-in support for a wide range of AWS DynamoDB features, including creating, reading, updating, deleting items, and records on a database.

On this page, you'll find a list of operations the AWS DynamoDB node supports and links to more resources.

> **Credentials**
>
> Refer to [AWS credentials](https://docs.n8n.io/integrations/builtin/credentials/aws/) for guidance on setting up authentication.

## Operations

* Item
    * Create a new record, or update the current one if it already exists (upsert/put)
    * Delete an item
    * Get an item
    * Get all items

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for aws-dynamodb at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.awsdynamodb/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.awsdynamodb/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](https://docs.n8n.io/integrations/custom-operations/) for more information.