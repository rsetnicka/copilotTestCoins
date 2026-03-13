import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { coins } from "./schema";
import { eq } from "drizzle-orm";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client);

const WIKI_API = "https://commons.wikimedia.org/w/api.php";
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Wikimedia API requires a descriptive User-Agent for automated scripts
const HEADERS = {
  "User-Agent": "EuroTrackerCoinImages/1.0 (https://github.com/euro-coins-tracker; coin-collection-app) node-fetch/3",
  "Accept": "application/json",
};

// Exact Wikimedia Commons category names for 2 euro coins per country
const COMMEMORATIVE_CATEGORY: Record<string, string> = {
  "Andorra":       "2 euro commemorative coins of Andorra",
  "Austria":       "2 euro commemorative coins of Austria",
  "Belgium":       "2 euro commemorative coins of Belgium",
  "Cyprus":        "2 euro commemorative coins of Cyprus",
  "Estonia":       "2 euro commemorative coins of Estonia",
  "Finland":       "2 euro commemorative coins of Finland",
  "France":        "2 euro commemorative coins of France",
  "Germany":       "2 euro commemorative coins of Germany",
  "Greece":        "2 euro commemorative coins of Greece",
  "Ireland":       "2 euro commemorative coins of Ireland",
  "Italy":         "2 euro commemorative coins of Italy",
  "Latvia":        "2 euro commemorative coins of Latvia",
  "Lithuania":     "2 euro commemorative coins of Lithuania",
  "Luxembourg":    "2 euro commemorative coins of Luxembourg",
  "Malta":         "2 euro commemorative coins of Malta",
  "Monaco":        "2 euro commemorative coins of Monaco",
  "Netherlands":   "2 euro commemorative coins of the Netherlands",
  "Portugal":      "2 euro commemorative coins of Portugal",
  "San Marino":    "2 euro commemorative coins of San Marino",
  "Slovakia":      "2 euro commemorative coins of Slovakia",
  "Slovenia":      "2 euro commemorative coins of Slovenia",
  "Spain":         "2 euro commemorative coins of Spain",
  "Vatican City":  "2 euro commemorative coins of Vatican City",
};

const STANDARD_CATEGORY: Record<string, string> = {
  "Andorra":       "2 euro coins of Andorra",
  "Austria":       "2 euro coins of Austria",
  "Belgium":       "2 euro coins of Belgium",
  "Cyprus":        "2 euro coins of Cyprus",
  "Estonia":       "2 euro coins of Estonia",
  "Finland":       "2 euro coins of Finland",
  "France":        "2 euro coins of France",
  "Germany":       "2 euro coins of Germany",
  "Greece":        "2 euro coins of Greece",
  "Ireland":       "2 euro coins of Ireland",
  "Italy":         "2 euro coins of Italy",
  "Latvia":        "2 euro coins of Latvia",
  "Lithuania":     "2 euro coins of Lithuania",
  "Luxembourg":    "2 euro coins of Luxembourg",
  "Malta":         "2 euro coins of Malta",
  "Monaco":        "2 euro coins of Monaco",
  "Netherlands":   "2 euro coins of the Netherlands",
  "Portugal":      "2 euro coins of Portugal",
  "San Marino":    "2 euro coins of San Marino",
  "Slovakia":      "2 euro coins of Slovakia",
  "Slovenia":      "2 euro coins of Slovenia",
  "Spain":         "2 euro coins of Spain",
  "Vatican City":  "2 euro coins of Vatican City",
};

