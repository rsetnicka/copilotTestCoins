"use client";

import * as React from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type Mode = "light" | "dark" | "system";

const modes: { value: Mode; labelKey: "light" | "dark" | "system"; icon: typeof Sun }[] = [
  { value: "light", labelKey: "light", icon: Sun },
  { value: "dark", labelKey: "dark", icon: Moon },
  { value: "system", labelKey: "system", icon: Laptop },
];

export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations("theme");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "inline-flex h-9 w-[104px] shrink-0 rounded-full border border-border bg-muted/30",
          className
        )}
        aria-hidden
      />
    );
  }

  const active: Mode =
    theme === "dark" || theme === "light" ? theme : "system";

  return (
    <div
      role="radiogroup"
      aria-label={t("groupLabel")}
      className={cn(
        "inline-flex h-9 shrink-0 items-center rounded-full border border-border/80 bg-muted/40 p-0.5 shadow-sm backdrop-blur-sm",
        className
      )}
    >
      {modes.map(({ value, labelKey, icon: Icon }) => {
        const label = t(labelKey);
        const isOn = active === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={isOn}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200",
              isOn
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={isOn ? 2.25 : 2} />
          </button>
        );
      })}
    </div>
  );
}
