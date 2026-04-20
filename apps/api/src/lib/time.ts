export function formatDateKey(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

export function getHourInTimeZone(date: Date, timeZone: string): number {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      hourCycle: "h23"
    }).format(date)
  );
}

export function getWeekdayInTimeZone(date: Date, timeZone: string): "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short"
  })
    .format(date)
    .toUpperCase() as "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";
}

export function recentWindowStart(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export function isSameLocalDate(left: Date | null | undefined, right: Date | null | undefined, timeZone: string): boolean {
  if (!left || !right) {
    return false;
  }

  return formatDateKey(left, timeZone) === formatDateKey(right, timeZone);
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);

  if (!year || !month || !day) {
    throw new Error(`Invalid date key: ${dateKey}`);
  }

  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

export function shiftDateKey(dateKey: string, days: number, timeZone: string): string {
  const date = parseDateKey(dateKey);
  date.setUTCDate(date.getUTCDate() + days);

  return formatDateKey(date, timeZone);
}

export function listDateKeys(endDateKey: string, days: number, timeZone: string): string[] {
  return Array.from({ length: days }, (_, index) => shiftDateKey(endDateKey, index - (days - 1), timeZone));
}
