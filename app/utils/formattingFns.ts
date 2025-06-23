export const commaFormat = (number: number): string => {
  if (isNaN(number) || number < 0) return "0";
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
