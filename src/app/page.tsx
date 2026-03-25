import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Total members
  const { count: totalMembers } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  // Last 8 services with attendance counts
  const { data: recentServices } = await supabase
    .from("services")
    .select("id, date, attendance(count)")
    .order("date", { ascending: false })
    .limit(8);

  const services = (recentServices ?? []).map((s) => ({
    id: s.id,
    date: s.date,
    count: (s.attendance as unknown as { count: number }[])[0]?.count ?? 0,
  }));

  const lastService = services[0];
  const attendanceRate =
    lastService && totalMembers
      ? Math.round((lastService.count / totalMembers) * 100)
      : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <StatCard label="Active Members" value={totalMembers ?? 0} />
          <StatCard
            label="Last Sunday Attendance"
            value={lastService?.count ?? "—"}
          />
          <StatCard
            label="Last Sunday Rate"
            value={attendanceRate != null ? `${attendanceRate}%` : "—"}
          />
        </div>

        {/* Quick actions */}
        <div className="flex gap-4 mb-10">
          <Link
            href="/attendance"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-3 font-medium text-sm transition-colors"
          >
            Take Attendance →
          </Link>
          <Link
            href="/members/new"
            className="bg-white border border-gray-300 hover:border-blue-400 text-gray-700 rounded-xl px-5 py-3 font-medium text-sm transition-colors"
          >
            Register New Member
          </Link>
        </div>

        {/* Recent services table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Recent Sundays</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Present</th>
                <th className="px-6 py-3 font-medium">% of Members</th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                    No services recorded yet.
                  </td>
                </tr>
              )}
              {services.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-3">
                    {new Date(s.date + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-3 font-medium">{s.count}</td>
                  <td className="px-6 py-3">
                    {totalMembers ? `${Math.round((s.count / totalMembers) * 100)}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
