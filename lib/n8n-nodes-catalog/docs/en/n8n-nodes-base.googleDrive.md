# Google Drive node

Use the Google Drive node to automate work in Google Drive, and integrate Google Drive with other applications. n8n has built-in support for a wide range of Google Drive features, including creating, updating, listing, deleting, and getting drives, files, and folders. 

On this page, you'll find a list of operations the Google Drive node supports and links to more resources.

> **Credentials**
>
> Refer to [Google Drive credentials](/integrations/builtin/credentials/google/index.md) for guidance on setting up authentication.

## Operations

* **File**
    * [**Copy**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/file-operations.md#copy-a-file) a file
    * [**Create from text**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/file-operations.md#create-from-text)
    * [**Delete**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/file-operations.md#delete-a-file) a file
    * [**Download**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/file-operations.md#download-a-file) a file
    * [**Move**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/file-operations.md#move-a-file) a file
    * [**Share**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/file-operations.md#share-a-file) a file
    * [**Update**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/file-operations.md#update-a-file) a file
    * [**Upload**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/file-operations.md#upload-a-file) a file
* **File/Folder**
    * [**Search**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/file-folder-operations.md#search-files-and-folders) files and folders
* **Folder**
    * [**Create**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/folder-operations.md#create-a-folder) a folder
    * [**Delete**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/folder-operations.md#delete-a-folder) a folder
    * [**Share**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/folder-operations.md#share-a-folder) a folder
* **Shared Drive**
    * [**Create**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/shared-drive-operations.md#create-a-shared-drive) a shared drive
    * [**Delete**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/shared-drive-operations.md#delete-a-shared-drive) a shared drive
    * [**Get**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/shared-drive-operations.md#get-a-shared-drive) a shared drive
    * [**Get Many**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/shared-drive-operations.md#get-many-shared-drives) shared drives
    * [**Update**](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/shared-drive-operations.md#update-a-shared-drive) a shared drive

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Common issues

For common questions or issues and suggested solutions, refer to [Common issues](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/common-issues.md).

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.

---

# Google Drive node common issues

Here are some common errors and issues with the [Google Drive node](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/index.md) and steps to resolve or troubleshoot them.

## Google hasn't verified this app

--8<-- "_snippets/integrations/builtin/credentials/google/unverified-app.md"

## Google Cloud app becoming unauthorized

--8<-- "_snippets/integrations/builtin/credentials/google/app-becoming-unauthorized.md"

## Google Drive OAuth error

If using the OAuth authentication method, you may see an error indicating that you can't sign in because the app doesn't meet Google's expectations for keeping apps secure.

Most often, the actual cause of this issue is that the URLs don't match between Google's OAuth configuration and n8n. To avoid this, start by reviewing any links included in Google's error message. This will contain details about the exact error that occurred.

If you are self-hostin n8n, check the n8n configuration items used to construct external URLs. Verify that the [`N8N_EDITOR_BASE_URL`](/hosting/configuration/environment-variables/deployment.md) and [`WEBHOOK_URL`](/hosting/configuration/configuration-examples/webhook-url.md) environment variables use fully qualified domains.

## Get recent files from Google Drive

To retrieve recent files from Google Drive, you need to sort files by modification time. To do this, you need to search for existing files and retrieve their modification times. Next you can sort the files to find the most recent file and use another Google Drive node target the file by ID.

The process looks like this:

1. Add a **Google Drive** node to your canvas.
2. Select the **File/Folder** resource and the **Search** operation.
3. Enable **Return All** to sort through all files.
4. Set the **What to Search** filter to **Files**.
5. In the **Options**, set the **Fields** to **All**.
6. Connect a **Sort** node to the output of the **Google Drive** node.
7. Choose **Simple** sort type.
8. Enter `modifiedTime` as the **Field Name** in the **Fields To Sort By** section.
9. Choose **Descending** sort order.
10. Add a **Limit** node to the output of the **Sort** node.
11. Set **Max Items** to **1** to keep the most recent file.
12. Connect another **Google Drive** node to the output of the **Limit** node.
13. Select **File** as the **Resource** and the operation of your choice.
14. In the **File** selection, choose **By ID**.
15. Select **Expression** and enter `` as the expression.