// src/routes/notificacao.routes.js
import express from "express";
import {
  marcarNotificacaoComoLida,
  listarNotificacoesNaoLidas,
} from "../controllers/notificacao.controller.js";

const router = express.Router();

// Marcar uma notificação como lida
router.put("/:userId/:cobrancaId/read", marcarNotificacaoComoLida);

// Listar notificações não lidas
router.get("/:userId", listarNotificacoesNaoLidas);

export default router;
