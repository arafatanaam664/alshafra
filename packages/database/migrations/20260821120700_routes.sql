-- Legacy route resolver + redirects/410. Phase 1 ADR-110.

CREATE TABLE routes (
  id uuid PRIMARY KEY,
  path text UNIQUE NOT NULL,
  handler_kind handler_kind NOT NULL,
  resource_type text,
  resource_id uuid,
  document_id uuid REFERENCES documents(id),
  tool_id uuid REFERENCES tools(id),
  http_status int NOT NULL DEFAULT 200,
  is_legacy boolean NOT NULL DEFAULT false,
  canonical_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','gone','redirect')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT routes_path_format CHECK (path = '/' OR (path ~ '^/' AND path !~ '/$')),
  CONSTRAINT routes_forbidden_prefix CHECK (
    path NOT LIKE '/category/%'
    AND path NOT LIKE '/languages/%'
    AND path NOT LIKE '/news/%'
  )
);

CREATE TABLE redirects (
  id uuid PRIMARY KEY,
  source_pattern text UNIQUE NOT NULL,
  destination text,
  status_code int NOT NULL CHECK (status_code IN (301, 302, 307, 308, 410)),
  reason text,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_redirects_source ON redirects (source_pattern) WHERE is_enabled;

CREATE TRIGGER routes_set_updated_at BEFORE UPDATE ON routes
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER redirects_set_updated_at BEFORE UPDATE ON redirects
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
