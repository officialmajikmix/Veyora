import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isMajikMixAdmin } from "./mediaCatalog";

export async function getAuthState() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return { signedIn: false, isAdmin: false };
  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, { cookies: {
    getAll() { return cookieStore.getAll(); },
    setAll(values: { name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }[]) { try { values.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch { /* refreshed by proxy */ } },
  } });
  const { data } = await supabase.auth.getClaims();
  return { signedIn: Boolean(data?.claims), isAdmin: isMajikMixAdmin(data?.claims) };
}

export async function getSignedInState() { return (await getAuthState()).signedIn; }
