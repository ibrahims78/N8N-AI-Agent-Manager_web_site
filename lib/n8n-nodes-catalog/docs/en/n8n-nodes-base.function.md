---
title: Code node documentation
description: Documentation for the Code node in n8n, a workflow automation platform. Includes guidance on usage, and links to examples.
contentType: [integration, reference]
priority: critical
tags:
  - code node
  - code
hide:
  - tags
search:
  boost: 1.5
---

# Code node

## Common issues

For common questions or issues and suggested solutions, refer to [Common Issues](/integrations/builtin/core-nodes/n8n-nodes-base.code/common-issues.md).

---

# Code node common issues

Here are some common errors and issues with the [Code node](/integrations/builtin/core-nodes/n8n-nodes-base.code/index.md) and steps to resolve or troubleshoot them.

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

/// warning | Only for self-hosted
n8n doesn't support importing modules in the [Cloud](/manage-cloud/overview.md) version.
///

If you're [self-hosting](/hosting/index.md) n8n, follow these steps:

* Install the module into your n8n environment.
	* If you are running n8n with [npm](/hosting/installation/npm.md), install the module in the same environment as n8n.
	* If you are running n8n with [Docker](/hosting/installation/docker.md), you need to extend the official n8n image with a [custom image](https://docs.docker.com/build/building/base-images/) that includes your module.
* Set the `NODE_FUNCTION_ALLOW_BUILTIN` and `NODE_FUNCTION_ALLOW_EXTERNAL` [environment variables](/hosting/configuration/configuration-examples/modules-in-code-node.md) to allow importing modules.

## Using global variables

Sometimes you may wish to set and retrieve simple global data related to a workflow across and within executions. For example, you may wish to include the date of the previous report when compiling a report with a list of project updates.

To set, update, and retrieve data directly to a workflow, use the [static data](/code/cookbook/builtin/get-workflow-static-data.md) functions within your code. You can manage data either globally or tied to specific nodes.

/// info | Use Remove Duplicates when possible
If you're interested in using variables to avoid processing the same data items more than once, consider using the [Remove Duplicates node](/integrations/builtin/core-nodes/n8n-nodes-base.removeduplicates/index.md) instead. The Remove Duplicates node can save information across executions to avoid processing the same items multiple times.
///

## Can't access credentials in a code node

By design, Code nodes can't access credentials. They don't have access to n8n’s internal credential management system. This prevents exposure of sensitive authentication data.

Attempts to reference credentials in a Code node using expressions or methods like `this.getCredentials()` or `$getCredentials()` will result in errors, such as `this.getCredentials is not a function` and `$getCredentials is not defined`. 

If you need to make authenticated API calls, use the [HTTP Request node](/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/index.md) which provides credential support.

To work with credentials dynamically, handle the credential selection logic outside of the Code node:

- Use a [Switch](/integrations/builtin/core-nodes/n8n-nodes-base.switch.md) node to route to different nodes with different credentials.
- Use expressions directly in credential fields to select credentials dynamically based on previous node data.
- Use an HTTP Request node with Custom Auth to dynamically set headers, query parameters, or body values using expressions.

---

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