import { describe, expect, it } from "vitest";
import { renderBrandedEmail } from "#/features/notifications/email-layout";

describe("branded email layout", () => {
	it("escapes content while preserving codes, line breaks and safe links", () => {
		const html = renderBrandedEmail({
			name: "<Store>",
			subject: 'Verify "email"',
			text: "<script>alert(1)</script>\nCode: 012345\n\nhttps://shop.example/verify?token=abc&next=account",
			url: "https://shop.example",
			locale: "en-US",
		});
		expect(html).toContain("&lt;script&gt;");
		expect(html).not.toContain("<script>");
		expect(html).toContain("&lt;Store&gt;");
		expect(html).toContain("012345");
		expect(html).toContain(
			'href="https://shop.example/verify?token=abc&amp;next=account"',
		);
		expect(html).toContain("<br>");
	});
	it("does not turn an unsafe configured origin into a link", () => {
		const html = renderBrandedEmail({
			name: "Store",
			subject: "Notice",
			text: "Hello",
			url: "javascript:alert(1)",
			locale: "zh-CN",
		});
		expect(html).not.toContain("javascript:");
		expect(html).toContain('lang="zh-CN"');
		expect(html).toContain('role="presentation"');
	});
});
