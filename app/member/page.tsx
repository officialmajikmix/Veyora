import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArtistDashboard } from "./ArtistDashboard";

export const dynamic = "force-dynamic";

export default async function MemberPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return <main className="media-admin"><p>Account services are not configured yet.</p><a href="/">Return to Majik Mix</a></main>;
  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, { cookies: {
    getAll() { return cookieStore.getAll(); },
    setAll(values: { name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }[]) { try { values.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch { /* refreshed by proxy */ } },
  } });
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/auth?next=%2Fmember");
  const userId = String(data.claims.sub ?? "");
  const [{ data: profile }, { data: videos }] = await Promise.all([
    supabase.from("artist_profiles").select("display_name,avatar_path").eq("user_id", userId).maybeSingle(),
    supabase.from("artist_videos").select("id,artist,song_title,caption,status,visibility,submission_path,public_storage_path,created_at").eq("artist_user_id", userId).order("created_at", { ascending: false }),
  ]);
  const items = await Promise.all((videos ?? []).map(async (video) => {
    const bucket = video.status === "published" ? "majikmix-videos" : "majikmix-video-submissions";
    const path = video.status === "published" ? video.public_storage_path : video.submission_path;
    const { data: signed } = path ? await supabase.storage.from(bucket).createSignedUrl(path, 5 * 60) : { data: null };
    return { ...video, playback_url: signed?.signedUrl ?? "" };
  }));
  return <ArtistDashboard userId={userId} profile={profile ?? null} videos={items} />;
}
