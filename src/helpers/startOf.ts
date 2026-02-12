type Periodicity = "all" | "day" | "month" | "week" | "year" | null | undefined;

export default function startOf(periodicity: Periodicity): string {
  const now = new Date();

  switch (periodicity) {
    case "year":
      now.setMonth(0);
      now.setDate(1);
      now.setHours(0, 0, 0, 0);
      break;
    case "month":
      now.setDate(1);
      now.setHours(0, 0, 0, 0);
      break;
    case "week":
      now.setDate(now.getDate() - now.getDay() + 1);
      now.setHours(0, 0, 0, 0);
      break;
    case "day":
      now.setHours(0, 0, 0, 0);
      break;
    case "all":
    default:
      return "1970-01-01";
  }

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
