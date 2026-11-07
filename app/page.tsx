import { ReferralProgram } from "./ReferralProgram";
import { BriefingTicker } from "./BriefingTicker";
import { TaskCenter } from "./TaskCenter";

const opportunities = [
  {
    index: "01",
    name: "Land & food systems",
    description: "Understand the people, land, inputs and routes to market behind agricultural activity.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85",
    alt: "Rows of crops across a green agricultural landscape",
    theme: "land",
  },
  {
    index: "02",
    name: "Energy infrastructure",
    description: "Explore the assets and operating context that support energy generation and delivery.",
    image: "https://images.unsplash.com/photo-1473341304170-9711a5a4d8c7?auto=format&fit=crop&w=1200&q=85",
    alt: "Wind turbines in a wide landscape at sunset",
    theme: "energy",
  },
  {
    index: "03",
    name: "Precious materials",
    description: "Learn how provenance, custody, liquidity and market exposure shape precious-material assets.",
    image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=1200&q=85",
    alt: "Gold bars arranged under warm light",
    theme: "materials",
  },
];

const principles = [
  ["01", "Show the source", "Every material claim should point to who supplied it, when it was reviewed and what evidence supports it."],
  ["02", "Make risk legible", "Liquidity, concentration, operating and market risks belong beside the opportunity, in plain language."],
  ["03", "Report with context", "Updates should separate verified facts, estimates and projections, with dates and methods clearly stated."],
];

const briefingItems = [
  { category: "LAND & FOOD", title: "What makes an agricultural asset resilient?", type: "Field guide" },
  { category: "ENERGY SYSTEMS", title: "Reading the infrastructure behind energy", type: "Explainer" },
  { category: "PRECIOUS MATERIALS", title: "Provenance, custody and the path of a material", type: "Due diligence" },
];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="arrow-icon">
      {diagonal ? <path d="M5 15 15 5M6 5h9v9" /> : <path d="M3 10h13m-5-5 5 5-5 5" />}
    </svg>
  );
}

function Brand() {
  return <a className="brand" href="#top" aria-label="Veyora home"><span className="brand-mark">V</span><span>VEYORA<span className="brand-period">.</span></span></a>;
}

