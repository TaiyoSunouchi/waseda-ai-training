-- ============================================================
-- 003_triggers.sql
-- ============================================================

-- 1. ユーザー登録時にprofileを自動生成
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'trainee')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. 正解選択肢を1つに強制（同一quiz_id内のis_correct=trueは1つのみ）
CREATE OR REPLACE FUNCTION enforce_single_correct_option()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_correct = TRUE THEN
    UPDATE quiz_options
    SET is_correct = FALSE
    WHERE quiz_id = NEW.quiz_id
      AND id <> NEW.id
      AND is_correct = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_single_correct
  BEFORE INSERT OR UPDATE ON quiz_options
  FOR EACH ROW EXECUTE FUNCTION enforce_single_correct_option();

-- 3. 進捗の原子的更新（MAX(best_score)・attempts_count++）
CREATE OR REPLACE FUNCTION update_user_progress(
  p_user_id UUID,
  p_stage_id UUID,
  p_score INT,
  p_passed BOOLEAN
)
RETURNS VOID AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
BEGIN
  INSERT INTO user_progress (
    user_id, stage_id, status, best_score, attempts_count, completed_at, created_at, updated_at
  )
  VALUES (
    p_user_id,
    p_stage_id,
    CASE WHEN p_passed THEN 'passed' ELSE 'in_progress' END,
    p_score,
    1,
    CASE WHEN p_passed THEN v_now ELSE NULL END,
    v_now,
    v_now
  )
  ON CONFLICT (user_id, stage_id) DO UPDATE SET
    status         = CASE
                       WHEN user_progress.status = 'passed' THEN 'passed'
                       WHEN p_passed THEN 'passed'
                       ELSE 'in_progress'
                     END,
    best_score     = GREATEST(user_progress.best_score, p_score),
    attempts_count = user_progress.attempts_count + 1,
    completed_at   = CASE
                       WHEN user_progress.completed_at IS NOT NULL THEN user_progress.completed_at
                       WHEN p_passed THEN v_now
                       ELSE NULL
                     END,
    updated_at     = v_now;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
