const integerNumber = new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 });

export function formatBDTPrice(price: number) {
  return `৳${new Intl.NumberFormat("en-BD", { maximumFractionDigits: 2 }).format(price)}`;
}

export function formatServiceDuration(durationMinutes: number) {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  const parts: string[] = [];

  if (hours > 0) parts.push(`${integerNumber.format(hours)} ${hours === 1 ? "hour" : "hours"}`);
  if (minutes > 0) parts.push(`${integerNumber.format(minutes)} ${minutes === 1 ? "minute" : "minutes"}`);
  return parts.join(" ") || "0 minutes";
}
