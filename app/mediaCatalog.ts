import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export type AudioItem = {
  id: string;
  title: string;
  artist: string;
  description: string;
  copyright_notice: string;
  storage_path: string;
  created_at: string;
};

export type ArtistLink = { id: string; artist: string; platform: string; url: string; created_at: string };

export function isMajikMixAdmin(claims: Record<string, unknown> | null | undefined) {
  const appMetadata = claims?.app_metadata as { role?: unknown; roles?: unknown } | undefined;
  return appMetadata?.role === "admin" || appMetadata?.role === "administrator" ||
    (Array.isArray(appMetadata?.roles) && appMetadata.roles.some((role) => role === "admin" || role === "administrator"));
}

export async function getMediaCatalog() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return { audio: [] as AudioItem[], artists: [] as ArtistLink[], storageUrl: "" };

  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, { cookies: {
    getAll() { return cookieStore.getAll(); },
    setAll(values: { name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }[]) {
      try { values.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch { /* refreshed by proxy */ }
    },
  } });
  const [{ data: audioData }, { data: artistData }] = await Promise.all([
    supabase.from("media_audio").select("id,title,artist,description,copyright_notice,storage_path,created_at").order("created_at", { ascending: false }),
    supabase.from("artist_links").select("id,artist,platform,url,created_at").order("created_at", { ascending: false }),
  ]);
  return {
    audio: (audioData ?? []) as AudioItem[],
    artists: (artistData ?? []) as ArtistLink[],
    storageUrl: `${url}/storage/v1/object/public/majikmix-audio`,
  };
}
