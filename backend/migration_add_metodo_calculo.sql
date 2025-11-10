-- Migração: Adiciona campo metodo_calculo para suportar juros simples e compostos
-- Data: 2025-11-10

-- Adiciona coluna metodo_calculo com valor padrão "composto" para manter compatibilidade
ALTER TABLE devedores 
ADD COLUMN metodo_calculo VARCHAR(20) DEFAULT 'composto';

-- Atualiza registros existentes para usar "composto" (comportamento atual)
UPDATE devedores 
SET metodo_calculo = 'composto' 
WHERE metodo_calculo IS NULL;

-- Adiciona comentário explicativo
COMMENT ON COLUMN devedores.metodo_calculo IS 'Método de cálculo de juros: "simples" ou "composto"';
COMMENT ON COLUMN devedores.tipo_juros IS 'Período de aplicação dos juros: "diario", "mensal" ou "anual"';
