# Chat Memory Manager node

The Chat Memory Manager node manages chat message [memories](/glossary.md#ai-memory) within your workflows. Use this node to load, insert, and delete chat messages in an in-memory [vector store](/glossary.md#ai-vector-store).

This node is useful when you:

* Can't add a memory node directly.
* Need to do more complex memory management, beyond what the memory nodes offer. For example, you can add this node to check the memory size of the Agent node's response, and reduce it if needed.
* Want to inject messages to the AI that look like user messages, to give the AI more context.

On this page, you'll find a list of operations that the Chat Memory Manager node supports, along with links to more resources.

> **Parameter resolution in sub-nodes**
>
> Sub-nodes behave differently to other nodes when processing multiple items using an expression.
> 
> Most nodes, including root nodes, take any number of items as input, process these items, and output the results. You can use expressions to refer to input items, and the node resolves the expression for each item in turn. For example, given an input of five `name` values, the expression `` resolves to each name in turn.
> 
> In sub-nodes, the expression always resolves to the first item. For example, given an input of five `name` values, the expression `` always resolves to the first name.

## Node parameters

* **Operation Mode**: Choose between **Get Many Messages**, **Insert Messages**, and **Delete Messages** operations.
* **Insert Mode**: Available in **Insert Messages** mode. Choose from:
    * **Insert Messages**: Insert messages alongside existing messages.
    * **Override All Messages**: Replace current memory.
* **Delete Mode**: available in **Delete Messages** mode. Choose from:
    * **Last N**: Delete the last N messages.
    * **All Messages**: Delete messages from memory.
* **Chat Messages**: available in **Insert Messages** mode. Define the chat messages to insert into the memory, including:
	* **Type Name or ID**: Set the message type. Select one of:
		* **AI**: Use this for messages from the AI.
		* **System**: Add a message containing instructions for the AI.
		* **User**: Use this for messages from the user. This message type is sometimes called the 'human' message in other AI tools and guides.
	* **Message**: Enter the message contents.
	* **Hide Message in Chat**: Select whether n8n should display the message to the user in the chat UI (turned off) or not (turned on).
* **Messages Count**: Available in **Delete Messages** mode when you select **Last N**. Enter the number of latest messages to delete.
* **Simplify Output**: Available in **Get Many Messages** mode. Turn on to simplify the output to include only the sender (AI, user, or system) and the text.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Related resources

Refer to [LangChain's Memory documentation](https://langchain-ai.github.io/langgraphjs/concepts/memory/) for more information about the service.

View n8n's [Advanced AI](/advanced-ai/index.md) documentation.