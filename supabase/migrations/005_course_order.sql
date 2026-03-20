-- ============================================================
-- 005_course_order.sql
-- コーステーブルに order_index カラムを追加
-- ============================================================

-- order_index カラムを追加（デフォルトは NULL 許可で追加後に更新）
ALTER TABLE courses ADD COLUMN order_index INT;

-- 既存のコースに created_at 順で order_index を設定
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM courses
)
UPDATE courses
SET order_index = ordered.rn
FROM ordered
WHERE courses.id = ordered.id;

-- NOT NULL 制約を付与
ALTER TABLE courses ALTER COLUMN order_index SET NOT NULL;
