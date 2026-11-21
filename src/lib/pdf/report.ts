import { z } from "zod";

export const reportForm = z
  .object({
    form: z.literal("report"),
    reportFrom: z.iso.date(),
    reportDue: z.iso.date(),
  })
  .refine((data) => data.reportFrom <= data.reportDue);

export type ReportForm = z.infer<typeof reportForm>;
