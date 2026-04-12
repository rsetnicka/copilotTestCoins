"use client";

import { startTransition, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UserCustomCoin } from "@/db/schema";

interface CustomCoinCardProps {
  row: UserCustomCoin;
  imageUrl: string;
}

export function CustomCoinCard({ row, imageUrl }: CustomCoinCardProps) {
  const router = useRouter();
  const t = useTranslations("customCoinCard");
  const tAuth = useTranslations("auth");
  const tAddCoin = useTranslations("addCoin");
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  async function performDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/custom-coins?id=${encodeURIComponent(row.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        window.alert((j as { error?: string }).error ?? t("deleteFailed"));
        return;
      }
      setDeleteDialogOpen(false);
      startTransition(() => {
        router.refresh();
      });
    } finally {
      setLoading(false);
    }
  }

  const alt = [row.country, row.year, row.name].filter(Boolean).join(" · ");
  const deleteTitleId = `delete-custom-coin-title-${row.id}`;
  const deleteDescId = `delete-custom-coin-desc-${row.id}`;

  return (
    <>
    <div
      className={cn(
        "group relative z-0 flex flex-col gap-1.5 rounded-xl border-2 border-violet-200 bg-violet-50/50 p-3 text-left shadow-sm dark:border-violet-500/35 dark:bg-violet-950/40 dark:shadow-violet-950/30",
        "hover:z-10 hover:shadow-md",
        loading && !deleteDialogOpen && "pointer-events-none opacity-60"
      )}
    >
      <button
        type="button"
        onClick={() => setDeleteDialogOpen(true)}
        disabled={loading}
        className="absolute right-2 top-2 z-20 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        title={t("deleteTitle")}
        aria-label={t("deleteAria")}
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div
        className={cn(
          "group/coin relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-violet-300 transition-colors hover:z-50 dark:border-violet-400/45"
        )}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={alt}
            width={64}
            height={64}
            className={cn(
              "h-full w-full rounded-full object-cover",
              "transition-[transform,filter] duration-300 ease-out",
              "group-hover/coin:scale-[4]",
              "group-hover/coin:[filter:drop-shadow(0_8px_24px_rgba(0,0,0,0.35))]"
            )}
            unoptimized
          />
        ) : (
          <div
            className={cn(
              "flex h-full w-full items-center justify-center rounded-full bg-violet-200 text-sm font-bold text-violet-900 dark:bg-violet-600/50 dark:text-violet-50",
              "transition-transform duration-300 ease-out group-hover/coin:scale-[4]"
            )}
          >
            €2
          </div>
        )}
      </div>

      <span className="line-clamp-2 text-center text-xs font-semibold leading-tight text-violet-950 dark:text-violet-100">
        {row.name}
      </span>

      <span className="text-center text-sm font-semibold text-violet-900 dark:text-violet-200">
        {row.year != null ? row.year : "—"}
      </span>

      {row.description ? (
        <span className="line-clamp-2 text-center text-xs leading-tight text-muted-foreground">
          {row.description}
        </span>
      ) : (
        <span className="min-h-[2rem]" aria-hidden />
      )}

      <Badge
        variant="outline"
        className="mx-auto mt-auto border-violet-300 text-[10px] text-violet-900 dark:border-violet-500/40 dark:text-violet-200"
      >
        {t("personal")}
      </Badge>
    </div>

    {deleteDialogOpen && (
      <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
        <button
          type="button"
          className="absolute inset-0 bg-black/40 dark:bg-black/60"
          aria-label={tAddCoin("close")}
          onClick={() => !loading && setDeleteDialogOpen(false)}
        />
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={deleteTitleId}
          aria-describedby={deleteDescId}
          className="relative z-10 mx-4 w-full max-w-md rounded-t-2xl border bg-background p-6 shadow-lg sm:rounded-2xl"
        >
          <h2 id={deleteTitleId} className="text-lg font-semibold">
            {t("deleteDialogTitle")}
          </h2>
          <p id={deleteDescId} className="mt-2 text-sm text-muted-foreground">
            {t("deleteDialogDescription", { name: row.name })}
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="ghost" disabled={loading} onClick={() => setDeleteDialogOpen(false)}>
              {tAuth("cancel")}
            </Button>
            <Button type="button" variant="destructive" disabled={loading} onClick={() => void performDelete()}>
              {loading ? tAuth("pleaseWait") : t("deleteConfirm")}
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
