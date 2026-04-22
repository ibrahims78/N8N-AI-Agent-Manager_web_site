# Rundeck node documentation

> Learn how to use the Rundeck node in n8n. Follow technical documentation to integrate Rundeck node into your workflows.

# Rundeck node

Use the Rundeck node to automate work in Rundeck, and integrate Rundeck with other applications. n8n has built-in support for executing jobs and getting metadata.

On this page, you'll find a list of operations the Rundeck node supports and links to more resources.

> **Credentials**
>
> Refer to [Rundeck credentials](/integrations/builtin/credentials/rundeck.md) for guidance on setting up authentication.

## Operations

- **Job**
    - Execute a job
    - Get metadata of a job

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for rundeck at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.rundeck/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.rundeck/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io//) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](/integrations/custom-operations.md) for more information.

## Find the job ID

1. Access your Rundeck dashboard.
2. Open the project that contains the job you want to use with n8n.
3. In the sidebar, select **JOBS**.
4. Under **All Jobs**, select the name of the job you want to use with n8n.
5. In the top left corner, under the name of the job, copy the string that's displayed in smaller font below the job name. This is your job ID.
6. Paste this job ID in the **Job Id** field in n8n.