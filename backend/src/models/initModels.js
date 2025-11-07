// src/models/initModels.js
import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize"; // 👈 precisa disso!

import UserModel from "./user.model.js";
import DevedorModel from "./devedor.model.js";
import NotificacaoLidaModel from "./notificacao.model.js";

export const User = UserModel(sequelize, DataTypes);
export const Devedor = DevedorModel(sequelize, DataTypes);
export const NotificacaoLida = NotificacaoLidaModel(sequelize, DataTypes);

// =====================
// 🔗 RELACIONAMENTOS
// =====================

// 1 usuário → N devedores
User.hasMany(Devedor, { foreignKey: "user_id", onDelete: "CASCADE" });
Devedor.belongsTo(User, { foreignKey: "user_id" });

// Notificação lida relaciona usuários e devedores (muitos-para-muitos simplificado)
NotificacaoLida.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
NotificacaoLida.belongsTo(Devedor, { foreignKey: "cobranca_id", onDelete: "CASCADE" });

// =====================
// ⚙️ SINCRONIZAÇÃO
// =====================
export const initModels = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ Tabelas sincronizadas com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao sincronizar tabelas:", error);
  }
};
