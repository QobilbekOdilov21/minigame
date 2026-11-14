/** Run server and browser in one process namespace (also works in restricted CI).
 * Prefer the installed Chromium; portable headless fallback supplied by npm. */
const { chromium } = require("@playwright/test"),
  portable = require("@sparticuz/chromium").default;
const { createServer, rooms } = require("../server/index.cjs");
const fs = require("node:fs"),
  assert = require("node:assert/strict");
(async () => {
  const server = createServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  let browser;
  const report = { errors: [], checks: [], performance: {} };
  const note = (s) => {
    report.checks.push(s);
    console.log("PASS", s);
  };
  try {
    browser = await chromium.launch({
      headless: true,
      executablePath: await portable.executablePath(),
      args: portable.args,
    });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    page.on("pageerror", (e) => report.errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") report.errors.push(m.text());
    });
    const base = "http://127.0.0.1:" + server.address().port;
    await page.goto(base);
    await page.getByRole("button", { name: /MASHQNI BOSHLASH/ }).click();
    await page.waitForFunction(() => window.mazeDebug?.snapshot?.me);
    note("offline worker starts real gameplay with 324 asset regions");
    await page
      .locator("#interaction")
      .filter({ hasText: /IT JUMBOG/ })
      .waitFor({ state: "visible" });
    await page.keyboard.press("e");
    await page.getByRole("dialog").waitFor({ state: "visible" });
    assert.ok(await page.locator("#question").textContent());
    note("nearby E opens a real quiz");
    await page.getByRole("button", { name: "Yopish" }).click();
    const before = await page.evaluate(() => ({
      x: window.mazeDebug.local.x,
      y: window.mazeDebug.local.y,
      ammo: window.mazeDebug.snapshot.me.inventory.rifle.mag,
    }));
    await page.mouse.move(1000, 410);
    await page.keyboard.down("d");
    await page.mouse.down();
    await page.waitForTimeout(350);
    await page.mouse.move(1200, 500);
    await page.waitForTimeout(200);
    await page.mouse.up();
    await page.keyboard.up("d");
    await page.waitForTimeout(150);
    const after = await page.evaluate(() => ({
      x: window.mazeDebug.local.x,
      y: window.mazeDebug.local.y,
      ammo: window.mazeDebug.snapshot.me.inventory.rifle.mag,
    }));
    assert.ok(Math.hypot(after.x - before.x, after.y - before.y) > 0.2);
    assert.ok(after.ammo < before.ammo);
    note("WASD, moving pointer and held fire run simultaneously");
    await page.keyboard.press("b");
    await page.locator("#shopGrid").waitFor({ state: "visible" });
    await page.getByRole("button", { name: "Yopish" }).click();
    await page.keyboard.press("r");
    await page.waitForTimeout(2300);
    const ammo = await page.evaluate(
      () => window.mazeDebug.snapshot.me.inventory.rifle.mag,
    );
    assert.ok(ammo > after.ammo);
    note("shop opens and server reload transfers reserve to magazine");
    await page.waitForTimeout(1000);
    report.performance = await page.evaluate(() => {
      const a = window.mazeDebug.metrics.ms.slice(-180).sort((a, b) => a - b);
      return {
        viewport: [innerWidth, innerHeight],
        fps: window.mazeDebug.metrics.fps,
        meanRenderMs: +(a.reduce((a, b) => a + b, 0) / a.length).toFixed(2),
        p95RenderMs: +a[Math.floor(a.length * 0.95)].toFixed(2),
        renderer: "Chromium software headless; no hardware certification",
      };
    });
    fs.mkdirSync("docs/screenshots", { recursive: true });
    await page.screenshot({ path: "docs/screenshots/gameplay.png" });
    note("isometric gameplay screenshot captured");
    // Two independent browser contexts exercise the public lobby/UI and actual WebSocket backend.
    const c2 = await browser.newContext({
        viewport: { width: 1280, height: 900 },
      }),
      host = await context.newPage(),
      guest = await c2.newPage();
    await host.goto(base);
    await host.getByRole("button", { name: /XONA YARATISH/ }).click();
    await host.locator("#monsters").selectOption("none");
    await host.getByRole("button", { name: /XONANI OCHISH/ }).click();
    await host.locator(".room-code").waitFor({ state: "visible" });
    const code = (await host.locator(".room-code").textContent()).trim();
    await guest.goto(base + "/?room=" + code);
    await guest.locator("#joinName").fill("Guest QA");
    await guest.getByRole("button", { name: "ULANISH →" }).click();
    await guest.locator(".room-code").waitFor({ state: "visible" });
    await host.locator("#startMatch").click();
    await host.waitForFunction(() => window.mazeDebug?.snapshot?.me);
    await guest.waitForFunction(() => window.mazeDebug?.snapshot?.me);
    note(
      "two browser clients create, invite, join and start a multiplayer match",
    );
    // Browser-visible role, same roster and two authoritative player IDs.
    const hs = await host.evaluate(() => ({
      id: window.mazeDebug.snapshot.me.id,
      count: window.mazeDebug.snapshot.roster.length,
    }));
    const gs = await guest.evaluate(() => ({
      id: window.mazeDebug.snapshot.me.id,
      count: window.mazeDebug.snapshot.roster.length,
    }));
    assert.equal(hs.count, 2);
    assert.equal(gs.count, 2);
    assert.notEqual(hs.id, gs.id);
    await host.screenshot({ path: "docs/screenshots/multiplayer.png" });
    const world = rooms.get(code).world,
      actor = world.getPlayer(hs.id),
      terminal = world.terminals[0];
    world.gates = [];
    world.drops = [];
    world.buyEndsAt = 0;
    Object.assign(actor, { x: terminal.x, y: terminal.y });
    await host.waitForFunction(
      ({ x, y }) =>
        Math.hypot(window.mazeDebug.local.x - x, window.mazeDebug.local.y - y) <
        0.3,
      { x: terminal.x, y: terminal.y },
    );
    await host.getByLabel("Izometrik o‘yin maydoni").press("e");
    await host.getByRole("dialog").waitFor({ state: "visible" });
    world.kill(actor, gs.id);
    await host.getByRole("dialog").waitFor({ state: "hidden" });
    note("death closes an open puzzle and prevents stale disabled answers");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(150);
    await page.screenshot({ path: "docs/screenshots/mobile.png" });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    note("390px mobile layout has no horizontal overflow");
    await page.goto(base);
    await page.screenshot({ path: "docs/screenshots/menu.png" });
    assert.equal(report.errors.length, 0, report.errors.join("\n"));
    note("no browser console or uncaught JavaScript errors");
  } catch (e) {
    report.errors.push(e.stack);
    process.exitCode = 1;
  } finally {
    fs.writeFileSync(
      "docs/browser-results.json",
      JSON.stringify(report, null, 2),
    );
    console.log(JSON.stringify(report, null, 2));
    if (browser) await browser.close();
    await new Promise((r) => server.close(r));
    rooms.clear();
    setTimeout(() => process.exit(process.exitCode || 0), 100).unref();
  }
})();
