-- Community schema exists; feature flags stay off. UGC is not documents.

CREATE TABLE questions (
  id uuid PRIMARY KEY,
  author_id uuid REFERENCES users(id),
  title text NOT NULL,
  slug text NOT NULL,
  path text NOT NULL UNIQUE,
  body text NOT NULL,
  category_id uuid REFERENCES categories(id),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','hidden')),
  indexable boolean NOT NULL DEFAULT false,
  accepted_answer_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE answers (
  id uuid PRIMARY KEY,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  author_id uuid REFERENCES users(id),
  body text NOT NULL,
  is_accepted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE questions
  ADD CONSTRAINT questions_accepted_answer_fk
  FOREIGN KEY (accepted_answer_id) REFERENCES answers(id);

CREATE TABLE comments (
  id uuid PRIMARY KEY,
  author_id uuid REFERENCES users(id),
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE votes (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type vote_target NOT NULL,
  target_id uuid NOT NULL,
  value smallint NOT NULL CHECK (value IN (-1, 1)),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, target_type, target_id)
);

CREATE TABLE bookmarks (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, document_id)
);

CREATE TABLE follows (
  follower_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, target_type, target_id)
);

CREATE TABLE mentions (
  id uuid PRIMARY KEY,
  actor_id uuid REFERENCES users(id),
  mentioned_user_id uuid NOT NULL REFERENCES users(id),
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE reputation_events (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  action text NOT NULL,
  points int NOT NULL,
  target_type text,
  target_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE badges (
  id uuid PRIMARY KEY,
  key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_badges (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  granted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

CREATE INDEX idx_questions_indexable ON questions (indexable) WHERE indexable AND deleted_at IS NULL;

CREATE TRIGGER questions_set_updated_at BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER answers_set_updated_at BEFORE UPDATE ON answers
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER comments_set_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
