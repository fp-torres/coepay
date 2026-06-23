import express from "express";
import { requireCommunicationUser } from "../middlewares/communication-auth.middleware.js";
import { sendOrderEmail, sendOrderWhatsApp } from "../controllers/message.controller.js";

const router = express.Router();

router.use(requireCommunicationUser);

router.post("/:id/send-email", sendOrderEmail);
router.post("/:id/send-whatsapp", sendOrderWhatsApp);

export default router;
