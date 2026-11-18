import { AuthGate } from "@/components/layout/auth-gate";

export default function CustomerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AuthGate role="customer">{children}</AuthGate>;
}
