import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const description = "Music production, beat licensing, mixing, mastering, and studio recording by MajikMix Worldwide. Request a clear written quote before checkout.";
const title = "MajikMix Worldwide — Music Production & Sound";

export const metadata: Metadata = {
  metadataBase: new URL("https://veyora-ecru.vercel.app"),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "MajikMix Worldwide",
    title,
    description,
    images: ["https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=85"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=85"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}<Analytics /></body>
    </html>
  );
}
