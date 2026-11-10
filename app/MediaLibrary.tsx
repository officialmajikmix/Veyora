import type { ArtistLink, ArtistVideo, AudioItem } from "./mediaCatalog";
import { StreamAudioPlayer } from "./StreamAudioPlayer";

function fileUrl(base: string, path: string, downloadName?: string) {
  const url = `${base}/${path.split("/").map(encodeURIComponent).join("/")}`;
  return downloadName ? `${url}?download=${encodeURIComponent(downloadName)}` : url;
}

export function MediaLibrary({ audio, artists, videos, storageUrl, videoStorageUrl }: { audio: AudioItem[]; artists: ArtistLink[]; videos: ArtistVideo[]; storageUrl: string; videoStorageUrl: string }) {
  return <section className="music-section music-library" id="library">
    <div className="music-section-heading"><div><div className="eyebrow"><span className="eyebrow-rule" /> PUBLIC DOWNLOADS & ARTIST LINKS</div><h2>Listen. Discover.<br /><em>Take it with you.</em></h2></div><p>Download audio released by Majik Mix and follow artists to their official streaming pages. Copyright and license information is shown with each file.</p></div>
    <div className="library-columns">
      <div className="library-panel"><h3>Audio downloads</h3>{audio.length ? <div className="library-cards">{audio.map((item) => { const extension = item.storage_path.split("/").at(-1)?.split(".").at(-1) ?? "audio"; return <article className="library-audio-card" key={item.id}><div><span>{item.artist}</span><h4>{item.title}</h4>{item.description && <p>{item.description}</p>}<small>{item.copyright_notice}</small></div><StreamAudioPlayer src={fileUrl(storageUrl, item.storage_path)} title={item.title} /><div className="library-audio-actions"><span>Stream or save a copy</span><a className="library-download" href={fileUrl(storageUrl, item.storage_path, `${item.title}.${extension}`)} download>Download audio ↓</a></div></article>; })}</div> : <p className="library-empty">New releases and downloadable audio will appear here when published by the Majik Mix team.</p>}</div>
      <div className="library-panel"><h3>Artists & releases</h3>{artists.length ? <div className="artist-link-list">{artists.map((item) => <a className="artist-link-card" key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"><span>{item.platform}</span><strong>{item.artist}</strong><i aria-hidden="true">↗</i></a>)}</div> : <p className="library-empty">Artist profiles and releases will appear here with direct links to their streaming platforms.</p>}</div>
    </div>
    <section className="artist-video-feed" aria-labelledby="artist-video-heading">
      <div className="artist-video-feed-heading"><div><span className="eyebrow"><span className="eyebrow-rule" /> ARTIST VIDEO FEED</span><h3 id="artist-video-heading">Songs in motion.</h3><p>Artist-made clips connected to the song and its original artist.</p></div><a href="/member/videos">Upload your video ↗</a></div>
      {videos.length ? <div className="artist-video-shelf">{videos.map((item) => <article className="artist-video-card" key={item.id}><video controls playsInline preload="metadata" src={fileUrl(videoStorageUrl, item.public_storage_path)} aria-label={`${item.song_title} by ${item.artist}`} /><div className="artist-video-meta"><strong>{item.artist}</strong><span>{item.song_title}</span>{item.caption && <p>{item.caption}</p>}{item.audio_origin === "catalogue" && item.streaming_url ? <a href={item.streaming_url} target="_blank" rel="noopener noreferrer">Open original release ↗</a> : <span className="artist-original-audio">♪ Original audio</span>}</div></article>)}</div> : <p className="library-empty">Artist video uploads will appear here after review.</p>}
    </section>
  </section>;
}
