import express from "express";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv"
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: "postgres",
  //host: "1.0.90.90",
  host: "127.0.0.1",
  database: "coepay_status_pgto",
  password: "postgres",
  port: 5432,
});

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'comprovante-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens (JPEG, PNG) e PDFs são permitidos!'));
    }
  }
});

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (result.rows.length === 0)
      return res.status(401).json({ message: "Usuário não encontrado" });

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
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
});

// CADASTRO
app.post("/signup", async (req, res) => {
  const { name, email, password, pix } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (name, email, password, pix) VALUES ($1, $2, $3, $4)",
      [name, email, hashedPassword, pix]
    );
    res.json({ message: "Cadastro realizado com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

// BUSCAR DEVEDOR POR ID (para página pública de cobrança)
app.get("/devedores/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM devedores WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cobrança não encontrada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar cobrança" });
  }
});

// BUSCAR USUÁRIO POR ID (para pegar PIX na página pública)
app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT id, name, email, pix FROM users WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar usuário" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// BUSCAR DEVEDORES POR USUÁRIO
app.get("/devedores", async (req, res) => {
  const { user_id } = req.query;
  try {
    const result = await pool.query(
      "SELECT * FROM devedores WHERE user_id = $1 ORDER BY created_at DESC",
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar devedores" });
  }
});

// DEVEDORES
app.post("/devedores", async (req, res) => {
  const { user_id, nome, email, telefone, valor, data_vencimento, taxa_juros, tipo_juros, descricao, whatsapp_devedor } = req.body;

  try {
    const hoje = new Date();
    const vencimento = new Date(data_vencimento);
    const status = hoje > vencimento ? "vencida" : "ativa";

    const hash = uuidv4();
    const link = `${req.protocol}://${req.get("host")}/cobranca/${hash}`;

    const result = await pool.query(
      `INSERT INTO devedores 
      (user_id, nome, email, telefone, valor, data_vencimento, taxa_juros, tipo_juros, descricao, whatsapp_devedor, status, hash, link) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        user_id, 
        nome, 
        email, 
        telefone, 
        valor, 
        data_vencimento, 
        taxa_juros, 
        tipo_juros, 
        descricao || null,      // opcional
        whatsapp_devedor || null, // opcional
        status, 
        hash, 
        link
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao cadastrar devedor" });
  }
});

    // Rota pública usando hash
    app.get("/cobranca/:hash", async (req, res) => {
      const { hash } = req.params;
      try {
        const result = await pool.query("SELECT * FROM devedores WHERE hash = $1", [hash]);
        if (result.rows.length === 0) {
          return res.status(404).json({ message: "Cobrança não encontrada" });
        }
        res.json(result.rows[0]);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao buscar cobrança" });
      }
    });

// COBRANÇA PÚBLICA
app.get("/cobranca/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM devedores WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cobrança não encontrada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar cobrança" });
  }
});

// EXCLUIR COBRANÇA (DEVEDOR)
app.delete("/devedores/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM devedores WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Cobrança não encontrada" });
    }

    res.json({ message: "Cobrança excluída com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir cobrança:", err);
    res.status(500).json({ message: "Erro ao excluir cobrança" });
  }
});

// Upload de comprovante
app.post("/upload-comprovante", upload.single('comprovante'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Nenhum arquivo enviado" });
    }

    const comprovanteUrl = `/uploads/${req.file.filename}`;
    res.json({ url: comprovanteUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao fazer upload do comprovante" });
  }
});

// Atualizar status de pagamento
app.put("/devedores/:id/pagar", async (req, res) => {
  const { id } = req.params;
  const { comprovante_url } = req.body;

  try {
    const result = await pool.query(
      `UPDATE devedores 
       SET pago = true, pago_em = NOW(), status = 'paga', comprovante_url = $2
       WHERE id = $1 RETURNING *`,
      [id, comprovante_url || null]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cobrança não encontrada" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao atualizar cobrança" });
  }
});

// Rota para receber webhook de PSP
app.post("/webhook/psp", async (req, res) => {
  try {
    // Exemplo de payload que o PSP pode enviar
    // {
    //   cobrancaId: "123",
    //   pagoEm: "2025-09-30T15:00:00Z",
    //   valorPago: 150.50
    // }
    const { cobrancaId, pagoEm } = req.body;

    if (!cobrancaId) {
      return res.status(400).json({ message: "ID da cobrança é obrigatório" });
    }

    // Atualiza a cobrança no banco
    const result = await pool.query(
      `UPDATE devedores 
       SET pago = true, pago_em = $1, status = 'paga'
       WHERE id = $2
       RETURNING *`,
      [pagoEm || new Date(), cobrancaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cobrança não encontrada" });
    }

    console.log(`Cobrança ${cobrancaId} marcada como paga via webhook`);
    res.status(200).json({ message: "Cobrança atualizada com sucesso", cobranca: result.rows[0] });
  } catch (err) {
    console.error("Erro ao processar webhook do PSP:", err);
    res.status(500).json({ message: "Erro ao atualizar cobrança" });
  }
});

// Exemplo: marcar notificação de uma cobrança como lida para um usuário
app.put("/notifications/:userId/:cobrancaId/read", async (req, res) => {
  const { userId, cobrancaId } = req.params;

  try {
    await pool.query(
      `INSERT INTO notificacoes_lidas (user_id, cobranca_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, cobranca_id) DO NOTHING`,
      [userId, cobrancaId]
    );

    res.json({ message: "Notificação marcada como lida" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao marcar notificação como lida" });
  }
});

app.get("/notifications/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT d.* 
       FROM devedores d
       LEFT JOIN notificacoes_lidas l
       ON d.id = l.cobranca_id AND l.user_id = $1
       WHERE d.user_id = $1 AND d.status = 'paga' AND l.cobranca_id IS NULL
       ORDER BY d.pago_em DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar notificações" });
  }
});




