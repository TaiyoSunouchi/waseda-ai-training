-- ============================================================
-- 001_initial_schema.sql
-- ============================================================

-- プロフィールテーブル（auth.usersと1:1）
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'trainee' CHECK (role IN ('admin', 'trainee')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- コーステーブル
CREATE TABLE courses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_by   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ステージテーブル（コース内の単元、順序付き）
CREATE TABLE stages (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id      UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  description    TEXT,
  order_index    INT NOT NULL,
  pass_threshold INT NOT NULL DEFAULT 70 CHECK (pass_threshold BETWEEN 0 AND 100),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, order_index)
);

-- スライドテーブル（PDF）
CREATE TABLE slides (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id    UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  file_url    TEXT NOT NULL,
  order_index INT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (stage_id, order_index)
);

-- クイズテーブル（4択）
CREATE TABLE quizzes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id    UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  explanation TEXT,
  order_index INT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (stage_id, order_index)
);

-- クイズ選択肢テーブル（1問4択）
CREATE TABLE quiz_options (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id     UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  is_correct  BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INT NOT NULL,
  UNIQUE (quiz_id, order_index)
);

-- 進捗テーブル（ユーザー×ステージ）
CREATE TABLE user_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stage_id      UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'not_started'
                  CHECK (status IN ('not_started', 'in_progress', 'passed')),
  best_score    INT NOT NULL DEFAULT 0 CHECK (best_score BETWEEN 0 AND 100),
  attempts_count INT NOT NULL DEFAULT 0,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, stage_id)
);

-- クイズ受験記録テーブル
CREATE TABLE quiz_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stage_id        UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  score           INT NOT NULL CHECK (score BETWEEN 0 AND 100),
  total_questions INT NOT NULL,
  correct_answers INT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 各問の回答テーブル
CREATE TABLE quiz_answers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id        UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  quiz_id           UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  selected_option_id UUID NOT NULL REFERENCES quiz_options(id) ON DELETE CASCADE,
  is_correct        BOOLEAN NOT NULL
);

-- updated_at を自動更新する関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at トリガー
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stages_updated_at
  BEFORE UPDATE ON stages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slides_updated_at
  BEFORE UPDATE ON slides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
