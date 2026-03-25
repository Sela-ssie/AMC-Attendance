"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    join_date: new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
    setSuccess("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    const { error: dbError } = await supabase.from("members").insert({
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      join_date: form.join_date,
      is_active: true,
    });
    setSaving(false);
    if (dbError) {
      setError("Failed to register member. " + dbError.message);
      return;
    }
    setSuccess(`${form.name.trim()} has been registered!`);
    setForm({ name: "", phone: "", email: "", join_date: new Date().toISOString().split("T")[0] });
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Full Name *" name="name" value={form.name} onChange={handleChange} placeholder="First Last" />
        <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" type="tel" />
        <Field label="Email" name="email" value={form.email} onChange={handleChange} placeholder="member@example.com" type="email" />
        <Field label="Join Date" name="join_date" value={form.join_date} onChange={handleChange} type="date" />

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
            ✓ {success}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-xl px-6 py-2.5 text-sm transition-colors"
          >
            {saving ? "Registering…" : "Register Member"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/members")}
            className="border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl px-6 py-2.5 text-sm font-medium transition-colors"
          >
            View All Members
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
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
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
