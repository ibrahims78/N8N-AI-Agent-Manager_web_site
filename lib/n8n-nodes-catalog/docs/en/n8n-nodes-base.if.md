# If

> Documentation for the If node in n8n, a workflow automation platform. Includes guidance on usage, and links to examples.

# If

Use the If node to split a workflow conditionally based on comparison operations.

## Add conditions

Create comparison **Conditions** for your If node.

- Use the data type dropdown to select the data type and comparison operation type for your condition. For example, to filter for dates after a particular date, select **Date & Time > is after**.
- The fields and values to enter into the condition change based on the data type and comparison you select. Refer to [Available data type comparisons](#available-data-type-comparisons) for a full list of all comparisons by data type.

Select **Add condition** to create more conditions.

### Combining conditions

You can choose to keep data:

* When it meets all conditions: Create two or more conditions and select **AND** in the dropdown between them.
* When it meets any of the conditions: Create two or more conditions and select **OR** in the dropdown between them.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for if at [https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.if/](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.if/)

## Branch execution with If and Merge nodes

> **0.236.0 and below**
>
> n8n removed this execution behavior in version 1.0. This section applies to workflows using the **v0 (legacy)** workflow execution order. By default, this is all workflows built before version 1.0. You can change the execution order in your [workflow settings](/workflows/settings.md).
If you add a Merge node to a workflow containing an If node, it can result in both output data streams of the If node executing.

One data stream triggers the Merge node, which then goes and executes the other data stream.

For example, in the screenshot below there's a workflow containing an Edit Fields node, If node, and Merge node. The standard If node behavior is to execute one data stream (in the screenshot, this is the **true** output). However, due to the Merge node, both data streams execute, despite the If node not sending any data down the **false** data stream.

![Screenshot of a workflow. The workflow has an Edit Fields node, followed by an If node. It ends with a Merge node.](/api/catalog/docs/assets/n8n-nodes-base.if/if-merge-node.png)

<!-- TODO: remove once v1 is mature -->

## Related resources

Refer to [Splitting with conditionals](/flow-logic/splitting.md) for more information on using conditionals to create complex logic in n8n.

If you need more than two conditional outputs, use the [Switch node](/integrations/builtin/core-nodes/n8n-nodes-base.switch.md).

## Available data type comparisons
<!-- vale off -->
### String

String data type supports these comparisons:

- exists
- does not exist
- is empty
- is not empty
- is equal to
- is not equal to
- contains
- does not contain
- starts with
- does not start with
- ends with
- does not end with
- matches regex
- does not match regex

### Number

Number data type supports these comparisons:

- exists
- does not exist
- is empty
- is not empty
- is equal to
- is not equal to
- is greater than
- is less than
- is greater than or equal to
- is less than or equal to

### Date & Time

Date & Time data type supports these comparisons:

- exists
- does not exist
- is empty
- is not empty
- is equal to
- is not equal to
- is after
- is before
- is after or equal to
- is before or equal to

### Boolean

Boolean data type supports these comparisons:

- exists
- does not exist
- is empty
- is not empty
- is true
- is false
- is equal to
- is not equal to

### Array

Array data type supports these comparisons:

- exists
- does not exist
- is empty
- is not empty
- contains
- does not contain
- length equal to
- length not equal to
- length greater than
- length less than
- length greater than or equal to
- length less than or equal to

### Object

Object data type supports these comparisons:

- exists
- does not exist
- is empty
- is not empty

<!-- vale on -->