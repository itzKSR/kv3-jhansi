"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import {
  Download,
  FileSpreadsheet,
  LayoutGrid,
  Lock,
  RefreshCw,
  ShieldCheck,
  Table as TableIcon,
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
  const adminPasscode = process.env.NEXT_PUBLIC_ADMIN_PASSCODE || "kv3admin";
  const [passInput, setPassInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [votes, setVotes] = useState<VoteAuditRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [participantView, setParticipantView] = useState<"cards" | "table">(
    "cards"
  );
  const [payFilter, setPayFilter] = useState<"all" | "yes" | "no">("all");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, vRes] = await Promise.all([
        fetch("/api/participants", { cache: "no-store" }),
        fetch("/api/votes?audit=1", { cache: "no-store" }),
      ]);
      if (pRes.ok) {
        const pData = await pRes.json();
        setParticipants(pData.participants ?? []);
      }
      if (vRes.ok) {
        const vData = await vRes.json();
        setVotes(vData.auditVotes ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (unlocked) loadData();
  }, [unlocked, loadData]);

  const filteredParticipants = participants.filter((p) => {
    if (payFilter === "yes") return p.willing_to_pay;
    if (payFilter === "no") return !p.willing_to_pay;
    return true;
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
        <div className="glass-card w-full max-w-md rounded-3xl p-8 text-center">
          <div className="mb-4 flex justify-end">
            <ThemeToggle />
          </div>
          <Lock className="mx-auto mb-3 h-8 w-8 text-saffron" />
          <h1 className="font-serif text-3xl font-bold text-navy dark:text-ivory">
            Organizer Audit Portal
          </h1>
          <p className="mt-1 text-sm text-navy/70 dark:text-ivory/70">
            Enter the admin passcode to view participant passes and export Excel
            (.xlsx) sheets.
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
              type="button"
              onClick={() => {
                if (passInput === adminPasscode) setUnlocked(true);
              }}
              className="rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-ivory dark:bg-brass-light dark:text-navy-deep"
            >
              Enter
            </button>
          </div>
          <Link
            href="/"
            className="mt-5 inline-block text-xs font-semibold text-saffron hover:underline"
          >
            &larr; Back to Farewell Site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-5 py-10">
      {/* Header */}
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
            onClick={loadData}
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

      {/* SECTION 1: Separate Participants Section (Modern Individual Cards + Table Toggle) */}
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
          /* Modern Theme-Matching Individual Participant Gala Cards (Class XII by default) */
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

      {/* SECTION 2: Combined Vote Audit Table */}
      <section className="glass-card overflow-hidden rounded-3xl p-6 sm:p-8">
        <h2 className="mb-4 font-serif text-2xl font-bold text-navy dark:text-ivory sm:text-3xl">
          Combined Vote Audit Log (Share Excel in Class Group)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-navy/15 text-xs uppercase tracking-wider text-navy/70 dark:border-white/15 dark:text-ivory/70">
              <tr>
                <th className="py-3 pr-4">Roll No.</th>
                <th className="py-3 pr-4">Voter Name</th>
                <th className="py-3 pr-4">Stream</th>
                <th className="py-3 pr-4">Crown</th>
                <th className="py-3 pr-4">Voted For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/10 dark:divide-white/10">
              {votes.map((v) => (
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
                </tr>
              ))}
              {votes.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-navy/60 dark:text-ivory/60"
                  >
                    No votes recorded yet.
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
