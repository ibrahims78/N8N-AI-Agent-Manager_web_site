---
title: Structured Output Parser node documentation
description: Learn how to use the Structured Output Parser node in n8n. Follow technical documentation to integrate Structured Output Parser node into your workflows.
contentType: [integration, reference]
priority: high
---

# Structured Output Parser node

Use the Structured Output Parser node to return fields based on a JSON Schema.

On this page, you'll find the node parameters for the Structured Output Parser node, and links to more resources.

## Node parameters

* **Schema Type**: Define the output structure and validation. You have two options to provide the schema:

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Related resources

Refer to [LangChain's output parser documentation](https://js.langchain.com/docs/concepts/output_parsers) for more information about the service.

## Common issues

For common questions or issues and suggested solutions, refer to [Common issues](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.outputparserstructured/common-issues.md).

---

# Structured Output Parser node common issues

Here are some common errors and issues with the [Structured Output Parser node](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.outputparserstructured/index.md) and steps to resolve or troubleshoot them.

## Processing parameters

The Structured Output Parser node is a [sub-node](/glossary.md#sub-node-n8n). Sub-nodes behave differently than other nodes when processing multiple items using expressions.

Most nodes, including [root nodes](/glossary.md#root-node-n8n), take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five name values, the expression `` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five name values, the expression `` always resolves to the first name.

## Adding the structured output parser node to AI nodes

You can attach output parser nodes to select [AI root nodes](/integrations/builtin/cluster-nodes/root-nodes/index.md).

To add the Structured Output Parser to a node, enable the **Require Specific Output Format** option in the AI root node you wish to format. Once the option is enabled, a new **output parser** attachment point is displayed. Click the **output parser** attachment point to add the Structured Output Parser node to the node.

## Using the structured output parser to format intermediary steps

The Structured Output Parser node structures the final output from AI agents. It's not intended to structure intermediary output to pass to other AI tools or stages.

To request a specific format for intermediary output, include the response structure in the **System Message** for the **AI Agent**. The message can include either a schema or example response for the agent to use as a template for its results.

## Structuring output from agents

Structured output parsing is often not reliable when working with [agents](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md).

If your workflow uses agents, n8n recommends using a separate [LLM-chain](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.chainllm.md) to receive the data from the agent and parse it. This leads to better, more consistent results than parsing directly in the agent workflow.