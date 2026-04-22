---
title: Postgres node documentation
description: Learn how to use the Postgres node in n8n. Follow technical documentation to integrate Postgres node into your workflows.
contentType: [integration, reference]
priority: critical
---

# Postgres node

Use the Postgres node to automate work in Postgres, and integrate Postgres with other applications. n8n has built-in support for a wide range of Postgres features, including executing queries, as well as inserting and updating rows in a database. 

On this page, you'll find a list of operations the Postgres node supports and links to more resources.

/// note | Credentials
Refer to [Postgres credentials](/integrations/builtin/credentials/postgres.md) for guidance on setting up authentication. 
///

## Operations

* [**Delete**](#delete): Delete an entire table or rows in a table
* [**Execute Query**](#execute-query): Execute an SQL query
* [**Insert**](#insert): Insert rows in a table
* [**Insert or Update**](#insert-or-update): Insert or update rows in a table
* [**Select**](#select): Select rows from a table
* [**Update**](#update): Update rows in a table

### Delete

Use this operation to delete an entire table or rows in a table.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [Postgres credential](/integrations/builtin/credentials/postgres.md).
- **Operation**: Select **Delete**.
- **Schema**: Choose the schema that contains the table you want to work on. Select **From list** to choose the schema from the dropdown list or **By Name** to enter the schema name.
- **Table**: Choose the table that you want to work on. Select **From list** to choose the table from the dropdown list or **By Name** to enter the table name.
- **Command**: The deletion action to take:
	- **Truncate**: Removes the table's data but preserves the table's structure.
		- **Restart Sequences**: Whether to reset auto increment columns to their initial values as part of the Truncate process.
	- **Delete**: Delete the rows that match the "Select Rows" condition. If you don't select anything, Postgres deletes all rows.
		- **Select Rows**: Define a **Column**, **Operator**, and **Value** to match rows on.
		- **Combine Conditions**: How to combine the conditions in "Select Rows". **AND** requires all conditions to be true, while **OR** requires at least one condition to be true.
	- **Drop**: Deletes the table's data and structure permanently.

#### Delete options

- **Cascade**: Whether to also drop all objects that depend on the table, like views and sequences. Available if using **Truncate** or **Drop** commands.
- **Connection Timeout**: The number of seconds to try to connect to the database.
- **Delay Closing Idle Connection**: The number of seconds to wait before considering idle connections eligible for closing.
- **Query Batching**: The way to send queries to the database:
	- **Single Query**: A single query for all incoming items.
	- **Independently**: Execute one query per incoming item of the execution.
	- **Transaction**: Execute all queries in a transaction. If a failure occurs, Postgres rolls back all changes.
- **Output Large-Format Numbers As**: The format to output `NUMERIC` and `BIGINT` columns as:
	- **Numbers**: Use this for standard numbers.
	- **Text**: Use this if you expect numbers longer than 16 digits. Without this, numbers may be incorrect.

### Execute Query

Use this operation to execute an SQL query.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [Postgres credential](/integrations/builtin/credentials/postgres.md).
- **Operation**: Select **Execute Query**.
- **Query**: The SQL query to execute. You can use n8n [expressions](/data/expressions.md) and tokens like `$1`, `$2`, and `$3` to build [prepared statements](https://www.postgresql.org/docs/current/sql-prepare.html) to use with [query parameters](#use-query-parameters).

#### Execute Query options

- **Connection Timeout**: The number of seconds to try to connect to the database.
- **Delay Closing Idle Connection**: The number of seconds to wait before considering idle connections eligible for closing.
- **Query Batching**: The way to send queries to the database:
	- **Single Query**: A single query for all incoming items.
	- **Independently**: Execute one query per incoming item of the execution.
	- **Transaction**: Execute all queries in a transaction. If a failure occurs, Postgres rolls back all changes.
- **Query Parameters**: A comma-separated list of values that you want to use as [query parameters](#use-query-parameters).
- **Output Large-Format Numbers As**: The format to output `NUMERIC` and `BIGINT` columns as:
	- **Numbers**: Use this for standard numbers.
	- **Text**: Use this if you expect numbers longer than 16 digits. Without this, numbers may be incorrect.
- **Replace Empty Strings with NULL**: Whether to replace empty strings with NULL in input. This may be useful when working with data exported from spreadsheet software.

### Insert

Use this operation to insert rows in a table.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [Postgres credential](/integrations/builtin/credentials/postgres.md).
- **Operation**: Select **Insert**.
- **Schema**: Choose the schema that contains the table you want to work on. Select **From list** to choose the schema from the dropdown list or **By Name** to enter the schema name.
- **Table**: Choose the table that you want to work on. Select **From list** to choose the table from the dropdown list or **By Name** to enter the table name.
- **Mapping Column Mode**: How to map column names to incoming data:
	- **Map Each Column Manually**: Select the values to use for each column.
	- **Map Automatically**: Automatically map incoming data to matching column names in Postgres. The incoming data field names must match the column names in Postgres for this to work. If necessary, consider using the [edit fields (set) node](/integrations/builtin/core-nodes/n8n-nodes-base.set.md) before this node to adjust the format as needed.

#### Insert options

- **Connection Timeout**: The number of seconds to try to connect to the database.
- **Delay Closing Idle Connection**: The number of seconds to wait before considering idle connections eligible for closing.
- **Query Batching**: The way to send queries to the database:
	- **Single Query**: A single query for all incoming items.
	- **Independently**: Execute one query per incoming item of the execution.
	- **Transaction**: Execute all queries in a transaction. If a failure occurs, Postgres rolls back all changes.
- **Output Columns**: Choose which columns to output. You can select from a list of available columns or specify IDs using [expressions](/data/expressions.md).
- **Output Large-Format Numbers As**: The format to output `NUMERIC` and `BIGINT` columns as:
	- **Numbers**: Use this for standard numbers.
	- **Text**: Use this if you expect numbers longer than 16 digits. Without this, numbers may be incorrect.
- **Skip on Conflict**: Whether to skip the row if the insert violates a unique or exclusion constraint instead of throwing an error.
- **Replace Empty Strings with NULL**: Whether to replace empty strings with NULL in input. This may be useful when working with data exported from spreadsheet software.

### Insert or Update

Use this operation to insert or update rows in a table.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [Postgres credential](/integrations/builtin/credentials/postgres.md).
- **Operation**: Select **Insert or Update**.
- **Schema**: Choose the schema that contains the table you want to work on. Select **From list** to choose the schema from the dropdown list or **By Name** to enter the schema name.
- **Table**: Choose the table that you want to work on. Select **From list** to choose the table from the dropdown list or **By Name** to enter the table name.
- **Mapping Column Mode**: How to map column names to incoming data:
	- **Map Each Column Manually**: Select the values to use for each column.
	- **Map Automatically**: Automatically map incoming data to matching column names in Postgres. The incoming data field names must match the column names in Postgres for this to work. If necessary, consider using the [edit fields (set) node](/integrations/builtin/core-nodes/n8n-nodes-base.set.md) before this node to adjust the format as needed.

#### Insert or Update options

- **Connection Timeout**: The number of seconds to try to connect to the database.
- **Delay Closing Idle Connection**: The number of seconds to wait before considering idle connections eligible for closing.
- **Query Batching**: The way to send queries to the database:
	- **Single Query**: A single query for all incoming items.
	- **Independently**: Execute one query per incoming item of the execution.
	- **Transaction**: Execute all queries in a transaction. If a failure occurs, Postgres rolls back all changes.
- **Output Columns**: Choose which columns to output. You can select from a list of available columns or specify IDs using [expressions](/data/expressions.md).
- **Output Large-Format Numbers As**: The format to output `NUMERIC` and `BIGINT` columns as:
	- **Numbers**: Use this for standard numbers.
	- **Text**: Use this if you expect numbers longer than 16 digits. Without this, numbers may be incorrect.
- **Replace Empty Strings with NULL**: Whether to replace empty strings with NULL in input. This may be useful when working with data exported from spreadsheet software.

### Select

Use this operation to select rows in a table.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [Postgres credential](/integrations/builtin/credentials/postgres.md).
- **Operation**: Select **Select**.
- **Schema**: Choose the schema that contains the table you want to work on. Select **From list** to choose the schema from the dropdown list or **By Name** to enter the schema name.
- **Table**: Choose the table that you want to work on. Select **From list** to choose the table from the dropdown list or **By Name** to enter the table name.
- **Return All**: Whether to return all results or only up to a given limit.
- **Limit**: The maximum number of items to return when **Return All** is disabled.
- **Select Rows**: Set the conditions to select rows. Define a **Column**, **Operator**, and **Value** to match rows on. If you don't select anything, Postgres selects all rows.
- **Combine Conditions**: How to combine the conditions in **Select Rows**. **AND** requires all conditions to be true, while **OR** requires at least one condition to be true.
- **Sort**: Choose how to sort the selected rows. Choose a **Column** from a list or by ID and a sort **Direction**.

#### Select options

- **Connection Timeout**: The number of seconds to try to connect to the database.
- **Delay Closing Idle Connection**: The number of seconds to wait before considering idle connections eligible for closing.
- **Query Batching**: The way to send queries to the database:
	- **Single Query**: A single query for all incoming items.
	- **Independently**: Execute one query per incoming item of the execution.
	- **Transaction**: Execute all queries in a transaction. If a failure occurs, Postgres rolls back all changes.
- **Output Columns**: Choose which columns to output. You can select from a list of available columns or specify IDs using [expressions](/data/expressions.md).
- **Output Large-Format Numbers As**: The format to output `NUMERIC` and `BIGINT` columns as:
	- **Numbers**: Use this for standard numbers.
	- **Text**: Use this if you expect numbers longer than 16 digits. Without this, numbers may be incorrect.

### Update

Use this operation to update rows in a table.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [Postgres credential](/integrations/builtin/credentials/postgres.md).
- **Operation**: Select **Update**.
- **Schema**: Choose the schema that contains the table you want to work on. Select **From list** to choose the schema from the dropdown list or **By Name** to enter the schema name.
- **Table**: Choose the table that you want to work on. Select **From list** to choose the table from the dropdown list or **By Name** to enter the table name.
- **Mapping Column Mode**: How to map column names to incoming data:
	- **Map Each Column Manually**: Select the values to use for each column.
	- **Map Automatically**: Automatically map incoming data to matching column names in Postgres. The incoming data field names must match the column names in Postgres for this to work. If necessary, consider using the [edit fields (set) node](/integrations/builtin/core-nodes/n8n-nodes-base.set.md) before this node to adjust the format as needed.

#### Update options

- **Connection Timeout**: The number of seconds to try to connect to the database.
- **Delay Closing Idle Connection**: The number of seconds to wait before considering idle connections eligible for closing.
- **Query Batching**: The way to send queries to the database:
	- **Single Query**: A single query for all incoming items.
	- **Independently**: Execute one query per incoming item of the execution.
	- **Transaction**: Execute all queries in a transaction. If a failure occurs, Postgres rolls back all changes.
- **Output Columns**: Choose which columns to output. You can select from a list of available columns or specify IDs using [expressions](/data/expressions.md).
- **Output Large-Format Numbers As**: The format to output `NUMERIC` and `BIGINT` columns as:
	- **Numbers**: Use this for standard numbers.
	- **Text**: Use this if you expect numbers longer than 16 digits. Without this, numbers may be incorrect.
- **Replace Empty Strings with NULL**: Whether to replace empty strings with NULL in input. This may be useful when working with data exported from spreadsheet software.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Related resources

n8n provides a trigger node for Postgres. You can find the trigger node docs [here](/integrations/builtin/trigger-nodes/n8n-nodes-base.postgrestrigger.md).

## Use query parameters

When creating a query to run on a Postgres database, you can use the **Query Parameters** field in the **Options** section to load data into the query. n8n sanitizes data in query parameters, which prevents SQL injection.

For example, you want to find a person by their email address. Given the following input data:

```js
[
    {
        "email": "alex@example.com",
        "name": "Alex",
        "age": 21 
    },
    {
        "email": "jamie@example.com",
        "name": "Jamie",
        "age": 33 
    }
]
```

You can write a query like:

```sql
SELECT * FROM $1:name WHERE email = $2;
```

Then in **Query Parameters**, provide the field values to use. You can provide fixed values or expressions. For this example, use expressions so the node can pull the email address from each input item in turn:

```js
// users is an example table name
 
```

## Common issues

For common questions or issues and suggested solutions, refer to [Common issues](/integrations/builtin/app-nodes/n8n-nodes-base.postgres/common-issues.md).

---

# Postgres node common issues

Here are some common errors and issues with the [Postgres node](/integrations/builtin/app-nodes/n8n-nodes-base.postgres/index.md) and steps to resolve or troubleshoot them.

## Dynamically populate SQL `IN` groups with parameters

In Postgres, you can use the SQL [`IN` comparison construct](https://www.postgresql.org/docs/current/functions-comparisons.html#FUNCTIONS-COMPARISONS-IN-SCALAR) to make comparisons between groups of values:

```sql
SELECT color, shirt_size FROM shirts WHERE shirt_size IN ('small', 'medium', 'large');
```

While you can use n8n [expressions](/data/expressions.md) in your query to dynamically populate the values in an `IN` group, combining this with [query parameters](/integrations/builtin/app-nodes/n8n-nodes-base.postgres/index.md#use-query-parameters) provides extra protection by automatically sanitizing input.

To construct an `IN` group query with query parameters:

1. Set the **Operation** to **Execute Query**.
2. In **Options**, select **Query Parameters**.
3. Use an expression to select an array from the input data. For example, ``.
4. In the **Query** parameter, write your query with the `IN` construct with an empty set of parentheses. For example:
	```sql
	SELECT color, shirt_size FROM shirts WHERE shirt_size IN ();
	```
5. Inside of the `IN` parentheses, use an expression to dynamically create index-based placeholders (like `$1`, `$2`, and `$3`) for the number of items in your query parameter array. You can do this by increasing each array index by one since the placeholder variables are 1 indexed:
	```sql
	SELECT color, shirt_size FROM shirts WHERE shirt_size IN ();
	```

With this technique, n8n automatically creates the correct number of [prepared statement placeholders](https://www.postgresql.org/docs/current/sql-prepare.html) for the `IN` values according to the number of items in your array.

## Working with timestamps and time zones

To avoid complications with how n8n and Postgres interpret timestamp and time zone data, follow these general tips:

- **Use UTC when storing and passing dates**: Using UTC helps avoid confusion over timezone conversions when converting dates between different representations and systems.
- **Set the execution timezone**: Set the global timezone in n8n using either [environment variables](/hosting/configuration/configuration-examples/time-zone.md) (for self-hosted) or in the [settings](/manage-cloud/set-cloud-timezone.md) (for n8n Cloud). You can set a workflow-specific timezone in the [workflow settings](/workflows/settings.md).
- **Use ISO 8601 format**: The [ISO 8601 format](https://en.wikipedia.org/wiki/ISO_8601) encodes the day of the month, month, year, hour, minutes, and seconds in a standardized string. n8n passes dates between nodes as strings and uses [Luxon](/data/specific-data-types/luxon.md) to parse dates. If you need to cast to ISO 8601 explicitly, you can use the [Date & Time node](/integrations/builtin/core-nodes/n8n-nodes-base.datetime.md) and a custom format set to the string `yyyy-MM-dd'T'HH:mm:ss`.

## Outputting Date columns as date strings instead of ISO datetime strings 

n8n's uses the [`pg` package](https://www.npmjs.com/package/pg) to integrate with Postgres, which affects how n8n processes date, timestamp, and related types from Postgres.

The `pg` package parses `DATE` values into `new Date(row_value)` by default, which produces a date that follows the [ISO 8601 datetime string](https://en.wikipedia.org/wiki/ISO_8601#Combined_date_and_time_representations) format. For example, a date of `2025-12-25` might produce a datetime sting of `2025-12-25T23:00:00.000Z` depending on the instance's timezone settings.

To work around this, use the [Postgres `TO_CHAR` function](https://www.postgresql.org/docs/current/functions-formatting.html#FUNCTIONS-FORMATTING) to format the date into the expected format at query time:

```sql
SELECT TO_CHAR(date_col, 'YYYY-MM-DD') AS date_col_as_date FROM table_with_date_col
```

This will produce the date as a string without the time or timezone components. To continue the earlier example, with this casting, a date of `2025-12-25` would produce the string `2025-12-25`. You can find out more in the [`pg` package documentation on dates](https://node-postgres.com/features/types#date--timestamp--timestamptz).