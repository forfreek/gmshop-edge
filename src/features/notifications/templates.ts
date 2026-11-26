import { z } from "zod";
import { type SupportedLocale, supportedLocales } from "#/lib/locales";

export const commerceNotificationEvents = [
	"order_paid",
	"delivery_ready",
	"automation_ready",
	"automation_failed",
	"refund_succeeded",
	"refund_failed",
	"after_sale_updated",
	"entitlement_expiring",
] as const;

export type CommerceNotificationEvent =
	(typeof commerceNotificationEvents)[number];

export const commerceNotificationEventSchema = z.enum(
	commerceNotificationEvents,
);

const variables = [
	"site_name",
	"order_number",
	"product_name",
	"status",
	"amount",
	"order_url",
	"case_number",
	"resolution",
] as const;

const allowedVariables = new Set<string>(variables);
const variablePattern = /{{\s*([a-z_]+)\s*}}/g;
// C0/C1 controls (CR, LF, NUL, ESC…) plus Unicode line separators: any of
// them inside a substituted value could inject or fold e-mail headers.
// biome-ignore lint/suspicious/noControlCharactersInRegex: the control range is the point of this pattern.
const controlCharacterPattern = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]+/g;

export type NotificationTemplateValues = Record<
	(typeof variables)[number],
	string
>;

/** Collapses control characters in a substituted value to single spaces. */
export function sanitizeNotificationValue(value: string) {
	return value.replace(controlCharacterPattern, " ");
}

export function renderNotificationTemplate(
	template: string,
	values: NotificationTemplateValues,
) {
	return template.replace(variablePattern, (_, key: string) => {
		if (!allowedVariables.has(key)) return "";
		return sanitizeNotificationValue(
			values[key as keyof NotificationTemplateValues] ?? "",
		);
	});
}

export function assertNotificationTemplate(template: string) {
	for (const match of template.matchAll(variablePattern)) {
		if (!allowedVariables.has(match[1] ?? ""))
			throw new Error("notification_template_variable_invalid");
	}
	return template;
}

type BuiltinTemplate = { subject: string; body: string };

const englishTemplates: Record<CommerceNotificationEvent, BuiltinTemplate> = {
	order_paid: {
		subject: "Payment received for {{order_number}}",
		body: "We received {{amount}} for {{order_number}}. View your order: {{order_url}}",
	},
	delivery_ready: {
		subject: "Your order {{order_number}} is ready",
		body: "{{product_name}} is ready. Open your order to view the delivery: {{order_url}}",
	},
	automation_ready: {
		subject: "Your build for {{order_number}} is ready",
		body: "The build for {{product_name}} completed successfully. Download it from {{order_url}}",
	},
	automation_failed: {
		subject: "Build update for {{order_number}}",
		body: "The build for {{product_name}} could not be completed. Check the order or contact support: {{order_url}}",
	},
	refund_succeeded: {
		subject: "Refund completed for {{order_number}}",
		body: "Your refund for {{order_number}} has been completed. View the order: {{order_url}}",
	},
	refund_failed: {
		subject: "Refund update for {{order_number}}",
		body: "The refund for {{order_number}} could not be completed. Please check the order or contact support: {{order_url}}",
	},
	after_sale_updated: {
		subject: "Support case {{case_number}} updated",
		body: "Your support case for {{order_number}} was updated. {{resolution}} View the order: {{order_url}}",
	},
	entitlement_expiring: {
		subject: "Your {{product_name}} access expires soon",
		body: "Your access for {{product_name}} expires soon. Review or renew it here: {{order_url}}",
	},
};

const translatedTemplates: Partial<
	Record<
		SupportedLocale,
		Partial<Record<CommerceNotificationEvent, BuiltinTemplate>>
	>
