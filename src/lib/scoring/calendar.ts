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
