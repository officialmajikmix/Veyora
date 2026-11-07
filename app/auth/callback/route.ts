import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const recovery = request.cookies.get("veyora_recovery")?.value === "1";
  const next = searchParams.get("next");
  const destination = recovery || next === "/auth/reset-password" ? "/auth/reset-password" : "/member";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (code && destination === "/auth/reset-password") {
    const resetUrl = new URL(destination, origin);
    resetUrl.searchParams.set("code", code);
    const response = NextResponse.redirect(resetUrl);
    response.cookies.delete("veyora_recovery");
    return response;
  }

  if (code && url && key) {
    const cookieStore = await cookies();
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }[]) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    });
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(destination, origin));
  }

  const response = NextResponse.redirect(new URL("/auth?error=confirmation", origin));
  response.cookies.delete("veyora_recovery");
  return response;
}
