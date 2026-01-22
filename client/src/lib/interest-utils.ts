import { differenceInDays } from "date-fns";

export function calculateInterest(
  principal: number,
  ratePercent: number,
  startDate: string | Date,
  endDate: string | Date = new Date(),
  type: "SIMPLE" | "COMPOUND"
) {
  const days = differenceInDays(new Date(endDate), new Date(startDate));
  const years = days / 365.25;
  
  if (days < 0) return 0;

  let interest = 0;
  if (type === "SIMPLE") {
    // I = P * R * T
    interest = principal * (ratePercent / 100) * years;
  } else {
    // A = P * (1 + R/n)^(nt) - P
    // Assuming annual compounding for simplicity unless specified
    interest = principal * Math.pow((1 + ratePercent / 100), years) - principal;
  }

  return Math.max(0, interest);
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
