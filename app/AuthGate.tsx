import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export async function AuthGate({ children }: { children: ReactNode }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return (
      <section className="auth-gate-message" aria-labelledby="auth-setup-title">
        <span className="eyebrow">MEMBER ACCESS</span>
        <h2 id="auth-setup-title">Your Veyora account is being prepared.</h2>
        <p>Sign-in will be available once Veyora’s secure account service is connected.</p>
        <a className="button button-dark" href="/auth">Sign in or create an account</a>
      </section>
    );
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet: { name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // The Proxy refreshes cookies when a Server Component cannot write them.
        }
      },
    },
  });
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) {
    return (
      <section className="auth-gate-message" aria-labelledby="auth-required-title">
        <span className="eyebrow">MEMBER ACCESS</span>
        <h2 id="auth-required-title">A closer look starts with an account.</h2>
        <p>Sign in or create a free account to explore Veyora’s opportunities, approach and important information.</p>
        <a className="button button-dark" href="/auth">Sign in or create an account</a>
      </section>
    );
  }

  async function signOut() {
    "use server";
    const cookieStore = await cookies();
    const client = createServerClient(url!, key!, {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }[]) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    });
    await client.auth.signOut();
    redirect("/");
  }

  return (
    <>
      <div className="member-toolbar"><span>Signed in as {claims.email ?? "member"}</span><form action={signOut}><button type="submit">Sign out</button></form></div>
      {children}
    </>
  );
}
