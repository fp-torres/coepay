import express from "express";
import {
  listarDevedores,
  criarDevedor,
  buscarPorHash,
  excluirDevedor,
  marcarComoPaga,
  listarTodosDevedores,
  buscarDevedorPorId,
  atualizarRecorrencia
} from "../controllers/devedor.controller.js";

const router = express.Router();

router.get("/", listarDevedores);
router.get("/all", listarTodosDevedores);
router.get("/hash/:hash", buscarPorHash);
router.patch("/recorrencia/:grupoId", atualizarRecorrencia);
router.get("/:id", buscarDevedorPorId); // busca 1 por ID
router.post("/", criarDevedor);
router.delete("/:id", excluirDevedor);
router.put("/:id/pagar", marcarComoPaga);

export default router;
