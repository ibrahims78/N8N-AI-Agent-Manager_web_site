# Code node documentation

> Documentation for the Code node in n8n, a workflow automation platform. Includes guidance on usage, and links to examples.

# Code node

Use the Code node to write custom JavaScript or Python and run it as a step in your workflow.

> **Coding in n8n**
>
> This page gives usage information about the Code node. For more guidance on coding in n8n, refer to the [Code](/code/index.md) section. It includes:
> 
> * Reference documentation on [Built-in methods and variables](/code/builtin/overview.md)
> * Guidance on [Handling dates](/data/specific-data-types/luxon.md) and [Querying JSON](/data/specific-data-types/jmespath.md)
> * A growing collection of examples in the [Cookbook](/code/cookbook/code-node/index.md)

> **Examples and templates**
>
> For usage examples and templates to help you get started, refer to n8n's [Code integrations](https://n8n.io/integrations/code/) page.

> **Function and Function Item nodes**
>
> The Code node replaces the Function and Function Item nodes from version 0.198.0. If you're using an older version of n8n, you can still view the [Function node documentation](https://github.com/n8n-io/n8n-docs/blob/67935ad2528e2e30d7984ea917e4af2910a096ec/docs/integrations/builtin/core-nodes/n8n-nodes-base.function.md) and [Function Item node documentation](https://github.com/n8n-io/n8n-docs/blob/67935ad2528e2e30d7984ea917e4af2910a096ec/docs/integrations/builtin/core-nodes/n8n-nodes-base.functionItem.md).
## Usage

How to use the Code node.

### Choose a mode

There are two modes:

* **Run Once for All Items**: this is the default. When your workflow runs, the code in the code node executes once, regardless of how many input items there are.
* **Run Once for Each Item**: choose this if you want your code to run for every input item.

## JavaScript

The Code node supports Node.js.

### Supported JavaScript features

The Code node supports:

* Promises. Instead of returning the items directly, you can return a promise which resolves accordingly.
* Writing to your browser console using `console.log`. This is useful for debugging and troubleshooting your workflows.

### External libraries

If you self-host n8n, you can import and use built-in and external npm modules in the Code node. To learn how to enable external modules, refer to the [Enable modules in Code node](/hosting/configuration/configuration-examples/modules-in-code-node.md) guide.

If you use n8n Cloud, you can't import external npm modules. n8n makes two modules available for you:

