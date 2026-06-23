# CoePay com PostgreSQL local

Este projeto consegue rodar sem Supabase para as telas principais de login, cadastro,
dashboard, cobrancas, comprovantes, relatorios e configuracoes.

## 1. Iniciar PostgreSQL

No Linux com PostgreSQL ja instalado:

```bash
sudo pg_ctlcluster 16 main start
pg_isready -h localhost -p 5432
```

Se o comando `pg_ctlcluster` nao existir, instale o PostgreSQL:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

## 2. Criar usuario e banco locais

```bash
sudo -u postgres psql
```

Dentro do prompt do PostgreSQL:

```sql
CREATE USER coepay_user WITH PASSWORD 'coepay_dev';
CREATE DATABASE coepay OWNER coepay_user;
GRANT ALL PRIVILEGES ON DATABASE coepay TO coepay_user;
\q
```

Teste a conexao:

```bash
psql "postgresql://coepay_user:coepay_dev@localhost:5432/coepay" -c "select current_database(), current_user;"
```

## 3. Configurar variaveis

Copie os exemplos:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Enquanto voce nao tiver Supabase/Stripe, mantenha:

```env
VITE_SUPABASE_URL=""
VITE_SUPABASE_PUBLISHABLE_KEY=""
```

## 4. Rodar backend

```bash
cd backend
npm install
npm run dev
```

Ao iniciar, o Sequelize cria/ajusta automaticamente as tabelas no banco `coepay`.

## 5. Rodar frontend

Em outro terminal, na raiz:

```bash
bun install
bun run dev
```

Abra `http://localhost:8080/login`, cadastre seu primeiro usuario e entre.

## Sobre Google Login

O codigo atual nao possui Google OAuth implementado no backend. O login ativo hoje e
por e-mail e senha, usando a tabela `users` no PostgreSQL local.

Para adicionar Google depois, crie credenciais OAuth no Google Cloud Console e
adicione estas variaveis:

```env
GOOGLE_CLIENT_ID="seu-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="seu-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"
```

Depois disso e preciso implementar as rotas OAuth no backend e o botao "Entrar com
Google" no frontend.
