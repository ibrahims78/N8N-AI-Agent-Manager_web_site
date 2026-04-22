---
title: Model Selector
description: Learn how to use the Model Selector node in n8n. Follow technical documentation to integrate Model Selector node into your workflows.
contentType: [integration, reference]
priority: high
---

# Model Selector

The Model Selector node dynamically selects one of the connected language models during workflow execution based on a set of defined conditions. This enables implementing fallback mechanisms for error handling or choosing the optimal model for specific tasks.

This page covers node parameters for the Model Selector node and includes links to related resources.

## Node parameters

### Number of Inputs

Specifies the number of input connections available for attaching language models.

### Rules

Each rule defines the model to use when specific conditions match.

The Model Selector node evaluates rules sequentially, starting from the first input, and stops evaluation as soon as it finds a match. This means that if multiple rules would match, n8n will only use the model defined by the first matching rule.

## Templates and examples

<!-- see https://www.notion.so/n8n/Pull-in-templates-for-the-integrations-pages-37c716837b804d30a33b47475f6e3780 -->

## Related resources