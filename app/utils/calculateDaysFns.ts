export const calculateAnnualLeave = (startDate: string, referenceDate: Date = new Date()) => {
  if (!startDate) return 0;

  const lessOneYear = dDay(startDate);
  const diffDays = lessOneYear < 365 ? lessOneYear : dDay(startDate, new Date(referenceDate.getFullYear(), 0, 1)) + 1;
  return lessOneYear < 365 ? Math.floor(diffDays / 30) : Math.ceil(15 * (diffDays / 365) * 10) / 10;
};