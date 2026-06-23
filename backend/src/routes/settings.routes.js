import express from "express";
import { requireCommunicationUser } from "../middlewares/communication-auth.middleware.js";
import {
  connectWhatsApp,
  createTemplate,
  deleteTemplate,
  disconnectWhatsApp,
  getEmailSettings,
  getProfile,
  getWhatsAppQr,
  getWhatsAppSettings,
  getWhatsAppStatus,
  listMessageLogs,
  listReminderRules,
  listTemplates,
  replaceReminderRules,
  saveEmailSettings,
  saveWhatsAppSettings,
  testEmailSettings,
  testWhatsApp,
  updateTemplate,
  upsertProfile,
} from "../controllers/settings.controller.js";

const router = express.Router();

router.use(requireCommunicationUser);

router.get("/profile", getProfile);
router.put("/profile", upsertProfile);

router.get("/email", getEmailSettings);
router.post("/email", saveEmailSettings);
router.put("/email", saveEmailSettings);
router.post("/email/test", testEmailSettings);

router.get("/whatsapp", getWhatsAppSettings);
router.put("/whatsapp", saveWhatsAppSettings);
router.post("/whatsapp/connect", connectWhatsApp);
router.get("/whatsapp/qr", getWhatsAppQr);
router.get("/whatsapp/status", getWhatsAppStatus);
router.post("/whatsapp/disconnect", disconnectWhatsApp);
router.post("/whatsapp/test", testWhatsApp);

router.get("/templates", listTemplates);
router.post("/templates", createTemplate);
router.put("/templates/:id", updateTemplate);
router.delete("/templates/:id", deleteTemplate);

router.get("/rules", listReminderRules);
router.put("/rules", replaceReminderRules);

router.get("/logs", listMessageLogs);

export default router;
