-- Criar tabela de sugestões de funcionalidades
CREATE TABLE public.sugestoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT,
  status TEXT NOT NULL DEFAULT 'em_analise' CHECK (status IN ('em_analise', 'planejado', 'em_desenvolvimento')),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sugestoes ENABLE ROW LEVEL SECURITY;

-- Políticas: todos podem ver e criar sugestões
CREATE POLICY "Todos podem ver sugestões"
ON public.sugestoes
FOR SELECT
USING (true);

CREATE POLICY "Usuários autenticados podem criar sugestões"
ON public.sugestoes
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Apenas admins podem atualizar status (mover entre colunas)
-- Por enquanto, vamos permitir que o criador possa atualizar
CREATE POLICY "Criador pode atualizar sua sugestão"
ON public.sugestoes
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_sugestoes_updated_at
BEFORE UPDATE ON public.sugestoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_sugestoes_status ON public.sugestoes(status);
CREATE INDEX idx_sugestoes_user_id ON public.sugestoes(user_id);
CREATE INDEX idx_sugestoes_created_at ON public.sugestoes(created_at DESC);