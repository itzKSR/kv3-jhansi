import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { demoVotes } from "@/lib/demoStore";
import {
  countVotesByCandidate,
  formatDisplayName,
  normalizeCandidateKey,
} from "@/lib/voteCounter";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "mr-farewell";

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    const tally = countVotesByCandidate(demoVotes, category);
    const knownCandidates = Array.from(
      new Set(demoVotes.map((v) => formatDisplayName(v.candidate_name)))
    ).sort();

    return NextResponse.json({
      mode: "demo",
      category,
      ...tally,
      knownCandidates,
    });
  }

  const { data, error } = await supabase
    .from("votes")
    .select("candidate_name, crown_category");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  const tally = countVotesByCandidate(rows, category);
  const knownCandidates = Array.from(
    new Set(rows.map((v) => formatDisplayName(v.candidate_name)))
  ).sort();

  return NextResponse.json({
    mode: "supabase",
    category,
    ...tally,
    knownCandidates,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const voterName = String(body.voterName ?? "").trim();
    const voterClass = String(body.voterClass ?? "").trim();
    const crownCategory = String(body.crownCategory ?? "").trim();
    const candidateNameRaw = String(body.candidateName ?? "").trim();

    if (!voterName || !voterClass || !crownCategory || !candidateNameRaw) {
      return NextResponse.json(
        { error: "All voting fields are required." },
        { status: 400 }
      );
    }

    const candidateKey = normalizeCandidateKey(candidateNameRaw);
    const candidateName = formatDisplayName(candidateNameRaw);
    const supabase = getSupabaseServerClient();

    if (!supabase) {
      const duplicate = demoVotes.some(
        (v) =>
          v.voter_name.trim().toLowerCase() === voterName.toLowerCase() &&
          v.voter_class.trim().toLowerCase() === voterClass.toLowerCase() &&
          v.crown_category === crownCategory
      );

      if (duplicate) {
        return NextResponse.json(
          { error: "You have already voted in this crown category." },
          { status: 409 }
        );
      }

      const record = {
        id: crypto.randomUUID(),
        voter_name: voterName,
        voter_class: voterClass,
        crown_category: crownCategory,
        candidate_name: candidateName,
        candidate_key: candidateKey,
        created_at: new Date().toISOString(),
      };
      demoVotes.push(record);
      return NextResponse.json({ mode: "demo", vote: record }, { status: 201 });
    }

    const { data, error } = await supabase
      .from("votes")
      .insert({
        voter_name: voterName,
        voter_class: voterClass,
        crown_category: crownCategory,
        candidate_name: candidateName,
        candidate_key: candidateKey,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "You have already cast a vote in this crown category." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ mode: "supabase", vote: data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid voting payload." },
      { status: 400 }
    );
  }
}
