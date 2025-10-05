-- Enable realtime for cobrancas table
ALTER TABLE public.cobrancas REPLICA IDENTITY FULL;

-- Add cobrancas to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.cobrancas;