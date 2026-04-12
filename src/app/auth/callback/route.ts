import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const LOCALES = ["en", "sk"] as const;

function preferredLocale(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const v = cookieStore.get("NEXT_LOCALE")?.value;
  return v === "sk" ? "sk" : "en";
}

function isSafeLocalizedPath(path: string) {
  return LOCALES.some(
    (loc) => path === `/${loc}` || path.startsWith(`/${loc}/`)
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams, origin } = url;
  const code = searchParams.get("code");
  const cookieStore = await cookies();
  const locale = preferredLocale(cookieStore);

  let next = searchParams.get("next") ?? `/${locale}/collection`;
  if (!next.startsWith("/")) {
    next = `/${locale}/collection`;
  }
  if (!isSafeLocalizedPath(next)) {
    next = `/${locale}/collection`;
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/${locale}?error=auth`);
  }

  const redirectTo = new URL(next, origin).toString();
  const response = NextResponse.redirect(redirectTo, 302);

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

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/${locale}?error=auth`);
  }

  return response;
}
