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

# Google Drive File and Folder operations

Use this operation to search for files and folders in Google Drive. Refer to [Google Drive](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/index.md) for more information on the Google Drive node itself.

--8<-- "_snippets/integrations/builtin/app-nodes/ai-tools.md"

## Search files and folders

Use this operation to search for files and folders in a drive.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [Google Drive credentials](/integrations/builtin/credentials/google/index.md).
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

# Google Drive Folder operations

Use this operation to create, delete, and share folders in Google Drive. Refer to [Google Drive](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/index.md) for more information on the Google Drive node itself.

--8<-- "_snippets/integrations/builtin/app-nodes/ai-tools.md"

## Create a folder

Use this operation to create a new folder in a drive.

Enter these parameters:
- **Credential to connect with**: Create or select an existing [Google Drive credentials](/integrations/builtin/credentials/google/index.md).
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

- **Credential to connect with**: Create or select an existing [Google Drive credentials](/integrations/builtin/credentials/google/index.md).
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

- **Credential to connect with**: Create or select an existing [Google Drive credentials](/integrations/builtin/credentials/google/index.md).
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

# Google Drive Shared Drive operations

Use this operation to create, delete, get, and update shared drives in Google Drive. Refer to [Google Drive](/integrations/builtin/app-nodes/n8n-nodes-base.googledrive/index.md) for more information on the Google Drive node itself.

--8<-- "_snippets/integrations/builtin/app-nodes/ai-tools.md"

## Create a shared drive

Use this operation to create a new shared drive.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [Google Drive credentials](/integrations/builtin/credentials/google/index.md).
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

- **Credential to connect with**: Create or select an existing [Google Drive credentials](/integrations/builtin/credentials/google/index.md).
- **Resource**: Select **Shared Drive**.
- **Operation**: Select **Delete**.
- **Shared Drive**: Choose the shared drive want to delete. 
    - Select **From list** to choose the title from the dropdown list, **By URL** to enter the URL of the drive, or **By ID** to enter the `driveId`. 
    - You can find the `driveId` in the URL for the shared Google Drive: `https://drive.google.com/drive/u/0/folders/driveID`.

Refer to the [Method: drives.delete | Google Drive](https://developers.google.com/drive/api/reference/rest/v2/drives/delete) API documentation for more information.

## Get a shared drive

Use this operation to get a shared drive.

Enter these parameters:

- **Credential to connect with**: Create or select an existing [Google Drive credentials](/integrations/builtin/credentials/google/index.md).
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

- **Credential to connect with**: Create or select an existing [Google Drive credentials](/integrations/builtin/credentials/google/index.md).
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

- **Credential to connect with**: Create or select an existing [Google Drive credentials](/integrations/builtin/credentials/google/index.md).
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