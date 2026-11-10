import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const description = "Majik Mix creates original beats, full music productions, mixes, masters, studio sessions, sample packs, and music tools.";

export const metadata: Metadata = {
  metadataBase: new URL("https://veyora-ecru.vercel.app"),
  title: "Majik Mix — Music Production & Sound",
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Majik Mix",
    title: "Majik Mix — Music Production & Sound",
    description,
    images: ["https://images.unsplash.com/photo-1663908378462-96f985b176bd?auto=format&fit=crop&w=1200&q=85"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Majik Mix — Music Production & Sound",
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
