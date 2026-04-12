import { Router, type IRouter } from "express";
import healthRouter from "./health";
import { authRouter } from "./auth.routes";
import { workflowsRouter } from "./workflows.routes";
import { chatRouter } from "./chat.routes";
import { dashboardRouter } from "./dashboard.routes";
import { templatesRouter } from "./templates.routes";
import { usersRouter } from "./users.routes";
import { settingsRouter } from "./settings.routes";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/workflows", workflowsRouter);
router.use("/chat", chatRouter);
router.use("/dashboard", dashboardRouter);
router.use("/v1/dashboard", dashboardRouter);
router.use("/templates", templatesRouter);
router.use("/users", usersRouter);
router.use("/settings", settingsRouter);

export default router;
