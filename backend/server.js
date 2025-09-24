import express from "express";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcrypt";

const { Pool } = pg;

const pool = new Pool({
  user: "postgres",
  host: "1.0.90.90",
  database: "coepay",
  password: "postgres",
  port: 5432,
});

const app = express();
app.use(cors());
app.use(express.json());

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (result.rows.length === 0) return res.status(401).json({ message: "Usuário não encontrado" });

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: "Senha incorreta" });

    res.json({ id: user.id, name: user.name, email: user.email, pix: user.pix });
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
    const result = await pool.query(
      "SELECT * FROM devedores WHERE id = $1",
      [id]
    );
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

app.listen(5000, () => console.log("Server running on port 5000"));

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
  const { user_id, nome, email, telefone, valor, data_vencimento, taxa_juros, tipo_juros } = req.body;

  try {
    // Verifica se a data de vencimento é válida
    const hoje = new Date();
    const vencimento = new Date(data_vencimento);
    const status = hoje > vencimento ? 'vencida' : 'ativa';

    // Gerar link temporário
    const link = `${req.protocol}://${req.get('host')}/cobranca/TEMP_ID`;

    // Inserir no banco com status correto
    const result = await pool.query(
      `INSERT INTO devedores 
       (user_id, nome, email, telefone, valor, data_vencimento, taxa_juros, tipo_juros, status, link) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [user_id, nome, email, telefone, valor, data_vencimento, taxa_juros, tipo_juros, status, link]
    );

    // Atualizar o link com o ID real da cobrança
    const linkAtualizado = link.replace('TEMP_ID', result.rows[0].id);
    await pool.query(
      "UPDATE devedores SET link = $1 WHERE id = $2",
      [linkAtualizado, result.rows[0].id]
    );

    result.rows[0].link = linkAtualizado;
    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao cadastrar devedor" });
  }
});


// COBRANÇA PÚBLICA
app.get("/cobranca/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM devedores WHERE id = $1",
      [id]
    );
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
    const result = await pool.query("DELETE FROM devedores WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Cobrança não encontrada" });
    }

    res.json({ message: "Cobrança excluída com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir cobrança:", err);
    res.status(500).json({ message: "Erro ao excluir cobrança" });
  }
});

