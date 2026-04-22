# Venafi TLS Protect Cloud node documentation

> Learn how to use the Venafi TLS Protect Cloud node in n8n. Follow technical documentation to integrate Venafi TLS Protect Cloud node into your workflows.

# Venafi TLS Protect Cloud node

Use the Venafi TLS Protect Cloud node to automate work in Venafi TLS Protect Cloud, and integrate Venafi TLS Protect Cloud with other applications. n8n has built-in support for a wide range of Venafi TLS Protect Cloud features, including deleting and downloading certificates, as well as creating certificates requests. 

On this page, you'll find a list of operations the Venafi TLS Protect Cloud node supports and links to more resources.

> **Credentials**
>
> Refer to [Venafi TLS Protect Cloud credentials](https://docs.n8n.io/integrations/builtin/credentials/venafitlsprotectcloud/) for guidance on setting up authentication.

## Operations

* Certificate
	* Delete
	* Download
	* Get
	* Get Many
	* Renew
* Certificate Request
	* Create
	* Get
	* Get Many

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for venafi-tls-protect-cloud at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.venafitlsprotectcloud/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.venafitlsprotectcloud/)

## Related resources

Refer to [Venafi's REST API documentation](https://docs.venafi.cloud/api/vaas-rest-api/) for more information on this service.

n8n also provides:
<!-- vale off -->
* A [trigger node](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.venafitlsprotectcloudtrigger/) for Venafi TLS Protect Cloud.
* A [node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.venafitlsprotectdatacenter/) for Venafi TLS Protect Datacenter.
<!-- vale on -->

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](https://docs.n8n.io/integrations/custom-operations/) for more information.