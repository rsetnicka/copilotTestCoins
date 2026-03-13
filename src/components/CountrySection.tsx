"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CoinCard } from "@/components/CoinCard";
import { Progress } from "@/components/ui/progress";
import type { Coin } from "@/db/schema";

const COUNTRY_FLAGS: Record<string, string> = {
  AD: "🇦🇩", AT: "🇦🇹", BE: "🇧🇪", CY: "🇨🇾", EE: "🇪🇪",
  FI: "🇫🇮", FR: "🇫🇷", DE: "🇩🇪", GR: "🇬🇷", IE: "🇮🇪",
  IT: "🇮🇹", LV: "🇱🇻", LT: "🇱🇹", LU: "🇱🇺", MT: "🇲🇹",
  MC: "🇲🇨", NL: "🇳🇱", PT: "🇵🇹", SM: "🇸🇲", SK: "🇸🇰",
  SI: "🇸🇮", ES: "🇪🇸", VA: "🇻🇦",
};

interface CountrySectionProps {
  country: string;
  countryCode: string;
  coins: Coin[];
  ownedIds: Set<string>;
}

export function CountrySection({
  country,
  countryCode,
  coins,
  ownedIds,
}: CountrySectionProps) {
  const [open, setOpen] = useState(true);
  const ownedCount = coins.filter((c) => ownedIds.has(c.id)).length;
  const total = coins.length;
  const pct = total > 0 ? Math.round((ownedCount / total) * 100) : 0;
  const flag = COUNTRY_FLAGS[countryCode] ?? "🪙";

  // Create an id-safe slug for anchor linking
  const slug = country.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return (
    <section id={slug} className="rounded-xl border bg-card shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <span className="text-2xl">{flag}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">{country}</h2>
            <span className="text-sm text-muted-foreground mr-2">
              {ownedCount}/{total}
            </span>
          </div>
          <Progress value={pct} className="mt-1.5 h-2" />
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="border-t px-5 pb-5 pt-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {coins.map((coin) => (
              <CoinCard key={coin.id} coin={coin} owned={ownedIds.has(coin.id)} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
