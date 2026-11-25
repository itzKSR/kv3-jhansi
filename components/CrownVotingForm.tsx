"use client";

import { useState } from "react";
import { CheckCircle2, Crown, Send } from "lucide-react";
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

  async function handleVote(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    if (!voterName.trim() || !candidateName.trim()) {
      setFeedback({
        type: "error",
        text: "Please enter both your name and the candidate you are voting for.",
      });
      return;
    }

    const localKey = `kv3_voted_${crownCategory}`;
    if (typeof window !== "undefined" && localStorage.getItem(localKey)) {
      setFeedback({
        type: "error",
        text: "This browser has already cast a vote for this crown category.",
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
        text: `Vote recorded for ${data.vote.candidate_name}!`,
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
    <TiltCard className="p-7 sm:p-9">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-300">
          <Crown className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-white">
            KV Crown Voting Booth
          </h2>
          <p className="text-sm text-zinc-400">
            One vote per student per crown category
          </p>
        </div>
      </div>

      <form onSubmit={handleVote} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Your Name (Voter)
            </label>
            <input
              type="text"
              required
              value={voterName}
              onChange={(e) => setVoterName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-purple-400/70"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Your Class
            </label>
            <select
              value={voterClass}
              onChange={(e) => setVoterClass(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-400/70"
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
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Select Crown Category
          </label>
          <select
            value={crownCategory}
            onChange={(e) => setCrownCategory(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-400/70"
          >
            {CROWN_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Candidate You Are Voting For
          </label>
          <input
            type="text"
            list="known-candidates-list"
            required
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            placeholder="Type candidate's full name"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-purple-400/70"
          />
          <datalist id="known-candidates-list">
            {knownCandidates.map((cand) => (
              <option key={cand} value={cand} />
            ))}
          </datalist>
          <p className="mt-1.5 text-xs text-zinc-500">
            Names are automatically normalized (case &amp; extra spaces ignored)
            when counting votes.
          </p>
        </div>

        {feedback && (
          <div
            className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-sm ${
              feedback.type === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                : "border-rose-500/40 bg-rose-500/10 text-rose-200"
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
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 px-5 py-3.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {submitting ? "Submitting Vote..." : "Cast Crown Vote"}
        </button>
      </form>
    </TiltCard>
  );
}
