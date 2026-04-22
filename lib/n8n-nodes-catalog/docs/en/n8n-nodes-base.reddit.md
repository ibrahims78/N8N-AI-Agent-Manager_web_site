# Reddit node documentation

> Learn how to use the Reddit node in n8n. Follow technical documentation to integrate Reddit node into your workflows.

# Reddit node

Use the Reddit node to automate work in Reddit, and integrate Reddit with other applications. n8n has built-in support for a wide range of Reddit features, including getting profiles, and users, retrieving post comments and subreddit, as well as submitting, getting, and deleting posts. 

On this page, you'll find a list of operations the Reddit node supports and links to more resources.

> **Credentials**
>
> Refer to [Reddit credentials](https://docs.n8n.io/integrations/builtin/credentials/reddit/) for guidance on setting up authentication.

> **This node can be used as an AI tool**
>
> This node can be used to enhance the capabilities of an AI agent. When used in this way, many parameters can be set automatically, or with information directed by AI - find out more in the [AI tool parameters documentation](https://docs.n8n.io/advanced-ai/examples/using-the-fromai-function/).

## Operations

* Post
    * Submit a post to a subreddit
    * Delete a post from a subreddit
    * Get a post from a subreddit
    * Get all posts from a subreddit
    * Search posts in a subreddit or in all of Reddit.
* Post Comment
    * Create a top-level comment in a post
    * Retrieve all comments in a post
    * Remove a comment from a post
    * Write a reply to a comment in a post
* Profile
    * Get
* Subreddit
    * Retrieve background information about a subreddit.
    * Retrieve information about subreddits from all of Reddit.
* User
    * Get

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for reddit at [https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.reddit/](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.reddit/)

## What to do if your operation isn't supported

If this node doesn't support the operation you want to do, you can use the [HTTP Request node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) to call the service's API.

You can use the credential you created for this service in the HTTP Request node: 

1. In the HTTP Request node, select **Authentication** > **Predefined Credential Type**.
1. Select the service you want to connect to.
1. Select your credential.

Refer to [Custom API operations](https://docs.n8n.io/integrations/custom-operations/) for more information.