# 📊 Atualização: Suporte a Juros Simples e Período Anual

## 🎯 O que foi implementado

Esta atualização adiciona duas novas funcionalidades ao sistema de cobrança:

1. **Juros Simples**: Além dos juros compostos já existentes, agora é possível calcular juros simples
2. **Período Anual**: Além de diário e mensal, agora é possível aplicar juros em período anual

## 📦 Arquivos Modificados

### Backend
- `backend/src/models/devedor.model.js` - Adicionado campo `metodo_calculo`
- `backend/src/utils/juros.js` - Implementadas funções de cálculo para juros simples e período anual
- `backend/src/controllers/devedor.controller.js` - Atualizado para usar novo sistema de cálculo

### Frontend
- `src/components/dashboard/NovaCobrancaForm.tsx` - Adicionado seletor de método de cálculo e período anual
- `src/pages/Dashboard.tsx` - Atualizado para suportar novos tipos
- `src/components/dashboard/CobrancasList.tsx` - Exibição atualizada
- `src/components/cobranca-publica/CobrancaInfoCard.tsx` - Exibição de período anual
- `src/hooks/useCobrancas.ts` - Interface atualizada
- `src/pages/Relatorios.tsx` - Suporte a novos tipos
- `src/pages/CobrancasPagas.tsx` - Compatibilidade mantida
- Todos os componentes de relatórios (`src/components/dashboard/relatorios/*.tsx`)

## 🗄️ Migração do Banco de Dados

### ⚠️ IMPORTANTE: Execute esta migração antes de usar o sistema

Execute o arquivo SQL de migração no seu banco de dados:

```bash
# PostgreSQL
psql -U seu_usuario -d seu_banco -f backend/migration_add_metodo_calculo.sql

# MySQL
mysql -u seu_usuario -p seu_banco < backend/migration_add_metodo_calculo.sql
```

Ou execute manualmente os comandos SQL no seu gerenciador de banco:

```sql
-- Adiciona coluna metodo_calculo
ALTER TABLE devedores 
ADD COLUMN metodo_calculo VARCHAR(20) DEFAULT 'composto';

-- Atualiza registros existentes
UPDATE devedores 
SET metodo_calculo = 'composto' 
WHERE metodo_calculo IS NULL;

-- Adiciona comentários
COMMENT ON COLUMN devedores.metodo_calculo IS 'Método de cálculo de juros: "simples" ou "composto"';
COMMENT ON COLUMN devedores.tipo_juros IS 'Período de aplicação dos juros: "diario", "mensal" ou "anual"';
```

## 🧮 Como Funcionam os Cálculos

### Juros Compostos (comportamento anterior mantido)
```
M = C × (1 + i)^n
```
- Para período diário: n = dias vencidos
- Para período mensal: n = meses vencidos (arredondado para baixo)
- Para período anual: n = anos vencidos (arredondado para baixo)

### Juros Simples (novo)
```
M = C × (1 + i × n)
```
- Para período diário: n = dias vencidos
- Para período mensal: n = dias vencidos / 30
- Para período anual: n = dias vencidos / 365

## 🎨 Interface do Usuário

### No Formulário de Nova Cobrança

Agora existem dois novos campos:

1. **Método de Cálculo**
   - Juros Compostos (padrão)
   - Juros Simples

2. **Período dos Juros**
   - Ao dia
   - Ao mês
   - Ao ano (novo)

### Exibição nas Cobranças

O sistema agora exibe corretamente:
- "2.5% ao dia"
- "2.5% ao mês"
- "2.5% ao ano"

## 🔄 Retrocompatibilidade

✅ Todas as cobranças existentes continuarão funcionando normalmente:
- Cobranças antigas usarão automaticamente "juros compostos" (comportamento anterior)
- O sistema mantém compatibilidade total com dados existentes
- Nenhuma cobrança será afetada pela atualização

## 🧪 Testando

1. Crie uma cobrança com juros simples mensal
2. Crie uma cobrança com juros compostos anual
3. Verifique que os valores são calculados corretamente na tela de cobrança pública
4. Confirme que os relatórios refletem os novos cálculos

## 📝 Exemplo de Uso

### Cobrança com Juros Simples Mensal (2%)
- Valor original: R$ 100,00
- Vencida há 30 dias (1 mês)
- Cálculo: 100 × (1 + 0.02 × 1) = R$ 102,00

### Cobrança com Juros Compostos Anual (12%)
- Valor original: R$ 1000,00
- Vencida há 365 dias (1 ano)
- Cálculo: 1000 × (1 + 0.12)^1 = R$ 1120,00

## 🐛 Solução de Problemas

Se após a atualização você encontrar erros:

1. Verifique se executou a migração SQL
2. Confirme que o backend foi reiniciado
3. Limpe o cache do navegador (Ctrl + Shift + R)
4. Verifique os logs do backend para erros

## 📞 Suporte

Em caso de dúvidas ou problemas, verifique:
- Os logs do backend em `backend/logs/`
- Console do navegador (F12) para erros do frontend
- Confirme que todas as dependências foram instaladas (`npm install`)
