# Google Drive node documentation

> Learn how to use the Google Drive node in n8n. Follow technical documentation to integrate Google Drive node into your workflows.

# Google Drive node

Use the Google Drive node to automate work in Google Drive, and integrate Google Drive with other applications. n8n has built-in support for a wide range of Google Drive features, including creating, updating, listing, deleting, and getting drives, files, and folders. 

On this page, you'll find a list of operations the Google Drive node supports and links to more resources.

> **Credentials**
>
> Refer to [Google Drive credentials](https://docs.n8n.io/integrations/builtin/credentials/google/) for guidance on setting up authentication.

## Operations

* **File**
    * [**Copy**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/file-operations/#copy-a-file) a file
    * [**Create from text**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/file-operations/#create-from-text)
    * [**Delete**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/file-operations/#delete-a-file) a file
    * [**Download**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/file-operations/#download-a-file) a file
    * [**Move**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/file-operations/#move-a-file) a file
    * [**Share**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/file-operations/#share-a-file) a file
    * [**Update**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/file-operations/#update-a-file) a file
    * [**Upload**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/file-operations/#upload-a-file) a file
* **File/Folder**
    * [**Search**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/file-folder-operations/#search-files-and-folders) files and folders
* **Folder**
    * [**Create**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/folder-operations/#create-a-folder) a folder
    * [**Delete**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/folder-operations/#delete-a-folder) a folder
    * [**Share**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/folder-operations/#share-a-folder) a folder
* **Shared Drive**
    * [**Create**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/shared-drive-operations/#create-a-shared-drive) a shared drive
    * [**Delete**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/shared-drive-operations/#delete-a-shared-drive) a shared drive
    * [**Get**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/shared-drive-operations/#get-a-shared-drive) a shared drive
    * [**Get Many**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/shared-drive-operations/#get-many-shared-drives) shared drives
    * [**Update**](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/shared-drive-operations/#update-a-shared-drive) a shared drive

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for google-drive at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/)

## Common issues

For common questions or issues and suggested solutions, refer to [Common issues](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/common-issues/).

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](https://docs.n8n.io/integrations/custom-operations/) for more information.

---

<!-- sibling:common-issues.md -->
## Common Issues

# Google Drive node common issues

Here are some common errors and issues with the [Google Drive node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/) and steps to resolve or troubleshoot them.

## Google hasn't verified this app

--8<-- "_snippets/integrations/builtin/credentials/google/unverified-app.md"

## Google Cloud app becoming unauthorized

--8<-- "_snippets/integrations/builtin/credentials/google/app-becoming-unauthorized.md"

## Google Drive OAuth error

If using the OAuth authentication method, you may see an error indicating that you can't sign in because the app doesn't meet Google's expectations for keeping apps secure.

Most often, the actual cause of this issue is that the URLs don't match between Google's OAuth configuration and n8n. To avoid this, start by reviewing any links included in Google's error message. This will contain details about the exact error that occurred.

If you are self-hostin n8n, check the n8n configuration items used to construct external URLs. Verify that the [`N8N_EDITOR_BASE_URL`](https://docs.n8n.io/hosting/configuration/environment-variables/deployment/) and [`WEBHOOK_URL`](https://docs.n8n.io/hosting/configuration/configuration-examples/webhook-url/) environment variables use fully qualified domains.

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

---

<!-- sibling:file-folder-operations.md -->
## File Folder Operations

# Google Drive File and Folder operations

Use this operation to search for files and folders in Google Drive. Refer to [Google Drive](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/) for more information on the Google Drive node itself.

--8<-- "_snippets/integrations/builtin/app-nodes/ai-tools.md"

## Search files and folders

Use this operation to search for files and folders in a drive.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [Google Drive credentials](https://docs.n8n.io/integrations/builtin/credentials/google/).
- **Resource**: Select **File/Folder**.
- **Operation**: Select **Search**.
- **Search Method**: Choose how you want to search:
	- **Search File/Folder Name**: Fill out the **Search Query** with the name of the file or folder you want to search for. Returns files and folders that are partial matches for the query as well.
	- **Advanced Search**: Fill out the **Query String** to search for files and folders using [Google query string syntax](https://developers.google.com/drive/api/guides/search-files).
- **Return All**: Choose whether to return all results or only up to a given limit.
- **Limit**: The maximum number of items to return when **Return All** is disabled.
- **Filter**: Choose whether to limit the scope of your search:
	- **Drive**: The drive you want to search in. By default, uses your personal "My Drive". Select **From list** to choose the drive from the dropdown list, **By URL** to enter the URL of the drive, or **By ID** to enter the `driveId`. 
		- You can find the `driveId` by visiting the shared drive in your browser and copying the last URL component: `https://drive.google.com/drive/u/1/folders/driveId`.
	- **Folder**: The folder to search in. Select **From list** to choose the folder from the dropdown list, **By URL** to enter the URL of the folder, or **By ID** to enter the `folderId`. 
		- You can find the `folderId` by visiting the shared folder in your browser and copying the last URL component: `https://drive.google.com/drive/u/1/folders/folderId`.
	- **What to Search**: Whether to search for **Files and Folders**, **Files**, or **Folders**.
	- **Include Trashed Items**: Whether to also return items in the Drive's trash.

### Options

- **Fields**: Select the fields to return. Can be one or more of the following: **[All]**, **explicitlyTrashed**, **exportLinks**, **hasThumbnail**, **iconLink**, **ID**, **Kind**, **mimeType**, **Name**, **Permissions**, **Shared**, **Spaces**, **Starred**, **thumbnailLink**, **Trashed**, **Version**, or **webViewLink**.

Refer to the [Method: files.list | Google Drive](https://developers.google.com/drive/api/reference/rest/v2/files/list) API documentation for more information.

---

<!-- sibling:file-operations.md -->
## File Operations

# Google Drive File operations

Use this operation to create, delete, change, and manage files in Google Drive. Refer to [Google Drive](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/) for more information on the Google Drive node itself.

--8<-- "_snippets/integrations/builtin/app-nodes/ai-tools.md"

## Copy a file

Use this operation to copy a file to a drive.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [Google Drive credentials](https://docs.n8n.io/integrations/builtin/credentials/google/).
- **Resource**: Select **File**.
- **Operation**: Select **Copy**.
- **File**: Choose a file you want to copy. 
    - Select **From list** to choose the title from the dropdown list, **By URL** to enter the URL of the file, or **By ID** to enter the `fileId`. 
    - You can find the `fileId` in a shareable Google Drive file URL: `https://docs.google.com/document/d/fileId/edit#gid=0`. In your Google Drive, select **Share > Copy link** to get the shareable file URL.
- **File Name**: The name to use for the new copy of the file.
- **Copy In The Same Folder**: Choose whether to copy the file to the same folder. If disabled, set the following:
	- **Parent Drive**: Select **From list** to choose the drive from the dropdown list, **By URL** to enter the URL of the drive, or **By ID** to enter the `driveId`. 
	- **Parent Folder**: Select **From list** to choose the folder from the dropdown list, **By URL** to enter the URL of the folder, or **By ID** to enter the `folderId`. 
	- You can find the `driveId` and `folderID` by visiting the shared drive or folder in your browser and copying the last URL component: `https://drive.google.com/drive/u/1/folders/driveId`.

### Options

- **Copy Requires Writer Permissions**: Select whether to enable readers and commenters to copy, print, or download the new file.
- **Description**: A short description of the file.

Refer to the [Method: files.copy | Google Drive](https://developers.google.com/drive/api/reference/rest/v2/files/copy) API documentation for more information.

## Create from text

Use this operation to create a new file in a drive from provided text.

Enter these parameters:
- **Credential to connect with**: Create or select an existing [Google Drive credentials](https://docs.n8n.io/integrations/builtin/credentials/google/).
- **Resource**: Select **File**.
- **Operation**: Select **Create From Text**.
- **File Content**: Enter the file content to use to create the new file.
- **File Name**: The name to use for the new file.
- **Parent Drive**: Select **From list** to choose the drive from the dropdown list, **By URL** to enter the URL of the drive, or **By ID** to enter the `driveId`. 
- **Parent Folder**: Select **From list** to choose the folder from the dropdown list, **By URL** to enter the URL of the folder, or **By ID** to enter the `folderId`. 

You can find the `driveId` and `folderID` by visiting the shared drive or folder in your browser and copying the last URL component: `https://drive.google.com/drive/u/1/folders/driveId`.

### Options

- **APP Properties**: A bundle of arbitrary key-value pairs which are private to the requesting app.
- **Properties**: A bundle of arbitrary key-value pairs which are visible to all apps.
- **Keep Revision Forever**: Choose whether to set the `keepForever` field in the new head revision. This only applies to files with binary content. You can keep a maximum of 200 revisions, after which you must delete the pinned revisions.
<!-- vale from-microsoft.RangeFormat = NO -->
<!-- vale from-microsoft.Ranges = NO -->
- **OCR Language**: An [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) language code to help the OCR interpret the content during import.
<!-- vale from-microsoft.Ranges = YES -->
<!-- vale from-microsoft.RangeFormat = YES -->
- **Use Content As Indexable Text**: Choose whether to mark the uploaded content as indexable text.
- **Convert to Google Document**: Choose whether to create a Google Document instead of the default `.txt` format. You must enable the Google Docs API in the [Google API Console](https://console.cloud.google.com/apis/library/docs.googleapis.com) for this to work.

Refer to the [Method: files.insert | Google Drive](https://developers.google.com/drive/api/reference/rest/v2/files/insert) API documentation for more information.

## Delete a file

Use this operation to delete a file from a drive.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [Google Drive credentials](https://docs.n8n.io/integrations/builtin/credentials/google/).
- **Resource**: Select **File**.
- **Operation**: Select **Delete**.
- **File**: Choose a file you want to delete. 
    - Select **From list** to choose the title from the dropdown list, **By URL** to enter the URL of the file, or **By ID** to enter the `fileId`. 
    - You can find the `fileId` in a shareable Google Drive file URL: `https://docs.google.com/document/d/fileId/edit#gid=0`. In your Google Drive, select **Share > Copy link** to get the shareable file URL.

### Options

- **Delete Permanently**: Choose whether to delete the file now instead of moving it to the trash.

Refer to the [Method: files.delete | Google Drive](https://developers.google.com/drive/api/reference/rest/v2/files/delete) API documentation for more information.

## Download a file

Use this operation to download a file from a drive.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [Google Drive credentials](https://docs.n8n.io/integrations/builtin/credentials/google/).
- **Resource**: Select **File**.
- **Operation**: Select **Download**.
- **File**: Choose a file you want to download. 
    - Select **From list** to choose the title from the dropdown list, **By URL** to enter the URL of the file, or **By ID** to enter the `fileId`. 
    - You can find the `fileId` in a shareable Google Drive file URL: `https://docs.google.com/document/d/fileId/edit#gid=0`. In your Google Drive, select **Share > Copy link** to get the shareable file URL.

### Options

- **Put Output File in Field**: Choose the field name to place the binary file contents to make it available to following nodes.
- **Google File Conversion**: Choose the formats to export as when downloading Google Files:
	* **Google Docs**: Choose the export format to use when downloading Google Docs files:  **HTML**, **MS Word Document**, **Open Office Document**, **PDF**, **Rich Text (rtf)**, or **Text (txt)**.
	* **Google Drawings**: Choose the export format to use when downloading Google Drawing files: **JPEG**, **PDF**, **PNG**, or **SVG**.
	* **Google Slides**: Choose the export format to use when downloading Google Slides files: **MS PowerPoint**, **OpenOffice Presentation**, or **PDF**.
	* **Google Sheets**: Choose the export format to use when downloading Google Sheets files: **CSV**, **MS Excel**, **Open Office Sheet**, or **PDF**.
- **File Name**: The name to use for the downloaded file.

Refer to the [Method: files.get | Google Drive](https://developers.google.com/drive/api/reference/rest/v2/files/get) API documentation for more information.

## Move a file

Use this operation to move a file to a different location in a drive.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [Google Drive credentials](https://docs.n8n.io/integrations/builtin/credentials/google/).
- **Resource**: Select **File**.
- **Operation**: Select **Move**.
- **File**: Choose a file you want to move. 
    - Select **From list** to choose the title from the dropdown list, **By URL** to enter the URL of the file, or **By ID** to enter the `fileId`. 
    - You can find the `fileId` in a shareable Google Drive file URL: `https://docs.google.com/document/d/fileId/edit#gid=0`. In your Google Drive, select **Share > Copy link** to get the shareable file URL.
- **Parent Drive**: Select **From list** to choose the drive from the dropdown list, **By URL** to enter the URL of the drive, or **By ID** to enter the `driveId`. 
- **Parent Folder**: Select **From list** to choose the folder from the dropdown list, **By URL** to enter the URL of the folder, or **By ID** to enter the `folderId`. 

You can find the `driveId` and `folderID` by visiting the shared drive or folder in your browser and copying the last URL component: `https://drive.google.com/drive/u/1/folders/driveId`.

Refer to the [Method: parents.insert | Google Drive](https://developers.google.com/drive/api/reference/rest/v2/parents/insert) API documentation for more information.

## Share a file

Use this operation to add sharing permissions to a file.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [Google Drive credentials](https://docs.n8n.io/integrations/builtin/credentials/google/).
- **Resource**: Select **File**.
- **Operation**: Select **Share**.
- **File**: Choose a file you want to share. 
    - Select **From list** to choose the title from the dropdown list, **By URL** to enter the URL of the file, or **By ID** to enter the `fileId`. 
    - You can find the `fileId` in a shareable Google Drive file URL: `https://docs.google.com/document/d/fileId/edit#gid=0`. In your Google Drive, select **Share > Copy link** to get the shareable file URL.
- **Permissions**: The permissions to add to the file:
	- **Role**: Select what users can do with the file. Can be one of **Commenter**, **File Organizer**, **Organizer**, **Owner**, **Reader**, **Writer**.
	- **Type**: Select the scope of the new permission:
		- **User**: Grant permission to a specific user, defined by entering their **Email Address**.
		- **Group**: Grant permission to a specific group, defined by entering its **Email Address**.
		- **Domain**: Grant permission to a complete domain, defined by the **Domain**.
		- **Anyone**: Grant permission to anyone. Can optionally **Allow File Discovery** to make the file discoverable through search.

### Options

- **Email Message**: A plain text custom message to include in the notification email.
<!-- vale from-microsoft.FirstPerson = NO -->
- **Move to New Owners Root**: Available when trying to transfer ownership while sharing an item not in a shared drive. When enabled, moves the file to the new owner's My Drive root folder.
<!-- vale from-microsoft.FirstPerson = YES -->
- **Send Notification Email**: Whether to send a notification email when sharing to users or groups.
- **Transfer Ownership**: Whether to transfer ownership to the specified user and downgrade the current owner to writer permissions.
- **Use Domain Admin Access**: Whether to perform the action as a domain administrator.

Refer to the [REST Resources: files | Google Drive](https://developers.google.com/drive/api/reference/rest/v2/files) API documentation for more information.

## Update a file

Use this operation to update a file.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [Google Drive credentials](https://docs.n8n.io/integrations/builtin/credentials/google/).
- **Resource**: Select **File**.
- **Operation**: Select **Update**.
- **File to Update**: Choose a file you want to update. 
    - Select **From list** to choose the title from the dropdown list, **By URL** to enter the URL of the file, or **By ID** to enter the `fileId`. 
    - You can find the `fileId` in a shareable Google Drive file URL: `https://docs.google.com/document/d/fileId/edit#gid=0`. In your Google Drive, select **Share > Copy link** to get the shareable file URL.
- **Change File Content**: Choose whether to send new binary data to replace the existing file content. If enabled, fill in the following:
	- **Input Data Field Name**: The name of the input field that contains the binary file data you wish to use.
- **New Updated File Name**: A new name for the file if you want to update the filename.

### Options

- **APP Properties**: A bundle of arbitrary key-value pairs which are private to the requesting app.
- **Properties**: A bundle of arbitrary key-value pairs which are visible to all apps.
- **Keep Revision Forever**: Choose whether to set the `keepForever` field in the new head revision. This only applies to files with binary content. You can keep a maximum of 200 revisions, after which you must delete the pinned revisions.
<!-- vale from-microsoft.RangeFormat = NO -->
<!-- vale from-microsoft.Ranges = NO -->
- **OCR Language**: An [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) language code to help the OCR interpret the content during import.
<!-- vale from-microsoft.Ranges = YES -->
<!-- vale from-microsoft.RangeFormat = YES -->
- **Use Content As Indexable Text**: Choose whether to mark the uploaded content as indexable text.
- **Move to Trash**: Whether to move the file to the trash. Only possible for the file owner.
- **Return Fields**: Return metadata fields about the file. Can be one or more of the following: **[All]**, **explicitlyTrashed**, **exportLinks**, **hasThumbnail**, **iconLink**, **ID**, **Kind**, **mimeType**, **Name**, **Permissions**, **Shared**, **Spaces**, **Starred**, **thumbnailLink**, **Trashed**, **Version**, or **webViewLink**.

Refer to the [Method: files.update | Google Drive](https://developers.google.com/drive/api/reference/rest/v2/files/update) API documentation for more information.

## Upload a file

Use this operation to upload a file.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [Google Drive credentials](https://docs.n8n.io/integrations/builtin/credentials/google/).
- **Resource**: Select **File**.
- **Operation**: Select **Upload**.
- **Input Data Field Name**: The name of the input field that contains the binary file data you wish to use.
- **File Name**: The name to use for the new file.
- **Parent Drive**: Select **From list** to choose the drive from the dropdown list, **By URL** to enter the URL of the drive, or **By ID** to enter the `driveId`. 
- **Parent Folder**: Select **From list** to choose the folder from the dropdown list, **By URL** to enter the URL of the folder, or **By ID** to enter the `folderId`. 

You can find the `driveId` and `folderID` by visiting the shared drive or folder in your browser and copying the last URL component: `https://drive.google.com/drive/u/1/folders/driveId`.

### Options

- **APP Properties**: A bundle of arbitrary key-value pairs which are private to the requesting app.
- **Properties**: A bundle of arbitrary key-value pairs which are visible to all apps.
- **Keep Revision Forever**: Choose whether to set the `keepForever` field in the new head revision. This only applies to files with binary content. You can keep a maximum of 200 revisions, after which you must delete the pinned revisions.
<!-- vale from-microsoft.RangeFormat = NO -->
<!-- vale from-microsoft.Ranges = NO -->
- **OCR Language**: An [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) language code to help the OCR interpret the content during import.
<!-- vale from-microsoft.Ranges = YES -->
<!-- vale from-microsoft.RangeFormat = YES -->
- **Use Content As Indexable Text**: Choose whether to mark the uploaded content as indexable text.
- **Simplify Output**: Choose whether to return a simplified version of the response instead of including all fields.

Refer to the [Method: files.insert | Google Drive](https://developers.google.com/drive/api/reference/rest/v2/files/insert) API documentation for more information.

---

<!-- sibling:folder-operations.md -->
## Folder Operations

# Google Drive Folder operations

Use this operation to create, delete, and share folders in Google Drive. Refer to [Google Drive](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/) for more information on the Google Drive node itself.

--8<-- "_snippets/integrations/builtin/app-nodes/ai-tools.md"

## Create a folder

Use this operation to create a new folder in a drive.

Enter these parameters:
- **Credential to connect with**: Create or select an existing [Google Drive credentials](https://docs.n8n.io/integrations/builtin/credentials/google/).
- **Resource**: Select **Folder**.
- **Operation**: Select **Create**.
- **Folder Name**: The name to use for the new folder.
- **Parent Drive**: Select **From list** to choose the drive from the dropdown list, **By URL** to enter the URL of the drive, or **By ID** to enter the `driveId`. 
- **Parent Folder**: Select **From list** to choose the folder from the dropdown list, **By URL** to enter the URL of the folder, or **By ID** to enter the `folderId`. 

You can find the `driveId` and `folderID` by visiting the shared drive or folder in your browser and copying the last URL component: `https://drive.google.com/drive/u/1/folders/driveId`.

### Options

- **Simplify Output**: Choose whether to return a simplified version of the response instead of including all fields.
- **Folder Color**: The color of the folder as an RGB hex string.

Refer to the [Method: files.insert | Google Drive](https://developers.google.com/drive/api/reference/rest/v2/files/insert) API documentation for more information.

## Delete a folder

Use this operation to delete a folder from a drive.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [Google Drive credentials](https://docs.n8n.io/integrations/builtin/credentials/google/).
- **Resource**: Select **Folder**.
- **Operation**: Select **Delete**.
- **Folder**: Choose a folder you want to delete. 
    - Select **From list** to choose the folder from the dropdown list, **By URL** to enter the URL of the folder, or **By ID** to enter the `folderId`. 
    - You can find the `folderId` in a Google Drive folder URL: `https://drive.google.com/drive/u/0/folders/folderID`.

### Options

- **Delete Permanently**: Choose whether to delete the folder now instead of moving it to the trash.

Refer to the [Method: files.delete | Google Drive](https://developers.google.com/drive/api/reference/rest/v2/files/delete) API documentation for more information.

## Share a folder

Use this operation to add sharing permissions to a folder.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [Google Drive credentials](https://docs.n8n.io/integrations/builtin/credentials/google/).
- **Resource**: Select **Folder**.
- **Operation**: Select **Share**.
- **Folder**: Choose a file you want to move. 
    - Select **From list** to choose the folder from the dropdown list, **By URL** to enter the URL of the folder, or **By ID** to enter the `folderId`. 
    - You can find the `folderId` in a Google Drive folder URL: `https://drive.google.com/drive/u/0/folders/folderID`.
- **Permissions**: The permissions to add to the folder:
	- **Role**: Select what users can do with the folder. Can be one of **Commenter**, **File Organizer**, **Organizer**, **Owner**, **Reader**, **Writer**.
	- **Type**: Select the scope of the new permission:
		- **User**: Grant permission to a specific user, defined by entering their **Email Address**.
		- **Group**: Grant permission to a specific group, defined by entering its **Email Address**.
		- **Domain**: Grant permission to a complete domain, defined by the **Domain**.
		- **Anyone**: Grant permission to anyone. Can optionally **Allow File Discovery** to make the file discoverable through search.

### Options

- **Email Message**: A plain text custom message to include in the notification email.
<!-- vale from-microsoft.FirstPerson = NO -->
- **Move to New Owners Root**: Available when trying to transfer ownership while sharing an item not in a shared drive. When enabled, moves the folder to the new owner's My Drive root folder.
<!-- vale from-microsoft.FirstPerson = YES -->
- **Send Notification Email**: Whether to send a notification email when sharing to users or groups.
- **Transfer Ownership**: Whether to transfer ownership to the specified user and downgrade the current owner to writer permissions.
- **Use Domain Admin Access**: Whether to perform the action as a domain administrator.

Refer to the [REST Resources: files | Google Drive](https://developers.google.com/drive/api/reference/rest/v2/files) API documentation for more information.

---

<!-- sibling:shared-drive-operations.md -->
## Shared Drive Operations

# Google Drive Shared Drive operations

Use this operation to create, delete, get, and update shared drives in Google Drive. Refer to [Google Drive](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/) for more information on the Google Drive node itself.

--8<-- "_snippets/integrations/builtin/app-nodes/ai-tools.md"

## Create a shared drive

Use this operation to create a new shared drive.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [Google Drive credentials](https://docs.n8n.io/integrations/builtin/credentials/google/).
- **Resource**: Select **Shared Drive**.
- **Operation**: Select **Create**.
- **Name**: The name to use for the new shared drive.

### Options

- **Capabilities**: The capabilities to set for the new shared drive (see [REST Resources: drives | Google Drive](https://developers.google.com/drive/api/reference/rest/v3/drives) for more details):
	- **Can Add Children**: Whether the current user can add children to folders in this shared drive.
	- **Can Change Copy Requires Writer Permission Restriction**: Whether the current user can change the `copyRequiresWriterPermission` restriction on this shared drive.
	- **Can Change Domain Users Only Restriction**: Whether the current user can change the `domainUsersOnly` restriction on this shared drive.
	- **Can Change Drive Background**: Whether the current user can change the background on this shared drive.
	- **Can Change Drive Members Only Restriction**: Whether the current user can change the `driveMembersOnly` restriction on this shared drive.
	- **Can Comment**: Whether the current user can comment on files in this shared drive.
	- **Can Copy**: Whether the current user can copy files in this shared drive.
	- **Can Delete Children**: Whether the current user can delete children from folders in this shared drive.
	- **Can Delete Drive**: Whether the current user can delete this shared drive. This operation may still fail if there are items not in the trash in the shared drive.
	- **Can Download**: Whether the current user can download files from this shared drive.
	- **Can Edit**: Whether the current user can edit files from this shared drive.
	- **Can List Children**: Whether the current user can list the children of folders in this shared drive.
	- **Can Manage Members**: Whether the current user can add, remove, or change the role of members of this shared drive.
	- **Can Read Revisions**: Whether the current user can read the revisions resource of files in this shared drive.
	- **Can Rename Drive**: Whether the current user can rename this shared drive.
	- **Can Share**: Whether the current user can share files or folders in this shared drive.
	- **Can Trash Children**: Whether the current user can trash children from folders in this shared drive.
- **Color RGB**: The color of this shared drive as an RGB hex string.
- **Hidden**: Whether to hide this shared drive in the default view.
- **Restrictions**: Restrictions to add to this shared drive (see [REST Resources: drives | Google Drive](https://developers.google.com/drive/api/reference/rest/v3/drives) for more details):
	- **Admin Managed Restrictions**: When enabled, restrictions here will override the similarly named fields to true for any file inside of this shared drive.
	- **Copy Requires Writer Permission**: Whether the options to copy, print, or download files inside this shared drive should be disabled for readers and commenters.
	- **Domain Users Only**: Whether to restrict access to this shared drive and items inside this shared drive to users of the domain to which this shared drive belongs.
	- **Drive Members Only**: Whether to restrict access to items inside this shared drive to its members.

Refer to the [Method: drives.insert | Google Drive](https://developers.google.com/drive/api/reference/rest/v2/drives/insert) API documentation for more information.

## Delete a shared drive

Use this operation to delete a shared drive.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [Google Drive credentials](https://docs.n8n.io/integrations/builtin/credentials/google/).
- **Resource**: Select **Shared Drive**.
- **Operation**: Select **Delete**.
- **Shared Drive**: Choose the shared drive want to delete. 
    - Select **From list** to choose the title from the dropdown list, **By URL** to enter the URL of the drive, or **By ID** to enter the `driveId`. 
    - You can find the `driveId` in the URL for the shared Google Drive: `https://drive.google.com/drive/u/0/folders/driveID`.

Refer to the [Method: drives.delete | Google Drive](https://developers.google.com/drive/api/reference/rest/v2/drives/delete) API documentation for more information.

## Get a shared drive

Use this operation to get a shared drive.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [Google Drive credentials](https://docs.n8n.io/integrations/builtin/credentials/google/).
- **Resource**: Select **Shared Drive**.
- **Operation**: Select **Get**.
- **Shared Drive**: Choose the shared drive want to get. 
    - Select **From list** to choose the title from the dropdown list, **By URL** to enter the URL of the drive, or **By ID** to enter the `driveId`. 
    - You can find the `driveId` in the URL for the shared Google Drive: `https://drive.google.com/drive/u/0/folders/driveID`.

### Options

- **Use Domain Admin Access**: Whether to issue the request as a domain administrator. When enabled, grants the requester access if they're an administrator of the domain to which the shared drive belongs.

Refer to the [Method: drives.get | Google Drive](https://developers.google.com/drive/api/reference/rest/v2/drives/get) API documentation for more information.

<!-- vale from-write-good.Weasel = NO -->
## Get many shared drives

Use this operation to get many shared drives.
<!-- vale from-write-good.Weasel = YES -->

Enter these parameters:

- **Credential to connect with**: Create or select an existing [Google Drive credentials](https://docs.n8n.io/integrations/builtin/credentials/google/).
- **Resource**: Select **Shared Drive**.
- **Operation**: Select **Get Many**.
- **Return All**: Choose whether to return all results or only up to a given limit.
- **Limit**: The maximum number of items to return when **Return All** is disabled.
- **Shared Drive**: Choose the shared drive want to get. 
    - Select **From list** to choose the title from the dropdown list, **By URL** to enter the URL of the drive, or **By ID** to enter the `driveId`. 
    - You can find the `driveId` in the URL for the shared Google Drive: `https://drive.google.com/drive/u/0/folders/driveID`.

### Options

- **Query**: The query string to use to search for shared drives. See [Search for shared drives | Google Drive](https://developers.google.com/drive/api/guides/search-shareddrives) for more information.
- **Use Domain Admin Access**: Whether to issue the request as a domain administrator. When enabled, grants the requester access if they're an administrator of the domain to which the shared drive belongs.

Refer to the [Method: drives.get | Google Drive](https://developers.google.com/drive/api/reference/rest/v2/drives/get) API documentation for more information.

## Update a shared drive

Use this operation to update a shared drive.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [Google Drive credentials](https://docs.n8n.io/integrations/builtin/credentials/google/).
- **Resource**: Select **Shared Drive**.
- **Operation**: Select **Update**.
- **Shared Drive**: Choose the shared drive you want to update. 
    - Select **From list** to choose the drive from the dropdown list, **By URL** to enter the URL of the drive, or **By ID** to enter the `driveId`. 
    - You can find the `driveId` in the URL for the shared Google Drive: `https://drive.google.com/drive/u/0/folders/driveID`.

### Update Fields

- **Color RGB**: The color of this shared drive as an RGB hex string.
- **Name**: The updated name for the shared drive.
- **Restrictions**: Restrictions for this shared drive (see [REST Resources: drives | Google Drive](https://developers.google.com/drive/api/reference/rest/v3/drives) for more details):
	- **Admin Managed Restrictions**: When enabled, restrictions here will override the similarly named fields to true for any file inside of this shared drive.
	- **Copy Requires Writer Permission**: Whether the options to copy, print, or download files inside this shared drive should be disabled for readers and commenters.
	- **Domain Users Only**: Whether to restrict access to this shared drive and items inside this shared drive to users of the domain to which this shared drive belongs.
	- **Drive Members Only**: Whether to restrict access to items inside this shared drive to its members.

Refer to the [Method: drives.update | Google Drive](https://developers.google.com/drive/api/reference/rest/v2/drives/update) API documentation for more information.