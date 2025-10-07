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

- Quando um devedor marca uma cobrança como paga, ele precisa anexar um comprovante (imagem ou PDF)
- O comprovante é validado pela IA (edge function)
- Se válido, o arquivo é salvo em `backend/uploads/`
- A URL do comprovante é armazenada no banco de dados
- Na página de cobrança pública, quando estiver marcada como paga, o comprovante será exibido
- O usuário do sistema pode ver o comprovante clicando em "Ver Comprovante" na lista de cobranças pagas

## Tipos de arquivo aceitos

- Imagens: JPEG, JPG, PNG
- Documentos: PDF

## Tamanho máximo

- 20MB por arquivo
