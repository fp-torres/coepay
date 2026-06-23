// src/routes/notificacao.routes.js
import express from "express";
import {
  sendChargeEmail,
  marcarNotificacaoComoLida,
  listarNotificacoesNaoLidas,
} from "../controllers/notificacao.controller.js";

const router = express.Router();

// Enviar cobrança por e-mail
router.post("/enviar-email", sendChargeEmail);
router.post("/send-email", sendChargeEmail);

// Marcar uma notificação como lida
router.put("/:userId/:cobrancaId/read", marcarNotificacaoComoLida);

// Listar notificações não lidas
router.get("/:userId", listarNotificacoesNaoLidas);

export default router;
