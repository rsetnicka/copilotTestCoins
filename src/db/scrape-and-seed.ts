import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { coins, userCollections } from "./schema";
import * as cheerio from "cheerio";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client);

const BASE_URL = "https://www.coin-database.com";
const OLD_BASE_URL = "https://www.coindatabase.com";

const COUNTRY_MAP: Record<string, { name: string; code: string }> = {
  "Andorra":      { name: "Andorra",      code: "AD" },
  "Austria":      { name: "Austria",      code: "AT" },
  "Belgium":      { name: "Belgium",      code: "BE" },
  "Cyprus":       { name: "Cyprus",       code: "CY" },
  "Estonia":      { name: "Estonia",      code: "EE" },
  "Finland":      { name: "Finland",      code: "FI" },
  "France":       { name: "France",       code: "FR" },
  "Germany":      { name: "Germany",      code: "DE" },
  "Greece":       { name: "Greece",       code: "GR" },
  "Ireland":      { name: "Ireland",      code: "IE" },
  "Italy":        { name: "Italy",        code: "IT" },
  "Latvia":       { name: "Latvia",       code: "LV" },
  "Lithuania":    { name: "Lithuania",    code: "LT" },
  "Luxembourg":   { name: "Luxembourg",   code: "LU" },
  "Malta":        { name: "Malta",        code: "MT" },
  "Monaco":       { name: "Monaco",       code: "MC" },
  "Netherlands":  { name: "Netherlands",  code: "NL" },
  "Portugal":     { name: "Portugal",     code: "PT" },
  "San Marino":   { name: "San Marino",   code: "SM" },
  "Slovakia":     { name: "Slovakia",     code: "SK" },
  "Slovenia":     { name: "Slovenia",     code: "SI" },
  "Spain":        { name: "Spain",        code: "ES" },
  "Vatican City": { name: "Vatican City", code: "VA" },
  "Vatican":      { name: "Vatican City", code: "VA" },
  // uppercase variants used by old denomination2 pages
  "ANDORRA":      { name: "Andorra",      code: "AD" },
  "AUSTRIA":      { name: "Austria",      code: "AT" },
  "BELGIUM":      { name: "Belgium",      code: "BE" },
  "CYPRUS":       { name: "Cyprus",       code: "CY" },
  "ESTONIA":      { name: "Estonia",      code: "EE" },
  "FINLAND":      { name: "Finland",      code: "FI" },
  "FRANCE":       { name: "France",       code: "FR" },
  "GERMANY":      { name: "Germany",      code: "DE" },
  "GREECE":       { name: "Greece",       code: "GR" },
  "IRELAND":      { name: "Ireland",      code: "IE" },
  "ITALY":        { name: "Italy",        code: "IT" },
  "LATVIA":       { name: "Latvia",       code: "LV" },
  "LITHUANIA":    { name: "Lithuania",    code: "LT" },
  "LUXEMBOURG":   { name: "Luxembourg",   code: "LU" },
  "MALTA":        { name: "Malta",        code: "MT" },
  "MONACO":       { name: "Monaco",       code: "MC" },
  "NETHERLANDS":  { name: "Netherlands",  code: "NL" },
  "PORTUGAL":     { name: "Portugal",     code: "PT" },
  "SAN MARINO":   { name: "San Marino",   code: "SM" },
  "SLOVAKIA":     { name: "Slovakia",     code: "SK" },
  "SLOVENIA":     { name: "Slovenia",     code: "SI" },
  "SPAIN":        { name: "Spain",        code: "ES" },
  "VATICAN CITY": { name: "Vatican City", code: "VA" },
  "VATICAN":      { name: "Vatican City", code: "VA" },
};

const STANDARD_KEYWORDS = ["series", "standard", "regular", "definitive", "national"];

function isStandard(description: string): boolean {
  return STANDARD_KEYWORDS.some((kw) => description.toLowerCase().includes(kw));
}

type CoinRow = {
  country: string;
  countryCode: string;
  year: number;
  type: "standard" | "commemorative";
  description: string;
  imageUrl: string;
  sortOrder: number;
};

