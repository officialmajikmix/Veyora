import { notFound } from "next/navigation";
import { AuthGate } from "../../../AuthGate";

const briefings = {
  "agricultural-resilience": {
    category: "LAND & FOOD",
    type: "Field guide",
    title: "What makes an agricultural asset resilient?",
    deck: "Resilience is a system property: land, water, farming choices, people and routes to market all shape how production responds to stress.",
    sections: [
      { heading: "Begin with the place", body: "A farm cannot be assessed apart from its setting. Soil condition, water availability, local climate hazards, access roads, storage and nearby services all affect how an operation can respond to disruption. A single good season is not enough to show how the system performs through different conditions." },
      { heading: "Look for resilience in layers", body: "The UN Food and Agriculture Organization describes approaches that can work together: climate-resilient crops, soil and water management, agroforestry, landscape restoration and livelihood diversification. The relevant mix depends on the location and the people who work there. A practice that helps in one watershed or growing season may not transfer unchanged to another." },
      { heading: "Ask what the evidence covers", body: "For each resilience claim, ask who measured it, where and when, against what baseline, and over how many seasons. Separate observed results from forecasts. Check whether the evidence covers the specific land and operator being described, rather than a broad region or a different project." },
      { heading: "Keep the limits visible", body: "Resilience measures do not establish land ownership, operator quality, a reliable valuation, buyer demand or an investor's ability to exit. They also cannot remove weather, disease, input-price or market risks. Treat them as part of a wider review, not a guarantee of output or financial performance." },
    ],
    sources: [
      { label: "FAO — Agrifood solutions for climate, biodiversity and resilience (2026)", url: "https://www.fao.org/interactive/2026/climate-biodiversity-agrifood-solutions/en/" },
      { label: "FAO — Land, soil, water and the Sustainable Development Goals", url: "https://www.fao.org/land-water/overview/Land-soil-water-and-the-sustainable-development-goals/" },
    ],
  },
  "energy-infrastructure": {
    category: "ENERGY SYSTEMS",
    type: "Explainer",
    title: "Reading the infrastructure behind energy",
    deck: "Electricity moves through connected assets and operators. Understanding where a project sits in that system helps reveal what its headline description leaves out.",
    sections: [
      { heading: "Follow the physical path", body: "Electricity is generated, carried over transmission lines and delivered through distribution networks. Substations and transformers connect these stages. A project may own one asset while depending on many others to reach customers; the boundary of the asset matters." },
      { heading: "Reliability depends on the network", body: "The U.S. Energy Information Administration describes reliability in terms that include having enough available resources for demand and keeping the system operating after an outage or equipment failure. Interconnections can provide multiple paths for power to flow, while ageing equipment, constrained connections and difficult siting can limit expansion." },
      { heading: "Map the dependencies", body: "For a specific project, ask who operates the facility, what permits and interconnection rights apply, how maintenance is planned, what happens during outages, and whether transmission capacity is available when output is produced. Distinguish installed capacity from actual generation and from contracted sales." },
      { heading: "Do not confuse infrastructure with returns", body: "A functioning asset does not by itself establish revenue, utilization, a stable price, an attractive valuation or liquidity. Those depend on contracts, regulation, operating performance, counterparties and financing. This overview describes system context; it does not evaluate a particular project." },
    ],
    sources: [
      { label: "U.S. EIA — How electricity is delivered to consumers", url: "https://www.eia.gov/energyexplained/electricity/delivery-to-consumers.php" },
      { label: "U.S. EIA — Electric system reliability glossary", url: "https://www.eia.gov/tools/glossary/index.php?id=e" },
    ],
  },
  "gold-provenance": {
    category: "PRECIOUS MATERIALS",
    type: "Due diligence",
    title: "Provenance, custody and the path of a material",
    deck: "A credible origin claim needs a documented chain of evidence. Traceability tools help, but the method and its limits must be clear.",
    sections: [
      { heading: "Trace the chain, not just the label", body: "Gold can pass through miners, aggregators, traders, transporters and refiners before it reaches a later buyer. OECD guidance describes collecting information about origin, transport, transformation and official payments, then assessing risks in the supply chain. A label or certificate should be checked against the records and controls that support it." },
      { heading: "Understand what the method proves", body: "Physical traceability attempts to follow material through the chain. Chain-of-custody records document transfers and handling. Mass-balance accounting compares volumes entering and leaving a process but does not identify the exact atoms in a particular product. These approaches answer different questions; a volume reconciliation should not be presented as proof of lot-specific physical origin." },
      { heading: "Look for gaps and responses", body: "Ask which suppliers and steps are covered, where records begin and end, how inconsistencies are handled, who independently checks the system, and what happens when a risk is identified. The OECD recommends risk-based due diligence and improvement plans where information is incomplete; a gap should be disclosed and followed up, not hidden behind broad wording." },
      { heading: "Separate provenance from value", body: "Origin records do not establish purity, ownership, custody today, market price or the ability to sell. Nor does a due-diligence process guarantee that harm has been eliminated. Provenance is one evidence stream in a broader review of material, counterparties, controls and legal rights." },
    ],
    sources: [
      { label: "OECD — FAQ on responsible supply chains in artisanal and small-scale gold mining", url: "https://www.oecd.org/content/dam/oecd/en/topics/policy-sub-issues/due-diligence-guidance-for-responsible-business-conduct/minerals/FAQ_Sourcing-Gold-from-ASM-Miners.pdf" },
      { label: "OECD — Due diligence essentials for responsible minerals (2025)", url: "https://www.oecd.org/content/dam/oecd/en/publications/reports/2025/07/responsible-business-conduct-spotlights_f7f722d0/due-diligence-essentials-for-responsible-minerals_d3c5ff56/0e12aaca-en.pdf" },
    ],
  },
} as const;