export default function Home({ memberMode = false }: { memberMode?: boolean }) {
  return (
    <main id="top">
      <div className="notice-bar"><span className="notice-indicator" /> Veyora is an informational preview. No investment products are currently available.</div>
      <header className="site-header">
        <Brand />
        {memberMode && <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#approach">Our approach</a>
          <a href="#landscape">Asset landscape</a>
          <a href="#briefing">Briefing</a>
          <a href="#tasks">Tasks &amp; earn</a>
        </nav>}
        {memberMode ? <a className="header-link" href="/member">Member home <Arrow diagonal /></a> : <>
          <a className="header-link" href="/auth?mode=signin">Sign in <Arrow diagonal /></a>
          <a className="header-link header-signup" href="/auth?mode=signup">Sign up</a>
          <a className="mobile-link" href="/auth?mode=signin">Sign in</a>
          <a className="mobile-link mobile-signup" href="/auth?mode=signup">Sign up</a>
        </>}
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-rule" /> REAL ASSETS. CLEARER CONTEXT.</div>
          <h1 id="hero-title">Capital deserves<br />a <em>clearer view.</em></h1>
          <p className="hero-lede">A research-first way to understand real-world assets, the systems around them and the risks that deserve your attention.</p>
          <div className="hero-actions"><a className="button button-primary" href="#landscape">Explore the landscape <Arrow /></a><a className="quiet-link" href="#approach">How we think <Arrow diagonal /></a></div>
          <div className="hero-caption"><span className="caption-mark">✳</span><span>Independent thinking begins<br /><strong>with better questions.</strong></span></div>
        </div>
        <div className="hero-image" role="img" aria-label="Aerial view across a cultivated landscape at golden hour">
          <div className="hero-image-shade" />
          <div className="image-index">VEYORA FIELD NOTE <span>01 / 03</span></div>
          <div className="image-caption"><span className="caption-line" /> LAND, SYSTEMS &amp; LONG-TERM THINKING</div>
          <div className="image-coordinate">FIELD STUDY<br />INFORMATIONAL PREVIEW</div>
          <span className="hero-image-ring" />
        </div>
        <div className="hero-meta"><span>INFORMATION FIRST</span><span>RISK IN VIEW</span><a href="#approach">SCROLL TO EXPLORE ↓</a></div>
      </section>

      <BriefingTicker />

      {!memberMode && <footer className="public-footer"><a href="/">VEYORA<span>.</span></a><a href="/privacy">Privacy &amp; cookies</a><span>INFORMATION BEFORE CAPITAL.</span></footer>}

      {memberMode && <>
      <section className="intro-band" id="approach">
        <span className="section-index">01 / OUR APPROACH</span>
        <p>Real-world assets are complex.<br /><strong>Understanding should not be.</strong></p>
        <a href="#principles" aria-label="Read the Veyora principles"><Arrow diagonal /></a>
      </section>

      <section className="principles section-shell" id="principles">
        <div className="section-heading">
          <div><div className="eyebrow"><span className="eyebrow-rule" /> A STANDARD TO WORK TOWARD</div><h2>Trust is built<br />in the <em>details.</em></h2></div>
          <p>Veyora is being shaped around the information a careful decision requires: clear sources, honest risk context and reporting that explains what is known—and what is not.</p>
        </div>
        <div className="principle-grid">{principles.map(([number, title, body]) => <article className="principle-card" key={number}><span className="principle-number">{number}</span><span className="principle-icon" aria-hidden="true">{number === "01" ? "↗" : number === "02" ? "◉" : "⌁"}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
        <p className="preview-note">These are product principles, not a representation that specific assets, controls or reporting services are currently available.</p>
      </section>

      <section className="landscape section-shell" id="landscape">
        <div className="section-heading landscape-heading">
          <div><div className="eyebrow"><span className="eyebrow-rule" /> EXPLORE BY ASSET CLASS</div><h2>Start with the<br /><em>real economy.</em></h2></div>
          <p>Explore the systems connected to land, energy and materials. This overview is educational; it does not describe a live offering or an available investment.</p>
        </div>
        <div className="asset-grid">{opportunities.map((item) => <article className={`asset-card asset-${item.theme}`} key={item.index}>
          <div className="asset-image" role="img" aria-label={item.alt} style={{ backgroundImage: `linear-gradient(180deg, #07130d08 30%, #07130dcc 100%), url("${item.image}")` }}><span className="asset-number">{item.index} / 03</span><span className="asset-tag">EDUCATIONAL OVERVIEW</span><span className="asset-orbit" /></div>
          <div className="asset-body"><div><h3>{item.name}</h3><p>{item.description}</p><a className="asset-link" href="#due-diligence">Explore the context <Arrow /></a></div><span className="asset-arrow" aria-hidden="true"><Arrow diagonal /></span></div>
        </article>)}</div>
      </section>

      <section className="due-diligence" id="due-diligence">
        <div className="diligence-visual" role="img" aria-label="Sunlight over a mountain ridge" />
        <div className="diligence-copy"><div className="eyebrow eyebrow-light"><span className="eyebrow-rule" /> BEFORE ANY DECISION</div><h2>Ask what sits<br />behind the <em>headline.</em></h2><p>A serious review looks beyond a category name. It asks who operates the asset, how value is assessed, what could interrupt performance and how an investor might exit.</p><div className="diligence-list"><div><span>01</span> Asset &amp; ownership</div><div><span>02</span> Operator &amp; counterparties</div><div><span>03</span> Valuation &amp; assumptions</div><div><span>04</span> Liquidity, fees &amp; exit</div></div><a className="button button-light" href="#risk">Our risk principles <Arrow /></a><div className="diligence-seal">CONTEXT<br /><span>BEFORE</span><br />CAPITAL</div></div>
      </section>

      <section className="briefing section-shell" id="briefing">
        <div className="briefing-top"><div><div className="eyebrow"><span className="eyebrow-rule" /> THE VEYORA BRIEFING</div><h2>Information with<br /><em>the source attached.</em></h2></div><p>News and explainers should carry a publication date, a direct source and clear labels for fact, analysis and opinion. The feed below is a design preview; live editorial sources are not connected.</p></div>
        <div className="briefing-grid">{briefingItems.map((item, index) => <article className="briefing-card" key={item.title}><div className={`briefing-art briefing-art-${index + 1}`}><span>{item.category}</span><span className="briefing-glyph">{index === 0 ? "↗" : index === 1 ? "⌁" : "◈"}</span></div><div className="briefing-card-body"><div className="briefing-label"><span>{item.type}</span><span>EDITORIAL PREVIEW</span></div><h3>{item.title}</h3><p>Preview topic. A published item will include a date, author, source link and relevant context.</p><a href="#briefing" aria-label={`Read ${item.title} when published`}>Read briefing <Arrow /></a></div></article>)}</div>
        <div className="briefing-foot"><span><i /> FEED STATUS: PREVIEW ONLY</span><span>SOURCE-LINKED UPDATES WILL APPEAR HERE</span></div>
      </section>

      <section className="tasks-section" id="tasks">
        <div className="tasks-intro"><div className="eyebrow eyebrow-light"><span className="eyebrow-rule" /> MEMBER LEARNING PROGRAMME</div><h2>Learn first.<br /><em>Earn with clarity.</em></h2><p>Explore video, form and partner registration tasks. Cash rewards will appear only after the task provider and payout process are connected.</p><a className="button button-light" href="#task-activities">View task preview <Arrow /></a><div className="tasks-watermark" aria-hidden="true">V</div></div>
        <TaskCenter />
      </section>

      <section className="risk-section" id="risk"><div className="risk-symbol">!</div><div className="risk-content"><div className="eyebrow eyebrow-light"><span className="eyebrow-rule" /> IMPORTANT INFORMATION</div><h2>Real opportunity<br />comes with <em>real risk.</em></h2><p>Investing involves risk, including possible loss of capital. Asset values can rise or fall, liquidity may be limited, and past performance does not predict future results. Nothing on this page is investment advice, an offer or a recommendation.</p><p>Veyora is an informational preview. No investment products are currently available through this site. Any future opportunity would require complete documentation, eligibility checks and review for the relevant jurisdiction.</p></div><div className="risk-aside"><span>READ BEFORE YOU ACT</span><div><span>Capital at risk</span><span>Returns not guaranteed</span><span>Terms vary by product</span></div><small>Informational preview only</small></div></section>

      <footer className="site-footer"><div className="footer-main"><div><Brand /><p>A longer view of the real world.</p></div><div className="footer-links"><a href="#approach">Our approach</a><a href="#landscape">Asset landscape</a><a href="#briefing">Briefing</a><a href="#tasks">Tasks &amp; earn</a></div><a className="footer-top-link" href="#top">Back to top ↑</a></div><div className="footer-bottom"><span>© 2026 VEYORA. ALL RIGHTS RESERVED.</span><div><a href="#risk">Risk information</a><a href="/member">Member home</a></div><span>INFORMATION BEFORE CAPITAL.</span></div></footer>
      </>}
    </main>
  );
}
