import express from "express";
import {
  listarDevedores,
  criarDevedor,
  buscarPorHash,
  excluirDevedor,
  marcarComoPaga,
} from "../controllers/devedor.controller.js";

const router = express.Router();

router.get("/", listarDevedores);
router.post("/", criarDevedor);
router.get("/hash/:hash", buscarPorHash);
router.delete("/:id", excluirDevedor);
router.put("/:id/pagar", marcarComoPaga);

export default router;
