import express from "express";
import { login, signup, updateUser, buscarUsuarioPorId, updatePassword } from "../controllers/authController.controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.put("/:id", updateUser); // nova rota para atualizar dados
router.put("/:id/updatePassword", updatePassword); // nova rota para atualizar senha
router.get("/getUser/:id", async (req, res) => {
  try {
    const usuario = await buscarUsuarioPorId(req.params.id);
    // console.log(usuario);
    if (!usuario) return res.status(404).json({ message: "Usuário não encontrado" });

    res.json(usuario);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar usuário" });
  }
});


export default router;
