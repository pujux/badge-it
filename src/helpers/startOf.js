function startOf(periodicity) {
  const now = new Date();

  // Set the beginning of the relevant period
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
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

module.exports = startOf;
