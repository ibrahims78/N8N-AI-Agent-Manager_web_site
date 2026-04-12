import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, error: { code: "RATE_LIMITED", message: "Too many login attempts, please try again later." } },
  standardHeaders: true,
  legacyHeaders: false,
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, error: { code: "RATE_LIMITED", message: "Too many chat requests, please slow down." } },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "GET",
});

const settingsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, error: { code: "RATE_LIMITED", message: "Too many settings requests." } },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login", loginLimiter);
app.use("/api/chat", chatLimiter);
app.use("/api/settings", settingsLimiter);

app.use("/api", router);

export default app;
