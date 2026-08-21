-- Row Level Security. Service role / table owner bypasses RLS (import/build).
-- BFF using service_role must still enforce RBAC (Phase 1 ADR-108).
-- Never GRANT ALL TO authenticated. Never expose token_ref via a view.

CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT u.id
  FROM public.users u
  WHERE u.auth_user_id IS NOT NULL
    AND u.auth_user_id = auth.uid()
    AND u.deleted_at IS NULL
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.has_permission(perm_key text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role_id = ur.role_id
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = public.current_user_id()
      AND p.key = perm_key
  )
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT public.has_permission('documents.read_draft')
      OR public.has_permission('analytics.read')
      OR public.has_permission('audit.read')
$$;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE countdown_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_publish_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_synonyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE popular_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_view_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Public published content is readable (including published noindex pages).
CREATE POLICY documents_select_published ON documents
  FOR SELECT USING (status = 'published' AND deleted_at IS NULL);

CREATE POLICY documents_select_staff ON documents
  FOR SELECT USING (public.has_permission('documents.read_draft'));

CREATE POLICY documents_insert_editor ON documents
  FOR INSERT WITH CHECK (public.has_permission('documents.create'));

CREATE POLICY documents_update_editor ON documents
  FOR UPDATE USING (public.has_permission('documents.publish') OR public.has_permission('documents.create'));

CREATE POLICY document_seo_select_published ON document_seo
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_seo.document_id
        AND d.status = 'published'
        AND d.deleted_at IS NULL
    )
  );

CREATE POLICY document_seo_write_staff ON document_seo
  FOR ALL USING (
    public.has_permission('documents.seo_edit') OR public.has_permission('documents.publish')
  )
  WITH CHECK (
    public.has_permission('documents.seo_edit') OR public.has_permission('documents.publish')
  );

CREATE POLICY document_revisions_select_staff ON document_revisions
  FOR SELECT USING (public.has_permission('documents.read_draft'));

CREATE POLICY document_revisions_insert_staff ON document_revisions
  FOR INSERT WITH CHECK (public.has_permission('documents.create') OR public.has_permission('documents.publish'));

CREATE POLICY faq_select_published ON faq_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = faq_items.document_id AND d.status = 'published' AND d.deleted_at IS NULL
    )
  );

CREATE POLICY sources_select_public ON sources FOR SELECT USING (true);
CREATE POLICY document_sources_select_public ON document_sources FOR SELECT USING (true);
CREATE POLICY authors_select_public ON authors FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY categories_select_public ON categories FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY topics_select_public ON topics FOR SELECT USING (true);
CREATE POLICY tags_select_public ON tags FOR SELECT USING (true);
CREATE POLICY entities_select_public ON entities FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY content_types_select_public ON content_types FOR SELECT USING (true);

CREATE POLICY media_select_public ON media
  FOR SELECT USING (visibility = 'public' AND deleted_at IS NULL);
CREATE POLICY media_select_staff ON media
  FOR SELECT USING (public.has_permission('media.upload'));
CREATE POLICY media_variants_select_public ON media_variants FOR SELECT USING (true);

CREATE POLICY tools_select_active ON tools FOR SELECT USING (status = 'active');
CREATE POLICY tool_categories_select ON tool_categories FOR SELECT USING (true);
CREATE POLICY calendar_programs_select ON calendar_programs FOR SELECT USING (true);
CREATE POLICY calendar_events_select ON calendar_events FOR SELECT USING (true);
CREATE POLICY countdown_select ON countdown_definitions FOR SELECT USING (true);
CREATE POLICY price_snapshots_select ON price_snapshots FOR SELECT USING (true);
CREATE POLICY routes_select ON routes FOR SELECT USING (true);
CREATE POLICY redirects_select ON redirects FOR SELECT USING (is_enabled);

CREATE POLICY users_select_own ON users
  FOR SELECT USING (id = public.current_user_id() OR public.is_staff());
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (user_id = public.current_user_id() OR public.is_staff());
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (user_id = public.current_user_id());

CREATE POLICY roles_select_staff ON roles FOR SELECT USING (public.is_staff());
CREATE POLICY permissions_select_staff ON permissions FOR SELECT USING (public.is_staff());
CREATE POLICY user_roles_select_own ON user_roles
  FOR SELECT USING (user_id = public.current_user_id() OR public.has_permission('users.roles_grant'));
CREATE POLICY user_roles_write_super ON user_roles
  FOR ALL USING (public.has_permission('users.roles_grant'))
  WITH CHECK (public.has_permission('users.roles_grant'));

CREATE POLICY questions_select_visible ON questions
  FOR SELECT USING (deleted_at IS NULL AND status <> 'hidden');
CREATE POLICY answers_select_visible ON answers
  FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY comments_select_visible ON comments
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY votes_own ON votes
  FOR ALL USING (user_id = public.current_user_id())
  WITH CHECK (user_id = public.current_user_id());

CREATE POLICY feature_flags_select_staff ON feature_flags
  FOR SELECT USING (public.has_permission('flags.toggle') OR public.is_staff());
CREATE POLICY feature_flags_write_admin ON feature_flags
  FOR ALL USING (public.has_permission('flags.toggle'))
  WITH CHECK (public.has_permission('flags.toggle'));

CREATE POLICY site_settings_select_staff ON site_settings
  FOR SELECT USING (public.has_permission('settings.write') OR public.is_staff());
CREATE POLICY site_settings_write_admin ON site_settings
  FOR ALL USING (public.has_permission('settings.write'))
  WITH CHECK (public.has_permission('settings.write'));

CREATE POLICY analytics_select_analyst ON analytics_events
  FOR SELECT USING (public.has_permission('analytics.read'));
CREATE POLICY page_view_daily_select_analyst ON page_view_daily
  FOR SELECT USING (public.has_permission('analytics.read'));
CREATE POLICY content_metrics_select_analyst ON content_metrics
  FOR SELECT USING (public.has_permission('analytics.read'));
CREATE POLICY tool_metrics_select_analyst ON tool_metrics
  FOR SELECT USING (public.has_permission('analytics.read'));

CREATE POLICY jobs_staff ON jobs
  FOR ALL USING (public.has_permission('automation.edit') OR public.has_permission('settings.write'))
  WITH CHECK (public.has_permission('automation.edit') OR public.has_permission('settings.write'));

CREATE POLICY social_accounts_staff ON social_accounts
  FOR ALL USING (public.has_permission('social.connect'))
  WITH CHECK (public.has_permission('social.connect'));

CREATE POLICY audit_select_admin ON audit_logs
  FOR SELECT USING (public.has_permission('audit.read'));

CREATE POLICY audit_insert_service ON audit_logs
  FOR INSERT WITH CHECK (true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'GRANT USAGE ON SCHEMA public TO anon, authenticated';
    EXECUTE 'GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated';
  END IF;
EXCEPTION
  WHEN insufficient_privilege THEN
    NULL;
END $$;
