import type { CSSProperties } from "react";

const channels = ["KICK", "SNARE", "BASS", "KEYS", "LEAD", "VOX", "PAD", "FX", "PERC", "GTR", "SYNTH", "BUS"];

export function AnimatedMixer() {
  return <div className="music-hero-art mixer-scene" aria-hidden="true">
    <div className="mixer-atmosphere" />
    <div className="mixer-console">
      <div className="mixer-console-top"><span>MM · STUDIO DESK</span><span className="mixer-live"><i /> AUTOMIX ONLINE</span><span>SESSION 024 · AFRO FUSION</span></div>
      <div className="mixer-screen"><div className="mixer-screen-head"><span>MASTER BUS</span><strong>MAJIK MIX</strong><span>48 kHz · 24 BIT</span></div><div className="mixer-waveform">{Array.from({ length: 84 }, (_, i) => <i key={i} style={{ "--wave-height": `${18 + ((i * 37 + i * i * 11) % 78)}%` } as CSSProperties} />)}</div><div className="mixer-screen-foot"><span>◉ INPUT</span><span>◉ COMPRESSOR</span><span>◉ LIMITER</span><span>◉ STEREO OUT</span></div></div>
      <div className="mixer-channel-bank">{channels.map((channel, index) => <div className="mixer-channel" key={channel}><div className="mixer-channel-label"><i className={index % 3 === 0 ? "channel-hot" : ""} />{channel}</div><div className="mixer-eq"><i style={{ "--knob-rotation": `${index * 29 - 78}deg` } as CSSProperties} /><i style={{ "--knob-rotation": `${index * 23 - 64}deg` } as CSSProperties} /></div><div className="mixer-vu"><i style={{ "--meter-delay": `${index * -0.19}s` } as CSSProperties} /><i style={{ "--meter-delay": `${index * -0.27 - 0.2}s` } as CSSProperties} /></div><div className="mixer-fader"><i style={{ "--fader-position": `${28 + ((index * 17) % 54)}%` } as CSSProperties} /></div><div className="mixer-channel-bottom"><b>{String(index + 1).padStart(2, "0")}</b><span>−∞</span></div></div>)}</div>
      <div className="mixer-console-bottom"><span>ANALOG CHARACTER · DIGITAL PRECISION</span><span>◉ REC <i /> PLAY <i /> LOOP</span></div>
    </div>
    <div className="mixer-scene-tag"><span>01 / 04</span><strong>BUILD THE FEEL.</strong></div>
  </div>;
}
