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
import { CROWN_CATEGORIES } from "@/lib/constants";
import type { CandidateTally } from "@/lib/voteCounter";

interface VoteGraphProps {
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  results: CandidateTally[];
  totalVotes: number;
  loading: boolean;
  onRefresh: () => void;
}

const BAR_COLORS = ["#facc15", "#e879f9", "#38bdf8", "#34d399", "#fb923c"];

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

  const activeCrown = CROWN_CATEGORIES.find((c) => c.id === selectedCategory);

  if (!unlocked) {
    return (
      <div className="glass-card rounded-3xl p-8 text-center">
        <Lock className="mx-auto mb-3 h-8 w-8 text-gold-400" />
        <h3 className="font-display text-xl font-bold text-white">
          Organizer-Locked Live Results
        </h3>
        <p className="mt-1 text-sm text-zinc-400">
          Enter the organizer passcode to view the crown vote graph.
        </p>
        <div className="mx-auto mt-5 flex max-w-xs gap-2">
          <input
            type="password"
            value={enteredPasscode}
            onChange={(e) => setEnteredPasscode(e.target.value)}
            placeholder="Passcode"
            className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-sm text-white outline-none focus:border-gold-400"
          />
          <button
            type="button"
            onClick={() => {
              if (enteredPasscode === requiredPasscode) setUnlocked(true);
            }}
            className="rounded-xl bg-gold-400 px-4 py-2.5 text-sm font-bold text-black"
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-7 sm:p-9">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-300">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-white">
              Live Crown Vote Tally
            </h2>
            <p className="text-sm text-zinc-400">
              {activeCrown?.label} &bull; {totalVotes} total{" "}
              {totalVotes === 1 ? "vote" : "votes"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:border-gold-400/50 hover:text-gold-300"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Tally
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CROWN_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onCategoryChange(cat.id)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              selectedCategory === cat.id
                ? "bg-gold-400 text-black"
                : "border border-white/10 bg-black/30 text-zinc-300 hover:border-white/30"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {results.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 text-center">
          <Trophy className="mb-2 h-8 w-8 text-zinc-600" />
          <p className="text-sm font-medium text-zinc-300">
            No votes cast for {activeCrown?.label} yet.
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Cast the first vote above to see the live graph animate!
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Leaderboard Strip */}
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {results.slice(0, 3).map((item, idx) => (
              <div
                key={item.key}
                className="rounded-2xl border border-white/10 bg-black/35 p-4"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-gold-400">
                  #{idx + 1} Contender
                </span>
                <p className="mt-1 truncate font-display text-lg font-bold text-white">
                  {item.candidate}
                </p>
                <p className="text-xs text-zinc-400">
                  {item.votes} {item.votes === 1 ? "vote" : "votes"} (
                  {item.percentage}%)
                </p>
              </div>
            ))}
          </div>

          {/* Recharts Bar Graph */}
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={results}
                margin={{ top: 10, right: 20, left: 0, bottom: 25 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.08)"
                />
                <XAxis
                  dataKey="candidate"
                  stroke="#a1a1aa"
                  tick={{ fill: "#d4d4d8", fontSize: 12 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  allowDecimals={false}
                  stroke="#a1a1aa"
                  tick={{ fill: "#d4d4d8", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  contentStyle={{
                    backgroundColor: "#0f1018",
                    border: "1px solid rgba(250,204,21,0.35)",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="votes" name="Votes" radius={[10, 10, 0, 0]}>
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
