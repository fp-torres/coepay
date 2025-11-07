import express from "express";
import multer from "multer";
import { uploadComprovantes } from "../controllers/upload.controller.js";

const router = express.Router();

// Configuração simples do multer
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/comprovante", upload.array("comprovantes", 2), uploadComprovantes);

export default router;
