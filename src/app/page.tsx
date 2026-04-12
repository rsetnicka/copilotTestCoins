import { redirect } from "next/navigation";
import { EmailAuthPanel } from "@/components/EmailAuthPanel";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect("/collection");

  const params = await searchParams;
  const hasError = params.error === "auth";

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400 text-4xl font-bold text-yellow-900 shadow-lg">
          €2
        </div>

        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          EuroTracker
        </h1>
        <p className="mb-2 max-w-xl text-lg text-muted-foreground">
          Track your 2 euro coin collection — standard designs and commemorative
          editions from all Eurozone countries.
        </p>
        <p className="mb-10 text-sm text-muted-foreground">
          Over 500 coins to discover. Browse by country, toggle what you own,
          and watch your collection grow.
        </p>

        {hasError && (
          <p className="mb-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
            Sign-in failed. Please try again.
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
            Sign in with Google
          </a>
          <EmailAuthPanel />
        </div>
      </div>

      {/* Features */}
      <div className="border-t bg-muted/30 px-4 py-16">
        <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-3">
          {[
            {
              icon: "🗺️",
              title: "All countries",
              text: "Every Eurozone country plus Monaco, San Marino, Vatican & Andorra.",
            },
            {
              icon: "🪙",
              title: "500+ coins",
              text: "Standard designs and hundreds of commemorative editions by year.",
            },
            {
              icon: "✅",
              title: "One click to track",
              text: "Tap any coin to mark it as owned. Your collection syncs instantly.",
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
        EuroTracker — built with Next.js &amp; Supabase
      </footer>
    </main>
  );
}
