/**
 * nodeSchemas.ts
 * A curated library of accurate n8n node schemas.
 * Each entry contains the exact type, typeVersion, credentials, and required parameters
 * as defined by n8n's official node specifications.
 */

export interface NodeSchema {
  type: string;
  typeVersion: number;
  credentials?: Record<string, string>;
  defaultParameters: Record<string, unknown>;
  description: string;
  category: string;
}

export const NODE_SCHEMAS: Record<string, NodeSchema> = {
  // ─── Triggers ────────────────────────────────────────────────────────────────
  "n8n-nodes-base.scheduleTrigger": {
    type: "n8n-nodes-base.scheduleTrigger",
    typeVersion: 1,
    defaultParameters: {
      rule: {
        interval: [{ field: "hours", hoursInterval: 1 }],
      },
    },
    description: "Trigger workflow on a time schedule (cron/interval)",
    category: "trigger",
  },
  "n8n-nodes-base.webhookTrigger": {
    type: "n8n-nodes-base.webhook",
    typeVersion: 2,
    defaultParameters: {
      httpMethod: "POST",
      path: "webhook",
      responseMode: "onReceived",
    },
    description: "Trigger workflow via HTTP webhook",
    category: "trigger",
  },
  "n8n-nodes-base.manualTrigger": {
    type: "n8n-nodes-base.manualTrigger",
    typeVersion: 1,
    defaultParameters: {},
    description: "Trigger workflow manually from n8n UI",
    category: "trigger",
  },
  "n8n-nodes-base.emailReadImap": {
    type: "n8n-nodes-base.emailReadImap",
    typeVersion: 2,
    credentials: { imap: "imap" },
    defaultParameters: {
      mailbox: "INBOX",
      action: "read",
      downloadAttachments: false,
    },
    description: "Trigger on new emails via IMAP",
    category: "trigger",
  },

  // ─── Communication ────────────────────────────────────────────────────────────
  "n8n-nodes-base.gmail": {
    type: "n8n-nodes-base.gmail",
    typeVersion: 2,
    credentials: { gmailOAuth2: "gmailOAuth2" },
    defaultParameters: {
      operation: "send",
      sendTo: "",
      subject: "",
      emailType: "text",
      message: "",
    },
    description: "Send, read, or manage Gmail emails",
    category: "communication",
  },
  "n8n-nodes-base.gmailTrigger": {
    type: "n8n-nodes-base.gmailTrigger",
    typeVersion: 1,
    credentials: { gmailOAuth2: "gmailOAuth2" },
    defaultParameters: {
      filters: {},
      pollTimes: { item: [{ mode: "everyMinute" }] },
    },
    description: "Trigger workflow when new Gmail email arrives",
    category: "trigger",
  },
  "n8n-nodes-base.slack": {
    type: "n8n-nodes-base.slack",
    typeVersion: 2,
    credentials: { slackApi: "slackApi" },
    defaultParameters: {
      operation: "post",
      resource: "message",
      channel: "",
      text: "",
    },
    description: "Send messages, manage channels in Slack",
    category: "communication",
  },
  "n8n-nodes-base.telegram": {
    type: "n8n-nodes-base.telegram",
    typeVersion: 1,
    credentials: { telegramApi: "telegramApi" },
    defaultParameters: {
      operation: "sendMessage",
      resource: "message",
      chatId: "",
      text: "",
    },
    description: "Send messages via Telegram bot",
    category: "communication",
  },
  "n8n-nodes-base.telegramTrigger": {
    type: "n8n-nodes-base.telegramTrigger",
    typeVersion: 1,
    credentials: { telegramApi: "telegramApi" },
    defaultParameters: {
      updates: ["message"],
    },
    description: "Trigger workflow on Telegram bot messages",
    category: "trigger",
  },
  "n8n-nodes-base.emailSend": {
    type: "n8n-nodes-base.emailSend",
    typeVersion: 2,
    credentials: { smtp: "smtp" },
    defaultParameters: {
      fromEmail: "",
      toEmail: "",
      subject: "",
      text: "",
    },
    description: "Send emails via SMTP",
    category: "communication",
  },
  "n8n-nodes-base.microsoftTeams": {
    type: "n8n-nodes-base.microsoftTeams",
    typeVersion: 1,
    credentials: { microsoftTeamsOAuth2Api: "microsoftTeamsOAuth2Api" },
    defaultParameters: {
      resource: "message",
      operation: "create",
      teamId: "",
      channelId: "",
      content: "",
    },
    description: "Send messages in Microsoft Teams",
    category: "communication",
  },
  "n8n-nodes-base.discord": {
    type: "n8n-nodes-base.discord",
    typeVersion: 2,
    credentials: { discordWebhookApi: "discordWebhookApi" },
    defaultParameters: {
      operation: "send",
      content: "",
    },
    description: "Send messages to Discord channels",
    category: "communication",
  },
  "n8n-nodes-base.whatsApp": {
    type: "n8n-nodes-base.whatsApp",
    typeVersion: 1,
    credentials: { whatsAppTriggerApi: "whatsAppTriggerApi" },
    defaultParameters: {
      resource: "message",
      operation: "send",
      phoneNumberId: "",
      recipientPhoneNumber: "",
      textBody: "",
    },
    description: "Send WhatsApp messages via Meta API",
    category: "communication",
  },

  // ─── Google Services ──────────────────────────────────────────────────────────
  "n8n-nodes-base.googleSheets": {
    type: "n8n-nodes-base.googleSheets",
    typeVersion: 4,
    credentials: { googleSheetsOAuth2Api: "googleSheetsOAuth2Api" },
    defaultParameters: {
      operation: "append",
      resource: "sheet",
      documentId: { __rl: true, mode: "id", value: "" },
      sheetName: { __rl: true, mode: "name", value: "Sheet1" },
      columns: { mappingMode: "autoMapInputData", value: {} },
    },
    description: "Read, write, update Google Sheets",
    category: "productivity",
  },
  "n8n-nodes-base.googleDrive": {
    type: "n8n-nodes-base.googleDrive",
    typeVersion: 3,
    credentials: { googleDriveOAuth2Api: "googleDriveOAuth2Api" },
    defaultParameters: {
      resource: "file",
      operation: "list",
    },
    description: "Manage files and folders in Google Drive",
    category: "productivity",
  },
  "n8n-nodes-base.googleCalendar": {
    type: "n8n-nodes-base.googleCalendar",
    typeVersion: 1,
    credentials: { googleCalendarOAuth2Api: "googleCalendarOAuth2Api" },
    defaultParameters: {
      resource: "event",
      operation: "create",
      calendar: "primary",
      start: "",
      end: "",
      summary: "",
    },
    description: "Create, read, update Google Calendar events",
    category: "productivity",
  },
  "n8n-nodes-base.googleDocs": {
    type: "n8n-nodes-base.googleDocs",
    typeVersion: 2,
    credentials: { googleDocsOAuth2Api: "googleDocsOAuth2Api" },
    defaultParameters: {
      operation: "create",
      resource: "document",
      title: "",
    },
    description: "Create and manage Google Docs documents",
    category: "productivity",
  },

  // ─── HTTP & APIs ──────────────────────────────────────────────────────────────
  "n8n-nodes-base.httpRequest": {
    type: "n8n-nodes-base.httpRequest",
    typeVersion: 4,
    defaultParameters: {
      method: "GET",
      url: "",
      sendHeaders: false,
      sendBody: false,
      options: {},
    },
    description: "Make HTTP requests to any REST API",
    category: "core",
  },
  "n8n-nodes-base.webhook": {
    type: "n8n-nodes-base.webhook",
    typeVersion: 2,
    defaultParameters: {
      httpMethod: "POST",
      path: "webhook",
      responseMode: "onReceived",
      responseData: "allEntries",
    },
    description: "Receive data via HTTP webhook",
    category: "trigger",
  },
  "n8n-nodes-base.respondToWebhook": {
    type: "n8n-nodes-base.respondToWebhook",
    typeVersion: 1,
    defaultParameters: {
      respondWith: "json",
      responseBody: "={{ $json }}",
    },
    description: "Send response back to a webhook caller",
    category: "core",
  },

  // ─── Data Processing ──────────────────────────────────────────────────────────
  "n8n-nodes-base.set": {
    type: "n8n-nodes-base.set",
    typeVersion: 3,
    defaultParameters: {
      mode: "manual",
      duplicateItem: false,
      assignments: { assignments: [] },
      options: {},
    },
    description: "Set, modify, or map data fields",
    category: "core",
  },
  "n8n-nodes-base.code": {
    type: "n8n-nodes-base.code",
    typeVersion: 2,
    defaultParameters: {
      language: "javaScript",
      jsCode: "// Process items\nreturn items;",
    },
    description: "Run custom JavaScript or Python code",
    category: "core",
  },
  "n8n-nodes-base.if": {
    type: "n8n-nodes-base.if",
    typeVersion: 2,
    defaultParameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: "", typeValidation: "strict" },
        conditions: [],
        combinator: "and",
      },
      options: {},
    },
    description: "Conditional branching based on data values",
    category: "core",
  },
  "n8n-nodes-base.switch": {
    type: "n8n-nodes-base.switch",
    typeVersion: 3,
    defaultParameters: {
      mode: "rules",
      rules: { rules: [] },
      options: {},
    },
    description: "Route data to different paths based on conditions",
    category: "core",
  },
  "n8n-nodes-base.merge": {
    type: "n8n-nodes-base.merge",
    typeVersion: 3,
    defaultParameters: {
      mode: "append",
      options: {},
    },
    description: "Merge data from multiple branches",
    category: "core",
  },
  "n8n-nodes-base.splitInBatches": {
    type: "n8n-nodes-base.splitInBatches",
    typeVersion: 3,
    defaultParameters: {
      batchSize: 10,
      options: {},
    },
    description: "Split items into batches for processing",
    category: "core",
  },
  "n8n-nodes-base.itemLists": {
    type: "n8n-nodes-base.itemLists",
    typeVersion: 3,
    defaultParameters: {
      operation: "splitOutItems",
      fieldToSplitOut: "",
      options: {},
    },
    description: "Manipulate item arrays (split, aggregate, sort, limit)",
    category: "core",
  },
  "n8n-nodes-base.filter": {
    type: "n8n-nodes-base.filter",
    typeVersion: 1,
    defaultParameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: "", typeValidation: "strict" },
        conditions: [],
        combinator: "and",
      },
    },
    description: "Filter items based on conditions",
    category: "core",
  },
  "n8n-nodes-base.aggregate": {
    type: "n8n-nodes-base.aggregate",
    typeVersion: 1,
    defaultParameters: {
      aggregate: "aggregateAllItemData",
      destinationFieldName: "data",
      options: {},
    },
    description: "Aggregate multiple items into a single item",
    category: "core",
  },
  "n8n-nodes-base.dateTime": {
    type: "n8n-nodes-base.dateTime",
    typeVersion: 2,
    defaultParameters: {
      operation: "getCurrentDate",
      options: {},
    },
    description: "Date and time operations (format, convert, calculate)",
    category: "core",
  },
  "n8n-nodes-base.noOp": {
    type: "n8n-nodes-base.noOp",
    typeVersion: 1,
    defaultParameters: {},
    description: "No operation — useful as a placeholder node",
    category: "core",
  },
  "n8n-nodes-base.wait": {
    type: "n8n-nodes-base.wait",
    typeVersion: 1,
    defaultParameters: {
      resume: "timeInterval",
      amount: 5,
      unit: "minutes",
    },
    description: "Pause workflow execution for a set time",
    category: "core",
  },

  // ─── AI & LLM ─────────────────────────────────────────────────────────────────
  "@n8n/n8n-nodes-langchain.openAi": {
    type: "@n8n/n8n-nodes-langchain.openAi",
    typeVersion: 1,
    credentials: { openAiApi: "openAiApi" },
    defaultParameters: {
      resource: "text",
      operation: "complete",
      modelId: { __rl: true, value: "gpt-4o", mode: "list" },
      prompt: "",
      options: {},
    },
    description: "Use OpenAI GPT models for text generation",
    category: "ai",
  },
  "@n8n/n8n-nodes-langchain.lmChatOpenAi": {
    type: "@n8n/n8n-nodes-langchain.lmChatOpenAi",
    typeVersion: 1,
    credentials: { openAiApi: "openAiApi" },
    defaultParameters: {
      model: "gpt-4o",
      options: {},
    },
    description: "OpenAI Chat model for AI Agent chains",
    category: "ai",
  },
  "@n8n/n8n-nodes-langchain.agent": {
    type: "@n8n/n8n-nodes-langchain.agent",
    typeVersion: 1,
    defaultParameters: {
      agentType: "conversationalAgent",
      options: {},
    },
    description: "AI Agent that can use tools and reason",
    category: "ai",
  },
  "@n8n/n8n-nodes-langchain.chainSummarization": {
    type: "@n8n/n8n-nodes-langchain.chainSummarization",
    typeVersion: 2,
    defaultParameters: {
      options: {},
    },
    description: "Summarize text using LLM chains",
    category: "ai",
  },

  // ─── Databases ────────────────────────────────────────────────────────────────
  "n8n-nodes-base.postgres": {
    type: "n8n-nodes-base.postgres",
    typeVersion: 2,
    credentials: { postgres: "postgres" },
    defaultParameters: {
      operation: "select",
      query: "SELECT * FROM table_name LIMIT 10;",
      options: {},
    },
    description: "Query and manage PostgreSQL databases",
    category: "database",
  },
  "n8n-nodes-base.mysql": {
    type: "n8n-nodes-base.mysql",
    typeVersion: 2,
    credentials: { mySql: "mySql" },
    defaultParameters: {
      operation: "select",
      query: "SELECT * FROM table_name LIMIT 10;",
      options: {},
    },
    description: "Query and manage MySQL databases",
    category: "database",
  },
  "n8n-nodes-base.mongoDb": {
    type: "n8n-nodes-base.mongoDb",
    typeVersion: 1,
    credentials: { mongoDb: "mongoDb" },
    defaultParameters: {
      operation: "find",
      collection: "",
      query: "{}",
    },
    description: "Query and manage MongoDB databases",
    category: "database",
  },
  "n8n-nodes-base.redis": {
    type: "n8n-nodes-base.redis",
    typeVersion: 1,
    credentials: { redis: "redis" },
    defaultParameters: {
      operation: "get",
      key: "",
    },
    description: "Read and write Redis key-value store",
    category: "database",
  },

  // ─── CRM & Business Tools ─────────────────────────────────────────────────────
  "n8n-nodes-base.airtable": {
    type: "n8n-nodes-base.airtable",
    typeVersion: 2,
    credentials: { airtableTokenApi: "airtableTokenApi" },
    defaultParameters: {
      operation: "list",
      resource: "record",
      baseId: { __rl: true, mode: "id", value: "" },
      tableId: { __rl: true, mode: "id", value: "" },
    },
    description: "Create, read, update Airtable records",
    category: "productivity",
  },
  "n8n-nodes-base.notion": {
    type: "n8n-nodes-base.notion",
    typeVersion: 2,
    credentials: { notionApi: "notionApi" },
    defaultParameters: {
      resource: "page",
      operation: "create",
      databaseId: { __rl: true, value: "", mode: "id" },
      title: "",
      propertiesUi: { propertyValues: [] },
    },
    description: "Create and manage Notion pages and databases",
    category: "productivity",
  },
  "n8n-nodes-base.hubspot": {
    type: "n8n-nodes-base.hubspot",
    typeVersion: 2,
    credentials: { hubspotPrivateAppApi: "hubspotPrivateAppApi" },
    defaultParameters: {
      resource: "contact",
      operation: "create",
      additionalFields: {},
    },
    description: "Manage HubSpot CRM contacts, deals, companies",
    category: "crm",
  },
  "n8n-nodes-base.salesforce": {
    type: "n8n-nodes-base.salesforce",
    typeVersion: 1,
    credentials: { salesforceOAuth2Api: "salesforceOAuth2Api" },
    defaultParameters: {
      resource: "lead",
      operation: "create",
      company: "",
      lastname: "",
    },
    description: "Manage Salesforce CRM records",
    category: "crm",
  },

  // ─── File & Storage ───────────────────────────────────────────────────────────
  "n8n-nodes-base.readWriteFile": {
    type: "n8n-nodes-base.readWriteFile",
    typeVersion: 1,
    defaultParameters: {
      operation: "read",
      fileName: "",
    },
    description: "Read and write files on the filesystem",
    category: "files",
  },
  "n8n-nodes-base.convertToFile": {
    type: "n8n-nodes-base.convertToFile",
    typeVersion: 1,
    defaultParameters: {
      operation: "toJson",
      options: {},
    },
    description: "Convert data to file (JSON, CSV, Binary)",
    category: "files",
  },
  "n8n-nodes-base.extractFromFile": {
    type: "n8n-nodes-base.extractFromFile",
    typeVersion: 1,
    defaultParameters: {
      operation: "fromJson",
      options: {},
    },
    description: "Extract data from files (JSON, CSV, XML, HTML)",
    category: "files",
  },
  "n8n-nodes-base.spreadsheetFile": {
    type: "n8n-nodes-base.spreadsheetFile",
    typeVersion: 2,
    defaultParameters: {
      operation: "fromFile",
      options: {},
    },
    description: "Read and write Excel/CSV spreadsheet files",
    category: "files",
  },

  // ─── Error Handling ───────────────────────────────────────────────────────────
  "n8n-nodes-base.stopAndError": {
    type: "n8n-nodes-base.stopAndError",
    typeVersion: 1,
    defaultParameters: {
      errorType: "errorMessage",
      errorMessage: "An error occurred",
    },
    description: "Stop workflow and throw a custom error",
    category: "core",
  },
  "n8n-nodes-base.executeWorkflow": {
    type: "n8n-nodes-base.executeWorkflow",
    typeVersion: 1,
    defaultParameters: {
      source: "database",
      workflowId: { __rl: true, value: "", mode: "id" },
      mode: "once",
      options: {},
    },
    description: "Call and execute another n8n workflow",
    category: "core",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Keyword → Node mapping for intent-based schema selection
// ─────────────────────────────────────────────────────────────────────────────

const KEYWORD_NODE_MAP: Array<{ keywords: string[]; nodes: string[] }> = [
  {
    keywords: ["gmail", "email", "بريد", "إيميل", "ايميل"],
    nodes: ["n8n-nodes-base.gmail", "n8n-nodes-base.gmailTrigger"],
  },
  {
    keywords: ["slack"],
    nodes: ["n8n-nodes-base.slack"],
  },
  {
    keywords: ["telegram", "تيليغرام", "تلغرام", "بوت"],
    nodes: ["n8n-nodes-base.telegram", "n8n-nodes-base.telegramTrigger"],
  },
  {
    keywords: ["whatsapp", "واتساب", "وتساب"],
    nodes: ["n8n-nodes-base.whatsApp"],
  },
  {
    keywords: ["discord"],
    nodes: ["n8n-nodes-base.discord"],
  },
  {
    keywords: ["teams", "microsoft teams"],
    nodes: ["n8n-nodes-base.microsoftTeams"],
  },
  {
    keywords: ["google sheets", "spreadsheet", "جوجل شيتس", "جداول"],
    nodes: ["n8n-nodes-base.googleSheets"],
  },
  {
    keywords: ["google drive", "drive", "درايف"],
    nodes: ["n8n-nodes-base.googleDrive"],
  },
  {
    keywords: ["google calendar", "calendar", "تقويم", "كالندر"],
    nodes: ["n8n-nodes-base.googleCalendar"],
  },
  {
    keywords: ["google docs", "document", "مستند"],
    nodes: ["n8n-nodes-base.googleDocs"],
  },
  {
    keywords: ["notion", "نوشن"],
    nodes: ["n8n-nodes-base.notion"],
  },
  {
    keywords: ["airtable", "إيرتيبل"],
    nodes: ["n8n-nodes-base.airtable"],
  },
  {
    keywords: ["hubspot", "هاب سبوت", "crm"],
    nodes: ["n8n-nodes-base.hubspot"],
  },
  {
    keywords: ["salesforce", "سيلزفورس"],
    nodes: ["n8n-nodes-base.salesforce"],
  },
  {
    keywords: ["postgres", "postgresql", "بوستغرس"],
    nodes: ["n8n-nodes-base.postgres"],
  },
  {
    keywords: ["mysql", "ماي سكيول"],
    nodes: ["n8n-nodes-base.mysql"],
  },
  {
    keywords: ["mongodb", "mongo"],
    nodes: ["n8n-nodes-base.mongoDb"],
  },
  {
    keywords: ["redis"],
    nodes: ["n8n-nodes-base.redis"],
  },
  {
    keywords: ["http", "api", "request", "rest", "endpoint", "url"],
    nodes: ["n8n-nodes-base.httpRequest"],
  },
  {
    keywords: ["webhook", "ويب هوك"],
    nodes: ["n8n-nodes-base.webhook", "n8n-nodes-base.respondToWebhook"],
  },
  {
    keywords: ["openai", "gpt", "chatgpt", "ai", "ذكاء اصطناعي"],
    nodes: ["@n8n/n8n-nodes-langchain.openAi", "@n8n/n8n-nodes-langchain.lmChatOpenAi"],
  },
  {
    keywords: ["agent", "langchain", "tool", "أداة"],
    nodes: ["@n8n/n8n-nodes-langchain.agent"],
  },
  {
    keywords: ["schedule", "cron", "جدول", "وقت", "تلقائي", "كل يوم", "يومي", "أسبوعي", "شهري"],
    nodes: ["n8n-nodes-base.scheduleTrigger"],
  },
  {
    keywords: ["if", "condition", "شرط", "إذا"],
    nodes: ["n8n-nodes-base.if"],
  },
  {
    keywords: ["code", "script", "كود"],
    nodes: ["n8n-nodes-base.code"],
  },
  {
    keywords: ["file", "ملف", "excel", "csv", "xlsx"],
    nodes: ["n8n-nodes-base.readWriteFile", "n8n-nodes-base.spreadsheetFile"],
  },
  {
    keywords: ["wait", "delay", "انتظر", "تأخير"],
    nodes: ["n8n-nodes-base.wait"],
  },
  {
    keywords: ["merge", "join", "دمج"],
    nodes: ["n8n-nodes-base.merge"],
  },
  {
    keywords: ["batch", "دفعة"],
    nodes: ["n8n-nodes-base.splitInBatches"],
  },
  {
    keywords: ["filter", "فلتر", "تصفية"],
    nodes: ["n8n-nodes-base.filter"],
  },
  {
    keywords: ["summarize", "تلخيص", "ملخص"],
    nodes: ["@n8n/n8n-nodes-langchain.chainSummarization"],
  },
];

/**
 * Analyzes user request and returns relevant node schemas
 * based on keyword matching.
 */
export function getRelevantSchemas(userRequest: string): NodeSchema[] {
  const lowerRequest = userRequest.toLowerCase();
  const matchedNodeTypes = new Set<string>();

  for (const mapping of KEYWORD_NODE_MAP) {
    if (mapping.keywords.some((kw) => lowerRequest.includes(kw.toLowerCase()))) {
      mapping.nodes.forEach((n) => matchedNodeTypes.add(n));
    }
  }

  // Always include core nodes
  const coreNodes = [
    "n8n-nodes-base.set",
    "n8n-nodes-base.if",
    "n8n-nodes-base.code",
    "n8n-nodes-base.httpRequest",
    "n8n-nodes-base.stopAndError",
  ];
  coreNodes.forEach((n) => matchedNodeTypes.add(n));

  const schemas: NodeSchema[] = [];
  for (const nodeType of matchedNodeTypes) {
    if (NODE_SCHEMAS[nodeType]) {
      schemas.push(NODE_SCHEMAS[nodeType]!);
    }
  }

  return schemas;
}

/**
 * Builds a compact schema reference string for injection into prompts.
 */
export function buildSchemaReferenceBlock(schemas: NodeSchema[]): string {
  const lines: string[] = [
    "EXACT n8n NODE SPECIFICATIONS (use these precisely — do not deviate from type names, typeVersion, or credential names):",
    "",
  ];

  for (const schema of schemas) {
    lines.push(`Node: ${schema.type}`);
    lines.push(`  typeVersion: ${schema.typeVersion}`);
    if (schema.credentials && Object.keys(schema.credentials).length > 0) {
      const credStr = Object.entries(schema.credentials)
        .map(([k, v]) => `${k}: "${v}"`)
        .join(", ");
      lines.push(`  credentials: { ${credStr} }`);
    }
    lines.push(`  defaultParameters: ${JSON.stringify(schema.defaultParameters)}`);
    lines.push(`  purpose: ${schema.description}`);
    lines.push("");
  }

  return lines.join("\n");
}
