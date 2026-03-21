-- ============================================================
-- 004_storage.sql  ─ Supabase Storage バケット設定
-- ============================================================

-- slides バケット（プライベート）を作成
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'slides',
  'slides',
  FALSE,   -- プライベートバケット
  52428800, -- 50MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS ポリシー
-- adminはアップロード/削除可
CREATE POLICY "slides: admin upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'slides'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "slides: admin delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'slides'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 認証済みユーザーは読み取り可（署名付きURLで使用）
CREATE POLICY "slides: authenticated read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'slides'
    AND auth.role() = 'authenticated'
  );

-- ============================================================
-- content-images バケット（パブリック）を作成
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content-images',
  'content-images',
  TRUE,      -- パブリックバケット（公開URL使用）
  52428800,  -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- adminはアップロード/削除可
CREATE POLICY "content-images: admin upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'content-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "content-images: admin delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'content-images'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 全員（未認証含む）は読み取り可（パブリックバケット）
CREATE POLICY "content-images: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'content-images');
