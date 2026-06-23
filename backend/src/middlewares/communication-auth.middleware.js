import { User } from "../models/initModels.js";

export const requireCommunicationUser = async (req, res, next) => {
  const userId = Number(req.header("x-user-id") || req.body.user_id || req.query.user_id);

  if (!userId || Number.isNaN(userId)) {
    return res.status(401).json({ message: "Usuário não informado." });
  }

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(401).json({ message: "Usuário inválido." });
    }

    req.authUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      pix: user.pix,
    };

    return next();
  } catch (error) {
    console.error("Erro ao validar usuário da comunicação:", error);
    return res.status(500).json({ message: "Erro ao validar usuário." });
  }
};
