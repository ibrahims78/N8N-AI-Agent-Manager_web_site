# Webhook node

Use the Webhook node to create [webhooks](https://en.wikipedia.org/wiki/Webhook), which can receive data from apps and services when an event occurs. It's a trigger node, which means it can start an n8n workflow. This allows services to connect to n8n and run a workflow.

You can use the Webhook node as a trigger for a workflow when you want to receive data and run a workflow based on the data. The Webhook node also supports returning the data generated at the end of a workflow. This makes it useful for building a workflow to process data and return the results, like an API endpoint.

The webhook allows you to trigger workflows from services that don't have a dedicated app trigger node.

## Workflow development process

n8n provides different **Webhook URL**s for testing and production. The testing URL includes an option to **Listen for test event**. Refer to [Workflow development](/integrations/builtin/core-nodes/n8n-nodes-base.webhook/workflow-development.md) for more information on building, testing, and shifting your Webhook node to production.

## Node parameters

Use these parameters to configure your node.

### Webhook URLs

The Webhook node has two **Webhook URLs**: test and production. n8n displays the URLs at the top of the node panel.

Select **Test URL** or **Production URL** to toggle which URL n8n displays.

<figure markdown="span">
![Sample Webhook URLs in the Webhook node's Parameters tab display a Test URL and Production URL](/_images/integrations/builtin/core-nodes/webhook/webhook-urls.png)
<figcaption>Sample Webhook URLs in the Webhook node's Parameters tab</figcaption>
</figure>

* **Test**: n8n registers a test webhook when you select **Listen for Test Event** or **Execute workflow**, if the workflow isn't active. When you call the webhook URL, n8n displays the data in the workflow.
* **Production**: n8n registers a production webhook when you publish the workflow. When using the production URL, n8n doesn't display the data in the workflow. You can still view workflow data for a production execution: select the **Executions** tab in the workflow, then select the workflow execution you want to view.

### HTTP Method

The Webhook node supports standard [HTTP Request Methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods):

* DELETE
* GET
* HEAD
* PATCH
* POST
* PUT

    > **Webhook max payload**
>
> The webhook maximum payload size is 16MB.
>   If you're self-hosting n8n, you can change this using the [endpoint environment variable](/hosting/configuration/environment-variables/endpoints.md) `N8N_PAYLOAD_SIZE_MAX`.
> 	///	
> 
> ### Path
> 
> By default, this field contains a randomly generated webhook URL path, to avoid conflicts with other webhook nodes. 
> 
> You can manually specify a URL path, including adding route parameters. For example, you may need to do this if you use n8n to prototype an API and want consistent endpoint URLs.
> 
> The **Path** field can take the following formats:
> 
> - `/:variable`
> - `/path/:variable`
> - `/:variable/path`
> - `/:variable1/path/:variable2`
> - `/:variable1/:variable2`
> 
> ### Supported authentication methods
> 
> You can require authentication for any service calling your webhook URL. Choose from these authentication methods:
> 
> - Basic auth
> - Header auth
> - JWT auth
> - None
> 
> Refer to [Webhook credentials](/integrations/builtin/credentials/webhook.md) for more information on setting up each credential type.
> 
> ### Respond
> 
> * **Immediately**: The Webhook node returns the response code and the message **Workflow got started**.
> * **When Last Node Finishes**: The Webhook node returns the response code and the data output from the last node executed in the workflow.
> * **Using 'Respond to Webhook' Node**: The Webhook node responds as defined in the [Respond to Webhook](/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook.md) node.
> * **Streaming response**: Enables real-time data streaming back to the user as the workflow processes. Requires nodes with streaming support in the workflow (for example, the [AI agent](/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/index.md) node).
> 
> ### Response Code
> 
> Customize the [HTTP response code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) that the Webhook node returns upon successful execution. Select from common response codes or create a custom code.
> 
> ### Response Data
> 
> Choose what data to include in the response body:
> 
> * **All Entries**: The Webhook returns all the entries of the last node in an array.
> * **First Entry JSON**: The Webhook returns the JSON data of the first entry of the last node in a JSON object.
> * **First Entry Binary**: The Webhook returns the binary data of the first entry of the last node in a binary file.
> * **No Response Body**: The Webhook returns without a body.
> 
> Applies only to **Respond > When Last Node Finishes**.
> 
> ## Node options
> 
> Select **Add Option** to view more configuration options. The available options depend on your node parameters. Refer to the table for option availability.
> 
> * **Allowed Origins (CORS)**: Set the permitted cross-origin domains. Enter a comma-separated list of URLs allowed for cross-origin non-preflight requests. Use `*` (default) to allow all origins.
> * **Binary Property**: Enabling this setting allows the Webhook node to receive binary data, such as an image or audio file. Enter the name of the binary property to write the data of the received file to.
> * **Ignore Bots**: Ignore requests from bots like link previewers and web crawlers.
> * **IP(s) Whitelist**: Enable this to limit who (or what) can invoke a Webhook trigger URL. Enter a comma-separated list of allowed IP addresses. Access from IP addresses outside the whitelist throws a 403 error. If left blank, all IP addresses can invoke the webhook trigger URL.
> * **No Response Body**: Enable this to prevent n8n sending a body with the response.
> * **Raw Body**: Specify that the Webhook node will receive data in a raw format, such as JSON or XML.
> * **Response Content-Type**: Choose the format for the webhook body.
> * **Response Data**: Send custom data with the response.
> * **Response Headers**: Send extra headers in the Webhook response. Refer to [MDN Web Docs | Response header](https://developer.mozilla.org/en-US/docs/Glossary/Response_header) to learn more about response headers.
> * **Property Name**: by default, n8n returns all available data. You can choose to return a specific JSON key, so that n8n returns the value.
> 
> | Option | Required node configuration |
> | ------ | --------------------------- | 
> | Allowed Origins (CORS) | Any |
> | Binary Property | Either: <br />HTTP Method > POST <br /> HTTP Method > PATCH <br /> HTTP Method > PUT |
> | Ignore Bots | Any |
> | IP(s) Whitelist | Any |
> | Property Name | Both: <br /> Respond > When Last Node Finishes <br /> Response Data > First Entry JSON |
> | No Response Body | Respond > Immediately |
> | Raw Body | Any |
> | Response Code | Any except Respond > Using 'Respond to Webhook' Node |
> | Response Content-Type | Both: <br /> Respond > When Last Node Finishes <br /> Response Data > First Entry JSON |
> | Response Data | Respond > Immediately |
> | Response Headers | Any |
> 
> ## How n8n secures HTML responses
> 
> Starting with n8n version 1.103.0, n8n automatically wraps HTML responses to webhooks in `<iframe>` tags. This is a security mechanism to protect the instance users.
> 
> This has the following implications:
> 
> - HTML renders in a sandboxed iframe instead of directly in the parent document.
> - JavaScript code that attempts to access the top-level window or local storage will fail.
> - Authentication headers aren't available in the sandboxed iframe (for example, basic auth). You need to use an alternative approach, like embedding a short-lived access token within the HTML.
> - Relative URLs (for example, `<form action="/">`) won't work. Use absolute URLs instead.
> 
> ## Templates and examples
> 
> <!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->
> 
> 
> ## Common issues
> 
> For common questions or issues and suggested solutions, refer to [Common issues](/integrations/builtin/core-nodes/n8n-nodes-base.webhook/common-issues.md).
> 
> 
> ---
> 
> # Common issues and questions
> 
> Here are some common issues and questions for the [Webhook node](/integrations/builtin/core-nodes/n8n-nodes-base.webhook/index.md) and suggested solutions.
> 
> ## Listen for multiple HTTP methods
> 
> By default, the Webhook node accepts calls that use a single method. For example, it can accept GET or POST requests, but not both. If you want to accept calls using multiple methods:
> 
> 1. Open the node **Settings**.
> 1. Turn on **Allow Multiple HTTP Methods**.
> 1. Return to **Parameters**. By default, the node now accepts GET and POST calls. You can add other methods in the **HTTP Methods** field.
> 
> The Webhook node has an output for each method, so you can perform different actions depending on the method.
> 
> ## Use the HTTP Request node to trigger the Webhook node
> 
> The [HTTP Request](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) node makes HTTP requests to the URL you specify.
> 
> 1. Create a new workflow.
> 2. Add the HTTP Request node to the workflow.
> 3. Select a method from the **Request Method** dropdown list. For example, if you select GET as the **HTTP method** in your Webhook node, select GET as the request method in the HTTP Request node.
> 4. Copy the URL from the Webhook node, and paste it in the **URL** field in the HTTP Request node.
> 5. If using the test URL for the webhook node: execute the workflow with the Webhook node.
> 6. Execute the HTTP Request node.
> 
> ## Use curl to trigger the Webhook node
> 
> You can use [curl](https://curl.se/) to make HTTP requests that trigger the Webhook node. note
In the examples, replace `<https://your-n8n.url/webhook/path>` with your webhook URL.  
The examples make GET requests. You can use whichever HTTP method you set in **HTTP Method**.
///

Make an HTTP request without any parameters:

```sh
curl --request GET <https://your-n8n.url/webhook/path>
```

Make an HTTP request with a body parameter:

```sh
curl --request POST <https://your-n8n.url/webhook/path> --data 'key=value'
```

Make an HTTP request with header parameter:

```sh
curl --request GET <https://your-n8n.url/webhook/path> --header 'key=value'
```

Make an HTTP request to send a file:

```sh
curl --request POST <https://your-n8n.url/webhook/path> --form 'key=@/path/to/file'
```
Replace `/path/to/file` with the path of the file you want to send.

## Send a response of type string

By default, the response format is JSON or an array. To send a response of type string:

1. Select **Response Mode** > **When Last Node Finishes**.
2. Select **Response Data** > **First Entry JSON**.
3. Select **Add Option** > **Property Name**.
4. Enter the name of the property that contains the response. This defaults to `data`.
5. Connect an [Edit Fields node](/integrations/builtin/core-nodes/n8n-nodes-base.set.md) to the Webhook node.
6. In the Edit Fields node, select **Add Value** > **String**.
7. Enter the name of the property in the **Name** field. The name should match the property name from step 4.
8. Enter the string value in the **Value** field.
9. Toggle **Keep Only Set** to on (green).

When you call the Webhook, it sends the string response from the Edit Fields node.

## Test URL versus Production URL

n8n generates two **Webhook URLs** for each Webhook node: a **Test URL** and a **Production URL**.

While building or testing a workflow, use the **Test URL**. Once you're ready to use your Webhook URL in production, use the **Production URL**.

| **URL type** | **How to trigger** | **Listening duration** | **Data shown in editor UI?** | 
| :--- | --- | --- | :---: |
| Test URL | Select **Listen for test event** and trigger a test event from the source. | 120 seconds | :white_check_mark: |
| Production URL | Publish the workflow | Until workflow is unpublished | :x: |

Refer to [Workflow development](/integrations/builtin/core-nodes/n8n-nodes-base.webhook/workflow-development.md) for more information.

## IP addresses in whitelist are failing to connect

If you're unable to connect from IP addresses in your IP whitelist, check if you are running n8n behind a reverse proxy.

If so, set the `N8N_PROXY_HOPS` [environment variable](/hosting/configuration/environment-variables/index.md) to the number of reverse-proxies n8n is running behind.

## Only one webhook per path and method

n8n only permits registering one webhook for each path and HTTP method combination (for example, a `GET` request for `/my-request`). This avoids ambiguity over which webhook should receive requests.

If you receive a message that the path and method you chose are already in use, you can either:

* Unpublish the workflow with the conflicting webhook.
* Change the webhook path and/or method for one of the conflicting webhooks.

## Timeouts on n8n Cloud

n8n Cloud uses Cloudflare to protect against malicious traffic. If your webhook doesn't respond within 100 seconds, the incoming request will fail with a [524 status code](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-5xx-errors/error-524/).

Because of this, for long-running processes that might exceed this limit, you may need to introduce polling logic by configuring two separate webhooks:

* One webhook to start the long-running process and send an immediate response.
* A second webhook that you can call at intervals to query the status of the process and retrieve the result once it's complete.