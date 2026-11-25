import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { demoParticipants } from "@/lib/demoStore";

export async function GET() {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    const willingCount = demoParticipants.filter((p) => p.willing_to_pay).length;
    return NextResponse.json({
      mode: "demo",
      total: demoParticipants.length,
      willingToPayCount: willingCount,
      participants: demoParticipants,
    });
  }

  const { data, error } = await supabase
    .from("participants")
    .select("id, name, class_section, stream, willing_to_pay, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const list = data ?? [];
  const willingToPayCount = list.filter((p) => p.willing_to_pay).length;

  return NextResponse.json({
    mode: "supabase",
    total: list.length,
    willingToPayCount,
    participants: list,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const classSection = String(body.classSection ?? "").trim();
    const stream = String(body.stream ?? "").trim();
    const willingToPay =
      body.willingToPay === true || body.willingToPay === "yes";

    if (!name || !classSection || !stream) {
      return NextResponse.json(
        { error: "Please fill in Name, Class, Stream, and Willing to Pay." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    if (!supabase) {
      const record = {
        id: crypto.randomUUID(),
        name,
        class_section: classSection,
        stream,
        willing_to_pay: willingToPay,
        created_at: new Date().toISOString(),
      };
      demoParticipants.unshift(record);
      return NextResponse.json(
        { mode: "demo", participant: record },
        { status: 201 }
      );
    }

    const { data, error } = await supabase
      .from("participants")
      .insert({
        name,
        class_section: classSection,
        stream,
        willing_to_pay: willingToPay,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { mode: "supabase", participant: data },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }
}