// Fetch all image file titles in a Wikimedia Commons category (handles pagination)
async function getCategoryFiles(category: string): Promise<string[]> {
  const files: string[] = [];
  let cmcontinue: string | undefined;

  do {
    const url = new URL(WIKI_API);
    url.searchParams.set("action", "query");
    url.searchParams.set("list", "categorymembers");
    url.searchParams.set("cmtitle", `Category:${category}`);
    url.searchParams.set("cmtype", "file");
    url.searchParams.set("cmlimit", "500");
    url.searchParams.set("format", "json");
    if (cmcontinue) url.searchParams.set("cmcontinue", cmcontinue);

    const res = await fetch(url.toString(), { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status} for category: ${category}`);
    const data = await res.json();
    const members: Array<{ title: string }> = data?.query?.categorymembers ?? [];
    files.push(...members.map((m) => m.title));
    cmcontinue = data?.continue?.cmcontinue;
    if (cmcontinue) await delay(150);
  } while (cmcontinue);

  return files;
}

// Batch-fetch thumbnail URLs for up to 50 file titles at a time
async function getThumbnailUrls(
  fileTitles: string[]
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  for (let i = 0; i < fileTitles.length; i += 50) {
    const batch = fileTitles.slice(i, i + 50);
    const url = new URL(WIKI_API);
    url.searchParams.set("action", "query");
    url.searchParams.set("titles", batch.join("|"));
    url.searchParams.set("prop", "imageinfo");
    url.searchParams.set("iiprop", "url");
    url.searchParams.set("iiurlwidth", "200");
    url.searchParams.set("format", "json");

    const res = await fetch(url.toString(), { headers: HEADERS });
    const data = await res.json();
    const pages = data?.query?.pages ?? {};

    for (const page of Object.values(pages) as Array<{
      title: string;
      imageinfo?: Array<{ thumburl?: string; url?: string }>;
    }>) {
      const imgUrl =
        page.imageinfo?.[0]?.thumburl ?? page.imageinfo?.[0]?.url;
      if (page.title && imgUrl) result[page.title] = imgUrl;
    }
    await delay(150);
  }
  return result;
}

// Score how well a file title matches a coin (higher = better)
function matchScore(
  fileTitle: string,
  year: number,
  description: string
): number {
  const lower = fileTitle.toLowerCase();
  let score = 0;

  if (lower.includes(String(year))) score += 10;

  // Bonus for description keywords (skip short/common words)
  const keywords = description
    .toLowerCase()
    .split(/[\s\-–—(),.]+/)
    .filter((w) => w.length > 4 && !/^(anniversary|years|the|and|for|with|of)$/.test(w));

  for (const kw of keywords) {
    if (lower.includes(kw)) score += 2;
  }

  // Prefer obverse images
  if (lower.includes("obverse") || lower.includes("avers")) score += 1;

  // Penalise reverse/proof/proof-like variants
  if (lower.includes("reverse") || lower.includes("revers")) score -= 3;
  if (lower.includes("proof")) score -= 1;

  return score;
}

async function updateImages(resetAll = false) {
  if (resetAll) {
    console.log("🔄 Resetting all image_url values to NULL…");
    await db.update(coins).set({ imageUrl: null });
  }

  const allCoins = await db.select().from(coins);

  // Group coins by country
  const byCountry = new Map<string, typeof allCoins>();
  for (const coin of allCoins) {
    if (!byCountry.has(coin.country)) byCountry.set(coin.country, []);
    byCountry.get(coin.country)!.push(coin);
  }

  let updated = 0;
  let notFound = 0;

  for (const [country, countryCoins] of byCountry) {
    console.log(`\n🌍 ${country} (${countryCoins.length} coins)`);

    // Fetch category files once per country
    const commCategory = COMMEMORATIVE_CATEGORY[country] ?? "";
    const stdCategory  = STANDARD_CATEGORY[country] ?? "";

    const [commFiles, stdFiles] = await Promise.all([
      commCategory ? getCategoryFiles(commCategory).catch(() => [] as string[]) : Promise.resolve([] as string[]),
      stdCategory  ? getCategoryFiles(stdCategory).catch(() => [] as string[])  : Promise.resolve([] as string[]),
    ]);
    await delay(200);

    // Build full thumbnail URL map for all discovered files
    const allFiles = [...new Set([...commFiles, ...stdFiles])];
    const thumbMap = allFiles.length
      ? await getThumbnailUrls(allFiles)
      : {};

    for (const coin of countryCoins) {
      const pool = coin.type === "standard" ? stdFiles : commFiles;

      if (pool.length === 0) {
        console.log(`  ✗ ${coin.year} (${coin.type}) — no category files`);
        notFound++;
        continue;
      }

      // Score every file in the pool and pick the best
      const scored = pool
        .map((f) => ({ file: f, score: matchScore(f, coin.year, coin.description) }))
        .filter((x) => x.score >= 10) // must at least match the year
        .sort((a, b) => b.score - a.score);

      const best = scored[0];
      const imgUrl = best ? thumbMap[best.file] : null;

      if (imgUrl) {
        await db.update(coins).set({ imageUrl: imgUrl }).where(eq(coins.id, coin.id));
        console.log(`  ✓ ${coin.year} "${coin.description.slice(0, 50)}" → score ${best.score}`);
        updated++;
      } else {
        console.log(`  ✗ ${coin.year} "${coin.description.slice(0, 50)}" — no match`);
        notFound++;
      }
    }
  }

  console.log(`\n✅ Done — updated: ${updated}, not found: ${notFound} / ${allCoins.length}`);
  await client.end();
}

// Pass --reset to wipe all image_urls before running
const reset = process.argv.includes("--reset");
updateImages(reset).catch((err) => {
  console.error("Image update failed:", err);
  process.exit(1);
});

