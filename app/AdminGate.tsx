import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { ReactNode } from "react";

export async function AdminGate({ children }: { children: ReactNode }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return <section className="auth-gate-message"><span className="eyebrow">INTERNAL WORKSPACE</span><h1>Admin access is not configured.</h1><p>Connect the Veyora account service before opening internal asset records.</p></section>;

  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(items: { name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }[]) {
        try { items.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch { /* Proxy refreshes cookies when a Server Component cannot write them. */ }
      },
    },
  });
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims as { email?: string; app_metadata?: { role?: string } } | undefined;
  if (!claims) return <section className="auth-gate-message"><span className="eyebrow">INTERNAL WORKSPACE</span><h1>Sign in required.</h1><p>This workspace is for authorized Veyora administrators only.</p><a className="button button-dark" href="/auth">Sign in</a></section>;
  if (claims.app_metadata?.role !== "veyora_admin") return <section className="auth-gate-message"><span className="eyebrow">INTERNAL WORKSPACE</span><h1>Admin access required.</h1><p>Your account is signed in but is not assigned the Veyora administrator role. Ask the project owner to set the trusted app metadata role to <code>veyora_admin</code> in Supabase, then sign out and back in.</p><a className="button button-dark" href="/member">Back to member home</a></section>;

  return <><div className="member-toolbar"><span>Internal workspace · {claims.email ?? "Veyora admin"}</span><a href="/member">Member area</a></div>{children}</>;
}
