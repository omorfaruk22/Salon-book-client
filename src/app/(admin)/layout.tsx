import { AuthGate } from "@/components/layout/auth-gate";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AuthGate role="admin">{children}</AuthGate>;
}
