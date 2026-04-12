/**
 * jsonValidator.service.ts
 * Validates n8n workflow JSON structure for correctness and completeness.
 */

interface N8nNode {
  id?: string;
  name?: string;
  type?: string;
  typeVersion?: number;
  position?: [number, number] | { x: number; y: number };
  parameters?: Record<string, unknown>;
}

interface N8nWorkflow {
  nodes?: N8nNode[];
  connections?: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  parsedJson: N8nWorkflow | null;
  errors: string[];
  warnings: string[];
  nodeCount: number;
}

const KNOWN_TRIGGER_TYPES = [
  "n8n-nodes-base.scheduleTrigger",
  "n8n-nodes-base.webhook",
  "n8n-nodes-base.manualTrigger",
  "n8n-nodes-base.httpTrigger",
  "n8n-nodes-base.emailTrigger",
  "@n8n/n8n-nodes-langchain.chatTrigger",
  "n8n-nodes-base.formTrigger",
];

/**
 * Extracts JSON from a string that might contain markdown code blocks or extra text.
 */
export function extractJson(text: string): string {
  const cleaned = text.trim();

  // Try direct JSON parse first
  if (cleaned.startsWith("{") || cleaned.startsWith("[")) {
    return cleaned;
  }

  // Extract from markdown code blocks
  const jsonBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch?.[1]) {
    return jsonBlockMatch[1].trim();
  }

  // Find first { and last } as fallback
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.substring(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

/**
 * Validates an n8n workflow JSON string.
 * Returns a structured validation result.
 */
export function validateWorkflowJson(jsonString: string): ValidationResult {
  const result: ValidationResult = {
    valid: false,
    parsedJson: null,
    errors: [],
    warnings: [],
    nodeCount: 0,
  };

  // Step 1: Extract and parse JSON
  const extracted = extractJson(jsonString);
  let parsed: N8nWorkflow;

  try {
    parsed = JSON.parse(extracted) as N8nWorkflow;
  } catch (err) {
    result.errors.push(`JSON parsing failed: ${String(err)}`);
    return result;
  }

  result.parsedJson = parsed;

  // Step 2: Check required top-level fields
  if (!parsed.nodes || !Array.isArray(parsed.nodes)) {
    result.errors.push("Missing or invalid 'nodes' array");
    return result;
  }

  if (!parsed.connections || typeof parsed.connections !== "object") {
    result.errors.push("Missing or invalid 'connections' object");
    return result;
  }

  result.nodeCount = parsed.nodes.length;

  // Step 3: Validate nodes
  if (parsed.nodes.length === 0) {
    result.errors.push("Workflow has no nodes");
    return result;
  }

  if (parsed.nodes.length > 50) {
    result.warnings.push("Workflow has many nodes (>50) — consider splitting");
  }

  const nodeIds = new Set<string>();
  const nodeNames = new Set<string>();
  let hasTrigger = false;

  for (let i = 0; i < parsed.nodes.length; i++) {
    const node = parsed.nodes[i];

    if (!node) {
      result.errors.push(`Node at index ${i} is null/undefined`);
      continue;
    }

    // Check required node fields
    if (!node.name) {
      result.errors.push(`Node at index ${i} is missing 'name'`);
    }

    if (!node.type) {
      result.errors.push(`Node at index ${i} is missing 'type'`);
    }

    if (!node.id) {
      result.warnings.push(`Node '${node.name ?? i}' is missing 'id' (n8n will auto-generate)`);
    } else {
      if (nodeIds.has(node.id)) {
        result.errors.push(`Duplicate node id: '${node.id}'`);
      }
      nodeIds.add(node.id);
    }

    if (node.name) {
      if (nodeNames.has(node.name)) {
        result.errors.push(`Duplicate node name: '${node.name}'`);
      }
      nodeNames.add(node.name);
    }

    if (node.typeVersion === undefined || node.typeVersion === null) {
      result.warnings.push(`Node '${node.name ?? i}' is missing 'typeVersion'`);
    }

    if (!node.position) {
      result.warnings.push(`Node '${node.name ?? i}' is missing 'position'`);
    }

    // Check for trigger nodes
    if (node.type && KNOWN_TRIGGER_TYPES.some(t => node.type?.includes(t) || node.type?.toLowerCase().includes("trigger"))) {
      hasTrigger = true;
    }
  }

  if (!hasTrigger) {
    result.warnings.push("No trigger node detected — workflow may not auto-execute");
  }

  // Step 4: Validate connections reference valid nodes
  if (parsed.connections && typeof parsed.connections === "object") {
    for (const [sourceName] of Object.entries(parsed.connections)) {
      if (!nodeNames.has(sourceName)) {
        result.warnings.push(`Connection references unknown source node: '${sourceName}'`);
      }
    }
  }

  // Determine validity
  result.valid = result.errors.length === 0;
  return result;
}

/**
 * Attempts to fix common JSON issues in workflow JSON strings.
 */
export function sanitizeWorkflowJson(workflowJson: N8nWorkflow): N8nWorkflow {
  const sanitized = { ...workflowJson };

  if (sanitized.nodes && Array.isArray(sanitized.nodes)) {
    sanitized.nodes = sanitized.nodes.map((node, index) => {
      const fixed = { ...node };

      // Add missing typeVersion
      if (fixed.typeVersion === undefined) {
        fixed.typeVersion = 1;
      }

      // Add default position if missing
      if (!fixed.position) {
        fixed.position = [200 + index * 250, 300];
      }

      // Add empty parameters if missing
      if (!fixed.parameters) {
        fixed.parameters = {};
      }

      return fixed;
    });
  }

  // Add settings if missing
  if (!sanitized.settings) {
    sanitized.settings = { executionOrder: "v1" };
  }

  // Ensure connections is an object
  if (!sanitized.connections) {
    sanitized.connections = {};
  }

  return sanitized;
}
