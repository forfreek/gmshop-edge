import type { SupportedLocale } from "#/lib/locales";
import { m } from "#/paraglide/messages";

function escapeHtml(value: string) {
	return value.replace(
		/[&<>"']/g,
		(character) =>
			({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
				character
			] ?? character,
	);
}

export function renderBrandedEmail(input: {
	name: string;
	subject: string;
	text: string;
	url: string;
	locale: SupportedLocale;
}) {
	const notice = m.email_layout_notice({}, { locale: input.locale });
	const prefix = `[${input.name}] `;
	const heading = input.subject.startsWith(prefix)
		? input.subject.slice(prefix.length)
		: input.subject;
	const storeLink = m.email_layout_store_link({}, { locale: input.locale });
	let home = "";
	try {
		const parsed = new URL(input.url);
		if (
			["https:", "http:"].includes(parsed.protocol) &&
			!parsed.username &&
			!parsed.password
		)
			home = parsed.origin;
	} catch {
		/* Invalid configured origins must not produce clickable links. */
	}
	const body = input.text
		.split(/\n\s*\n/)
		.map((paragraph) => {
			const parts = paragraph.split(/(https?:\/\/[^\s<>"']+)/g);
			const content = parts
				.map((part, index) =>
					index % 2 === 1
						? `<a href="${escapeHtml(part)}" style="color:#047857;text-decoration:underline;word-break:break-all">${escapeHtml(part)}</a>`
						: escapeHtml(part).replace(/\n/g, "<br>"),
				)
				.join("");
			return `<p style="margin:0 0 20px;line-height:1.9;color:#334155;overflow-wrap:anywhere">${content}</p>`;
		})
		.join("");
	return `<!doctype html><html lang="${input.locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(input.subject)}</title></head>
<body style="margin:0;padding:0;background:#f3f6f5;font-family:Arial,'Microsoft YaHei',sans-serif;color:#0f172a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f6f5"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border:1px solid #e2e8f0;border-radius:16px">
<tr><td style="padding:28px 28px 20px;border-top:4px solid #00bc7d"><p style="margin:0;color:#047857;font-size:14px;font-weight:bold">${escapeHtml(input.name)}</p><h1 style="margin:18px 0 0;font-size:24px;line-height:1.5;color:#0f172a">${escapeHtml(heading)}</h1></td></tr>
<tr><td style="padding:8px 28px 12px;font-size:15px">${body}</td></tr>
<tr><td style="padding:20px 28px;border-top:1px solid #e2e8f0;font-size:12px;line-height:1.8;color:#64748b">${escapeHtml(notice)}${home ? `<br><a href="${escapeHtml(home)}" style="color:#047857;text-decoration:underline">${escapeHtml(storeLink)}</a>` : ""}</td></tr>
</table></td></tr></table></body></html>`;
}
