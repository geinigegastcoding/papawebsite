import assert from "node:assert/strict";

// Run in the browser-use session with its bound tab and viewport capability.
export async function verifyInteractions(tab, viewport) {
  const base = new URL(await tab.url()).origin;
  await viewport.set({ width: 390, height: 844 });
  await tab.goto(base);
  await tab.playwright.getByLabel("Menu openen", { exact: true }).click();
  await tab.playwright.domSnapshot();
  const opened = await tab.playwright.evaluate(() => ({
    open: document.querySelector(".mobile-menu").open,
    inert: document.querySelector("main").hasAttribute("inert"),
    locked: getComputedStyle(document.body).overflow,
  }));
  assert.equal(opened.open, true);
  assert.equal(opened.inert, true, "An open mobile menu must keep users in navigation");
  assert.equal(opened.locked, "hidden");
  await tab.playwright.locator(".mobile-menu summary").press("Escape");
  await tab.playwright.domSnapshot();
  const closed = await tab.playwright.evaluate(() => ({
    open: document.querySelector(".mobile-menu").open,
    inert: document.querySelector("main").hasAttribute("inert"),
    focused: document.activeElement?.getAttribute("aria-label"),
  }));
  assert.equal(closed.open, false);
  assert.equal(closed.inert, false, "Escape must restore content access");
  assert.equal(closed.focused, "Menu openen", "Escape must restore keyboard focus");
  await tab.playwright.getByLabel("Menu openen", { exact: true }).click();
  await tab.playwright.getByRole("navigation", { name: "Mobiele navigatie" }).getByRole("link", { name: /Werkwijze/ }).click();
  await tab.playwright.getByRole("heading", { level: 1 }).waitFor({ state: "visible" });
  assert.equal(new URL(await tab.url()).pathname, "/werkwijze", "The mobile menu must reach the real public route");
  await tab.goto(base);

  for (const [index, label, overview] of [
    [0, "Eerste contact", "Vraagverkenning"],
    [1, "Analyse", "Analyse overzicht"],
    [2, "Uitwerking", "Uitwerking overzicht"],
    [3, "Oplevering", "Oplevering overzicht"],
    [4, "Bespreking", "Bespreking overzicht"],
  ]) {
    await tab.playwright.getByRole("tab", { name: `${index + 1} ${label}`, exact: true }).click();
    await tab.playwright.getByRole("heading", { name: overview, exact: true }).waitFor({ state: "visible" });
    assert.equal(await tab.playwright.locator(".analysis-table tbody tr").count(), 4);
  }
  await tab.playwright.getByRole("tab", { name: "2 Analyse", exact: true }).click();
  const search = tab.playwright.getByRole("searchbox");
  await search.fill("  XLSX  ");
  await tab.playwright.domSnapshot();
  assert.equal(await tab.playwright.locator(".analysis-table tbody tr").count(), 2, "File search must ignore case and surrounding spaces");
  await search.fill("inconsistente");
  await tab.playwright.domSnapshot();
  assert.match(await tab.playwright.locator(".analysis-table tbody").innerText(), /Rauw1.csv/, "Search must find an issue in the notes, not just a filename");
  await search.fill("bestaat-niet");
  await tab.playwright.domSnapshot();
  assert.match(await tab.playwright.locator(".analysis-table tbody").innerText(), /Geen resultaten/, "An empty search must explain what happened");

  const analysisTab = tab.playwright.getByRole("tab", { name: "2 Analyse", exact: true });
  await analysisTab.press("ArrowRight");
  await tab.playwright.domSnapshot();
  assert.equal(await tab.playwright.getByRole("tab", { name: "3 Uitwerking", exact: true }).getAttribute("aria-selected"), "true");
  assert.equal(await tab.playwright.getByRole("searchbox").getAttribute("value"), "", "Switching steps must reset the old search");
  await tab.playwright.getByRole("tab", { name: "3 Uitwerking", exact: true }).press("End");
  await tab.playwright.domSnapshot();
  assert.equal(await tab.playwright.getByRole("tab", { name: "5 Bespreking", exact: true }).getAttribute("aria-selected"), "true");
  await tab.playwright.getByRole("tab", { name: "5 Bespreking", exact: true }).press("ArrowRight");
  await tab.playwright.domSnapshot();
  assert.equal(await tab.playwright.getByRole("tab", { name: "1 Eerste contact", exact: true }).getAttribute("aria-selected"), "true");
  await tab.playwright.getByRole("tab", { name: "1 Eerste contact", exact: true }).press("ArrowLeft");
  await tab.playwright.domSnapshot();
  assert.equal(await tab.playwright.getByRole("tab", { name: "5 Bespreking", exact: true }).getAttribute("aria-selected"), "true");
  await tab.playwright.getByRole("tab", { name: "5 Bespreking", exact: true }).press("Home");
  await tab.playwright.domSnapshot();
  assert.equal(await tab.playwright.getByRole("tab", { name: "1 Eerste contact", exact: true }).getAttribute("aria-selected"), "true");
  await analysisTab.click();

  assert.equal(await tab.playwright.locator("#comparison-table tbody tr").count(), 4);
  await tab.playwright.getByRole("button", { name: "Bekijk de verschillen", exact: true }).click();
  await tab.playwright.domSnapshot();
  assert.equal(await tab.playwright.locator("#comparison-table tbody tr").count(), 1, "The filter must isolate the actual discrepancy");
  assert.match(await tab.playwright.locator("#comparison-table tbody").innerText(), /INV-086/);
  assert.match(await tab.playwright.locator(".difference-note").innerText(), /90,00/);
  await tab.playwright.getByRole("button", { name: "Toon alle regels", exact: true }).click();
  await tab.playwright.domSnapshot();
  assert.equal(await tab.playwright.locator("#comparison-table tbody tr").count(), 4);
  await tab.playwright.getByRole("link", { name: "Bekijk voorbeeld", exact: true }).click();
  await tab.playwright.domSnapshot();
  assert.equal(new URL(await tab.url()).hash, "#verschillen");
  await tab.playwright.getByRole("link", { name: "Neem contact op", exact: true }).click();
  await tab.playwright.getByRole("heading", { level: 1 }).waitFor({ state: "visible" });
  assert.equal(await tab.playwright.getByRole("link", { name: "Mail Gerhard", exact: true }).getAttribute("href"), "mailto:jgmagis@hotmail.com");
  await tab.playwright.getByText("Is een eerste gesprek echt vrijblijvend?", { exact: true }).click();
  await tab.playwright.domSnapshot();
  assert.equal(await tab.playwright.locator(".faq-item[open]").count(), 1);
  await tab.goto(base);
  return "PASS: mobile navigation, focus recovery, all five tabs, keyboard wrapping, search, empty state, comparison, example link, contact and FAQ";
}

