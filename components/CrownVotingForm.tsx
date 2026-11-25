"use client";

import { useState } from "react";
import { Award, CheckCircle2 } from "lucide-react";
import TiltCard from "./TiltCard";
import {
  CANDIDATES_BY_CROWN,
  CROWN_CATEGORIES,
  STREAMS,
  type CrownCategoryId,
} from "@/lib/constants";

interface CrownVotingFormProps {
  knownCandidates?: string[];
  onVoteCast: (category: string) => void;
}

export default function CrownVotingForm({ onVoteCast }: CrownVotingFormProps) {
  const [rollNo, setRollNo] = useState("");
  const [voterName, setVoterName] = useState("");
  const [voterStream, setVoterStream] = useState<string>(STREAMS[0]);
  const [crownCategory, setCrownCategory] =
    useState<CrownCategoryId>("mr-farewell");
  const [candidateName, setCandidateName] = useState<string>(
    CANDIDATES_BY_CROWN["mr-farewell"][0] ?? ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const selectedMeta = CROWN_CATEGORIES.find((c) => c.id === crownCategory);
  const candidates = CANDIDATES_BY_CROWN[crownCategory];

  function handleCategorySwitch(nextCat: CrownCategoryId) {
    setCrownCategory(nextCat);
    setCandidateName(CANDIDATES_BY_CROWN[nextCat][0] ?? "");
    setFeedback(null);
  }

  async function handleVote(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    if (!rollNo.trim() || !voterName.trim() || !candidateName) {
      setFeedback({
        type: "error",
        text: "Please enter your Roll Number, Your Name, and select a candidate.",
      });
      return;
    }

    const localKey = `kv3_voted_${crownCategory}`;
    if (typeof window !== "undefined" && localStorage.getItem(localKey)) {
      setFeedback({
        type: "error",
        text: "This device has already cast a vote in this crown category.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollNo: rollNo.trim(),
          voterName: voterName.trim(),
          voterStream,
          crownCategory,
          candidateName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not submit vote.");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(localKey, "1");
      }

      setFeedback({
        type: "success",
        text: `Ballot recorded for ${data.vote.candidate_name} (Roll No. ${rollNo.trim()})!`,
      });
      onVoteCast(crownCategory);
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to submit vote.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <TiltCard className="overflow-hidden p-7 sm:p-9">
      <div className="mb-7 border-b border-navy/10 pb-5 dark:border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-saffron dark:text-saffron-light">
            Step 02 &bull; Official Ballot
          </span>
          <Award className="h-5 w-5 text-brass dark:text-brass-light" />
        </div>
        <h2 className="mt-2 font-serif text-3xl font-bold text-navy dark:text-ivory sm:text-4xl">
          Mr. &amp; Miss Farewell
        </h2>
        <p className="mt-1 text-sm text-navy/75 dark:text-ivory/75">
          Only one vote is allowed per Roll Number. All votes are audited by the
          committee.
        </p>
      </div>

      <form onSubmit={handleVote} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-navy dark:text-ivory/90">
              Class XII Roll Number
            </label>
            <input
              type="text"
              required
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              placeholder="e.g., 1204"
              className="w-full rounded-xl border border-navy/20 bg-white px-4 py-3 text-sm text-navy placeholder-navy/45 outline-none transition focus:border-saffron focus:ring-2 focus:ring-saffron/20 dark:border-white/20 dark:bg-navy-deep dark:text-ivory dark:placeholder-ivory/40"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-navy dark:text-ivory/90">
              Your Full Name
            </label>
            <input
              type="text"
              required
              value={voterName}
              onChange={(e) => setVoterName(e.target.value)}
              placeholder="e.g., Aarav Sharma"
              className="w-full rounded-xl border border-navy/20 bg-white px-4 py-3 text-sm text-navy placeholder-navy/45 outline-none transition focus:border-saffron focus:ring-2 focus:ring-saffron/20 dark:border-white/20 dark:bg-navy-deep dark:text-ivory dark:placeholder-ivory/40"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-navy dark:text-ivory/90">
            Your Stream
          </label>
          <select
            value={voterStream}
            onChange={(e) => setVoterStream(e.target.value)}
            className="w-full rounded-xl border border-navy/20 bg-white px-4 py-3 text-sm text-navy outline-none transition focus:border-saffron focus:ring-2 focus:ring-saffron/20 dark:border-white/20 dark:bg-navy-deep dark:text-ivory"
          >
            {STREAMS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-navy dark:text-ivory/90">
            Crown Title
          </span>
          <div className="grid grid-cols-2 gap-3">
            {CROWN_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySwitch(cat.id)}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  crownCategory === cat.id
                    ? "border-saffron bg-saffron text-white shadow-sm"
                    : "border-navy/20 bg-white text-navy hover:border-navy/50 dark:border-white/20 dark:bg-navy-deep dark:text-ivory/85 dark:hover:border-brass-light/60"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {selectedMeta && (
            <p className="mt-1.5 text-xs italic text-navy/65 dark:text-ivory/65">
              &ldquo;{selectedMeta.tagline}&rdquo;
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-navy dark:text-ivory/90">
            Select Candidate
          </label>
          <select
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            className="w-full rounded-xl border border-navy/20 bg-white px-4 py-3 text-sm text-navy outline-none transition focus:border-saffron focus:ring-2 focus:ring-saffron/20 dark:border-white/20 dark:bg-navy-deep dark:text-ivory"
          >
            {candidates.map((cand) => (
              <option key={cand} value={cand}>
                {cand}
              </option>
            ))}
          </select>
        </div>

        {feedback && (
          <div
            className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-sm ${
              feedback.type === "success"
                ? "border-emerald-700/30 bg-emerald-50 text-emerald-950 dark:border-emerald-400/30 dark:bg-emerald-950/60 dark:text-emerald-200"
                : "border-crimson/30 bg-rose-50 text-crimson dark:border-rose-400/30 dark:bg-rose-950/60 dark:text-rose-200"
            }`}
          >
            {feedback.type === "success" && (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-saffron px-5 py-3.5 text-sm font-semibold tracking-wide text-white transition hover:bg-saffron-dark disabled:opacity-60"
        >
          {submitting ? "Recording Ballot..." : "Cast Official Vote"}
        </button>
      </form>
    </TiltCard>
  );
}
