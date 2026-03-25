"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Member = { id: string; name: string };
type ViewMode = "buttons" | "list";

export default function AttendanceClient({
  members,
  today,
  existingServiceId,
  existingAttendees,
}: {
  members: Member[];
  today: string;
  existingServiceId: string | null;
  existingAttendees: string[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [selected, setSelected] = useState<Set<string>>(
    new Set(existingAttendees)
  );
  const [viewMode, setViewMode] = useState<ViewMode>("buttons");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [serviceDate, setServiceDate] = useState(today);

  const filteredMembers = useMemo(() => {
    const q = search.toLowerCase();
    return members.filter((m) => m.name.toLowerCase().includes(q));
  }, [members, search]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setSaved(false);
  }

  function selectAll() {
    setSelected(new Set(filteredMembers.map((m) => m.id)));
    setSaved(false);
  }

  function clearAll() {
    setSelected(new Set());
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Upsert the service record
      let serviceId = existingServiceId;
      if (!serviceId) {
        const { data, error } = await supabase
          .from("services")
          .insert({ date: serviceDate })
          .select("id")
          .single();
        if (error) throw error;
        serviceId = data.id;
      }

      // Delete existing attendance for this service then re-insert
      await supabase.from("attendance").delete().eq("service_id", serviceId);

      if (selected.size > 0) {
        const rows = Array.from(selected).map((member_id) => ({
          service_id: serviceId!,
          member_id,
        }));
        const { error } = await supabase.from("attendance").insert(rows);
        if (error) throw error;
      }

      setSaved(true);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to save attendance. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const presentCount = selected.size;
  const absentCount = members.length - presentCount;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Take Attendance</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {presentCount} present · {absentCount} absent · {members.length} total
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* View mode toggle */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
            <button
              onClick={() => setViewMode("buttons")}
              className={`px-3 py-2 font-medium transition-colors ${
                viewMode === "buttons"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Buttons
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 font-medium border-l border-gray-300 transition-colors ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Search + bulk actions */}
      <div className="flex gap-3 mb-5">
        <input
          type="text"
          placeholder="Search members…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={selectAll}
          className="text-sm px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
        >
          Select All
        </button>
        <button
          onClick={clearAll}
          className="text-sm px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Members — BUTTON MODE */}
      {viewMode === "buttons" && (
        <div className="flex flex-wrap gap-2 mb-8">
          {filteredMembers.map((m) => {
            const isPresent = selected.has(m.id);
            return (
              <button
                key={m.id}
                onClick={() => toggle(m.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all select-none ${
                  isPresent
                    ? "bg-green-500 border-green-500 text-white shadow-sm"
                    : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                {isPresent ? "✓ " : ""}
                {m.name}
              </button>
            );
          })}
          {filteredMembers.length === 0 && (
            <p className="text-gray-400 text-sm py-4">No members match your search.</p>
          )}
        </div>
      )}

      {/* Members — LIST / CHECKBOX MODE */}
      {viewMode === "list" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8 divide-y divide-gray-50">
          {filteredMembers.length === 0 && (
            <p className="text-gray-400 text-sm px-6 py-8 text-center">
              No members match your search.
            </p>
          )}
          {filteredMembers.map((m) => {
            const isPresent = selected.has(m.id);
            return (
              <label
                key={m.id}
                className="flex items-center gap-4 px-6 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isPresent}
                  onChange={() => toggle(m.id)}
                  className="w-4 h-4 accent-green-500"
                />
                <span
                  className={`text-sm font-medium ${
                    isPresent ? "text-green-700" : "text-gray-700"
                  }`}
                >
                  {m.name}
                </span>
                {isPresent && (
                  <span className="ml-auto text-xs text-green-600 font-semibold bg-green-50 rounded-full px-2 py-0.5">
                    Present
                  </span>
                )}
              </label>
            );
          })}
        </div>
      )}

      {/* Save bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-xl px-6 py-2.5 text-sm transition-colors"
        >
          {saving ? "Saving…" : "Save Attendance"}
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-medium">
            ✓ Attendance saved for {new Date(serviceDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </span>
        )}
      </div>
    </div>
  );
}
