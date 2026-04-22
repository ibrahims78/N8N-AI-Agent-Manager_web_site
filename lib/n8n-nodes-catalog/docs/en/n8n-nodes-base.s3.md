# S3 node documentation

> Learn how to use the S3 node in n8n. Follow technical documentation to integrate S3 node into your workflows.

# S3 node

Use the S3 node to automate work in non-AWS S3 storage and integrate S3 with other applications. n8n has built-in support for a wide range of S3 features, including creating, deleting, and getting buckets, files, and folders. For AWS S3, use [AWS S3](/integrations/builtin/app-nodes/n8n-nodes-base.awss3.md).

Use the S3 node for non-AWS S3 solutions like:

* [MinIO](https://min.io/)
* [Wasabi](https://wasabi.com/)
* [Digital Ocean spaces](https://www.digitalocean.com/products/spaces)

On this page, you'll find a list of operations the S3 node supports and links to more resources.

> **Credentials**
>
> Refer to [S3 credentials](/integrations/builtin/credentials/s3.md) for guidance on setting up authentication.

> **This node can be used as an AI tool**
>
> This node can be used to enhance the capabilities of an AI agent. When used in this way, many parameters can be set automatically, or with information directed by AI - find out more in the [AI tool parameters documentation](/advanced-ai/examples/using-the-fromai-function.md).

## Operations

* Bucket
    * Create a bucket
    * Delete a bucket
    * Get all buckets
    * Search within a bucket
* File
    * Copy a file
    * Delete a file
    * Download a file
    * Get all files
    * Upload a file

    /// note | Attach file for upload
    To attach a file for upload, use another node to pass the file as a data property. Nodes like the [Read/Write Files from Disk](/integrations/builtin/core-nodes/n8n-nodes-base.readwritefile.md) node or the [HTTP Request](https://docs.n8n.io//) work well.
    ///

* Folder
    * Create a folder
    * Delete a folder
    * Get all folders

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for s3 at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.s3/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.s3/)

## Node reference

### Setting file permissions in Wasabi

When uploading files to [Wasabi](https://wasabi.com/), you must set permissions for the files using the **ACL** dropdown and not the toggles.

![File permissions when using the S3 node with Wasabi](/api/catalog/docs/assets/n8n-nodes-base.s3/acl_dropdown.png)