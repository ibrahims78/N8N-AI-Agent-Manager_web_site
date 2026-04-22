import app from "./app";
import { logger } from "./lib/logger";
import { seedDatabase } from "./seed";
import {
  ensureSectionsIndexBootstrap,
  setupSyncScheduler,
} from "./services/docsAdvanced.service";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function start() {
  await seedDatabase();

  // ميزات نظام التوثيقات الاحترافي:
  // - تأكَّد أن فهرس الأقسام مبني (مرة واحدة عند أول إقلاع بعد التحديث)
  // - شغِّل جدولة المزامنة الدورية (تتفعَّل فقط إن طلب المستخدم)
  ensureSectionsIndexBootstrap().catch((err) =>
    logger.warn({ err }, "ensureSectionsIndexBootstrap failed (non-fatal)")
  );
  setupSyncScheduler();

  app.listen(port, (err?: Error) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
    logger.info({ port }, "N8N AI Agent Manager API listening");
  });
}

start().catch(err => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});
