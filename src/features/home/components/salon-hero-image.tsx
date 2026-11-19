"use client";

import Image from "next/image";
import Link from "next/link";
import { Scissors } from "lucide-react";
import { useState } from "react";
import { SALON_HERO_IMAGE_ALT, SALON_HERO_IMAGE_URL, SALON_HERO_PHOTO_PAGE } from "@/features/home/constants";

export function SalonHeroImage() {
  const [imageFailed, setImageFailed] = useState(false);

  return <div className="relative mx-auto w-full max-w-[38rem] animate-fade-up animation-delay-100">
    <div aria-hidden="true" className="absolute -inset-3 -z-10 rounded-[2rem] bg-[var(--primary)]/10 blur-2xl" />
    <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_80px_rgb(0_0_0_/_28%)] sm:rounded-[2rem]">
      {imageFailed ? <div role="img" aria-label={SALON_HERO_IMAGE_ALT} className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_50%_35%,rgb(34_197_94_/_20%),transparent_45%),linear-gradient(145deg,#151d18,#080b0a)] text-[var(--green-light)]"><Scissors className="size-12" strokeWidth={1.3} aria-hidden="true" /><span className="text-sm font-medium text-[var(--muted)]">SalonBook</span></div> : <Image
        src={SALON_HERO_IMAGE_URL}
        alt={SALON_HERO_IMAGE_ALT}
        fill
        priority
        quality={85}
        sizes="(max-width: 1024px) 100vw, 48vw"
        className="object-cover"
        onError={() => setImageFailed(true)}
      />}
      {!imageFailed && <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#080b0a]/75 via-[#080b0a]/5 to-transparent" />}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-6">
        <div className="rounded-full border border-white/15 bg-[#080b0a]/65 px-3 py-2 text-xs font-medium text-white backdrop-blur-md sm:px-4">
          A calm space for your next visit
        </div>
        <Link href={SALON_HERO_PHOTO_PAGE} target="_blank" rel="noreferrer" className="shrink-0 text-[10px] text-white/75 underline decoration-white/35 underline-offset-2 transition hover:text-white focus-visible:rounded-sm sm:text-xs">Photo by Benyamin Bohlouli</Link>
      </div>
    </div>
    <div aria-hidden="true" className="absolute -bottom-4 left-7 right-7 -z-10 h-9 rounded-full bg-black/45 blur-xl" />
  </div>;
}
