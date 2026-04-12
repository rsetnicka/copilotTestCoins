import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { coins, userCollections, userCustomCoins } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { CountrySection, type CountryGridEntry } from "@/components/CountrySection";
import { AddCustomCoinDialog } from "@/components/AddCustomCoinDialog";
import { customCoinPublicUrl } from "@/lib/custom-coin-public-url";
import { LogOut, Coins } from "lucide-react";

export const dynamic = "force-dynamic";

type CountryGroup = {
  country: string;
  countryCode: string;
  entries: CountryGridEntry[];
};

export default async function CollectionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // Fetch catalog, collection, custom coins, and country list in parallel
  const [allCoins, userOwned, customCoins, countryRows] = await Promise.all([
    db.select().from(coins).orderBy(asc(coins.sortOrder), asc(coins.year)),
    db
      .select({ coinId: userCollections.coinId })
      .from(userCollections)
      .where(eq(userCollections.userId, user.id)),
    db
      .select()
      .from(userCustomCoins)
      .where(eq(userCustomCoins.userId, user.id))
      .orderBy(asc(userCustomCoins.createdAt)),
    db
      .selectDistinct({ country: coins.country, countryCode: coins.countryCode })
      .from(coins)
      .orderBy(asc(coins.country)),
  ]);

  const ownedIds = new Set(userOwned.map((r) => r.coinId));

  const groupMap = new Map<string, CountryGroup>();
  for (const coin of allCoins) {
    if (!groupMap.has(coin.country)) {
      groupMap.set(coin.country, {
        country: coin.country,
        countryCode: coin.countryCode,
        entries: [],
      });
    }
    groupMap.get(coin.country)!.entries.push({ variant: "catalog", coin });
  }

  for (const row of customCoins) {
    if (!groupMap.has(row.country)) {
      groupMap.set(row.country, {
        country: row.country,
        countryCode: row.countryCode,
        entries: [],
      });
    }
    groupMap.get(row.country)!.entries.push({
      variant: "custom",
      row,
      imageUrl: customCoinPublicUrl(row.imagePath),
    });
  }

  const countryOrder: string[] = [];
  const seenCountry = new Set<string>();
  for (const c of allCoins) {
    if (!seenCountry.has(c.country)) {
      seenCountry.add(c.country);
      countryOrder.push(c.country);
    }
  }
  for (const row of customCoins) {
    if (!seenCountry.has(row.country)) {
      seenCountry.add(row.country);
      countryOrder.push(row.country);
    }
  }

  const groups = countryOrder.map((name) => groupMap.get(name)!);

  const catalogTotal = allCoins.length;
  const customTotal = customCoins.length;
  const totalCoins = catalogTotal + customTotal;
  const catalogOwned = ownedIds.size;
  const totalOwned = catalogOwned + customTotal;
  const progressPct =
    totalCoins > 0 ? Math.round((totalOwned / totalCoins) * 100) : 0;

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-sm font-bold text-yellow-900">
              €2
            </span>
            <span className="font-semibold">EuroTracker</span>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <Coins className="h-4 w-4 shrink-0" />
            <span>
              <span className="font-semibold text-foreground">{totalOwned}</span>
              /{totalCoins} coins
            </span>
            <span className="text-xs text-violet-800/90">
              ({customTotal} personal)
            </span>
          </div>

          {/* User name and Sign out */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">
              {user.user_metadata?.full_name || user.email}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Collection</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Click any catalog coin to mark it as owned. Personal coins are only visible to you.
            </p>
          </div>
          <AddCustomCoinDialog countryOptions={countryRows} />
        </div>

        {/* Overall progress */}
        <div className="mb-8 rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-medium">Overall progress</span>
            <span className="text-muted-foreground">
              {totalOwned} / {totalCoins} ({progressPct}%)
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-yellow-400 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Total includes the full catalog ({catalogTotal} coins) plus your personal coins.{" "}
            {customTotal === 0 ? (
              <>You have not added any personal coins.</>
            ) : customTotal === 1 ? (
              <>You have added 1 personal coin.</>
            ) : (
              <>You have added {customTotal} personal coins.</>
            )}
          </p>
        </div>

        {/* Country groups with right-side navigation */}
        <div className="flex gap-8">
          <div className="flex-1 flex flex-col gap-4">
            {groups.map((group) => (
              <CountrySection
                key={group.country}
                country={group.country}
                countryCode={group.countryCode}
                entries={group.entries}
                ownedIds={ownedIds}
              />
            ))}
          </div>

          {/* Right-side country nav (hidden on small screens) */}
          <aside className="hidden xl:block w-56 shrink-0">
            <div className="sticky top-24">
              <h3 className="mb-2 text-sm font-semibold">Jump to country</h3>
              <nav className="flex max-h-[60vh] flex-col gap-1 overflow-auto pr-2 text-sm">
                {groups.map((g) => {
                  const slug = g.country.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                  return (
                    <a
                      key={g.country}
                      href={`#${slug}`}
                      className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/40"
                    >
                      <span className="inline-flex h-5 w-8 items-center justify-center rounded-sm bg-muted/20 text-[11px] font-medium">{g.countryCode}</span>
                      <span className="truncate">{g.country}</span>
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
