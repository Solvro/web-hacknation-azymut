import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import type { CaseKind, ReminderKind } from "../cases/next-action";
import { getDatabase } from "./db";

export type { CaseKind } from "../cases/next-action";
export type CaseSummary = {
  kind: CaseKind;
  title: string;
  status: string;
  actionDue: string | null;
  reminder: ReminderKind | null;
};
type Actor = { id: string; workspace: string };

export async function listCases(workspace: string): Promise<CaseSummary[]> {
  const { rows } = await getDatabase().execute<CaseSummary>(sql`
    SELECT a.kind, a.title, a.status, a.action_due::text AS "actionDue",
      CASE WHEN r.id IS NULL THEN NULL WHEN r.automatic THEN 'automatic' ELSE 'manual' END AS reminder
    FROM assessment a
    LEFT JOIN reminder r ON r.workspace=a.workspace AND r.kind=a.kind AND r.read_at IS NULL
    WHERE a.workspace=${workspace}
    ORDER BY a.action_due NULLS LAST, a.kind
  `);
  return rows;
}
export async function readCase(workspace: string, kind: CaseKind) {
  const { rows } = await getDatabase().execute<{
    draft: unknown;
    revision: number;
  }>(sql`
    SELECT draft, revision FROM assessment WHERE workspace=${workspace} AND kind=${kind}
  `);
  return rows[0];
}
export async function saveCase(
  actor: Actor,
  kind: CaseKind,
  data: {
    draft: unknown;
    title: string;
    status: string;
    due: string | null;
    actionDue: string | null;
    revision: number;
  },
) {
  return getDatabase().transaction(async (db) => {
    const { rows } = await db.execute<{ revision: number }>(
      data.revision === 0
        ? sql`
      INSERT INTO assessment (workspace,kind,title,status,due,action_due,draft)
      VALUES(${actor.workspace},${kind},${data.title},${data.status},${data.due},${data.actionDue},${JSON.stringify(data.draft)}::jsonb)
      ON CONFLICT DO NOTHING RETURNING revision
    `
        : sql`
      UPDATE assessment SET title=${data.title},status=${data.status},due=${data.due},
      action_due=${data.actionDue},draft=${JSON.stringify(data.draft)}::jsonb,
        revision=revision+1,updated_at=now()
      WHERE workspace=${actor.workspace} AND kind=${kind} AND revision=${data.revision}
      RETURNING revision
    `,
    );
    if (!rows.length) return null;
    await db.execute(
      sql`INSERT INTO audit_event(id,workspace,actor,action,kind) VALUES(${randomUUID()},${actor.workspace},${actor.id},'case_saved',${kind})`,
    );
    await db.execute(sql`
      UPDATE reminder SET read_at=now()
      WHERE workspace=${actor.workspace} AND kind=${kind} AND read_at IS NULL
        AND (${data.status} = 'Zapoznano z oceną' OR deadline IS DISTINCT FROM ${data.actionDue}::date)
    `);
    await db.execute(sql`SELECT queue_due_reminders(${actor.workspace}, ${kind})`);
    const { rows: [pending] } = await db.execute<{ reminder: ReminderKind }>(sql`
      SELECT CASE WHEN automatic THEN 'automatic' ELSE 'manual' END AS reminder
      FROM reminder WHERE workspace=${actor.workspace} AND kind=${kind} AND read_at IS NULL
    `);
    return { revision: rows[0].revision, reminder: pending?.reminder ?? null };
  });
}
export async function sendReminder(actor: Actor, kind: CaseKind) {
  return getDatabase().transaction(async (db) => {
    const result = await db.execute(sql`
      INSERT INTO reminder(id,workspace,kind,deadline)
      SELECT ${randomUUID()},workspace,kind,action_due FROM assessment
      WHERE workspace=${actor.workspace} AND kind=${kind} AND status <> 'Zapoznano z oceną'
      FOR UPDATE
      ON CONFLICT DO NOTHING RETURNING id
    `);
    if (!result.rows.length) return false;
    await db.execute(
      sql`INSERT INTO audit_event(id,workspace,actor,action,kind) VALUES(${randomUUID()},${actor.workspace},${actor.id},'reminder_sent',${kind})`,
    );
    return true;
  });
}
export async function readReminder(actor: Actor, kind: CaseKind) {
  await getDatabase().execute(
    sql`UPDATE reminder SET read_at=now() WHERE workspace=${actor.workspace} AND kind=${kind} AND read_at IS NULL`,
  );
}

export async function listAudit(workspace: string) {
  const { rows } = await getDatabase().execute<{
    action: string;
    kind: CaseKind;
    at: string;
    actor: string;
  }>(sql`
    SELECT e.action, e.kind, e.created_at::text AS at, u.name AS actor
    FROM audit_event e JOIN "user" u ON e.actor=u.id
    WHERE e.workspace=${workspace} ORDER BY e.created_at DESC LIMIT 25
  `);
  return rows;
}
