import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import AttendanceClient from "./AttendanceClient";

export default async function AttendancePage() {
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("members")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  // Find if attendance already exists for today
  const today = new Date().toISOString().split("T")[0];
  const { data: existingService } = await supabase
    .from("services")
    .select("id")
    .eq("date", today)
    .maybeSingle();

  let existingAttendees: string[] = [];
  if (existingService) {
    const { data: existing } = await supabase
      .from("attendance")
      .select("member_id")
      .eq("service_id", existingService.id);
    existingAttendees = (existing ?? []).map((a) => a.member_id);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <AttendanceClient
          members={members ?? []}
          today={today}
          existingServiceId={existingService?.id ?? null}
          existingAttendees={existingAttendees}
        />
      </main>
    </div>
  );
}
