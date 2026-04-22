---
title: HTTP Request node documentation
description: Learn how to use the HTTP Request node in n8n. Follow technical documentation to integrate HTTP Request node into your workflows.
contentType: [integration, reference]
priority: critical
---

# HTTP Request node

The HTTP Request node is one of the most versatile nodes in n8n. It allows you to make HTTP requests to query data from any app or service with a REST API. You can use the HTTP Request node a regular node or attached to an [AI agent](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/tools-agent.md) to use as a [tool](/advanced-ai/examples/understand-tools.md){ data-preview }.

When using this node, you're creating a REST API call. You need some understanding of basic API terminology and concepts.

There are two ways to create an HTTP request: configure the [node parameters](#node-parameters) or [import a curl command](#import-curl-command).

/// note | Credentials
Refer to [HTTP Request credentials](/integrations/builtin/credentials/httprequest.md) for guidance on setting up authentication. 
///

## Node parameters

### Method

Select the method to use for the request:

- DELETE
- GET
- HEAD
- OPTIONS
- PATCH
- POST
- PUT

### URL

Enter the endpoint you want to use.

### Authentication

n8n recommends using the **Predefined Credential Type** option when it's available. It offers an easier way to set up and manage credentials, compared to configuring generic credentials.

#### Predefined credentials

Credentials for integrations supported by n8n, including both built-in and community nodes. Use **Predefined Credential Type** for custom operations without extra setup. Refer to [Custom API operations](/integrations/custom-operations.md) for more information.

#### Generic credentials

Credentials for integrations not supported by n8n. You'll need to manually configure the authentication process, including specifying the required API endpoints, necessary parameters, and the authentication method. 

You can select one of the following methods:

* Basic auth
* Custom auth
* Digest auth
* Header auth
* OAuth1 API
* OAuth2 API
* Query auth

Refer to [HTTP request credentials](/integrations/builtin/credentials/httprequest.md) for more information on setting up each credential type.

### Send Query Parameters

Query parameters act as filters on HTTP requests. If the API you're interacting with supports them and the request you're making needs a filter, turn this option on.

**Specify your query parameters** using one of the available options:

* **Using Fields Below**: Enter **Name**/**Value** pairs of **Query Parameters**. To enter more query parameter name/value pairs, select **Add Parameter**. The name is the name of the field you're filtering on, and the value is the filter value.
* **Using JSON**: Enter **JSON** to define your query parameters.

Refer to your service's API documentation for detailed guidance.

### Send Headers

Use this parameter to send headers with your request. Headers contain metadata or context about your request.

**Specify Headers** using one of the available options:

* **Using Fields Below**: Enter **Name**/**Value** pairs of **Header Parameters**. To enter more header parameter name/value pairs, select **Add Parameter**. The name is the header you wish to set, and the value is the value you want to pass for that header.
* **Using JSON**: Enter **JSON** to define your header parameters.

Refer to your service's API documentation for detailed guidance.

### Send Body

If you need to send a body with your API request, turn this option on.

Then select the **Body Content Type** that best matches the format for the body content you wish to send.

<!-- vale Vale.Spelling = NO -->
#### Form URLencoded
<!-- vale Vale.Spelling = YES -->

Use this option to send your body as `application/x-www-form-urlencoded`.

**Specify Body** using one of the available options:

* **Using Fields Below**: Enter **Name**/**Value** pairs of **Body Parameters**. To enter more body parameter name/value pairs, select **Add Parameter**. The name should be the form field name, and the value is what you wish to set that field to.
* **Using Single Field**: Enter your name/value pairs in a single **Body** parameter with format `fieldname1=value1&fieldname2=value2`.

Refer to your service's API documentation for detailed guidance.

#### Form-Data

Use this option to send your body as `multipart/form-data`.

Configure your **Body Parameters** by selecting the **Parameter Type**:

* Choose **Form Data** to enter **Name**/**Value** pairs.
* Choose **n8n Binary File** to pull the body from a file the node has access to.
    * **Name**: Enter the ID of the field to set.
    * **Input Data Field Name**: Enter the name of the incoming field containing the binary file data you want to process.

Select **Add Parameter** to enter more parameters.

Refer to your service's API documentation for detailed guidance.

#### JSON

Use this option to send your body as JSON.

**Specify Body** using one of the available options:

* **Using Fields Below**: Enter **Name**/**Value** pairs of **Body Parameters**. To enter more body parameter name/value pairs, select **Add Parameter**.
* **Using JSON**: Enter **JSON** to define your body.

Refer to your service's API documentation for detailed guidance.

#### n8n Binary File

Use this option to send the contents of a file stored in n8n as the body.

Enter the name of the incoming field that contains the file as the **Input Data Field Name**.

Refer to your service's API documentation for detailed guidance on how to format the file.

#### Raw

Use this option to send raw data in the body.

* **Content Type**: Enter the `Content-Type` header to use for the raw body content. Refer to the IANA [Media types](https://www.iana.org/assignments/media-types/media-types.xhtml) documentation for a full list of MIME content types.
* **Body**: Enter the raw body content to send.

Refer to your service's API documentation for detailed guidance.

## Node options

Select **Add Option** to view and select these options. Options are available to all parameters unless otherwise noted.

### Array Format in Query Parameters

/// note | Option availability
This option is only available when you turn on **Send Query Parameters**.
///

Use this option to control the format for arrays included in query parameters. Choose from these options:

* **No Brackets**: Arrays will format as the name=value for each item in the array, for example: `foo=bar&foo=qux`.
* **Brackets Only**: The node adds square brackets after each array name, for example: `foo[]=bar&foo[]=qux`.
* **Brackets with Indices**: The node adds square brackets with an index value after each array name, for example: `foo[0]=bar&foo[1]=qux`.

Refer to your service's API documentation for guidance on which option to use.

### Batching

Control how to batch large numbers of input items:

* **Items per Batch**: Enter the number of input items to include in each batch.
* **Batch Interval**: Enter the time to wait between each batch of requests in milliseconds. Enter 0 for no batch interval.

### Ignore SSL Issues

By default, n8n only downloads the response if SSL certificate validation succeeds. If you'd like to download the response even if SSL certificate validation fails, turn this option on.

### Lowercase Headers

Choose whether to lowercase header names (turned on, default) or not (turned off).

### Redirects

Choose whether to follow redirects (turned on by default) or not (turned off). If turned on, enter the maximum number of redirects the request should follow in **Max Redirects**.

### Response

Use this option to set some details about the expected API response, including:

* **Include Response Headers and Status**: By default, the node returns only the body. Turn this option on to return the full response (headers and response status code) as well as the body.
* **Never Error**: By default, the node returns success only when the response returns with a 2xx code. Turn this option on to return success regardless of the code returned.
* **Response Format**: Select the format in which the data gets returned. Choose from:
    * **Autodetect** (default): The node detects and formats the response based on the data returned.
    * **File**: Select this option to put the response into a file. Enter the field name where you want the file returned in **Put Output in Field**.
    * **JSON**: Select this option to format the response as JSON.
    * **Text**: Select this option to format the response as plain text. Enter the field name where you want the file returned in **Put Output in Field**.

### Pagination

Use this option to paginate results, useful for handling query results that are too big for the API to return in a single call.

/// note | Inspect the API data first
Some options for pagination require knowledge of the data returned by the API you're using. Before setting up pagination, either check the API documentation, or do an API call without pagination, to see the data it returns.
///
??? Details "Understand pagination"
    Pagination means splitting a large set of data into multiple pages. The amount of data on each page depends on the limit you set.
  
    For example, you make an API call to an endpoint called `/users`. The API wants to send back information on 300 users, but this is too much data for the API to send in one response. 
  
    If the API supports pagination, you can incrementally fetch the data. To do this, you call `/users` with a pagination limit, and a page number or URL to tell the API which page to send. In this example, say you use a limit of 10, and start from page 0. The API sends the first 10 users in its response. You then call the API again, increasing the page number by 1, to get the next 10 results.

Configure the pagination settings:

* **Pagination Mode**:
    * **Off**: Turn off pagination.
    * **Update a Parameter in Each Request**: Use this when you need to dynamically set parameters for each request.
    * **Response Contains Next URL**: Use this when the API response includes the URL of the next page. Use an expression to set **Next URL**.

For example setups, refer to [HTTP Request node cookbook | Pagination](/code/cookbook/http-node/pagination.md).

n8n provides built-in variables for working with HTTP node requests and responses when using pagination:

### Proxy

Use this option if you need to specify an HTTP proxy.

Enter the **Proxy** the request should use. This takes precedence over global settings defined with the [`HTTP_PROXY`, `HTTPS_PROXY`, or `ALL_PROXY` environment variables](/hosting/configuration/environment-variables/deployment.md).

### Timeout

Use this option to set how long the node should wait for the server to send response headers (and start the response body). The node aborts requests that exceed this value for the initial response.

Enter the **Timeout** time to wait in milliseconds.

## Tool-only options

The following options are only available when attached to an [AI agent](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/tools-agent.md) as a [tool](/advanced-ai/examples/understand-tools.md){ data-preview }.

### Optimize Response

Whether to optimize the tool response to reduce the amount of data passed to the LLM. Optimizing the response can reduce costs and can help the LLM ignore unimportant details, often leading to better results.

When optimizing responses, you select an expected response type, which determines other options you can configure. The supported response types are:

#### JSON

When expecting a **JSON** response, you can configure which parts of the JSON data to use as a response with the following choices:

* **Field Containing Data**: This field identifies a specific part of the JSON object that contains your relevant data. You can leave this blank to use the entire response.
* **Include Fields**: This is how you choose which fields you want in your response object. There are three choices:
	* **All**: Include all fields in the response object.
	* **Selected**: Include only the fields specified below.
		* **Fields**: A comma-separated list of fields to include in the response. You can use dot notation to specify nested fields. You can drag fields from the Input panel to add them to the field list.
	* **Exclude**: Include all fields *except* the fields specified below.
		* **Fields**: A comma-separated list of fields to exclude from the response. You can use dot notation to specify nested fields. You can drag fields from the Input panel to add them to the field list.

#### HTML

When expecting **HTML**, you can identify the part of an HTML document relevant to the LLM and optimize the response with the following options:

* **Selector (CSS)**: A specific element or element type to include in the response HTML. Uses the `body` element by default.
* **Return Only Content**: Whether to strip HTML tags and attributes from the response, leaving only the actual content. This uses fewer tokens and may be easier for the model to understand.
	* **Elements To Omit**: A comma-separated list of CSS selectors to exclude when extracting content.
* **Truncate Response**: Whether to limit the response size to save tokens.
	* **Max Response Characters**: The maximum number of characters to include in the HTML response. The default value is 1000.

#### Text

When expecting a generic **Text** response, you can optimize the results with the following options:

* **Truncate Response**: Whether to limit the response size to save tokens.
	* **Max Response Characters**: The maximum number of characters to include in the HTML response. The default value is 1000.

## Import curl command

[curl](https://curl.se/) is a command line tool and library for transferring data with URLs.

You can use curl to call REST APIs. If the API documentation of the service you want to use provides curl examples, you can copy them out of the documentation and into n8n to configure the HTTP Request node.

Import a curl command:

/// note | Import format
This option always imports any parameter values as strings. If you wish to preserve the type of numbers and booleans in your request, switch **Using Fields Below** to **Using JSON** and paste your JSON object containing the parameters.
///

1. From the HTTP Request node's **Parameters** tab, select **Import cURL**. The **Import cURL command** modal opens.
2. Paste your curl command into the text box.
3. Select **Import**. n8n loads the request configuration into the node fields. This overwrites any existing configuration.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Common issues

For common questions or issues and suggested solutions, refer to [Common Issues](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/common-issues.md).

---

# HTTP Request node common issues

Here are some common errors and issues with the [HTTP Request node](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) and steps to resolve or troubleshoot them.

## Bad request - please check your parameters

This error displays when the node receives a 400 error indicating a bad request. This error most often occurs because:

* You're using an invalid name or value in a **Query Parameter**.
* You're passing array values in a **Query Parameter** but the array isn't formatted correctly. Try using the [**Array Format in Query Parameters**](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md#array-format-in-query-parameters) option.

Review the API documentation for your service to format your query parameters.

<!-- vale off -->
## The resource you are requesting could not be found
<!-- vale on -->

This error displays when the endpoint **URL** you entered is invalid.

This may be due to a typo in the URL or a deprecated API. Refer to your service's API documentation to verify you have a valid endpoint.

## JSON parameter need to be an valid JSON

This error displays when you've passed a parameter as JSON and it's not formatted as valid JSON.

To resolve, review the JSON you've entered for these issues:

* Test your JSON in a JSON checker or syntax parser to find errors like missing quotation marks, extra or missing commas, incorrectly formatted arrays, extra or missing square brackets or curly brackets, and so on.
* If you've used an **Expression** in the node, be sure you've wrapped the entire JSON in double curly brackets, for example:
    ```
    {{
        {
        "myjson":
        {
            "name1": "value1",
            "name2": "value2",
            "array1":
                ["value1","value2"]
        }
        }
    }}
    ```

## Forbidden - perhaps check your credentials

This error displays when the node receives a 403 error indicating authentication failed.

To resolve, review the selected credentials and make sure you can authenticate with them. You may need to:

* Update permissions or scopes so that your API key or account can perform the operation you've selected.
* Format your generic credential in a different way.
* Generate a new API key or token with the appropriate permissions or scopes.

## 429 - The service is receiving too many requests from you

This error displays when the node receives a [429 error](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) from the service that you're calling. This often means that you have hit the rate limits of that service. You can find out more on the [Handling API rate limits](/integrations/builtin/rate-limits.md) page.

To resolve the error, you can use one of the built-in options of the HTTP request node:

### Batching

Use this option to send requests in batches and introduce a delay between them.

1. In the HTTP Request node, select **Add Option > Batching**.
1. Set **Items per Batch** to the number of input items to include in each request.
1. Set **Batch Interval (ms)** to introduce a delay between requests in milliseconds. For example, to send one request to an API per second, set **Batch Interval (ms)** to `1000`.

### Retry on Fail

Use this option to retry the node after a failed attempt.

1. In the HTTP Request node, go to **Settings** and enable **Retry on Fail**.
1. Set **Max Tries** to the maximum number of times n8n should retry the node.
1. Set **Wait Between Tries (ms)** to the desired delay in milliseconds between retries. For example, to wait one second before retrying the request again, set **Wait Between Tries (ms)** to `1000`.