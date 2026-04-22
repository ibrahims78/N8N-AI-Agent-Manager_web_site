# Google Analytics node documentation

> Learn how to use the Google Analytics node in n8n. Follow technical documentation to integrate Google Analytics node into your workflows.

# Google Analytics node

Use the Google Analytics node to automate work in Google Analytics, and integrate Google Analytics with other applications. n8n has built-in support for a wide range of Google Analytics features, including returning reports and user activities.

On this page, you'll find a list of operations the Google Analytics node supports and links to more resources.

> **Credentials**
>
> Refer to [Google Analytics credentials](https://docs.n8n.io/integrations/builtin/credentials/google/) for guidance on setting up authentication.

> **This node can be used as an AI tool**
>
> This node can be used to enhance the capabilities of an AI agent. When used in this way, many parameters can be set automatically, or with information directed by AI - find out more in the [AI tool parameters documentation](https://docs.n8n.io/advanced-ai/examples/using-the-fromai-function/).

## Operations

* Report
    * Get
* User Activity
    * Search

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for google-analytics at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googleanalytics/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googleanalytics/)

## Related resources

Refer to [Google Analytics' documentation](https://developers.google.com/analytics) for more information about the service.

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](https://docs.n8n.io/integrations/custom-operations/) for more information.