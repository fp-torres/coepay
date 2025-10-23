# Como configurar o upload de comprovantes

## 1. Execute a migração do banco de dados

No terminal, execute o seguinte comando para adicionar a coluna `comprovante_url` à tabela `devedores`:

```bash
psql -U postgres -d coepay_status_pgto -f migration_add_comprovante.sql
```

Ou copie e execute manualmente o conteúdo do arquivo `migration_add_comprovante.sql` no seu cliente PostgreSQL.

## 2. Certifique-se de que a pasta uploads existe

A pasta `backend/uploads` precisa existir para armazenar os comprovantes. Ela será criada automaticamente se não existir, mas você pode criá-la manualmente:

```bash
mkdir -p backend/uploads
```

## 3. Instale as dependências

Se ainda não instalou o multer, execute:

```bash
cd backend
npm install
```

## 4. Inicie o servidor

```bash
cd backend
npm run dev
```

## Funcionamento

- Quando um devedor marca uma cobrança como paga, ele pode anexar **até 2 comprovantes** (imagens ou PDF)
- Os comprovantes são validados pela IA (edge function do Supabase)
- A IA verifica automaticamente:
  - Se o documento é realmente um comprovante PIX
  - Se o valor do pagamento corresponde (tolerância de R$ 0,50)
  - Se a chave PIX do destinatário está correta
- Se pelo menos um comprovante for válido, o pagamento é aprovado
- Os arquivos são salvos em `backend/uploads/`
- As URLs dos comprovantes são armazenadas no banco de dados (separadas por vírgula)
- Na página de cobrança pública, quando estiver marcada como paga, todos os comprovantes serão exibidos
- O usuário do sistema pode ver os comprovantes na lista de cobranças pagas

## Tipos de arquivo aceitos

- Imagens: JPEG, JPG, PNG
- Documentos: PDF

## Limites

- **Quantidade**: Até 2 comprovantes por cobrança
- **Tamanho**: 20MB por arquivo
