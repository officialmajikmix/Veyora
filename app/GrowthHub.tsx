"use client";

import { useState } from "react";

const shareItems = [
  { title: "Share the beat previews", detail: "Send artists straight to the Majik Mix beat library.", href: "#beats", action: "Share beat previews" },
  { title: "Invite a collaborator", detail: "Introduce a vocalist, producer, or songwriter to the studio.", href: "#services", action: "Share services" },
  { title: "Spread a studio story", detail: "Share a behind-the-scenes clip on your own social channel.", href: "#videos", action: "Share video section" },
];

export function GrowthHub() {
  const [message, setMessage] = useState("");

  async function share(href: string, title: string) {
    const url = new URL(href, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title: "Majik Mix", text: title, url });
        setMessage("Thanks for sharing Majik Mix.");
        return;
      }
      await navigator.clipboard.writeText(url);
      setMessage("Link copied. Share it with your music community.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessage("Sharing is unavailable here. Copy the site address from your browser to share it.");
    }
  }

  return (
    <section className="growth-hub" id="community" aria-labelledby="growth-title">
      <div className="growth-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-rule" /> THE MAJIK MIX COMMUNITY</div>
          <h2 id="growth-title">Good sounds<br /><em>travel together.</em></h2>
        </div>
        <p>Help more artists find beats, production, and studio services. Share a preview or introduce a collaborator who could use a hand with their next release.</p>
      </div>

      <div className="growth-grid">
        <div className="growth-share-panel">
          <span className="growth-kicker">SHARE THE SOUND</span>
          <h3>Make a real introduction.</h3>
          <div className="growth-actions">
            {shareItems.map((item) => (
              <article className="growth-action" key={item.title}>
                <div><h4>{item.title}</h4><p>{item.detail}</p></div>
                <button type="button" onClick={() => share(item.href, item.action)} aria-label={`${item.action} with a friend`}>Share ↗</button>
              </article>
            ))}
          </div>
          <p className="growth-status" role="status" aria-live="polite">{message}</p>
        </div>

        <aside className="growth-program-panel">
          <span className="growth-kicker">REFERRAL BONUS · IN PREPARATION</span>
          <h3>Bring an artist in.<br /><em>Get studio credit.</em></h3>
          <p>We’re preparing a bonus for referrals that become a completed paid booking. The amount, eligibility, and tracking rules will be shown before the program opens. No cash bonus or referral tracking is active yet.</p>
          <div className="growth-reward-note"><span>01</span><span>Reward type planned</span><strong>Majik Mix studio credit</strong></div>
          <p className="growth-policy">Referral credit will be tied to genuine new customers and completed services, with clear terms and fraud checks.</p>
        </aside>
      </div>

      <div className="campaign-card">
        <div><span className="growth-kicker">AUDIENCE GROWTH</span><h3>Reach artists who are looking for their next sound.</h3><p>Organic sharing, creator collaborations, useful studio content, and properly targeted Google Ads can bring interested listeners to Majik Mix.</p></div>
        <div className="campaign-steps" aria-label="Growth activities">
          <span><b>01</b> Share beat previews</span>
          <span><b>02</b> Post real studio clips</span>
          <span><b>03</b> Promote services to artists</span>
        </div>
        <p className="campaign-policy">Google ad clicks or views are never tasks for rewards. Ad traffic must come from genuine interest; this hub won’t pay for, simulate, or request ad interactions.</p>
      </div>
    </section>
  );
}