export default async function BriefingArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = briefings[slug as keyof typeof briefings];
  if (!article) notFound();

  return (
    <AuthGate>
      <main style={{ minHeight: "100vh", padding: "32px 7.2% 80px", background: "#f7f6f1", color: "#17231c" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, maxWidth: 1040, margin: "0 auto" }}>
          <a className="brand" href="/member" aria-label="Veyora member home"><span className="brand-mark">V</span><span>VEYORA<span className="brand-period">.</span></span></a>
          <a href="/member#briefing" style={{ color: "#38634d", fontSize: 13 }}>← Back to briefing</a>
        </header>
        <article style={{ maxWidth: 760, margin: "72px auto 0" }}>
          <div className="eyebrow"><span className="eyebrow-rule" /> {article.category} · {article.type.toUpperCase()}</div>
          <h1 style={{ margin: "22px 0 16px", fontFamily: "var(--font-display, Georgia, serif)", fontSize: "clamp(42px, 7vw, 72px)", lineHeight: 1.02, fontWeight: 400 }}>{article.title}</h1>
          <p style={{ color: "#53625a", fontSize: 19, lineHeight: 1.7 }}>{article.deck}</p>
          <p style={{ color: "#748074", fontSize: 11, letterSpacing: ".08em", margin: "24px 0 40px" }}>VEYORA EDITORIAL · REVIEWED NOVEMBER 7, 2026 · EDUCATIONAL OVERVIEW</p>
          <div style={{ borderTop: "1px solid #deded5" }}>
            {article.sections.map((section, index) => <section key={section.heading} style={{ padding: "28px 0", borderBottom: "1px solid #deded5" }}>
              <span style={{ color: "#89958a", fontSize: 10, letterSpacing: ".14em" }}>0{index + 1}</span>
              <h2 style={{ margin: "8px 0 10px", fontFamily: "var(--font-display, Georgia, serif)", fontSize: 28, fontWeight: 400 }}>{section.heading}</h2>
              <p style={{ margin: 0, color: "#53625a", fontSize: 15, lineHeight: 1.85 }}>{section.body}</p>
            </section>)}
          </div>
          <aside style={{ marginTop: 36, padding: 24, background: "#eef1eb", border: "1px solid #dfe5dc" }}>
            <h2 style={{ margin: "0 0 12px", fontSize: 16, letterSpacing: ".08em" }}>SOURCES &amp; FURTHER READING</h2>
            <ul style={{ display: "grid", gap: 12, margin: 0, paddingLeft: 18, color: "#38634d", fontSize: 14, lineHeight: 1.6 }}>
              {article.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a></li>)}
            </ul>
          </aside>
          <p style={{ marginTop: 24, color: "#748074", fontSize: 12, lineHeight: 1.7 }}>This educational overview summarizes the cited public sources. It is not investment research, advice, an offer or an assessment of a specific asset or operator. Source information may change; consult the original material and qualified professionals for decisions.</p>
        </article>
      </main>
    </AuthGate>
  );
}
