# Data table

Use the Data Table node to create and manage internal data tables. Data tables allow you to store structured data directly inside n8n and use it across workflows.

You can use the Data Table node to:

- Create, list, and manage data tables
- Insert, update, delete, and upsert rows in data tables
- Query and retrieve rows using matching conditions

> **Working with data tables**
>
> As well as using the Data Tables node in a workflow, you can view and manage data tables manually from the **Data Tables** tab in your project **Overview**.
> 
> For information about working with data tables in this tab, and guidance on when to use data tables and their limitations, see [Data tables](/data/data-tables.md).

## Resources

The Data Table node supports the following resources:

- **Data Table:** Create, list, update, and delete tables.
- **Row:** Insert, retrieve, update, delete, and upsert rows within a table.

### Operations

See available operations below. For detailed information on parameters for different operation types, refer to the [Table operations](/integrations/builtin/core-nodes/n8n-nodes-base.datatable/tables.md) and [Row operations](/integrations/builtin/core-nodes/n8n-nodes-base.datatable/rows.md) pages.

* **Rows**
    * [**Delete:**](/integrations/builtin/core-nodes/n8n-nodes-base.datatable/rows.md#delete-row) Delete one or more rows.
    * [**Get:**](/integrations/builtin/core-nodes/n8n-nodes-base.datatable/rows.md#get-row) Get one or more rows from your table based on defined filters.
    * [**If Row Exists:**](/integrations/builtin/core-nodes/n8n-nodes-base.datatable/rows.md#if-row-exists) Specify a set of conditions to match input items that exist in the data table.
    * [**If Row Does Not Exist:**](/integrations/builtin/core-nodes/n8n-nodes-base.datatable/rows.md#if-row-does-not-exist) Specify a set of conditions to match input items that don't exist in the data table.
    * [**Insert:**](/integrations/builtin/core-nodes/n8n-nodes-base.datatable/rows.md#insert-row) Insert rows into an existing table.
    * [**Update:**](/integrations/builtin/core-nodes/n8n-nodes-base.datatable/rows.md#update-row) Update one or more rows.
    * [**Upsert:**](/integrations/builtin/core-nodes/n8n-nodes-base.datatable/rows.md#upsert-row) Upsert one or more rows. If the row exists, it's updated; otherwise, a new row is created.

* **Tables**
    * [**Create:**](/integrations/builtin/core-nodes/n8n-nodes-base.datatable/tables.md#create-a-data-table) Create a new data table.
    * [**Delete:**](/integrations/builtin/core-nodes/n8n-nodes-base.datatable/tables.md#delete-a-data-table) Delete an existing data table.
    * [**List:**](/integrations/builtin/core-nodes/n8n-nodes-base.datatable/tables.md#list-data-tables) List existing data tables.
    * [**Update:**](/integrations/builtin/core-nodes/n8n-nodes-base.datatable/tables.md#update-a-data-table) Update an existing data table.

## Related resources

[Data tables](/data/data-tables.md) explains how to create and manage data tables.

Use table operations to create, delete, list and update data tables. Refer to the [Data Table node](/integrations/builtin/core-nodes/n8n-nodes-base.datatable/index.md) documentation for more information on the node itself.

## Create a data table

Use this operation to create a new data table.

Enter these parameters:

- **Resource:** Select **Table**.
- **Operation:** Select **Create**.
- **Name:** Enter a name for the data table, or define using an expression.
- **Columns:** Click **Add Column** to define parameters for the columns of the data table. You can add multiple columns. For each one: 
    - **Name:** Set a name for the column, or define using an expression.
    - **Type:** Select the data type for the column: **Boolean**, **Date**, **Number**, or **String**.:

### Create a data table options

Use these options to further refine the action's behavior:

- **Reuse Existing Tables:** Enable to return an existing table if one exists with the same name, without throwing an error.

## Delete a data table

Use this operation to permanently delete an existing data table. This action can't be undone.

Enter these parameters:

- **Resource:** Select **Table**.
- **Operation:** Select **Delete**.
- **Data table:** Select how to identify the data table to delete:
    - **From list:** Select the table from a drop-down list of all your data tables.
    - **By Name:** Enter the name of your data table.
    - **By ID:** Enter the ID of your data table

## List data tables

Use this operation to list existing data tables. You can return all tables, all tables up to a defined limit, or filter for tables to return.

Enter these parameters:

- **Resource:** Select **Table**.
- **Operation:** Select **List**.
- **Return All:** Enable to return all matching tables. Or, disable and enter a **Limit** for the number of tables to return, for example `50`.

### List data tables options

Use these options to further refine the action's behavior:

- **Filter by Name:** Enter a value or expression to return data tables whose names contain the specified text. Matching is case-insensitive.
- **Sort Field:** Select a field to sort results on.
- **Sort Direction:** Select whether to sort results in **Ascending** or **Descending** direction.

## Update a data table

Use this operation to update the name of an existing data tables.

Enter these parameters:

- **Resource:** Select **Table**.
- **Operation:** Select **Update**.
- **Data table:** Select how to identify the data table to update:
    - **From list:** Select the table from a drop-down list of all your data tables.
    - **By Name:** Enter the name of your data table.
    - **By ID:** Enter the ID of your data table
- **New name:** Enter a value or expression to set a new name for the data table.