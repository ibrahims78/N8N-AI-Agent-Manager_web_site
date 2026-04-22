# AWS Elastic Load Balancing node documentation

> Learn how to use the AWS Elastic Load Balancing node in n8n. Follow technical documentation to integrate AWS Elastic Load Balancing node into your workflows.

# AWS Elastic Load Balancing node

Use the AWS Elastic Load Balancing node to automate work in AWS ELB, and integrate AWS ELB with other applications. n8n has built-in support for a wide range of AWS ELB features, including adding, getting, removing, deleting certificates and load balancers.

On this page, you'll find a list of operations the AWS ELB node supports and links to more resources.

> **Credentials**
>
> Refer to [AWS ELB credentials](https://docs.n8n.io/integrations/builtin/credentials/aws/) for guidance on setting up authentication.

## Operations

* Listener Certificate
	* Add
	* Get Many
	* Remove
* Load Balancer
	* Create
	* Delete
	* Get
	* Get Many

This node supports creating and managing application and network load balancers. It doesn't currently support gateway load balancers.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for aws-elb at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.awselb/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.awselb/)

## Related resources

Refer to [AWS ELB's documentation](https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html) for more information on this service.

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](https://docs.n8n.io/integrations/custom-operations/) for more information.