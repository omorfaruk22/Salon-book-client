import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function PageLoader({ label = "Preparing your page…", fullScreen = false }: { label?: string; fullScreen?: boolean }) {
  return (
    <main className={fullScreen ? "grid min-h-[calc(100vh-4rem)] place-items-center px-5" : "grid min-h-[50vh] place-items-center px-5"}>
      <LoadingSpinner label={label} />
    </main>
  );
}
