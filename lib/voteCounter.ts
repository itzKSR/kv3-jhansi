export interface VoteRecord {
  candidate_name: string;
  crown_category: string;
}

export interface CandidateTally {
  candidate: string;
  key: string;
  votes: number;
  percentage: number;
}

/**
 * Normalizes a candidate name so minor casing/spacing differences
 * (e.g. "Rohan  Sharma ", "rohan sharma") count toward the same candidate.
 */
export function normalizeCandidateKey(rawName: string): string {
  return rawName.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Formats a normalized key into clean Title Case for chart display.
 */
export function formatDisplayName(rawName: string): string {
  return rawName
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) =>
      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ""
    )
    .join(" ");
}

/**
 * Counts votes for every candidate (optionally filtered by crown category)
 * and returns a sorted array ready for Recharts.
 */
export function countVotesByCandidate(
  votes: VoteRecord[],
  crownCategory?: string
): { totalVotes: number; results: CandidateTally[] } {
  const filtered =
    crownCategory && crownCategory !== "all"
      ? votes.filter((v) => v.crown_category === crownCategory)
      : votes;

  const counts = new Map<string, { display: string; votes: number }>();

  for (const row of filtered) {
    const key = normalizeCandidateKey(row.candidate_name);
    if (!key) continue;

    const existing = counts.get(key);
    if (existing) {
      existing.votes += 1;
    } else {
      counts.set(key, {
        display: formatDisplayName(row.candidate_name),
        votes: 1,
      });
    }
  }

  const totalVotes = filtered.length;
  const results: CandidateTally[] = Array.from(counts.entries())
    .map(([key, value]) => ({
      key,
      candidate: value.display,
      votes: value.votes,
      percentage:
        totalVotes > 0 ? Math.round((value.votes / totalVotes) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.votes - a.votes || a.candidate.localeCompare(b.candidate));

  return { totalVotes, results };
}
