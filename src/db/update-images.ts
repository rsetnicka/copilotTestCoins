import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { coins } from "./schema";
import { isNull, or, eq } from "drizzle-orm";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle(client);

const WIKI_API = "https://commons.wikimedia.org/w/api.php";

// Delay helper to respect Wikimedia rate limits
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function getWikimediaImageUrl(query: string): Promise<string | null> {
  try {
    // Step 1: search the File namespace
    const searchUrl = new URL(WIKI_API);
    searchUrl.searchParams.set("action", "query");
    searchUrl.searchParams.set("list", "search");
    searchUrl.searchParams.set("srsearch", query);
    searchUrl.searchParams.set("srnamespace", "6");
    searchUrl.searchParams.set("srlimit", "5");
    searchUrl.searchParams.set("format", "json");
    searchUrl.searchParams.set("origin", "*");

    const searchRes = await fetch(searchUrl.toString());
    const searchData = await searchRes.json();
    const results: Array<{ title: string }> = searchData?.query?.search ?? [];

    if (results.length === 0) return null;

    // Prefer results that mention "2 euro" or "2_euro" in the filename
    const preferred = results.find((r) =>
      /2.?euro/i.test(r.title)
    ) ?? results[0];

    // Step 2: get the thumbnail URL for the chosen file
    const infoUrl = new URL(WIKI_API);
    infoUrl.searchParams.set("action", "query");
    infoUrl.searchParams.set("titles", preferred.title);
    infoUrl.searchParams.set("prop", "imageinfo");
    infoUrl.searchParams.set("iiprop", "url");
    infoUrl.searchParams.set("iiurlwidth", "200");
    infoUrl.searchParams.set("format", "json");
    infoUrl.searchParams.set("origin", "*");

    const infoRes = await fetch(infoUrl.toString());
    const infoData = await infoRes.json();
    const pages = infoData?.query?.pages ?? {};
    const page = Object.values(pages)[0] as {
      imageinfo?: Array<{ thumburl?: string; url?: string }>;
    };

    return page?.imageinfo?.[0]?.thumburl ?? page?.imageinfo?.[0]?.url ?? null;
  } catch {
    return null;
  }
}

function buildQuery(coin: {
  country: string;
  year: number;
  type: string;
  description: string;
}): string {
  if (coin.type === "standard") {
    return `2 euro coin ${coin.country} standard obverse`;
  }
  // For commemoratives, pull a few keywords from the description
  const keywords = coin.description
    .replace(/[()]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 4)
    .join(" ");
  return `2 euro coin ${coin.country} ${coin.year} ${keywords}`;
}

async function updateImages() {
  // Only process coins without an image_url
  const pending = await db
    .select()
    .from(coins)
    .where(or(isNull(coins.imageUrl), eq(coins.imageUrl, "")));

  console.log(`🔍 Fetching images for ${pending.length} coins…`);

  let updated = 0;
  let notFound = 0;

  for (let i = 0; i < pending.length; i++) {
    const coin = pending[i];
    const query = buildQuery(coin);

    process.stdout.write(
      `[${i + 1}/${pending.length}] ${coin.country} ${coin.year} (${coin.type})… `
    );

    const url = await getWikimediaImageUrl(query);

    if (url) {
      await db
        .update(coins)
        .set({ imageUrl: url })
        .where(eq(coins.id, coin.id));
      console.log(`✓`);
      updated++;
    } else {
      console.log(`✗ not found`);
      notFound++;
    }

    // Respect Wikimedia rate limit (~200ms between requests)
    await delay(220);
  }

  console.log(
    `\n✅ Done. Updated: ${updated}, Not found: ${notFound} / ${pending.length} total`
  );
  await client.end();
}

updateImages().catch((err) => {
  console.error("Image update failed:", err);
  process.exit(1);
});
