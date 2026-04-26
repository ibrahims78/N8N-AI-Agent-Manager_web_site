# Alibaba Cloud Chat Model node documentation

> The Alibaba Cloud Chat Model node sends prompts to Alibaba Cloud's conversational models (for advanced AI chains). This page explains how to configure the node in n8n workflows and covers common uses such as generating chat responses, tweaking sampling parameters (temperature, top_p), and limiting output length.

# Alibaba Cloud chat model node

The Alibaba Cloud Chat Model node sends chat prompts to Alibaba Cloud's conversational models, for advanced AI chains and LangChain integrations. Use it to generate conversational responses, integrate model outputs into workflows, or run prompts with custom sampling, retry, and timeout settings.

> **Credentials**
>
> You can find authentication information for this node [here](https://docs.n8n.io/integrations/builtin/credentials/alibaba/).

> **Parameter resolution in sub-nodes**
>
> Sub-nodes behave differently to other nodes when processing multiple items using an expression.
> 
> Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `` resolves to each name in turn.
> 
> In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `` always resolves to the first name.

## Operations

### Generate chat response

Generate a chat-style response from the selected Alibaba Cloud model.

**Parameters**

- **Model** (type: _options_, field: `model`): The model that generates the completion. Learn more about available models on Alibaba Cloud: [Alibaba Cloud Model Studio — Models](https://www.alibabacloud.com/help/en/model-studio/getting-started/models){:target="_blank" .external-link}.

**Options**

- **Frequency Penalty** (type: _number_, field: `frequencyPenalty`): Positive values penalize new tokens based on how often they appear so far, decreasing the model's likelihood to repeat the same line verbatim. Default: `0`.
- **Maximum Number of Tokens** (type: _number_, field: `maxTokens`): The maximum number of tokens to generate in the completion. The limit depends on the selected model. A value of minus one uses the model's default limit. Default: `-1`.
- **Response Format** (type: _options_, field: `responseFormat`): The output format returned by the node, for example plain text or structured formats. Default: text.
- **Presence Penalty** (type: _number_, field: `presencePenalty`): Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to discuss new topics. Default: `0`.
- **Sampling Temperature** (type: _number_, field: `temperature`): Control randomness. Lower values make output less random, near zero is deterministic. Default: `0.7`.
- **Timeout** (type: _number_, field: `timeout`): Maximum time (in milliseconds) allowed for a request before it's aborted. Default: `360000`.
- **Max Retries** (type: _number_, field: `maxRetries`): Maximum number of retry attempts for failed requests. Default: `2`.
- **Top P** (type: _number_, field: `topP`): Nucleus sampling parameter that controls diversity. 0.5 means half of the probability mass is considered. Adjust **Top P** or **Sampling Temperature**, but not both. Default: `1`.

## Templates and examples

> **🔗 Templates & examples:** browse ready-made workflows for alibaba-cloud-chat-model at [https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatalibabacloud/](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatalibabacloud/)

## Related resources

Refer to [Alibaba Cloud Model Studio — Models](https://www.alibabacloud.com/help/en/model-studio/getting-started/models){:target="_blank" .external-link} for more information about available models and their capabilities.