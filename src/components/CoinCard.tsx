"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Coin } from "@/db/schema";

interface CoinCardProps {
  coin: Coin;
  owned: boolean;
}

export function CoinCard({ coin, owned: initialOwned }: CoinCardProps) {
  const [owned, setOwned] = useState(initialOwned);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    // Optimistic update
    setOwned((prev) => !prev);
    try {
      const res = await fetch("/api/collection/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coinId: coin.id }),
      });
      if (!res.ok) {
        // Revert on failure
        setOwned((prev) => !prev);
      }
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
        "group relative flex flex-col gap-1.5 rounded-xl border-2 p-3 text-left transition-all duration-200",
        "hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        owned
          ? "border-yellow-400 bg-yellow-50 shadow-yellow-100 shadow-sm"
          : "border-border bg-card hover:border-yellow-300 hover:bg-yellow-50/40",
        loading && "opacity-60 cursor-wait"
      )}
      title={owned ? "Click to remove from collection" : "Click to add to collection"}
    >
      {/* Coin icon */}
      <div
        className={cn(
          "mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg font-bold transition-colors",
          owned
            ? "border-yellow-500 bg-yellow-400 text-yellow-900"
            : "border-muted bg-muted/40 text-muted-foreground group-hover:border-yellow-300 group-hover:bg-yellow-100"
        )}
      >
        €2
      </div>

      {/* Year */}
      <span
        className={cn(
          "text-center text-sm font-semibold",
          owned ? "text-yellow-800" : "text-foreground"
        )}
      >
        {coin.year}
      </span>

      {/* Description */}
      <span
        className={cn(
          "line-clamp-2 text-center text-xs leading-tight",
          owned ? "text-yellow-700" : "text-muted-foreground"
        )}
      >
        {coin.description}
      </span>

      {/* Type badge */}
      <Badge
        variant={coin.type === "standard" ? "secondary" : "outline"}
        className={cn(
          "mx-auto mt-auto text-[10px]",
          coin.type === "standard" && owned && "bg-yellow-200 text-yellow-800"
        )}
      >
        {coin.type === "standard" ? "Standard" : "Commemorative"}
      </Badge>

      {/* Owned checkmark */}
      {owned && (
        <span className="absolute right-2 top-2 text-yellow-500">✓</span>
      )}
    </button>
  );
}
