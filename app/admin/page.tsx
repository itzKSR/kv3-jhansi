"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import {
  Download,
  FileSpreadsheet,
  LayoutGrid,
  Loader2,
  Lock,
  RefreshCw,
  Search,
  ShieldCheck,
  Table as TableIcon,
  Trash2,
  Users,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const SCHOOL_LOGO_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQnNkkFI2cqfvb085dubJIIm0VRZ-N_Vu8NLog3QZeig&s";

interface ParticipantRow {
  id: string;
  name: string;
  stream: string;
  willing_to_pay: boolean;
  created_at: string;
}

interface VoteAuditRow {
  id: string;
  roll_no: string;
  voter_name: string;
  voter_stream: string;
  crown_category: string;
  candidate_name: string;
  created_at: string;
}

export default function AdminAuditPage() {
  const [passInput, setPassInput] = useState("");
  const [activePasscode, setActivePasscode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [votes, setVotes] = useState<VoteAuditRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [retractingId, setRetractingId] = useState<string | null>(null);

  const [participantView, setParticipantView] = useState<"cards" | "table">(
    "cards"
  );
  const [payFilter, setPayFilter] = useState<"all" | "yes" | "no">("all");
  const [voteSearch, setVoteSearch] = useState("");

  const fetchAuditAndParticipants = useCallback(async (passcode: string) => {
    setLoading(true);
    try {
      const [pRes, vRes] = await Promise.all([
        fetch("/api/participants", { cache: "no-store" }),
        fetch("/api/votes?audit=1", {
          cache: "no-store",
          headers: { "x-admin-passcode": passcode },
        }),
      ]);

      if (vRes.status === 401) {
        return { ok: false, error: "Incorrect admin passcode." };
      }

      if (pRes.ok) {
        const pData = await pRes.json();
        setParticipants(pData.participants ?? []);
      }
      if (vRes.ok) {
        const vData = await vRes.json();
        setVotes(vData.auditVotes ?? []);
      }
      return { ok: true as const };
    } catch {
      return { ok: false, error: "Network error. Please try again." };
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    if (!passInput.trim()) {
      setAuthError("Please enter the admin passcode.");
      return;
    }

    setAuthLoading(true);
    const result = await fetchAuditAndParticipants(passInput.trim());
    setAuthLoading(false);

    if (!result.ok) {
      setAuthError(result.error ?? "Incorrect passcode.");
      return;
    }

    setActivePasscode(passInput.trim());
    setUnlocked(true);
  }

  async function handleRetractVote(vote: VoteAuditRow) {
    const confirmed = window.confirm(
      `Retract vote by Roll No. ${vote.roll_no} (${vote.voter_name}) for ${
        vote.crown_category === "mr-farewell" ? "Mr. Farewell" : "Miss Farewell"
      }? This will allow Roll No. ${vote.roll_no} to vote again.`
    );
    if (!confirmed) return;

    setRetractingId(vote.id);
    try {
      const res = await fetch(`/api/votes?id=${encodeURIComponent(vote.id)}`, {
        method: "DELETE",
        headers: { "x-admin-passcode": activePasscode },
      });
      if (res.ok) {
        setVotes((prev) => prev.filter((v) => v.id !== vote.id));
      } else {
        const err = await res.json();
        alert(err.error || "Could not retract vote.");
      }
    } finally {
      setRetractingId(null);
    }
  }

  const filteredParticipants = participants.filter((p) => {
    if (payFilter === "yes") return p.willing_to_pay;
    if (payFilter === "no") return !p.willing_to_pay;
    return true;
  });

  const filteredVotes = votes.filter((v) => {
    const q = voteSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      v.roll_no.toLowerCase().includes(q) ||
      v.voter_name.toLowerCase().includes(q) ||
      v.candidate_name.toLowerCase().includes(q)
    );
  });

  function exportVoteAuditExcel() {
    const voteRows = votes.map((v) => ({
      "Roll No": v.roll_no,
      "Voter Name": v.voter_name,
      Class: "Class XII",
      Stream: v.voter_stream,
      "Crown Category":
        v.crown_category === "mr-farewell" ? "Mr. Farewell" : "Miss Farewell",
      "Voted Candidate": v.candidate_name,
      Timestamp: new Date(v.created_at).toLocaleString("en-IN"),
    }));

    const ws = XLSX.utils.json_to_sheet(voteRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vote Audit");
    XLSX.writeFile(wb, "KV3-Jhansi-Vote-Audit.xlsx");
  }

  function exportCombinedExcel() {
    const voteRows = votes.map((v) => ({
      "Roll No": v.roll_no,
      "Voter Name": v.voter_name,
      Class: "Class XII",
      Stream: v.voter_stream,
      "Crown Category":
        v.crown_category === "mr-farewell" ? "Mr. Farewell" : "Miss Farewell",
      "Voted Candidate": v.candidate_name,
      Timestamp: new Date(v.created_at).toLocaleString("en-IN"),
    }));

    const participantRows = participants.map((p) => ({
      "Student Name": p.name,
      Class: "Class XII",
      Stream: p.stream,
      "Willing to Pay": p.willing_to_pay ? "Yes" : "No",
      "Registered At": new Date(p.created_at).toLocaleString("en-IN"),
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(voteRows),
      "Vote Audit"
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(participantRows),
      "Participants RSVP"
    );
    XLSX.writeFile(wb, "KV3-Jhansi-Farewell-Complete.xlsx");
  }

  if (!unlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <form
          onSubmit={handleLogin}
          className="glass-card w-full max-w-md rounded-3xl p-8 text-center"
        >
          <div className="mb-4 flex justify-end">
            <ThemeToggle />
          </div>
          <Lock className="mx-auto mb-3 h-8 w-8 text-saffron" />
          <h1 className="font-serif text-3xl font-bold text-navy dark:text-ivory">
            Organizer Audit Portal
          </h1>
          <p className="mt-1 text-sm text-navy/70 dark:text-ivory/70">
            Enter the admin passcode to view participant passes, retract fake
            votes, and export Excel (.xlsx) sheets.
          </p>
          <div className="mt-6 flex gap-2">
            <input
              type="password"
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              placeholder="Admin passcode"
              className="w-full rounded-xl border border-navy/20 bg-white px-4 py-2.5 text-sm text-navy outline-none focus:border-saffron dark:border-white/20 dark:bg-navy-deep dark:text-ivory"
            />
            <button
              type="submit"
              disabled={authLoading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-ivory disabled:opacity-60 dark:bg-brass-light dark:text-navy-deep"
            >
              {authLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "Enter"
              )}
            </button>
          </div>
          {authError && (
            <p className="mt-3 rounded-xl border border-crimson/25 bg-rose-50 px-3 py-2 text-xs font-semibold text-crimson dark:border-rose-400/30 dark:bg-rose-950/60 dark:text-rose-200">
              {authError}
            </p>
          )}
          <Link
            href="/"
            className="mt-5 inline-block text-xs font-semibold text-saffron hover:underline"
          >
            &larr; Back to Farewell Site
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy/10 pb-6 dark:border-white/10">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-saffron dark:text-saffron-light">
            <ShieldCheck className="h-4 w-4" />
            KV3 Jhansi Committee
          </span>
          <h1 className="mt-1 font-serif text-4xl font-bold text-navy dark:text-ivory">
            Participants &amp; Vote Audit
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/"
            className="rounded-full border border-navy/20 bg-white px-4 py-2 text-xs font-semibold text-navy dark:border-white/20 dark:bg-navy-deep dark:text-ivory"
          >
            &larr; Home
          </Link>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => fetchAuditAndParticipants(activePasscode)}
            className="inline-flex items-center gap-2 rounded-full border border-navy/20 bg-white px-4 py-2 text-xs font-semibold text-navy dark:border-white/20 dark:bg-navy-deep dark:text-ivory"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={exportVoteAuditExcel}
            className="inline-flex items-center gap-2 rounded-full bg-saffron px-4 py-2 text-xs font-semibold text-white"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Vote Audit Excel ({votes.length})
          </button>
          <button
            type="button"
            onClick={exportCombinedExcel}
            className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-ivory dark:bg-brass-light dark:text-navy-deep"
          >
            <Download className="h-3.5 w-3.5" />
            Combined Excel
          </button>
        </div>
      </div>

      {/* SECTION 1: Registered Participants */}
      <section className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-navy/10 pb-4 dark:border-white/10">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-saffron dark:text-saffron-light">
              <Users className="h-3.5 w-3.5" />
              Class XII Directory
            </span>
            <h2 className="mt-1 font-serif text-2xl font-bold text-navy dark:text-ivory sm:text-3xl">
              Registered Participants ({filteredParticipants.length})
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(["all", "yes", "no"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setPayFilter(f)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                  payFilter === f
                    ? "bg-navy text-ivory dark:bg-brass-light dark:text-navy-deep"
                    : "border border-navy/15 bg-white text-navy/75 dark:border-white/15 dark:bg-navy-deep dark:text-ivory/75"
                }`}
              >
                {f === "all" ? "All" : f === "yes" ? "Paying: Yes" : "Paying: No"}
              </button>
            ))}

            <div className="ml-1 flex rounded-full border border-navy/15 bg-white p-0.5 dark:border-white/15 dark:bg-navy-deep">
              <button
                type="button"
                onClick={() => setParticipantView("cards")}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                  participantView === "cards"
                    ? "bg-saffron text-white"
                    : "text-navy/70 dark:text-ivory/70"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Cards
              </button>
              <button
                type="button"
                onClick={() => setParticipantView("table")}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                  participantView === "table"
                    ? "bg-saffron text-white"
                    : "text-navy/70 dark:text-ivory/70"
                }`}
              >
                <TableIcon className="h-3.5 w-3.5" />
                Table
              </button>
            </div>
          </div>
        </div>

        {filteredParticipants.length === 0 ? (
          <p className="py-10 text-center text-sm text-navy/60 dark:text-ivory/60">
            No participants match this filter yet.
          </p>
        ) : participantView === "cards" ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredParticipants.map((p) => (
              <div
                key={p.id}
                className="navy-surface relative overflow-hidden rounded-2xl p-5 text-ivory shadow-crest transition hover:-translate-y-1"
              >
                <div className="kvs-ribbon absolute inset-x-0 top-0 h-1" />
                <div className="flex items-center justify-between border-b border-ivory/15 pb-3 pt-1">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={SCHOOL_LOGO_URL}
                      alt="KV3 Jhansi"
                      className="h-9 w-9 rounded-full border border-brass-light/60 bg-white p-0.5 object-contain"
                    />
                    <div className="leading-tight">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brass-light">
                        KV No. 3, Jhansi
                      </p>
                      <p className="text-[11px] text-ivory/70">Farewell Pass</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-brass-light/40 bg-brass/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brass-light">
                    Class XII
                  </span>
                </div>

                <div className="mt-4">
                  <p className="truncate font-serif text-2xl font-bold text-ivory">
                    {p.name}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-saffron-light">
                    {p.stream}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-ivory/15 pt-3 text-[11px]">
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-bold ${
                      p.willing_to_pay
                        ? "border border-emerald-400/40 bg-emerald-500/20 text-emerald-300"
                        : "border border-white/20 bg-white/10 text-ivory/75"
                    }`}
                  >
                    {p.willing_to_pay ? "Willing to Pay: Yes" : "Willing to Pay: No"}
                  </span>
                  <span className="text-ivory/55">
                    {new Date(p.created_at).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-navy/15 text-xs uppercase tracking-wider text-navy/70 dark:border-white/15 dark:text-ivory/70">
                <tr>
                  <th className="py-3 pr-4">Student Name</th>
                  <th className="py-3 pr-4">Class</th>
                  <th className="py-3 pr-4">Stream</th>
                  <th className="py-3 pr-4">Willing to Pay</th>
                  <th className="py-3 pr-4">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/10 dark:divide-white/10">
                {filteredParticipants.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 pr-4 font-semibold">{p.name}</td>
                    <td className="py-3 pr-4">Class XII</td>
                    <td className="py-3 pr-4">{p.stream}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          p.willing_to_pay
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : "bg-navy/10 text-navy/70 dark:bg-white/10 dark:text-ivory/70"
                        }`}
                      >
                        {p.willing_to_pay ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs opacity-70">
                      {new Date(p.created_at).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* SECTION 2: Combined Vote Audit Log + Retract Vote */}
      <section className="glass-card overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl font-bold text-navy dark:text-ivory sm:text-3xl">
              Combined Vote Audit Log
            </h2>
            <p className="text-xs text-navy/65 dark:text-ivory/65">
              Retract any disputed vote so the real Roll Number holder can vote
              again.
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-navy/45 dark:text-ivory/45" />
            <input
              type="text"
              value={voteSearch}
              onChange={(e) => setVoteSearch(e.target.value)}
              placeholder="Search Roll No. or Name..."
              className="w-full rounded-full border border-navy/15 bg-white py-2 pl-9 pr-4 text-xs text-navy outline-none focus:border-saffron dark:border-white/15 dark:bg-navy-deep dark:text-ivory"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-navy/15 text-xs uppercase tracking-wider text-navy/70 dark:border-white/15 dark:text-ivory/70">
              <tr>
                <th className="py-3 pr-4">Roll No.</th>
                <th className="py-3 pr-4">Voter Name</th>
                <th className="py-3 pr-4">Stream</th>
                <th className="py-3 pr-4">Crown</th>
                <th className="py-3 pr-4">Voted For</th>
                <th className="py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/10 dark:divide-white/10">
              {filteredVotes.map((v) => (
                <tr key={v.id}>
                  <td className="py-3 pr-4 font-bold">{v.roll_no}</td>
                  <td className="py-3 pr-4">{v.voter_name}</td>
                  <td className="py-3 pr-4">{v.voter_stream}</td>
                  <td className="py-3 pr-4">
                    {v.crown_category === "mr-farewell"
                      ? "Mr. Farewell"
                      : "Miss Farewell"}
                  </td>
                  <td className="py-3 pr-4 font-semibold text-saffron dark:text-saffron-light">
                    {v.candidate_name}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      disabled={retractingId === v.id}
                      onClick={() => handleRetractVote(v)}
                      className="inline-flex items-center gap-1 rounded-full border border-crimson/30 bg-rose-50 px-3 py-1 text-xs font-semibold text-crimson transition hover:bg-crimson hover:text-white disabled:opacity-50 dark:border-rose-400/30 dark:bg-rose-950/60 dark:text-rose-200 dark:hover:bg-rose-600"
                    >
                      <Trash2 className="h-3 w-3" />
                      {retractingId === v.id ? "Retracting..." : "Retract"}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredVotes.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-navy/60 dark:text-ivory/60"
                  >
                    No matching votes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
