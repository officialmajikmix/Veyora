"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { ArtistVideo } from "./mediaCatalog";

type CommentRow = { id: string; author_user_id: string; body: string; created_at: string };
type Profile = { user_id: string; display_name: string; avatar_path: string | null };

export function ArtistVideoCard({ video, src, signedIn }: { video: ArtistVideo; src: string; signedIn: boolean }) {
  const supabase = useMemo(() => process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ? createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) : null, []);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [counts, setCounts] = useState({ likes: 0, dislikes: 0 });
  const [reaction, setReaction] = useState<"like" | "dislike" | null>(null);
  const [userId, setUserId] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");

  async function refresh() {
    if (!supabase) return;
    const [{ data: commentData }, { data: countData }, { data: userData }] = await Promise.all([
      supabase.from("video_comments").select("id,author_user_id,body,created_at").eq("video_id", video.id).order("created_at", { ascending: false }).limit(100),
      supabase.rpc("get_video_reaction_counts", { p_video_id: video.id }),
      supabase.auth.getUser(),
    ]);
    const rows = (commentData ?? []) as CommentRow[];
    setComments(rows);
    setCounts(countData?.[0] ?? { likes: 0, dislikes: 0 });
    const uid = userData.user?.id ?? "";
    setUserId(uid);
    if (uid) {
      const { data } = await supabase.from("video_reactions").select("reaction").eq("video_id", video.id).eq("user_id", uid).maybeSingle();
      setReaction(data?.reaction ?? null);
    }
    const ids = [...new Set(rows.map((row) => row.author_user_id))];
    if (ids.length) {
      const { data } = await supabase.from("artist_profiles").select("user_id,display_name,avatar_path").in("user_id", ids);
      setProfiles(Object.fromEntries(((data ?? []) as Profile[]).map((profile) => [profile.user_id, profile])));
    }
  }

  useEffect(() => { void refresh(); }, [video.id, supabase]);

  async function reactTo(kind: "like" | "dislike") {
    if (!supabase || !userId) return;
    if (reaction === kind) await supabase.from("video_reactions").delete().eq("video_id", video.id).eq("user_id", userId);
    else await supabase.from("video_reactions").upsert({ video_id: video.id, user_id: userId, reaction: kind });
    await refresh();
  }

  async function submitComment(event: FormEvent) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!supabase || !trimmed) return;
    const { error } = await supabase.from("video_comments").insert({ video_id: video.id, author_user_id: userId, body: trimmed });
    if (error) { setMessage(error.message); return; }
    setBody(""); setMessage(""); await refresh();
  }

  return <article className="artist-video-card" key={video.id}>
    <video controls playsInline preload="metadata" src={src} aria-label={`${video.song_title} by ${video.artist}`} />
    <div className="artist-video-meta"><strong>{video.artist}</strong><span>{video.song_title}</span>{video.caption && <p>{video.caption}</p>}{video.audio_origin === "catalogue" && video.streaming_url ? <a href={video.streaming_url} target="_blank" rel="noopener noreferrer">{video.streaming_url.includes("open.spotify.com/search/") ? "Search on Spotify ↗" : "Open original release ↗"}</a> : <span className="artist-original-audio">♪ Original audio</span>}</div>
    <div className="video-social"><div className="video-reactions"><button type="button" aria-pressed={reaction === "like"} onClick={() => void reactTo("like")}>👍 {counts.likes}</button><button type="button" aria-pressed={reaction === "dislike"} onClick={() => void reactTo("dislike")}>👎 {counts.dislikes}</button>{!signedIn && <a href="/auth?next=%2F#videos">Sign in to react</a>}</div>
      <section className="video-comments"><h4>Comments · {comments.length}</h4>{signedIn ? <form onSubmit={submitComment}><textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={1200} rows={2} placeholder="Add a comment…" required /><button type="submit" disabled={!body.trim()}>Comment</button></form> : <p><a href="/auth?next=%2F#videos">Sign in</a> to join the conversation.</p>}{message && <p role="status">{message}</p>}
        <div className="video-comment-list">{comments.map((comment) => { const profile = profiles[comment.author_user_id]; const avatar = profile?.avatar_path && process.env.NEXT_PUBLIC_SUPABASE_URL ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/artist-avatars/${profile.avatar_path.split("/").map(encodeURIComponent).join("/")}` : ""; return <article key={comment.id}>{avatar ? <img src={avatar} alt="" /> : <span className="video-avatar-fallback">♪</span>}<div><strong>{profile?.display_name || "Artist"}</strong><p>{comment.body}</p></div></article>; })}</div>
      </section>
    </div>
  </article>;
}
