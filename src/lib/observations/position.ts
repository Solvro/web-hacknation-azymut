import { z } from "zod";
import type { CompetencyModel } from "../drafts/periodic.ts";
import { criteria, periodicCriteria, type Criterion } from "../scoring/periodic.ts";

export const maxPositionLength = 6000;
export const maxPlannedIndicators = 8;
export const positionText = z.string().trim().min(20).max(maxPositionLength);

const quote = z.string().trim().min(3).max(200);
export const positionSuggestion = z.object({
  form: z.object({ kind: z.enum(["A", "B", "C"]), quote }).nullable(),
  criteria: z.array(z.object({ id: z.string().max(80), quote })).max(3),
  indicators: z.array(z.object({ id: z.string().max(80), quote })).max(maxPlannedIndicators),
});
export const positionScopeSuggestion = positionSuggestion.omit({ form: true });
export type PositionSuggestion = z.infer<typeof positionSuggestion>;

export function explicitPositionForm(text: string): PositionSuggestion["form"] {
  const isOfficeHead = text.match(/(?:^|[.!?]\s+|[\r\n]+)\s*(stanowisko kierownika urzędu)\b/iu)?.[1];
  if (isOfficeHead) return { kind: "A", quote: isOfficeHead };
  const withoutStaff = text.match(/bez podległych pracowników|nie kieruje pracownikami|zero podwładnych/iu)?.[0];
  const directsStaff = text.match(/(?:^|[.!?]\s+|[\r\n]+)\s*(bezpośrednio kieruje (?:[\p{L}-]+ zespołem|zespołem|pracownikami)(?!\s+(?:roboczym|projektowym)))/iu)?.[1];
  if (withoutStaff && !directsStaff) return { kind: "C", quote: withoutStaff };
  if (directsStaff && !withoutStaff) return { kind: "B", quote: directsStaff };
  return null;
}

export function verifyPositionSuggestion(
  text: string,
  result: PositionSuggestion,
  model: CompetencyModel,
): PositionSuggestion | null {
  const { form } = result;
  if (form && !text.includes(form.quote)) return null;
  if (!form || form.kind === "A") {
    return { form, criteria: [], indicators: [] };
  }

  const mandatory = periodicCriteria(form.kind);
  const extra = new Set<string>();
  const verifiedCriteria = result.criteria.filter(({ id, quote }) => {
    if (!Object.hasOwn(criteria, id) || mandatory.some((key) => key === id) ||
      !text.includes(quote) || extra.has(id)) return false;
    extra.add(id);
    return true;
  });
  const selected = [...mandatory, ...(extra as Set<Criterion>)];
  const candidateIds = new Set(selected.flatMap((id) =>
    model.competencies[id].map((indicator) => indicator.id),
  ));
  const seen = new Set<string>();
  const indicators = result.indicators.filter(({ id, quote }) => {
    if (!candidateIds.has(id) || !text.includes(quote) || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  return { form, criteria: verifiedCriteria, indicators };
}
