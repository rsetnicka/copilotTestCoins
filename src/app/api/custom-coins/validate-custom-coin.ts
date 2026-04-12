import { NextResponse } from "next/server";
import { db } from "@/db";
import { coins } from "@/db/schema";

const MAX_NAME = 200;
const MAX_DESC = 2000;
const MAX_COUNTRY_LEN = 120;

function parseYear(raw: string | null): number | null {
  if (raw == null || raw.trim() === "") return null;
  const y = Number.parseInt(raw.trim(), 10);
  if (!Number.isFinite(y) || y < 1800 || y > 2100) return null;
  return y;
}

export type ParsedCustomCoinText =
  | { ok: false; res: NextResponse }
  | {
      ok: true;
      name: string;
      description: string | null;
      country: string;
      countryCode: string;
      year: number | null;
    };

export async function validateCustomCoinTextFields(input: {
  name: string;
  description: string | null | undefined;
  country: string;
  countryCode: string;
  yearRaw: string;
}): Promise<ParsedCustomCoinText> {
  const name = input.name.trim();
  const description =
    input.description == null || String(input.description).trim() === ""
      ? null
      : String(input.description).trim();
  const country = input.country.trim();
  const countryCode = input.countryCode.trim().toUpperCase();
  const yearRaw = input.yearRaw.trim();
  const year = parseYear(yearRaw === "" ? null : yearRaw);
  if (yearRaw !== "" && year == null) {
    return { ok: false, res: NextResponse.json({ error: "Invalid year" }, { status: 400 }) };
  }

  if (!name || name.length > MAX_NAME) {
    return {
      ok: false,
      res: NextResponse.json({ error: "Name is required (max 200 characters)." }, { status: 400 }),
    };
  }
  if (description && description.length > MAX_DESC) {
    return { ok: false, res: NextResponse.json({ error: "Description is too long." }, { status: 400 }) };
  }
  if (!country || country.length > MAX_COUNTRY_LEN) {
    return { ok: false, res: NextResponse.json({ error: "Country is required." }, { status: 400 }) };
  }
  if (!countryCode || countryCode.length > 8) {
    return { ok: false, res: NextResponse.json({ error: "Invalid country code." }, { status: 400 }) };
  }

  const allowedRows = await db
    .selectDistinct({ country: coins.country, countryCode: coins.countryCode })
    .from(coins);
  const allowedPairs = new Set(allowedRows.map((r) => `${r.countryCode}\t${r.country}`));

  if (countryCode === "OT") {
    if (!country) {
      return { ok: false, res: NextResponse.json({ error: "Country name is required." }, { status: 400 }) };
    }
  } else if (!allowedPairs.has(`${countryCode}\t${country}`)) {
    return { ok: false, res: NextResponse.json({ error: "Unknown country selection." }, { status: 400 }) };
  }

  return { ok: true, name, description, country, countryCode, year };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(s: string): boolean {
  return UUID_RE.test(s);
}

/** Object path must be `{userId}/{id}.webp` (same id as DB row / file). */
export function isValidCustomCoinImagePath(userId: string, rowId: string, imagePath: string): boolean {
  if (!isUuid(rowId)) return false;
  const expected = `${userId}/${rowId}.webp`;
  return imagePath === expected;
}
