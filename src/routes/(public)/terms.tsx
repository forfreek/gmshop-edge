import { createFileRoute } from "@tanstack/react-router";
import { LegalPolicyPage } from "#/features/legal/page";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute("/(public)/terms")({
	head: () => ({
		meta: [{ title: `${m.legal_terms_title()} | XNotPro` }],
		links: [{ rel: "canonical", href: "https://xnotpro.site/terms" }],
	}),
	component: () => <LegalPolicyPage kind="terms" />,
});
