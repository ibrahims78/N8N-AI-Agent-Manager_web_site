# Facebook Trigger node

[Facebook](https://www.facebook.com/) is a social networking site to connect and share with family and friends online.

Use the Facebook Trigger node to trigger a workflow when events occur in Facebook.

> **Credentials**
>
> You can find authentication information for this node [here](/integrations/builtin/credentials/facebookapp.md).

> **Examples and templates**
>
> For usage examples and templates to help you get started, refer to n8n's [Facebook Trigger integrations](https://n8n.io/integrations/facebook-trigger/) page.

## Objects

- [**Ad Account**](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/ad-account.md): Get updates for certain ads changes.
- [**Application**](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/application.md): Get updates sent to the application.
- [**Certificate Transparency**](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/certificate-transparency.md): Get updates when new security certificates are generated for your subscribed domains, including new certificates and potential phishing attempts.
- Activity and events in a [**Group**](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/group.md)
- [**Instagram**](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/instagram.md): Get updates when someone comments on the Media objects of your app users; @mentions your app users; or when Stories of your app users expire.
- [**Link**](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/link.md): Get updates about the links for rich previews by an external provider
- [**Page**](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/page.md) updates
- [**Permissions**](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/permissions.md): Updates when granting or revoking permissions
- [**User**](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/user.md) profile updates
- [**WhatsApp Business Account**](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/whatsapp.md)
    
    > **Use WhatsApp Trigger**
>
> n8n recommends using the [WhatsApp Trigger node](/integrations/builtin/trigger-nodes/n8n-nodes-base.whatsapptrigger.md) with the [WhatsApp credentials](/integrations/builtin/credentials/whatsapp.md) instead of the Facebook Trigger node for these events. The WhatsApp Trigger node has more events to listen to.
>     ///
> 
> - [**Workplace Security**](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/workplace-security.md)
> 
> For each **Object**, use the **Field Names or IDs** dropdown to select more details on what data to receive. Refer to the linked pages for more details.
> 
> ## Related resources
> 
> View [example workflows and related content](https://n8n.io/integrations/facebook-trigger/) on n8n's website.
> 
> Refer to Meta's [Graph API documentation](https://developers.facebook.com/docs/graph-api/webhooks/reference) for details about their API.
> 
> 
> 
> # Facebook Trigger Application object
> 
> Use this object to receive updates sent to a specific app. Refer to [Facebook Trigger](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/index.md) for more information on the trigger itself. note | Credentials
You can find authentication information for this node [here](/integrations/builtin/credentials/facebookapp.md).
///

> **Examples and templates**
>
> For usage examples and templates to help you get started, refer to n8n's [Facebook Trigger integrations](https://n8n.io/integrations/facebook-trigger/) page.

## Trigger configuration

To configure the trigger with this Object:

1. Select the **Credential to connect with**. Select an existing or create a new [Facebook App credential](/integrations/builtin/credentials/facebookapp.md).
1. Enter the **APP ID** of the app connected to your credential. Refer to the [Facebook App credential](/integrations/builtin/credentials/facebookapp.md) documentation for more information.
1. Select **Application** as the **Object**.
1. **Field Names or IDs**: By default, the node will trigger on all the available events using the `*` wildcard filter. If you'd like to limit the events, use the `X` to remove the star and use the dropdown or an expression to select the updates you're interested in. Options include:
    * **Add Account**
    * **Ads Rules Engine**
    * **Async Requests**
    * **Async Sessions**    
    * **Group Install**
    * **Oe Reseller Onboarding Request Created**
    * **Plugin Comment**
    * **Plugin Comment Reply**
1. In **Options**, turn on the toggle to **Include Values**. This Object type fails without the option enabled.

## Related resources

Refer to Meta's [Application](https://developers.facebook.com/docs/graph-api/webhooks/reference/application/) Graph API reference for more information.

# Facebook Trigger Group object

Use this object to receive updates about activities and events in a group. Refer to [Facebook Trigger](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/index.md) for more information on the trigger itself.

> **Credentials**
>
> You can find authentication information for this node [here](/integrations/builtin/credentials/facebookapp.md).

> **Examples and templates**
>
> For usage examples and templates to help you get started, refer to n8n's [Facebook Trigger integrations](https://n8n.io/integrations/facebook-trigger/) page.

## Trigger configuration

To configure the trigger with this Object:

1. Select the **Credential to connect with**. Select an existing or create a new [Facebook App credential](/integrations/builtin/credentials/facebookapp.md).
1. Enter the **APP ID** of the app connected to your credential. Refer to the [Facebook App credential](/integrations/builtin/credentials/facebookapp.md) documentation for more information.
1. Select **Group** as the **Object**.
1. **Field Names or IDs**: By default, the node will trigger on all the available events using the `*` wildcard filter. If you'd like to limit the events, use the `X` to remove the star and use the dropdown or an expression to select the updates you're interested in.
1. In **Options**, turn on the toggle to **Include Values**. This Object type fails without the option enabled.

## Related resources

Refer to Meta's [Groups](https://developers.facebook.com/docs/workplace/reference/webhooks/#groups) Workplace API reference for more information.

# Facebook Trigger Link object

Use this object to receive updates about links for rich previews by an external provider. Refer to [Facebook Trigger](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/index.md) for more information on the trigger itself.

> **Credentials**
>
> You can find authentication information for this node [here](/integrations/builtin/credentials/facebookapp.md).

> **Examples and templates**
>
> For usage examples and templates to help you get started, refer to n8n's [Facebook Trigger integrations](https://n8n.io/integrations/facebook-trigger/) page.

## Trigger configuration

To configure the trigger with this Object:

1. Select the **Credential to connect with**. Select an existing or create a new [Facebook App credential](/integrations/builtin/credentials/facebookapp.md).
1. Enter the **APP ID** of the app connected to your credential. Refer to the [Facebook App credential](/integrations/builtin/credentials/facebookapp.md) documentation for more information.
1. Select **Link** as the **Object**.
1. **Field Names or IDs**: By default, the node will trigger on all the available events using the `*` wildcard filter. If you'd like to limit the events, use the `X` to remove the star and use the dropdown or an expression to select the updates you're interested in.
1. In **Options**, turn on the toggle to **Include Values**. This Object type fails without the option enabled.

## Related resources

Refer to Meta's [Links](https://developers.facebook.com/docs/workplace/reference/webhooks/#links) Workplace API reference for more information.

# Facebook Trigger Permissions object

Use this object to receive updates when a user grants or revokes a permission for your app. Refer to [Facebook Trigger](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/index.md) for more information on the trigger itself.

> **Credentials**
>
> You can find authentication information for this node [here](/integrations/builtin/credentials/facebookapp.md).

> **Examples and templates**
>
> For usage examples and templates to help you get started, refer to n8n's [Facebook Trigger integrations](https://n8n.io/integrations/facebook-trigger/) page.

## Trigger configuration

To configure the trigger with this Object:

1. Select the **Credential to connect with**. Select an existing or create a new [Facebook App credential](/integrations/builtin/credentials/facebookapp.md).
1. Enter the **APP ID** of the app connected to your credential. Refer to the [Facebook App credential](/integrations/builtin/credentials/facebookapp.md) documentation for more information.
1. Select **Permissions** as the **Object**.
1. **Field Names or IDs**: By default, the node will trigger on all the available events using the `*` wildcard filter. If you'd like to limit the events, use the `X` to remove the star and use the dropdown or an expression to select the updates you're interested in.
1. In **Options**, choose whether to turn on the toggle to **Include Values**. When turned on, the node includes the new values for the changes.

## Related resources

Refer to Meta's [Permissions](https://developers.facebook.com/docs/graph-api/webhooks/reference/permissions/) Graph API reference for more information.

# Facebook Trigger WhatsApp Business Account object

Use this object to receive updates when your WhatsApp Business Account (WABA) changes. Refer to [Facebook Trigger](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/index.md) for more information on the trigger itself.

> **Use WhatsApp trigger**
>
> n8n recommends using the [WhatsApp Trigger node](/integrations/builtin/trigger-nodes/n8n-nodes-base.whatsapptrigger.md) with the [WhatsApp credentials](/integrations/builtin/credentials/whatsapp.md) instead of the Facebook Trigger node. That trigger node includes twice the events to subscribe to.

> **Credentials**
>
> You can find authentication information for this node [here](/integrations/builtin/credentials/facebookapp.md).

> **Examples and templates**
>
> For usage examples and templates to help you get started, refer to n8n's [Facebook Trigger integrations](https://n8n.io/integrations/facebook-trigger/) page.

## Prerequisites

This Object requires some configuration in your app and WhatsApp account before you can use the trigger:

1. Subscribe your app under your WhatsApp business account. You must subscribe an app owned by your business. Apps shared with your business can't receive webhook notifications.
1. If you are working as a Solution Partner, make sure your app has completed App Review and requested the `whatsapp_business_management` permission.

## Trigger configuration

To configure the trigger with this Object:

1. Select the **Credential to connect with**. Select an existing or create a new [Facebook App credential](/integrations/builtin/credentials/facebookapp.md).
1. Enter the **APP ID** of the app connected to your credential. Refer to the [Facebook App credential](/integrations/builtin/credentials/facebookapp.md) documentation for more information.
1. Select **WhatsApp Business Account** as the **Object**.
1. **Field Names or IDs**: By default, the node will trigger on all the available events using the `*` wildcard filter. If you'd like to limit the events, use the `X` to remove the star and use the dropdown or an expression to select the updates you're interested in. Options include:
    * **Message Template Status Update**
    * **Phone Number Name Update**
    * **Phone Number Quality Update**
    * **Account Review Update**
    * **Account Update**
1. In **Options**, turn on the toggle to **Include Values**. This Object type fails without the option enabled.

Refer to [Webhooks for WhatsApp Business Accounts](https://developers.facebook.com/docs/graph-api/webhooks/getting-started/webhooks-for-whatsapp) and Meta's [WhatsApp Business Account](https://developers.facebook.com/docs/graph-api/webhooks/reference/whatsapp-business-account/) Graph API reference for more information.

---

# Facebook Trigger Workplace Security object

Use this object to receive updates when Workplace security events occur, like adding or removing admins, users joining or leaving a Workplace, and more. Refer to [Facebook Trigger](/integrations/builtin/trigger-nodes/n8n-nodes-base.facebooktrigger/index.md) for more information on the trigger itself.

> **Credentials**
>
> You can find authentication information for this node [here](/integrations/builtin/credentials/facebookapp.md).

> **Examples and templates**
>
> For usage examples and templates to help you get started, refer to n8n's [Facebook Trigger integrations](https://n8n.io/integrations/facebook-trigger/) page.

## Trigger configuration

To configure the trigger with this Object:

1. Select the **Credential to connect with**. Select an existing or create a new [Facebook App credential](/integrations/builtin/credentials/facebookapp.md).
1. Enter the **APP ID** of the app connected to your credential. Refer to the [Facebook App credential](/integrations/builtin/credentials/facebookapp.md) documentation for more information.
1. Select **Workplace Security** as the **Object**.
1. **Field Names or IDs**: By default, the node will trigger on all the available events using the `*` wildcard filter. If you'd like to limit the events, use the `X` to remove the star and use the dropdown or an expression to select the updates you're interested in.
1. In **Options**, turn on the toggle to **Include Values**. This Object type fails without the option enabled.

## Related resources

Refer to Meta's [Security](https://developers.facebook.com/docs/workplace/reference/webhooks/#security) Workplace API reference for more information.