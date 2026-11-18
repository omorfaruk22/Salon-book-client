export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type SalonAppointment = {
  _id: string;
  customerId: string;
  serviceId: string;
  serviceSnapshot: { name: string; durationMinutes: number; price: number };
  startsAt: string;
  customerNote?: string;
  status: AppointmentStatus;
  cancelledBy?: "customer" | "admin";
  createdAt: string;
  updatedAt: string;
};

export type SalonUser = {
  _id: string;
  authUserId?: string;
  name: string;
  email: string;
  phone?: string;
  role?: "customer" | "admin";
  status: "active" | "blocked";
  createdAt: string;
};

export type SalonTransaction = {
  _id: string;
  appointmentId: string;
  customerId: string;
  serviceName: string;
  amount: number;
  currency: string;
  provider: "stripe";
  providerSessionId?: string;
  providerPaymentIntentId?: string;
  status: "pending" | "paid" | "failed" | "refunded";
  paidAt?: string;
  createdAt: string;
};
