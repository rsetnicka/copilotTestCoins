import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { coins } from "@/db/schema";
import { asc } from "drizzle-orm";
import { userCustomCoinFromSupabase, type UserCustomCoinSnakeRow } from "@/lib/user-custom-coin-mapper";
import { CountrySection, type CountryGridEntry } from "@/components/CountrySection";
import { AddCustomCoinDialog } from "@/components/AddCustomCoinDialog";
import { customCoinPublicUrl } from "@/lib/custom-coin-public-url";
import { LogOut, Coins } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme-toggle";

export const dynamic = "force-dynamic";

type CountryGroup = {
  country: string;
  countryCode: string;
  entries: CountryGridEntry[];
};

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("collection");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect({ href: "/", locale });
  }

  const sessionUser = user as NonNullable<typeof user>;
  const userId = sessionUser.id;

  const [allCoins, ownedResult, customResult, countryRows] = await Promise.all([
    db.select().from(coins).orderBy(asc(coins.sortOrder), asc(coins.year)),
    supabase.from("user_collections").select("coin_id").eq("user_id", userId),
    supabase
      .from("user_custom_coins")
      .select(
        "id, user_id, name, description, country, country_code, year, image_path, created_at, updated_at"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
    db
      .selectDistinct({ country: coins.country, countryCode: coins.countryCode })
      .from(coins)
      .orderBy(asc(coins.country)),
  ]);

  if (ownedResult.error) {
    throw new Error(
      `Could not load owned coins: ${ownedResult.error.message}. With Row Level Security enabled, the app reads your collection through your Supabase session (not the raw database pooler).`
    );
  }

  if (customResult.error) {
    throw new Error(
      `Could not load personal coins: ${customResult.error.message}. Run supabase/user-custom-coins-rls.sql if RLS is enabled on user_custom_coins.`
    );
  }

  const userOwned = (ownedResult.data ?? []).map((r) => ({ coinId: r.coin_id as string }));
  const customCoins = (customResult.data ?? []).map((r) =>
    userCustomCoinFromSupabase(r as UserCustomCoinSnakeRow)
  );
  const ownedIds = new Set(userOwned.map((r) => r.coinId));

  const groupMap = new Map<string, CountryGroup>();
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
      imageUrl: customCoinPublicUrl(row.imagePath, row.updatedAt),
    });
  }

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
  const progressRatio = totalCoins > 0 ? totalOwned / totalCoins : 0;
  const progressPctRounded = Math.round(progressRatio * 100);
  const progressLabel =
    totalOwned > 0 && progressPctRounded === 0 ? "<1%" : `${progressPctRounded}%`;
  const progressBarWidth =
    totalOwned > 0 ? Math.max(progressRatio * 100, 0.35) : 0;

  async function signOut() {
    "use server";
    const supabaseSignOut = await createClient();
    await supabaseSignOut.auth.signOut();
    const loc = await getLocale();
    redirect({ href: "/", locale: loc });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_auto] gap-x-3 gap-y-1.5 px-4 py-2.5 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:grid-rows-1 lg:items-center lg:gap-y-0 lg:py-3">
          <div className="col-start-1 row-start-1 flex min-w-0 items-center gap-2 self-center lg:col-auto lg:row-auto">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-sm font-bold text-amber-950 shadow-sm shadow-amber-900/15 ring-1 ring-amber-600/15 dark:shadow-[0_4px_20px_rgba(251,191,36,0.2)] dark:ring-amber-400/25">
              €2
            </span>
            <span className="truncate font-semibold">EuroTracker</span>
          </div>

          <div className="col-start-2 row-start-1 flex shrink-0 items-center justify-end gap-1.5 self-center sm:gap-2 lg:col-start-3 lg:row-start-1">
            <LanguageSwitcher />
            <ThemeToggle />
            <span className="hidden min-w-0 max-w-[10rem] truncate text-sm font-medium text-foreground lg:inline xl:max-w-[14rem] 2xl:max-w-[18rem]">
              {sessionUser.user_metadata?.full_name || sessionUser.email}
            </span>
            <form action={signOut} className="shrink-0">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:px-3"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                {t("signOut")}
              </button>
            </form>
          </div>

          <div className="col-span-2 col-start-1 row-start-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:justify-center">
            <Coins className="h-4 w-4 shrink-0" />
            <span className="min-w-0">
              <span className="font-semibold text-foreground">{totalOwned}</span>
              /{totalCoins} {t("coinsLabel")}
            </span>
            <span className="text-xs text-violet-800/90 dark:text-violet-300/90">
              {t("personalBadge", { count: customTotal })}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <AddCustomCoinDialog countryOptions={countryRows} />
        </div>

        <div className="mb-8 rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-medium">{t("progressTitle")}</span>
            <span className="text-muted-foreground">
              {totalOwned} / {totalCoins} ({progressLabel})
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-yellow-400 transition-all duration-500"
              style={{ width: `${progressBarWidth}%` }}
            />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {t("progressHint", { catalogTotal })}{" "}
            {customTotal === 0 ? (
              <>{t("personalCoinsNone")}</>
            ) : customTotal === 1 ? (
              <>{t("personalCoinsOne")}</>
            ) : (
              <>{t("personalCoinsMany", { count: customTotal })}</>
            )}
          </p>
        </div>

        <div className="flex gap-8">
          <div className="flex flex-1 flex-col gap-4">
            {groups.map((group) => (
              <CountrySection
                key={group.country}
                country={group.country}
                countryCode={group.countryCode}
                entries={group.entries}
                ownedIds={ownedIds}
                countryOptions={countryRows}
              />
            ))}
          </div>

          <aside className="hidden w-56 shrink-0 xl:block">
            <div className="sticky top-24">
              <h3 className="mb-2 text-sm font-semibold">{t("jumpToCountry")}</h3>
              <nav className="flex max-h-[60vh] flex-col gap-1 overflow-auto pr-2 text-sm">
                {groups.map((g) => {
                  const slug = g.country
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "");
                  return (
                    <a
                      key={g.country}
                      href={`#${slug}`}
                      className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/40"
                    >
                      <span className="inline-flex h-5 w-8 items-center justify-center rounded-sm bg-muted/20 text-[11px] font-medium">
                        {g.countryCode}
                      </span>
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
