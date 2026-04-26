import app from "./app";
import { logger } from "./lib/logger";
import { seedDatabase } from "./seed";
import {
  ensureSectionsIndexBootstrap,
  setupSyncScheduler,
  hydrateGuidesFromLocalFiles,
} from "./services/docsAdvanced.service";
import { hydrateDocsFromLocalFiles } from "./services/nodeDocs.service";

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
  // Re-import any markdown files that exist on disk but are missing from the
  // DB (typical after a `drizzle push` reset). This restores translated
  // content without re-calling the AI provider. Reindex sections after.
  Promise.all([
    hydrateDocsFromLocalFiles("en"),
    hydrateDocsFromLocalFiles("ar"),
    hydrateGuidesFromLocalFiles("en"),
    hydrateGuidesFromLocalFiles("ar"),
  ])
    .then(([en, ar, gEn, gAr]) => {
      if (en.imported || ar.imported) {
        logger.info({ en, ar }, "Hydrated docs from local files");
      }
      if (gEn.imported || gAr.imported) {
        logger.info({ en: gEn, ar: gAr }, "Hydrated guides from local files");
      }
    })
    .catch((err) => logger.warn({ err }, "hydrate*FromLocalFiles failed (non-fatal)"))
    .finally(() => {
      ensureSectionsIndexBootstrap().catch((err) =>
        logger.warn({ err }, "ensureSectionsIndexBootstrap failed (non-fatal)")
      );
    });
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
