"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmailAuthPanel() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const supabase = createClient();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      setLoading(false);
      if (error) {
        setMessage(error.message);
        return;
      }
      if (!data.session) {
        setMessage(
          'This project still requires email confirmation. In Supabase: Authentication → Providers → Email → turn off "Confirm email" until you add a confirmation flow.'
        );
        return;
      }
      router.refresh();
      router.push("/collection");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    router.refresh();
    router.push("/collection");
  }

  return (
    <div className="flex w-full flex-col items-stretch gap-3">
      {!open ? (
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-auto rounded-xl border-input px-6 py-3 text-base font-medium shadow-sm",
            "hover:bg-accent hover:text-accent-foreground"
          )}
          onClick={() => {
            setOpen(true);
            setMessage(null);
          }}
        >
          Sign in with email
        </Button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-xl border border-input bg-background p-4 text-left shadow-sm"
        >
          <div className="flex gap-2 rounded-lg bg-muted/50 p-1 text-sm font-medium">
            <button
              type="button"
              className={cn(
                "flex-1 rounded-md py-1.5 transition-colors",
                mode === "signin"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => {
                setMode("signin");
                setMessage(null);
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 rounded-md py-1.5 transition-colors",
                mode === "signup"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => {
                setMode("signup");
                setMessage(null);
              }}
            >
              Create account
            </button>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email-auth-email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email-auth-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email-auth-password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="email-auth-password"
              name="password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {message && (
            <p className="text-sm text-destructive" role="alert">
              {message}
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              className="sm:mr-auto"
              onClick={() => {
                setOpen(false);
                setMessage(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
