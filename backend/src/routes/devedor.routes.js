import express from "express";
import {
  listarDevedores,
  criarDevedor,
  buscarPorHash,
  excluirDevedor,
  marcarComoPaga,
  listarTodosDevedores,
  buscarDevedorPorId
} from "../controllers/devedor.controller.js";

const router = express.Router();

router.get("/", listarDevedores);
router.get("/:id", buscarDevedorPorId); // busca 1 por ID
router.post("/", criarDevedor);
router.get("/all", listarTodosDevedores);
router.get("/hash/:hash", buscarPorHash);
router.delete("/:id", excluirDevedor);
router.put("/:id/pagar", marcarComoPaga);

export default router;
