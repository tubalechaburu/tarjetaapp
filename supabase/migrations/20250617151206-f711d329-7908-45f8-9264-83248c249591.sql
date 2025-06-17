
-- Eliminar políticas existentes restrictivas si existen
DROP POLICY IF EXISTS "Users can only see own cards" ON public.cards;
DROP POLICY IF EXISTS "Users can only modify own cards" ON public.cards;
DROP POLICY IF EXISTS "Only owners can view cards" ON public.cards;
DROP POLICY IF EXISTS "Only owners can update cards" ON public.cards;
DROP POLICY IF EXISTS "Only owners can delete cards" ON public.cards;

-- Habilitar RLS en la tabla cards
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Política para LECTURA: Cualquiera puede ver cualquier tarjeta (para compartir)
CREATE POLICY "Anyone can view cards for sharing" 
  ON public.cards 
  FOR SELECT 
  USING (true);

-- Política para INSERCIÓN: Solo usuarios autenticados pueden crear tarjetas
CREATE POLICY "Authenticated users can create cards" 
  ON public.cards 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Política para ACTUALIZACIÓN: Solo el propietario puede actualizar sus tarjetas
CREATE POLICY "Users can update own cards" 
  ON public.cards 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Política para ELIMINACIÓN: Solo el propietario puede eliminar sus tarjetas
CREATE POLICY "Users can delete own cards" 
  ON public.cards 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);
