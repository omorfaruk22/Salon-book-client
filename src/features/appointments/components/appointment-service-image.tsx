import Image from "next/image";
import { Scissors } from "lucide-react";

export function AppointmentServiceImage({ imageUrl, name, className = "" }: { imageUrl?: string; name: string; className?: string }) {
  return imageUrl ? <Image src={imageUrl} alt={`${name} service`} width={160} height={128} unoptimized className={`bg-[var(--surface)] object-cover ${className}`} />
    : <div aria-label={`${name} service image unavailable`} className={`grid place-items-center bg-[radial-gradient(circle_at_50%_35%,rgb(34_197_94_/_15%),transparent_48%),linear-gradient(135deg,#111714,#151d18)] ${className}`}><Scissors className="size-6 text-[var(--green-light)]" aria-hidden="true" /></div>;
}
