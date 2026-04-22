import { db, usersTable, userPermissionsTable, templatesTable, ALL_PERMISSIONS } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { logger } from "./lib/logger";
import { seedNodeCatalog } from "./services/nodeCatalog.service";

const SYSTEM_TEMPLATES = [
  {
    name: "إرسال إيميل تلقائي",
    nameEn: "Automated Email Sender",
    description: "إرسال إشعارات بريد إلكتروني تلقائية عند حدوث أحداث محددة عبر Gmail",
    descriptionEn: "Send automated email notifications via Gmail when specific events occur",
    category: "email",
    nodesCount: 4,
    avgRating: 4.5,
    workflowJson: {
      name: "Automated Email Sender",
      nodes: [
        {
          id: "trigger-1",
          name: "Schedule Trigger",
          type: "n8n-nodes-base.scheduleTrigger",
          typeVersion: 1.2,
          position: [240, 300],
          parameters: {
            rule: { interval: [{ field: "hours", hoursInterval: 24 }] },
          },
        },
        {
          id: "code-1",
          name: "Prepare Email Data",
          type: "n8n-nodes-base.code",
          typeVersion: 2,
          position: [460, 300],
          parameters: {
            jsCode: "const now = new Date();\nreturn [{\n  json: {\n    subject: `تقرير يومي - ${now.toLocaleDateString('ar-SA')}`,\n    body: `مرحباً،\\n\\nهذا تقرير يومي تلقائي.\\n\\nالتاريخ: ${now.toLocaleDateString('ar-SA')}\\nالوقت: ${now.toLocaleTimeString('ar-SA')}\\n\\nمع التحية`,\n    to: 'recipient@example.com'\n  }\n}];",
          },
        },
        {
          id: "gmail-1",
          name: "Send Email via Gmail",
          type: "n8n-nodes-base.gmail",
          typeVersion: 2.1,
          position: [680, 300],
          parameters: {
            operation: "send",
            sendTo: "={{ $json.to }}",
            subject: "={{ $json.subject }}",
            emailType: "text",
            message: "={{ $json.body }}",
          },
          credentials: { gmailOAuth2: { id: "1", name: "Gmail Account" } },
        },
        {
          id: "error-1",
          name: "Error Handler",
          type: "n8n-nodes-base.noOp",
          typeVersion: 1,
          position: [680, 460],
          parameters: {},
        },
      ],
      connections: {
        "Schedule Trigger": { main: [[{ node: "Prepare Email Data", type: "main", index: 0 }]] },
        "Prepare Email Data": { main: [[{ node: "Send Email via Gmail", type: "main", index: 0 }]] },
      },
      settings: { executionOrder: "v1", errorWorkflow: "" },
    },
  },
  {
    name: "استقبال Webhook ومعالجة البيانات",
    nameEn: "Webhook Data Receiver & Processor",
    description: "استقبال البيانات عبر Webhook، التحقق منها، ومعالجتها وحفظها في قاعدة بيانات",
    descriptionEn: "Receive data via Webhook, validate, process and store it in a database",
    category: "api",
    nodesCount: 5,
    avgRating: 4.2,
    workflowJson: {
      name: "Webhook Data Receiver",
      nodes: [
        {
          id: "webhook-1",
          name: "Webhook Trigger",
          type: "n8n-nodes-base.webhook",
          typeVersion: 2,
          position: [240, 300],
          parameters: {
            httpMethod: "POST",
            path: "data-receiver",
            responseMode: "responseNode",
            options: {},
          },
          webhookId: "webhook-data-receiver",
        },
        {
          id: "if-1",
          name: "Validate Data",
          type: "n8n-nodes-base.if",
          typeVersion: 2,
          position: [460, 300],
          parameters: {
            conditions: {
              options: { caseSensitive: true, leftValue: "", typeValidation: "strict" },
              conditions: [{ id: "check-1", leftValue: "={{ $json.body }}", rightValue: "", operator: { type: "string", operation: "notEmpty" } }],
              combinator: "and",
            },
          },
        },
        {
          id: "code-2",
          name: "Process & Transform",
          type: "n8n-nodes-base.code",
          typeVersion: 2,
          position: [680, 220],
          parameters: {
            jsCode: "const data = $input.item.json;\nconst processed = {\n  ...data,\n  processedAt: new Date().toISOString(),\n  status: 'processed',\n  id: Math.random().toString(36).substr(2, 9)\n};\nreturn [{ json: processed }];",
          },
        },
        {
          id: "respond-1",
          name: "Respond Success",
          type: "n8n-nodes-base.respondToWebhook",
          typeVersion: 1.1,
          position: [900, 220],
          parameters: {
            options: { responseCode: 200 },
            respondWith: "json",
            responseBody: "={{ JSON.stringify({ success: true, id: $json.id, message: 'تم استلام البيانات بنجاح' }) }}",
          },
        },
        {
          id: "respond-err",
          name: "Respond Error",
          type: "n8n-nodes-base.respondToWebhook",
          typeVersion: 1.1,
          position: [680, 420],
          parameters: {
            options: { responseCode: 400 },
            respondWith: "json",
            responseBody: '{"success":false,"message":"البيانات غير صالحة"}',
          },
        },
      ],
      connections: {
        "Webhook Trigger": { main: [[{ node: "Validate Data", type: "main", index: 0 }]] },
        "Validate Data": {
          main: [
            [{ node: "Process & Transform", type: "main", index: 0 }],
            [{ node: "Respond Error", type: "main", index: 0 }],
          ],
        },
        "Process & Transform": { main: [[{ node: "Respond Success", type: "main", index: 0 }]] },
      },
      settings: { executionOrder: "v1" },
    },
  },
  {
    name: "تقرير يومي تلقائي",
    nameEn: "Automated Daily Report",
    description: "جلب البيانات من مصادر متعددة وإنشاء وإرسال تقرير يومي شامل في وقت محدد",
    descriptionEn: "Fetch data from multiple sources and generate & send a comprehensive daily report at a scheduled time",
    category: "reports",
    nodesCount: 6,
    avgRating: 4.7,
    workflowJson: {
      name: "Daily Report Generator",
      nodes: [
        {
          id: "cron-1",
          name: "Daily at 8 AM",
          type: "n8n-nodes-base.scheduleTrigger",
          typeVersion: 1.2,
          position: [240, 300],
          parameters: {
            rule: {
              interval: [{ field: "cronExpression", expression: "0 8 * * *" }],
            },
          },
        },
        {
          id: "http-1",
          name: "Fetch API Data",
          type: "n8n-nodes-base.httpRequest",
          typeVersion: 4.2,
          position: [460, 200],
          parameters: {
            method: "GET",
            url: "https://jsonplaceholder.typicode.com/todos?_limit=5",
            options: {},
          },
        },
        {
          id: "code-3",
          name: "Build Report",
          type: "n8n-nodes-base.code",
          typeVersion: 2,
          position: [680, 300],
          parameters: {
            jsCode: "const items = $input.all();\nconst data = items[0]?.json;\nconst now = new Date();\nconst report = `=== التقرير اليومي ===\\nالتاريخ: ${now.toLocaleDateString('ar-SA')}\\n\\nملخص البيانات:\\n${JSON.stringify(data, null, 2)}\\n\\n=== انتهى التقرير ===`;\nreturn [{ json: { report, date: now.toISOString(), subject: `تقرير يومي - ${now.toLocaleDateString('ar-SA')}` } }];",
          },
        },
        {
          id: "gmail-2",
          name: "Email Report",
          type: "n8n-nodes-base.gmail",
          typeVersion: 2.1,
          position: [900, 300],
          parameters: {
            operation: "send",
            sendTo: "admin@example.com",
            subject: "={{ $json.subject }}",
            emailType: "text",
            message: "={{ $json.report }}",
          },
          credentials: { gmailOAuth2: { id: "1", name: "Gmail Account" } },
        },
        {
          id: "slack-1",
          name: "Notify Slack",
          type: "n8n-nodes-base.slack",
          typeVersion: 2.3,
          position: [900, 440],
          parameters: {
            operation: "message",
            select: "channel",
            channelId: { __rl: true, value: "#reports", mode: "name" },
            text: "📊 تم إرسال التقرير اليومي. راجع بريدك الإلكتروني.",
            otherOptions: {},
          },
          credentials: { slackApi: { id: "2", name: "Slack Account" } },
        },
        {
          id: "error-2",
          name: "Log Error",
          type: "n8n-nodes-base.noOp",
          typeVersion: 1,
          position: [680, 480],
          parameters: {},
        },
      ],
      connections: {
        "Daily at 8 AM": { main: [[{ node: "Fetch API Data", type: "main", index: 0 }]] },
        "Fetch API Data": { main: [[{ node: "Build Report", type: "main", index: 0 }]] },
        "Build Report": {
          main: [
            [
              { node: "Email Report", type: "main", index: 0 },
              { node: "Notify Slack", type: "main", index: 0 },
            ],
          ],
        },
      },
      settings: { executionOrder: "v1" },
    },
  },
  {
    name: "مزامنة Google Sheets",
    nameEn: "Google Sheets Sync",
    description: "جلب بيانات من API خارجي ومزامنتها تلقائياً مع Google Sheets كل ساعة",
    descriptionEn: "Fetch data from an external API and automatically sync it with Google Sheets every hour",
    category: "reports",
    nodesCount: 4,
    avgRating: 4.0,
    workflowJson: {
      name: "Google Sheets Sync",
      nodes: [
        {
          id: "trigger-2",
          name: "Hourly Trigger",
          type: "n8n-nodes-base.scheduleTrigger",
          typeVersion: 1.2,
          position: [240, 300],
          parameters: {
            rule: { interval: [{ field: "hours", hoursInterval: 1 }] },
          },
        },
        {
          id: "http-2",
          name: "Fetch Source Data",
          type: "n8n-nodes-base.httpRequest",
          typeVersion: 4.2,
          position: [460, 300],
          parameters: {
            method: "GET",
            url: "https://jsonplaceholder.typicode.com/users",
            options: {},
          },
        },
        {
          id: "split-1",
          name: "Split Into Items",
          type: "n8n-nodes-base.splitInBatches",
          typeVersion: 3,
          position: [680, 300],
          parameters: { batchSize: 10, options: {} },
        },
        {
          id: "sheets-1",
          name: "Append to Sheet",
          type: "n8n-nodes-base.googleSheets",
          typeVersion: 4.5,
          position: [900, 300],
          parameters: {
            operation: "appendOrUpdate",
            documentId: { __rl: true, value: "YOUR_SHEET_ID", mode: "id" },
            sheetName: { __rl: true, value: "Sheet1", mode: "name" },
            columns: {
              mappingMode: "autoMapInputData",
              value: {},
              matchingColumns: ["id"],
              schema: [],
            },
            options: {},
          },
          credentials: { googleSheetsOAuth2Api: { id: "3", name: "Google Sheets" } },
        },
      ],
      connections: {
        "Hourly Trigger": { main: [[{ node: "Fetch Source Data", type: "main", index: 0 }]] },
        "Fetch Source Data": { main: [[{ node: "Split Into Items", type: "main", index: 0 }]] },
        "Split Into Items": { main: [[{ node: "Append to Sheet", type: "main", index: 0 }]] },
      },
      settings: { executionOrder: "v1" },
    },
  },
  {
    name: "جدولة مهام زمنية",
    nameEn: "Cron Task Scheduler",
    description: "تنفيذ مهام متعددة في أوقات مجدولة مع إشعار بالنتيجة",
    descriptionEn: "Execute multiple tasks at scheduled times with result notifications",
    category: "scheduling",
    nodesCount: 5,
    avgRating: 4.3,
    workflowJson: {
      name: "Task Scheduler",
      nodes: [
        {
          id: "cron-2",
          name: "Every Morning",
          type: "n8n-nodes-base.scheduleTrigger",
          typeVersion: 1.2,
          position: [240, 300],
          parameters: {
            rule: { interval: [{ field: "cronExpression", expression: "0 9 * * 1-5" }] },
          },
        },
        {
          id: "code-4",
          name: "Define Tasks",
          type: "n8n-nodes-base.code",
          typeVersion: 2,
          position: [460, 300],
          parameters: {
            jsCode: "const tasks = [\n  { id: 1, name: 'فحص الخادم', priority: 'high' },\n  { id: 2, name: 'تنظيف البيانات المؤقتة', priority: 'medium' },\n  { id: 3, name: 'نسخ احتياطي', priority: 'high' },\n];\nreturn tasks.map(t => ({ json: t }));",
          },
        },
        {
          id: "switch-1",
          name: "Route by Priority",
          type: "n8n-nodes-base.switch",
          typeVersion: 3.2,
          position: [680, 300],
          parameters: {
            mode: "rules",
            rules: {
              values: [
                { conditions: { options: {}, conditions: [{ leftValue: "={{ $json.priority }}", rightValue: "high", operator: { type: "string", operation: "equals" } }], combinator: "and" }, renameOutput: true, outputKey: "High Priority" },
                { conditions: { options: {}, conditions: [{ leftValue: "={{ $json.priority }}", rightValue: "medium", operator: { type: "string", operation: "equals" } }], combinator: "and" }, renameOutput: true, outputKey: "Medium Priority" },
              ],
            },
            options: {},
          },
        },
        {
          id: "code-5",
          name: "Execute High Priority",
          type: "n8n-nodes-base.code",
          typeVersion: 2,
          position: [900, 200],
          parameters: { jsCode: "return [{ json: { ...($input.item.json), executed: true, executedAt: new Date().toISOString(), result: 'success' } }];" },
        },
        {
          id: "code-6",
          name: "Execute Medium Priority",
          type: "n8n-nodes-base.code",
          typeVersion: 2,
          position: [900, 400],
          parameters: { jsCode: "return [{ json: { ...($input.item.json), executed: true, executedAt: new Date().toISOString(), result: 'success' } }];" },
        },
      ],
      connections: {
        "Every Morning": { main: [[{ node: "Define Tasks", type: "main", index: 0 }]] },
        "Define Tasks": { main: [[{ node: "Route by Priority", type: "main", index: 0 }]] },
        "Route by Priority": {
          main: [
            [{ node: "Execute High Priority", type: "main", index: 0 }],
            [{ node: "Execute Medium Priority", type: "main", index: 0 }],
          ],
        },
      },
      settings: { executionOrder: "v1" },
    },
  },
  {
    name: "تنظيف قاعدة البيانات الدورية",
    nameEn: "Periodic Database Cleanup",
    description: "حذف السجلات القديمة وتحسين قاعدة البيانات تلقائياً كل أسبوع",
    descriptionEn: "Automatically delete old records and optimize the database every week",
    category: "database",
    nodesCount: 5,
    avgRating: 4.1,
    workflowJson: {
      name: "Database Cleanup",
      nodes: [
        {
          id: "cron-3",
          name: "Weekly on Sunday",
          type: "n8n-nodes-base.scheduleTrigger",
          typeVersion: 1.2,
          position: [240, 300],
          parameters: {
            rule: { interval: [{ field: "cronExpression", expression: "0 2 * * 0" }] },
          },
        },
        {
          id: "code-7",
          name: "Calculate Cutoff Date",
          type: "n8n-nodes-base.code",
          typeVersion: 2,
          position: [460, 300],
          parameters: {
            jsCode: "const now = new Date();\nconst cutoff = new Date(now);\ncutoff.setDate(cutoff.getDate() - 30);\nreturn [{ json: { cutoffDate: cutoff.toISOString(), cutoffDateSQL: cutoff.toISOString().split('T')[0], startedAt: now.toISOString() } }];",
          },
        },
        {
          id: "http-3",
          name: "Call Cleanup API",
          type: "n8n-nodes-base.httpRequest",
          typeVersion: 4.2,
          position: [680, 300],
          parameters: {
            method: "DELETE",
            url: "https://your-api.example.com/api/records/cleanup",
            sendQuery: true,
            queryParameters: { parameters: [{ name: "before", value: "={{ $json.cutoffDate }}" }] },
            options: {},
          },
        },
        {
          id: "code-8",
          name: "Build Summary",
          type: "n8n-nodes-base.code",
          typeVersion: 2,
          position: [900, 300],
          parameters: {
            jsCode: "const result = $input.item.json;\nreturn [{ json: { message: `تم تنظيف قاعدة البيانات بنجاح. السجلات المحذوفة: ${result.deleted ?? 'غير متاح'}`, completedAt: new Date().toISOString() } }];",
          },
        },
        {
          id: "error-3",
          name: "Error Handler",
          type: "n8n-nodes-base.noOp",
          typeVersion: 1,
          position: [680, 480],
          parameters: {},
        },
      ],
      connections: {
        "Weekly on Sunday": { main: [[{ node: "Calculate Cutoff Date", type: "main", index: 0 }]] },
        "Calculate Cutoff Date": { main: [[{ node: "Call Cleanup API", type: "main", index: 0 }]] },
        "Call Cleanup API": { main: [[{ node: "Build Summary", type: "main", index: 0 }]] },
      },
      settings: { executionOrder: "v1" },
    },
  },
];

