import { db, usersTable, userPermissionsTable, templatesTable, ALL_PERMISSIONS } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { logger } from "./lib/logger";

const SYSTEM_TEMPLATES = [
  {
    name: "إرسال إيميل تلقائي",
    nameEn: "Automated Email",
    description: "إرسال إشعارات بريد إلكتروني تلقائية عند حدوث أحداث محددة",
    descriptionEn: "Send automated email notifications when specific events occur",
    category: "email",
    nodesCount: 4,
    workflowJson: { nodes: [], connections: {} },
    isSystem: true,
    avgRating: 4.5,
  },
  {
    name: "Webhook استقبال البيانات",
    nameEn: "Webhook Data Receiver",
    description: "استقبال البيانات عبر Webhook ومعالجتها وحفظها",
    descriptionEn: "Receive data via Webhook, process and store it",
    category: "api",
    nodesCount: 5,
    workflowJson: { nodes: [], connections: {} },
    isSystem: true,
    avgRating: 4.2,
  },
  {
    name: "تقرير يومي تلقائي",
    nameEn: "Automated Daily Report",
    description: "إنشاء وإرسال تقرير يومي في وقت محدد",
    descriptionEn: "Generate and send a daily report at a scheduled time",
    category: "reports",
    nodesCount: 6,
    workflowJson: { nodes: [], connections: {} },
    isSystem: true,
    avgRating: 4.7,
  },
  {
    name: "مزامنة Google Sheets",
    nameEn: "Google Sheets Sync",
    description: "مزامنة البيانات مع Google Sheets تلقائياً",
    descriptionEn: "Automatically sync data with Google Sheets",
    category: "reports",
    nodesCount: 3,
    workflowJson: { nodes: [], connections: {} },
    isSystem: true,
    avgRating: 4.0,
  },
  {
    name: "جدولة مهام زمنية",
    nameEn: "Task Scheduling",
    description: "تنفيذ مهام محددة في أوقات مجدولة",
    descriptionEn: "Execute specific tasks at scheduled times",
    category: "scheduling",
    nodesCount: 3,
    workflowJson: { nodes: [], connections: {} },
    isSystem: true,
    avgRating: 4.3,
  },
  {
    name: "إشعارات Slack",
    nameEn: "Slack Notifications",
    description: "إرسال إشعارات فورية إلى قنوات Slack",
    descriptionEn: "Send instant notifications to Slack channels",
    category: "alerts",
    nodesCount: 3,
    workflowJson: { nodes: [], connections: {} },
    isSystem: true,
    avgRating: 4.6,
  },
];

export async function seedDatabase(): Promise<void> {
  try {
    const existingAdmin = await db.select().from(usersTable).where(eq(usersTable.username, "مدير")).limit(1);
    if (!existingAdmin[0]) {
      const hash = await bcrypt.hash("Admin@2024", 12);
      const [admin] = await db.insert(usersTable).values({
        username: "مدير",
        passwordHash: hash,
        role: "admin",
        isActive: true,
        forcePasswordChange: true,
        onboardingComplete: false,
      }).returning();

      if (admin) {
        await db.insert(userPermissionsTable).values(
          ALL_PERMISSIONS.map(key => ({
            userId: admin.id,
            permissionKey: key,
            isEnabled: true,
          }))
        );
        logger.info({ userId: admin.id }, "Admin user created: مدير");
      }
    } else {
      logger.info("Admin user already exists, skipping seed");
    }

    const existingTemplates = await db.select().from(templatesTable).limit(1);
    if (!existingTemplates[0]) {
      await db.insert(templatesTable).values(SYSTEM_TEMPLATES);
      logger.info(`Seeded ${SYSTEM_TEMPLATES.length} templates`);
    }
  } catch (err) {
    logger.error({ err }, "Database seed failed");
  }
}