> = {
	"zh-CN": {
		order_paid: {
			subject: "订单 {{order_number}} 已付款",
			body: "我们已收到订单 {{order_number}} 的 {{amount}}。查看订单：{{order_url}}",
		},
		delivery_ready: {
			subject: "订单 {{order_number}} 已交付",
			body: "{{product_name}} 已准备完成，请打开订单查看交付内容：{{order_url}}",
		},
		automation_ready: {
			subject: "订单 {{order_number}} 的构建已完成",
			body: "{{product_name}} 构建成功，请前往订单下载制品：{{order_url}}",
		},
		automation_failed: {
			subject: "订单 {{order_number}} 的构建状态更新",
			body: "{{product_name}} 构建未完成，请查看订单或联系支持：{{order_url}}",
		},
		refund_succeeded: {
			subject: "订单 {{order_number}} 已完成退款",
			body: "订单 {{order_number}} 的退款已完成。查看订单：{{order_url}}",
		},
		refund_failed: {
			subject: "订单 {{order_number}} 的退款状态更新",
			body: "订单 {{order_number}} 的退款未能完成，请查看订单或联系支持：{{order_url}}",
		},
		after_sale_updated: {
			subject: "售后工单 {{case_number}} 已更新",
			body: "订单 {{order_number}} 的售后工单已更新。{{resolution}} 查看订单：{{order_url}}",
		},
	},
};

export function legacyBuiltinNotificationTemplate(
	event: CommerceNotificationEvent,
	locale: SupportedLocale,
) {
	return translatedTemplates[locale]?.[event] ?? englishTemplates[event];
}

const polishedTemplates: Record<
	SupportedLocale,
	Record<CommerceNotificationEvent, BuiltinTemplate>
