
export const dDay = (date: string, referenceDate: Date = new Date()): number => {
  if (!date) return 0;

  const formatDate = new Date(date);

  const diffTime = referenceDate.getTime() - formatDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};
