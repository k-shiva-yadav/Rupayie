export const formatAmount = (amount: number, currency: any) => {
  if (!amount) return `${currency.symbol}0.00`;

  const formattedNumber = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);

  return currency.side === "left"
    ? `${currency.symbol}${formattedNumber}`
    : `${formattedNumber}${currency.symbol}`;
};
