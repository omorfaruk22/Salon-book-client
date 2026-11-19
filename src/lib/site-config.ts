function publicUrl(value: string | undefined) {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export const siteConfig = {
  contactEmail: validEmail(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  contactPhone: validPhone(process.env.NEXT_PUBLIC_CONTACT_PHONE),
  location: process.env.NEXT_PUBLIC_SALON_LOCATION?.trim() || undefined,
  socials: [
    { name: "Facebook", href: publicUrl(process.env.NEXT_PUBLIC_FACEBOOK_URL) },
    { name: "Instagram", href: publicUrl(process.env.NEXT_PUBLIC_INSTAGRAM_URL) },
    { name: "YouTube", href: publicUrl(process.env.NEXT_PUBLIC_YOUTUBE_URL) },
  ].filter((link): link is { name: string; href: string } => Boolean(link.href)),
};

function validEmail(value: string | undefined) {
  const email = value?.trim();
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined;
}

function validPhone(value: string | undefined) {
  const phone = value?.trim();
  return phone && /^[+\d][\d\s().-]{5,22}$/.test(phone) ? phone : undefined;
}
