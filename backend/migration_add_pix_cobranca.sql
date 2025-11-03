-- Adiciona coluna pix_cobranca à tabela devedores
-- Esta coluna armazena um PIX específico para a cobrança (opcional)
-- Se for NULL, usa o PIX padrão do usuário

ALTER TABLE devedores 
ADD COLUMN IF NOT EXISTS pix_cobranca TEXT;

COMMENT ON COLUMN devedores.pix_cobranca IS 'PIX específico para esta cobrança (opcional). Se NULL, usa o PIX padrão do usuário';
