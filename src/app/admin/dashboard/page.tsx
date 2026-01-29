"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { CandidateStatus } from "@/types/candidate";

interface CandidateWithId {
  rowIndex: number;
  candidateId?: string;
  name: string;
  email: string;
  mobile: string;
  city: string;
  resumeLink: string;
  status: CandidateStatus;
  hrNotes: string;
  createdAt: string;
}

const STATUS_OPTIONS: CandidateStatus[] = [
  "New",
  "CV Shared",
  "Interview Scheduled",
  "Selected",
  "Rejected",
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<CandidateWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<CandidateStatus | "">("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/candidates", { credentials: "include" });
      if (res.status === 401) {
        router.replace("/admin/login?next=/admin/dashboard");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load candidates.");
        setCandidates([]);
        return;
      }
      setCandidates(data.candidates ?? []);
    } catch {
      setError("Network error.");
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const filtered = candidates.filter((c) => {
    const matchSearch =
      !search ||
      [c.name, c.email, c.mobile, c.city].some((v) =>
        v.toLowerCase().includes(search.toLowerCase())
      );
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  async function handleSave(rowIndex: number) {
    if (editingRow !== rowIndex) return;
    const status =
      editStatus && STATUS_OPTIONS.includes(editStatus as CandidateStatus)
        ? (editStatus as CandidateStatus)
        : undefined;
    const hrNotes = editNotes.trim();
    setSaving(true);
    try {
      const res = await fetch("/api/update-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          rowIndex,
          ...(status && { status }),
          hrNotes,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.replace("/admin/login?next=/admin/dashboard");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Update failed.");
        setSaving(false);
        return;
      }
      setEditingRow(null);
      await fetchCandidates();
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(c: CandidateWithId) {
    setEditingRow(c.rowIndex);
    setEditStatus(c.status);
    setEditNotes(c.hrNotes);
  }

  function cancelEdit() {
    setEditingRow(null);
  }

  async function handleLogout() {
    await fetch("/api/admin-logout", { method: "POST", credentials: "include" });
    router.replace("/admin/login");
    router.refresh();
  }

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800">
            HR Dashboard – Candidates
          </h1>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-slate-600 hover:text-slate-800 underline"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Search name, email, mobile, city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm w-64 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => fetchCandidates()}
            className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Loading candidates…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            No candidates found.
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">
                      Mobile
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">
                      City
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">
                      Resume
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">
                      HR Notes
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">
                      Created
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((c) => (
                    <tr key={c.rowIndex} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-slate-600 text-sm">{c.candidateId ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-800">{c.name}</td>
                      <td className="px-4 py-3 text-slate-600">{c.email}</td>
                      <td className="px-4 py-3 text-slate-600">{c.mobile}</td>
                      <td className="px-4 py-3 text-slate-600">{c.city || "—"}</td>
                      <td className="px-4 py-3">
                        {c.resumeLink ? (
                          <a
                            href={c.resumeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:underline"
                          >
                            View / Download
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingRow === c.rowIndex ? (
                          <select
                            value={editStatus}
                            onChange={(e) =>
                              setEditStatus(e.target.value as CandidateStatus)
                            }
                            className="rounded border border-slate-300 px-2 py-1 text-slate-800"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-slate-800">{c.status}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        {editingRow === c.rowIndex ? (
                          <input
                            type="text"
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="HR notes…"
                            className="w-full rounded border border-slate-300 px-2 py-1 text-slate-800"
                          />
                        ) : (
                          <span className="text-slate-600 truncate block">
                            {c.hrNotes || "—"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {formatDate(c.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {editingRow === c.rowIndex ? (
                          <span className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => handleSave(c.rowIndex)}
                              disabled={saving}
                              className="text-primary-600 hover:underline disabled:opacity-60"
                            >
                              {saving ? "Saving…" : "Save"}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="text-slate-500 hover:underline"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEdit(c)}
                            className="text-primary-600 hover:underline"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
