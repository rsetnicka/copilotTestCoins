"use client";

import { startTransition, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Coin } from "@/db/schema";

interface CoinCardProps {
  coin: Coin;
  owned: boolean;
}

export function CoinCard({ coin, owned: initialOwned }: CoinCardProps) {
  const router = useRouter();
  const t = useTranslations("coinCard");
  const [owned, setOwned] = useState(initialOwned);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setOwned(initialOwned);
  }, [initialOwned]);

  async function toggle() {
    setLoading(true);
    setOwned((prev) => !prev);
    try {
      const res = await fetch("/api/collection/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coinId: coin.id }),
      });
      if (!res.ok) {
        setOwned((prev) => !prev);
        return;
      }
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setOwned((prev) => !prev);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        "group relative z-0 flex flex-col gap-1.5 rounded-xl border-2 p-3 text-left transition-all duration-200 hover:z-10",
        "hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        owned
          ? "border-amber-400 bg-card shadow-sm shadow-amber-500/10 ring-1 ring-amber-400/25 dark:border-amber-500/70 dark:bg-card dark:shadow-amber-950/20 dark:ring-amber-400/20"
          : "border-border bg-card hover:border-yellow-300 hover:bg-yellow-50/40 dark:hover:border-amber-500/35 dark:hover:bg-amber-950/20",
        loading && "opacity-60 cursor-wait"
      )}

    >
      {/* Coin image — overflow-visible so scaled coin pops out of card */}
      <div
        className={cn(
          "relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 transition-colors hover:z-50",
          owned
            ? "border-amber-400/90 dark:border-amber-400/80"
            : "border-muted group-hover:border-yellow-300 dark:group-hover:border-amber-500/50"
        )}
      >
        {coin.imageUrl ? (
          <Image
            src={coin.imageUrl}
            alt={t("coinImageAlt", {
              country: coin.country,
              year: String(coin.year),
              description: coin.description,
            })}
            width={256}
            height={256}
            sizes="64px"
            className={cn(
              "h-full w-full origin-center rounded-full object-cover",
              /* Transform only — animating filter blurs the layer; drop-shadow applies without transition */
              "transition-transform duration-300 ease-out motion-reduce:transition-none motion-reduce:duration-0",
              "group-hover:scale-[4]",
              "group-hover:[filter:drop-shadow(0_8px_24px_rgba(0,0,0,0.35))]"
            )}
            unoptimized
          />
        ) : (
          <div
            className={cn(
              "flex h-full w-full origin-center items-center justify-center rounded-full text-sm font-bold",
              "transition-transform duration-300 ease-out motion-reduce:transition-none motion-reduce:duration-0",
              "group-hover:scale-[4]",
              owned
                ? "bg-amber-100 text-amber-950 dark:bg-amber-500/35 dark:text-amber-100"
                : "bg-muted/40 text-muted-foreground group-hover:bg-yellow-100 dark:group-hover:bg-amber-950/30"
            )}
          >
            €2
          </div>
        )}
      </div>

      {/* Year */}
      <span className="text-center text-sm font-semibold text-foreground">{coin.year}</span>

      {/* Description */}
      <span className="line-clamp-2 text-center text-xs leading-tight text-muted-foreground">
        {coin.description}
      </span>

      {/* Type badge */}
      <Badge
        variant={coin.type === "standard" ? "secondary" : "outline"}
        className={cn(
          "mx-auto mt-auto text-[10px]",
          coin.type === "standard" &&
            owned &&
            "border-0 bg-amber-100 text-secondary-foreground dark:bg-amber-500/30",
          coin.type !== "standard" &&
            owned &&
            "border-amber-500/70 text-foreground dark:border-amber-400/50"
        )}
      >
        {coin.type === "standard" ? t("standard") : t("commemorative")}
      </Badge>

      {/* Owned checkmark */}
      {owned && (
        <span className="absolute right-2 top-2 text-amber-600 dark:text-amber-400">✓</span>
      )}
    </button>
  );
}

