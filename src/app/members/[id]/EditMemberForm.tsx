"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  join_date: string | null;
  is_active: boolean;
};

export default function EditMemberForm({ member }: { member: Member }) {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    name: member.name,
    phone: member.phone ?? "",
    email: member.email ?? "",
    join_date: member.join_date ?? "",
    is_active: member.is_active,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setSaved(false);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    const { error: dbError } = await supabase
      .from("members")
      .update({
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        join_date: form.join_date || null,
        is_active: form.is_active,
      })
      .eq("id", member.id);
    setSaving(false);
    if (dbError) {
      setError("Failed to update. " + dbError.message);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Full Name *" name="name" value={form.name} onChange={handleChange} />
      <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} type="tel" />
      <Field label="Email" name="email" value={form.email} onChange={handleChange} type="email" />
      <Field label="Join Date" name="join_date" value={form.join_date} onChange={handleChange} type="date" />

      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <input
          type="checkbox"
          name="is_active"
          checked={form.is_active}
          onChange={handleChange}
          className="w-4 h-4 accent-blue-600"
        />
        Active member
      </label>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-xl px-6 py-2.5 text-sm transition-colors"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">✓ Saved</span>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
