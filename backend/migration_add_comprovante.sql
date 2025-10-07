-- Adiciona coluna para armazenar a URL do comprovante de pagamento
ALTER TABLE devedores 
ADD COLUMN IF NOT EXISTS comprovante_url TEXT;

-- Adiciona comentário para documentação
COMMENT ON COLUMN devedores.comprovante_url IS 'URL do comprovante de pagamento anexado pelo devedor';
