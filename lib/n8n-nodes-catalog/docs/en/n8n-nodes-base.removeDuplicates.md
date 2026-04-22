# Remove Duplicates node

Use the Remove Duplicates node to identify and delete items that are:

* identical across all fields or a subset of fields in a single execution
* identical to or surpassed by items seen in previous executions

This is helpful in situations where you can end up with duplicate data, such as a user creating multiple accounts, or a customer submitting the same order multiple times. When working with large datasets it becomes more difficult to spot and remove these items.

By comparing against data from previous executions, the Remove Duplicates node can  delete items seen in earlier executions. It can also ensure that new items have a later date or a higher value than previous values.

> **Major changes in 1.64.0**
>
> The n8n team overhauled this node in n8n 1.64.0. This document reflects the latest version of the node. If you're using an older version of n8n, you can find the previous version of this document [here](https://github.com/n8n-io/n8n-docs/blob/7a66308290e6e5b104fcb82a3beafa0d6987df36/docs/integrations/builtin/core-nodes/n8n-nodes-base.removeduplicates.md).

## Operation modes

The remove duplication node works differently depending on the value of the **operation** parameter:

* **[Remove Items Repeated Within Current Input](#remove-items-repeated-within-current-input)**: Identify and remove duplicate items in the current input across all fields or a subset of fields.
* **[Remove Items Processed in Previous Executions](#remove-items-processed-in-previous-executions)**: Compare items in the current input to items from previous executions and remove duplicates.
* **[Clear Deduplication History](#clear-deduplication-history)**: Wipe the memory of items from previous executions.

### Remove Items Repeated Within Current Input

When you set the "Operations" field to **Remove Items Repeated Within Current Input**, the Remove Duplicate node identifies and removes duplicate items in the current input. It can do this across all fields, or within a subset of fields.

#### Remove Items Repeated Within Current Input parameters

When using the **Remove Items Repeated Within Current Input** operation, the following parameter is available:

* **Compare**: Select which fields of the input data n8n should compare to check if they're the same. The following options are available:
	* **All Fields**: Compares all fields of the input data.
	* **All Fields Except**: Enter which input data fields n8n should exclude from the comparison. You can provide multiple values separated by commas.
	* **Selected Fields**: Enter which input data fields n8n should include in the comparison. You can provide multiple values separated by commas.

#### Remove Items Repeated Within Current Input options

If you choose **All Fields Except** or **Selected Fields** as your compare type, you can add these options:

* **Disable Dot Notation**: Set whether to use dot notation to reference child fields in the format `parent.child` (turned off) or not (turn on).
* **Remove Other Fields**: Set whether to remove any fields that aren't used in the comparison (turned on) or not (turned off).

### Remove Items Processed in Previous Executions

When you set the "Operation" field to **Remove Items Processed in Previous Executions**, the Remove Duplicate node compares items in the current input to items from previous executions.

#### Remove Items Processed in Previous Executions parameters

When using the **Remove Items Processed in Previous Executions** operation, the following parameters are available:

* **Keep Items Where**: Select how n8n decides which items to keep. The following options are available:
	* **Value Is New**: n8n removes items if their value matches items from earlier executions.
	* **Value Is Higher than Any Previous Value**: n8n removes items if the current value isn't higher than previous values.
	* **Value Is a Date Later than Any Previous Date**: n8n removes date items if the current date isn't later than previous dates.

* **Value to Dedupe On**: The input field or fields to compare. The option you select for the **Keep Items Where** parameter determines the exact format you need:
	* When using **Value Is New**, this must be an input field or combination of fields with a unique ID.
	* When using **Value Is Higher than Any Previous Value**, this must be an input field or combination of fields that has an incremental value.
	* When using **Value Is a Date Later than Any Previous Date**, this must be an input field that has a date value in ISO format.

#### Remove Items Processed in Previous Executions options

When using the **Remove Items Processed in Previous Executions** operation, the following option is available:

* **Scope**: Sets how n8n stores and uses the deduplication data for comparisons. The following options are available:
	* **Node**: (default) Stores the data for this node independently from other Remove Duplicates instances in the workflow. When you use this scope, you can [clear the duplication history](#clear-deduplication-history) for this node instance without affecting other nodes.
	* **Workflow**: Stores the duplication data at the workflow level. This shares duplication data with any other Remove Duplicate nodes set to use "workflow" scope.  n8n will still manage the duplication data for other Remove Duplicate nodes set to "node" scope independently.

When you select **Value Is New** as your **Keep Items Where** choice, this option is also available:

* **History Size**: The number of items for n8n to store to track duplicates across executions. The value of the **Scope** option determines whether this history size is specific to this individual Remove Duplicate node instance or shared with other instances in the workflow. By default, n8n stores 10,000 items.

### Clear Deduplication History

When you set the "Operation" field to **Clear Deduplication History**, the Remove Duplicates node manages and clears the stored items from previous executions. This operation doesn't affect any items in the current input. Instead, it manages the database of items that the "Remove Items Processed in Previous Executions" operation uses.

#### Clear Deduplication History parameters

When using the **Clear Deduplication History** operation, the following parameter is available:

* **Mode**: How you want to manage the key / value items stored in the database. The following option is available:
	* **Clean Database**: Deletes all duplication data stored in the database. This resets the duplication database to its original state.

#### Clear Deduplication History options

When using the **Clear Deduplication History** operation, the following option is available:

* **Scope**: Sets the scope n8n uses when managing the duplication database.
	* **Node**: (default) Manages the duplication database specific to this Remove Duplicates node instance.
	* **Workflow**: Manages the duplication database shared by all Remove Duplicate node instances that use workflow scope.

## Templates and examples

For templates using the Remove Duplicates node and examples of how to use it, refer to [Templates and examples](/integrations/builtin/core-nodes/n8n-nodes-base.removeduplicates/templates-and-examples.md).

## Related resources

Learn more about [data structure and data flow](/data/index.md) in n8n workflows.

---

# Templates and examples

Here are some templates and examples for the [Remove Duplicates node](/integrations/builtin/core-nodes/n8n-nodes-base.removeduplicates/index.md).

> **Continuous examples**
>
> The examples included in this section are a sequence. Follow from one to another to avoid unexpected results.

## Templates

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Set up sample data using the Code node

Create a workflow with some example input data to try out the Remove Duplicates node.

1. Add a Code node to the canvas and connect it to the Manual Trigger node.
2. In the Code node, set **Mode** to **Run Once for Each Item** and **Language** to **JavaScript**.
3. Paste the following JavaScript code snippet in the **JavaScript** field:
```js
let data =[];

return {
  data: [
    { id: 1, name: 'Taylor Swift', job: 'Pop star', last_updated: '2024-09-20T10:12:43.493Z' },
    { id: 2, name: 'Ed Sheeran', job: 'Singer-songwriter', last_updated: '2024-10-05T08:30:59.493Z' },
    { id: 3, name: 'Adele', job: 'Singer-songwriter', last_updated: '2024-10-07T14:15:59.493Z' },
    { id: 4, name: 'Bruno Mars', job: 'Singer-songwriter', last_updated: '2024-08-25T17:45:12.493Z' },
    { id: 1, name: 'Taylor Swift', job: 'Pop star', last_updated: '2024-09-20T10:12:43.493Z' },  // duplicate
    { id: 5, name: 'Billie Eilish', job: 'Singer-songwriter', last_updated: '2024-09-10T09:30:12.493Z' },
    { id: 6, name: 'Katy Perry', job: 'Pop star', last_updated: '2024-10-08T12:30:45.493Z' },
    { id: 2, name: 'Ed Sheeran', job: 'Singer-songwriter', last_updated: '2024-10-05T08:30:59.493Z' },  // duplicate
    { id: 7, name: 'Lady Gaga', job: 'Pop star', last_updated: '2024-09-15T14:45:30.493Z' },
    { id: 8, name: 'Rihanna', job: 'Pop star', last_updated: '2024-10-01T11:50:22.493Z' },
    { id: 3, name: 'Adele', job: 'Singer-songwriter', last_updated: '2024-10-07T14:15:59.493Z' },  // duplicate
    //{ id: 9, name: 'Tom Hanks', job: 'Actor', last_updated: '2024-10-17T13:58:31.493Z' },
    //{ id: 0, name: 'Madonna', job: 'Pop star', last_updated: '2024-10-17T17:11:38.493Z' },
    //{ id: 15, name: 'Bob Dylan', job: 'Folk singer', last_updated: '2024-09-24T08:03:16.493Z'},
    //{ id: 10, name: 'Harry Nilsson', job: 'Singer-songwriter', last_updated: '2020-10-17T17:11:38.493Z' },
    //{ id: 11, name: 'Kylie Minogue', job: 'Pop star', last_updated: '2024-10-24T08:03:16.493Z'},
  ]
}
```
4. Add a Split Out node to the canvas and connect it to the Code node.
5. In the Split Out node, enter `data` in the **Fields To Split Out** field.

## Removing duplicates from the current input

1. Add a Remove Duplicates node to the canvas and connect it to the Split Out node. Choose **Remove items repeated within current input** as the **Action** to start.
2. Open the Remove Duplicates node and ensure that the **Operation** is set to **Remove Items Repeated Within Current Input**.
3. Choose **All fields** in the **Compare** field.
4. Select **Execute step** to run the Remove Duplicates node, removing duplicated data in the current input.

n8n removes the items that have the same data across all fields. Your output in table view should look like this:

<!-- vale off -->
| **id** | **name**      | **job**           | **last_updated**         |
|--------|---------------|-------------------|--------------------------|
| 1      | Taylor Swift  | Pop star          | 2024-09-20T10:12:43.493Z |
| 2      | Ed Sheeran    | Singer-songwriter | 2024-10-05T08:30:59.493Z |
| 3      | Adele         | Singer-songwriter | 2024-10-07T14:15:59.493Z |
| 4      | Bruno Mars    | Singer-songwriter | 2024-08-25T17:45:12.493Z |
| 5      | Billie Eilish | Singer-songwriter | 2024-09-10T09:30:12.493Z |
| 6      | Katy Perry    | Pop star          | 2024-10-08T12:30:45.493Z |
| 7      | Lady Gaga     | Pop star          | 2024-09-15T14:45:30.493Z |
| 8      | Rihanna       | Pop star          | 2024-10-01T11:50:22.493Z |
<!-- vale on -->

5. Open the Remove Duplicates node again and change the **Compare** parameter to **Selected Fields**.
6. In the **Fields To Compare** field, enter `job`.
7. Select **Execute step** to run the Remove Duplicates node, removing duplicated data in the current input.

n8n removes the items in the current input that have the same `job` data. Your output in table view should look like this:

<!-- vale off -->
| **id** | **name**      | **job**           | **last_updated**         |
|--------|---------------|-------------------|--------------------------|
| 1      | Taylor Swift  | Pop star          | 2024-09-20T10:12:43.493Z |
| 2      | Ed Sheeran    | Singer-songwriter | 2024-10-05T08:30:59.493Z |
<!-- vale on -->

## Keep items where the value is new

1. Open the Remove Duplicates node and set the **Operation** to **Remove Items Processed in Previous Executions**.
2. Set the **Keep Items Where** parameter to **Value Is New**.
3. Set the **Value to Dedupe On** parameter to ``.
4. On the canvas, select **Execute workflow** to run the workflow. Open the Remove Duplicates node to examine the results.

n8n compares the current input data to the items stored from previous executions. Since this is the first time running the Remove Duplicates node with this operation, n8n processes all data items and places them into the **Kept** output tab. The order of the items may be different than the order in the input data:

<!-- vale off -->
| **id** | **name**      | **job**           | **last_updated**         |
|--------|---------------|-------------------|--------------------------|
| 1      | Taylor Swift  | Pop star          | 2024-09-20T10:12:43.493Z |
| 1      | Taylor Swift  | Pop star          | 2024-09-20T10:12:43.493Z |
| 2      | Ed Sheeran    | Singer-songwriter | 2024-10-05T08:30:59.493Z |
| 2      | Ed Sheeran    | Singer-songwriter | 2024-10-05T08:30:59.493Z |
| 3      | Adele         | Singer-songwriter | 2024-10-07T14:15:59.493Z |
| 3      | Adele         | Singer-songwriter | 2024-10-07T14:15:59.493Z |
| 4      | Bruno Mars    | Singer-songwriter | 2024-08-25T17:45:12.493Z |
| 5      | Billie Eilish | Singer-songwriter | 2024-09-10T09:30:12.493Z |
| 6      | Katy Perry    | Pop star          | 2024-10-08T12:30:45.493Z |
| 7      | Lady Gaga     | Pop star          | 2024-09-15T14:45:30.493Z |
| 8      | Rihanna       | Pop star          | 2024-10-01T11:50:22.493Z |
<!-- vale on -->

> **Items are only compared against previous executions**
>
> The current input items are only compared against the stored items from previous executions. This means that items repeated within the current input aren't removed in this mode of operation. If you need to remove duplicate items within the current input *and* across executions, connect two Remove Duplicate nodes together sequentially. Set the first to use the **Remove Items Repated Within Current Input** operation and the second to use the **Remove Items Processed in Previous Executions** operation.

5. Open the Code node and uncomment (remove the `//` from) the line for "Tom Hanks."
6. On the canvas, select **Execute workflow** again. Open the Remove Duplicates node again to examine the results.

n8n compares the current input data to the items stored from previous executions. This time, the **Kept** tab contains the one new record from the Code node:

<!-- vale off -->
| **id** | **name**  | **job** | **last_updated**         |
|--------|-----------|---------|--------------------------|
| 9      | Tom Hanks | Actor   | 2024-10-17T13:58:31.493Z |
<!-- vale on -->

The **Discarded** tab contains the items processed by the previous execution:

<!-- vale off -->
| **id** | **name**      | **job**           | **last_updated**         |
|--------|---------------|-------------------|--------------------------|
| 1      | Taylor Swift  | Pop star          | 2024-09-20T10:12:43.493Z |
| 1      | Taylor Swift  | Pop star          | 2024-09-20T10:12:43.493Z |
| 2      | Ed Sheeran    | Singer-songwriter | 2024-10-05T08:30:59.493Z |
| 2      | Ed Sheeran    | Singer-songwriter | 2024-10-05T08:30:59.493Z |
| 3      | Adele         | Singer-songwriter | 2024-10-07T14:15:59.493Z |
| 3      | Adele         | Singer-songwriter | 2024-10-07T14:15:59.493Z |
| 4      | Bruno Mars    | Singer-songwriter | 2024-08-25T17:45:12.493Z |
| 5      | Billie Eilish | Singer-songwriter | 2024-09-10T09:30:12.493Z |
| 6      | Katy Perry    | Pop star          | 2024-10-08T12:30:45.493Z |
| 7      | Lady Gaga     | Pop star          | 2024-09-15T14:45:30.493Z |
| 8      | Rihanna       | Pop star          | 2024-10-01T11:50:22.493Z |
<!-- vale on -->

Before continuing, clear the duplication history to get ready for the next example:

7. Open the Remove Duplicates node and set the **Operation** to **Clear Deduplication History**.
8. Select **Execute step** to clear the current duplication history.

## Keep items where the value is higher than any previous value

1. Open the Remove Duplicates node and set the **Operation** to **Remove Items Processed in Previous Executions**.
2. Set the **Keep Items Where** parameter to **Value Is Higher than Any Previous Value**.
3. Set the **Value to Dedupe On** parameter to ``.
4. On the canvas, select **Execute workflow** to run the workflow. Open the Remove Duplicates node to examine the results.

n8n compares the current input data to the items stored from previous executions. Since this is the first time running the Remove Duplicates node after clearing the history, n8n processes all data items and places them into the **Kept** output tab. The order of the items may be different than the order in the input data:

<!-- vale off -->
| **id** | **name**      | **job**           | **last_updated**         |
|--------|---------------|-------------------|--------------------------|
| 1      | Taylor Swift  | Pop star          | 2024-09-20T10:12:43.493Z |
| 1      | Taylor Swift  | Pop star          | 2024-09-20T10:12:43.493Z |
| 2      | Ed Sheeran    | Singer-songwriter | 2024-10-05T08:30:59.493Z |
| 2      | Ed Sheeran    | Singer-songwriter | 2024-10-05T08:30:59.493Z |
| 3      | Adele         | Singer-songwriter | 2024-10-07T14:15:59.493Z |
| 3      | Adele         | Singer-songwriter | 2024-10-07T14:15:59.493Z |
| 4      | Bruno Mars    | Singer-songwriter | 2024-08-25T17:45:12.493Z |
| 5      | Billie Eilish | Singer-songwriter | 2024-09-10T09:30:12.493Z |
| 6      | Katy Perry    | Pop star          | 2024-10-08T12:30:45.493Z |
| 7      | Lady Gaga     | Pop star          | 2024-09-15T14:45:30.493Z |
| 8      | Rihanna       | Pop star          | 2024-10-01T11:50:22.493Z |
| 9      | Tom Hanks     | Actor             | 2024-10-17T13:58:31.493Z |
<!-- vale on -->

5. Open the Code node and uncomment (remove the `//` from) the lines for "Madonna" and "Bob Dylan."
6. On the canvas, select **Execute workflow** again. Open the Remove Duplicates node again to examine the results.

n8n compares the current input data to the items stored from previous executions. This time, the **Kept** tab contains a single entry for "Bob Dylan." n8n keeps this item because its `id` column value (15) is higher than any previous values (the previous maximum value was 9):

<!-- vale off -->
| **id** | **name**  | **job**     | **last_updated**         |
|--------|-----------|-------------|--------------------------|
| 15     | Bob Dylan | Folk singer | 2024-09-24T08:03:16.493Z |
<!-- vale on -->

The **Discarded** tab contains the 13 items with an `id` column value equal to or less than the previous maximum value (9). Even though it's new, this table includes the entry for "Madonna" because its `id` value isn't larger than the previous maximum value:

<!-- vale off -->
| **id** | **name**      | **job**           | **last_updated**         |
|--------|---------------|-------------------|--------------------------|
| 0      | Madonna       | Pop star          | 2024-10-17T17:11:38.493Z |
| 1      | Taylor Swift  | Pop star          | 2024-09-20T10:12:43.493Z |
| 1      | Taylor Swift  | Pop star          | 2024-09-20T10:12:43.493Z |
| 2      | Ed Sheeran    | Singer-songwriter | 2024-10-05T08:30:59.493Z |
| 2      | Ed Sheeran    | Singer-songwriter | 2024-10-05T08:30:59.493Z |
| 3      | Adele         | Singer-songwriter | 2024-10-07T14:15:59.493Z |
| 3      | Adele         | Singer-songwriter | 2024-10-07T14:15:59.493Z |
| 4      | Bruno Mars    | Singer-songwriter | 2024-08-25T17:45:12.493Z |
| 5      | Billie Eilish | Singer-songwriter | 2024-09-10T09:30:12.493Z |
| 6      | Katy Perry    | Pop star          | 2024-10-08T12:30:45.493Z |
| 7      | Lady Gaga     | Pop star          | 2024-09-15T14:45:30.493Z |
| 8      | Rihanna       | Pop star          | 2024-10-01T11:50:22.493Z |
| 9      | Tom Hanks     | Actor             | 2024-10-17T13:58:31.493Z |
<!-- vale on -->

Before continuing, clear the duplication history to get ready for the next example:

7. Open the Remove Duplicates node and set the **Operation** to **Clear Deduplication History**.
8. Select **Execute step** to clear the current duplication history.

## Keep items where the value is a date later than any previous date

1. Open the Remove Duplicates node and set the **Operation** to **Remove Items Processed in Previous Executions**.
2. Set the **Keep Items Where** parameter to **Value Is a Date Later than Any Previous Date**.
3. Set the **Value to Dedupe On** parameter to ``.
4. On the canvas, select **Execute workflow** to run the workflow. Open the Remove Duplicates node to examine the results.

n8n compares the current input data to the items stored from previous executions. Since this is the first time running the Remove Duplicates node after clearing the history, n8n processes all data items and places them into the **Kept** output tab. The order of the items may be different than the order in the input data:

<!-- vale off -->
| **id** | **name**      | **job**           | **last_updated**         |
|--------|---------------|-------------------|--------------------------|
| 0      | Madonna       | Pop star          | 2024-10-17T17:11:38.493Z |
| 1      | Taylor Swift  | Pop star          | 2024-09-20T10:12:43.493Z |
| 1      | Taylor Swift  | Pop star          | 2024-09-20T10:12:43.493Z |
| 2      | Ed Sheeran    | Singer-songwriter | 2024-10-05T08:30:59.493Z |
| 2      | Ed Sheeran    | Singer-songwriter | 2024-10-05T08:30:59.493Z |
| 3      | Adele         | Singer-songwriter | 2024-10-07T14:15:59.493Z |
| 3      | Adele         | Singer-songwriter | 2024-10-07T14:15:59.493Z |
| 4      | Bruno Mars    | Singer-songwriter | 2024-08-25T17:45:12.493Z |
| 5      | Billie Eilish | Singer-songwriter | 2024-09-10T09:30:12.493Z |
| 6      | Katy Perry    | Pop star          | 2024-10-08T12:30:45.493Z |
| 7      | Lady Gaga     | Pop star          | 2024-09-15T14:45:30.493Z |
| 8      | Rihanna       | Pop star          | 2024-10-01T11:50:22.493Z |
| 9      | Tom Hanks     | Actor             | 2024-10-17T13:58:31.493Z |
| 15     | Bob Dylan     | Folk singer       | 2024-09-24T08:03:16.493Z |
<!-- vale on -->

<!-- vale off -->
5. Open the Code node and uncomment (remove the `//` from) the lines for "Harry Nilsson" and "Kylie Minogue."
<!-- vale on -->
6. On the canvas, select **Execute workflow** again. Open the Remove Duplicates node again to examine the results.

<!-- vale off -->
n8n compares the current input data to the items stored from previous executions. This time, the **Kept** tab contains a single entry for "Kylie Minogue." n8n keeps this item because its `last_updated` column value (`2024-10-24T08:03:16.493Z`) is later than any previous values (the previous latest date was `2024-10-17T17:11:38.493Z`):
<!-- vale on -->

<!-- vale off -->
| **id** | **name**      | **job**           | **last_updated**         |
|--------|---------------|-------------------|--------------------------|
| 11     | Kylie Minogue | Pop star          | 2024-10-24T08:03:16.493Z |
<!-- vale on -->

The **Discarded** tab contains the 15 items with a `last_updated` column value equal to or earlier than the previous latest date (`2024-10-17T17:11:38.493Z`). Even though it's new, this table includes the entry for "Harry Nilsson" because its `last_updated` value isn't later than the previous maximum value:

<!-- vale off -->
| **id** | **name**      | **job**           | **last_updated**         |
|--------|---------------|-------------------|--------------------------|
| 10     | Harry Nilsson | Singer-songwriter | 2020-10-17T17:11:38.493Z |
| 0      | Madonna       | Pop star          | 2024-10-17T17:11:38.493Z |
| 1      | Taylor Swift  | Pop star          | 2024-09-20T10:12:43.493Z |
| 1      | Taylor Swift  | Pop star          | 2024-09-20T10:12:43.493Z |
| 2      | Ed Sheeran    | Singer-songwriter | 2024-10-05T08:30:59.493Z |
| 2      | Ed Sheeran    | Singer-songwriter | 2024-10-05T08:30:59.493Z |
| 3      | Adele         | Singer-songwriter | 2024-10-07T14:15:59.493Z |
| 3      | Adele         | Singer-songwriter | 2024-10-07T14:15:59.493Z |
| 4      | Bruno Mars    | Singer-songwriter | 2024-08-25T17:45:12.493Z |
| 5      | Billie Eilish | Singer-songwriter | 2024-09-10T09:30:12.493Z |
| 6      | Katy Perry    | Pop star          | 2024-10-08T12:30:45.493Z |
| 7      | Lady Gaga     | Pop star          | 2024-09-15T14:45:30.493Z |
| 8      | Rihanna       | Pop star          | 2024-10-01T11:50:22.493Z |
| 9      | Tom Hanks     | Actor             | 2024-10-17T13:58:31.493Z |
| 15     | Bob Dylan     | Folk singer       | 2024-09-24T08:03:16.493Z |
<!-- vale on -->