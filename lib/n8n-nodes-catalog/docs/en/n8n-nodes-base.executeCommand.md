# Execute Command

> Documentation for the Execute Command node in n8n, a workflow automation platform. Includes guidance on usage, and links to examples.

# Execute Command

The Execute Command node runs shell commands on the host machine that runs n8n.

> **Security considerations**
>
> The Execute Command node can introduce significant security risks in environments that operate with untrusted users. Because of this, the node is [disabled](/hosting/securing/blocking-nodes.md#exclude-nodes) by default starting from version 2.0.

> **Which shell runs the command?**
>
> This node executes the command in the default shell of the host machine. For example, `cmd` on Windows and `zsh` on macOS.
> 
> If you run n8n with Docker, your command will run in the n8n container and not the Docker host.
> 
> If you're using [queue mode](/hosting/scaling/queue-mode.md), the command runs on the worker that's executing the task in production mode. When running manual executions, it runs on the main instance, unless you set `OFFLOAD_MANUAL_EXECUTIONS_TO_WORKERS` to `true`.

> **Not available on Cloud**
>
> This node isn't available on n8n Cloud.

## Node parameters

Configure the node using the following parameters.

### Execute Once

Choose whether you want the node to execute only once (turned on) or once for every item it receives as input (turned off).

### Command

Enter the command to execute on the host machine. Refer to sections below for examples of running [multiple commands](#run-multiple-commands) and [cURL commands](#run-curl-command).

#### Run multiple commands

Use one of two methods to run multiple commands in one Execute Command node:

* Enter each command on one line separated by `&&`. For example, you can combine the change directory (cd) command with the list (ls) command using `&&`.

    ```bash
    cd bin && ls
    ```

* Enter each command on a separate line. For example, you can write the list (ls) command on a new line after the change directory (cd) command.

    ```bash
    cd bin
    ls
    ```

#### Run cURL command

You can also use the [HTTP Request](https://docs.n8n.io//) node to make a cURL request.

If you want to run the curl command in the Execute Command node, you will have to build a Docker image based on the existing n8n image. The default n8n Docker image uses Alpine Linux. You will have to install the curl package.

1. Create a file named `Dockerfile`.
2. Add the below code snippet to the Dockerfile.

    ```shell
    FROM docker.n8n.io/n8nio/n8n
    USER root
    RUN apk --update add curl
    USER node
    ```

3. In the same folder, execute the command below to build the Docker image.

    ```shell
    docker build -t n8n-curl
    ```

4. Replace the Docker image you used before. For example, replace `docker.n8n.io/n8nio/n8n` with `n8n-curl`.
5. Run the newly created Docker image. You'll now be able to execute ssh using the Execute Command Node.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for execute-command at [https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.executecommand/](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.executecommand/)

## Common issues

For common questions or issues and suggested solutions, refer to [Common Issues](https://docs.n8n.io/common-issues/).

---

<!-- sibling:common-issues.md -->
## Common Issues

# Execute Command node common issues

Here are some common errors and issues with the [Execute Command node](https://docs.n8n.io//) and steps to resolve or troubleshoot them.

<!-- vale off -->
## Command failed: &lt;command&gt; /bin/sh: &lt;command&gt;: not found
<!-- vale on -->

This error occurs when the shell environment can't find one of the commands in the **Command** parameter.

To fix this error, review the following:

* Check that the command and its arguments don't have typos in the **Command** parameter.
* Check that the command is in the `PATH` of the user running n8n. 
* If you are running n8n with Docker, check if the command is available within the container by trying to run it manually. If your command isn't included in the container, you might have to extend the official n8n image with a [custom image](https://docs.docker.com/build/building/base-images/) that includes your command.
	* If n8n is already running:
		```sh
		# Find n8n's container ID, it will be the first column
		docker ps | grep n8n
		# Try to execute the command within the running container
		docker container exec <container_ID> <command_to_run>
		```
	* If n8n isn't running:
		```sh
		# Start up a new container that runs the command instead of n8n
		# Use the same image and tag that you use to run n8n normally
		docker run -it --rm --entrypoint /bin/sh docker.n8n.io/n8nio/n8n -c <command_to_run>
		```

<!-- vale off -->
## Error: stdout maxBuffer length exceeded
<!-- vale on -->

This error happens when your command returns more output than the Execute Command node is able to process at one time.

To avoid this error, reduce output your command produces. Check your command's manual page or documentation to see if there are flags to limit or filter output. If not, you may need to pipe the output to another command to remove unneeded info.