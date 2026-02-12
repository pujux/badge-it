type Periodicity = "all" | "day" | "month" | "week" | "year" | null | undefined;

export default function startOf(periodicity: Periodicity, referenceDate: Date = new Date()): string {
  const now = new Date(referenceDate);

  switch (periodicity) {
    case "year":
      now.setUTCMonth(0, 1);
      now.setUTCHours(0, 0, 0, 0);
      break;
    case "month":
      now.setUTCDate(1);
      now.setUTCHours(0, 0, 0, 0);
      break;
    case "week":
      // ISO week starts on Monday (getUTCDay: Sunday=0 => 7).
      now.setUTCDate(now.getUTCDate() - (now.getUTCDay() || 7) + 1);
      now.setUTCHours(0, 0, 0, 0);
      break;
    case "day":
      now.setUTCHours(0, 0, 0, 0);
      break;
    case "all":
    default:
      return "1970-01-01";
  }

  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
