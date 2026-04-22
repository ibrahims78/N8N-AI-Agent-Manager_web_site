# AWS Comprehend node documentation

> Learn how to use the AWS Comprehend node in n8n. Follow technical documentation to integrate AWS Comprehend node into your workflows.

# AWS Comprehend node

Use the AWS Comprehend node to automate work in AWS Comprehend, and integrate AWS Comprehend with other applications. n8n has built-in support for a wide range of AWS Comprehend features, including identifying and analyzing texts.

On this page, you'll find a list of operations the AWS Comprehend node supports and links to more resources.

> **Credentials**
>
> Refer to [AWS Comprehend credentials](/integrations/builtin/credentials/aws.md) for guidance on setting up authentication.

## Operations

**Text**

- Identify the dominant language
- Analyse the sentiment of the text

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for aws-comprehend at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.awscomprehend/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.awscomprehend/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io//) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.