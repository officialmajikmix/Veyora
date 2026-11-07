"use client";

import { useState } from "react";

export function ReferralProgram() {
  const [notice, setNotice] = useState("");

  async function copyInviteLink() {
    const inviteLink = `${window.location.origin}/auth?mode=signup`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setNotice("Sign-up link copied.");
    } catch {
      setNotice("Copy is unavailable here. Open the sign-up page and share its address.");
    }
  }

  return (
    <section id="referrals" className="referral-preview section-shell" aria-labelledby="referral-title">
      <style>{`
        .referral-preview { padding-top: 88px; padding-bottom: 88px; }
        .referral-panel { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 48px; align-items: center; padding: 42px 48px; background: #eef1eb; border: 1px solid #dfe5dc; border-radius: 4px; }
        .referral-kicker { margin-bottom: 18px; color: #66735f; font-size: 10px; font-weight: 600; letter-spacing: .18em; }
        .referral-panel h2 { max-width: 640px; margin: 0 0 16px; color: #17251f; font-family: var(--font-display, Georgia, serif); font-size: clamp(32px, 4vw, 52px); font-weight: 400; line-height: 1.05; }
        .referral-panel p { max-width: 620px; margin: 0; color: #53625a; line-height: 1.7; }
        .referral-bonus-card { display: flex; flex-direction: column; align-items: flex-start; gap: 14px; padding: 24px; background: #fff; border: 1px solid #e1e6de; }
        .referral-bonus-card strong { color: #244534; font-family: var(--font-display, Georgia, serif); font-size: 34px; font-weight: 400; }
        .referral-bonus-card small { display: block; margin-top: 2px; color: #748074; font-size: 10px; letter-spacing: .12em; text-transform: uppercase; }
        .referral-bonus-card button { cursor: pointer; }
        .referral-note { margin-top: 18px !important; font-size: 12px; }
        .referral-status { min-height: 1.4em; color: #244534 !important; font-size: 13px; }
        @media (max-width: 700px) { .referral-preview { padding-top: 60px; padding-bottom: 60px; } .referral-panel { grid-template-columns: 1fr; gap: 28px; padding: 28px 24px; } .referral-bonus-card { padding: 20px; } }
      `}</style>
      <div className="referral-panel">
        <div>
          <div className="referral-kicker">MEMBER REFERRAL · PREVIEW</div>
          <h2 id="referral-title">Share a clearer view.</h2>
          <p>Invite a friend to explore Veyora. The proposed preview bonus is <strong>100 demo points</strong> when a friend joins and confirms an account.</p>
          <p className="referral-note">Referral tracking and points are not active yet. Demo points have no cash value; Veyora currently offers no cash or other rewards.</p>
        </div>
        <div className="referral-bonus-card">
          <div><strong>100</strong><small>Proposed demo points</small></div>
          <button type="button" className="button button-dark" onClick={copyInviteLink}>Copy sign-up link</button>
          <p className="referral-status" aria-live="polite" role="status">{notice}</p>
        </div>
      </div>
    </section>
  );
}
