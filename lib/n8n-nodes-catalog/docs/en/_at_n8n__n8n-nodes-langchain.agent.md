# AI Agent node

An [AI agent](/glossary.md#ai-agent) is an autonomous system that receives data, makes rational decisions, and acts within its environment to achieve specific goals. The AI agent's environment is everything the agent can access that isn't the agent itself. This agent uses external [tools](/glossary.md#ai-tool) and APIs to perform actions and retrieve information. It can understand the capabilities of different tools and determine which tool to use depending on the task. 

> **Connect a tool**
>
> You must connect at least one tool [sub-node](/integrations/builtin/cluster-nodes/sub-nodes/index.md) to an AI Agent node.

> **Agent type**
>
> Prior to version 1.82.0, the AI Agent had a setting for working as different agent types. This has now been removed and all AI Agent nodes work as a `Tools Agent` which was the recommended and most frequently used setting. If you're working with older versions of the AI Agent in workflows or templates, as long as they were set to 'Tools Agent', they should continue to behave as intended with the updated node.

## Templates and examples
<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Related resources

Refer to [LangChain's documentation on agents](https://js.langchain.com/docs/concepts/agents/) for more information about the service.

New to AI Agents? Read the [n8n blog introduction to AI agents](https://blog.n8n.io/ai-agents/).

View n8n's [Advanced AI](/advanced-ai/index.md) documentation.

## Common issues

For common errors or issues and suggested resolution steps, refer to [Common Issues](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/common-issues.md).

---

# AI Agent node common issues

Here are some common errors and issues with the [AI Agent node](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md) and steps to resolve or troubleshoot them.

## Internal error: 400 Invalid value for 'content'

A full error message might look like this:

```
Internal error
Error: 400 Invalid value for 'content': expected a string, got null.
<stack-trace>
```

This error can occur if the **Prompt** input contains a null value.

You might see this in one of two scenarios:

1. When you've set the **Prompt** to **Define below** and have an expression in your **Text** that isn't generating a value.
    * To resolve, make sure your expressions reference valid fields and that they resolve to valid input rather than null.
2. When you've set the **Prompt** to **Connected Chat Trigger Node** and the incoming data has null values.
    * To resolve, remove any null values from the `chatInput` field of the input node.

## Error in sub-node Simple Memory

This error displays when n8n runs into an issue with the [Simple Memory](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.memorybufferwindow/index.md) sub-node.

It most often occurs when your workflow or the workflow template you copied uses an older version of the Simple memory node (previously known as "Window Buffer Memory").

Try removing the Simple Memory node from your workflow and re-adding it, which will guarantee you're using the latest version of the node.

## A Chat Model sub-node must be connected error

This error displays when n8n tries to execute the node without having a Chat Model connected.

To resolve this, click the + Chat Model button at the bottom of your screen when the node is open, or click the Chat Model + connector when the node is closed. n8n will then open a selection of possible Chat Models to pick from.

## No prompt specified error

This error occurs when the agent expects to get the prompt from the previous node automatically. Typically, this happens when you're using the [Chat Trigger Node](/integrations/builtin/core-nodes/n8n-nodes-langchain.chattrigger/index.md). 

To resolve this issue, find the **Prompt** parameter of the AI Agent node and change it from **Connected Chat Trigger Node** to **Define below**. This allows you to manually build your prompt by referencing output data from other nodes or by adding static text.

---

# Conversational AI Agent node

> **Feature removed**
>
> n8n removed this functionality in February 2025.

The Conversational Agent has human-like conversations. It can maintain context, understand user intent, and provide relevant answers. This agent is typically used for building chatbots, virtual assistants, and customer support systems.

The Conversational Agent describes [tools](/glossary.md#ai-tool) in the system prompt and parses JSON responses for tool calls. If your preferred AI model doesn't support tool calling or you're handling simpler interactions, this agent is a good general option. It's more flexible but may be less accurate than the [Tools Agent](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/tools-agent.md).

Refer to [AI Agent](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md) for more information on the AI Agent node itself.

--8<-- "_snippets/integrations/builtin/cluster-nodes/use-with-chat-trigger.md"

## Node parameters

Configure the Conversational Agent using the following parameters.

### Prompt

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/prompt.md"

### Require Specific Output Format

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/output-format.md"

## Node options

Refine the Conversational Agent node's behavior using these options:

### Human Message

Tell the agent about the tools it can use and add context to the user's input.

You must include these expressions and variable:

* `{tools}`: A LangChain expression that provides a string of the tools you've connected to the Agent. Provide some context or explanation about who should use the tools and how they should use them.
* `{format_instructions}`: A LangChain expression that provides the schema or format from the output parser node you've connected. Since the instructions themselves are context, you don't need to provide context for this expression.
* ``: A LangChain variable containing the user's prompt. This variable populates with the value of the **Prompt** parameter. Provide some context that this is the user's input.

Here's an example of how you might use these strings:

Example:

```
TOOLS
------
Assistant can ask the user to use tools to look up information that may be helpful in answering the user's original question. The tools the human can use are:

{tools}

{format_instructions}

USER'S INPUT
--------------------
Here is the user's input (remember to respond with a markdown code snippet of a JSON blob with a single action, and NOTHING else):

```

### System Message 

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/system-message.md"

### Max Iterations

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/max-iterations.md"

### Return Intermediate Steps

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/return-intermediate-steps.md"

### Tracing Metadata

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/tracing-metadata.md"

## Templates and examples

Refer to the main AI Agent node's [Templates and examples](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md#templates-and-examples) section.

## Common issues

For common questions or issues and suggested solutions, refer to [Common issues](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/common-issues.md).

---

# OpenAI Functions Agent node

Use the OpenAI Functions Agent node to use an [OpenAI functions model](https://platform.openai.com/docs/guides/function-calling). These are models that detect when a function should be called and respond with the inputs that should be passed to the function.

Refer to [AI Agent](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md) for more information on the AI Agent node itself.

--8<-- "_snippets/integrations/builtin/cluster-nodes/use-with-chat-trigger.md"

> **OpenAI Chat Model required**
>
> You must use the [OpenAI Chat Model](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatopenai/index.md) with this agent.

## Node parameters

Configure the OpenAI Functions Agent using the following parameters.

### Prompt

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/prompt.md"

### Require Specific Output Format

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/output-format.md"

## Node options

Refine the OpenAI Functions Agent node's behavior using these options:

### System Message 

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/system-message.md"

### Max Iterations

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/max-iterations.md"

### Return Intermediate Steps

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/return-intermediate-steps.md"

### Tracing Metadata

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/tracing-metadata.md"

## Templates and examples

Refer to the main AI Agent node's [Templates and examples](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md#templates-and-examples) section.

## Common issues

For common questions or issues and suggested solutions, refer to [Common issues](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/common-issues.md).

---

# Plan and Execute Agent node

The Plan and Execute Agent is like the [ReAct agent](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/react-agent.md) but with a focus on planning. It first creates a high-level plan to solve the given task and then executes the plan step by step. This agent is most useful for tasks that require a structured approach and careful planning.

Refer to [AI Agent](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md) for more information on the AI Agent node itself.

## Node parameters

Configure the Plan and Execute Agent using the following parameters.

### Prompt

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/prompt.md"

### Require Specific Output Format

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/output-format.md"

## Node options

Refine the Plan and Execute Agent node's behavior using these options:

### Human Message Template

Enter a message that n8n will send to the agent during each step execution.

Available LangChain expressions:

* `{previous_steps}`: Contains information about the previous steps the agent's already completed.
* `{current_step}`: Contains information about the current step.
* `{agent_scratchpad}`: Information to remember for the next iteration.

### Tracing Metadata

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/tracing-metadata.md"

## Templates and examples

Refer to the main AI Agent node's [Templates and examples](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md#templates-and-examples) section.

## Common issues

For common questions or issues and suggested solutions, refer to [Common issues](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/common-issues.md).

---

# ReAct AI Agent node

> **Feature removed**
>
> n8n removed this functionality in February 2025.

The ReAct Agent node implements [ReAct](https://react-lm.github.io/) logic. ReAct (reasoning and acting) brings together the reasoning powers of chain-of-thought prompting and action plan generation.

The ReAct Agent reasons about a given task, determines the necessary actions, and then executes them. It follows the cycle of reasoning and acting until it completes the task. The ReAct agent can break down complex tasks into smaller sub-tasks, prioritise them, and execute them one after the other.

Refer to [AI Agent](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md) for more information on the AI Agent node itself.

> **No memory**
>
> The ReAct agent doesn't support memory sub-nodes. This means it can't recall previous prompts or simulate an ongoing conversation.

## Node parameters

Configure the ReAct Agent using the following parameters.

### Prompt

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/prompt.md"

### Require Specific Output Format

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/output-format.md"

## Node options

Use the options to create a message to send to the agent at the start of the conversation. The message type depends on the model you're using:

* **Chat models**: These models have the concept of three components interacting (AI, system, and human). They can receive system messages and human messages (prompts).
* **Instruct models**: These models don't have the concept of separate AI, system, and human components. They receive one body of text, the instruct message.

### Human Message Template

Use this option to extend the user prompt. This is a way for the agent to pass information from one iteration to the next.

Available LangChain expressions:

* `{input}`: Contains the user prompt.
* `{agent_scratchpad}`: Information to remember for the next iteration.

### Prefix Message

Enter text to prefix the tools list at the start of the conversation. You don't need to add the list of tools. LangChain automatically adds the tools list.

### Suffix Message for Chat Model

Add text to append after the tools list at the start of the conversation when the agent uses a chat model. You don't need to add the list of tools. LangChain automatically adds the tools list.

### Suffix Message for Regular Model

Add text to append after the tools list at the start of the conversation when the agent uses a regular/instruct model. You don't need to add the list of tools. LangChain automatically adds the tools list.

### Return Intermediate Steps

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/return-intermediate-steps.md"

### Tracing Metadata

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/tracing-metadata.md"

## Related resources

Refer to LangChain's [ReAct Agents](https://js.langchain.com/docs/concepts/agents/) documentation for more information.

## Templates and examples

Refer to the main AI Agent node's [Templates and examples](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md#templates-and-examples) section.

## Common issues

For common questions or issues and suggested solutions, refer to [Common issues](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/common-issues.md).

---

# SQL AI Agent node

> **Feature removed**
>
> n8n removed this functionality in February 2025.

The SQL Agent uses a SQL database as a data source. It can understand natural language questions, convert them into SQL queries, execute the queries, and present the results in a user-friendly format. This agent is valuable for building natural language interfaces to databases.

Refer to [AI Agent](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md) for more information on the AI Agent node itself.

## Node parameters

Configure the SQL Agent using the following parameters.

### Data Source

Choose the database to use as a data source for the node. Options include:

* **MySQL**: Select this option to use a MySQL database.
    * Also select the **Credential for MySQL**.
* **SQLite**: Select this option to use a SQLite database.
    * You must add a [Read/Write File From Disk](/integrations/builtin/core-nodes/n8n-nodes-base.readwritefile.md) node before the Agent to read your SQLite file.
    * Also enter the **Input Binary Field** name of your SQLite file coming from the Read/Write File From Disk node.
* **Postgres**: Select this option to use a Postgres database.
    * Also select the **Credential for Postgres**.

> **Postgres and MySQL Agents**
>
> If you are using [Postgres](/integrations/builtin/credentials/postgres.md) or [MySQL](/integrations/builtin/credentials/mysql.md), this agent doesn't support the credential tunnel options.

### Prompt

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/prompt.md"

## Node options

Refine the SQL Agent node's behavior using these options:

### Ignored Tables

If you'd like the node to ignore any tables from the database, enter a comma-separated list of tables you'd like it to ignore.

If left empty, the agent doesn't ignore any tables.

### Include Sample Rows

Enter the number of sample rows to include in the prompt to the agent. Default is `3`.

Sample rows help the agent understand the schema of the database, but they also increase the number of tokens used.

### Included Tables

If you'd only like to include specific tables from the database, enter a comma-separated list of tables to include.

If left empty, the agent includes all tables.

### Prefix Prompt

Enter a message you'd like to send to the agent before the **Prompt** text. This initial message can provide more context and guidance to the agent about what it can and can't do, and how to format the response.

n8n fills this field with an example.

### Suffix Prompt

Enter a message you'd like to send to the agent after the **Prompt** text.

Available LangChain expressions:

* `{chatHistory}`: A history of messages in this conversation, useful for maintaining context.
* `{input}`: Contains the user prompt.
* `{agent_scratchpad}`: Information to remember for the next iteration.

n8n fills this field with an example.

### Limit

Enter the maximum number of results to return.

Default is `10`.

### Tracing Metadata

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/tracing-metadata.md"

## Templates and examples

Refer to the main AI Agent node's [Templates and examples](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md#templates-and-examples) section.

## Common issues

For common questions or issues and suggested solutions, refer to [Common issues](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/common-issues.md).

---

# Tools AI Agent node

The Tools Agent uses external [tools](/glossary.md#ai-tool) and APIs to perform actions and retrieve information. It can understand the capabilities of different tools and determine which tool to use depending on the task. This agent helps integrate LLMs with various external services and databases.

This agent has an enhanced ability to work with tools and can ensure a standard output format.

The Tools Agent implements [Langchain's tool calling](https://js.langchain.com/docs/concepts/tool_calling/) interface. This interface describes available tools and their schemas. The agent also has improved output parsing capabilities, as it passes the parser to the model as a formatting tool.

Refer to [AI Agent](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md) for more information on the AI Agent node itself.

--8<-- "_snippets/integrations/builtin/cluster-nodes/use-with-chat-trigger.md"

This agent supports the following chat models:

* [OpenAI Chat Model](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatopenai/index.md)
* [Groq Chat Model](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatgroq.md)
* [Mistral Cloud Chat Model](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatmistralcloud.md)
* [Anthropic Chat Model](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatanthropic.md)
* [Azure OpenAI Chat Model](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.lmchatazureopenai.md)

??? Details "The Tools Agent can use the following tools..."
    * [Call n8n Workflow](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolworkflow.md)
    * [Code](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolcode.md)
    * [HTTP Request](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolhttprequest.md)
    * [Action Network](/integrations/builtin/app-nodes/n8n-nodes-base.actionnetwork.md)
    * [ActiveCampaign](/integrations/builtin/app-nodes/n8n-nodes-base.activecampaign.md)
    * [Affinity](/integrations/builtin/app-nodes/n8n-nodes-base.affinity.md)
    * [Agile CRM](/integrations/builtin/app-nodes/n8n-nodes-base.agilecrm.md)
    * [Airtable](/integrations/builtin/app-nodes/n8n-nodes-base.airtable/index.md)
    * [APITemplate.io](/integrations/builtin/app-nodes/n8n-nodes-base.apitemplateio.md)
    * [Asana](/integrations/builtin/app-nodes/n8n-nodes-base.asana.md)
    * [AWS Lambda](/integrations/builtin/app-nodes/n8n-nodes-base.awslambda.md)
    * [AWS S3](/integrations/builtin/app-nodes/n8n-nodes-base.awss3.md)
    * [AWS SES](/integrations/builtin/app-nodes/n8n-nodes-base.awsses.md)
    * [AWS Textract](/integrations/builtin/app-nodes/n8n-nodes-base.awstextract.md)
    * [AWS Transcribe](/integrations/builtin/app-nodes/n8n-nodes-base.awstranscribe.md)
    * [Baserow](/integrations/builtin/app-nodes/n8n-nodes-base.baserow.md)
    * [Bubble](/integrations/builtin/app-nodes/n8n-nodes-base.bubble.md)
    * [Calculator](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolcalculator.md)
    * [ClickUp](/integrations/builtin/app-nodes/n8n-nodes-base.clickup.md)
    * [CoinGecko](/integrations/builtin/app-nodes/n8n-nodes-base.coingecko.md)
    * [Compression](/integrations/builtin/core-nodes/n8n-nodes-base.compression.md)
    * [Crypto](/integrations/builtin/core-nodes/n8n-nodes-base.crypto.md)
    * [DeepL](/integrations/builtin/app-nodes/n8n-nodes-base.deepl.md)
    * [DHL](/integrations/builtin/app-nodes/n8n-nodes-base.dhl.md)
    * [Discord](/integrations/builtin/app-nodes/n8n-nodes-base.discord/index.md)
    * [Dropbox](/integrations/builtin/app-nodes/n8n-nodes-base.dropbox.md)
    * [Elasticsearch](/integrations/builtin/app-nodes/n8n-nodes-base.elasticsearch.md)
    * [ERPNext](/integrations/builtin/app-nodes/n8n-nodes-base.erpnext.md)
    * [Facebook Graph API](/integrations/builtin/app-nodes/n8n-nodes-base.facebookgraphapi.md)
    * [FileMaker](/integrations/builtin/app-nodes/n8n-nodes-base.filemaker.md)
    * [Ghost](/integrations/builtin/app-nodes/n8n-nodes-base.ghost.md)
    * [Git](/integrations/builtin/core-nodes/n8n-nodes-base.git.md)
    * [GitHub](/integrations/builtin/app-nodes/n8n-nodes-base.github.md)
    * [GitLab](/integrations/builtin/app-nodes/n8n-nodes-base.gitlab.md)
    * [Gmail](/integrations/builtin/app-nodes/n8n-nodes-base.gmail/index.md)
    * [Google Analytics](/integrations/builtin/app-nodes/n8n-nodes-base.googleanalytics.md)
    * [Google BigQuery](/integrations/builtin/app-nodes/n8n-nodes-base.googlebigquery.md)
    * [Google Calendar](/integrations/builtin/app-nodes/n8n-nodes-base.googlecalendar/index.md)
    * [Google Chat](/integrations/builtin/app-nodes/n8n-nodes-base.googlechat.md)
    * [Google Cloud Firestore](/integrations/builtin/app-nodes/n8n-nodes-base.googlecloudfirestore.md)
    * [Google Cloud Realtime Database](/integrations/builtin/app-nodes/n8n-nodes-base.googlecloudrealtimedatabase.md)
    * [Google Contacts](/integrations/builtin/app-nodes/n8n-nodes-base.googlecontacts.md)
    * [Google Docs](/integrations/builtin/app-nodes/n8n-nodes-base.googledocs.md)
    * [Google Drive](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/index.md)
    * [Google Sheets](/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/index.md)
    * [Google Slides](/integrations/builtin/app-nodes/n8n-nodes-base.googleslides.md)
    * [Google Tasks](/integrations/builtin/app-nodes/n8n-nodes-base.googletasks.md)
    * [Google Translate](/integrations/builtin/app-nodes/n8n-nodes-base.googletranslate.md)
    * [Google Workspace Admin](/integrations/builtin/app-nodes/n8n-nodes-base.gsuiteadmin.md)
    * [Gotify](/integrations/builtin/app-nodes/n8n-nodes-base.gotify.md)
    * [Grafana](/integrations/builtin/app-nodes/n8n-nodes-base.grafana.md)
    * [GraphQL](/integrations/builtin/core-nodes/n8n-nodes-base.graphql.md)
    * [Hacker News](/integrations/builtin/app-nodes/n8n-nodes-base.hackernews.md)
    * [Home Assistant](/integrations/builtin/app-nodes/n8n-nodes-base.homeassistant.md)
    * [HubSpot](/integrations/builtin/app-nodes/n8n-nodes-base.hubspot.md)
    * [Jenkins](/integrations/builtin/app-nodes/n8n-nodes-base.jenkins.md)
    * [Jira Software](/integrations/builtin/app-nodes/n8n-nodes-base.jira.md)
    * [JWT](/integrations/builtin/core-nodes/n8n-nodes-base.jwt.md)
    * [Kafka](/integrations/builtin/app-nodes/n8n-nodes-base.kafka.md)
    * [LDAP](/integrations/builtin/core-nodes/n8n-nodes-base.ldap.md)
    * [Line](/integrations/builtin/app-nodes/n8n-nodes-base.line.md)
    * [LinkedIn](/integrations/builtin/app-nodes/n8n-nodes-base.linkedin.md)
    * [Mailcheck](/integrations/builtin/app-nodes/n8n-nodes-base.mailcheck.md)
    * [Mailgun](/integrations/builtin/app-nodes/n8n-nodes-base.mailgun.md)
    * [Mattermost](/integrations/builtin/app-nodes/n8n-nodes-base.mattermost.md)
    * [Mautic](/integrations/builtin/app-nodes/n8n-nodes-base.mautic.md)
    * [Medium](/integrations/builtin/app-nodes/n8n-nodes-base.medium.md)
    * [Microsoft Excel 365](/integrations/builtin/app-nodes/n8n-nodes-base.microsoftexcel.md)
    * [Microsoft OneDrive](/integrations/builtin/app-nodes/n8n-nodes-base.microsoftonedrive.md)
    * [Microsoft Outlook](/integrations/builtin/app-nodes/n8n-nodes-base.microsoftoutlook.md)
    * [Microsoft SQL](/integrations/builtin/app-nodes/n8n-nodes-base.microsoftsql.md)
    * [Microsoft Teams](/integrations/builtin/app-nodes/n8n-nodes-base.microsoftteams.md)
    * [Microsoft To Do](/integrations/builtin/app-nodes/n8n-nodes-base.microsofttodo.md)
    * [Monday.com](/integrations/builtin/app-nodes/n8n-nodes-base.mondaycom.md)
    * [MongoDB](/integrations/builtin/app-nodes/n8n-nodes-base.mongodb.md)
    * [MQTT](/integrations/builtin/app-nodes/n8n-nodes-base.mqtt.md)
    * [MySQL](/integrations/builtin/app-nodes/n8n-nodes-base.mysql/index.md)
    * [NASA](/integrations/builtin/app-nodes/n8n-nodes-base.nasa.md)
    * [Nextcloud](/integrations/builtin/app-nodes/n8n-nodes-base.nextcloud.md)
    * [NocoDB](/integrations/builtin/app-nodes/n8n-nodes-base.nocodb.md)
    * [Notion](/integrations/builtin/app-nodes/n8n-nodes-base.notion/index.md)
    * [Odoo](/integrations/builtin/app-nodes/n8n-nodes-base.odoo.md)
    * [OpenWeatherMap](/integrations/builtin/app-nodes/n8n-nodes-base.openweathermap.md)
    * [Pipedrive](/integrations/builtin/app-nodes/n8n-nodes-base.pipedrive.md)
    * [Postgres](/integrations/builtin/app-nodes/n8n-nodes-base.postgres/index.md)
    * [Pushover](/integrations/builtin/app-nodes/n8n-nodes-base.pushover.md)
    * [QuickBooks Online](/integrations/builtin/app-nodes/n8n-nodes-base.quickbooks.md)
    * [QuickChart](/integrations/builtin/app-nodes/n8n-nodes-base.quickchart.md)
    * [RabbitMQ](/integrations/builtin/app-nodes/n8n-nodes-base.rabbitmq.md)
    * [Reddit](/integrations/builtin/app-nodes/n8n-nodes-base.reddit.md)
    * [Redis](/integrations/builtin/app-nodes/n8n-nodes-base.redis.md)
    * [RocketChat](/integrations/builtin/app-nodes/n8n-nodes-base.rocketchat.md)
    * [S3](/integrations/builtin/app-nodes/n8n-nodes-base.s3.md)
    * [Salesforce](/integrations/builtin/app-nodes/n8n-nodes-base.salesforce.md)
    * [Send Email](/integrations/builtin/core-nodes/n8n-nodes-base.sendemail.md)
    * [SendGrid](/integrations/builtin/app-nodes/n8n-nodes-base.sendgrid.md)
    * [SerpApi (Google Search)](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolserpapi.md)
    * [Shopify](/integrations/builtin/app-nodes/n8n-nodes-base.shopify.md)
    * [Slack](/integrations/builtin/app-nodes/n8n-nodes-base.slack.md)
    * [Spotify](/integrations/builtin/app-nodes/n8n-nodes-base.spotify.md)
    * [Stripe](/integrations/builtin/app-nodes/n8n-nodes-base.stripe.md)
    * [Supabase](/integrations/builtin/app-nodes/n8n-nodes-base.supabase/index.md)
    * [Telegram](/integrations/builtin/app-nodes/n8n-nodes-base.telegram/index.md)
    * [Todoist](/integrations/builtin/app-nodes/n8n-nodes-base.todoist.md)
    * [TOTP](/integrations/builtin/core-nodes/n8n-nodes-base.totp.md)
    * [Trello](/integrations/builtin/app-nodes/n8n-nodes-base.trello.md)
    * [Twilio](/integrations/builtin/app-nodes/n8n-nodes-base.twilio.md)
    * [urlscan.io](/integrations/builtin/app-nodes/n8n-nodes-base.urlscanio.md)
    * [Vector Store](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolvectorstore.md)
    * [Webflow](/integrations/builtin/app-nodes/n8n-nodes-base.webflow.md)
    * [Wikipedia](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolwikipedia.md)
    * [Wolfram|Alpha](/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolwolframalpha.md)
    * [WooCommerce](/integrations/builtin/app-nodes/n8n-nodes-base.woocommerce.md)
    * [Wordpress](/integrations/builtin/app-nodes/n8n-nodes-base.wordpress.md)
    * [X (Formerly Twitter)](/integrations/builtin/app-nodes/n8n-nodes-base.twitter.md)
    * [YouTube](/integrations/builtin/app-nodes/n8n-nodes-base.youtube.md)
    * [Zendesk](/integrations/builtin/app-nodes/n8n-nodes-base.zendesk.md)
    * [Zoho CRM](/integrations/builtin/app-nodes/n8n-nodes-base.zohocrm.md)
    * [Zoom](/integrations/builtin/app-nodes/n8n-nodes-base.zoom.md)

## Node parameters

Configure the Tools Agent using the following parameters.

### Prompt

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/prompt.md"

### Require Specific Output Format

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/output-format.md"

## Node options

Refine the Tools Agent node's behavior using these options:

### System Message 

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/system-message.md"

### Max Iterations

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/max-iterations.md"

### Return Intermediate Steps

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/return-intermediate-steps.md"

### Tracing Metadata

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/tracing-metadata.md"

<!-- vale off -->
### Automatically Passthrough Binary Images
<!-- vale on -->

--8<-- "_snippets/integrations/builtin/cluster-nodes/langchain-root-nodes/binary-images.md"

### Enable Streaming

When enabled, the AI Agent sends data back to the user in real-time as it generates the answer. This is useful for long-running generations. This is enabled by default.

> **Streaming requirements**
>
> For streaming to work, your workflow must use a trigger that supports streaming responses, such as the [Chat Trigger](/integrations/builtin/core-nodes/n8n-nodes-langchain.chattrigger/index.md) or [Webhook](/integrations/builtin/core-nodes/n8n-nodes-base.webhook/index.md) node with **Response Mode** set to **Streaming**.

## Templates and examples

Refer to the main AI Agent node's [Templates and examples](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md#templates-and-examples) section.

## Dynamic parameters for tools with `$fromAI()`

To learn how to dynamically populate parameters for app node tools, refer to [Let AI specify tool parameters with `$fromAI()`](/advanced-ai/examples/using-the-fromai-function.md).

## Human review for tool calls

You can require human approval before the AI Agent executes specific tools. This is useful for tools that perform sensitive actions like sending messages, modifying records, or deleting data.

To add a human review step:

1. Click the tool connector on the AI Agent node.
2. In the Tools Panel, find the **Human review** section.
3. Select your preferred approval channel (Chat, Slack, Telegram, and more) and configure it.
4. Connect the tools that require approval to the human review step.

When the AI wants to use a gated tool, the workflow pauses and sends an approval request through your chosen channel. The recipient can approve (tool executes) or deny (action canceled).

For detailed setup instructions and best practices, refer to [Human-in-the-loop for AI tool calls](/advanced-ai/human-in-the-loop-tools.md).

## Common issues

For common questions or issues and suggested solutions, refer to [Common issues](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/common-issues.md).