"use client";

import { useState } from "react";
import { CheckCircle2, ClipboardCheck, Sparkles } from "lucide-react";
import TiltCard from "./TiltCard";
import { STREAMS } from "@/lib/constants";

const SCHOOL_LOGO_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQnNkkFI2cqfvb085dubJIIm0VRZ-N_Vu8NLog3QZeig&s";

interface ParticipantFormProps {
  onRegistered?: () => void;
}

export default function ParticipantForm({ onRegistered }: ParticipantFormProps) {
  const [name, setName] = useState("");
  const [stream, setStream] = useState<string>(STREAMS[0]);
  const [willingToPay, setWillingToPay] = useState<"yes" | "no" | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [issuedPass, setIssuedPass] = useState<{
    name: string;
    stream: string;
    willingToPay: boolean;
  } | null>(null);
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
        text: "Please enter your full name and select Yes or No for Willing to Pay.",
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
          stream,
          willingToPay: willingToPay === "yes",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not save registration.");
      }

      setIssuedPass({
        name: name.trim(),
        stream,
        willingToPay: willingToPay === "yes",
      });
      setFeedback({
        type: "success",
        text: `RSVP confirmed for ${name.trim()} (${stream})!`,
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
    <TiltCard className="overflow-hidden p-7 sm:p-9">
      <div className="mb-7 border-b border-navy/10 pb-5 dark:border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-saffron dark:text-saffron-light">
            Step 01 &bull; Class XII Attendance
          </span>
          <ClipboardCheck className="h-5 w-5 text-navy/70 dark:text-brass-light" />
        </div>
        <h2 className="mt-2 font-serif text-3xl font-bold text-navy dark:text-ivory sm:text-4xl">
          Student RSVP Form
        </h2>
        <p className="mt-1 text-sm text-navy/75 dark:text-ivory/75">
          Confirm your Class XII details to receive your digital Farewell Pass.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-navy dark:text-ivory/90">
            Student Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Aarav Sharma"
            className="w-full rounded-xl border border-navy/20 bg-white px-4 py-3 text-sm text-navy placeholder-navy/45 outline-none transition focus:border-saffron focus:ring-2 focus:ring-saffron/20 dark:border-white/20 dark:bg-navy-deep dark:text-ivory dark:placeholder-ivory/40"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-navy dark:text-ivory/90">
            Stream
          </label>
          <select
            value={stream}
            onChange={(e) => setStream(e.target.value)}
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
            Willing to Pay Farewell Contribution?
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setWillingToPay("yes")}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                willingToPay === "yes"
                  ? "border-navy bg-navy text-ivory shadow-sm dark:border-brass-light dark:bg-brass-light dark:text-navy-deep"
                  : "border-navy/20 bg-white text-navy hover:border-navy/50 dark:border-white/20 dark:bg-navy-deep dark:text-ivory/85 dark:hover:border-brass-light/60"
              }`}
            >
              Yes, Willing to Pay
            </button>
            <button
              type="button"
              onClick={() => setWillingToPay("no")}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                willingToPay === "no"
                  ? "border-saffron bg-saffron text-white shadow-sm"
                  : "border-navy/20 bg-white text-navy hover:border-navy/50 dark:border-white/20 dark:bg-navy-deep dark:text-ivory/85 dark:hover:border-saffron/60"
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
          className="w-full rounded-xl bg-navy px-5 py-3.5 text-sm font-semibold tracking-wide text-ivory transition hover:bg-navy-soft disabled:opacity-60 dark:bg-brass-light dark:text-navy-deep dark:hover:bg-brass"
        >
          {submitting ? "Saving RSVP..." : "Submit Farewell Registration"}
        </button>
      </form>

      {/* Personalized Digital Class XII Participant Pass */}
      {issuedPass && (
        <div className="navy-surface mt-6 rounded-2xl p-5 text-ivory shadow-crest">
          <div className="flex items-center justify-between border-b border-ivory/15 pb-3">
            <div className="flex items-center gap-2.5">
              <img
                src={SCHOOL_LOGO_URL}
                alt="KV3 Jhansi"
                className="h-9 w-9 rounded-full bg-white p-0.5 object-contain"
              />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brass-light">
                  PM SHRI KV No. 3, Jhansi
                </p>
                <p className="font-serif text-base font-bold text-ivory">
                  Farewell Participant Pass
                </p>
              </div>
            </div>
            <Sparkles className="h-4 w-4 text-brass-light" />
          </div>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-ivory/60">
                Participant
              </p>
              <p className="font-serif text-2xl font-bold text-ivory">
                {issuedPass.name}
              </p>
              <p className="mt-0.5 text-xs text-saffron-light">
                Class XII &bull; {issuedPass.stream}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                issuedPass.willingToPay
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                  : "bg-white/10 text-ivory/80 border border-white/20"
              }`}
            >
              {issuedPass.willingToPay ? "Contribution: Yes" : "Contribution: No"}
            </span>
          </div>
        </div>
      )}
    </TiltCard>
  );
}
