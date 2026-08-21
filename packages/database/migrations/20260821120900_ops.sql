-- Moderation, notifications, social/jobs (schema only), search, analytics,
-- flags, settings, ads, audit. No workers/UI in Phase 4.

CREATE TABLE reports (
  id uuid PRIMARY KEY,
  reporter_id uuid REFERENCES users(id),
  target_type moderation_target NOT NULL,
  target_id uuid NOT NULL,
  reason text NOT NULL,
  body text,
  status report_status NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE moderation_actions (
  id uuid PRIMARY KEY,
  actor_id uuid REFERENCES users(id),
  target_type moderation_target NOT NULL,
  target_id uuid NOT NULL,
  action text NOT NULL,
  reason text,
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY,
  recipient_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  actor_id uuid REFERENCES users(id),
  entity_type text,
  entity_id uuid,
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_recipient ON notifications (recipient_id, read_at);

CREATE TABLE social_accounts (
  id uuid PRIMARY KEY,
  provider social_provider NOT NULL,
  external_account_id text,
  account_name text,
  token_ref text,
  refresh_token_ref text,
  status social_account_status NOT NULL DEFAULT 'connected',
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  connected_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE social_templates (
  id uuid PRIMARY KEY,
  provider social_provider NOT NULL,
  name text NOT NULL,
  body_template text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE social_posts (
  id uuid PRIMARY KEY,
  document_id uuid REFERENCES documents(id),
  provider social_provider NOT NULL,
  account_id uuid REFERENCES social_accounts(id),
  template_id uuid REFERENCES social_templates(id),
  rendered_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE social_publish_jobs (
  id uuid PRIMARY KEY,
  social_post_id uuid REFERENCES social_posts(id),
  status publish_job_status NOT NULL DEFAULT 'queued',
  attempts int NOT NULL DEFAULT 0,
  max_attempts int NOT NULL DEFAULT 5,
  idempotency_key text NOT NULL UNIQUE,
  external_post_id text,
  permalink text,
  last_error text,
  run_at timestamptz,
  completed_at timestamptz
);

CREATE TABLE automation_rules (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  trigger text NOT NULL,
  conditions_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  actions_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_enabled boolean NOT NULL DEFAULT false,
  cooldown_seconds int NOT NULL DEFAULT 0,
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE automation_runs (
  id uuid PRIMARY KEY,
  rule_id uuid REFERENCES automation_rules(id),
  event_id text,
  status text NOT NULL,
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE jobs (
  id uuid PRIMARY KEY,
  type text NOT NULL,
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  status job_status NOT NULL DEFAULT 'queued',
  priority int NOT NULL DEFAULT 0,
  attempts int NOT NULL DEFAULT 0,
  max_attempts int NOT NULL DEFAULT 5,
  run_at timestamptz NOT NULL DEFAULT now(),
  locked_at timestamptz,
  locked_by text,
  idempotency_key text,
  last_error text,
  completed_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_jobs_idempotency ON jobs (idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX idx_jobs_status_run ON jobs (status, run_at) WHERE status IN ('queued','running');

CREATE TABLE job_attempts (
  id uuid PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  attempt_n int NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  error text,
  log_json jsonb
);

CREATE TABLE search_synonyms (
  id uuid PRIMARY KEY,
  term text NOT NULL,
  synonym text NOT NULL,
  locale text NOT NULL DEFAULT 'ar',
  UNIQUE (term, synonym, locale)
);

CREATE TABLE search_queries (
  id uuid PRIMARY KEY,
  query_normalized text NOT NULL,
  query_length int NOT NULL CHECK (query_length >= 0),
  result_count int,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_search_queries_norm ON search_queries (query_normalized, created_at DESC);

CREATE TABLE popular_searches (
  query_normalized text NOT NULL,
  locale text NOT NULL DEFAULT 'ar',
  hit_count int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (query_normalized, locale)
);

CREATE TABLE analytics_events (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  path text,
  document_id uuid,
  tool_id uuid,
  props_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  session_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_occurred ON analytics_events (occurred_at DESC);
CREATE INDEX idx_analytics_name_occurred ON analytics_events (name, occurred_at DESC);

CREATE TABLE page_view_daily (
  day date NOT NULL,
  path text NOT NULL,
  views int NOT NULL DEFAULT 0 CHECK (views >= 0),
  unique_sessions int NOT NULL DEFAULT 0 CHECK (unique_sessions >= 0),
  PRIMARY KEY (day, path)
);

CREATE TABLE content_metrics (
  document_id uuid PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
  views int NOT NULL DEFAULT 0 CHECK (views >= 0),
  unique_views int NOT NULL DEFAULT 0 CHECK (unique_views >= 0),
  shares int NOT NULL DEFAULT 0 CHECK (shares >= 0),
  comments int NOT NULL DEFAULT 0 CHECK (comments >= 0),
  bookmarks int NOT NULL DEFAULT 0 CHECK (bookmarks >= 0),
  search_impressions int NOT NULL DEFAULT 0 CHECK (search_impressions >= 0),
  search_clicks int NOT NULL DEFAULT 0 CHECK (search_clicks >= 0),
  social_clicks int NOT NULL DEFAULT 0 CHECK (social_clicks >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tool_metrics (
  tool_id uuid PRIMARY KEY REFERENCES tools(id) ON DELETE CASCADE,
  uses int NOT NULL DEFAULT 0 CHECK (uses >= 0),
  unique_users int NOT NULL DEFAULT 0 CHECK (unique_users >= 0),
  completions int NOT NULL DEFAULT 0 CHECK (completions >= 0),
  shares int NOT NULL DEFAULT 0 CHECK (shares >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE feature_flags (
  id uuid PRIMARY KEY,
  key text UNIQUE NOT NULL,
  is_enabled boolean NOT NULL DEFAULT false,
  description text,
  environment text NOT NULL DEFAULT 'all',
  rollout_percent int NOT NULL DEFAULT 100 CHECK (rollout_percent BETWEEN 0 AND 100),
  metadata_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE site_settings (
  key text PRIMARY KEY,
  value_json jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES users(id)
);

CREATE TABLE ad_slots (
  id uuid PRIMARY KEY,
  key text UNIQUE NOT NULL,
  adsense_slot_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ad_placements (
  id uuid PRIMARY KEY,
  slot_id uuid NOT NULL REFERENCES ad_slots(id) ON DELETE CASCADE,
  page_pattern text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY,
  actor_id uuid REFERENCES users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  before_json jsonb,
  after_json jsonb,
  ip_hash text,
  request_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_created ON audit_logs (created_at DESC);
CREATE INDEX idx_audit_entity ON audit_logs (entity_type, entity_id);

CREATE TRIGGER social_accounts_set_updated_at BEFORE UPDATE ON social_accounts
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER social_templates_set_updated_at BEFORE UPDATE ON social_templates
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER automation_rules_set_updated_at BEFORE UPDATE ON automation_rules
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER jobs_set_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER feature_flags_set_updated_at BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER site_settings_set_updated_at BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER content_metrics_set_updated_at BEFORE UPDATE ON content_metrics
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER tool_metrics_set_updated_at BEFORE UPDATE ON tool_metrics
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
