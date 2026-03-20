-- ============================================================
-- 002_rls_policies.sql  ─ Row Level Security
-- ============================================================

ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides        ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_options  ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers  ENABLE ROW LEVEL SECURITY;

-- ---- profiles ----
-- 自分のプロフィールは読み書き可
CREATE POLICY "profiles: self read"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: self update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- adminは全プロフィールを読める
CREATE POLICY "profiles: admin read all"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ---- courses ----
-- 公開済みコースはtraineesが読める
CREATE POLICY "courses: trainee read published"
  ON courses FOR SELECT
  USING (
    is_published = TRUE
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'trainee'
    )
  );

-- adminは全操作
CREATE POLICY "courses: admin all"
  ON courses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ---- stages ----
-- 公開済みコースのステージはtraineesが読める
CREATE POLICY "stages: trainee read"
  ON stages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = stages.course_id AND c.is_published = TRUE
    )
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'trainee'
    )
  );

CREATE POLICY "stages: admin all"
  ON stages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ---- slides ----
CREATE POLICY "slides: trainee read"
  ON slides FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stages s
      JOIN courses c ON c.id = s.course_id
      WHERE s.id = slides.stage_id AND c.is_published = TRUE
    )
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'trainee'
    )
  );

CREATE POLICY "slides: admin all"
  ON slides FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ---- quizzes ----
CREATE POLICY "quizzes: trainee read"
  ON quizzes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stages s
      JOIN courses c ON c.id = s.course_id
      WHERE s.id = quizzes.stage_id AND c.is_published = TRUE
    )
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'trainee'
    )
  );

CREATE POLICY "quizzes: admin all"
  ON quizzes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ---- quiz_options ----
-- traineesはis_correct列を**読めない**ようにするためVIEWで対応（または列レベルセキュリティ）
-- ここではRLSで行単位のアクセスのみ制御し、is_correct の隠蔽はServer Actionで対応
CREATE POLICY "quiz_options: trainee read"
  ON quiz_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN stages s ON s.id = q.stage_id
      JOIN courses c ON c.id = s.course_id
      WHERE q.id = quiz_options.quiz_id AND c.is_published = TRUE
    )
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'trainee'
    )
  );

CREATE POLICY "quiz_options: admin all"
  ON quiz_options FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ---- user_progress ----
CREATE POLICY "user_progress: self"
  ON user_progress FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "user_progress: admin read"
  ON user_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ---- quiz_attempts ----
CREATE POLICY "quiz_attempts: self"
  ON quiz_attempts FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "quiz_attempts: admin read"
  ON quiz_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ---- quiz_answers ----
CREATE POLICY "quiz_answers: self"
  ON quiz_answers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts qa
      WHERE qa.id = quiz_answers.attempt_id AND qa.user_id = auth.uid()
    )
  );

CREATE POLICY "quiz_answers: admin read"
  ON quiz_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
