// Run against a running preview:
// npx --package @playwright/cli playwright-cli -s=papa-orange run-code --filename=tests/papa-orange.browser.js
async (page) => {
  const base = "http://127.0.0.1:3010";
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  const errors = [];
  const recordError = (error) => errors.push(error.message);
  page.on("pageerror", recordError);
  const results = [];
  const internalLinks = new Set();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const route of ["/", "/diensten", "/werkwijze", "/over-mij", "/expertise", "/cases", "/contact"]) {
    const response = await page.goto(base + route);
    check(response.status() === 200, `A prospective client cannot open ${route}.`);
    const title = await page.title();
    check(title.length <= 70 && title.includes("Gerhard"), `The search title is too long or loses Gerhard's identity on ${route}.`);
    check(await page.locator("h1").count() === 1, `The page needs one clear main subject on ${route}.`);
    check((await page.locator('meta[name="description"]').getAttribute("content"))?.length > 35, `A search visitor needs a useful page description on ${route}.`);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    check(new URL(canonical).href === new URL("https://magisintel.nl" + route).href, `The canonical points to the wrong page on ${route}.`);
    const links = await page.locator("#gm-site a[href]").evaluateAll(nodes => nodes.map(node => node.getAttribute("href")));
    const paths = links.filter(href => href.startsWith("/") && !href.startsWith("//"));
    check(new Set(paths).size >= 3, `Clients cannot explore related pages from ${route}.`);
    paths.forEach(href => internalLinks.add(href));
    const fragmentLinks = links.filter(href => href.startsWith("#"));
    for (const href of fragmentLinks) check(await page.locator(href).count() === 1, `The in-page link ${href} has no destination on ${route}.`);
    check(!links.some(href => href.includes("cdn-cgi/l/email-protection")), "The contact route points to Cloudflare's email placeholder.");
    check(await page.locator('a[href="https://magisdata.nl"]').count() === 1, `The required MagisData backlink is missing on ${route}.`);
    results.push({ route, status: response.status(), titleLength: title.length, internalDestinations: new Set(paths).size });
  }
  for (const href of internalLinks) {
    const response = await page.request.get(base + href);
    check(response.ok(), `A visitor reaches a broken internal link: ${href} (${response.status()}).`);
  }
  const shareImage = await page.request.get(base + "/images/gerhard-social-orange.jpg");
  check(shareImage.ok() && shareImage.headers()["content-type"].includes("image/jpeg"), "Sharing the website loses its preview image.");
  await page.goto(base);
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const layout = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, headlineWidth: document.querySelector(".gm-hero h1").scrollWidth, headlineBox: document.querySelector(".gm-hero h1").clientWidth, cta: document.querySelector(".gm-hero-actions .gm-button").getBoundingClientRect().bottom }));
    check(layout.scroll <= layout.width + 1, `The layout scrolls sideways at ${width}px.`);
    check(layout.headlineWidth <= layout.headlineBox + 1, `The value proposition is clipped at ${width}px.`);
    check(layout.cta < 900, `The primary contact action is hidden below the first screen at ${width}px.`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.getByRole("button", { name: "Menu" });
  await menu.click();
  check(await page.getByRole("navigation", { name: "Mobiele navigatie" }).isVisible(), "A mobile visitor cannot reach the navigation.");
  await page.keyboard.press("Escape");
  check(await menu.getAttribute("aria-expanded") === "false", "The mobile menu does not close with Escape.");
  await menu.click();
  await page.getByRole("navigation", { name: "Mobiele navigatie" }).getByRole("link", { name: "Diensten" }).click();
  await page.waitForURL(base + "/diensten");
  check(await page.getByRole("button", { name: "Menu" }).getAttribute("aria-expanded") === "false", "The mobile menu obscures the service page after navigation.");
  await page.goto(base);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole("heading", { name: "Informatie om op te sturen." }).click();
  check(await page.locator('.gm-service-list details[open]').count() === 1, "Services should reveal one focused explanation at a time.");
  check(await page.getByText("Van losse databronnen naar begrijpelijke managementinformatie", { exact: false }).isVisible(), "Opening a service does not show what the client receives.");
  await page.getByRole("tab", { name: "Verdieping" }).click();
  check(await page.getByRole("heading", { name: "Het gemiddelde vertelt niet alles." }).isVisible(), "The example fails to explain deeper analysis.");
  await page.keyboard.press("ArrowRight");
  check(await page.getByRole("tab", { name: "Vooruitkijken" }).getAttribute("aria-selected") === "true", "Keyboard visitors cannot explore the analysis example.");
  await page.keyboard.press("Home");
  check(await page.getByRole("tab", { name: "Overzicht" }).getAttribute("aria-selected") === "true", "Keyboard navigation cannot return to the first example.");
  check(await page.getByText("Illustratief voorbeeld met fictieve indexwaarden. Geen klantdata.").isVisible(), "Illustrative data could be mistaken for a real client result.");
  await page.locator('.gm-hero-actions a[href="#contact"]').click();
  await page.waitForURL(base + "/#contact");
  const mailLink = await page.locator('#contact a.gm-button').getAttribute("href");
  check(mailLink.startsWith("mailto:contact@magisintel.nl?subject="), "An inquiry would be sent to the wrong address.");
  await page.goto(base + "/contact");
  check(await page.getByText("Opent je mailprogramma. Je kunt je vraag direct meesturen.").isVisible(), "The contact action is unclear about how the inquiry is sent.");
  const missingPage = await page.goto(base + "/pagina-die-niet-bestaat");
  check(missingPage.status() === 404, "An unknown URL should return a real 404 status.");
  check(await page.getByRole("heading", { name: "Deze pagina bestaat niet." }).isVisible(), "A visitor at an unknown URL needs a clear explanation.");
  await page.getByRole("link", { name: "Naar home" }).click();
  await page.waitForURL(base + "/");
  check(await page.locator('link[rel="preload"][href*="magis-analysis-closeup"]').count() === 0, "The fallback wastes visitor bandwidth by loading an invisible photo.");
  check(errors.length === 0, `Visitors encounter JavaScript failures: ${errors.join("; ")}`);
  page.off("pageerror", recordError);
  await page.goto(base);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".gm-about-photo").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector(".gm-about-photo img").naturalWidth > 0);
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: "output/playwright/desktop-home.png", animations: "disabled" });
  await page.screenshot({ path: "output/playwright/desktop-full.png", fullPage: true, animations: "disabled" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "output/playwright/mobile-home.png", animations: "disabled" });
  await page.screenshot({ path: "output/playwright/mobile-full.png", fullPage: true, animations: "disabled" });
  return { passed: true, pages: results, responsiveWidths: [320, 390, 768, 1024, 1440], verified: ["Client navigation", "Working links", "Search metadata", "Share image", "Mobile menu", "Keyboard controls", "Service explanations", "Illustrative data label", "Correct inquiry email", "MagisData backlink", "No JavaScript errors"] };
}
