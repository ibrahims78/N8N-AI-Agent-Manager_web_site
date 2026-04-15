import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "../lib/logger";

export interface AnalysisPhase {
  phase: 1 | 2 | 3;
  label: string;
  labelAr: string;
  status: "pending" | "running" | "done" | "failed";
  durationMs?: number;
}

export interface WorkflowProblem {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  severity: "critical" | "high" | "medium" | "low";
  solution: string;
  solutionAr: string;
  affectedNode?: string | null;
}

export interface AnalyzerResult {
  success: boolean;
  summary: string;
  summaryAr: string;
  problems: WorkflowProblem[];
  fixedWorkflowJson: Record<string, unknown> | null;
  phases: AnalysisPhase[];
  totalTimeMs: number;
  error?: string;
}

export interface AnalyzerConfig {
  openaiKey: string;
  geminiKey?: string;
  onPhaseUpdate?: (phase: AnalysisPhase) => void;
}

interface ExecutionErrorData {
  id: string;
  status: string;
  error?: { message?: string; node?: { name?: string }; stack?: string };
  startedAt?: string;
  stoppedAt?: string;
}

function buildAnalysisSystemPrompt(): string {
  return `You are a senior n8n workflow architect and debugger. 
Analyze the provided n8n workflow JSON and execution error logs. 
Identify ALL problems including:
1. Node configuration errors or missing required parameters
2. Incorrect connections or broken flow logic
3. Missing error handling (no On Error node, no try-catch logic)
4. Root causes of execution failures from error logs
5. Performance issues or anti-patterns
6. Missing or invalid credentials references

Return ONLY a valid JSON object (no markdown, no extra text) with this exact structure:
{
  "summary": "A clear 2-3 sentence summary of findings in English",
  "summaryAr": "ملخص واضح في 2-3 جمل بالعربية",
  "problems": [
    {
      "title": "Problem title in English",
      "titleAr": "عنوان المشكلة بالعربية",
      "description": "Detailed description with technical context in English",
      "descriptionAr": "وصف تفصيلي مع السياق التقني بالعربية",
      "severity": "critical",
      "solution": "Step-by-step solution in English",
      "solutionAr": "خطوات الحل بالعربية",
      "affectedNode": "NodeName or null"
    }
  ]
}

Severity levels: critical (workflow broken), high (major issue), medium (improvement needed), low (minor suggestion).
If no problems found, return problems: [] and indicate workflow looks healthy in summary.`;
}

function buildFixSystemPrompt(): string {
  return `You are an n8n workflow repair expert. 
Given the original workflow JSON and identified problems with their solutions, generate a FIXED and IMPROVED workflow JSON.

Rules:
- Preserve all original node IDs and names
- Keep all existing connections that are correct
- Fix only what is broken or missing
- Add error handling nodes where missing (n8n-nodes-base.noOp or n8n-nodes-base.stopAndError)
- Fix node parameters according to the solutions
- Return ONLY valid n8n workflow JSON with no additional text or markdown

The returned JSON must have: name, nodes (array), connections (object), settings (object).`;
}

