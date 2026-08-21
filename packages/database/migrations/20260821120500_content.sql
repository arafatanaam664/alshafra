-- Editorial supertype: documents (not one table per type). Phase 1 §05 / ADR-404.

CREATE TABLE authors (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  bio text,
  avatar_media_id uuid REFERENCES media(id),
  is_organization boolean NOT NULL DEFAULT false,
  expertise text,
  social_links_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE documents (
  id uuid PRIMARY KEY,
  type document_type NOT NULL,
  status document_status NOT NULL DEFAULT 'draft',
  locale text NOT NULL DEFAULT 'ar' CHECK (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  title text NOT NULL,
  slug text NOT NULL,
  path text NOT NULL,
  legacy_path text,
  legacy_source_file text,
  imported_at timestamptz,
  excerpt text,
  body_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  type_data_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  author_id uuid REFERENCES authors(id),
  category_id uuid REFERENCES categories(id),
  featured_media_id uuid REFERENCES media(id),
  published_revision_id uuid,
  published_at timestamptz,
  scheduled_at timestamptz,
  reviewed_at timestamptz,
  unpublished_at timestamptz,
  indexable boolean NOT NULL DEFAULT false,
  indexable_override boolean,
  ads_enabled boolean NOT NULL DEFAULT true,
  feature_flag_key text,
  unique_text_word_count int NOT NULL DEFAULT 0 CHECK (unique_text_word_count >= 0),
  title_normalized text,
  body_normalized text,
  search_tsv tsvector GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(excerpt, ''))
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT documents_path_format CHECK (path = '/' OR (path ~ '^/' AND path !~ '/$')),
  CONSTRAINT documents_forbidden_prefix CHECK (
    path NOT LIKE '/category/%'
    AND path NOT LIKE '/languages/%'
    AND path NOT LIKE '/news/%'
  )
);

CREATE UNIQUE INDEX uq_documents_path ON documents (path) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_status_published ON documents (status, published_at DESC)
  WHERE deleted_at IS NULL AND status = 'published';
CREATE INDEX idx_documents_type_status ON documents (type, status);
CREATE INDEX idx_documents_category ON documents (category_id);
CREATE INDEX idx_documents_author ON documents (author_id);
CREATE INDEX idx_documents_indexable ON documents (indexable)
  WHERE indexable AND deleted_at IS NULL;
CREATE INDEX idx_documents_slug ON documents (slug);
CREATE INDEX idx_documents_published_at ON documents (published_at DESC);
CREATE INDEX idx_documents_updated_at ON documents (updated_at DESC);
CREATE INDEX idx_documents_fts ON documents USING gin (search_tsv);

CREATE TABLE document_revisions (
  id uuid PRIMARY KEY,
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version int NOT NULL CHECK (version >= 1),
  author_user_id uuid REFERENCES users(id),
  title text NOT NULL,
  excerpt text,
  body_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  type_data_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  seo_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  restored_from_version int,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (document_id, version)
);

ALTER TABLE documents
  ADD CONSTRAINT documents_published_revision_fk
  FOREIGN KEY (published_revision_id)
  REFERENCES document_revisions(id)
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE document_seo (
  document_id uuid PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
  seo_title text,
  meta_description text,
  canonical_url text NOT NULL,
  robots robots_directive NOT NULL DEFAULT 'index_follow',
  og_title text,
  og_description text,
  og_image_media_id uuid REFERENCES media(id),
  twitter_title text,
  twitter_description text,
  schema_type text,
  schema_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  h1_override text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE document_tags (
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, tag_id)
);

CREATE TABLE document_topics (
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  weight int NOT NULL DEFAULT 1,
  PRIMARY KEY (document_id, topic_id)
);

CREATE TABLE document_entities (
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  entity_id uuid NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, entity_id)
);

CREATE TABLE document_relations (
  from_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  to_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  kind relation_kind NOT NULL DEFAULT 'related',
  is_manual boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  PRIMARY KEY (from_id, to_id, kind),
  CONSTRAINT document_relations_no_self CHECK (from_id <> to_id)
);

CREATE TABLE faq_items (
  id uuid PRIMARY KEY,
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

CREATE INDEX idx_faq_document ON faq_items (document_id);

CREATE TABLE sources (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  url text,
  source_type text NOT NULL DEFAULT 'web',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_sources_name_url ON sources (name, coalesce(url, ''));

CREATE TABLE document_sources (
  id uuid PRIMARY KEY,
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  published_at date,
  accessed_at date,
  notes text,
  sort_order int NOT NULL DEFAULT 0,
  UNIQUE (document_id, source_id)
);

CREATE TRIGGER authors_set_updated_at BEFORE UPDATE ON authors
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER documents_set_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER document_seo_set_updated_at BEFORE UPDATE ON document_seo
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER sources_set_updated_at BEFORE UPDATE ON sources
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
