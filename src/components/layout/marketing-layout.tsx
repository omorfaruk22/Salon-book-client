import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>
    <SiteHeader />
    <div className="flex min-h-[calc(100svh-4.25rem)] flex-col">
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  </>;
}
