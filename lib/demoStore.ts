/**
 * Lightweight fallback store used ONLY when Supabase env vars are not set yet
 * so you can preview the animations, form, and vote graph immediately.
 * In production on Vercel, connect Supabase so data persists permanently.
 */
export interface DemoParticipant {
  id: string;
  name: string;
  class_section: string;
  stream: string;
  willing_to_pay: boolean;
  created_at: string;
}

export interface DemoVote {
  id: string;
  voter_name: string;
  voter_class: string;
  crown_category: string;
  candidate_name: string;
  candidate_key: string;
  created_at: string;
}

const globalForDemo = globalThis as unknown as {
  kv3DemoParticipants?: DemoParticipant[];
  kv3DemoVotes?: DemoVote[];
};

export const demoParticipants: DemoParticipant[] =
  globalForDemo.kv3DemoParticipants ?? [];
globalForDemo.kv3DemoParticipants = demoParticipants;

export const demoVotes: DemoVote[] = globalForDemo.kv3DemoVotes ?? [];
globalForDemo.kv3DemoVotes = demoVotes;
