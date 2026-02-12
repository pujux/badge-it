function getDiffInUnits(diffInMs: number, unitInMs: number): number {
  return Math.max(1, Math.floor(diffInMs / unitInMs));
}

export default function fromNow(date: Date | number | string): string {
  const now = new Date();
  const parsedDateMs = new Date(date).getTime();
  const diffInMs = now.getTime() - parsedDateMs;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (!Number.isFinite(diffInMs) || diffInMs < minute) {
    return "just now";
  }

  if (diffInMs < hour) {
    const diffInMinutes = getDiffInUnits(diffInMs, minute);
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
  }

  if (diffInMs < day) {
    const diffInHours = getDiffInUnits(diffInMs, hour);
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  }

  if (diffInMs < week) {
    const diffInDays = getDiffInUnits(diffInMs, day);
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  }

  if (diffInMs < month) {
    const diffInWeeks = getDiffInUnits(diffInMs, week);
    return `${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"} ago`;
  }

  if (diffInMs < year) {
    const diffInMonths = getDiffInUnits(diffInMs, month);
    return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
  }

  const diffInYears = getDiffInUnits(diffInMs, year);
  return `${diffInYears} ${diffInYears === 1 ? "year" : "years"} ago`;
}
