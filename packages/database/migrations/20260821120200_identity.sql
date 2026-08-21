-- Identity domain. Supabase Auth owns credentials; public.users is the app profile.

CREATE TABLE users (
  id uuid PRIMARY KEY,
  auth_user_id uuid UNIQUE,
  handle text UNIQUE,
  display_name text NOT NULL DEFAULT '',
  email text UNIQUE,
  status user_status NOT NULL DEFAULT 'active',
  reputation_points int NOT NULL DEFAULT 0 CHECK (reputation_points >= 0),
  is_trusted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio text,
  avatar_media_id uuid,
  locale text NOT NULL DEFAULT 'ar' CHECK (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  timezone text NOT NULL DEFAULT 'Asia/Riyadh',
  website_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE roles (
  id uuid PRIMARY KEY,
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  is_system boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE permissions (
  id uuid PRIMARY KEY,
  key text UNIQUE NOT NULL,
  module text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE role_permissions (
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  granted_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
