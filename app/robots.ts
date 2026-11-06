import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/auth", "/member"] },
    sitemap: "https://veyora-ecru.vercel.app/sitemap.xml",
  };
}
