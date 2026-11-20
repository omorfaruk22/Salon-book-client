import { redirect } from "next/navigation";

type SignInAliasProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function SignInAliasPage({ searchParams }: SignInAliasProps) {
  const params = await searchParams;
  const query = new URLSearchParams();
  const next = typeof params.next === "string" ? params.next : "";
  if (/^\/services\/[a-f\d]{24}$/i.test(next)) query.set("next", next);
  if (params.error === "google" || params.error === "blocked") query.set("error", params.error);
  const suffix = query.size ? `?${query.toString()}` : "";
  redirect(`/login${suffix}`);
}
