import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

type VotingMode = "manual_on" | "manual_off" | "scheduled";

interface VotingSettings {
  mode: VotingMode;
  start_at: string | null;
  end_at: string | null;
}

const globalForSettings = globalThis as unknown as {
  kv3DemoVotingSettings?: VotingSettings;
};

const defaultSettings: VotingSettings = {
  mode: "manual_on",
  start_at: null,
  end_at: null,
};

function getAdminPasscode(): string {
  return (
    process.env.ADMIN_PASSCODE ||
    process.env.NEXT_PUBLIC_ADMIN_PASSCODE ||
    "kv3admin"
  );
}

function computeVotingStatus(
  settings: VotingSettings
): "open" | "upcoming" | "closed" {
  if (settings.mode === "manual_on") return "open";
  if (settings.mode === "manual_off") return "closed";

  const now = Date.now();
  const startMs = settings.start_at ? Date.parse(settings.start_at) : null;
  const endMs = settings.end_at ? Date.parse(settings.end_at) : null;

  if (startMs && now < startMs) return "upcoming";
  if (endMs && now >= endMs) return "closed";
  return "open";
}

export async function GET() {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    const settings =
      globalForSettings.kv3DemoVotingSettings ?? defaultSettings;
    return NextResponse.json({
      ...settings,
      status: computeVotingStatus(settings),
    });
  }

  const { data, error } = await supabase
    .from("voting_settings")
    .select("mode, start_at, end_at")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const settings: VotingSettings = data ?? defaultSettings;
  return NextResponse.json({
    ...settings,
    status: computeVotingStatus(settings),
  });
}

export async function POST(request: Request) {
  const provided = request.headers.get("x-admin-passcode") ?? "";
  if (provided !== getAdminPasscode()) {
    return NextResponse.json(
      { error: "Unauthorized. Invalid admin passcode." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const mode = body.mode as VotingMode;
    if (!["manual_on", "manual_off", "scheduled"].includes(mode)) {
      return NextResponse.json({ error: "Invalid mode." }, { status: 400 });
    }

    const start_at =
      mode === "scheduled" && body.start_at
        ? new Date(body.start_at).toISOString()
        : null;
    const end_at =
      mode === "scheduled" && body.end_at
        ? new Date(body.end_at).toISOString()
        : null;

    const nextSettings: VotingSettings = { mode, start_at, end_at };
    const supabase = getSupabaseServerClient();

    if (!supabase) {
      globalForSettings.kv3DemoVotingSettings = nextSettings;
      return NextResponse.json({
        ...nextSettings,
        status: computeVotingStatus(nextSettings),
      });
    }

    const { data, error } = await supabase
      .from("voting_settings")
      .upsert({
        id: 1,
        mode,
        start_at,
        end_at,
        updated_at: new Date().toISOString(),
      })
      .select("mode, start_at, end_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ...data,
      status: computeVotingStatus(data),
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid settings payload." },
      { status: 400 }
    );
  }
}
