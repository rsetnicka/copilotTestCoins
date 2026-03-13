import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { coins, userCollections } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { CountrySection } from "@/components/CountrySection";
import { LogOut, Coins } from "lucide-react";
import type { Coin } from "@/db/schema";

export const dynamic = "force-dynamic";

type CountryGroup = {
  country: string;
  countryCode: string;
  coins: Coin[];
};

export default async function CollectionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // Fetch all coins and user's collection in parallel
  const [allCoins, userOwned] = await Promise.all([
    db.select().from(coins).orderBy(asc(coins.sortOrder), asc(coins.year)),
    db
      .select({ coinId: userCollections.coinId })
      .from(userCollections)
      .where(eq(userCollections.userId, user.id)),
  ]);

  const ownedIds = new Set(userOwned.map((r) => r.coinId));

  // Group by country, preserving sortOrder-based country order
  const groupMap = new Map<string, CountryGroup>();
  for (const coin of allCoins) {
    if (!groupMap.has(coin.country)) {
      groupMap.set(coin.country, {
        country: coin.country,
        countryCode: coin.countryCode,
        coins: [],
      });
    }
    groupMap.get(coin.country)!.coins.push(coin);
  }
  const groups = Array.from(groupMap.values());

  const totalCoins = allCoins.length;
  const totalOwned = ownedIds.size;

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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Coins className="h-4 w-4" />
            <span>
              <span className="font-semibold text-foreground">{totalOwned}</span>
              /{totalCoins} coins
            </span>
          </div>

          {/* Sign out */}
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
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">My Collection</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Click any coin to mark it as owned. Coins are grouped by country.
          </p>
        </div>

        {/* Overall progress */}
        <div className="mb-8 rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">Overall progress</span>
            <span className="text-muted-foreground">
              {totalOwned} / {totalCoins} ({Math.round((totalOwned / totalCoins) * 100)}%)
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-yellow-400 transition-all duration-500"
              style={{ width: `${(totalOwned / totalCoins) * 100}%` }}
            />
          </div>
        </div>

        {/* Country groups */}
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <CountrySection
              key={group.country}
              country={group.country}
              countryCode={group.countryCode}
              coins={group.coins}
              ownedIds={ownedIds}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
