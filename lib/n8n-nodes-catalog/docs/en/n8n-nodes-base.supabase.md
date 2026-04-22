# Supabase node

Use the Supabase node to automate work in Supabase, and integrate Supabase with other applications. n8n has built-in support for a wide range of Supabase features, including creating, deleting, and getting rows. 

On this page, you'll find a list of operations the Supabase node supports and links to more resources.

> **Credentials**
>
> Refer to [Supabase credentials](/integrations/builtin/credentials/supabase.md) for guidance on setting up authentication.

> **This node can be used as an AI tool**
>
> This node can be used to enhance the capabilities of an AI agent. When used in this way, many parameters can be set automatically, or with information directed by AI - find out more in the [AI tool parameters documentation](/advanced-ai/examples/using-the-fromai-function.md).

## Operations

* Row
    * Create a new row
    * Delete a row
    * Get a row
    * Get all rows
    * Update a row

## Using custom schemas

By default, the Supabase node only fetches the `public` schema. To fetch [custom schemas](https://supabase.com/docs/guides/api/using-custom-schemas), enable **Use Custom Schema**.

In the new **Schema** field, provide the custom schema the Supabase node should use.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.

## Common issues

For common errors or issues and suggested resolution steps, refer to [Common issues](/integrations/builtin/app-nodes/n8n-nodes-base.supabase/common-issues.md).