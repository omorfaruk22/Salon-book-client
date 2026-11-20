const integerNumber = new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 });
export const SALON_TIME_ZONE = "Asia/Dhaka";

export function getSalonCalendarDate(date: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SALON_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((entry) => entry.type === type)?.value ?? "00";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

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

export function formatSalonAppointmentTime(appointmentDate?: string, timeSlot?: string, startsAt?: string) {
  if (appointmentDate && timeSlot) {
    const [year, month, day] = appointmentDate.split("-").map(Number);
    const date = new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeZone: SALON_TIME_ZONE })
      .format(new Date(Date.UTC(year, month - 1, day, 12)));
    return `${date}, ${formatTimeSlot(timeSlot)} (Bangladesh time)`;
  }
  if (startsAt) {
    return new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeStyle: "short", timeZone: SALON_TIME_ZONE })
      .format(new Date(startsAt));
  }
  return "Appointment time unavailable";
}

function formatTimeSlot(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${String(displayHour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${suffix}`;
}
