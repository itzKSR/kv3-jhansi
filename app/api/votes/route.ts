import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { demoVotes } from "@/lib/demoStore";
import { CANDIDATES_BY_CROWN, type CrownCategoryId } from "@/lib/constants";
import {
  countVotesByCandidate,
  formatDisplayName,
  normalizeCandidateKey,
} from "@/lib/voteCounter";

function getAdminPasscode(): string {
  return (
    process.env.ADMIN_PASSCODE ||
    process.env.NEXT_PUBLIC_ADMIN_PASSCODE ||
    "kv3admin"
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "mr-farewell";
  const includeAudit = searchParams.get("audit") === "1";

  if (includeAudit) {
    const provided = request.headers.get("x-admin-passcode") ?? "";
    if (provided !== getAdminPasscode()) {
      return NextResponse.json(
        { error: "Incorrect admin passcode." },
        { status: 401 }
      );
    }
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    const tally = countVotesByCandidate(demoVotes, category);
    return NextResponse.json({
      mode: "demo",
      category,
      ...tally,
      ...(includeAudit
        ? {
            auditVotes: demoVotes.map((v) => ({
              id: v.id,
              roll_no: v.voter_name,
              voter_name: v.voter_name,
              voter_stream: v.voter_class,
              crown_category: v.crown_category,
              candidate_name: v.candidate_name,
              created_at: v.created_at,
            })),
          }
        : {}),
    });
  }

  const selectCols = includeAudit
    ? "id, roll_no, voter_name, voter_stream, crown_category, candidate_name, created_at"
    : "candidate_name, crown_category";

  const { data, error } = await supabase
    .from("votes")
    .select(selectCols)
    .in("crown_category", ["mr-farewell", "miss-farewell"])
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as unknown as Array<{
    id?: string;
    roll_no?: string;
    voter_name?: string;
    voter_stream?: string;
    crown_category: string;
    candidate_name: string;
    created_at?: string;
  }>;

  const tally = countVotesByCandidate(rows, category);

  return NextResponse.json({
    mode: "supabase",
    category,
    ...tally,
    ...(includeAudit ? { auditVotes: rows } : {}),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rollNo = String(body.rollNo ?? "").trim().toUpperCase();
    const voterName = String(body.voterName ?? "").trim();
    const voterStream = String(body.voterStream ?? "").trim();
    const crownCategory = String(body.crownCategory ?? "").trim() as CrownCategoryId;
    const candidateNameRaw = String(body.candidateName ?? "").trim();

    if (
      crownCategory !== "mr-farewell" &&
      crownCategory !== "miss-farewell"
    ) {
      return NextResponse.json(
        { error: "Voting is only open for Mr. Farewell and Miss Farewell." },
        { status: 400 }
      );
    }

    if (!rollNo || !voterName || !voterStream || !candidateNameRaw) {
      return NextResponse.json(
        { error: "Roll Number, Your Name, Stream, and Candidate are required." },
        { status: 400 }
      );
    }

    const allowedCandidates = CANDIDATES_BY_CROWN[crownCategory];
    if (!allowedCandidates || !allowedCandidates.includes(candidateNameRaw)) {
      return NextResponse.json(
        { error: "Please select a valid candidate from the dropdown." },
        { status: 400 }
      );
    }

    const candidateKey = normalizeCandidateKey(candidateNameRaw);
    const candidateName = formatDisplayName(candidateNameRaw);
    const supabase = getSupabaseServerClient();

    if (!supabase) {
      const duplicate = demoVotes.some(
        (v) =>
          v.voter_name.toUpperCase() === rollNo &&
          v.crown_category === crownCategory
      );
      if (duplicate) {
        return NextResponse.json(
          { error: `Roll No. ${rollNo} has already voted in this category.` },
          { status: 409 }
        );
      }

      const record = {
        id: crypto.randomUUID(),
        voter_name: `${rollNo} - ${voterName}`,
        voter_class: voterStream,
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
        roll_no: rollNo,
        voter_name: voterName,
        voter_stream: voterStream,
        crown_category: crownCategory,
        candidate_name: candidateName,
        candidate_key: candidateKey,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: `Roll No. ${rollNo} has already voted in this category.` },
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

export async function DELETE(request: Request) {
  const provided = request.headers.get("x-admin-passcode") ?? "";
  if (provided !== getAdminPasscode()) {
    return NextResponse.json(
      { error: "Unauthorized. Invalid admin passcode." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const voteId = searchParams.get("id");
  if (!voteId) {
    return NextResponse.json({ error: "Missing vote id." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    const idx = demoVotes.findIndex((v) => v.id === voteId);
    if (idx !== -1) demoVotes.splice(idx, 1);
    return NextResponse.json({ deleted: true });
  }

  const { error } = await supabase.from("votes").delete().eq("id", voteId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
