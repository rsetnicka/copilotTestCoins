import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { coins } from "./schema";
import { eq } from "drizzle-orm";
import * as cheerio from "cheerio";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client);

const BASE_URL = "https://www.coin-database.com";
const LIST_URL = `${BASE_URL}/coin_sort_denomination2.php?id=1`;

// Country name normalisation (page uses uppercase, may differ slightly)
const COUNTRY_ALIASES: Record<string, string> = {
  "ANDORRA":      "Andorra",
  "AUSTRIA":      "Austria",
  "BELGIUM":      "Belgium",
  "CYPRUS":       "Cyprus",
  "ESTONIA":      "Estonia",
  "FINLAND":      "Finland",
  "FRANCE":       "France",
  "GERMANY":      "Germany",
  "GREECE":       "Greece",
  "IRELAND":      "Ireland",
  "ITALY":        "Italy",
  "LATVIA":       "Latvia",
  "LITHUANIA":    "Lithuania",
  "LUXEMBOURG":   "Luxembourg",
  "MALTA":        "Malta",
  "MONACO":       "Monaco",
  "NETHERLANDS":  "Netherlands",
  "PORTUGAL":     "Portugal",
  "SAN MARINO":   "San Marino",
  "SLOVAKIA":     "Slovakia",
  "SLOVENIA":     "Slovenia",
  "SPAIN":        "Spain",
  "VATICAN CITY": "Vatican City",
  "VATICAN":      "Vatican City",
};

type ScrapedCoin = {
  country: string;
  description: string;
  year: number;
  imageUrl: string | null;
};

function wordOverlap(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
  const wordsB = new Set(b.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
  let hits = 0;
  for (const w of wordsA) if (wordsB.has(w)) hits++;
  return hits;
}

async function scrapeCoindatabase(): Promise<ScrapedCoin[]> {
  console.log("🌐 Fetching coin-database.com…");
  const res = await fetch(LIST_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "text/html",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  console.log(`   Downloaded ${Math.round(html.length / 1024)} KB`);

  const $ = cheerio.load(html);
  const results: ScrapedCoin[] = [];

  // The page has repeating triplets of .innercoins tables: topping -> scnd -> thrd
  const tables = $("table.innercoins").toArray();

  for (let i = 0; i < tables.length - 2; i++) {
    const topping = $(tables[i]);
    if (!topping.hasClass("topping")) continue;

    const scnd  = $(tables[i + 1]);
    const thrd  = $(tables[i + 2]);

    // Country from <h2>
    const rawCountry = topping.find("h2").text().trim().toUpperCase();
    const country = COUNTRY_ALIASES[rawCountry];
    if (!country) continue;

    // Description from second <th>
    const description = topping.find("th").eq(1).text()
      .replace(/\s+/g, " ")
      .trim();

    // Year from first data row in .thrd table
    const yearText = thrd.find("tr.hl td").eq(1).find("strong").text().trim();
    const year = parseInt(yearText, 10);
    if (!year || isNaN(year)) continue;

    // Obverse image: use data-original (lazy load attribute)
    const imgPath = scnd.find("td.facefront img").attr("data-original")
                 ?? scnd.find("td.facefront img").attr("src");
    const imageUrl = imgPath && !imgPath.includes("no_image")
      ? `${BASE_URL}${imgPath.replace("/pic/w70", "")}`
      : null;

    results.push({ country, description, year, imageUrl });
  }

  console.log(`   Parsed ${results.length} coin entries`);
  return results;
}

async function updateImages(resetAll = false) {
  if (resetAll) {
    console.log("🔄 Resetting all image_url values…\n");
    await db.update(coins).set({ imageUrl: null });
  }

  const scraped = await scrapeCoindatabase();

  // Group scraped entries by country -> year -> list
  const byCountryYear = new Map<string, Map<number, ScrapedCoin[]>>();
  for (const entry of scraped) {
    if (!byCountryYear.has(entry.country)) byCountryYear.set(entry.country, new Map());
    const byYear = byCountryYear.get(entry.country)!;
    if (!byYear.has(entry.year)) byYear.set(entry.year, []);
    byYear.get(entry.year)!.push(entry);
  }

  const allCoins = await db.select().from(coins);
  console.log(`\n🪙 Matching ${allCoins.length} DB coins to scraped data…\n`);

  let updated = 0;
  let notFound = 0;

  for (const coin of allCoins) {
    const byYear = byCountryYear.get(coin.country);
    if (!byYear) {
      console.log(`  ✗ ${coin.country} ${coin.year} — country not in scraped data`);
      notFound++;
      continue;
    }

    const candidates = byYear.get(coin.year) ?? [];
    const withImage  = candidates.filter((c) => c.imageUrl);

    if (withImage.length === 0) {
      console.log(`  ✗ ${coin.country} ${coin.year} "${coin.description.slice(0, 45)}" — no match`);
      notFound++;
      continue;
    }

    // Pick best candidate by description word overlap
    const best = withImage
      .map((c) => ({ c, score: wordOverlap(c.description, coin.description) }))
      .sort((a, b) => b.score - a.score)[0].c;

    await db.update(coins).set({ imageUrl: best.imageUrl }).where(eq(coins.id, coin.id));
    console.log(`  ✓ ${coin.country} ${coin.year} → ${best.imageUrl!.split("/").pop()}`);
    updated++;
  }

  console.log(`\n✅ Done — updated: ${updated}, not found: ${notFound} / ${allCoins.length}`);
  await client.end();
}

const reset = process.argv.includes("--reset");
updateImages(reset).catch((err) => {
  console.error("Image update failed:", err);
  process.exit(1);
});
