BEGIN;

ALTER TABLE assessment ADD COLUMN IF NOT EXISTS action_due date;
UPDATE assessment SET action_due = due
WHERE action_due IS NULL AND status IN ('Obserwacje', 'Rozmowa oceniająca', 'Ocena na piśmie');

ALTER TABLE reminder ADD COLUMN IF NOT EXISTS deadline date;
ALTER TABLE reminder ADD COLUMN IF NOT EXISTS automatic boolean NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS reminder_once_per_deadline
  ON reminder(workspace, kind, deadline) WHERE automatic;
CREATE INDEX IF NOT EXISTS assessment_upcoming_action_due
  ON assessment(action_due) WHERE status NOT IN ('Do podpisu', 'Zapoznano z oceną');

CREATE OR REPLACE FUNCTION queue_due_reminders(
  target_workspace uuid DEFAULT NULL,
  target_kind text DEFAULT NULL
) RETURNS integer LANGUAGE sql AS $$
  WITH clock AS (
    SELECT (CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Warsaw')::date AS today
  ), eligible AS (
    SELECT a.workspace, a.kind, a.action_due
    FROM assessment a CROSS JOIN clock c
    WHERE (target_workspace IS NULL OR a.workspace = target_workspace)
      AND (target_kind IS NULL OR a.kind = target_kind)
      AND a.action_due BETWEEN c.today AND c.today + 7
      AND a.status NOT IN ('Do podpisu', 'Zapoznano z oceną')
      AND NOT EXISTS (
        SELECT 1 FROM reminder r
        WHERE r.workspace = a.workspace AND r.kind = a.kind AND r.deadline = a.action_due
          AND (r.automatic OR (r.created_at AT TIME ZONE 'Europe/Warsaw')::date >= a.action_due - 7)
      )
    FOR UPDATE OF a SKIP LOCKED
  ), inserted AS (
    INSERT INTO reminder(id, workspace, kind, deadline, automatic)
    SELECT gen_random_uuid(), workspace, kind, action_due, true FROM eligible
    ON CONFLICT DO NOTHING
    RETURNING id
  )
  SELECT count(*)::integer FROM inserted
$$;

COMMIT;
