// Daty kalendarzowe ISO bez przesunięć wynikających ze strefy czasowej.
function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(value: string, days: number) {
  const date = new Date(value + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + days);
  return isoDate(date);
}

export function addMonths(value: string, months: number) {
  const date = new Date(value + "T00:00:00Z");
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months + 1, 0);
  date.setUTCDate(Math.min(day, date.getUTCDate()));
  return isoDate(date);
}

export function firstAssessmentWindow(
  employmentStart: string,
  contractEnd: string,
  agreementDate = employmentStart,
) {
  return {
    interviewDeadline: addDays(agreementDate, 21),
    earliestAssessment: addDays(addMonths(employmentStart, 8), 1),
    latestAssessment: addMonths(contractEnd, -1),
  };
}

export type OpeningTrigger =
  | "indefinite_contract"
  | "previous_assessment"
  | "negative_assessment";

export function periodicOpeningDeadline(trigger: OpeningTrigger, date: string) {
  return addDays(date, trigger === "negative_assessment" ? 7 : 30);
}

export function periodicCycleDeadline(date: string) {
  return addMonths(date, 24);
}

export function periodicFollowUp(acknowledged: string, positive: boolean) {
  return {
    objectionDue: addDays(acknowledged, 7),
    nextAssessment: positive ? null : addMonths(acknowledged, 6),
  };
}

export function extendPeriodicDeadline(
  due: string,
  absenceStart: string,
  absenceEnd: string,
) {
  if (absenceEnd < addMonths(absenceStart, 1)) return due;
  const start = Date.parse(absenceStart + "T00:00:00Z");
  const end = Date.parse(absenceEnd + "T00:00:00Z");
  const absentDays = (end - start) / 86400000 + 1;
  return addDays(due, absentDays);
}
