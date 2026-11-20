export type AdminDashboardStats = {
  totalCustomers: number;
  activeServices: number;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  successfulPayments: number;
  totalRevenue?: number;
};

export type AdminRecentAppointment = {
  _id: string;
  customer: { name: string; email: string };
  serviceName: string;
  servicePrice: number;
  startsAt: string;
  appointmentDate?: string;
  timeSlot?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "unpaid" | "paid";
  createdAt: string;
};

export type AdminRecentTransaction = {
  _id: string;
  appointmentId: string;
  customer: { name: string; email: string };
  serviceName: string;
  amount: number;
  currency: string;
  status: "paid";
  paidAt?: string;
  createdAt: string;
};

export type AdminAppointmentAnalytics = {
  statusDistribution: Record<"pending" | "confirmed" | "cancelled" | "completed", number>;
  dailyTrend: { date: string; total: number; pending: number; confirmed: number; cancelled: number; completed: number }[];
  days: number;
  timeZone: string;
};
