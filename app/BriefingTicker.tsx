"use client";

import { useState } from "react";

const topics = ["Land & food systems", "Energy infrastructure", "Precious materials", "Source-led research", "Risk in context"];

export function BriefingTicker() {
  const [paused, setPaused] = useState(false);
  const repeated = [...topics, ...topics];

  return (
    <section className={`ticker${paused ? " ticker-paused" : ""}`} aria-label="Veyora briefing topics">
      <span className="ticker-label"><i /> THE VEYORA BRIEFING</span>
      <div className="ticker-window" aria-hidden="true"><div className="ticker-track">{repeated.map((topic, index) => <span className="ticker-item" key={`${topic}-${index}`}><b>✳</b>{topic}</span>)}</div></div>
      <button className="ticker-toggle" type="button" onClick={() => setPaused((value) => !value)} aria-pressed={paused}>{paused ? "Play" : "Pause"}<span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span></button>
      <span className="sr-only">Topics include land and food systems, energy infrastructure, precious materials, source-led research, and risk in context.</span>
    </section>
  );
}
