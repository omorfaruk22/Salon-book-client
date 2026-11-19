import { MarketingLayout } from "@/components/layout/marketing-layout";

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <MarketingLayout>{children}</MarketingLayout>;
}
