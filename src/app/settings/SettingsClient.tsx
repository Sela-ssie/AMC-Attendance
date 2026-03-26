"use client";

import { useState } from "react";
import { inviteAdmin, changePassword, deleteAdmin } from "./actions";

type Admin = { id: string; email: string };

export default function SettingsClient({
  currentUserId,
  admins,
}: {
  currentUserId: string;
  admins: Admin[];
}) {
  return (
    <div className="space-y-10">
      <InviteSection />
      <PasswordSection />
      <AdminsSection currentUserId={currentUserId} admins={admins} />
    </div>
  );
}

function InviteSection() {
  const [status, setStatus] = useState<{ error?: string; success?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const result = await inviteAdmin(new FormData(e.currentTarget));
    setStatus(result);
    setLoading(false);
    if (result.success) (e.target as HTMLFormElement).reset();
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Invite Admin</h2>
      <p className="text-sm text-gray-500 mb-4">
        Send an invite email to add a new admin account.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          name="email"
          type="email"
          required
          placeholder="email@example.com"
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-xl px-5 py-2 text-sm transition-colors"
        >
          {loading ? "Sending…" : "Send Invite"}
        </button>
      </form>
      {status?.error && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{status.error}</p>
      )}
      {status?.success && (
        <p className="mt-3 text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">✓ {status.success}</p>
      )}
    </section>
  );
}

function PasswordSection() {
  const [status, setStatus] = useState<{ error?: string; success?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const result = await changePassword(new FormData(e.currentTarget));
    setStatus(result);
    setLoading(false);
    if (result.success) (e.target as HTMLFormElement).reset();
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Change Password</h2>
      <p className="text-sm text-gray-500 mb-4">Update your login password.</p>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
        <input
          name="password"
          type="password"
          required
          placeholder="New password"
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          name="confirm"
          type="password"
          required
          placeholder="Confirm new password"
          className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-xl px-5 py-2 text-sm transition-colors"
        >
          {loading ? "Saving…" : "Update Password"}
        </button>
      </form>
      {status?.error && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{status.error}</p>
      )}
      {status?.success && (
        <p className="mt-3 text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">✓ {status.success}</p>
      )}
    </section>
  );
}

function AdminsSection({ currentUserId, admins }: { currentUserId: string; admins: Admin[] }) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleDelete(id: string) {
    const fd = new FormData();
    fd.set("userId", id);
    const result = await deleteAdmin(fd);
    if (result?.error) { setError(result.error); setConfirmId(null); }
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Admin Accounts</h2>
      <p className="text-sm text-gray-500 mb-4">All accounts with access to this app.</p>
      {error && (
        <p className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}
      <ul className="divide-y divide-gray-100">
        {admins.map((a) => (
          <li key={a.id} className="flex items-center justify-between py-3 gap-4">
            <span className="text-sm text-gray-800">
              {a.email}
              {a.id === currentUserId && (
                <span className="ml-2 text-xs text-blue-600 font-medium bg-blue-50 rounded-full px-2 py-0.5">you</span>
              )}
            </span>
            {a.id !== currentUserId && (
              confirmId === a.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-600 font-medium">Remove this account?</span>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-1 font-medium transition-colors"
                  >
                    Yes, remove
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setError(""); setConfirmId(a.id); }}
                  className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                  Remove
                </button>
              )
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
