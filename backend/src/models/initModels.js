// src/models/initModels.js
import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize"; // 👈 precisa disso!

import UserModel from "./user.model.js";
import DevedorModel from "./devedor.model.js";
import NotificacaoLidaModel from "./notificacao.model.js";
import EmailNotificationLogModel from "./emailNotificationLog.model.js";
import EmailTemplateModel from "./emailTemplate.model.js";
import EmailReminderRuleModel from "./emailReminderRule.model.js";
import UserProfileModel from "./userProfile.model.js";
import WhatsAppSessionModel from "./whatsappSession.model.js";
import MessageTemplateModel from "./messageTemplate.model.js";
import MessageLogModel from "./messageLog.model.js";

export const User = UserModel(sequelize, DataTypes);
export const Devedor = DevedorModel(sequelize, DataTypes);
export const NotificacaoLida = NotificacaoLidaModel(sequelize, DataTypes);
export const EmailNotificationLog = EmailNotificationLogModel(sequelize, DataTypes);
export const EmailTemplate = EmailTemplateModel(sequelize, DataTypes);
export const EmailReminderRule = EmailReminderRuleModel(sequelize, DataTypes);
export const UserProfile = UserProfileModel(sequelize, DataTypes);
export const WhatsAppSession = WhatsAppSessionModel(sequelize, DataTypes);
export const MessageTemplate = MessageTemplateModel(sequelize, DataTypes);
export const MessageLog = MessageLogModel(sequelize, DataTypes);

// =====================
// 🔗 RELACIONAMENTOS
// =====================

// 1 usuário → N devedores
User.hasMany(Devedor, { foreignKey: "user_id", onDelete: "CASCADE" });
Devedor.belongsTo(User, { foreignKey: "user_id" });

// Notificação lida relaciona usuários e devedores (muitos-para-muitos simplificado)
NotificacaoLida.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
NotificacaoLida.belongsTo(Devedor, { foreignKey: "cobranca_id", onDelete: "CASCADE" });

// Log de lembretes de cobrança enviados por e-mail
Devedor.hasMany(EmailNotificationLog, { foreignKey: "charge_id", onDelete: "CASCADE" });
EmailNotificationLog.belongsTo(Devedor, { foreignKey: "charge_id", onDelete: "CASCADE" });

User.hasMany(EmailTemplate, { foreignKey: "user_id", onDelete: "CASCADE" });
EmailTemplate.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(EmailReminderRule, { foreignKey: "user_id", onDelete: "CASCADE" });
EmailReminderRule.belongsTo(User, { foreignKey: "user_id" });

User.hasOne(UserProfile, { foreignKey: "user_id", onDelete: "CASCADE" });
UserProfile.belongsTo(User, { foreignKey: "user_id" });

User.hasOne(WhatsAppSession, { foreignKey: "user_id", onDelete: "CASCADE" });
WhatsAppSession.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(MessageTemplate, { foreignKey: "user_id", onDelete: "CASCADE" });
MessageTemplate.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(MessageLog, { foreignKey: "user_id", onDelete: "CASCADE" });
MessageLog.belongsTo(User, { foreignKey: "user_id" });

// =====================
// ⚙️ SINCRONIZAÇÃO
// =====================
export const initModels = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: { drop: false } });
    console.log("✅ Banco conectado e tabelas sincronizadas com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao conectar/sincronizar banco:", error);
    throw error;
  }
};
