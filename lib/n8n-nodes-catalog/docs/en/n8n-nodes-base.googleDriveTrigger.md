# Google Drive Trigger node

[Google Drive](https://drive.google.com) is a file storage and synchronization service developed by Google. It allows users to store files on their servers, synchronize files across devices, and share files.

> **Credentials**
>
> You can find authentication information for this node [here](/integrations/builtin/credentials/google/index.md).

> **Examples and templates**
>
> For usage examples and templates to help you get started, refer to n8n's [Google Drive Trigger integrations](https://n8n.io/integrations/google-drive-trigger/) page.

> **Manual Executions vs. Activation**
>
> On manual executions this node will return the last event matching its search criteria. If no event matches the criteria (for example because you are watching for files to be created but no files have been created so far), an error is thrown. Once saved and activated, the node will regularly check for any matching events and will trigger your workflow for each event found.

## Common issues

For common questions or issues and suggested solutions, refer to [Common issues](/integrations/builtin/trigger-nodes/n8n-nodes-base.googledrivetrigger/common-issues.md).

---

# Google Drive Trigger node common issues

Here are some common errors and issues with the [Google Drive Trigger node](/integrations/builtin/trigger-nodes/n8n-nodes-base.googledrivetrigger/index.md) and steps to resolve or troubleshoot them.

## 401 unauthorized error

The full text of the error looks like this:
<!--vale off-->
```
401 - {"error":"unauthorized_client","error_description":"Client is unauthorized to retrieve access tokens using this method, or client not authorized for any of the scopes requested."}
```
<!--vale on-->

This error occurs when there's an issue with the credential you're using and its scopes or permissions.

To resolve:

1. For [OAuth2](/integrations/builtin/credentials/google/oauth-single-service.md) credentials, make sure you've enabled the Google Drive API in **APIs & Services > Library**. Refer to [Google OAuth2 Single Service - Enable APIs](/integrations/builtin/credentials/google/oauth-single-service.md#enable-apis) for more information.
2. For [Service Account](/integrations/builtin/credentials/google/service-account.md) credentials:
    1. [Enable domain-wide delegation](/integrations/builtin/credentials/google/service-account.md#enable-domain-wide-delegation).
    2. Make sure you add the Google Drive API as part of the domain-wide delegation configuration.

## Handling more than one file change

The Google Drive Trigger node polls Google Drive for changes at a set interval (once every minute by default).

If multiple changes to the **Watch For** criteria occur during the polling interval, a single Google Drive Trigger event occurs containing the changes as items. To handle this, your workflow must account for times when the data might contain more than one item.

You can use an [if node](/integrations/builtin/core-nodes/n8n-nodes-base.if.md) or a [switch node](/integrations/builtin/core-nodes/n8n-nodes-base.switch.md) to change your workflow's behavior depending on whether the data from the Google Drive Trigger node contains a single item or multiple items.