> = {
	"zh-CN": {
		order_paid: {
			subject: "[{{site_name}}] 付款已确认",
			body: "您好，\n\n我们已收到您的付款，将按商品说明安排交付。\n\n订单编号：{{order_number}}\n付款金额：{{amount}}\n\n查看订单与详情：{{order_url}}\n\n请妥善保管订单及交付凭据；如需协助，请通过网站联系客服。",
		},
		delivery_ready: {
			subject: "[{{site_name}}] 交付内容已就绪",
			body: "您好，\n\n您购买的商品已准备好，请进入订单查看领取或使用说明。\n\n订单编号：{{order_number}}\n商品名称：{{product_name}}\n\n查看订单与详情：{{order_url}}\n\n请妥善保管订单及交付凭据；如需协助，请通过网站联系客服。",
		},
		automation_ready: {
			subject: "[{{site_name}}] 构建已完成",
			body: "您好，\n\n构建任务已完成，请进入订单查看结果与可用制品。\n\n订单编号：{{order_number}}\n商品名称：{{product_name}}\n\n查看订单与详情：{{order_url}}\n\n请妥善保管订单及交付凭据；如需协助，请通过网站联系客服。",
		},
		automation_failed: {
			subject: "[{{site_name}}] 构建需要处理",
			body: "您好，\n\n本次构建未能完成，请查看订单状态或联系网站客服。\n\n订单编号：{{order_number}}\n商品名称：{{product_name}}\n\n查看订单与详情：{{order_url}}\n\n请妥善保管订单及交付凭据；如需协助，请通过网站联系客服。",
		},
		refund_succeeded: {
			subject: "[{{site_name}}] 退款处理已完成",
			body: "您好，\n\n退款已处理完成，实际到账时间以支付渠道为准。\n\n订单编号：{{order_number}}\n\n查看订单与详情：{{order_url}}\n\n请妥善保管订单及交付凭据；如需协助，请通过网站联系客服。",
		},
		refund_failed: {
			subject: "[{{site_name}}] 退款需要处理",
			body: "您好，\n\n本次退款未能完成，请联系客服核实，避免重复操作。\n\n订单编号：{{order_number}}\n\n查看订单与详情：{{order_url}}\n\n请妥善保管订单及交付凭据；如需协助，请通过网站联系客服。",
		},
		after_sale_updated: {
			subject: "[{{site_name}}] 售后进度已更新",
			body: "您好，\n\n您的售后申请有了新的处理进展。\n\n订单编号：{{order_number}}\n工单编号：{{case_number}}\n处理说明：{{resolution}}\n\n查看订单与详情：{{order_url}}\n\n请妥善保管订单及交付凭据；如需协助，请通过网站联系客服。",
		},
		entitlement_expiring: {
			subject: "[{{site_name}}] 使用权益即将到期",
			body: "您好，\n\n请查看订单中的有效期及续购选项，按需安排后续使用。\n\n商品名称：{{product_name}}\n\n查看订单与详情：{{order_url}}\n\n请妥善保管订单及交付凭据；如需协助，请通过网站联系客服。",
		},
	},
	"en-US": {
		order_paid: {
			subject: "[{{site_name}}] Payment confirmed",
			body: "Hello,\n\nWe have received your payment. Delivery will follow the product description.\n\nOrder: {{order_number}}\nAmount paid: {{amount}}\n\nView your order：{{order_url}}\n\nKeep delivery credentials private. For help, contact support through the store.",
		},
		delivery_ready: {
			subject: "[{{site_name}}] Your delivery is ready",
			body: "Hello,\n\nOpen your order for access and usage instructions.\n\nOrder: {{order_number}}\nProduct: {{product_name}}\n\nView your order：{{order_url}}\n\nKeep delivery credentials private. For help, contact support through the store.",
		},
		automation_ready: {
			subject: "[{{site_name}}] Build completed",
			body: "Hello,\n\nYour build is complete. View the results and available artifacts in your order.\n\nOrder: {{order_number}}\nProduct: {{product_name}}\n\nView your order：{{order_url}}\n\nKeep delivery credentials private. For help, contact support through the store.",
		},
		automation_failed: {
			subject: "[{{site_name}}] Your build needs attention",
			body: "Hello,\n\nThe build could not be completed. Check your order or contact store support.\n\nOrder: {{order_number}}\nProduct: {{product_name}}\n\nView your order：{{order_url}}\n\nKeep delivery credentials private. For help, contact support through the store.",
		},
		refund_succeeded: {
			subject: "[{{site_name}}] Refund processed",
			body: "Hello,\n\nYour refund has been processed. Arrival time depends on the payment provider.\n\nOrder: {{order_number}}\n\nView your order：{{order_url}}\n\nKeep delivery credentials private. For help, contact support through the store.",
		},
		refund_failed: {
			subject: "[{{site_name}}] Your refund needs attention",
			body: "Hello,\n\nThe refund could not be completed. Contact support before retrying.\n\nOrder: {{order_number}}\n\nView your order：{{order_url}}\n\nKeep delivery credentials private. For help, contact support through the store.",
		},
		after_sale_updated: {
			subject: "[{{site_name}}] Support update",
			body: "Hello,\n\nThere is an update to your support request.\n\nOrder: {{order_number}}\nCase: {{case_number}}\nResolution: {{resolution}}\n\nView your order：{{order_url}}\n\nKeep delivery credentials private. For help, contact support through the store.",
		},
		entitlement_expiring: {
			subject: "[{{site_name}}] Your access expires soon",
			body: "Hello,\n\nReview the expiry date and available renewal options in your order.\n\nProduct: {{product_name}}\n\nView your order：{{order_url}}\n\nKeep delivery credentials private. For help, contact support through the store.",
		},
	},
};

export function builtinNotificationTemplate(
	event: CommerceNotificationEvent,
	locale: SupportedLocale,
) {
	return polishedTemplates[locale][event];
}

export const builtinNotificationTemplateRows = supportedLocales.flatMap(
	(locale) =>
		commerceNotificationEvents.flatMap((event) => {
			const template = builtinNotificationTemplate(event, locale);
			return (["email"] as const).map((channel) => ({
				id: `notification-${channel}-${event}-${locale}`,
				event,
				channel,
				locale,
				subject: channel === "email" ? template.subject : null,
				body: template.body,
			}));
		}),
);

export function builtinNotificationTemplateRow(id: string) {
	return builtinNotificationTemplateRows.find((template) => template.id === id);
}
