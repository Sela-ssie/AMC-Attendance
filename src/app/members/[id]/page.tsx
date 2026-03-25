import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import { notFound } from "next/navigation";
import AttendanceChart from "./AttendanceChart";
import EditMemberForm from "./EditMemberForm";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: member } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single();

  if (!member) notFound();

  // Fetch all services in the last 52 weeks with whether this member attended
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  const { data: services } = await supabase
    .from("services")
    .select("id, date, attendance(member_id)")
    .gte("date", cutoffStr)
    .order("date", { ascending: true });

  const chartData = (services ?? []).map((s) => {
    const attended = (s.attendance as { member_id: string }[]).some(
      (a) => a.member_id === id
    );
    return {
      date: s.date,
      attended: (attended ? 1 : 0) as 0 | 1,
      label: new Date(s.date + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };
  });

  const totalServices = chartData.length;
  const attendedCount = chartData.filter((d) => d.attended === 1).length;
  const attendanceRate =
    totalServices > 0 ? Math.round((attendedCount / totalServices) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Member header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {member.is_active ? (
                <span className="text-green-600 font-medium">Active</span>
              ) : (
                <span className="text-gray-400 font-medium">Inactive</span>
              )}{" "}
              · Joined{" "}
              {member.join_date
                ? new Date(member.join_date + "T00:00:00").toLocaleDateString(
                    "en-US",
                    { month: "long", year: "numeric" }
                  )
                : "unknown"}
            </p>
          </div>
        </div>

        {/* Attendance stats */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          <StatCard label="Services (past year)" value={totalServices} />
          <StatCard label="Times Attended" value={attendedCount} />
          <StatCard label="Attendance Rate" value={`${attendanceRate}%`} />
        </div>

        {/* Chart */}
        {chartData.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
            <h2 className="font-semibold text-gray-800 mb-4">
              Attendance — Past 12 Months
            </h2>
            <AttendanceChart data={chartData} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 text-center text-gray-400 text-sm">
            No service data yet.
          </div>
        )}

        {/* Edit form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="font-semibold text-gray-800 mb-6">Member Details</h2>
          <EditMemberForm member={member} />
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
