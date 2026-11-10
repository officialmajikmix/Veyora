"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

type VideoItem = { id: string; artist: string; song_title: string; caption: string; status: "pending" | "published" | "rejected"; visibility: "public" | "private"; submission_path: string; public_storage_path: string | null; created_at: string; playback_url: string };
type Profile = { display_name: string; avatar_path: string | null } | null;

export function ArtistDashboard({ userId, profile, videos }: { userId: string; profile: Profile; videos: VideoItem[] }) {
  const supabase = useMemo(() => process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ? createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) : null, []);
  const [name, setName] = useState(profile?.display_name ?? "");
  const [avatarPath, setAvatarPath] = useState(profile?.avatar_path ?? null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const avatarUrl = avatarPath && process.env.NEXT_PUBLIC_SUPABASE_URL ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/artist-avatars/${avatarPath.split("/").map(encodeURIComponent).join("/")}` : "";

  async function saveProfile() {
    if (!supabase) return;
    const displayName = name.trim();
    if (!displayName) return setMessage("Add a display name first.");
    setBusy(true);
    const { error } = await supabase.from("artist_profiles").upsert({ user_id: userId, display_name: displayName, avatar_path: avatarPath }, { onConflict: "user_id" });
    setBusy(false); setMessage(error?.message ?? "Profile saved.");
  }

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !supabase) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) return setMessage("Choose a JPG, PNG, or WebP image under 5 MB.");
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${userId}/avatar.${ext}`;
    setBusy(true);
    const { error: uploadError } = await supabase.storage.from("artist-avatars").upload(path, file, { contentType: file.type, upsert: true });
    if (uploadError) { setBusy(false); return setMessage(uploadError.message); }
    const { error } = await supabase.from("artist_profiles").upsert({ user_id: userId, display_name: name.trim() || "Artist", avatar_path: path }, { onConflict: "user_id" });
    if (error) { setBusy(false); return setMessage(error.message); }
    if (avatarPath && avatarPath !== path) await supabase.storage.from("artist-avatars").remove([avatarPath]);
    setAvatarPath(path); setBusy(false); setMessage("Profile picture updated.");
  }

  async function setVisibility(video: VideoItem, visibility: "public" | "private") {
    if (!supabase) return;
    const { error } = await supabase.from("artist_videos").update({ visibility }).eq("id", video.id).eq("artist_user_id", userId);
    if (error) return setMessage(error.message);
    window.location.reload();
  }

  async function deleteVideo(video: VideoItem) {
    if (!supabase || !window.confirm(`Delete “${video.song_title}” from your uploads? This cannot be undone.`)) return;
    setBusy(true);
    const bucket = video.status === "published" ? "majikmix-videos" : "majikmix-video-submissions";
    const path = video.status === "published" ? video.public_storage_path : video.submission_path;
    if (path) await supabase.storage.from(bucket).remove([path]);
    const { error } = await supabase.from("artist_videos").delete().eq("id", video.id).eq("artist_user_id", userId);
    setBusy(false);
    if (error) return setMessage(error.message);
    window.location.reload();
  }

  return <main className="media-admin artist-dashboard"><header><a href="/#top">← Majik Mix</a><p className="eyebrow">YOUR ARTIST SPACE</p><h1>Artist dashboard</h1><p>Manage your profile and every video you’ve uploaded.</p></header>
    <section className="artist-profile-card"><div className="artist-profile-avatar">{avatarUrl ? <img src={avatarUrl} alt="Your profile" /> : <span>♪</span>}</div><div className="artist-profile-fields"><label>Artist display name<input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} placeholder="Your artist name" /></label><label>Profile picture<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void uploadAvatar(event)} disabled={busy} /></label><button type="button" onClick={() => void saveProfile()} disabled={busy}>Save profile</button><p role="status">{message}</p></div></section>
    <section className="artist-dashboard-videos"><div className="artist-dashboard-heading"><div><span className="eyebrow">YOUR LIBRARY</span><h2>Your videos · {videos.length}</h2></div><a className="video-upload-link" href="/member/videos">Upload a video ↗</a></div>
      {videos.length ? <div className="artist-dashboard-grid">{videos.map((video) => <article className="artist-dashboard-video" key={video.id}>{video.playback_url ? <video controls playsInline preload="metadata" src={video.playback_url} /> : <div className="artist-dashboard-video-placeholder">Preview unavailable</div>}<div><strong>{video.song_title}</strong><span>{video.artist}</span><small>{video.status === "published" ? "Approved" : video.status === "rejected" ? "Needs changes" : "In review"} · {video.visibility === "private" ? "Private" : "Public"}</small><div className="artist-dashboard-actions">{video.status === "published" && <button type="button" onClick={() => void setVisibility(video, video.visibility === "private" ? "public" : "private")}>{video.visibility === "private" ? "Make public" : "Make private"}</button>}<button type="button" className="artist-delete-button" disabled={busy} onClick={() => void deleteVideo(video)}>Delete video</button></div></div></article>)}</div> : <p className="library-empty">Your uploads will appear here. Sign in and submit your first video to get started.</p>}
    </section>
  </main>;
}
