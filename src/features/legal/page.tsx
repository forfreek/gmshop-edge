import { Link } from "@tanstack/react-router";
import { m } from "#/paraglide/messages";

export type PolicyKind = "privacy" | "terms";

export function LegalPolicyPage({ kind }: { kind: PolicyKind }) {
	const privacy = kind === "privacy";
	const sections = privacy
		? [
				[m.legal_privacy_scope_title(), m.legal_privacy_scope_body()],
				[m.legal_privacy_data_title(), m.legal_privacy_data_body()],
				[m.legal_privacy_google_title(), m.legal_privacy_google_body()],
				[m.legal_privacy_purpose_title(), m.legal_privacy_purpose_body()],
				[m.legal_privacy_sharing_title(), m.legal_privacy_sharing_body()],
				[m.legal_privacy_cookies_title(), m.legal_privacy_cookies_body()],
				[m.legal_privacy_analytics_title(), m.legal_privacy_analytics_body()],
				[m.legal_privacy_retention_title(), m.legal_privacy_retention_body()],
				[m.legal_privacy_rights_title(), m.legal_privacy_rights_body()],
				[m.legal_privacy_updates_title(), m.legal_privacy_updates_body()],
			]
		: [
				[m.legal_terms_scope_title(), m.legal_terms_scope_body()],
				[m.legal_terms_account_title(), m.legal_terms_account_body()],
				[m.legal_terms_orders_title(), m.legal_terms_orders_body()],
				[m.legal_terms_delivery_title(), m.legal_terms_delivery_body()],
				[m.legal_terms_refunds_title(), m.legal_terms_refunds_body()],
				[m.legal_terms_faults_title(), m.legal_terms_faults_body()],
				[m.legal_terms_process_title(), m.legal_terms_process_body()],
				[m.legal_terms_use_title(), m.legal_terms_use_body()],
				[m.legal_terms_changes_title(), m.legal_terms_changes_body()],
			];
	return (
		<article className="container max-w-4xl px-4 py-10 sm:py-16">
			<header className="border-border border-b pb-8">
				<p className="font-medium text-primary text-sm">不专业商店 · XNotPro</p>
				<h1 className="mt-3 text-balance font-semibold text-3xl tracking-tight sm:text-4xl">
					{privacy ? m.legal_privacy_title() : m.legal_terms_title()}
				</h1>
				<p className="mt-4 text-muted-foreground text-sm">
					{m.legal_updated()} <time dateTime="2026-11-26">2026-11-26</time>
				</p>
				<p className="mt-5 text-pretty leading-8">
					{privacy ? m.legal_privacy_intro() : m.legal_terms_intro()}
				</p>
			</header>
			<div className="space-y-9 py-9">
				{sections.map(([title, body]) => (
					<section key={title}>
						<h2 className="font-semibold text-xl">{title}</h2>
						<p className="mt-3 whitespace-pre-line text-pretty text-muted-foreground leading-8">
							{body}
						</p>
					</section>
				))}
				{privacy ? (
					<section>
						<h2 className="font-semibold text-xl">{m.legal_google_links()}</h2>
						<ul className="mt-3 space-y-3 text-sm">
							<li>
								<a
									className="text-primary underline underline-offset-4"
									href="https://policies.google.com/technologies/partner-sites"
								>
									{m.legal_google_data_link()}
								</a>
							</li>
							<li>
								<a
									className="text-primary underline underline-offset-4"
									href="https://tools.google.com/dlpage/gaoptout"
								>
									{m.legal_google_optout_link()}
								</a>
							</li>
							<li>
								<a
									className="text-primary underline underline-offset-4"
									href="https://myaccount.google.com/connections"
								>
									{m.legal_google_connections_link()}
								</a>
							</li>
						</ul>
					</section>
				) : null}
				<section className="rounded-2xl bg-muted/40 p-6">
					<h2 className="font-semibold text-xl">{m.legal_contact_title()}</h2>
					<p className="mt-3 text-muted-foreground leading-8">
						{m.legal_contact_body()}
					</p>
					<a
						className="mt-2 inline-flex min-h-6 break-all text-primary underline underline-offset-4"
						href="mailto:support@xnotpro.site"
					>
						support@xnotpro.site
					</a>
				</section>
			</div>
			<nav
				aria-label={m.legal_navigation()}
				className="flex flex-wrap gap-x-6 gap-y-3 border-border border-t pt-6 text-sm"
			>
				<Link
					className="inline-flex min-h-6 items-center text-primary underline underline-offset-4"
					to="/"
				>
					{m.legal_back_home()}
				</Link>
				<Link
					className="inline-flex min-h-6 items-center text-primary underline underline-offset-4"
					to={privacy ? "/terms" : "/privacy"}
				>
					{privacy ? m.legal_terms_title() : m.legal_privacy_title()}
				</Link>
			</nav>
		</article>
	);
}
