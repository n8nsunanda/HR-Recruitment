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
  payment: string;
  experience: string;
  shortNote: string;
  skills: string;
}

const STATUS_OPTIONS: CandidateStatus[] = [
  "New",
  "CV Shared",
  "Interview Scheduled",
  "Selected",
  "Rejected",
  "Old",
];

const PAYMENT_OPTIONS = [
  "",
  "Reg Fee Received",
  "10% done",
  "25% done",
  "50% done",
  "100% done",
  "Fully Paid",
  "Pending",
  "Not Applicable",
];

type DateFilterValue = "" | "today" | "yesterday" | "last5" | "last7" | "last30";

const DATE_FILTER_OPTIONS: { value: DateFilterValue; label: string }[] = [
  { value: "", label: "All time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last5", label: "Last 5 days" },
  { value: "last7", label: "Last 7 days" },
  { value: "last30", label: "Last 30 days" },
];

function isCandidateInDateRange(createdAt: string, range: DateFilterValue): boolean {
  if (!range || !createdAt) return true;
  const date = new Date(createdAt);
  if (isNaN(date.getTime())) return true;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case "today":
      return date >= startOfToday && date < endOfToday;
    case "yesterday":
      return date >= startOfYesterday && date < endOfYesterday;
    case "last5": {
      const fiveDaysAgo = new Date(now);
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      return date >= fiveDaysAgo && date <= now;
    }
    case "last7": {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return date >= sevenDaysAgo && date <= now;
    }
    case "last30": {
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return date >= thirtyDaysAgo && date <= now;
    }
    default:
      return true;
  }
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<CandidateWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<DateFilterValue>("");
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<CandidateStatus | "">("");
  const [editNotes, setEditNotes] = useState("");
  const [editPayment, setEditPayment] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingRow, setDeletingRow] = useState<number | null>(null);

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
      [c.name, c.email, c.mobile, c.city, c.experience ?? "", c.skills ?? "", c.shortNote ?? ""].some((v) =>
        v.toLowerCase().includes(search.toLowerCase())
      );
    const matchStatus = !statusFilter || c.status === statusFilter;
    const matchDate = isCandidateInDateRange(c.createdAt, dateFilter);
    return matchSearch && matchStatus && matchDate;
  });

  async function handleSave(rowIndex: number) {
    if (editingRow !== rowIndex) return;
    const status =
      editStatus && STATUS_OPTIONS.includes(editStatus as CandidateStatus)
        ? (editStatus as CandidateStatus)
        : undefined;
    const hrNotes = editNotes.trim();
    const payment = editPayment.trim();
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
          payment,
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
    setEditPayment(c.payment ?? "");
  }

  function cancelEdit() {
    setEditingRow(null);
  }

  async function handleDelete(rowIndex: number) {
    if (!confirm("Delete this candidate from the sheet? This cannot be undone.")) return;
    setDeletingRow(rowIndex);
    setError("");
    try {
      const res = await fetch("/api/delete-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rowIndex }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.replace("/admin/login?next=/admin/dashboard");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Delete failed.");
        setDeletingRow(null);
        return;
      }
      await fetchCandidates();
    } catch {
      setError("Network error.");
    } finally {
      setDeletingRow(null);
    }
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
            placeholder="Search name, email, mobile, city, experience, skills…"
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
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilterValue)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            title="Filter by registration date"
          >
            {DATE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
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
          <>
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-3 text-left font-medium text-slate-700 whitespace-nowrap">ID</th>
                      <th className="px-3 py-3 text-left font-medium text-slate-700 whitespace-nowrap">Name</th>
                      <th className="px-3 py-3 text-left font-medium text-slate-700 whitespace-nowrap">Email</th>
                      <th className="px-3 py-3 text-left font-medium text-slate-700 whitespace-nowrap">Mobile</th>
                      <th className="px-3 py-3 text-left font-medium text-slate-700 whitespace-nowrap">City</th>
                      <th className="px-3 py-3 text-left font-medium text-slate-700 whitespace-nowrap">Experience</th>
                      <th className="px-3 py-3 text-left font-medium text-slate-700 whitespace-nowrap">Skills</th>
                      <th className="px-3 py-3 text-left font-medium text-slate-700 whitespace-nowrap">Short Note</th>
                      <th className="px-3 py-3 text-left font-medium text-slate-700 whitespace-nowrap">Resume</th>
                      <th className="px-3 py-3 text-left font-medium text-slate-700 whitespace-nowrap">Status</th>
                      <th className="px-3 py-3 text-left font-medium text-slate-700 whitespace-nowrap">HR Notes</th>
                      <th className="px-3 py-3 text-left font-medium text-slate-700 whitespace-nowrap">Created</th>
                      <th className="px-3 py-3 text-left font-medium text-slate-700 whitespace-nowrap">Payment</th>
                      <th className="px-3 py-3 text-right font-medium text-slate-700 whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((c) => (
                      <tr
                        key={c.rowIndex}
                        className={
                          editingRow === c.rowIndex
                            ? "bg-primary-50/50"
                            : "hover:bg-slate-50/50"
                        }
                      >
                        <td className="px-3 py-2.5 text-slate-600 text-sm whitespace-nowrap">{c.candidateId ?? "—"}</td>
                        <td className="px-3 py-2.5 text-slate-800 whitespace-nowrap">{c.name}</td>
                        <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{c.email}</td>
                        <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{c.mobile}</td>
                        <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{c.city || "—"}</td>
                        <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{c.experience || "—"}</td>
                        <td className="px-3 py-2.5 text-slate-600 max-w-[120px]">
                          <span className="truncate block" title={c.skills || ""}>{c.skills || "—"}</span>
                        </td>
                        <td className="px-3 py-2.5 text-slate-600 max-w-[140px]">
                          <span className="truncate block" title={c.shortNote || ""}>{c.shortNote || "—"}</span>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {c.resumeLink ? (
                            <a href={c.resumeLink} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                              View / Download
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-slate-800 whitespace-nowrap">{c.status}</td>
                        <td className="px-3 py-2.5 text-slate-600 max-w-[140px] md:max-w-[200px]">
                          <span className="truncate block" title={c.hrNotes || ""}>
                            {c.hrNotes || "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{formatDate(c.createdAt)}</td>
                        <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{c.payment || "—"}</td>
                        <td className="px-3 py-2.5 text-right whitespace-nowrap">
                          <span className="flex gap-2 justify-end items-center flex-wrap">
                            <button
                              type="button"
                              onClick={() => startEdit(c)}
                              disabled={editingRow !== null && editingRow !== c.rowIndex}
                              className="text-primary-600 hover:underline disabled:opacity-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(c.rowIndex)}
                              disabled={deletingRow === c.rowIndex}
                              className="text-red-600 hover:underline disabled:opacity-60"
                            >
                              {deletingRow === c.rowIndex ? "Deleting…" : "Delete"}
                            </button>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Edit panel – appears below table when a row is being edited (works on desktop + mobile) */}
            {editingRow !== null && (() => {
              const candidate = filtered.find((c) => c.rowIndex === editingRow);
              if (!candidate) return null;
              return (
                <div className="mt-6 rounded-xl border-2 border-primary-200 bg-white shadow-lg p-4 md:p-6">
                  <h3 className="text-base font-semibold text-slate-800 mb-4">
                    Edit: {candidate.name}
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as CandidateStatus)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment</label>
                      <select
                        value={editPayment}
                        onChange={(e) => setEditPayment(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        {PAYMENT_OPTIONS.map((opt) => (
                          <option key={opt || "none"} value={opt}>{opt || "—"}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">HR Notes</label>
                      <input
                        type="text"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="HR notes…"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleSave(editingRow)}
                      disabled={saving}
                      className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
                    >
                      {saving ? "Saving…" : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </main>
    </div>
  );
}
