import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArtistVideoUpload } from "./ArtistVideoUpload";

export const dynamic = "force-dynamic";

export default async function ArtistVideoPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return <main className="media-admin"><p>Account services are not configured yet.</p><a href="/">Return to Majik Mix</a></main>;
  const cookieStore = await cookies();
  const supabase = createServerClient(url, key, { cookies: {
    getAll() { return cookieStore.getAll(); },
    setAll(values: { name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }[]) { try { values.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch { /* refreshed by proxy */ } },
  } });
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/auth?next=%2Fmember%2Fvideos");
  const userId = String(data.claims.sub ?? "");
  const [{ data: submissions }, { data: profile }, { data: artistLinks }, { data: authData }] = await Promise.all([
    supabase.from("artist_videos").select("id,artist,song_title,status,created_at").eq("artist_user_id", userId).order("created_at", { ascending: false }),
    supabase.from("artist_profiles").select("display_name").eq("user_id", userId).maybeSingle(),
    supabase.from("artist_links").select("artist,platform,url").order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);
  const metadata = (authData.user?.user_metadata ?? {}) as Record<string, unknown>;
  const emailName = String(authData.user?.email ?? "").split("@")[0].replace(/[._-]+/g, " ").trim();
  const defaultArtist = profile?.display_name || String(metadata.artist_name ?? metadata.full_name ?? metadata.name ?? metadata.display_name ?? emailName ?? "").trim();
  const normalize = (value: string) => value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
  const matches = (artistLinks ?? []).filter((link) => normalize(link.artist) === normalize(defaultArtist));
  const platformRank = (value: string) => /spotify/i.test(value) ? 0 : /apple|youtube|soundcloud/i.test(value) ? 1 : 2;
  const match = matches.sort((a, b) => platformRank(a.platform) - platformRank(b.platform))[0];
  return <main className="media-admin artist-upload-page"><header><a href="/member">← Artist dashboard</a><p className="eyebrow">ARTIST STUDIO · VIDEO UPLOAD</p><h1>Put your song in motion.</h1><p>Upload a video you created and connect it to the right artist and song. Every upload is kept private until the Majik Mix team reviews it.</p></header><ArtistVideoUpload userId={userId} defaultArtist={defaultArtist} defaultStreamingUrl={match?.url ?? ""} matchedPlatform={match?.platform ?? ""} artistLinks={artistLinks ?? []} /><section className="media-admin-list"><h2>Your submissions</h2>{submissions?.length ? submissions.map((item) => <article key={item.id}><div><strong>{item.song_title}</strong><span>{item.artist} · {item.status === "published" ? "Published" : item.status === "rejected" ? "Needs changes" : "In review"}</span></div></article>) : <p>Your video submissions and review status will show here.</p>}</section></main>;
}
