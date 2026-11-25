"use client";

import { useState } from "react";
import { CheckCircle2, Sparkles, UserCheck } from "lucide-react";
import TiltCard from "./TiltCard";
import { CLASS_SECTIONS, STREAMS } from "@/lib/constants";

interface ParticipantFormProps {
  onRegistered?: () => void;
}

export default function ParticipantForm({ onRegistered }: ParticipantFormProps) {
  const [name, setName] = useState("");
  const [classSection, setClassSection] = useState<string>(CLASS_SECTIONS[0]);
  const [stream, setStream] = useState<string>(STREAMS[0]);
  const [willingToPay, setWillingToPay] = useState<"yes" | "no" | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    if (!name.trim() || !willingToPay) {
      setFeedback({
        type: "error",
        text: "Please enter your name and choose Yes or No for Willing to Pay.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          classSection,
          stream,
          willingToPay: willingToPay === "yes",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not save registration.");
      }

      setFeedback({
        type: "success",
        text: `You're on the KV3 Farewell list, ${name.trim()}!${
          data.mode === "demo"
            ? " (Preview mode: connect Supabase to persist permanently.)"
            : ""
        }`,
      });
      setName("");
      setWillingToPay("");
      onRegistered?.();
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <TiltCard className="p-7 sm:p-9 shadow-glow">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-400/15 text-gold-400">
          <UserCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-white">
            Participant Registration
          </h2>
          <p className="text-sm text-zinc-400">
            Confirm your spot for the Class XII Farewell Party
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Aarav Sharma"
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-gold-400/70 focus:ring-2 focus:ring-gold-400/20"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Class &amp; Section
            </label>
            <select
              value={classSection}
              onChange={(e) => setClassSection(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400/70"
            >
              {CLASS_SECTIONS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Stream
            </label>
            <select
              value={stream}
              onChange={(e) => setStream(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-gold-400/70"
            >
              {STREAMS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Willing to Pay Contribution?
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setWillingToPay("yes")}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                willingToPay === "yes"
                  ? "border-gold-400 bg-gold-400/20 text-gold-300 shadow-glow"
                  : "border-white/10 bg-black/30 text-zinc-300 hover:border-white/25"
              }`}
            >
              Yes, I&apos;m in
            </button>
            <button
              type="button"
              onClick={() => setWillingToPay("no")}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                willingToPay === "no"
                  ? "border-purple-400 bg-purple-500/20 text-purple-200"
                  : "border-white/10 bg-black/30 text-zinc-300 hover:border-white/25"
              }`}
            >
              No
            </button>
          </div>
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
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-400 via-amber-400 to-yellow-500 px-5 py-3.5 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4" />
          {submitting ? "Saving Registration..." : "Confirm Farewell Entry"}
        </button>
      </form>
    </TiltCard>
  );
}
