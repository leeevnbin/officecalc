const countNewYearsBetween = (
  startDateStr: string,
  endDate: Date = new Date()
): number => {
  const start = new Date(startDateStr);
  let count = 0;

  for (let year = start.getFullYear(); year <= endDate.getFullYear(); year++) {
    const newYear = new Date(year, 0, 1);
    if (newYear >= start && newYear <= endDate) count++;
  }

  return count;
};

export const calculateAnnualLeave = (
  startDate: string,
  referenceDate: Date = new Date()
) => {
  if (!startDate) return 0;

  const start = new Date(startDate);
  const ref = new Date(referenceDate);
  const daysSinceStart = dDay(startDate);

  const startYear = start.getFullYear();
  const referenceYear = ref.getFullYear();
  const lastYearLastDay = `${start.getFullYear() - 1}-12-31`;
  const lessOneYear = dDay(startDate, new Date(start.getFullYear(), 12, 0)) + 1;

  const lastDiffDays =
    Math.round(
      (lessOneYear /
        dDay(lastYearLastDay, new Date(start.getFullYear(), 12, 0))) *
        15 *
        10
    ) / 10;

  const countNewYears = countNewYearsBetween(startDate, referenceDate);

  console.log(countNewYears);

  if (startYear === referenceYear) {
    return Math.floor(daysSinceStart / 30);
  } else {
    if (daysSinceStart < 365) {
      return Math.floor(daysSinceStart / 30) + lastDiffDays;
    } else {
      if (countNewYears < 2) {
        return 11 + lastDiffDays;
      } else if (countNewYears > 2 && countNewYears < 4) {
        return 11 + lastDiffDays + 15 * (countNewYears - 1);
      } else {
        return 11 + lastDiffDays + 15 * (countNewYears - 2) + 16;
      }
    }
  }
};
