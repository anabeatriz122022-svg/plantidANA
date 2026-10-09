-- ============================================================
-- PlantID — SQL 5: fotos de progresso das plantas + storage
-- Cole no SQL Editor do Supabase e clique em Run.
-- ============================================================

-- Tabela de fotos de progresso (persiste mesmo após logout)
CREATE TABLE IF NOT EXISTS public.plant_progress_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_plant_id uuid,
  plant_name text NOT NULL,
  note text,
  image_path text NOT NULL,
  image_url text
);

ALTER TABLE public.plant_progress_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS plantid_progress_select_own ON public.plant_progress_photos;
DROP POLICY IF EXISTS plantid_progress_insert_own ON public.plant_progress_photos;
DROP POLICY IF EXISTS plantid_progress_delete_own ON public.plant_progress_photos;

CREATE POLICY plantid_progress_select_own ON public.plant_progress_photos
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY plantid_progress_insert_own ON public.plant_progress_photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY plantid_progress_delete_own ON public.plant_progress_photos
  FOR DELETE USING (auth.uid() = user_id);

-- Bucket de storage para fotos de progresso e avatares
INSERT INTO storage.buckets (id, name, public)
VALUES ('plant-photos', 'plant-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas do storage: usuário autenticado sobe/apaga só na própria pasta
DROP POLICY IF EXISTS plantid_storage_select ON storage.objects;
DROP POLICY IF EXISTS plantid_storage_insert ON storage.objects;
DROP POLICY IF EXISTS plantid_storage_delete ON storage.objects;

CREATE POLICY plantid_storage_select ON storage.objects
  FOR SELECT USING (bucket_id = 'plant-photos');

CREATE POLICY plantid_storage_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'plant-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY plantid_storage_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'plant-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
