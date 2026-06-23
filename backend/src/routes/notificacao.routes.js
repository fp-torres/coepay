// src/routes/notificacao.routes.js
import express from "express";
import {
  sendChargeEmail,
  marcarNotificacaoComoLida,
  listarNotificacoesNaoLidas,
  listEmailTemplates,
  upsertEmailTemplate,
  listReminderRules,
  replaceReminderRules,
} from "../controllers/notificacao.controller.js";

const router = express.Router();

// Enviar cobrança por e-mail
router.post("/enviar-email", sendChargeEmail);
router.post("/send-email", sendChargeEmail);

router.get("/templates/:userId", listEmailTemplates);
router.put("/templates/:userId/:templateType", upsertEmailTemplate);
router.get("/rules/:userId", listReminderRules);
router.put("/rules/:userId", replaceReminderRules);

// Marcar uma notificação como lida
router.put("/:userId/:cobrancaId/read", marcarNotificacaoComoLida);

// Listar notificações não lidas
router.get("/:userId", listarNotificacoesNaoLidas);

export default router;
