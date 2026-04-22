# Okta node documentation

> Learn how to use the Okta node in n8n. Follow technical documentation to integrate Okta node into your workflows.

# Okta node

Use the Okta node to automate work in Okta and integrate Okta with other applications. n8n has built-in support for a wide range of Okta features, which includes creating, updating, and deleting users.

On this page, you'll find a list of operations the Okta node supports, and links to more resources.

> **Credentials**
>
> You can find authentication information for this node [here](/integrations/builtin/credentials/okta.md).

## Operations

- User
    - Create a new user
    - Delete an existing user
    - Get details of a user
    - Get many users
    - Update an existing user

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> _(templates widget — view live at [docs.n8n.io](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.okta/))_

## Related resources

<!-- add a link to the service's documentation. This should usually go direct to the API docs -->
Refer to [Okta's documentation](https://developer.okta.com/docs/guides/) for more information about the service.

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io//) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.