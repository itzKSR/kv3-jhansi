"use client";

import { useState } from "react";
import { CheckCircle2, ClipboardCheck } from "lucide-react";
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
        text: `RSVP confirmed for ${name.trim()} (${classSection}). See you at the farewell!`,
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
      <div className="mb-7 border-b border-navy/10 pb-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-saffron">
            Step 01 &bull; Attendance Roll
          </span>
          <ClipboardCheck className="h-5 w-5 text-navy/60" />
        </div>
        <h2 className="mt-2 font-serif text-3xl font-bold text-navy sm:text-4xl">
          Student RSVP Form
        </h2>
        <p className="mt-1 text-sm text-navy/65">
          Register your Class XII details so the organizing committee can plan
          seating, passes, and refreshments.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy/80">
            Student Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Aarav Sharma"
            className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm text-navy placeholder-navy/35 outline-none transition focus:border-saffron focus:ring-2 focus:ring-saffron/15"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy/80">
              Class &amp; Section
            </label>
            <select
              value={classSection}
              onChange={(e) => setClassSection(e.target.value)}
              className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm text-navy outline-none transition focus:border-saffron focus:ring-2 focus:ring-saffron/15"
            >
              {CLASS_SECTIONS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy/80">
              Stream
            </label>
            <select
              value={stream}
              onChange={(e) => setStream(e.target.value)}
              className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-sm text-navy outline-none transition focus:border-saffron focus:ring-2 focus:ring-saffron/15"
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
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-navy/80">
            Willing to Pay Farewell Contribution?
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setWillingToPay("yes")}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                willingToPay === "yes"
                  ? "border-navy bg-navy text-ivory shadow-sm"
                  : "border-navy/15 bg-white text-navy/75 hover:border-navy/40"
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
                  : "border-navy/15 bg-white text-navy/75 hover:border-navy/40"
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
          className="w-full rounded-xl bg-navy px-5 py-3.5 text-sm font-semibold tracking-wide text-ivory transition hover:bg-navy-soft disabled:opacity-60"
        >
          {submitting ? "Saving RSVP..." : "Submit Farewell Registration"}
        </button>
      </form>
    </TiltCard>
  );
}
