import { MyAppointmentDetails } from "@/features/appointments/components/my-appointment-details";

export default async function MyAppointmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MyAppointmentDetails appointmentId={id} />;
}
