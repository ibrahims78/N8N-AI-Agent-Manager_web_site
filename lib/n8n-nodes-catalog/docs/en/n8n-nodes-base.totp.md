# TOTP

> Documentation for the TOTP node in n8n, a workflow automation platform. Includes guidance on usage, and links to examples.

# TOTP

The TOTP node provides a way to generate a TOTP (time-based one-time password).

> **Credentials**
>
> Refer to [TOTP credentials](/integrations/builtin/credentials/totp.md) for guidance on setting up authentication.

## Node parameters

> **This node can be used as an AI tool**
>
> This node can be used to enhance the capabilities of an AI agent. When used in this way, many parameters can be set automatically, or with information directed by AI - find out more in the [AI tool parameters documentation](/advanced-ai/examples/using-the-fromai-function.md).

Configure this node with these parameters.

### Credential to connect with

Select or create a [TOTP credential](/integrations/builtin/credentials/totp.md) for the node to use.

### Operation

**Generate Secret** is the only operation currently supported.

## Node options

Use these **Options** to further configure the node.

### Algorithm

Select the HMAC hashing algorithm to use. Default is SHA1.

### Digits

Enter the number of digits in the generated code. Default is `6`.

### Period

Enter how many seconds the TOTP is valid for. Default is `30`.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

> **🔗 Templates & examples:** browse ready-made workflows for totp at [https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.totp/](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.totp/)