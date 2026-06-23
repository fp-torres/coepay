import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { initModels } from "./models/initModels.js";
import { startChargeEmailReminderJob } from "./jobs/email-reminder.job.js";

import devedorRoutes from "./routes/devedor.routes.js";
import authRoutes from "./routes/authRoutes.routes.js";
import notificacaoRoutes from "./routes/notificacao.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// 🔥 Servir arquivos estáticos da pasta "src/uploads"
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Rotas
app.use("/devedores", devedorRoutes);
app.use("/auth", authRoutes);
app.use("/notifications", notificacaoRoutes);
app.use("/api/notificacoes", notificacaoRoutes);
app.use("/upload", uploadRoutes);
app.use("/webhook", webhookRoutes);

// Inicializar DB e servidor
await initModels();
startChargeEmailReminderJob();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
