import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VEYORA — Real assets, clearer context",
  description: "An informational preview for exploring real-world asset categories, due diligence principles, investor education and source-led briefings.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