export async function seedDatabase() {
  logger.info("Starting database seed...");

  // ─── Admin User ──────────────────────────────────────────────────────────────
  // Check if ANY admin role user exists (not tied to a specific username)
  const existingAdmin = await db.select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.role, "admin"))
    .limit(1);

  if (!existingAdmin[0]) {
    const passwordHash = await bcrypt.hash("123456", 12);
    const [admin] = await db.insert(usersTable).values({
      username: "admin",
      passwordHash,
      role: "admin",
      isActive: true,
      forcePasswordChange: false,
    }).returning();

    if (admin) {
      await db.insert(userPermissionsTable).values(
        ALL_PERMISSIONS.map(key => ({
          userId: admin.id,
          permissionKey: key,
          isEnabled: true,
        }))
      );
      logger.info({ userId: admin.id }, "Admin user created: admin / 123456");
    }
  } else {
    logger.info("Admin user already exists — skipping");
  }

  // ─── System Templates ────────────────────────────────────────────────────────
  for (const template of SYSTEM_TEMPLATES) {
    const existing = await db.select({ id: templatesTable.id })
      .from(templatesTable)
      .where(eq(templatesTable.name, template.name))
      .limit(1);

    if (!existing[0]) {
      await db.insert(templatesTable).values({
        name: template.name,
        nameEn: template.nameEn,
        description: template.description,
        descriptionEn: template.descriptionEn,
        category: template.category,
        nodesCount: template.nodesCount,
        workflowJson: template.workflowJson,
        usageCount: 0,
        avgRating: template.avgRating,
        isSystem: true,
      });
      logger.info({ name: template.name }, "Template seeded");
    }
  }

  // ─── n8n Node Catalog ────────────────────────────────────────────────────────
  try {
    const catalogResult = await seedNodeCatalog();
    if (catalogResult.inserted > 0) {
      logger.info(catalogResult, "Node catalog seeded");
    } else {
      logger.info({ total: catalogResult.total }, "Node catalog already up to date");
    }
  } catch (err) {
    logger.error({ err: err instanceof Error ? err.message : String(err) }, "Node catalog seeding failed");
  }

  logger.info("Seed completed successfully.");
}
