function getDiffInUnits(diffInMs, unitInMs) {
  return Math.round(diffInMs / unitInMs);
}

function fromNow(date) {
  const now = new Date();
  const diffInMs = now.getTime() - new Date(date).getTime();

  // Define time units in milliseconds
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  // Calculate the appropriate unit of time
  if (diffInMs < minute) {
    return "just now";
  } else if (diffInMs < hour) {
    const diffInMinutes = getDiffInUnits(diffInMs, minute);
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
  } else if (diffInMs < day) {
    const diffInHours = getDiffInUnits(diffInMs, hour);
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  } else if (diffInMs < week) {
    const diffInDays = getDiffInUnits(diffInMs, day);
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  } else if (diffInMs < month) {
    const diffInWeeks = getDiffInUnits(diffInMs, week);
    return `${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"} ago`;
  } else if (diffInMs < year) {
    const diffInMonths = getDiffInUnits(diffInMs, month);
    return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
  } else {
    const diffInYears = getDiffInUnits(diffInMs, year);
    return `${diffInYears} ${diffInYears === 1 ? "year" : "years"} ago`;
  }
}

module.exports = fromNow;