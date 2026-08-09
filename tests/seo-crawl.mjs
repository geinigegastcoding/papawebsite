const baseUrl = (process.env.SITE_URL ?? "http://127.0.0.1:4173").replace(/\/$/, "");
const canonicalBase = "https://magisintel.nl";
const routes = ["/", "/diensten", "/werkwijze", "/expertise", "/cases", "/over-mij", "/contact", "/privacy"];
const failures = [];
const discovered = new Set();

function contentAttribute(html, attribute, value) {
  const tag = (html.match(new RegExp(`<meta[^>]+${attribute}="${value}"[^>]*>`, "i")) ?? [])[0] ?? "";
  return tag.match(/content="([^"]+)"/i)?.[1] ?? "";
}

function linkAttribute(html, rel) {
  const tag = (html.match(new RegExp(`<link[^>]+rel="${rel}"[^>]*>`, "i")) ?? [])[0] ?? "";
  return tag.match(/href="([^"]+)"/i)?.[1] ?? "";
}

function titleFrom(html) {
  return html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "";
}

for (const route of routes) {
  const response = await fetch(baseUrl + route);
  const html = await response.text();
  const title = titleFrom(html);
  const canonical = linkAttribute(html, "canonical");
  const expectedCanonical = canonicalBase + (route === "/" ? "" : route);
  const links = [...html.matchAll(/href="([^"]+)"/gi)]
    .map((entry) => entry[1])
    .filter((href) => href.startsWith("/") && !href.startsWith("//"))
    .map((href) => href.split("#")[0] || "/");
  const uniqueLinks = [...new Set(links)];
  uniqueLinks.forEach((href) => discovered.add(href));

  if (response.status !== 200) failures.push(`${route}: HTTP ${response.status}`);
  if (!title || title.length > 70) failures.push(`${route}: title length ${title.length}`);
  if (!contentAttribute(html, "name", "description")) failures.push(`${route}: missing description`);
  if (canonical !== expectedCanonical) failures.push(`${route}: canonical ${canonical}`);
  if (contentAttribute(html, "property", "og:type") !== "website") failures.push(`${route}: missing og:type`);
  if (contentAttribute(html, "property", "og:site_name") !== "Magis Data Intelligence") failures.push(`${route}: missing og:site_name`);
  if (!contentAttribute(html, "property", "og:title")) failures.push(`${route}: missing og:title`);
  if (!contentAttribute(html, "property", "og:description")) failures.push(`${route}: missing og:description`);
  if (!contentAttribute(html, "property", "og:image").startsWith(canonicalBase)) failures.push(`${route}: invalid og:image`);
  if (contentAttribute(html, "name", "twitter:card") !== "summary_large_image") failures.push(`${route}: missing twitter:card`);
  if (!contentAttribute(html, "name", "twitter:title")) failures.push(`${route}: missing twitter:title`);
  if (!contentAttribute(html, "name", "twitter:description")) failures.push(`${route}: missing twitter:description`);
  if (!contentAttribute(html, "name", "twitter:image").startsWith(canonicalBase)) failures.push(`${route}: invalid twitter:image`);
  if ((html.match(/<h1(?:\s|>)/gi) ?? []).length !== 1) failures.push(`${route}: expected one H1`);
  if (!/application\/ld\+json/.test(html)) failures.push(`${route}: missing JSON-LD`);
  if (uniqueLinks.length < 3) failures.push(`${route}: only ${uniqueLinks.length} internal links`);
  if (html.includes("/cdn-cgi/l/email-protection")) failures.push(`${route}: rotten Cloudflare email link`);

  console.log(`${route.padEnd(12)} ${response.status} | title ${String(title.length).padStart(2)} | links ${String(uniqueLinks.length).padStart(2)}`);
}

for (const href of [...discovered].sort()) {
  const response = await fetch(baseUrl + href);
  if (!response.ok) failures.push(`Internal link ${href}: HTTP ${response.status}`);
}

const robotsResponse = await fetch(baseUrl + "/robots.txt");
const sitemapResponse = await fetch(baseUrl + "/sitemap.xml");
const missingResponse = await fetch(baseUrl + "/this-route-does-not-exist");
const robots = await robotsResponse.text();
const sitemap = await sitemapResponse.text();
const missing = await missingResponse.text();

if (robotsResponse.status !== 200 || !robots.includes(`${canonicalBase}/sitemap.xml`)) failures.push("robots.txt invalid");
if (sitemapResponse.status !== 200 || !sitemap.includes(`${canonicalBase}/contact`)) failures.push("sitemap.xml invalid");
if (missingResponse.status !== 404) failures.push(`404 route returned ${missingResponse.status}`);
if (titleFrom(missing) !== "Pagina niet gevonden | Magis Data Intelligence") failures.push("404 title invalid");
if (linkAttribute(missing, "canonical")) failures.push("404 must not expose a canonical URL");
if (!contentAttribute(missing, "name", "robots").includes("noindex")) failures.push("404 must be noindex");

console.log(`Checked ${routes.length} pages and ${discovered.size} internal targets.`);

if (failures.length) {
  console.error("\nSEO CRAWL FAILURES");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log("PRODUCTION SEO/LINK CRAWL PASSED");
}
