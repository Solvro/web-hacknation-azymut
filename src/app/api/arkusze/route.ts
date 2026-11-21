import { requireApiRole } from "../../../lib/server/access";
import { prepareAssessment } from "../../../lib/pdf/assessment";
import { reportForm } from "../../../lib/pdf/report";
import { renderReport } from "../../../lib/pdf/render-report";
import { renderAssessment } from "../../../lib/pdf/render";

export async function POST(request: Request) {
  const access = await requireApiRole(request, ["supervisor"]);
  if (access instanceof Response) return access;
  let document: { form: string; render: () => Promise<Buffer> };
  try {
    const body = await request.text();
    if (body.length > 20000)
      return new Response("Arkusz jest zbyt długi.", { status: 413 });
    const raw = JSON.parse(body);
    if (raw?.form === "report") {
      const data = reportForm.parse(raw);
      document = { form: data.form, render: () => renderReport(data) };
    } else {
      const assessment = prepareAssessment(raw);
      document = {
        form: assessment.data.form,
        render: () => renderAssessment(assessment),
      };
    }
  } catch {
    return new Response("Uzupełnij dane arkusza i sprawdź terminy.", {
      status: 400,
    });
  }

  try {
    const bytes = await document.render();
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="azymut-arkusz-${document.form}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Generowanie PDF nie powiodło się. Spróbuj ponownie.", {
      status: 500,
    });
  }
}
