"use client";

import { useRef, useState } from "react";

export function StreamAudioPlayer({ src, title }: { src: string; title: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try { await audio.play(); } catch { setPlaying(false); }
    } else audio.pause();
  }
  return <div className="stream-audio-player">
    <button type="button" className="stream-play-button" onClick={togglePlayback} aria-label={`${playing ? "Pause" : "Play"} ${title}`}>{playing ? "Ⅱ Pause stream" : "▶ Play stream"}</button>
    <audio ref={audioRef} controls preload="none" src={src} aria-label={`Audio controls for ${title}`} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
  </div>;
}
