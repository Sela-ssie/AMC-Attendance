import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import Link from "next/link";

export default async function MembersPage() {
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("members")
    .select("id, name, phone, email, join_date, is_active")
    .order("name");

  const active = (members ?? []).filter((m) => m.is_active);
  const inactive = (members ?? []).filter((m) => !m.is_active);

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Members{" "}
            <span className="text-base font-normal text-gray-400">
              ({active.length} active)
            </span>
          </h1>
          <Link
            href="/members/new"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors"
          >
            + Register Member
          </Link>
        </div>

        <MemberTable members={active} title="Active Members" />

        {inactive.length > 0 && (
          <div className="mt-10">
            <MemberTable members={inactive} title="Inactive Members" />
          </div>
        )}
      </main>
    </div>
  );
}

function MemberTable({
  members,
  title,
}: {
  members: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    join_date: string;
    is_active: boolean;
  }[];
  title: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800">{title}</h2>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100">
            <th className="px-6 py-3 font-medium">Name</th>
            <th className="px-6 py-3 font-medium">Phone</th>
            <th className="px-6 py-3 font-medium">Email</th>
            <th className="px-6 py-3 font-medium">Joined</th>
          </tr>
        </thead>
        <tbody>
          {members.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                No members yet.
              </td>
            </tr>
          )}
          {members.map((m) => (
            <tr
              key={m.id}
              className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
            >
              <td className="px-6 py-3">
                <Link
                  href={`/members/${m.id}`}
                  className="font-medium text-blue-700 hover:underline"
                >
                  {m.name}
                </Link>
              </td>
              <td className="px-6 py-3 text-gray-600">{m.phone ?? "—"}</td>
              <td className="px-6 py-3 text-gray-600">{m.email ?? "—"}</td>
              <td className="px-6 py-3 text-gray-600">
                {m.join_date
                  ? new Date(m.join_date + "T00:00:00").toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
