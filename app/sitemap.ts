import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {  return [
    { url: "https://veyora-ecru.vercel.app/", changeFrequency: "weekly", priority: 1 },
    { url: "https://veyora-ecru.vercel.app/privacy", changeFrequency: "yearly", priority: 0.4 },
  ];
}
