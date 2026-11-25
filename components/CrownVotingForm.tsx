"use client";

import { useState } from "react";
import { Award, CheckCircle2 } from "lucide-react";
import TiltCard from "./TiltCard";
import { CLASS_SECTIONS, CROWN_CATEGORIES } from "@/lib/constants";

interface CrownVotingFormProps {
  knownCandidates: string[];
  onVoteCast: (category: string) => void;
}

export default function CrownVotingForm({
  knownCandidates,
  onVoteCast,
}: CrownVotingFormProps) {
  const [voterName, setVoterName] = useState("");
  const [voterClass, setVoterClass] = useState<string>(CLASS_SECTIONS[0]);
  const [crownCategory, setCrownCategory] = useState<string>(
    CROWN_CATEGORIES[0].id
  );
  const [candidateName, setCandidateName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const selectedMeta = CROWN_CATEGORIES.find((c) => c.id === crownCategory);

  async function handleVote(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    if (!voterName.trim() || !candidateName.trim()) {
      setFeedback({
        type: "error",
        text: "Please enter both your name and the candidate you are nominating.",
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
          voterName: voterName.trim(),
          voterClass,
          crownCategory,
          candidateName: candidateName.trim(),
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
        text: `Ballot recorded for ${data.vote.candidate_name}!`,
      });
      setCandidateName("");
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
      <div className="mb-7 border-b border-navy/10 pb-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-saffron">
            Step 02 &bull; Official Ballot
          </span>
          <Award className="h-5 w-5 text-brass" />
        </div>
        <h2 className="mt-2 font-serif text-3xl font-bold text-navy sm:text-4xl">
          KV Farewell Crowns
        </h2>
        <p className="mt-1 text-sm text-navy/65">
          Cast one verified vote per title for the Class XII crowning ceremony.
        </p>
      </div>

      <form onSubmit={handleVote} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy/80">
              Your Name (Voter)
            </label>
            <input
              type="text"
              required
              value={voterName}
              onChange={(e) => setVoterName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm text-navy placeholder-navy/35 outline-none transition focus:border-saffron focus:ring-2 focus:ring-saffron/15"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy/80">
              Your Class
            </label>
            <select
              value={voterClass}
              onChange={(e) => setVoterClass(e.target.value)}
              className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm text-navy outline-none transition focus:border-saffron focus:ring-2 focus:ring-saffron/15"
            >
              {CLASS_SECTIONS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy/80">
            Crown Title
          </label>
          <select
            value={crownCategory}
            onChange={(e) => setCrownCategory(e.target.value)}
            className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm text-navy outline-none transition focus:border-saffron focus:ring-2 focus:ring-saffron/15"
          >
            {CROWN_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
          {selectedMeta && (
            <p className="mt-1.5 text-xs italic text-navy/55">
              &ldquo;{selectedMeta.tagline}&rdquo;
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy/80">
            Candidate You Are Voting For
          </label>
          <input
            type="text"
            list="known-candidates-list"
            required
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            placeholder="Type candidate's full name"
            className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm text-navy placeholder-navy/35 outline-none transition focus:border-saffron focus:ring-2 focus:ring-saffron/15"
          />
          <datalist id="known-candidates-list">
            {knownCandidates.map((cand) => (
              <option key={cand} value={cand} />
            ))}
          </datalist>
          <p className="mt-1.5 text-xs text-navy/50">
            Minor spacing and capitalization differences are merged automatically
            in the tally.
          </p>
        </div>

        {feedback && (
          <div
            className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-sm ${
              feedback.type === "success"
                ? "border-emerald-700/25 bg-emerald-50 text-emerald-900"
                : "border-crimson/25 bg-rose-50 text-crimson"
            }`}
          >
            {feedback.type === "success" && (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-saffron px-5 py-3.5 text-sm font-semibold tracking-wide text-white transition hover:bg-saffron-dark disabled:opacity-60"
        >
          {submitting ? "Recording Ballot..." : "Cast Official Crown Vote"}
        </button>
      </form>
    </TiltCard>
  );
}
