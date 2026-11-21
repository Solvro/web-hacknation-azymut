import { demoAccess } from "../../../lib/server/auth";
import { firstForSignature } from "../../../lib/server/first-for-signature";
import { renderAssessment } from "../../../lib/pdf/render";

export async function GET() {
  const actor = await demoAccess();
  if (!actor || actor.role !== "department_head")
    return new Response(null, { status: actor ? 403 : 401 });
  const assessment = await firstForSignature(actor.workspace);
  if (!assessment) return new Response(null, { status: 404 });
  const bytes = await renderAssessment(assessment);
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="azymut-arkusz-first.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
