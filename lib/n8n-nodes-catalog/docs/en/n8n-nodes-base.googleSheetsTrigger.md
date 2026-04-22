# Google Sheets Trigger node documentation

> Learn how to use the Google Sheets Trigger node in n8n. Follow technical documentation to integrate Google Sheets Trigger node into your workflows.

# Google Sheets Trigger node

[Google Sheets](https://www.google.com/sheets) is a web-based spreadsheet program that's part of Google's office software suite within its Google Drive service.

> **Credentials**
>
> You can find authentication information for this node [here](https://docs.n8n.io/integrations/builtin/credentials/google/).

> **Examples and templates**
>
> For usage examples and templates to help you get started, refer to n8n's [Google Sheets Trigger integrations](https://n8n.io/integrations/google-sheets-trigger/) page.

## Events

* Row added
* Row updated
* Row added or updated

## Related resources

Refer to [Google Sheet's API documentation](https://developers.google.com/sheets/api) for more information about the service.

n8n provides an app node for Google Sheets. You can find the node docs [here](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/).

View [example workflows and related content](https://n8n.io/integrations/google-sheets-trigger/) on n8n's website.

## Common issues

For common questions or issues and suggested solutions, refer to [Common issues](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.googlesheetstrigger/common-issues/).

---

<!-- sibling:common-issues.md -->
## Common Issues

# Google Sheets Trigger node common issues

Here are some common errors and issues with the [Google Sheets Trigger node](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.googlesheetstrigger/) and steps to resolve or troubleshoot them.

## Stuck waiting for trigger event

When testing the Google Sheets Trigger node with the **Execute step** or **Execute workflow** buttons, the execution may appear stuck and unable to stop listening for events. If this occurs, you may need to exit the workflow and open it again to reset the canvas.

Stuck listening events often occur due to issues with your network configuration outside of n8n. Specifically, this behavior often occurs when you run n8n behind a reverse proxy without configuring websocket proxying.

To resolve this issue, check your reverse proxy configuration (Nginx, Caddy, Apache HTTP Server, Traefik, etc.) to enable websocket support.

## Date and time columns are rendering as numbers

Google Sheets can render dates and times a few different ways.

The [**serial number** format](https://developers.google.com/sheets/api/reference/rest/v4/DateTimeRenderOption), popularized by Lotus 1-2-3 and used my types of spreadsheet software, represents dates as a decimal number. The whole number component (the part left of the decimal) represents the number of days since December 30, 1899. The decimal portion (the part right of the decimal) represents time as a portion of a 24-hour period (for example, `.5` represents noon).

To use a different format for date and time values, adjust the format in your Google Sheet Trigger node. This is available when **Trigger On** is set to **Row Added**:

1. Open the Google Sheet Trigger node on your canvas.
2. Select **Add option**.
3. Select **DateTime Render**.
4. Change **DateTime Render** to **Formatted String**.

The Google Sheets Trigger node will now format date, time, datetime, and duration fields as strings according to their number format.

The number format depends on the spreadsheet's locale settings. You can change the local by opening the spreadsheet and selecting **File > Settings**. In the **General** tab, set **Locale** to your preferred locale. Select **Save settings** to adjust the value.