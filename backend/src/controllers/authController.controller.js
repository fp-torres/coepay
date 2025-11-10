import bcrypt from "bcrypt";
import { User } from "../models/initModels.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(401).json({ message: "Usuário não encontrado" });

    const validPassword = await bcrypt.compare(password, user.password);
//     console.log({
//   email,
//   plain: password,
//   hashed: user.password,
//   valid: await bcrypt.compare(password, user.password)
// });
    if (!validPassword)
      return res.status(401).json({ message: "Senha incorreta" });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      pix: user.pix,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro no servidor" });
  }
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, pix } = req.body;

    await User.create({
      name,
      email,
      password, // <-- senha pura, o model vai hashear
      pix,
    });

    res.json({ message: "Cadastro realizado com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro no servidor" });
  }
};

// 🔹 Atualizar dados do usuário
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, pix } = req.body;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    await user.update({ name, email, pix });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      pix: user.pix,
    });
  } catch (err) {
    console.error("Erro ao atualizar usuário:", err);
    res.status(500).json({ message: "Erro ao atualizar usuário" });
  }
};

export const buscarUsuarioPorId = async (id) => {
  try {
    const user = await User.findByPk(id);
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      pix: user.pix,
    };
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    throw err;
  }
};

// Atualizar senha do usuário
export const updatePassword = async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  try {
    // Buscar o usuário
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Verificar se a senha antiga confere
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Senha atual incorreta" });
    }

    // Atualizar no banco — sem hashear manualmente
    await user.update({ password: newPassword }); // 🔹 o hook fará o hash automático

    res.json({ message: "Senha atualizada com sucesso!" });
  } catch (err) {
    console.error("Erro ao atualizar senha:", err);
    res.status(500).json({ message: "Erro ao atualizar senha" });
  }
};
