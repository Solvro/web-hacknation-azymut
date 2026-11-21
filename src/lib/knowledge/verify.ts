import { z } from "zod";
import type { Source } from "./search.ts";

export const generatedAnswer = z.object({
  answer: z.string().trim().min(1).max(4500),
  citations: z
    .array(
      z.object({
        id: z.string(),
        quote: z.string().trim().min(12).max(700),
      }),
    )
    .min(1)
    .max(6),
});

const whitespace = (value: string) => value.replace(/\s+/g, " ").trim();

export function verifyAnswer(raw: unknown, context: Source[]) {
  const parsed = generatedAnswer.safeParse(raw);
  if (!parsed.success) return null;
  const sources = [];
  for (const citation of parsed.data.citations) {
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
      text: citation.quote,
      url: source.url,
    });
  }
  return { answer: parsed.data.answer, sources };
}
