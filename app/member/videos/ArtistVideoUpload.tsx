"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const videoTypes = new Set(["video/mp4", "video/webm", "video/quicktime"]);
type ArtistLinkOption = { artist: string; platform: string; url: string };

export function ArtistVideoUpload({ userId, defaultArtist, defaultStreamingUrl, matchedPlatform, artistLinks }: { userId: string; defaultArtist: string; defaultStreamingUrl: string; matchedPlatform: string; artistLinks: ArtistLinkOption[] }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [artistName, setArtistName] = useState(defaultArtist);
  const [streamingUrl, setStreamingUrl] = useState(defaultStreamingUrl);
  const [autoPlatform, setAutoPlatform] = useState(matchedPlatform);
  const [manualLink, setManualLink] = useState(false);
  const [audioOrigin, setAudioOrigin] = useState(defaultStreamingUrl ? "catalogue" : "original");
  const supabase = useMemo(() => process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ? createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) : null, []);

  async function submitVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (!supabase) return setMessage("Account services are not configured.");
    const form = new FormData(formElement);
    const file = form.get("video") as File;
    const origin = String(form.get("audio_origin"));
    const suppliedLink = String(form.get("streaming_url") ?? "").trim();
    const resolvedLink = suppliedLink || defaultStreamingUrl;
    if (!file || !videoTypes.has(file.type)) return setMessage("Choose an MP4, WebM, or MOV video.");
    if (file.size > 100 * 1024 * 1024) return setMessage("Videos must be 100 MB or smaller.");
    if (origin === "catalogue") { try { if (new URL(resolvedLink).protocol !== "https:") throw new Error(); } catch { return setMessage("Add the official HTTPS song or artist page link."); } }
    setBusy(true); setMessage("");
    const id = crypto.randomUUID();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
    const path = `${userId}/${id}/${safeName}`;
    const { error: uploadError } = await supabase.storage.from("majikmix-video-submissions").upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) { setBusy(false); return setMessage(uploadError.message); }
    const row = {
      artist_user_id: userId,
      artist: String(form.get("artist") ?? "").trim() || defaultArtist,
      song_title: String(form.get("song_title") ?? "").trim(),
      caption: String(form.get("caption") ?? "").trim(),
      audio_origin: origin,
      streaming_url: origin === "catalogue" ? resolvedLink : null,
      visibility: String(form.get("visibility") ?? "public"),
      submission_path: path,
      status: "pending",
    };
    const { error } = await supabase.from("artist_videos").insert(row);
    if (error) { await supabase.storage.from("majikmix-video-submissions").remove([path]); setBusy(false); return setMessage(error.message); }
    formElement.reset(); setBusy(false); setMessage("Video submitted privately. It will appear in the public video feed after review.");
    window.location.reload();
  }

  function updateArtist(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setArtistName(value);
    if (!manualLink) {
      const normalize = (text: string) => text.trim().toLocaleLowerCase().replace(/\s+/g, " ");
      const matches = artistLinks.filter((link) => normalize(link.artist) === normalize(value));
      const rank = (platform: string) => /spotify/i.test(platform) ? 0 : /apple|youtube|soundcloud/i.test(platform) ? 1 : 2;
      const match = matches.sort((a, b) => rank(a.platform) - rank(b.platform))[0];
      setStreamingUrl(match?.url ?? "");
      setAutoPlatform(match?.platform ?? "");
      setAudioOrigin(match ? "catalogue" : "original");
    }
  }

  function updateLink(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    const cleanValue = value.trim();
    if (cleanValue) {
      setStreamingUrl(value);
      setManualLink(true);
      setAudioOrigin("catalogue");
    } else {
      setManualLink(false);
      const normalize = (text: string) => text.trim().toLocaleLowerCase().replace(/\s+/g, " ");
      const match = artistLinks.find((link) => normalize(link.artist) === normalize(artistName));
      setStreamingUrl(match?.url ?? "");
      setAutoPlatform(match?.platform ?? "");
      setAudioOrigin(match ? "catalogue" : "original");
    }
  }

  return <section className="artist-upload-card"><h2>Upload a song video</h2><p>Upload an original clip you created, a performance, or a video made for a song. Videos can be up to 100 MB.</p>
    <form className="media-admin-form" onSubmit={submitVideo}>
      <label>Artist name<input name="artist" required maxLength={120} value={artistName} onChange={updateArtist} placeholder="Filled from your profile" />{defaultArtist && <small>Suggested from your account profile. Edit it for a different artist.</small>}</label>
      <label>Song title<input name="song_title" required maxLength={160} /></label>
      <label>Video caption<textarea name="caption" maxLength={500} rows={3} placeholder="Tell viewers what is happening in this clip." /></label>
      <label>Where can viewers find this song?
        <select name="audio_origin" value={audioOrigin} onChange={(event) => setAudioOrigin(event.target.value)}><option value="catalogue">The song is in a streaming store</option><option value="original">Original audio — not released in a store</option></select>
      </label>
      <label>Official song or artist streaming link<input name="streaming_url" type="url" value={streamingUrl} onChange={updateLink} placeholder={autoPlatform ? `Auto-linked from your ${autoPlatform} artist page` : "https://…"} />{autoPlatform && !manualLink && <small>Matched to your official {autoPlatform} artist page. Enter a song-specific link to replace it.</small>}</label>
      <label>After review, who can watch this video?<select name="visibility" defaultValue="public"><option value="public">Public — show in the Videos section</option><option value="private">Private — only I can view it in my dashboard</option></select></label>
      <label>Video file<input name="video" type="file" accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov" required /></label>
      <label className="media-admin-check"><input name="rights" type="checkbox" required /> I created this video or have permission to submit it, and I have the rights needed to use the song/audio in it.</label>
      <button type="submit" disabled={busy}>{busy ? "Uploading…" : "Submit video for review"}</button>
    </form><p className="media-admin-status" role="status" aria-live="polite">{message}</p>
  </section>;
}
