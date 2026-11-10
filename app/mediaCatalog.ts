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
export type ArtistVideo = {
  id: string;
  artist: string;
  song_title: string;
  caption: string;
  audio_origin: "catalogue" | "original";
  streaming_url: string | null;
  public_storage_path: string;
  created_at: string;
};
export type VideoSubmission = ArtistVideo & {
  artist_user_id: string;
  submission_path: string;
  status: "pending" | "published" | "rejected";
};

export function isMajikMixAdmin(claims: Record<string, unknown> | null | undefined) {
  const appMetadata = claims?.app_metadata as { role?: unknown; roles?: unknown } | undefined;
  return appMetadata?.role === "admin" || appMetadata?.role === "administrator" ||
    (Array.isArray(appMetadata?.roles) && appMetadata.roles.some((role) => role === "admin" || role === "administrator"));
}

export async function getMediaCatalog() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return { audio: [] as AudioItem[], artists: [] as ArtistLink[], videos: [] as ArtistVideo[], storageUrl: "", videoStorageUrl: "" };

  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, { cookies: {
    getAll() { return cookieStore.getAll(); },
    setAll(values: { name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }[]) {
      try { values.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch { /* refreshed by proxy */ }
    },
  } });
  const [{ data: audioData }, { data: artistData }, { data: videoData }] = await Promise.all([
    supabase.from("media_audio").select("id,title,artist,description,copyright_notice,storage_path,created_at").order("created_at", { ascending: false }),
    supabase.from("artist_links").select("id,artist,platform,url,created_at").order("created_at", { ascending: false }),
    supabase.from("artist_videos").select("id,artist,song_title,caption,audio_origin,streaming_url,public_storage_path,created_at").eq("status", "published").not("public_storage_path", "is", null).order("created_at", { ascending: false }),
  ]);
  return {
    audio: (audioData ?? []) as AudioItem[],
    artists: (artistData ?? []) as ArtistLink[],
    videos: (videoData ?? []) as ArtistVideo[],
    storageUrl: `${url}/storage/v1/object/public/majikmix-audio`,
    videoStorageUrl: `${url}/storage/v1/object/public/majikmix-videos`,
  };
}
