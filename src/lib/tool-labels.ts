// Friendly labels for WebMCP tool names, shared by the assistant dock and the
// live status pill so both narrate tool calls the same way.
export const TOOL_LABELS: Record<string, string> = {
	"list-categories": "Browsing categories",
	"search-restaurants": "Searching restaurants",
	"find-meals": "Finding meals",
	"get-restaurant-menu": "Opening the menu",
	"filter-menu-items": "Filtering the menu",
	"add-to-cart": "Adding to cart",
	"remove-from-cart": "Removing from cart",
	"update-cart-item": "Updating your cart",
	"get-cart": "Reviewing your cart",
	"start-checkout": "Opening checkout",
	"place-order": "Placing your order",
	"get-order-status": "Checking your order",
};

export function toolLabel(name: string): string {
	return TOOL_LABELS[name] ?? name;
}
