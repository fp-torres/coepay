-- Criar tabela de usuários
CREATE TABLE public.users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  pix TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de cobranças/devedores
CREATE TABLE public.cobrancas (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  nome_devedor TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  valor_atual DECIMAL(10,2),
  data_inicio DATE NOT NULL,
  taxa_juros DECIMAL(5,2),
  tipo_juros TEXT CHECK (tipo_juros IN ('mensal', 'diario')),
  status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'atrasada')),
  link_cobranca TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar índice para melhor performance
CREATE INDEX idx_cobrancas_user_id ON public.cobrancas(user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_cobrancas_updated_at
  BEFORE UPDATE ON public.cobrancas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();