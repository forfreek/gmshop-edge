import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

// Browser plugin not available. Run Chromium on the CI host, which can reach
// the public custom domain, without adding browser packages to the app.
const root = process.env.RUNNER_TEMP;
assert(root, "RUNNER_TEMP is required");
const { chromium } = await import(
	pathToFileURL(join(root, "policy-browser/node_modules/playwright/index.mjs"))
		.href
);
const output = join(root, "policy-screenshots");
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
try {
	for (const locale of ["zh-CN", "en-US"]) {
		for (const mobile of [false, true]) {
			const context = await browser.newContext({
				locale,
				viewport: mobile
					? { width: 390, height: 844 }
					: { width: 1440, height: 1000 },
				colorScheme: mobile ? "dark" : "light",
			});
			await context.addCookies([
				{
					name: "PARAGLIDE_LOCALE",
					value: locale,
					url: "https://xnotpro.site",
				},
			]);
			const page = await context.newPage();
			const errors = [];
			page.on("pageerror", (error) => errors.push(error.message));
			const response = await page.goto("https://xnotpro.site/", {
				waitUntil: "networkidle",
			});
			assert.equal(response.status(), 200);
			const footer = page.locator("footer");
			await footer
				.getByRole("link", {
					name: locale === "zh-CN" ? "隐私政策" : "Privacy Policy",
					exact: true,
				})
				.click();
			await page.waitForURL("https://xnotpro.site/privacy");
			assert.match(await page.title(), /XNotPro/);
			assert.equal(
				await page.locator("article h1").innerText(),
				locale === "zh-CN" ? "隐私政策" : "Privacy Policy",
			);
			assert.equal(
				await page
					.locator('article a[href="mailto:support@xnotpro.site"]')
					.count(),
				1,
			);
			await page.screenshot({
				path: join(
					output,
					`privacy-${locale}-${mobile ? "mobile-dark" : "desktop-light"}.png`,
				),
				fullPage: true,
			});
			await page
				.locator("article nav")
				.getByRole("link", {
					name: locale === "zh-CN" ? "使用条款" : "Terms of Service",
					exact: true,
				})
				.focus();
			await page.keyboard.press("Enter");
			await page.waitForURL("https://xnotpro.site/terms");
			assert.equal(
				await page.locator("article h1").innerText(),
				locale === "zh-CN" ? "使用条款" : "Terms of Service",
			);
			assert.equal(
				await page
					.locator('article a[href="mailto:support@xnotpro.site"]')
					.count(),
				1,
			);
			assert((await page.locator("article h2").count()) >= 9);
			assert(
				await page.evaluate(
					() => document.documentElement.scrollWidth <= window.innerWidth,
				),
				"Horizontal overflow",
			);
			assert.deepEqual(errors, []);
			await page.screenshot({
				path: join(
					output,
					`terms-${locale}-${mobile ? "mobile-dark" : "desktop-light"}.png`,
				),
				fullPage: true,
			});
			console.log(
				`Passed: ${locale}, ${mobile ? "mobile dark" : "desktop light"}, footer click, keyboard navigation, policy content, no runtime errors`,
			);
			await context.close();
		}
	}
} finally {
	await browser.close();
}
