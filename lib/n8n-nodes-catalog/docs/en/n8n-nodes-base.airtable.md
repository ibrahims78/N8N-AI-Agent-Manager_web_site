# Airtable node

Use the Airtable node to automate work in Airtable, and integrate Airtable with other applications. n8n has built-in support for a wide range of Airtable features, including creating, reading, listing, updating and deleting tables.

On this page, you'll find a list of operations the Airtable node supports and links to more resources.

> **Credentials**
>
> Refer to [Airtable credentials](/integrations/builtin/credentials/airtable.md) for guidance on setting up authentication.

## Operations

* Append the data to a table
* Delete data from a table
* List data from a table
* Read data from a table
* Update data in a table

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Related resources

n8n provides a trigger node for Airtable. You can find the trigger node docs [here](/integrations/builtin/trigger-nodes/n8n-nodes-base.airtabletrigger.md).

Refer to [Airtable's documentation](https://airtable.com/developers/web/api/introduction) for more information about the service.

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.

## Node reference

### Get the Record ID

To fetch data for a particular record, you need the Record ID. There are two ways to get the Record ID.

### Create a Record ID column in Airtable

To create a `Record ID` column in your table, refer to this [article](https://support.airtable.com/docs/finding-airtable-ids). You can then use this Record ID in your Airtable node.

### Use the List operation

To get the Record ID of your record, you can use the **List** operation of the Airtable node. This operation will return the Record ID along with the fields. You can then use this Record ID in your Airtable node.

### Filter records when using the List operation

To filter records from your Airtable base, use the **Filter By Formula** option. For example, if you want to return all the users that belong to the organization `n8n`, follow the steps mentioned below:

1. Select 'List' from the **Operation** dropdown list.
2. Enter the base ID and the table name in the **Base ID** and **Table** field, respectively.
3. Click on **Add Option** and select 'Filter By Formula' from the dropdown list.
4. Enter the following formula in the **Filter By Formula** field: `{Organization}='n8n'`.

Similarly, if you want to return all the users that don't belong to the organization `n8n`, use the following formula: `NOT({Organization}='n8n')`.

Refer to the Airtable [documentation](https://support.airtable.com/hc/en-us/articles/203255215-Formula-Field-Reference) to learn more about the formulas.

## Common issues

For common errors or issues and suggested resolution steps, refer to [Common Issues](/integrations/builtin/app-nodes/n8n-nodes-base.airtable/common-issues.md).

---

# Airtable node common issues

Here are some common errors and issues with the [Airtable node](/integrations/builtin/app-nodes/n8n-nodes-base.airtable/index.md) and steps to resolve or troubleshoot them.

## Forbidden - perhaps check your credentials

This error displays when trying to perform actions not permitted by your current level of access. The full text looks something like this:

```
There was a problem loading the parameter options from server: "Forbidden - perhaps check your credentials?"
```

The error most often displays when the credential you're using doesn't have the scopes it requires on the resources you're attempting to manage.

Refer to the [Airtable credentials](/integrations/builtin/credentials/airtable.md) and [Airtables scopes documentation](https://airtable.com/developers/web/api/scopes) for more information.

## Service is receiving too many requests from you

Airtable has a hard API limit on the number of requests generated using personal access tokens.

If you send more than five requests per second per base, you will receive a 429 error, indicating that you have sent too many requests. You will have to wait 30 seconds before resuming requests. This same limit applies for sending more than 50 requests across all bases per access token.

You can find out more in the [Airtable's rate limits documentation](https://airtable.com/developers/web/api/rate-limits). If you find yourself running into rate limits with the Airtable node, consider implementing one of the suggestions on the [handling rate limits](/integrations/builtin/rate-limits.md) page.