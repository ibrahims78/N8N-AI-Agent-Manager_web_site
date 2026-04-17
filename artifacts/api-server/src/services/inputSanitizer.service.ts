/**
 * inputSanitizer.service.ts
 *
 * FIX 4.5 — Input Sanitization
 * Protects against Prompt Injection attacks and enforces input constraints
 * before any content is forwarded to an LLM.
 *
 * Injection patterns detected:
 * - "ignore previous instructions" style overrides
 * - System-prompt replacement attempts
 * - Persona/role switching commands
 * - Special token injections (INST, SYS, etc.)
 * - API key / secret extraction attempts
 */

import { logger } from "../lib/logger";

export interface SanitizeResult {
  safe: string;
  injectionDetected: boolean;
  warnings: string[];
  truncated: boolean;
  originalLength: number;
}

const MAX_INPUT_LENGTH = 4000;
const MAX_SINGLE_LINE_LENGTH = 800;

const INJECTION_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  {
    pattern: /ignore\s+(all\s+)?(previous|above|prior|earlier)\s+(instructions?|prompts?|rules?|context|directions?)/gi,
    label: "instruction-override",
  },
  {
    pattern: /forget\s+(everything|all|what|any).*(told|said|instructed|written|above)/gi,
    label: "context-wipe",
  },
  {
    pattern: /\byou\s+are\s+now\s+(a\s+|an\s+)?(?!an?\s+n8n)/gi,
    label: "persona-switch",
  },
  {
    pattern: /new\s+(persona|identity|role|instructions?|system\s+prompt|mode)/gi,
    label: "role-replace",
  },
  {
    pattern: /\[SYSTEM\]/gi,
    label: "system-tag",
  },
  {
    pattern: /\[INST\]/gi,
    label: "inst-token",
  },
  {
    pattern: /<\|(?:system|user|assistant|im_start|im_end|endoftext)\|>/gi,
    label: "special-token",
  },
  {
    pattern: /print\s+(your\s+)?(api\s+keys?|secrets?|env(ironment)?\s+var(iables?)?|database\s+(url|credentials?|password))/gi,
    label: "secret-extraction",
  },
  {
    pattern: /reveal\s+(your\s+)?(system\s+prompt|instructions?|api\s+keys?|secrets?|config(uration)?)/gi,
    label: "prompt-reveal",
  },
  {
    pattern: /disregard\s+(all\s+)?(previous|prior|above|earlier)/gi,
    label: "disregard-override",
  },
  {
    pattern: /override\s+(your\s+)?(instructions?|rules?|guidelines?|settings?)/gi,
    label: "explicit-override",
  },
  {
    pattern: /act\s+as\s+(?!an?\s+n8n)/gi,
    label: "act-as",
  },
  {
    pattern: /pretend\s+(you\s+are|to\s+be)\s+(?!an?\s+n8n)/gi,
    label: "pretend-persona",
  },
];

/**
 * Sanitizes user input before forwarding to any LLM.
 * - Truncates to MAX_INPUT_LENGTH
 * - Detects and neutralizes prompt injection attempts
 * - Logs warnings for detected patterns
 */
export function sanitizeUserInput(content: string): SanitizeResult {
  const originalLength = content.length;
  const warnings: string[] = [];
  let injectionDetected = false;

  let safe = content;

  // 1. Truncate to hard limit
  const truncated = safe.length > MAX_INPUT_LENGTH;
  if (truncated) {
    safe = safe.slice(0, MAX_INPUT_LENGTH);
    warnings.push(`Input truncated from ${originalLength} to ${MAX_INPUT_LENGTH} characters`);
  }

  // 2. Truncate individual lines that are excessively long (e.g. base64 blobs)
  safe = safe
    .split("\n")
    .map((line) =>
      line.length > MAX_SINGLE_LINE_LENGTH
        ? line.slice(0, MAX_SINGLE_LINE_LENGTH) + "…"
        : line
    )
    .join("\n");

  // 3. Detect injection patterns
  for (const { pattern, label } of INJECTION_PATTERNS) {
    if (pattern.test(safe)) {
      injectionDetected = true;
      warnings.push(`Injection pattern detected: ${label}`);
      logger.warn({ label, contentPreview: safe.slice(0, 100) }, "Prompt injection attempt detected");

      // Neutralize by replacing the matched content with [FILTERED]
      // Reset lastIndex for global regexes
      pattern.lastIndex = 0;
      safe = safe.replace(pattern, "[FILTERED]");
    }
    // Reset for global flag
    pattern.lastIndex = 0;
  }

  // 4. Strip null bytes and other control characters (except newlines and tabs)
  safe = safe.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  return {
    safe,
    injectionDetected,
    warnings,
    truncated,
    originalLength,
  };
}

/**
 * Returns true if the input length is within acceptable bounds (quick check).
 */
export function isInputLengthValid(content: string): boolean {
  return content.length > 0 && content.length <= MAX_INPUT_LENGTH * 2;
}
