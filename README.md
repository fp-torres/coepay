# CoéPay

CoéPay é um sistema de gestão de cobranças, controle de devedores, juros, links públicos de pagamento e validação de comprovantes.

## Stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI, TanStack React Query, Lucide React e Sonner.
- Backend: Node.js, Express, Sequelize, PostgreSQL, Multer, Nodemailer e Node Cron.
- Banco e autenticação: PostgreSQL/Supabase, com conexão via `DATABASE_URL` ou variáveis `DB_*`.
- Gerenciadores: Bun na raiz do projeto e npm dentro da pasta `backend`.

## Pré-requisitos

- Node.js 20 ou superior.
- npm.
- Bun para o frontend.
- Uma base PostgreSQL acessível.
- Credenciais SMTP para envio de e-mails transacionais.

## Variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sua-chave-publica"
DATABASE_URL="postgresql://usuario:senha@host:5432/banco"
DATABASE_SSL=true
```

Crie também um arquivo `backend/.env`:

```env
PORT=3000
FRONTEND_PUBLIC_URL="http://localhost:8080"

SMTP_HOST="smtp.seu-provedor.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="usuario-smtp"
SMTP_PASS="senha-smtp"
SMTP_FROM="CoéPay <cobrancas@seudominio.com>"

EMAIL_REMINDERS_ENABLED=false
EMAIL_REMINDER_CRON="0 9 * * *"
EMAIL_REMINDER_TIMEZONE="America/Sao_Paulo"
EMAIL_REMINDERS_RUN_ON_START=false
```

O backend carrega `backend/.env` e também o `.env` da raiz. Isso permite usar `DATABASE_URL` na raiz e manter as configurações sensíveis de e-mail no backend.

## Instalação

Terminal da pasta raiz:

```bash
cd "/home/crase/Área de trabalho/coepay"
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
bun install
```

Terminal da pasta backend:

```bash
cd "/home/crase/Área de trabalho/coepay/backend"
npm install
```

## Como rodar localmente

Use dois terminais abertos ao mesmo tempo.

Terminal da pasta backend:

```bash
cd "/home/crase/Área de trabalho/coepay/backend"
npm run dev
```

Terminal da pasta raiz:

```bash
cd "/home/crase/Área de trabalho/coepay"
source ~/.bashrc
bun run dev
```

URLs locais:

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3000`

Você só precisa rodar Supabase localmente se decidir usar uma stack local completa. Para testar o app apontando para banco/Supabase remoto, os dois terminais acima bastam.

## Scripts úteis

Terminal da pasta raiz:

```bash
bun run dev
bun run build
bun run lint
```

Terminal da pasta backend:

```bash
npm run dev
npm start
```

## Envio de cobranças por e-mail

O backend possui um serviço SMTP com Nodemailer e uma rota manual:

```http
POST /api/notificacoes/enviar-email
Content-Type: application/json

{
  "chargeId": 123
}
```

A rota busca a cobrança real no PostgreSQL, valida se ela possui e-mail cadastrado, ignora cobranças pagas e envia um template HTML com:

- valor atualizado;
- data de vencimento;
- descrição da cobrança;
- chave PIX;
- link público da cobrança.

O botão "Enviar por E-mail" fica na lista de cobranças pendentes e exibe feedback com Sonner.

## Lembretes automáticos por e-mail

Além do envio manual, o backend possui um agendador automático com Node Cron.

Marcos atuais:

- 10 dias antes do vencimento;
- 7 dias antes do vencimento;
- 3 dias antes do vencimento;
- 1 dia antes do vencimento;
- no dia do vencimento;
- diariamente após vencida, até a cobrança ser paga.

Quando a cobrança estiver com `pago=true` ou `status="paga"`, o envio automático é suspenso.

Para ativar:

```env
EMAIL_REMINDERS_ENABLED=true
EMAIL_REMINDER_CRON="0 9 * * *"
EMAIL_REMINDER_TIMEZONE="America/Sao_Paulo"
```

Para processar uma vez ao iniciar o backend, útil em desenvolvimento:

```env
EMAIL_REMINDERS_RUN_ON_START=true
```

O sistema registra envios na tabela `email_notification_logs`, evitando repetir o mesmo lembrete de 10, 7, 3, 1 dia ou do dia do vencimento. Para cobranças vencidas, o envio é controlado por dia.

## Telefone de contato

O formulário de nova cobrança usa o campo "Telefone de Contato" apenas como dado de apoio/resguardo. Não há integração automática com WhatsApp/Meta neste fluxo. A cobrança automática foi concentrada no e-mail para reduzir dependência de aprovações e regras externas da Meta.

## Observações

- O frontend roda na porta `8080`.
- O backend roda na porta `3000`.
- A página pública da cobrança usa a rota `/cobranca/:hash`.
- Configure `FRONTEND_PUBLIC_URL` corretamente em produção para que os links enviados por e-mail apontem para o domínio final do CoéPay.
