# Structured Output Parser node documentation

> Learn how to use the Structured Output Parser node in n8n. Follow technical documentation to integrate Structured Output Parser node into your workflows.

# Structured Output Parser node

Use the Structured Output Parser node to return fields based on a JSON Schema.

On this page, you'll find the node parameters for the Structured Output Parser node, and links to more resources.

> **Parameter resolution in sub-nodes**
>
> Sub-nodes behave differently to other nodes when processing multiple items using an expression.
> 
> Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `` resolves to each name in turn.
> 
> In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `` always resolves to the first name.

## Node parameters

* **Schema Type**: Define the output structure and validation. You have two options to provide the schema:

1. **Generate from JSON Example**: Input an example JSON object to automatically generate the schema. The node uses the object property types and names. It ignores the actual values. n8n treats every field as mandatory when generating schemas from JSON examples.
2. **Define using JSON Schema**: Manually input the JSON schema. Read the JSON Schema [guides and examples](https://json-schema.org/learn/miscellaneous-examples) for help creating a valid JSON schema. Please note that we don't support references (using `$ref`) in JSON schemas.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for structured-output-parser at [https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.outputparserstructured/](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.outputparserstructured/)

## Related resources

Refer to [LangChain's output parser documentation](https://js.langchain.com/docs/concepts/output_parsers) for more information about the service.

View n8n's [Advanced AI](/advanced-ai/index.md) documentation.

## Common issues

For common questions or issues and suggested solutions, refer to [Common issues](https://docs.n8n.io/n8n-nodes-langchain.outputparserstructured/common-issues/).

---

<!-- sibling:common-issues.md -->
## Common Issues

# Structured Output Parser node common issues

Here are some common errors and issues with the [Structured Output Parser node](https://docs.n8n.io/n8n-nodes-langchain.outputparserstructured/) and steps to resolve or troubleshoot them.

## Processing parameters

The Structured Output Parser node is a [sub-node](/glossary.md#sub-node-n8n). Sub-nodes behave differently than other nodes when processing multiple items using expressions.

Most nodes, including [root nodes](/glossary.md#root-node-n8n), take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five name values, the expression `` resolves to each name in turn.

In sub-nodes, the expression always resolves to the first item. For example, given an input of five name values, the expression `` always resolves to the first name.

## Adding the structured output parser node to AI nodes

You can attach output parser nodes to select [AI root nodes](https://docs.n8n.io//).

To add the Structured Output Parser to a node, enable the **Require Specific Output Format** option in the AI root node you wish to format. Once the option is enabled, a new **output parser** attachment point is displayed. Click the **output parser** attachment point to add the Structured Output Parser node to the node.

## Using the structured output parser to format intermediary steps

The Structured Output Parser node structures the final output from AI agents. It's not intended to structure intermediary output to pass to other AI tools or stages.

To request a specific format for intermediary output, include the response structure in the **System Message** for the **AI Agent**. The message can include either a schema or example response for the agent to use as a template for its results.

## Structuring output from agents

Structured output parsing is often not reliable when working with [agents](https://docs.n8n.io/n8n-nodes-langchain.agent/).

If your workflow uses agents, n8n recommends using a separate [LLM-chain](https://docs.n8n.io/n8n-nodes-langchain.chainllm/) to receive the data from the agent and parse it. This leads to better, more consistent results than parsing directly in the agent workflow.