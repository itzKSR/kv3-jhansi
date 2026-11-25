"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { Download, FileSpreadsheet, Lock, RefreshCw, ShieldCheck } from "lucide-react";

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
  voter_class: string;
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

  function exportVoteAuditExcel() {
    const voteRows = votes.map((v) => ({
      "Roll No": v.roll_no,
      "Voter Name": v.voter_name,
      Stream: v.voter_class,
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
      Stream: v.voter_class,
      "Crown Category":
        v.crown_category === "mr-farewell" ? "Mr. Farewell" : "Miss Farewell",
      "Voted Candidate": v.candidate_name,
      Timestamp: new Date(v.created_at).toLocaleString("en-IN"),
    }));

    const participantRows = participants.map((p) => ({
      "Student Name": p.name,
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
          <Lock className="mx-auto mb-3 h-8 w-8 text-saffron" />
          <h1 className="font-serif text-3xl font-bold text-navy dark:text-ivory">
            Organizer Audit Portal
          </h1>
          <p className="mt-1 text-sm text-navy/70 dark:text-ivory/70">
            Enter the admin passcode to view RSVPs and download the Excel
            (.xlsx) vote audit sheet.
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
    <div className="mx-auto max-w-6xl space-y-10 px-5 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-saffron">
            <ShieldCheck className="h-4 w-4" />
            KV3 Jhansi Committee
          </span>
          <h1 className="mt-1 font-serif text-4xl font-bold text-navy dark:text-ivory">
            Vote Audit &amp; Excel Export
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
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
            className="inline-flex items-center gap-2 rounded-full bg-saffron px-5 py-2 text-xs font-semibold text-white"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Download Vote Audit Excel ({votes.length})
          </button>
          <button
            type="button"
            onClick={exportCombinedExcel}
            className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2 text-xs font-semibold text-ivory dark:bg-brass-light dark:text-navy-deep"
          >
            <Download className="h-3.5 w-3.5" />
            Download Combined Excel (Votes + RSVPs)
          </button>
        </div>
      </div>

      {/* Combined Vote Audit Table */}
      <div className="glass-card overflow-hidden rounded-3xl p-6">
        <h2 className="mb-4 font-serif text-2xl font-bold text-navy dark:text-ivory">
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
                  <td className="py-3 pr-4">{v.voter_class}</td>
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
      </div>
    </div>
  );
}
