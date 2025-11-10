import express from "express";
import { uploadComprovantes } from "../controllers/upload.controller.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/comprovante", upload.array("comprovantes", 2), uploadComprovantes);

export default router;
