"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LOCALES = routing.locales;

/** Static assets in /public/flags (4×3 SVGs, MIT: lipis/flag-icons). */
const LOCALE_FLAG_SRC: Record<(typeof LOCALES)[number], string> = {
  en: "/flags/gb.svg",
  sk: "/flags/sk.svg",
};

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
        "inline-flex h-9 shrink-0 items-center rounded-full border border-border/80 bg-muted/40 p-0.5 text-sm shadow-sm backdrop-blur-sm",
        className
      )}
    >
      {LOCALES.map((loc) => {
        const on = locale === loc;
        const label = loc === "en" ? t("en") : t("sk");
        return (
          <button
            key={loc}
            type="button"
            aria-pressed={on}
            aria-label={label}
            title={label}
            onClick={() => router.replace(pathname, { locale: loc })}
            className={cn(
              "flex h-8 w-9 items-center justify-center rounded-full transition-colors",
              on
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <img
              src={LOCALE_FLAG_SRC[loc]}
              alt=""
              width={22}
              height={16}
              decoding="async"
              className="pointer-events-none h-4 w-auto rounded-[2px] object-cover shadow-sm ring-1 ring-black/15 dark:ring-white/15"
            />
          </button>
        );
      })}
    </div>
  );
}
