import type { MetadataRoute } from "next";

const baseUrl = "https://magisintel.nl";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    ["", 1],
    ["/diensten", 0.9],
    ["/werkwijze", 0.8],
    ["/expertise", 0.8],
    ["/cases", 0.8],
    ["/over-mij", 0.7],
    ["/contact", 0.9],
    ["/privacy", 0.3],
  ] as const;

  return routes.map(([route, priority]) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date("2026-08-09"),
    changeFrequency: route === "" ? "monthly" : "yearly",
    priority,
  }));
}
