import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const description = "An informational preview for exploring real-world asset categories, due diligence principles, investor education and source-led briefings.";

export const metadata: Metadata = {
  metadataBase: new URL("https://veyora-ecru.vercel.app"),
  title: "VEYORA — Real assets, clearer context",
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Veyora",
    title: "VEYORA — Real assets, clearer context",
    description,
    images: ["https://images.unsplash.com/photo-1663908378462-96f985b176bd?auto=format&fit=crop&w=1200&q=85"],
  },
  twitter: {
    card: "summary_large_image",
    title: "VEYORA — Real assets, clearer context",
    description,
    images: ["https://images.unsplash.com/photo-1663908378462-96f985b176bd?auto=format&fit=crop&w=1200&q=85"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}<Analytics /></body>
    </html>
  );
}
