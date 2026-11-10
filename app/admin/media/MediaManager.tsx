"use client";

import { FormEvent, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { ArtistLink, AudioItem } from "../../mediaCatalog";

const audioTypes = new Set(["audio/mpeg", "audio/mp4", "audio/aac", "audio/wav", "audio/x-wav", "audio/flac", "audio/ogg"]);

export function MediaManager({ audio: initialAudio, artists: initialArtists }: { audio: AudioItem[]; artists: ArtistLink[] }) {
  const [audio, setAudio] = useState(initialAudio);
  const [artists, setArtists] = useState(initialArtists);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const supabase = useMemo(() => process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ? createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) : null, []);

  async function uploadAudio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (!supabase) return setMessage("Supabase account services are not configured.");
    const form = new FormData(formElement);
    const file = form.get("audio") as File;
    if (!file || !audioTypes.has(file.type)) return setMessage("Choose an MP3, M4A, AAC, WAV, FLAC, or OGG audio file.");
    if (file.size > 50 * 1024 * 1024) return setMessage("Files must be 50 MB or smaller.");
    setBusy(true); setMessage("");
    const id = crypto.randomUUID();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
    const path = `${id}/${safeName}`;
    const { error: uploadError } = await supabase.storage.from("majikmix-audio").upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) { setBusy(false); return setMessage(uploadError.message); }
    const row = { title: String(form.get("title") ?? "").trim(), artist: String(form.get("artist") ?? "").trim(), description: String(form.get("description") ?? "").trim(), copyright_notice: String(form.get("copyright") ?? "").trim(), storage_path: path };
    const { data, error } = await supabase.from("media_audio").insert(row).select("id,title,artist,description,copyright_notice,storage_path,created_at").single();
    if (error) { await supabase.storage.from("majikmix-audio").remove([path]); setBusy(false); return setMessage(error.message); }
    setAudio((items) => [data as AudioItem, ...items]); formElement.reset(); setBusy(false); setMessage("Audio uploaded and published for public download.");
  }

  async function addArtistLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (!supabase) return setMessage("Supabase account services are not configured.");
    const form = new FormData(formElement);
    const url = String(form.get("url") ?? "").trim();
    try { if (new URL(url).protocol !== "https:") throw new Error(); } catch { return setMessage("Enter a valid secure https:// artist streaming link."); }
    setBusy(true); setMessage("");
    const row = { artist: String(form.get("artist") ?? "").trim(), platform: String(form.get("platform") ?? "").trim(), url };
    const { data, error } = await supabase.from("artist_links").insert(row).select("id,artist,platform,url,created_at").single();
    if (error) { setBusy(false); return setMessage(error.message); }
    setArtists((items) => [data as ArtistLink, ...items]); formElement.reset(); setBusy(false); setMessage("Artist link added to the public page.");
  }

  async function removeAudio(item: AudioItem) {
    if (!supabase) return;
    if (!window.confirm(`Remove “${item.title}” from public downloads? The audio file will be deleted.`)) return;
    setBusy(true);
    const { error } = await supabase.from("media_audio").delete().eq("id", item.id);
    if (!error) { await supabase.storage.from("majikmix-audio").remove([item.storage_path]); setAudio((items) => items.filter((row) => row.id !== item.id)); }
    setBusy(false); setMessage(error?.message ?? "Audio removed.");
  }

  async function removeArtist(item: ArtistLink) {
    if (!supabase) return;
    if (!window.confirm(`Remove the public streaming link for “${item.artist}”?`)) return;
    setBusy(true); const { error } = await supabase.from("artist_links").delete().eq("id", item.id);
    if (!error) setArtists((items) => items.filter((row) => row.id !== item.id));
    setBusy(false); setMessage(error?.message ?? "Artist link removed.");
  }

  return <>
    <div className="media-admin-grid">
      <section><h2>Publish audio</h2><p>Maximum 50 MB per file. Only publish audio you own or have permission to distribute.</p>
        <form className="media-admin-form" onSubmit={uploadAudio}>
          <label>Track title<input name="title" required maxLength={120} /></label><label>Artist<input name="artist" required maxLength={120} /></label>
          <label>Short description<textarea name="description" maxLength={500} rows={3} /></label><label>Copyright / license notice<input name="copyright" required maxLength={240} placeholder="© 2026 Artist. All rights reserved." /></label>
          <label>Audio file<input name="audio" type="file" accept="audio/mpeg,audio/mp4,audio/aac,audio/wav,audio/x-wav,audio/flac,audio/ogg,.mp3,.m4a,.aac,.wav,.flac,.ogg" required /></label>
          <label className="media-admin-check"><input name="rights" type="checkbox" required /> I confirm Majik Mix owns this audio or has permission to make it available for download.</label>
          <button type="submit" disabled={busy}>{busy ? "Please wait…" : "Upload and publish"}</button>
        </form>
      </section>
      <section><h2>Add an artist link</h2><p>Visitors are sent directly to the secure streaming URL you provide.</p>
        <form className="media-admin-form" onSubmit={addArtistLink}>
          <label>Artist or release name<input name="artist" required maxLength={120} /></label><label>Streaming platform<input name="platform" required maxLength={60} placeholder="Spotify, Apple Music, YouTube…" /></label><label>Artist / release URL<input name="url" type="url" required placeholder="https://…" /></label><button type="submit" disabled={busy}>{busy ? "Please wait…" : "Add public link"}</button>
        </form>
      </section>
    </div>
    <p className="media-admin-status" role="status" aria-live="polite">{message}</p>
    <section className="media-admin-list"><h2>Published audio</h2>{audio.length ? audio.map((item) => <article key={item.id}><div><strong>{item.title}</strong><span>{item.artist} · {item.copyright_notice}</span></div><button type="button" disabled={busy} onClick={() => removeAudio(item)}>Remove</button></article>) : <p>No public audio yet.</p>}</section>
    <section className="media-admin-list"><h2>Artist links</h2>{artists.length ? artists.map((item) => <article key={item.id}><div><strong>{item.artist}</strong><span>{item.platform} · {item.url}</span></div><button type="button" disabled={busy} onClick={() => removeArtist(item)}>Remove</button></article>) : <p>No public artist links yet.</p>}</section>
  </>;
}
