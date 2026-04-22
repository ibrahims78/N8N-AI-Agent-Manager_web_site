import { Router, type IRouter } from "express";
import healthRouter from "./health";
import { authRouter } from "./auth.routes";
import { workflowsRouter } from "./workflows.routes";
import { chatRouter } from "./chat.routes";
import { dashboardRouter } from "./dashboard.routes";
import { templatesRouter } from "./templates.routes";
import { usersRouter } from "./users.routes";
import { settingsRouter } from "./settings.routes";
import { catalogRouter } from "./catalog.routes";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/workflows", workflowsRouter);
router.use("/chat", chatRouter);
router.use("/dashboard", dashboardRouter);
router.use("/templates", templatesRouter);
router.use("/users", usersRouter);
router.use("/settings", settingsRouter);
router.use("/catalog", catalogRouter);

const v1Router: IRouter = Router();
v1Router.use("/auth", authRouter);
v1Router.use("/workflows", workflowsRouter);
v1Router.use("/chat", chatRouter);
v1Router.use("/dashboard", dashboardRouter);
v1Router.use("/templates", templatesRouter);
v1Router.use("/users", usersRouter);
v1Router.use("/settings", settingsRouter);
v1Router.use("/catalog", catalogRouter);

router.use("/v1", v1Router);

export default router;
