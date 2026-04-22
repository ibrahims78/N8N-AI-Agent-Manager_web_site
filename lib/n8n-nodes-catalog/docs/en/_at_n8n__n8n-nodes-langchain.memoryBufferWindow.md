---
title: Simple Memory node documentation
description: Learn how to use the Simple Memory node in n8n. Follow technical documentation to integrate Simple Memory node into your workflows.
contentType: [integration, reference]
priority: high
---

# Simple Memory node

Use the Simple Memory node to [persist](/glossary.md#ai-memory) chat history in your workflow.

On this page, you'll find a list of operations the Simple Memory node supports, and links to more resources.

/// warning | Don't use this node if running n8n in queue mode
If your n8n instance uses [queue mode](/hosting/scaling/queue-mode.md), this node doesn't work in an active production workflow. This is because n8n can't guarantee that every call to Simple Memory will go to the same worker.
///

## Node parameters

Configure these parameters to configure the node:

* **Session Key**: Enter the key to use to store the memory in the workflow data.
* **Context Window Length**: Enter the number of previous interactions to consider for context.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Related resources

Refer to [LangChain's Buffer Window Memory documentation](https://v03.api.js.langchain.com/classes/langchain.memory.BufferWindowMemory.html) for more information about the service.

## Common issues

For common questions or issues and suggested solutions, refer to [Common issues](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.memorybufferwindow/common-issues.md).

---

# Simple Memory node common issues

Here are some common errors and issues with the [Simple Memory node](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.memorybufferwindow/index.md) and steps to resolve or troubleshoot them.

## Single memory instance

If you add more than one Simple Memory node to your workflow, all nodes access the same memory instance by default. Be careful when doing destructive actions that override existing memory contents, such as the override all messages operation in the [Chat Memory Manager](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.memorymanager.md) node. If you want more than one memory instance in your workflow, set different session IDs in different memory nodes.

## Managing the Session ID

In most cases, the `sessionId` is automatically retrieved from the **On Chat Message** trigger. But you may run into an error with the phrase `No sessionId`.

If you have this error, first check the output of your Chat trigger to ensure it includes a `sessionId`.

If you're not using the **On Chat Message** trigger, you'll need to manage sessions manually.

For testing purposes, you can use a static key like `my_test_session`. If you use this approach, be sure to set up proper session management before publishing the workflow to avoid potential issues in a live environment.