export async function verifyLayouts(tab, viewport) {
  const base = new URL(await tab.url()).origin;
  const results = [];
  for (const [width, height] of [[320, 900], [390, 900], [768, 900], [1024, 900], [1440, 900], [1604, 900], [1920, 1080], [2560, 1440], [1024, 768], [1366, 768], [1604, 768], [1604, 740]]) {
    await viewport.set({ width, height });
    await tab.playwright.domSnapshot();
    const sizes = await tab.playwright.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      page: document.documentElement.scrollWidth,
      heading: document.querySelector("h1").scrollWidth,
      headingBox: document.querySelector("h1").clientWidth,
      heroHeight: document.querySelector(".intel-hero").clientHeight,
      viewportHeight: innerHeight,
      roadInsideHero: (() => {
        const hero = document.querySelector(".intel-hero").getBoundingClientRect();
        const road = document.querySelector(".intel-road").getBoundingClientRect();
        const copy = document.querySelector(".intel-hero-copy").getBoundingClientRect();
        return road.left >= hero.left && road.right <= hero.right && road.bottom <= hero.bottom + 1 && road.top >= copy.bottom;
      })(),
      consistentBackground: [".experience-section", ".data-flow-section", ".reviews-section"].every(selector => getComputedStyle(document.querySelector(selector)).backgroundColor === getComputedStyle(document.querySelector(".intel-hero")).backgroundColor),
      heroCentered: (() => {
        const hero = document.querySelector(".intel-hero").getBoundingClientRect();
        const copy = document.querySelector(".intel-hero-copy").getBoundingClientRect();
        return Math.abs(copy.left + copy.width / 2 - hero.left - hero.width / 2) < 1 && getComputedStyle(document.querySelector(".intel-hero-copy")).textAlign === "center";
      })(),
      portraitNearHeading: (() => {
        const copy = document.querySelector(".intel-hero-copy").getBoundingClientRect();
        const portrait = document.querySelector(".intel-portrait-wrap").getBoundingClientRect();
        const road = document.querySelector(".intel-road").getBoundingClientRect();
        return portrait.top >= copy.top - 1 && portrait.top <= copy.top + 80 && road.top >= portrait.bottom + 31;
      })(),
      sectionGaps: [[".experience-logos", ".data-flow-section h2"], [".flow-link", ".reviews-section .intel-section-heading"], [".review-grid", ".process-example-section .intel-section-heading"], [".process-more", ".comparison-eyebrow"]].map(([previous, next]) => Math.round(document.querySelector(next).getBoundingClientRect().top - document.querySelector(previous).getBoundingClientRect().bottom)),
    }));
    assert.ok(sizes.page <= sizes.viewport + 1, `${width}px: the page must not overflow horizontally`);
    assert.ok(sizes.heading <= sizes.headingBox + 1, `${width}px: the heading must remain readable`);
    assert.equal(sizes.roadInsideHero, true, `${width}px: all vehicles must fit in the hero without covering its text or actions`);
    assert.equal(sizes.consistentBackground, true, `${width}px: the data section must blend with the surrounding page`);
    assert.equal(sizes.heroCentered, true, `${width}px: the hero promise must stay centered on the page`);
    if (width >= 1024) {
      assert.ok(sizes.heroHeight <= sizes.viewportHeight, `${width}px: the complete desktop hero must fit on screen`);
      assert.equal(sizes.portraitNearHeading, true, `${width}px: the face must sit beside the heading and remain separate from the road`);
      assert.ok(sizes.sectionGaps.every(gap => gap >= 80 && gap <= 112), `${width}px: adjacent section padding must not stack into oversized gaps`);
    }
    results.push({ width, height, ...sizes });
  }
  for (const route of ["/diensten", "/werkwijze", "/expertise", "/cases", "/over-mij", "/contact", "/privacy"]) {
    await tab.goto(base + route);
    await tab.playwright.getByRole("heading", { level: 1 }).waitFor({ state: "visible" });
    for (const width of [390, 1440]) {
      await viewport.set({ width, height: 900 });
      await tab.playwright.domSnapshot();
      const overflow = await tab.playwright.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      assert.equal(overflow, false, `${route} at ${width}px must fit the viewport`);
    }
    results.push({ route, responsive: "passed" });
  }
  await tab.goto(base);
  return results;
}
