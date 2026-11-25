"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, Lock, RefreshCw, Trophy } from "lucide-react";
import type { CandidateTally } from "@/lib/voteCounter";

interface VoteGraphProps {
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  results: CandidateTally[];
  totalVotes: number;
  loading: boolean;
  onRefresh: () => void;
}

const MR_MISS_CROWNS = [
  { id: "mr-farewell", label: "Mr. Farewell" },
  { id: "miss-farewell", label: "Miss Farewell" },
] as const;

const BAR_COLORS = ["#0F1D3A", "#D96B27", "#B88A2E", "#1E3A8A", "#9B2226"];

export default function VoteGraph({
  selectedCategory,
  onCategoryChange,
  results,
  totalVotes,
  loading,
  onRefresh,
}: VoteGraphProps) {
  const requiredPasscode = process.env.NEXT_PUBLIC_RESULTS_PASSCODE || "";
  const [enteredPasscode, setEnteredPasscode] = useState("");
  const [unlocked, setUnlocked] = useState(!requiredPasscode);

  const activeCrown =
    MR_MISS_CROWNS.find((c) => c.id === selectedCategory) ?? MR_MISS_CROWNS[0];

  if (!unlocked) {
    return (
      <div className="glass-card rounded-3xl p-10 text-center">
        <Lock className="mx-auto mb-3 h-7 w-7 text-saffron" />
        <h3 className="font-serif text-2xl font-bold text-navy">
          Organizer-Locked Vote Tally
        </h3>
        <p className="mt-1 text-sm text-navy/65">
          Enter the committee passcode to inspect live Mr. Farewell &amp; Miss
          Farewell standings.
        </p>
        <div className="mx-auto mt-5 flex max-w-xs gap-2">
          <input
            type="password"
            value={enteredPasscode}
            onChange={(e) => setEnteredPasscode(e.target.value)}
            placeholder="Passcode"
            className="w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm text-navy outline-none focus:border-saffron"
          />
          <button
            type="button"
            onClick={() => {
              if (enteredPasscode === requiredPasscode) setUnlocked(true);
            }}
            className="rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-ivory"
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-7 sm:p-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-navy/10 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-saffron">
            <BarChart3 className="h-3.5 w-3.5" />
            Live Crown Standings
          </span>
          <h2 className="mt-1.5 font-serif text-3xl font-bold text-navy sm:text-4xl">
            {activeCrown.label}
          </h2>
          <p className="mt-1 text-sm text-navy/60">
            {totalVotes} verified {totalVotes === 1 ? "ballot" : "ballots"}{" "}
            counted in this category
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-4 py-2 text-xs font-semibold text-navy transition hover:border-saffron hover:text-saffron"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Tally
        </button>
      </div>

      {/* Mr. Farewell & Miss Farewell Tabs */}
      <div className="mb-7 flex flex-wrap gap-2">
        {MR_MISS_CROWNS.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onCategoryChange(cat.id)}
            className={`rounded-full px-5 py-2.5 text-xs font-semibold transition ${
              activeCrown.id === cat.id
                ? "bg-navy text-ivory shadow-sm"
                : "border border-navy/15 bg-white text-navy/75 hover:border-navy/40"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {results.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-navy/15 bg-parchment/40 text-center">
          <Trophy className="mb-2 h-8 w-8 text-brass" />
          <p className="font-serif text-xl font-semibold text-navy">
            No ballots recorded for {activeCrown.label} yet
          </p>
          <p className="mt-1 text-xs text-navy/60">
            Submit the first vote above to see the live standings chart update.
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Honors Strip */}
          <div className="mb-7 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            {results.slice(0, 3).map((item, idx) => (
              <div
                key={item.key}
                className={`rounded-2xl border p-4 ${
                  idx === 0
                    ? "navy-surface text-ivory"
                    : "border-navy/10 bg-parchment/50 text-navy"
                }`}
              >
                <span
                  className={`text-[11px] font-bold uppercase tracking-[0.2em] ${
                    idx === 0 ? "text-brass-light" : "text-saffron"
                  }`}
                >
                  Rank 0{idx + 1}
                </span>
                <p className="mt-1 truncate font-serif text-2xl font-bold">
                  {item.candidate}
                </p>
                <p
                  className={`text-xs ${
                    idx === 0 ? "text-ivory/75" : "text-navy/65"
                  }`}
                >
                  {item.votes} {item.votes === 1 ? "vote" : "votes"} &bull;{" "}
                  {item.percentage}% share
                </p>
              </div>
            ))}
          </div>

          {/* Recharts Bar Graph */}
          <div className="h-80 w-full rounded-2xl border border-navy/10 bg-white/80 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={results}
                margin={{ top: 12, right: 20, left: 0, bottom: 28 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(15, 29, 58, 0.08)"
                />
                <XAxis
                  dataKey="candidate"
                  stroke="#0F1D3A"
                  tick={{ fill: "#0F1D3A", fontSize: 12, fontWeight: 500 }}
                  interval={0}
                  angle={-14}
                  textAnchor="end"
                />
                <YAxis
                  allowDecimals={false}
                  stroke="#0F1D3A"
                  tick={{ fill: "#475569", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(217, 107, 39, 0.08)" }}
                  contentStyle={{
                    backgroundColor: "#0F1D3A",
                    border: "1px solid #B88A2E",
                    borderRadius: "12px",
                    color: "#FAF6EE",
                  }}
                />
                <Bar dataKey="votes" name="Votes" radius={[8, 8, 0, 0]}>
                  {results.map((entry, index) => (
                    <Cell
                      key={entry.key}
                      fill={BAR_COLORS[index % BAR_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
