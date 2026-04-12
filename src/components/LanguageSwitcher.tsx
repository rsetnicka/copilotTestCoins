"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LOCALES = routing.locales;

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("language");

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={cn(
        "inline-flex h-9 shrink-0 items-center rounded-full border border-border/80 bg-muted/40 p-0.5 text-xs font-medium shadow-sm backdrop-blur-sm",
        className
      )}
    >
      {LOCALES.map((loc) => {
        const on = locale === loc;
        return (
          <button
            key={loc}
            type="button"
            aria-pressed={on}
            onClick={() => router.replace(pathname, { locale: loc })}
            className={cn(
              "rounded-full px-2.5 py-1 transition-colors",
              on
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {loc === "en" ? t("en") : t("sk")}
          </button>
        );
      })}
    </div>
  );
}
