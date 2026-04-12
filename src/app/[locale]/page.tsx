import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { EmailAuthPanel } from "@/components/EmailAuthPanel";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect({ href: "/collection", locale });

  const t = await getTranslations("landing");
  const paramsResolved = await searchParams;
  const hasError = paramsResolved.error === "auth";

  return (
    <main className="relative flex min-h-screen flex-col">
      <div className="absolute right-3 top-3 z-20 flex items-center gap-2 sm:right-5 sm:top-5">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-4xl font-bold text-amber-950 shadow-lg shadow-amber-900/20 ring-1 ring-amber-600/20 dark:shadow-[0_12px_40px_rgba(251,191,36,0.22)] dark:ring-amber-400/30">
          €2
        </div>

        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mb-2 max-w-xl text-lg text-muted-foreground">
          {t("heroLine1")}
        </p>
        <p className="mb-10 text-sm text-muted-foreground">{t("heroLine2")}</p>

        {hasError && (
          <p className="mb-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {t("signInFailed")}
          </p>
        )}

        <div className="flex w-full max-w-sm flex-col items-center gap-3">
          <a
            href="/auth/google"
            className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-input bg-background px-6 py-3 text-base font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {t("signInGoogle")}
          </a>
          <EmailAuthPanel />
        </div>
      </div>

      <div className="border-t bg-muted/30 px-4 py-16">
        <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-3">
          {[
            {
              icon: "🗺️",
              title: t("featureAllCountriesTitle"),
              text: t("featureAllCountriesText"),
            },
            {
              icon: "🪙",
              title: t("featureManyCoinsTitle"),
              text: t("featureManyCoinsText"),
            },
            {
              icon: "✅",
              title: t("featureOneClickTitle"),
              text: t("featureOneClickText"),
            },
          ].map(({ icon, title, text }) => (
            <div key={title} className="text-center">
              <div className="mb-3 text-3xl">{icon}</div>
              <h3 className="mb-1 font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        {t("footer")}
      </footer>
    </main>
  );
}
