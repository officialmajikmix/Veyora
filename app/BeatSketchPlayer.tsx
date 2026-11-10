"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type Props = { title: string; style: string; tempo: number };

export function BeatSketchPlayer({ title, style, tempo }: Props) {
  const [playing, setPlaying] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function stop() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    const context = contextRef.current;
    contextRef.current = null;
    if (context && context.state !== "closed") await context.close();
    setPlaying(false);
  }

  async function play() {
    if (playing) { await stop(); return; }
    const context = new AudioContext();
    contextRef.current = context;
    await context.resume();
    const noise = context.createBuffer(1, context.sampleRate, context.sampleRate);
    const channel = noise.getChannelData(0);
    for (let i = 0; i < channel.length; i++) channel[i] = Math.random() * 2 - 1;
    const beatLength = 60 / tempo / 2;
    let step = 0;
    let nextBeat = context.currentTime + 0.05;
    const hit = (kind: "kick" | "snare" | "hat", at: number) => {
      const amp = context.createGain();
      amp.connect(context.destination);
      if (kind === "kick") {
        const osc = context.createOscillator(); osc.type = "sine"; osc.frequency.setValueAtTime(145, at); osc.frequency.exponentialRampToValueAtTime(48, at + 0.16);
        amp.gain.setValueAtTime(0.75, at); amp.gain.exponentialRampToValueAtTime(0.001, at + 0.23); osc.connect(amp); osc.start(at); osc.stop(at + 0.24);
      } else {
        const source = context.createBufferSource(); source.buffer = noise;
        const filter = context.createBiquadFilter(); filter.type = "highpass"; filter.frequency.value = kind === "hat" ? 8000 : 1500; source.connect(filter); filter.connect(amp);
        const duration = kind === "hat" ? 0.045 : 0.14; amp.gain.setValueAtTime(kind === "hat" ? 0.11 : 0.23, at); amp.gain.exponentialRampToValueAtTime(0.001, at + duration); source.start(at); source.stop(at + duration);
      }
    };
    timerRef.current = setInterval(() => {
      while (nextBeat < context.currentTime + 0.12) {
        if (step === 0 || step === 6 || step === 8 || step === 14) hit("kick", nextBeat);
        if (step === 4 || step === 12) hit("snare", nextBeat);
        if (step % 2 === 0 || (tempo > 100 && step === 7)) hit("hat", nextBeat);
        nextBeat += beatLength;
        step = (step + 1) % 16;
      }
    }, 25);
    setPlaying(true);
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); void contextRef.current?.close(); }, []);

  return <article className="music-beat-card music-sketch-card"><div><span>{style}</span><h3>{title}</h3><strong>{tempo} BPM · ORIGINAL DEMO</strong></div><div className={`sketch-wave${playing ? " sketch-wave-playing" : ""}`} aria-hidden="true">{Array.from({ length: 32 }, (_, i) => <i key={i} style={{ "--sketch-height": `${20 + ((i * 19 + i * i * 7) % 75)}%` } as CSSProperties} />)}</div><button type="button" onClick={play} aria-pressed={playing} className="sketch-play-button">{playing ? "Ⅱ  Pause sketch" : "▶  Play sound sketch"}</button></article>;
}