async function get(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "text/html",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// Source 1 – new site series page: ALL commemorative 2-euro coins 2004-2026+
// ---------------------------------------------------------------------------
async function scrapeCommemorative(): Promise<CoinRow[]> {
  console.log("🌐 Scraping commemorative coins from series page…");
  const html = await get(`${BASE_URL}/series/eurozone-commemorative-2-euro-coins-2-euro.html`);
  console.log(`   Downloaded ${Math.round(html.length / 1024)} KB`);

  const $ = cheerio.load(html);
  const rows: CoinRow[] = [];
  const seen = new Set<string>();

  $("article").each((_, el) => {
    const article = $(el);

    // Country from "Coins from X" title on the flag/country link
    const countryTitle = article.find("a[title^='Coins from']").attr("title") ?? "";
    const rawCountry = countryTitle.replace("Coins from ", "").trim();
    const mapped = COUNTRY_MAP[rawCountry];
    if (!mapped) return; // skip non-eurozone

    // Year: text node inside h2.spec after the anchor children
    const yearText = article.find("h2.spec").clone().children().remove().end().text().trim();
    const year = parseInt(yearText, 10);
    if (!year || isNaN(year) || year < 2004 || year > 2035) return;

    // Description from coin link title: "2 euro coin X | Country Year" → X
    const coinLinkTitle = article.find("a[href*='/coins/']").first().attr("title") ?? "";
    const description = coinLinkTitle
      .replace(/^2 euro coin /i, "")
      .split(" | ")[0]
      .trim();
    if (!description) return;

    // Image from zoom-button href (high-res): /img/2euro/... or /images/Country/...
    const imgHref = article.find("a[data-fancybox='gallery']").attr("href") ?? "";
    if (!imgHref) return;
    const imageUrl = `${BASE_URL}${imgHref}`;
    // Deduplicate by country+year+description key
    const key = `${mapped.name}|${year}|${description.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);

    rows.push({
      country:     mapped.name,
      countryCode: mapped.code,
      year,
      type:        "commemorative",
      description,
      imageUrl,
      sortOrder:   0,
    });
  });

  console.log(`   Parsed ${rows.length} unique commemorative coins`);
  return rows;
}

// ---------------------------------------------------------------------------
// Source 2 – old denomination2 pages: STANDARD coins only (pages 0-50)
// ---------------------------------------------------------------------------
async function scrapeStandard(): Promise<CoinRow[]> {
  console.log("\n🌐 Scraping standard coins from denomination2 pages…");

  async function fetchDenom(pageNum: number): Promise<string> {
    const url = pageNum === 0
      ? `${OLD_BASE_URL}/coin_sort_denomination2.php?id=1`
      : `${OLD_BASE_URL}/coin_sort_denomination2.php?pageNum_Rmoneda2=${pageNum}&id=1`;
    return get(url);
  }

  const page0Html = await fetchDenom(0);
  const maxPage = Math.max(...[...page0Html.matchAll(/pageNum_Rmoneda2=(\d+)/g)].map((m) => parseInt(m[1])), 0);
  console.log(`   Detected ${maxPage} pages`);

  const rows: CoinRow[] = [];
  const seen = new Set<string>();

  function parseDenomPage(html: string) {
    const $ = cheerio.load(html);
    const tables = $("table.innercoins").toArray();

    for (let i = 0; i < tables.length - 2; i++) {
      const topping = $(tables[i]);
      if (!topping.hasClass("topping")) continue;

      const scnd = $(tables[i + 1]);
      const thrd = $(tables[i + 2]);

      const rawCountry = topping.find("h2").text().trim().toUpperCase();
      const mapped = COUNTRY_MAP[rawCountry];
      if (!mapped) continue;

      const description = topping.find("th").eq(1).text().replace(/\s+/g, " ").trim();
      if (!description || !isStandard(description)) continue; // skip commemorative

      const yearText = thrd.find("tr.hl td").eq(1).find("strong").text().trim();
      const year = parseInt(yearText, 10);
      if (!year || isNaN(year) || year < 1999 || year > 2035) continue;

      const imgEl = scnd.find("td.facefront img");
      const imgPath = imgEl.attr("data-original") ?? imgEl.attr("src") ?? "";
      if (!imgPath || imgPath.includes("no_image")) continue;
      const imageUrl = `${OLD_BASE_URL}${imgPath.replace("/pic/w70", "")}`;

      const key = `${mapped.name}|${year}|${description.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);

      rows.push({
        country:     mapped.name,
        countryCode: mapped.code,
        year,
        type:        "standard",
        description,
        imageUrl,
        sortOrder:   0,
      });
    }
  }

  parseDenomPage(page0Html);
  for (let p = 1; p <= maxPage; p++) {
    await delay(200);
    const html = await fetchDenom(p);
    parseDenomPage(html);
    process.stdout.write(`   Page ${p}/${maxPage}\r`);
  }
  console.log(`\n   Parsed ${rows.length} standard coins`);
  return rows;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const commemorative = await scrapeCommemorative();
  const standard = await scrapeStandard();

  const all = [...commemorative, ...standard];

  // Sort: country A→Z, standard before commemorative, then by year
  all.sort((a, b) => {
    const cc = a.country.localeCompare(b.country);
    if (cc !== 0) return cc;
    if (a.type !== b.type) return a.type === "standard" ? -1 : 1;
    return a.year - b.year;
  });
  all.forEach((r, i) => (r.sortOrder = i));

  console.log(`\n✅ Total coins: ${all.length} (${commemorative.length} commemorative + ${standard.length} standard)`);
  console.log("\nPer country:");
  const byCountry = new Map<string, { std: number; com: number }>();
  for (const r of all) {
    const c = byCountry.get(r.country) ?? { std: 0, com: 0 };
    if (r.type === "standard") c.std++; else c.com++;
    byCountry.set(r.country, c);
  }
  for (const [country, { std, com }] of [...byCountry.entries()].sort()) {
    console.log(`  ${country}: ${std} standard + ${com} commemorative = ${std + com}`);
  }

  console.log("\n🗑️  Clearing existing data…");
  await db.delete(userCollections);
  await db.delete(coins);

  console.log(`📥 Inserting ${all.length} coins…`);
  const BATCH = 50;
  for (let i = 0; i < all.length; i += BATCH) {
    await db.insert(coins).values(all.slice(i, i + BATCH));
    process.stdout.write(`   ${Math.min(i + BATCH, all.length)}/${all.length}\r`);
  }
  console.log(`\n\n🎉 Done!`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
