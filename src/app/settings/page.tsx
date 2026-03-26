import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: { users } } = await admin.auth.admin.listUsers();

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 space-y-10">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <SettingsClient currentUserId={user.id} admins={users.map((u) => ({ id: u.id, email: u.email ?? "" }))} />
    </main>
  );
}
