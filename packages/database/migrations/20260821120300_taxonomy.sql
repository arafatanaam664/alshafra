-- Taxonomy. Public hub paths must never use /category/*, /languages/*, /news/*.

CREATE TABLE categories (
  id uuid PRIMARY KEY,
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  path text UNIQUE,
  description text,
  parent_id uuid REFERENCES categories(id),
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','hidden')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT categories_path_format CHECK (
    path IS NULL OR path = '/' OR (path ~ '^/' AND path !~ '/$')
  ),
  CONSTRAINT categories_no_forbidden_prefix CHECK (
    path IS NULL
    OR (
      path NOT LIKE '/category/%'
      AND path NOT LIKE '/languages/%'
      AND path NOT LIKE '/news/%'
    )
  )
);

CREATE TABLE topics (
  id uuid PRIMARY KEY,
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tags (
  id uuid PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE entities (
  id uuid PRIMARY KEY,
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  kind entity_kind NOT NULL DEFAULT 'other',
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE content_types (
  key text PRIMARY KEY,
  name text NOT NULL,
  description text,
  is_editorial boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER categories_set_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER topics_set_updated_at BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER tags_set_updated_at BEFORE UPDATE ON tags
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER entities_set_updated_at BEFORE UPDATE ON entities
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
