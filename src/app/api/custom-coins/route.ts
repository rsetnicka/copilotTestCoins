import { NextResponse } from "next/server";
import { revalidateCollectionPages } from "@/lib/revalidate-collection";
import { createClient } from "@/lib/supabase/server";
import {
  isValidCustomCoinImagePath,
  isUuid,
  validateCustomCoinTextFields,
} from "@/app/api/custom-coins/validate-custom-coin";

function readJsonRecord(request: Request): Promise<Record<string, unknown>> {
  return request.json().then((body) => {
    if (body == null || typeof body !== "object" || Array.isArray(body)) {
      throw new SyntaxError("Invalid JSON body");
    }
    return body as Record<string, unknown>;
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await readJsonRecord(request);
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id.trim() : "";
  const imagePath = typeof body.imagePath === "string" ? body.imagePath.trim() : "";
  if (!isUuid(id) || !isValidCustomCoinImagePath(user.id, id, imagePath)) {
    return NextResponse.json(
      { error: "Invalid id or imagePath. Upload the image from the app (browser) first." },
      { status: 400 }
    );
  }

  const descriptionIn =
    body.description === null || body.description === undefined
      ? null
      : String(body.description);
  const parsed = await validateCustomCoinTextFields({
    name: String(body.name ?? ""),
    description: descriptionIn,
    country: String(body.country ?? ""),
    countryCode: String(body.countryCode ?? ""),
    yearRaw: String(body.year ?? ""),
  });
  if (!parsed.ok) return parsed.res;
  const { name, description, country, countryCode, year } = parsed;

  const nowIso = new Date().toISOString();
  const { error: insErr } = await supabase.from("user_custom_coins").insert({
    id,
    user_id: user.id,
    name,
    description,
    country,
    country_code: countryCode,
    year,
    image_path: imagePath,
    updated_at: nowIso,
  });

  if (insErr) {
    console.error("custom-coins insert:", insErr.message);
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  revalidateCollectionPages();
  return NextResponse.json({ ok: true, id });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await readJsonRecord(request);
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id) {
    return NextResponse.json({ error: "Coin id is required." }, { status: 400 });
  }

  const { data: existing, error: exErr } = await supabase
    .from("user_custom_coins")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (exErr) {
    console.error("custom-coins patch select:", exErr.message);
    return NextResponse.json({ error: exErr.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const descriptionIn =
    body.description === null || body.description === undefined
      ? null
      : String(body.description);
  const parsed = await validateCustomCoinTextFields({
    name: String(body.name ?? ""),
    description: descriptionIn,
    country: String(body.country ?? ""),
    countryCode: String(body.countryCode ?? ""),
    yearRaw: String(body.year ?? ""),
  });
  if (!parsed.ok) return parsed.res;
  const { name, description, country, countryCode, year } = parsed;

  const { error: updErr } = await supabase
    .from("user_custom_coins")
    .update({
      name,
      description,
      country,
      country_code: countryCode,
      year,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updErr) {
    console.error("custom-coins update:", updErr.message);
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  revalidateCollectionPages();
  return NextResponse.json({ ok: true, id });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id query parameter is required" }, { status: 400 });
  }

  const { data: row, error: selErr } = await supabase
    .from("user_custom_coins")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (selErr) {
    console.error("custom-coins delete select:", selErr.message);
    return NextResponse.json({ error: selErr.message }, { status: 500 });
  }
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error: delErr } = await supabase.from("user_custom_coins").delete().eq("id", id).eq("user_id", user.id);

  if (delErr) {
    console.error("custom-coins delete:", delErr.message);
    return NextResponse.json({ error: delErr.message }, { status: 500 });
  }

  revalidateCollectionPages();
  return NextResponse.json({ ok: true });
}