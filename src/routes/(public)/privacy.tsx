import { createFileRoute } from "@tanstack/react-router";
import { LegalPolicyPage } from "#/features/legal/page";
import { m } from "#/paraglide/messages";

export const Route = createFileRoute("/(public)/privacy")({
	head: () => ({
		meta: [{ title: `${m.legal_privacy_title()} | XNotPro` }],
		links: [{ rel: "canonical", href: "https://xnotpro.site/privacy" }],
	}),
	component: () => <LegalPolicyPage kind="privacy" />,
});
