export const APPOINTMENTS_CHANGED_EVENT = "salonbook:appointments-changed";

export function notifyAppointmentsChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(APPOINTMENTS_CHANGED_EVENT));
}
