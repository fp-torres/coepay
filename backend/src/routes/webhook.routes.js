import express from "express";
import { webhookPSP } from "../controllers/webhook.controller.js";

const router = express.Router();

router.post("/psp", webhookPSP);

export default router;
