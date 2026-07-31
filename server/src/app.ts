import express, { type Request, type Response } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import router from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { config } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: config.clientUrl,
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
    },
  },
}));

app.use(morgan("dev"));
app.use(express.json());

app.use("/api", router);

if (config.nodeEnv === "production") {
  const clientDir = path.join(__dirname, "../public");
  app.use(express.static(clientDir));
  app.get("*", (_req: Request, res: Response) => {
    res.sendFile(path.join(clientDir, "index.html"));
  });
}

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: "Route not found" },
  });
});

app.use(errorHandler);

export default app;
