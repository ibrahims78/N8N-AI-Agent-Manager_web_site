# TheHive node

Use the TheHive node to automate work in TheHive, and integrate TheHive with other applications. n8n has built-in support for a wide range of TheHive features, including creating alerts, counting tasks logs, cases, and observables. 

On this page, you'll find a list of operations the TheHive node supports and links to more resources.

> **TheHive and TheHive 5**
>
> n8n provides two nodes for TheHive. Use this node (TheHive) if you want to use TheHive's version 3 or 4 API. If you want to use version 5, use [TheHive 5](/integrations/builtin/app-nodes/n8n-nodes-base.thehive5.md).
> **Credentials**
>
> Refer to [TheHive credentials](/integrations/builtin/credentials/thehive.md) for guidance on setting up authentication.

## Operations

The available operations depend on your API version. To see the operations list, create your credentials, including selecting your API version. Then return to the node, select the resource you want to use, and n8n displays the available operations for your API version. 

* Alert
* Case
* Log
* Observable
* Task

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.

## Related resources

n8n provides a trigger node for TheHive. You can find the trigger node docs [here](/integrations/builtin/trigger-nodes/n8n-nodes-base.thehivetrigger.md).

Refer to TheHive's documentation for more information about the service:

* [Version 3](https://docs.thehive-project.org/thehive/legacy/thehive3/api/)
* [Version 4](https://docs.thehive-project.org/cortex/api/api-guide/)