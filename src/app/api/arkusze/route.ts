import { requireApiRole } from "../../../lib/server/access";
import { prepareAssessment } from "../../../lib/pdf/assessment";
import { renderAssessment } from "../../../lib/pdf/render";

export async function POST(request: Request) {
  const access = await requireApiRole(request, ["supervisor"]);
  if (access instanceof Response) return access;
  let assessment: ReturnType<typeof prepareAssessment>;
  try {
    const body = await request.text();
    if (body.length > 20000)
      return new Response("Arkusz jest zbyt długi.", { status: 413 });
    assessment = prepareAssessment(JSON.parse(body));
  } catch {
    return new Response("Uzupełnij dane arkusza i sprawdź terminy.", {
      status: 400,
    });
  }

  try {
    const bytes = await renderAssessment(assessment);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="azymut-arkusz-${assessment.data.form}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Generowanie PDF nie powiodło się. Spróbuj ponownie.", {
      status: 500,
    });
  }
}
