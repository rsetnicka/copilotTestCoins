import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Starts Google OAuth with a full GET navigation (not a Server Action).
 * PKCE cookies must be set on a top-level navigation response; browsers ignore
 * Set-Cookie on fetch() (Server Action) responses.
 */
function localeFromCookies(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const v = cookieStore.get("NEXT_LOCALE")?.value;
  return v === "sk" ? "sk" : "en";
}

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const cookieStore = await cookies();
  const locale = localeFromCookies(cookieStore);

  const response = NextResponse.redirect(`${origin}/${locale}?error=auth`, 302);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data.url) {
    return response;
  }

  response.headers.set("Location", data.url);
  return response;
}
