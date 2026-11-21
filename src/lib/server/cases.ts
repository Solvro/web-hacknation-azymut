import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { getDatabase } from "./db";

export type CaseKind = "periodic" | "first";
export type CaseSummary = {
  kind: CaseKind;
  title: string;
  status: string;
  due: string | null;
  revision: number;
  unread: boolean;
};
type Actor = { id: string; workspace: string };

export async function listCases(workspace: string): Promise<CaseSummary[]> {
  const { rows } = await getDatabase().execute<CaseSummary>(sql`
    SELECT a.kind, a.title, a.status, a.due::text, a.revision,
      EXISTS(SELECT 1 FROM reminder r WHERE r.workspace=a.workspace AND r.kind=a.kind AND r.read_at IS NULL) AS unread
    FROM assessment a WHERE a.workspace=${workspace}
    ORDER BY a.due NULLS LAST, a.kind
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
    revision: number;
  },
) {
  return getDatabase().transaction(async (db) => {
    const { rows } = await db.execute<{ revision: number }>(
      data.revision === 0
        ? sql`
      INSERT INTO assessment (workspace,kind,title,status,due,draft)
      VALUES(${actor.workspace},${kind},${data.title},${data.status},${data.due},${JSON.stringify(data.draft)}::jsonb)
      ON CONFLICT DO NOTHING RETURNING revision
    `
        : sql`
      UPDATE assessment SET title=${data.title},status=${data.status},due=${data.due},draft=${JSON.stringify(data.draft)}::jsonb,
        revision=revision+1,updated_at=now()
      WHERE workspace=${actor.workspace} AND kind=${kind} AND revision=${data.revision}
      RETURNING revision
    `,
    );
    if (!rows.length) return null;
    await db.execute(
      sql`INSERT INTO audit_event(id,workspace,actor,action,kind) VALUES(${randomUUID()},${actor.workspace},${actor.id},'case_saved',${kind})`,
    );
    return rows[0].revision;
  });
}
export async function sendReminder(actor: Actor, kind: CaseKind) {
  return getDatabase().transaction(async (db) => {
    const result = await db.execute(sql`
      INSERT INTO reminder(id,workspace,kind)
      SELECT ${randomUUID()},workspace,kind FROM assessment
      WHERE workspace=${actor.workspace} AND kind=${kind} AND status NOT IN ('Do podpisu', 'Zapoznano z oceną')
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
