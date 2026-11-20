export type SalonService = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  durationMinutes: number;
  price: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ApiEnvelope<T> = { data: T; error: { message: string } | null; meta?: { total?: number; totalPages?: number; activeTotal?: number; totalServices?: number; activeServices?: number; inactiveServices?: number; page?: number; limit?: number; categories?: string[] } };
