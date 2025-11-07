import express from "express";
import cors from "cors";
import { initModels } from "./models/initModels.js";
import devedorRoutes from "./routes/devedor.routes.js";
import authRoutes from "./routes/authRoutes.routes.js";
import notificacaoRoutes from "./routes/notificacao.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";


const app = express();
app.use(cors());
app.use(express.json());

// Rotas
app.use("/devedores", devedorRoutes);
app.use("/auth", authRoutes);
app.use("/notifications", notificacaoRoutes);
app.use("/upload", uploadRoutes);
app.use("/webhook", webhookRoutes);

// Sincronizar DB e iniciar servidor
await initModels();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
