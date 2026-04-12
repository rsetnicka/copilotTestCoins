import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { coins, userCustomCoins } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { CUSTOM_COIN_STORAGE_BUCKET } from "@/lib/custom-coin-constants";
import { compressCoinPhoto } from "@/lib/compress-coin-image";

const MAX_NAME = 200;
const MAX_DESC = 2000;
const MAX_COUNTRY_LEN = 120;
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

function parseYear(raw: string | null): number | null {
  if (raw == null || raw.trim() === "") return null;
  const y = Number.parseInt(raw.trim(), 10);
  if (!Number.isFinite(y) || y < 1800 || y > 2100) return null;
  return y;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const name = String(form.get("name") ?? "").trim();
  const descriptionRaw = form.get("description");
  const description =
    descriptionRaw == null || String(descriptionRaw).trim() === ""
      ? null
      : String(descriptionRaw).trim();
  const country = String(form.get("country") ?? "").trim();
  const countryCode = String(form.get("countryCode") ?? "").trim().toUpperCase();
  const yearRaw = String(form.get("year") ?? "").trim();
  const year = parseYear(yearRaw === "" ? null : yearRaw);
  if (yearRaw !== "" && year == null) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

  const file = form.get("image");
  if (!name || name.length > MAX_NAME) {
    return NextResponse.json({ error: "Name is required (max 200 characters)." }, { status: 400 });
  }
  if (description && description.length > MAX_DESC) {
    return NextResponse.json({ error: "Description is too long." }, { status: 400 });
  }
  if (!country || country.length > MAX_COUNTRY_LEN) {
    return NextResponse.json({ error: "Country is required." }, { status: 400 });
  }
  if (!countryCode || countryCode.length > 8) {
    return NextResponse.json({ error: "Invalid country code." }, { status: 400 });
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Image file is required." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Image is too large (max 15 MB before processing)." }, { status: 413 });
  }

  const allowedRows = await db
    .selectDistinct({ country: coins.country, countryCode: coins.countryCode })
    .from(coins);
  const allowedPairs = new Set(allowedRows.map((r) => `${r.countryCode}\t${r.country}`));

  if (countryCode === "OT") {
    if (!country) {
      return NextResponse.json({ error: "Country name is required." }, { status: 400 });
    }
  } else if (!allowedPairs.has(`${countryCode}\t${country}`)) {
    return NextResponse.json({ error: "Unknown country selection." }, { status: 400 });
  }

  const mime = file.type.toLowerCase();
  if (
    !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mime)
  ) {
    return NextResponse.json(
      { error: "Unsupported image type. Use JPEG, PNG, WebP, or GIF." },
      { status: 400 }
    );
  }

  const id = crypto.randomUUID();
  const imagePath = `${user.id}/${id}.webp`;
  const raw = Buffer.from(await file.arrayBuffer());

  let webp: Buffer;
  try {
    webp = await compressCoinPhoto(raw);
  } catch {
    return NextResponse.json({ error: "Could not process image." }, { status: 400 });
  }

  const bucket = CUSTOM_COIN_STORAGE_BUCKET;
  const { error: upErr } = await supabase.storage.from(bucket).upload(imagePath, webp, {
    contentType: "image/webp",
    upsert: false,
  });
  if (upErr) {
    console.error("custom-coins upload:", upErr.message);
    return NextResponse.json(
      {
        error:
          "Storage upload failed. In Supabase, create a public bucket named custom-coins and run the policies in supabase/custom-coins-storage.sql (Dashboard → SQL).",
      },
      { status: 502 }
    );
  }

  try {
    await db.insert(userCustomCoins).values({
      id,
      userId: user.id,
      name,
      description,
      country,
      countryCode,
      year,
      imagePath,
    });
  } catch (e) {
    await supabase.storage.from(bucket).remove([imagePath]);
    console.error("custom-coins db insert:", e);
    return NextResponse.json({ error: "Could not save coin." }, { status: 500 });
  }

  revalidatePath("/collection");
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

  const row = await db.query.userCustomCoins.findFirst({
    where: and(eq(userCustomCoins.id, id), eq(userCustomCoins.userId, user.id)),
  });
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.delete(userCustomCoins).where(and(eq(userCustomCoins.id, id), eq(userCustomCoins.userId, user.id)));

  const bucket = CUSTOM_COIN_STORAGE_BUCKET;
  const { error: rmErr } = await supabase.storage.from(bucket).remove([row.imagePath]);
  if (rmErr) {
    console.error("custom-coins storage remove:", rmErr.message);
  }

  revalidatePath("/collection");
  return NextResponse.json({ ok: true });
}
