"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function inviteAdmin(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  if (!email) return { error: "Email is required." };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.inviteUserByEmail(email);
  if (error) return { error: error.message };
  return { success: `Invite sent to ${email}` };
}

export async function changePassword(formData: FormData) {
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!password || password.length < 8)
    return { error: "Password must be at least 8 characters." };
  if (password !== confirm)
    return { error: "Passwords do not match." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  return { success: "Password updated successfully." };
}

export async function deleteAdmin(formData: FormData) {
  const userId = formData.get("userId") as string;
  if (!userId) return { error: "User ID is required." };

  // Prevent deleting yourself
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id === userId) return { error: "You cannot delete your own account." };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };
  redirect("/settings");
}
