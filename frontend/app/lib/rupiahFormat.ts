export function rupiahFormat(amount: number | string): string {
  if (!amount) return "Rp 0";

  const number = typeof amount === "string" ? parseInt(amount) : amount;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
}
