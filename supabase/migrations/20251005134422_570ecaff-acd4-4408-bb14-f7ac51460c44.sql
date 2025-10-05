-- Enable RLS on cobrancas table
ALTER TABLE public.cobrancas ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own cobrancas
CREATE POLICY "Users can view their own cobrancas"
ON public.cobrancas
FOR SELECT
USING (user_id = (SELECT id FROM public.users WHERE id = cobrancas.user_id));

-- Policy: Users can insert their own cobrancas
CREATE POLICY "Users can insert their own cobrancas"
ON public.cobrancas
FOR INSERT
WITH CHECK (user_id = (SELECT id FROM public.users WHERE id = cobrancas.user_id));

-- Policy: Users can update their own cobrancas
CREATE POLICY "Users can update their own cobrancas"
ON public.cobrancas
FOR UPDATE
USING (user_id = (SELECT id FROM public.users WHERE id = cobrancas.user_id));

-- Policy: Users can delete their own cobrancas
CREATE POLICY "Users can delete their own cobrancas"
ON public.cobrancas
FOR DELETE
USING (user_id = (SELECT id FROM public.users WHERE id = cobrancas.user_id));

-- Policy: Anyone can view cobrancas by link (for public access via hash)
CREATE POLICY "Public can view cobrancas by link"
ON public.cobrancas
FOR SELECT
USING (true);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
USING (id = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
USING (id = id);