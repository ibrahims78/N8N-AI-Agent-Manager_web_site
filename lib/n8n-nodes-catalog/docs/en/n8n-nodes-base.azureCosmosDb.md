# Azure Cosmos DB node

Use the Azure Cosmos DB node to automate work in Azure Cosmos DB and integrate Azure Cosmos DB with other applications. n8n has built-in support for a wide range of Azure Cosmos DB features, which includes creating, getting, updating, and deleting containers and items.

On this page, you'll find a list of operations the Azure Cosmos DB node supports, and links to more resources.

> **Credentials**
>
> You can find authentication information for this node [here](/integrations/builtin/credentials/azurecosmosdb.md).

## Operations

* **Container**:
	* **Create**
	* **Delete**
	* **Get**
	* **Get Many**
* **Item**:
	* **Create**
	* **Delete**
	* **Get**
	* **Get Many**
	* **Execute Query**
	* **Update**

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Related resources

<!-- vale Vale.Spelling = NO -->
Refer to [Azure Cosmos DB's documentation](https://learn.microsoft.com/en-us/rest/api/cosmos-db/) for more information about the service.
<!-- vale Vale.Spelling = YES -->

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.