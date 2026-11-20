"use client";

import Image from "next/image";
import { Scissors } from "lucide-react";
import { useEffect, useState } from "react";

export function ServiceDetailsImage({ imageUrl, name }: { imageUrl?: string; name: string }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [imageUrl]);

  return (
    <div className="group relative aspect-[16/10] overflow-hidden bg-[var(--surface)]">
      {imageUrl && !imageFailed ? (
        <Image
          src={imageUrl}
          alt={`${name} salon service`}
          fill
          sizes="(max-width: 1024px) 100vw, 65vw"
          unoptimized
          priority
          onError={() => setImageFailed(true)}
          className="object-cover transition duration-500 group-hover:scale-[1.025] motion-reduce:transition-none"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_35%,rgb(34_197_94_/_15%),transparent_48%),linear-gradient(135deg,#111714,#151d18)]">
          <Scissors className="size-12 text-[var(--green-light)]/80" strokeWidth={1.3} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