export async function runWorkflowAnalyzer(
  workflowJson: Record<string, unknown>,
  executions: ExecutionErrorData[],
  userContext: string,
  config: AnalyzerConfig,
): Promise<AnalyzerResult> {
  const startTime = Date.now();
  const phases: AnalysisPhase[] = [
    { phase: 1, label: "GPT-4o: Analyzing workflow", labelAr: "GPT-4o: تحليل المشاكل", status: "pending" },
    { phase: 2, label: "Gemini: Validating analysis", labelAr: "Gemini: التحقق من التحليل", status: "pending" },
    { phase: 3, label: "GPT-4o: Generating fix", labelAr: "GPT-4o: إنشاء الإصلاح", status: "pending" },
  ];

  const updatePhase = (phase: 1 | 2 | 3, status: AnalysisPhase["status"], durationMs?: number) => {
    const idx = phases.findIndex(p => p.phase === phase);
    if (idx >= 0) {
      phases[idx] = { ...phases[idx]!, status, durationMs };
      config.onPhaseUpdate?.(phases[idx]!);
    }
  };

  const openai = new OpenAI({ apiKey: config.openaiKey, timeout: 90000 });

  let summary = "";
  let summaryAr = "";
  let problems: WorkflowProblem[] = [];

  // ── Phase 1: GPT-4o Analysis ──────────────────────────────────────────────
  try {
    updatePhase(1, "running");
    const p1Start = Date.now();

    const errorSummary = executions
      .filter(e => e.status === "error" || e.status === "failed")
      .slice(0, 5)
      .map(e => {
        const node = e.error?.node?.name ? ` (Node: "${e.error.node.name}")` : "";
        return `- Execution ${e.id} [${e.status}]: ${e.error?.message ?? "Unknown error"}${node}`;
      })
      .join("\n");

    const workflowStr = JSON.stringify(workflowJson, null, 2);
    const truncatedWorkflow = workflowStr.length > 8000
      ? workflowStr.slice(0, 8000) + "\n... (truncated)"
      : workflowStr;

    const p1User = `Workflow JSON to analyze:
${truncatedWorkflow}

Recent execution errors (last 5 failures):
${errorSummary || "No recent execution errors found."}

User context / additional info:
${userContext || "No additional context provided."}

Analyze this workflow and return the JSON report.`;

    const p1Response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: buildAnalysisSystemPrompt() },
        { role: "user", content: p1User },
      ],
      max_tokens: 3000,
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const p1Raw = p1Response.choices[0]?.message?.content ?? "{}";
    const p1Data = JSON.parse(p1Raw) as {
      summary?: string;
      summaryAr?: string;
      problems?: WorkflowProblem[];
    };

    summary = p1Data.summary ?? "Analysis complete.";
    summaryAr = p1Data.summaryAr ?? "اكتمل التحليل.";
    problems = Array.isArray(p1Data.problems) ? p1Data.problems : [];

    updatePhase(1, "done", Date.now() - p1Start);
  } catch (err) {
    logger.error({ err }, "Workflow analyzer Phase 1 failed");
    updatePhase(1, "failed");
    updatePhase(2, "failed");
    updatePhase(3, "failed");
    return {
      success: false,
      summary: "",
      summaryAr: "",
      problems: [],
      fixedWorkflowJson: null,
      phases,
      totalTimeMs: Date.now() - startTime,
      error: `Phase 1 failed: ${String(err)}`,
    };
  }

  // ── Phase 2: Gemini Validation ────────────────────────────────────────────
  let geminiNotes = "";
  if (config.geminiKey) {
    try {
      updatePhase(2, "running");
      const p2Start = Date.now();

      const genAI = new GoogleGenerativeAI(config.geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const p2Prompt = `You are reviewing an analysis of an n8n workflow.

Analysis summary: ${summary}

Problems found (${problems.length}):
${problems.map((p, i) => `${i + 1}. [${p.severity.toUpperCase()}] ${p.title}: ${p.description}`).join("\n")}

Workflow nodes:
${JSON.stringify((workflowJson.nodes as unknown[]) ?? [], null, 2).slice(0, 3000)}

Validate this analysis:
1. Are the identified problems correct?
2. Are there important issues that were missed?
3. Are the proposed solutions feasible?

Respond with a concise validation note (2-4 sentences) in plain text. If you agree with the analysis, say so. If not, briefly note corrections or additions.`;

      const p2Response = await model.generateContent(p2Prompt);
      geminiNotes = p2Response.response.text().slice(0, 500);

      updatePhase(2, "done", Date.now() - p2Start);
    } catch (err) {
      logger.warn({ err }, "Workflow analyzer Phase 2 (Gemini) failed — continuing without it");
      updatePhase(2, "failed");
    }
  } else {
    updatePhase(2, "done", 0);
  }

  // ── Phase 3: GPT-4o Fix Generation ───────────────────────────────────────
  let fixedWorkflowJson: Record<string, unknown> | null = null;
  const fixableProblems = problems.filter(p => p.severity === "critical" || p.severity === "high");

  if (fixableProblems.length > 0) {
    try {
      updatePhase(3, "running");
      const p3Start = Date.now();

      const p3User = `Original workflow:
${JSON.stringify(workflowJson, null, 2).slice(0, 6000)}

Problems to fix:
${fixableProblems.map((p, i) => `${i + 1}. [${p.severity.toUpperCase()}] ${p.title}
   Affected node: ${p.affectedNode ?? "N/A"}
   Solution: ${p.solution}`).join("\n\n")}

${geminiNotes ? `Validator notes: ${geminiNotes}` : ""}

Generate the fixed workflow JSON:`;

      const p3Response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: buildFixSystemPrompt() },
          { role: "user", content: p3User },
        ],
        max_tokens: 4000,
        temperature: 0.1,
        response_format: { type: "json_object" },
      });

      const p3Raw = p3Response.choices[0]?.message?.content ?? "{}";
      try {
        fixedWorkflowJson = JSON.parse(p3Raw) as Record<string, unknown>;
        if (!fixedWorkflowJson.nodes || !Array.isArray(fixedWorkflowJson.nodes)) {
          fixedWorkflowJson = null;
        }
      } catch {
        fixedWorkflowJson = null;
      }

      updatePhase(3, "done", Date.now() - p3Start);
    } catch (err) {
      logger.error({ err }, "Workflow analyzer Phase 3 failed");
      updatePhase(3, "failed");
    }
  } else {
    updatePhase(3, "done", 0);
  }

  return {
    success: true,
    summary,
    summaryAr,
    problems,
    fixedWorkflowJson,
    phases,
    totalTimeMs: Date.now() - startTime,
  };
}
