import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isMajikMixAdmin, getMediaCatalog } from "../../mediaCatalog";
import { MediaManager } from "./MediaManager";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return <main className="media-admin"><p>Account services are not configured yet.</p><a href="/">Return to Majik Mix</a></main>;
  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, { cookies: {
    getAll() { return cookieStore.getAll(); },
    setAll(values: { name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }[]) {
      try { values.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch { /* refreshed by proxy */ }
    },
  } });
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/auth?next=%2Fadmin%2Fmedia");
  if (!isMajikMixAdmin(data.claims)) return <main className="media-admin"><p>Your signed-in account does not have the Majik Mix administrator role.</p><a href="/">Return to Majik Mix</a></main>;
  const catalog = await getMediaCatalog();
  return <main className="media-admin"><header><a href="/">← Majik Mix</a><p className="eyebrow">MAJIK MIX · ADMIN</p><h1>Media library</h1><p>Upload audio that Majik Mix owns or is licensed to distribute. Published files can be downloaded by anyone.</p></header><MediaManager audio={catalog.audio} artists={catalog.artists} /></main>;
}
