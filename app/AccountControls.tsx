import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function AccountControls() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return <a className="account-control" href="/auth">Sign in</a>;
  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, { cookies: {
    getAll() { return cookieStore.getAll(); },
    setAll(values: { name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }[]) { try { values.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch { /* refreshed by proxy */ } },
  } });
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);
  async function signOut() {
    "use server";
    const store = await cookies();
    const client = createServerClient(url!, key!, { cookies: {
      getAll() { return store.getAll(); },
      setAll(values: { name: string; value: string; options?: Parameters<typeof store.set>[2] }[]) { values.forEach(({ name, value, options }) => store.set(name, value, options)); },
    } });
    await client.auth.signOut();
    redirect("/");
  }
  return signedIn ? <div className="account-signed-in"><a className="account-control" href="/member">My account</a><form action={signOut}><button className="account-signout" type="submit">Sign out</button></form></div> : <a className="account-control" href="/auth">Sign in</a>;
}
