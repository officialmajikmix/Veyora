import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy & Cookies | Veyora",
  description: "How Veyora handles website analytics and privacy while the service is in preview.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="policy-page">
      <a className="brand" href="/" aria-label="Veyora home"><span className="brand-mark">V</span><span>VEYORA<span className="brand-period">.</span></span></a>
      <article className="policy-content">
        <div className="eyebrow"><span className="eyebrow-rule" /> PRIVACY &amp; COOKIES</div>
        <h1>Your information,<br /><em>clearly explained.</em></h1>
        <p className="policy-updated">Last updated November 5, 2026</p>
        <p>Veyora is currently an informational website preview. Account registration, paid tasks, partner offers and advertising are not active. This notice describes what is in use today and what will be disclosed before those features are enabled.</p>

        <h2>Website analytics</h2>
        <p>Veyora uses Vercel Web Analytics to understand aggregate page traffic, such as which pages are visited, referring pages, approximate location, browser and device type. Vercel describes this analytics product as using no third-party cookies and as collecting anonymous data for aggregated statistics; its visitor session identifier is discarded after 24 hours. Vercel may process request and deployment information to deliver and secure the website.</p>
        <p>Read <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noreferrer">Vercel’s Web Analytics privacy information</a> and <a href="https://vercel.com/legal/privacy-notice" target="_blank" rel="noreferrer">Vercel’s privacy notice</a> for details about its services.</p>

        <h2>Accounts and task information</h2>
        <p>Veyora’s sign-in service is not connected, and account fields are disabled. The site does not currently accept account credentials, task submissions or payout details. When these features are enabled, this notice will be updated to identify the services involved, the information collected, how it is used and how to make a data request.</p>

        <h2>Advertising and advertising cookies</h2>
        <p>Google advertising is not currently installed on Veyora. If advertising is added, Google and other advertising partners may use cookies or similar technologies to serve or measure ads, including ads based on a user’s visits to this site or other sites. Veyora will update this notice and provide any consent choices required for the locations where the site is available before enabling advertising.</p>
        <p>Google explains publisher privacy disclosures in its <a href="https://support.google.com/adsense/answer/1348695" target="_blank" rel="noreferrer">required content guidance</a>. Users can manage Google ad personalization in <a href="https://adssettings.google.com/" target="_blank" rel="noreferrer">Google Ads Settings</a>.</p>

        <h2>Your choices and privacy requests</h2>
        <p>You can control cookies through your browser settings. Vercel Web Analytics does not use third-party cookies, as described in Vercel’s documentation. Veyora has not yet published a dedicated privacy contact channel; one will be provided before account registration or advertising is enabled.</p>

        <h2>Changes to this notice</h2>
        <p>This notice will change as Veyora adds account, task, payment or advertising services. The date above shows when it was last reviewed.</p>
        <a className="policy-back" href="/">← Back to Veyora</a>
      </article>
    </main>
  );
}
