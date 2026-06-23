import express from "express";
import { requireCommunicationUser } from "../middlewares/communication-auth.middleware.js";
import {
  sendEmailMessage,
  sendWhatsAppDirectMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.use(requireCommunicationUser);

router.post("/send-email", sendEmailMessage);
router.post("/send-whatsapp", sendWhatsAppDirectMessage);

export default router;
