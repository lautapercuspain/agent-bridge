import type { CartItem } from "@/types";

interface CheckoutLinkItem {
	itemId: string;
	quantity: number;
	optionIds: string[];
}

export interface CheckoutLinkPayload {
	restaurantId: string;
	items: CheckoutLinkItem[];
	deliveryAddress: string;
}

export function createCheckoutLink(
	origin: string,
	items: CartItem[],
	restaurantId: string,
	deliveryAddress: string,
): string {
	const payload: CheckoutLinkPayload = {
		restaurantId,
		items: items.map((item) => ({
			itemId: item.menuItem.id,
			quantity: item.quantity,
			optionIds: item.selectedOptions.map((option) => option.id),
		})),
		deliveryAddress,
	};
	const url = new URL("/checkout", origin);
	url.searchParams.set("cart", JSON.stringify(payload));
	return url.toString();
}

export function parseCheckoutLink(
	value: string | null,
): CheckoutLinkPayload | null {
	if (!value) return null;
	try {
		const payload = JSON.parse(value) as Partial<CheckoutLinkPayload>;
		if (
			typeof payload.restaurantId !== "string" ||
			typeof payload.deliveryAddress !== "string" ||
			!Array.isArray(payload.items) ||
			payload.items.length === 0
		) {
			return null;
		}
		const items = payload.items.filter(
			(item): item is CheckoutLinkItem =>
				typeof item?.itemId === "string" &&
				typeof item.quantity === "number" &&
				Array.isArray(item.optionIds) &&
				item.optionIds.every((optionId) => typeof optionId === "string"),
		);
		return items.length === payload.items.length
			? {
					restaurantId: payload.restaurantId,
					items,
					deliveryAddress: payload.deliveryAddress,
				}
			: null;
	} catch {
		return null;
	}
}
