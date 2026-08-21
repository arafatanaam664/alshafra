-- Tools, calendar config, countdowns, price history.
-- Calendar *engine* stays in @alshafra/calendar (no DB import there).

CREATE TABLE tool_categories (
  id uuid PRIMARY KEY,
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tools (
  id uuid PRIMARY KEY,
  key text UNIQUE NOT NULL,
  path text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  engine_key text NOT NULL,
  runtime tool_runtime NOT NULL,
  data_mode tool_data_mode NOT NULL,
  category_id uuid REFERENCES tool_categories(id),
  icon text,
  config_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  disclaimer text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','hidden')),
  visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','internal')),
  document_id uuid REFERENCES documents(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tools_path_format CHECK (path ~ '^/' AND (path = '/' OR path !~ '/$'))
);

CREATE TABLE tool_settings (
  id uuid PRIMARY KEY,
  tool_id uuid NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  key text NOT NULL,
  value_json jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tool_id, key)
);

CREATE TABLE calendar_programs (
  id uuid PRIMARY KEY,
  key text UNIQUE NOT NULL,
  title text NOT NULL,
  day_of_month int NOT NULL CHECK (day_of_month BETWEEN 1 AND 28),
  weekend_rule boolean NOT NULL DEFAULT true,
  source_label text,
  source_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE calendar_events (
  id uuid PRIMARY KEY,
  key text UNIQUE NOT NULL,
  title text NOT NULL,
  category text,
  gregorian_date date,
  hijri_rule_json jsonb,
  is_holiday boolean NOT NULL DEFAULT false,
  holiday_days int,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE countdown_definitions (
  id uuid PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  question text NOT NULL,
  category text,
  emoji text,
  summary text,
  keywords text,
  schedule_json jsonb NOT NULL,
  notes_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  related_slugs_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  document_id uuid REFERENCES documents(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE price_snapshots (
  id uuid PRIMARY KEY,
  captured_at timestamptz NOT NULL,
  asset text NOT NULL,
  quote_currency text NOT NULL,
  value numeric NOT NULL,
  source text,
  extras_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_price_snapshots_natural
  ON price_snapshots (captured_at, asset, quote_currency, coalesce(source, ''));

CREATE INDEX idx_tools_path ON tools (path);
CREATE INDEX idx_price_snapshots_captured ON price_snapshots (captured_at DESC);
CREATE INDEX idx_price_snapshots_asset ON price_snapshots (asset, quote_currency, captured_at DESC);

CREATE TRIGGER tools_set_updated_at BEFORE UPDATE ON tools
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER tool_settings_set_updated_at BEFORE UPDATE ON tool_settings
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER calendar_programs_set_updated_at BEFORE UPDATE ON calendar_programs
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER calendar_events_set_updated_at BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER countdown_definitions_set_updated_at BEFORE UPDATE ON countdown_definitions
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
