-- Media metadata only. Bytes live on R2 (not uploaded in Phase 4).

CREATE TABLE media (
  id uuid PRIMARY KEY,
  bucket text NOT NULL DEFAULT 'media',
  object_key text UNIQUE NOT NULL,
  mime text NOT NULL,
  byte_size bigint NOT NULL CHECK (byte_size >= 0),
  width int,
  height int,
  alt text,
  caption text,
  credit text,
  sha256 text,
  uploaded_by uuid REFERENCES users(id),
  visibility media_visibility NOT NULL DEFAULT 'public',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE media_variants (
  id uuid PRIMARY KEY,
  media_id uuid NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  variant media_variant_name NOT NULL,
  object_key text UNIQUE NOT NULL,
  mime text NOT NULL,
  width int,
  height int,
  byte_size bigint NOT NULL CHECK (byte_size >= 0),
  UNIQUE (media_id, variant)
);

CREATE INDEX idx_media_sha ON media (sha256);

ALTER TABLE profiles
  ADD CONSTRAINT profiles_avatar_media_fk
  FOREIGN KEY (avatar_media_id) REFERENCES media(id);

CREATE TRIGGER media_set_updated_at BEFORE UPDATE ON media
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
