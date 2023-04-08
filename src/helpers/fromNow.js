function getDiffInUnits(diffInMs, unitInMs) {
  return Math.round(diffInMs / unitInMs);
}

function fromNow(date) {
  const now = new Date();
  const diffInMs = now.getTime() - new Date(date).getTime();

  // set the unit of time in milliseconds
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  // if the difference in milliseconds is less than a minute, return "just now"
  if (diffInMs < minute) {
    return "just now";
    // if the difference in milliseconds is less than an hour, return the number of minutes
  } else if (diffInMs < hour) {
    const diffInMinutes = getDiffInUnits(diffInMs, minute);
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
    // if the difference in milliseconds is less than a day, return the number of hours
  } else if (diffInMs < day) {
    const diffInHours = getDiffInUnits(diffInMs, hour);
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
    // if the difference in milliseconds is less than a week, return the number of days
  } else if (diffInMs < week) {
    const diffInDays = getDiffInUnits(diffInMs, day);
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
    // if the difference in milliseconds is less than a month, return the number of weeks
  } else if (diffInMs < month) {
    const diffInWeeks = getDiffInUnits(diffInMs, week);
    return `${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"} ago`;
    // if the difference in milliseconds is less than a year, return the number of months
  } else if (diffInMs < year) {
    const diffInMonths = getDiffInUnits(diffInMs, month);
    return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
      // if the difference in milliseconds is greater than a year, return the number of years
  } else {
    const diffInYears = getDiffInUnits(diffInMs, year);
    return `${diffInYears} ${diffInYears === 1 ? "year" : "years"} ago`;
  }
}

module.exports = fromNow;