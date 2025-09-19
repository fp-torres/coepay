import express from "express";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcrypt";

const { Pool } = pg;

const pool = new Pool({
  user: "postgres",
  host: "1.0.90.90",
  database: "flowPay",
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

    res.json({ name: user.name, email: user.email, pix: user.pix });
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

app.listen(5000, () => console.log("Server running on port 5000"));

// DEVEDORES
app.post("/devedores", async (req, res) => {
  const { user_id, nome, cpf_cnpj, email, telefone, valor, data_vencimento } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO devedores 
       (user_id, nome, cpf_cnpj, email, telefone, valor, data_vencimento) 
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [user_id, nome, cpf_cnpj, email, telefone, valor, data_vencimento]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao cadastrar devedor" });
  }
});

