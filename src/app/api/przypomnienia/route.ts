import { z } from "zod";
import { requireApiRole } from "../../../lib/server/access";
import { readReminder, sendReminder } from "../../../lib/server/cases";
const input = z.object({
  kind: z.enum(["periodic", "first"]),
  action: z.enum(["send", "read"]),
});

export async function POST(request: Request) {
  const actor = await requireApiRole(request, ["hr", "admin", "supervisor"]);
  if (actor instanceof Response) return actor;
  if (!actor) return new Response(null, { status: 503 });
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new Response(null, { status: 400 });
  const { kind, action } = parsed.data;
  const allowed = action === "send" ? ["hr", "admin"] : ["supervisor"];
  if (!allowed.includes(actor.role)) return new Response(null, { status: 403 });
  if (action === "send" && !(await sendReminder(actor, kind))) {
    return Response.json(
      {
        error: "Sprawa ma już nieodczytane przypomnienie albo odnotowano zapoznanie z oceną.",
      },
      { status: 409 },
    );
  }
  if (action === "read") await readReminder(actor, kind);
  return new Response(null, { status: 204 });
}
