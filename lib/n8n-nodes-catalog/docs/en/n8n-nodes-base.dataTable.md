# Data table

> Documentation for the data table node in n8n, a workflow automation platform. Includes guidance on usage, and links to examples.

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

See available operations below. For detailed information on parameters for different operation types, refer to the [Table operations](https://docs.n8n.io/tables/) and [Row operations](https://docs.n8n.io/rows/) pages.

* **Rows**
    * [**Delete:**](https://docs.n8n.io/rows/#delete-row) Delete one or more rows.
    * [**Get:**](https://docs.n8n.io/rows/#get-row) Get one or more rows from your table based on defined filters.
    * [**If Row Exists:**](https://docs.n8n.io/rows/#if-row-exists) Specify a set of conditions to match input items that exist in the data table.
    * [**If Row Does Not Exist:**](https://docs.n8n.io/rows/#if-row-does-not-exist) Specify a set of conditions to match input items that don't exist in the data table.
    * [**Insert:**](https://docs.n8n.io/rows/#insert-row) Insert rows into an existing table.
    * [**Update:**](https://docs.n8n.io/rows/#update-row) Update one or more rows.
    * [**Upsert:**](https://docs.n8n.io/rows/#upsert-row) Upsert one or more rows. If the row exists, it's updated; otherwise, a new row is created.

* **Tables**
    * [**Create:**](https://docs.n8n.io/tables/#create-a-data-table) Create a new data table.
    * [**Delete:**](https://docs.n8n.io/tables/#delete-a-data-table) Delete an existing data table.
    * [**List:**](https://docs.n8n.io/tables/#list-data-tables) List existing data tables.
    * [**Update:**](https://docs.n8n.io/tables/#update-a-data-table) Update an existing data table.

## Related resources

[Data tables](/data/data-tables.md) explains how to create and manage data tables.

---

<!-- sibling:rows.md -->
## Rows

Use row operations to delete, get, insert, update, upsert, or filter rows in a data table. Refer to the [Data Table node](https://docs.n8n.io//) documentation for more information on the node itself.

## Delete row

Use this operation to delete one or more rows from a data table, based on a defined condition(s).

Enter these parameters:

- **Resource:** Select **Row**.
- **Operation:** Select **Delete**.
- **Data table:** Select how to identify the data table to operate on:
    - **From list:** Select the table from a drop-down list of all your data tables.
    - **By Name:** Enter the name of your data table.
    - **By ID:** Enter the ID of your data table
- **Must Match:** Select whether to delete rows that match **Any Condition** or **All Conditions** defined in the next step.
- **Conditions:** Click **Add Condition** to define which rows from the data table to operate on. You can add multiple conditions. For each one:
    - **Column:** Select the column you want to compare.
    - **Condition:** Choose how to compare the column value: **Equals**, **Not Equals**, **Greater Than**, **Greater Than or Equal**, **Less Than**, **Less Than or Equal**, **Is Empty**, or **Is Not Empty**.
    - **Value:** Enter the value to compare the column against. You can use a fixed value or an expression that references data from previous nodes. This field doesn't exist for **Is Empty** and **Is Not Empty** conditions.

### Delete row options

Use these options to further refine the action's behavior:

- **Dry Run:** Enable to simulate deletion without modifying the table. The node returns rows that would be deleted, including their state before and after the operation.

## Get row

Use this operation to retrieve one or more rows from a data table, based on a defined condition(s).

Enter these parameters:

- **Resource:** Select **Row**.
- **Operation:** Select **Get**.
- **Data table:** Select how to identify the data table to operate on:
    - **From list:** Select the table from a drop-down list of all your data tables.
    - **By Name:** Enter the name of your data table.
    - **By ID:** Enter the ID of your data table
- **Must Match:** Select whether to get rows that match **Any Condition** or **All Conditions** defined in the next step.
- **Conditions:** Click **Add Condition** to define which rows from the data table to operate on. You can add multiple conditions. For each one:
    - **Column:** Select the column you want to compare.
    - **Condition:** Choose how to compare the column value: **Equals**, **Not Equals**, **Greater Than**, **Greater Than or Equal**, **Less Than**, **Less Than or Equal**, **Is Empty**, or **Is Not Empty**.
    - **Value:** Enter the value to compare the column against. You can use a fixed value or an expression that references data from previous nodes. This field doesn't exist for **Is Empty** and **Is Not Empty** conditions.
- **Return All:** Enable to return all matching rows. Or, disable and enter a **Limit** for the number of rows to return, for example `50`.
- **Order By:** Enable to define the column to order results on, and the direction (ascending or descending). Or, disable for no ordering of results.

## If row exists

Use this operation to check whether a row matching the defined condition(s) exists in a data table. If a matching row is found, the node outputs the same input item it received, unchanged. If no matching rows exist, it outputs nothing.

Enter these parameters:

- **Resource:** Select **Row**.
- **Operation:** Select **If Row Exists**.
- **Data table:** Select how to identify the data table to operate on:
    - **From list:** Select the table from a drop-down list of all your data tables.
    - **By Name:** Enter the name of your data table.
    - **By ID:** Enter the ID of your data table
- **Must Match:** Select whether rows must match **Any Condition** or **All Conditions** defined in the next step.
- **Conditions:** Click **Add Condition** to define the data table rows to operate on. You can add multiple conditions. For each one:
    - **Column:** Select the column you want to compare.
    - **Condition:** Choose how to compare the column value: **Equals**, **Not Equals**, **Greater Than**, **Greater Than or Equal**, **Less Than**, **Less Than or Equal**, **Is Empty**, or **Is Not Empty**.
    - **Value:** Enter the value to compare the column against. You can use a fixed value or an expression that references data from previous nodes. This field doesn't exist for **Is Empty** and **Is Not Empty** conditions.

## If row does not exist

Use this operation to check that no rows matching the defined condition(s) exists in a data table. If no matching row is found, the node outputs the same input item it received, unchanged. If a matching row exists, it outputs nothing.

Enter these parameters:

- **Resource:** Select **Row**.
- **Operation:** Select **If Row Does Not Exist**.
- **Data table:** Select how to identify the data table to operate on:
    - **From list:** Select the table from a drop-down list of all your data tables.
    - **By Name:** Enter the name of your data table.
    - **By ID:** Enter the ID of your data table.
- **Must Match:** Select whether rows must match **Any Condition** or **All Conditions** defined in the next step.
- **Conditions:** Click **Add Condition** to define the data table rows to operate on. You can add multiple conditions. For each one:
    - **Column:** Select the column you want to compare.
    - **Condition:** Choose how to compare the column value: **Equals**, **Not Equals**, **Greater Than**, **Greater Than or Equal**, **Less Than**, **Less Than or Equal**, **Is Empty**, or **Is Not Empty**.
    - **Value:** Enter the value to compare the column against. You can use a fixed value or an expression that references data from previous nodes. This field doesn't exist for **Is Empty** and **Is Not Empty** conditions.

## Insert row

Use this operation to insert a new row into a data table.

Enter these parameters:

- **Resource:** Select **Row**.
- **Operation:** Select **Insert**.
- **Data table:** Select how to identify the data table to operate on:
    - **From list:** Select the table from a drop-down list of all your data tables.
    - **By Name:** Enter the name of your data table.
    - **By ID:** Enter the ID of your data table.
- **Mapping Column Mode:** Select whether to: 
    - **Map Each Column Manually:** Explicitly select which incoming data fields to map to which column. This allows you to map even when the incoming data field names don't match the data table column names. You can choose to delete certain values from the mapping.
    - **Map Automatically:** Allow the node to automatically match data fields to columns by name. For successful mapping, the field names in your incoming data must exactly match the column names in the data table. All fields will be mapped.

### Insert row options

Use these options to further refine the action's behavior:

- **Optimize Bulk:** Enable to prevent inserted data from being returned. This improves bulk insert performance by up to 5x.

## Update row

Use this operation to update one or more rows in a data table, based on a defined condition(s).

Enter these parameters:

- **Resource:** Select **Row**.
- **Operation:** Select **Update**.
- **Data table:** Select how to identify the data table to operate on:
    - **From list:** Select the table from a drop-down list of all your data tables.
    - **By Name:** Enter the name of your data table.
    - **By ID:** Enter the ID of your data table.
- **Must Match:** Select whether to update rows that match **Any Condition** or **All Conditions** defined in the next step.
- **Conditions:** Click **Add Condition** to define the data table rows to operate on. You can add multiple conditions. For each one:
    - **Column:** Select the column you want to compare.
    - **Condition:** Choose how to compare the column value: **Equals**, **Not Equals**, **Greater Than**, **Greater Than or Equal**, **Less Than**, **Less Than or Equal**, **Is Empty**, or **Is Not Empty**.
    - **Value:** Enter the value to compare the column against. You can use a fixed value or an expression that references data from previous nodes. This field doesn't exist for **Is Empty** and **Is Not Empty** conditions.
- **Mapping Column Mode:** Select whether to: 
    - **Map Each Column Manually:** Explicitly select which incoming data fields to map to which column. This allows you to map even when the incoming data field names don't match the data table column names. You can choose to delete certain values from the mapping.
    - **Map Auomatically:** Allow the node to automatically match data fields to columns by name. For successful mapping, the field names in your incoming data must exactly match the column names in the data table. All fields will be mapped.

### Update row options

Use these options to further refine the action's behavior:

- **Dry Run:** Enable to simulate updating, without modifying the table. The node returns rows that would be updated, including their state before and after the operation.

## Upsert row

Use this operation to upsert into a data table. If a row matching the defined condition(s) exists, it's updated with the provided values. If no matching row exists, a new row is created.

- **Resource:** Select **Row**.
- **Operation:** Select **Upsert**.
- **Data table:** Select how to identify the data table to operate on:
    - **From list:** Select the table from a drop-down list of all your data tables.
    - **By Name:** Enter the name of your data table.
    - **By ID:** Enter the ID of your data table.
- **Must Match:** Select whether to upsert rows that match **Any Condition** or **All Conditions** defined in the next step.
- **Conditions:** Click **Add Condition** to define the data table rows to operate on. You can add multiple conditions. For each one:
    - **Column:** Select the column you want to compare.
    - **Condition:** Choose how to compare the column value: **Equals**, **Not Equals**, **Greater Than**, **Greater Than or Equal**, **Less Than**, **Less Than or Equal**, **Is Empty**, or **Is Not Empty**.
    - **Value:** Enter the value to compare the column against. You can use a fixed value or an expression that references data from previous nodes. This field doesn't exist for **Is Empty** and **Is Not Empty** conditions.
- **Mapping Column Mode:** Select whether to: 
    - **Map Each Column Manually:** Explicitly select which incoming data fields to map to which column. This allows you to map even when the incoming data field names don't match the data table column names. You can choose to delete certain values from the mapping.
    - **Map Auomatically:** Allow the node to automatically match data fields to columns by name. For successful mapping, the field names in your incoming data must exactly match the column names in the data table. All fields will be mapped.

### Upsert row options

Use these options to further refine the action's behavior:

- **Dry Run:** Enable to simulate the upsert operation without modifying the table. The node returns rows that would be affected, including their state before and after the operation.

---

<!-- sibling:tables.md -->
## Tables

Use table operations to create, delete, list and update data tables. Refer to the [Data Table node](https://docs.n8n.io//) documentation for more information on the node itself.

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