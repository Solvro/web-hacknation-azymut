import { z } from "zod";
import type { Source } from "./search.ts";

export const generatedCitation = z.object({
  id: z.string(),
  quote: z.string().trim().min(12).max(700),
});

const generatedCitations = z.array(generatedCitation).min(1).max(6);

const generatedAnswer = z.object({
  answer: z
    .string()
    .trim()
    .min(1)
    .max(4500)
    .refine((value) => value.toLowerCase() !== "insufficient"),
  citations: generatedCitations,
});

const whitespace = (value: string) =>
  value.normalize("NFC").replace(/\s+/g, " ").trim();

export function verifyAnswer(raw: unknown, context: Source[]) {
  const parsed = generatedAnswer.safeParse(raw);
  if (!parsed.success) return null;
  const sources = verifyCitations(parsed.data.citations, context);
  return sources && { answer: parsed.data.answer, sources };
}

export function verifyCitations(raw: unknown, context: Source[]) {
  const parsed = generatedCitations.safeParse(raw);
  if (!parsed.success) return null;
  const sources = [];
  for (const citation of parsed.data) {
    const source = context.find((item) => item.id === citation.id);
    if (
      !source ||
      !whitespace(source.text).includes(whitespace(citation.quote))
    )
      return null;
    sources.push({
      id: source.id,
      title: source.title,
      locator: source.locator,
      kind: source.kind,
      text: citation.quote,
      url: source.url,
    });
  }
  return sources;
}
