import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VEYORA — Invest with a longer view",
  description: "Explore real-world asset opportunities across agriculture, energy and precious metals. Understand every opportunity before you invest.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
