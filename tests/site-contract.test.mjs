import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const appRoot = join(projectRoot, "app");

function read(relativePath) {
  return readFileSync(join(projectRoot, relativePath), "utf8");
}

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : /\.(css|tsx|ts)$/.test(entry.name) ? [path] : [];
  });
}

test("the homepage leads with a clear decision-focused promise and real next steps", () => {
  const homepage = read("app/page.tsx");

  assert.match(homepage, /Zie wat uw data al vertelt\./);
  assert.match(homepage, /href="\/contact"/);
  assert.match(homepage, /href="\/cases"/);
  assert.match(homepage, /className="hero-canvas/);
});

test("all customer-facing imagery is owned by the project rather than generic stock URLs", () => {
  const source = sourceFiles(appRoot).map((file) => readFileSync(file, "utf8")).join("\n");
  const requiredAssets = [
    "public/images/magis-signal-hero.webp",
    "public/images/magis-analysis-closeup.webp",
    "public/images/magis-work-session.webp",
  ];

  assert.doesNotMatch(source, /images\.unsplash\.com/);
  for (const asset of requiredAssets) {
    assert.equal(existsSync(join(projectRoot, asset)), true, `${asset} must be project-owned`);
  }
});

test("images reserve layout space and only above-fold visuals load eagerly", () => {
  const site = read("app/site.tsx");
  const homepage = read("app/page.tsx");
  const otherSource = sourceFiles(appRoot)
    .filter((file) => !file.endsWith("site.tsx") && !file.includes(`${join("app", "papa")}`))
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");

  assert.match(site, /export function SiteImage/);
  assert.match(site, /width=\{dimensions\.width\}/);
  assert.match(site, /height=\{dimensions\.height\}/);
  assert.match(site, /loading=\{priority \? "eager" : "lazy"\}/);
  assert.match(homepage, /<SiteImage[\s\S]*?priority/);
  assert.doesNotMatch(otherSource, /<img\b/);
});

test("motion adds meaning without excluding visitors who prefer reduced motion", () => {
  const homepage = read("app/page.tsx");
  const layout = read("app/layout.tsx");
  const css = read("app/globals.css");

  assert.equal(existsSync(join(projectRoot, "app/motion.tsx")), true);
  assert.match(layout, /<MotionSystem \/>/);
  assert.ok((homepage.match(/data-reveal/g) ?? []).length >= 6);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("navigation stays readable before the client motion controller starts", () => {
  const css = read("app/globals.css");
  const baseHeader = css.match(/\.site-header\s*\{([\s\S]*?)\}/)?.[1] ?? "";

  assert.match(baseHeader, /background:/);
  assert.match(baseHeader, /backdrop-filter:/);
});

test("the mobile menu owns the short viewport while it is open", () => {
  const css = read("app/globals.css");
  const motion = read("app/motion.tsx");

  assert.match(css, /body:has\(\.mobile-menu\[open\]\)/);
  assert.match(css, /height:\s*calc\(100dvh - var\(--header-height\)\)/);
  assert.match(css, /overscroll-behavior:\s*contain/);
  assert.match(motion, /\.inert\s*=/);
  assert.match(motion, /event\.key\s*===\s*"Escape"/);
  assert.match(motion, /menuSummary\?\.focus\(\)/);
});

test("every public route owns concise metadata for trustworthy search previews", () => {
  const routePages = [
    "app/page.tsx",
    "app/diensten/page.tsx",
    "app/werkwijze/page.tsx",
    "app/expertise/page.tsx",
    "app/over-mij/page.tsx",
    "app/cases/page.tsx",
    "app/contact/page.tsx",
    "app/privacy/page.tsx",
  ];

  for (const routePage of routePages) {
    assert.equal(existsSync(join(projectRoot, routePage)), true, `${routePage} must exist`);
    const source = read(routePage);
    assert.match(source, /export const metadata: Metadata/);
    const title = source.match(/title:\s*"([^"]+)"/)?.[1];
    assert.ok(title, `${routePage} must define a literal title`);
    assert.ok(title.length <= 70, `${routePage} title is ${title.length} characters`);
  }

  const layout = read("app/layout.tsx");
  assert.match(layout, /metadataBase:/);
  assert.match(layout, /openGraph:/);

  const metadataHelper = read("app/metadata.ts");
  assert.match(metadataHelper, /type:\s*"website"/);
  assert.match(metadataHelper, /siteName[,\s]/);
  assert.match(metadataHelper, /twitter:/);
  assert.match(metadataHelper, /card:\s*"summary_large_image"/);
});

test("the site exposes crawl, recovery, and accessibility essentials", () => {
  const layout = read("app/layout.tsx");

  assert.equal(existsSync(join(projectRoot, "app/sitemap.ts")), true);
  assert.equal(existsSync(join(projectRoot, "app/robots.ts")), true);
  assert.equal(existsSync(join(projectRoot, "app/not-found.tsx")), true);
  assert.match(layout, /className="skip-link"/);
  assert.match(read("app/site.tsx"), /href="\/privacy"/);
});

test("privacy and recovery pages expose publication essentials", () => {
  const privacy = read("app/privacy/page.tsx");
  const notFound = read("app/not-found.tsx");
  const layout = read("app/layout.tsx");

  assert.match(privacy, /Grondslag/);
  assert.match(privacy, /24 maanden/);
  assert.match(privacy, /7 jaar/);
  assert.match(privacy, /doorgifte/i);
  assert.match(privacy, /niet verplicht/i);
  assert.match(privacy, /overdraagbaarheid/i);
  assert.match(notFound, /export const metadata: Metadata/);
  assert.match(notFound, /alternates:\s*null/);
  assert.doesNotMatch(layout, /email:\s*"mailto:/);
});
