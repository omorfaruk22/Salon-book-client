import { ProfileForm } from "@/features/auth/components/profile-form";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function ProfilePage() { return <main className="py-10 sm:py-14"><Container className="max-w-5xl"><SectionHeading eyebrow="Account settings" title="Your profile" description="Keep your contact details up to date." /><ProfileForm /></Container></main>; }

