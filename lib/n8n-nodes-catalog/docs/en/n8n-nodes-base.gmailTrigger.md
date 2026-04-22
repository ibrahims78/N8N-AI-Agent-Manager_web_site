---
title: Gmail Trigger node documentation
description: Learn how to use the Gmail Trigger node in n8n. Follow technical documentation to integrate Gmail Trigger node into your workflows.
contentType: [integration, reference]
priority: high
---

# Gmail Trigger node

[Gmail](https://www.gmail.com) is an email service developed by Google. The Gmail Trigger node can start a workflow based on events in Gmail.

/// note | Credentials
You can find authentication information for this node [here](/integrations/builtin/credentials/google/index.md).
///

///  note  | Examples and templates
For usage examples and templates to help you get started, refer to n8n's [Gmail Trigger integrations](https://n8n.io/integrations/gmail-trigger/) page.
///

## Events

* **Message Received**: The node triggers for new messages at the selected **Poll Time**.

## Node parameters

Configure the node with these parameters:

* **Credential to connect with**: Select or create a new Google credential to use for the trigger. Refer to [Google credentials](/integrations/builtin/credentials/google/index.md) for more information on setting up a new credential.
* **Poll Times**: Select a poll **Mode** to set how often to trigger the poll. Your **Mode** selection will add or remove relevant fields. Refer to [Poll Mode options](/integrations/builtin/trigger-nodes/n8n-nodes-base.gmailtrigger/poll-mode-options.md) to configure the parameters for each mode type.
* **Simplify**: Choose whether to return a simplified version of the response (turned on, default) or the raw data (turned off).
    * The simplified version returns email message IDs, labels, and email headers, including: From, To, CC, BCC, and Subject.

## Node filters

Use these filters to further refine the node's behavior:

* **Include Spam and Trash**: Select whether the node should trigger on new messages in the Spam and Trash folders (turned on) or not (turned off).
* **Label Names or IDs**: Only trigger on messages with the selected labels added to them. Select the Label names you want to apply or enter an expression to specify IDs. The dropdown populates based on the **Credential** you selected.
* **Search**: Enter Gmail search refine filters, like `from:`, to trigger the node on the filtered conditions only. Refer to [Refine searches in Gmail](https://support.google.com/mail/answer/7190?hl=en) for more information.
* **Read Status**: Choose whether to receive **Unread and read emails**, **Unread emails only** (default), or **Read emails only**.
* **Sender**: Enter an email or a part of a sender name to trigger only on messages from that sender.

## Related resources

n8n provides an app node for Gmail. You can find the node docs [here](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/index.md).

View [example workflows and related content](https://n8n.io/integrations/gmail-trigger/) on n8n's website.

Refer to [Google's Gmail API documentation](https://developers.google.com/gmail/api/guides) for details about their API.

## Common issues

For common questions or issues and suggested solutions, refer to [Common issues](/integrations/builtin/trigger-nodes/n8n-nodes-base.gmailtrigger/common-issues.md).

---

# Gmail Trigger node common issues

Here are some common errors and issues with the [Gmail Trigger node](/integrations/builtin/trigger-nodes/n8n-nodes-base.gmailtrigger/index.md) and steps to resolve or troubleshoot them.

## 401 unauthorized error

The full text of the error looks like this:
<!--vale off-->
```
401 - {"error":"unauthorized_client","error_description":"Client is unauthorized to retrieve access tokens using this method, or client not authorized for any of the scopes requested."}
```
<!--vale on-->

This error occurs when there's an issue with the credential you're using and its scopes or permissions.

To resolve:

1. For [OAuth2](/integrations/builtin/credentials/google/oauth-single-service.md) credentials, make sure you've enabled the Gmail API in **APIs & Services > Library**. Refer to [Google OAuth2 Single Service - Enable APIs](/integrations/builtin/credentials/google/oauth-single-service.md#enable-apis) for more information.
2. For [Service Account](/integrations/builtin/credentials/google/service-account.md) credentials:
    1. [Enable domain-wide delegation](/integrations/builtin/credentials/google/service-account.md#enable-domain-wide-delegation).
    2. Make sure you add the Gmail API as part of the domain-wide delegation configuration.

---

# Gmail Trigger node Poll Mode options

Use the [Gmail Trigger node's](/integrations/builtin/trigger-nodes/n8n-nodes-base.gmailtrigger/index.md) **Poll Time** parameter to set how often to trigger the poll. Your **Mode** selection will add or remove relevant fields.

## Poll mode options

Refer to the sections below for details on using each **Mode**.

--8<-- "_snippets/integrations/builtin/poll-modes.md"