* [crypto Node.js module](https://nodejs.org/docs/latest-v18.x/api/crypto.html)
* [moment npm package](https://www.npmjs.com/package/moment)

### Built-in methods and variables

n8n provides built-in methods and variables for working with data and accessing n8n data. Refer to [Built-in methods and variables](/code/builtin/overview.md) for more information.

The syntax to use the built-in methods and variables is `$variableName` or `$methodName()`. Type `
# Code node

 in the Code node or expressions editor to see a list of suggested methods and variables.

### Keyboard shortcuts

The Code node editing environment supports time-saving and useful keyboard shortcuts for a range of operations from autocompletion to code-folding and using multiple-cursors. See the full list of [keyboard shortcuts](https://docs.n8n.io/keyboard-shortcuts/).

## Python (Pyodide - legacy)

Pyodide is a legacy feature. n8n v2 no longer supports this feature.

n8n added Python support in version 1.0. It doesn't include a Python executable. Instead, n8n provides Python support using [Pyodide](https://pyodide.org/en/stable/), which is a port of CPython to WebAssembly. This limits the available Python packages to the [Packages included with Pyodide](https://pyodide.org/en/stable/usage/packages-in-pyodide.html#packages-in-pyodide). n8n downloads the package automatically the first time you use it.

> **Slower than JavaScript**
>
> The Code node takes longer to process Python than JavaScript. This is due to the extra compilation steps.
### Built-in methods and variables

n8n provides built-in methods and variables for working with data and accessing n8n data. Refer to [Built-in methods and variables](/code/builtin/overview.md) for more information.

The syntax to use the built-in methods and variables is `_variableName` or `_methodName()`. Type `_` in the Code node to see a list of suggested methods and variables.

### Keyboard shortcuts

The Code node editing environment supports time-saving and useful keyboard shortcuts for a range of operations from autocompletion to code-folding and using multiple-cursors. See the full list of [keyboard shortcuts](https://docs.n8n.io/keyboard-shortcuts/).

## File system and HTTP requests

You can't access the file system or make HTTP requests. Use the following nodes instead:

* [Read/Write File From Disk](/integrations/builtin/core-nodes/n8n-nodes-base.readwritefile.md)
* [HTTP Request](https://docs.n8n.io//)

## Python (Native)

n8n added native Python support using task runners in version 1.111.0. This feature is stable as of n8n v2. 

Main differences from Pyodide:

- Native Python supports only `_items` in all-items mode and `_item` in per-item mode. It doesn't support other n8n built-in methods and variables.
- On self-hosted, native Python supports importing native Python modules from the standard library and from third-parties, if the `n8nio/runners` image includes them and explicitly allowlists them. See [adding extra dependencies for task runners](/hosting/configuration/task-runners.md/#adding-extra-dependencies) for more details.
- Native Python denies insecure built-ins by default. See [task runners environment variables](/hosting/configuration/environment-variables/task-runners.md) for more details.
- Unlike Pyodide, which accepts dot access notation, for example, `item.json.myNewField`, native Python only accepts bracket access notation, for example, `item["json"]["my_new_field"]`. There may be other minor syntax differences where Pyodide accepts constructs that aren't legal in native Python.
- On n8n cloud, the Python option for the Code node doesn't allow users to import any Python libraries — whether from the standard library or third-party packages. Self-hosting users can find setup instructions to include external libraries [here](https://docs.n8n.io/hosting/configuration/task-runners/#adding-extra-dependencies). In the long term, the n8n team is committed to allowing users to securely execute arbitrary Python code with any first- and third-party libraries using task runners.

Upgrading to native Python is a breaking change, so you may need to adjust your Python scripts to use the native Python runner. 

## Coding in n8n

There are two places where you can use code in n8n: the Code node and the expressions editor. When using either area, there are some key concepts you need to know, as well as some built-in methods and variables to help with common tasks.

### Key concepts

When working with the Code node, you need to understand the following concepts:

* [Data structure](/data/data-structure.md): understand the data you receive in the Code node, and requirements for outputting data from the node.
* [Item linking](/data/data-mapping/data-item-linking/index.md): learn how data items work, and how to link to items from previous nodes. You need to handle item linking in your code when the number of input and output items doesn't match.

### Built-in methods and variables

n8n includes built-in methods and variables. These provide support for:

* Accessing specific item data
* Accessing data about workflows, executions, and your n8n environment
* Convenience variables to help with data and time

Refer to [Built-in methods and variables](/code/builtin/overview.md) for more information.

## Use AI in the Code node

> **Feature availability**
>
> AI assistance in the Code node is available to Cloud users. It isn't available in self-hosted n8n.

> **AI generated code overwrites your code**
>
> If you've already written some code on the **Code** tab, the AI generated code will replace it. n8n recommends using AI as a starting point to create your initial code, then editing it as needed.

To use ChatGPT to generate code in the Code node:

1. In the Code node, set **Language** to **JavaScript**.
1. Select the **Ask AI** tab.
1. Write your query.
1. Select **Generate Code**. n8n sends your query to ChatGPT, then displays the result in the **Code** tab.

## Common issues

For common questions or issues and suggested solutions, refer to [Common Issues](https://docs.n8n.io/common-issues/).

---

<!-- sibling:common-issues.md -->
## Common Issues

# Code node common issues

Here are some common errors and issues with the [Code node](https://docs.n8n.io//) and steps to resolve or troubleshoot them.

<!-- vale off -->
## Code doesn't return items properly
<!-- vale on -->

This error occurs when the code in your Code node doesn't return data in the expected format.

In n8n, all data passed between nodes is an array of objects. Each of these objects wraps another object with the `json` key:

```javascript
[
  {
    "json": {
	  // your data goes here
	}
  }
]
```

To troubleshoot this error, check the following:

* Read the [data structure](/data/data-structure.md) to understand the data you receive in the Code node and the requirements for outputting data from the node.
* Understand how data items work and how to connect data items from previous nodes with [item linking](/data/data-mapping/data-item-linking/index.md).

<!-- vale off -->
## A 'json' property isn't an object
<!-- vale on -->

This error occurs when the Code node returns data where the `json` key isn't pointing to an object.

This may happen if you set `json` to a different data structure, like an array:

```javascript
[
  {
    "json": [
	  // Setting `json` to an array like this will produce an error
	]
  }
]
```

To resolve this, ensure that the `json` key references an object in your return data:

```javascript
[
  {
    "json": {
	  // Setting `json` to an object as expected
	}
  }
]
```

## Code doesn't return an object

This error may occur when your Code node doesn't return anything or if it returns an unexpected result.

To resolve this, ensure that your Code node returns the [expected data structure](/data/data-structure.md):

```javascript
[
  {
    "json": {
	  // your data goes here
	}
  }
]
```

This error may also occur if the code you provided returns `'undefined'` instead of the expected result. In that case, ensure that the data you are referencing in your Code node exists in each execution and that it has the structure your code expects.

## 'import' and 'export' may only appear at the top level

This error occurs if you try to use `import` or `export` in the Code node. These aren't supported by n8n's JavaScript sandbox. Instead, use the `require` function to load modules.

To resolve this issue, try changing your `import` statements to use `require`:

```javascript
// Original code:
// import express from "express";
// New code:
const express = require("express");
```

<!-- vale off -->
## Cannot find module '&lt;module&gt;'
<!-- vale on -->

This error occurs if you try to use `require` in the Code node and n8n can't find the module.

> **Only for self-hosted**
>
> n8n doesn't support importing modules in the [Cloud](/manage-cloud/overview.md) version.

If you're [self-hosting](/hosting/index.md) n8n, follow these steps:

* Install the module into your n8n environment.
	* If you are running n8n with [npm](/hosting/installation/npm.md), install the module in the same environment as n8n.
	* If you are running n8n with [Docker](/hosting/installation/docker.md), you need to extend the official n8n image with a [custom image](https://docs.docker.com/build/building/base-images/) that includes your module.
* Set the `NODE_FUNCTION_ALLOW_BUILTIN` and `NODE_FUNCTION_ALLOW_EXTERNAL` [environment variables](/hosting/configuration/configuration-examples/modules-in-code-node.md) to allow importing modules.

## Using global variables

Sometimes you may wish to set and retrieve simple global data related to a workflow across and within executions. For example, you may wish to include the date of the previous report when compiling a report with a list of project updates.

To set, update, and retrieve data directly to a workflow, use the [static data](/code/cookbook/builtin/get-workflow-static-data.md) functions within your code. You can manage data either globally or tied to specific nodes.

> **Use Remove Duplicates when possible**
>
> If you're interested in using variables to avoid processing the same data items more than once, consider using the [Remove Duplicates node](https://docs.n8n.io//) instead. The Remove Duplicates node can save information across executions to avoid processing the same items multiple times.

## Can't access credentials in a code node

By design, Code nodes can't access credentials. They don't have access to n8n’s internal credential management system. This prevents exposure of sensitive authentication data.

Attempts to reference credentials in a Code node using expressions or methods like `this.getCredentials()` or `$getCredentials()` will result in errors, such as `this.getCredentials is not a function` and `$getCredentials is not defined`. 

If you need to make authenticated API calls, use the [HTTP Request node](https://docs.n8n.io//) which provides credential support.

To work with credentials dynamically, handle the credential selection logic outside of the Code node:

- Use a [Switch](/integrations/builtin/core-nodes/n8n-nodes-base.switch.md) node to route to different nodes with different credentials.
- Use expressions directly in credential fields to select credentials dynamically based on previous node data.
- Use an HTTP Request node with Custom Auth to dynamically set headers, query parameters, or body values using expressions.

---

<!-- sibling:keyboard-shortcuts.md -->
## Keyboard Shortcuts

# Keyboard shortcuts when using the Code editor

The Code node editing environment supports a range of keyboard shortcuts to speed up and enhance your experience. Select the appropriate tab to see the relevant shortcuts for your operating system.

## Cursor Movement

=== "Windows"

    | Action                    | Shortcut                         |
    |---------------------------|----------------------------------|
    | Move cursor left          | ++left++                         |
    | Move cursor right         | ++right++                        |
    | Move cursor up            | ++up++                           |
    | Move cursor down          | ++down++                         |
    | Move cursor by word left  | ++control+left++                 |
    | Move cursor by word right | ++control+right++                |
    | Move to line start        | ++home++ **or** ++control+left++ |
    | Move to line end          | ++end++ or ++control+right++     |
    | Move to document start    | ++control+home++                 |
    | Move to document end      | ++control+end++                  |
    | Move page up              | ++page-up++                      |
    | Move page down            | ++page-down++                    |

=== "macOS"

    | Action                    | Shortcut                               |
    |---------------------------|----------------------------------------|
    | Move cursor left          | ++left++ **or** ++control+b++          |
    | Move cursor right         | ++right++ **or** ++control+f++         |
    | Move cursor up            | ++up++ **or** ++control+p++            |
    | Move cursor down          | ++down++ **or** ++control+n++          |
    | Move cursor by word left  | ++option+left++                        |
    | Move cursor by word right | ++option+right++                       |
    | Move to line start        | ++command+left++ **or** ++control+a++  |
    | Move to line end          | ++command+right++ **or** ++control+e++ |
    | Move to document start    | ++command+up++                         |
    | Move to document end      | ++command+down++                       |
    | Move page up              | ++page-up++ **or** ++option+v++        |
    | Move page down            | ++page-down++ **or** ++control+v++     |

=== "Linux"

    | Action                    | Shortcut                         |
    |---------------------------|----------------------------------|
    | Move cursor left          | ++left++                         |
    | Move cursor right         | ++right++                        |
    | Move cursor up            | ++up++                           |
    | Move cursor down          | ++down++                         |
    | Move cursor by word left  | ++control+left++                 |
    | Move cursor by word right | ++control+right++                |
    | Move to line start        | ++home++ **or** ++control+left++ |
    | Move to line end          | ++end++ or ++control+right++     |
    | Move to document start    | ++control+home++                 |
    | Move to document end      | ++control+end++                  |
    | Move page up              | ++page-up++                      |
    | Move page down            | ++page-down++                    |

## Selection

=== "Windows"

    | Action                          | Shortcut                    |
    |---------------------------------|-----------------------------|
    | Selection with any movement key | ++shift++ + [Movement Key]  |
    | Select all                      | ++control+a++               |
    | Select line                     | ++control+l++               |
    | Select next occurrence          | ++control+d++               |
    | Select all occurrences          | ++shift+control+l++         |
    | Go to matching bracket          | ++shift+control+backslash++ |

=== "macOS"

    | Action                          | Shortcut                    |
    |---------------------------------|-----------------------------|
    | Selection with any movement key | ++shift++ + [Movement Key]  |
    | Select all                      | ++command+a++               |
    | Select line                     | ++command+l++               |
    | Select next occurrence          | ++command+d++               |
    | Go to matching bracket          | ++shift+command+backslash++ |

=== "Linux"

    | Action                          | Shortcut                    |
    |---------------------------------|-----------------------------|
    | Selection with any movement key | ++shift++ + [Movement Key]  |
    | Select all                      | ++control+a++               |
    | Select line                     | ++control+l++               |
    | Select next occurrence          | ++control+d++               |
    | Select all occurrences          | ++shift+control+l++         |
    | Go to matching bracket          | ++shift+control+backslash++ |

## Basic Operations

=== "Windows"

    | Action                    | Shortcut                                 |
    |---------------------------|------------------------------------------|
    | New line with indentation | ++enter++                                |
    | Undo                      | ++control+z++                            |
    | Redo                      | ++control+y++ **or** ++control+shift+z++ |
    | Undo selection            | ++control+u++                            |
    | Copy                      | ++control+c++                            |
    | Cut                       | ++control+x++                            |
    | Paste                     | ++control+v++                           |

=== "macOS"

    | Action                    | Shortcut                                 |
    |---------------------------|------------------------------------------|
    | New line with indentation | ++enter++                                |
    | Undo                      | ++command+z++                            |
    | Redo                      | ++command+y++ **or** ++command+shift+z++ |
    | Undo selection            | ++command+u++                            |
    | Copy                      | ++command+c++                            |
    | Cut                       | ++command+x++                            |
    | Paste                     | ++command+v++                            |

=== "Linux"

    | Action                    | Shortcut                                 |
    |---------------------------|------------------------------------------|
    | New line with indentation | ++enter++                                |
    | Undo                      | ++control+z++                            |
    | Redo                      | ++control+y++ **or** ++control+shift+z++ |
    | Undo selection            | ++control+u++                            |
    | Copy                      | ++control+c++                            |
    | Cut                       | ++control+x++                            |
    | Paste                     | ++control+v++                            |

## Delete Operations

=== "Windows"

    | Action                 | Shortcut              |
    |------------------------|-----------------------|
    | Delete character left  | ++backspace++         |
    | Delete character right | ++delete++            |
    | Delete word left       | ++control+backspace++ |
    | Delete word right      | ++control+delete++    |
    | Delete line            | ++shift+control+k++   |

=== "macOS"

    | Action                 | Shortcut                                                |
    |------------------------|---------------------------------------------------------|
    | Delete character left  | ++backspace++                                           |
    | Delete character right | ++delete++                                              |
    | Delete word left       | ++option+backspace++ **or** ++control+command+h++       |
    | Delete word right      | ++option+delete++  **or** ++function+option+backspace++ |
    | Delete line            | ++shift+command+k++                                     |
    | Delete to line start   | ++command+backspace++                                   |
    | Delete to line end     | ++command+delete++ **or** ++control+k++                 |

=== "Linux"

    | Action                 | Shortcut              |
    |------------------------|-----------------------|
    | Delete character left  | ++backspace++         |
    | Delete character right | ++delete++            |
    | Delete word left       | ++control+backspace++ |
    | Delete word right      | ++control+delete++    |
    | Delete line            | ++shift+control+k++   |

## Line Operations

=== "Windows"

    | Action               | Shortcut                             |
    |----------------------|--------------------------------------|
    | Move line up         | ++alt+up++                           |
    | Move line down       | ++alt+down++                         |
    | Copy line up         | ++shift+alt+up++                     |
    | Copy line down       | ++shift+alt+down++                   |
    | Toggle line comment  | ++control+slash++                    |
    | Add line comment     | ++control+k++ **then** ++control+c++ |
    | Remove line comment  | ++control+k++ **then** ++control+u++ |
    | Toggle block comment | ++shift+alt+a++                      |

=== "macOS"

    | Action               | Shortcut                             |
    |----------------------|--------------------------------------|
    | Move line up         | ++option+up++                        |
    | Move line down       | ++option+down++                      |
    | Copy line up         | ++shift+option+up++                  |
    | Copy line down       | ++shift+option+down++                |
    | Toggle line comment  | ++command+slash++                    |
    | Add line comment     | ++command+k++ **then** ++command+c++ |
    | Remove line comment  | ++command+k++ **then** ++command+u++ |
    | Toggle block comment | ++shift+option+a++                   |
    | Split line           | ++control+o++                        |
    | Transpose characters | ++control+t++                        |

=== "Linux"

    | Action               | Shortcut                             |
    |----------------------|--------------------------------------|
    | Move line up         | ++alt+up++                           |
    | Move line down       | ++alt+down++                         |
    | Copy line up         | ++shift+alt+up++                     |
    | Copy line down       | ++shift+alt+down++                   |
    | Toggle line comment  | ++control+slash++                    |
    | Add line comment     | ++control+k++ **then** ++control+c++ |
    | Remove line comment  | ++control+k++ **then** ++control+c++ |
    | Toggle block comment | ++shift+alt+a++                      |

## Autocomplete

=== "Windows"

    | Action                      | Shortcut                 |
    |-----------------------------|--------------------------|
    | Start completion            | ++control+space++        |
    | Accept completion           | ++enter++ **or** ++tab++ |
    | Close completion            | ++escape++               |
    | Navigate completion options | ++up++ **or** ++down++   |

=== "macOS"

    | Action                      | Shortcut                 |
    |-----------------------------|--------------------------|
    | Start completion            | ++control+space++        |
    | Accept completion           | ++enter++ **or** ++tab++ |
    | Close completion            | ++escape++               |
    | Navigate completion options | ++up++ **or** ++down++   |

=== "Linux"

    | Action                      | Shortcut                 |
    |-----------------------------|--------------------------|
    | Start completion            | ++control+space++        |
    | Accept completion           | ++enter++ **or** ++tab++ |
    | Close completion            | ++escape++               |
    | Navigate completion options | ++up++ **or** ++down++   |
    
## Indentation

=== "Windows"

    | Action      | Shortcut                                      |
    |-------------|-----------------------------------------------|
    | Indent more | ++tab++ **or** ++control+bracket-right++      |
    | Indent less | ++shift+tab++ **or** ++control+bracket-left++ |

=== "macOS"

    | Action      | Shortcut                  |
    |-------------|---------------------------|
    | Indent more | ++command+bracket-right++ |
    | Indent less | ++command+bracket-left++  |

=== "Linux"

    | Action      | Shortcut                                      |
    |-------------|-----------------------------------------------|
    | Indent more | ++tab++ **or** ++control+bracket-right++      |
    | Indent less | ++shift+tab++ **or** ++control+bracket-left++ |

## Code Folding

=== "Windows"

    | Action      | Shortcut                             |
    |-------------|--------------------------------------|
    | Fold code   | ++control+shift+bracket-left++       |
    | Unfold code | ++control+shift+bracket-right++      |
    | Fold all    | ++control+k++ **then** ++control+0++ |
    | Unfold all  | ++control+k++ **then** ++control+j++ |

=== "macOS"

    | Action      | Shortcut                             |
    |-------------|--------------------------------------|
    | Fold code   | ++command+option+bracket-left++      |
    | Unfold code | ++command+option+bracket-right++     |
    | Fold all    | ++command+k++ **then** ++command+0++ |
    | Unfold all  | ++command+k++ **then** ++command+j++ |

=== "Linux"

    | Action      | Shortcut                             |
    |-------------|--------------------------------------|
    | Fold code   | ++control+shift+bracket-left++       |
    | Unfold code | ++control+shift+bracket-right++      |
    | Fold all    | ++control+k++ **then** ++control+0++ |
    | Unfold all  | ++control+k++ **then** ++control+j++ |

## Multi-cursor

=== "Windows"

    | Action                       | Shortcut             |
    |------------------------------|----------------------|
    | Add cursor at click position | ++alt+left-button++  |
    | Add cursor above             | ++control+alt+up++   |
    | Add cursor below             | ++control+alt+down++ |
    | Add cursors to line ends     | ++shift+alt+i++      |
    | Clear multiple cursors       | ++escape++           |

=== "macOS"

    | Action                       | Shortcut                |
    |------------------------------|-------------------------|
    | Add cursor at click position | ++option+left-button++  |
    | Add cursor above             | ++control+option+up++   |
    | Add cursor below             | ++control+option+down++ |
    | Add cursors to line ends     | ++shift+option+i++      |
    | Clear multiple cursors       | ++escape++              |

=== "Linux"

    | Action                       | Shortcut            |
    |------------------------------|---------------------|
    | Add cursor at click position | ++alt+left-button++ |
    | Add cursor above             | ++shift+alt+up++    |
    | Add cursor below             | ++shift+alt+down++  |
    | Add cursors to line ends     | ++shift+alt+i++     |
    | Clear multiple cursors       | ++escape++          |

## Formatting

=== "Windows"

    | Action          | Shortcut                                     |
    |-----------------|----------------------------------------------|
    | Format document | ++shift+alt+f++ |
    
=== "macOS"

    | Action          | Shortcut                                     |
    |-----------------|----------------------------------------------|
    | Format document | ++shift+command+f++ |
    
=== "Linux"

    | Action          | Shortcut                                      |
    |-----------------|-----------------------------------------------|
    | Format document | ++control+shift+i++ |
    
## Search & Navigation

=== "Windows"

    | Action          | Shortcut              |
    |-----------------|-----------------------|
    | Open Search     | ++control+f++         |
    | Select All      | ++alt+enter++         |
    | Replace All     | ++control+alt+enter++ |
    | Go To Line      | ++control+g++         |
    | Next Diagnostic | ++f8++                |
    | Previous Diag.  | ++shift+f8++          |
    | Open Lint Panel | ++control+shift+m++   |

=== "macOS"

    | Action          | Shortcut              |
    |-----------------|-----------------------|
    | Open Search     | ++command+f++         |
    | Select All      | ++command+enter++     |
    | Replace All     | ++command+option+enter++ |
    | Go To Line      | ++command+g++         |
    | Next Diagnostic | ++f8++                |
    | Previous Diag.  | ++shift+f8++          |
    | Open Lint Panel | ++command+shift+m++   |

=== "Linux"

    | Action          | Shortcut              |
    |-----------------|-----------------------|
    | Open Search     | ++control+f++         |
    | Select All      | ++alt+enter++         |
    | Replace All     | ++control+alt+enter++ |
    | Go To Line      | ++control+g++         |
    | Next Diagnostic | ++f8++                |
    | Previous Diag.  | ++shift+f8++          |
    | Open Lint Panel | ++control+shift+m++   |