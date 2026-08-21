-- Domain enums (Phase 1 §05). Do not replace with free-text status columns.

DO $$ BEGIN CREATE TYPE user_status AS ENUM ('active','suspended','banned','deleted'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE document_type AS ENUM (
  'article','guide','solution','news','trend','faq_page','comparison',
  'opportunity','job','scholarship','tool_page','calendar_content',
  'service_info','collection','legal'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE document_status AS ENUM (
  'idea','draft','review','scheduled','published','unpublished','archived'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE robots_directive AS ENUM (
  'index_follow','noindex_follow','index_nofollow','noindex_nofollow'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE tool_runtime AS ENUM ('static','island'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE tool_data_mode AS ENUM ('none','build_snapshot','client_compute','server_fetch'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE job_status AS ENUM ('queued','running','succeeded','failed','dead'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE social_provider AS ENUM ('facebook','telegram','x','instagram','linkedin','youtube'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE social_account_status AS ENUM ('connected','expired','revoked','error'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE publish_job_status AS ENUM ('queued','running','succeeded','failed','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE report_status AS ENUM ('open','accepted','rejected','ignored'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE moderation_target AS ENUM ('question','answer','comment','user','document'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE vote_target AS ENUM ('question','answer','comment'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE notification_channel AS ENUM ('in_app','email'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE redirect_status AS ENUM ('301','302','307','308','410'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE handler_kind AS ENUM (
  'document','tool','countdown','prices','static','gone','redirect'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE media_visibility AS ENUM ('public','private'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE media_variant_name AS ENUM (
  'original','thumbnail','medium','large','social','og'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE relation_kind AS ENUM ('related','parent','canonical_of'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE entity_kind AS ENUM (
  'org','place','product','person','topic','program','other'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
