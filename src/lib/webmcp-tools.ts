"use client";

import { create } from "zustand";
import {
	CATEGORIES,
	getMenuForRestaurant,
	getRestaurantById,
	type MealMatch,
	queryRestaurants,
	resolveRestaurant,
	searchMeals,
} from "@/lib/catalog";
import { createCheckoutLink } from "@/lib/checkout-link";
import { lineUnitPrice, useCartStore } from "@/stores/cart-store";
import { useOrderStore } from "@/stores/order-store";
import type {
	DietaryTag,
	MealType,
	MenuItem,
	MenuOption,
	Restaurant,
} from "@/types";

export type StorefrontView =
	| "browse"
	| "restaurant"
	| "checkout"
	| "order"
	| "meals";

// A human-readable summary of what the agent just filtered by, surfaced in the
// storefront so the person watching sees the intent behind a result set.
export interface AgentIntent {
	title: string;
	chips: string[];
}

export const DEFAULT_ADDRESS = "Home · 1600 Market St, San Francisco";

interface StorefrontFilters {
	sortBy: "recommended" | "rating" | "eta" | "deliveryFee";
	freeDelivery: boolean;
	offers: boolean;
	topRated: boolean;
	under30: boolean;
}

const DEFAULT_FILTERS: StorefrontFilters = {
	sortBy: "recommended",
	freeDelivery: false,
	offers: false,
	topRated: false,
	under30: false,
};

// Agent-driven storefront state. WebMCP tools mutate this, and the UI renders
// from it, so the human sees exactly what the agent is doing in real time.
interface AgentUIState {
	view: StorefrontView;
	restaurants: Restaurant[];
	currentRestaurant: Restaurant | null;
	currentMenu: MenuItem[];
	mealResults: MealMatch[];
	activeIntent: AgentIntent | null;
	selectedCategoryId: string | null;
	browseLabel: string;
	deliveryAddress: string;
	filters: StorefrontFilters;
	activeItem: MenuItem | null;

	showBrowse: (
		restaurants: Restaurant[],
		label?: string,
		categoryId?: string | null,
	) => void;
	showRestaurant: (restaurant: Restaurant, menu: MenuItem[]) => void;
	showMeals: (results: MealMatch[], intent: AgentIntent) => void;
	showCheckout: () => void;
	showOrder: () => void;
	setDeliveryAddress: (address: string) => void;
	setActiveIntent: (intent: AgentIntent | null) => void;
	setFilters: (patch: Partial<StorefrontFilters>) => void;
	setActiveItem: (item: MenuItem | null) => void;
	reset: () => void;
}

export const useAgentUIStore = create<AgentUIState>((set) => ({
	view: "browse",
	restaurants: [],
	currentRestaurant: null,
	currentMenu: [],
	mealResults: [],
	activeIntent: null,
	selectedCategoryId: null,
	browseLabel: "",
	deliveryAddress: DEFAULT_ADDRESS,
	filters: DEFAULT_FILTERS,
	activeItem: null,

	showBrowse: (restaurants, label = "", categoryId = null) =>
		set({
			view: "browse",
			restaurants,
			browseLabel: label,
			selectedCategoryId: categoryId,
			currentRestaurant: null,
			activeIntent: null,
		}),
	showRestaurant: (restaurant, menu) =>
		set({
			view: "restaurant",
			currentRestaurant: restaurant,
			currentMenu: menu,
		}),
	showMeals: (mealResults, activeIntent) =>
		set({
			view: "meals",
			mealResults,
			activeIntent,
			currentRestaurant: null,
		}),
	showCheckout: () => set({ view: "checkout" }),
	showOrder: () => set({ view: "order" }),
	setDeliveryAddress: (deliveryAddress) => set({ deliveryAddress }),
	setActiveIntent: (activeIntent) => set({ activeIntent }),
	setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
	setActiveItem: (activeItem) => set({ activeItem }),
	reset: () =>
		set({
			view: "browse",
			restaurants: [],
			currentRestaurant: null,
			currentMenu: [],
			mealResults: [],
			activeIntent: null,
			selectedCategoryId: null,
			browseLabel: "",
			filters: DEFAULT_FILTERS,
			activeItem: null,
		}),
}));

// Resolve a menu item by id or name from the current menu, then from the
// current restaurant's full menu — so the agent recovers if it passes a name.
function resolveMenuItem(idOrName: string): MenuItem | undefined {
	const state = useAgentUIStore.getState();
	const q = idOrName.trim().toLowerCase();
	const search = (list: MenuItem[]) =>
		list.find((m) => m.id === idOrName) ??
		list.find((m) => m.name.toLowerCase() === q) ??
		list.find(
			(m) =>
				m.name.toLowerCase().includes(q) || q.includes(m.name.toLowerCase()),
		);
	const found = search(state.currentMenu);
	if (found) return found;
	if (state.currentRestaurant) {
		const inRestaurant = search(
			getMenuForRestaurant(state.currentRestaurant.id),
		);
		if (inRestaurant) return inRestaurant;
	}
	// find-meals shows dishes spanning many restaurants; resolve from those.
	const inMeals = state.mealResults.find(
		(r) => r.item.id === idOrName || r.item.name.toLowerCase() === q,
	)?.item;
	if (inMeals) return inMeals;
	// Ids look like "<restaurantId>-<n>"; resolve directly from that menu.
	const dash = idOrName.lastIndexOf("-");
	if (dash > 0) {
		const rid = idOrName.slice(0, dash);
		if (getRestaurantById(rid)) {
			const byId = getMenuForRestaurant(rid).find((m) => m.id === idOrName);
			if (byId) return byId;
		}
	}
	return undefined;
}

function cap(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

function text(obj: unknown) {
	return {
		content: [
			{
				type: "text",
				text: typeof obj === "string" ? obj : JSON.stringify(obj),
			},
		],
	};
}

function cartSummary() {
	const cart = useCartStore.getState();
	return {
		restaurant: cart.restaurantName,
		itemCount: cart.getCount(),
		items: cart.items.map((ci) => ({
			id: ci.menuItem.id,
			name: ci.menuItem.name,
			quantity: ci.quantity,
			unitPrice: Number(lineUnitPrice(ci).toFixed(2)),
			lineTotal: Number((lineUnitPrice(ci) * ci.quantity).toFixed(2)),
		})),
		totals: cart.getTotals(),
	};
}

const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

export function createToolDefinitions() {
	return {
		"list-categories": {
			name: "list-categories",
			title: "List food categories",
			description:
				"Discover available food categories such as burgers, pizza, sushi, Indian, and breakfast. Use when the user wants ideas or has not named a cuisine; otherwise call search-restaurants directly.",
			inputSchema: { type: "object", properties: {} },
			annotations: { readOnlyHint: true, untrustedContentHint: false },
			execute: async () =>
				text({
					categories: CATEGORIES.map((c) => ({ id: c.id, name: c.name })),
				}),
		},

		"search-restaurants": {
			name: "search-restaurants",
			title: "Search restaurants",
			description:
				"Find restaurants matching a food, cuisine, or category. Start here for requests like 'find me a burger for one person under $20' by using category 'burgers' or query 'burger'. Returns restaurant ids, ratings, price level, ETA, delivery fee, and offers. Next call get-restaurant-menu. Price level is not the final order total.",
			inputSchema: {
				type: "object",
				properties: {
					query: {
						type: "string",
						description: "Free-text search (e.g. 'spicy ramen', 'vegan')",
					},
					category: {
						type: "string",
						enum: CATEGORY_IDS,
						description: "Category id to filter by",
					},
					cuisine: {
						type: "string",
						description: "Cuisine name (e.g. italian, indian, sushi)",
					},
					priceLevel: {
						type: "string",
						enum: ["$", "$$", "$$$", "$$$$"],
						description: "Price level filter",
					},
					sortBy: {
						type: "string",
						enum: ["recommended", "rating", "eta", "deliveryFee"],
						description: "Sort order",
					},
					freeDelivery: {
						type: "boolean",
						description: "Only show restaurants with free delivery",
					},
					offers: {
						type: "boolean",
						description: "Only show restaurants running an offer/promo",
					},
					topRated: {
						type: "boolean",
						description: "Only show top-rated restaurants (4.6+)",
					},
					under30: {
						type: "boolean",
						description: "Only show restaurants delivering in 30 min or less",
					},
				},
			},
			annotations: { readOnlyHint: true, untrustedContentHint: false },
			execute: async (input: {
				query?: string;
				category?: string;
				cuisine?: string;
				priceLevel?: string;
				sortBy?: "recommended" | "rating" | "eta" | "deliveryFee";
				freeDelivery?: boolean;
				offers?: boolean;
				topRated?: boolean;
				under30?: boolean;
			}) => {
				const results = queryRestaurants({
					categoryId: input.category,
					cuisine: input.cuisine,
					query: input.query,
					priceLevel: input.priceLevel,
					sortBy: input.sortBy,
					freeDelivery: input.freeDelivery,
					offers: input.offers,
					topRated: input.topRated,
					under30: input.under30,
				});
				const label =
					input.query ||
					input.cuisine ||
					(input.category &&
						CATEGORIES.find((c) => c.id === input.category)?.name) ||
					"All restaurants";
				useAgentUIStore
					.getState()
					.showBrowse(results, label, input.category ?? null);
				const chips: string[] = [];
				if (input.query) chips.push(`"${input.query}"`);
				if (input.category) {
					chips.push(
						CATEGORIES.find((c) => c.id === input.category)?.name ??
							input.category,
					);
				}
				if (input.cuisine) chips.push(cap(input.cuisine));
				if (input.priceLevel) chips.push(input.priceLevel);
				if (input.freeDelivery) chips.push("Free delivery");
				if (input.offers) chips.push("Offers");
				if (input.topRated) chips.push("Top rated");
				if (input.under30) chips.push("Under 30 min");
				if (chips.length) {
					useAgentUIStore.getState().setActiveIntent({ title: label, chips });
				}
				return text({
					count: results.length,
					note: "Pass a restaurant 'id' to get-restaurant-menu.",
					restaurants: results.map((r) => ({
						id: r.id,
						name: r.name,
						cuisine: r.cuisine,
						rating: r.rating,
						priceLevel: r.priceLevel,
						etaMinutes: r.etaMinutes,
						deliveryFee: r.deliveryFee,
						promo: r.promo ?? null,
					})),
					...(results.length === 0
						? {
								hint: "No exact matches. Suggest one of these instead and continue.",
								suggestions: queryRestaurants({})
									.slice(0, 6)
									.map((r) => ({ id: r.id, name: r.name, cuisine: r.cuisine })),
							}
						: {}),
				});
			},
		},

		"get-restaurant-menu": {
			name: "get-restaurant-menu",
			title: "Get restaurant menu",
			description:
				"Get the full menu for a restaurant returned by search-restaurants. Returns item ids, prices, descriptions, sections, and dietary tags. Select suitable items from this result, then use get-cart to verify a total budget because fees and tax are added at checkout.",
			inputSchema: {
				type: "object",
				properties: {
					restaurantId: {
						type: "string",
						description:
							"The restaurant id from search results (name also works)",
					},
				},
				required: ["restaurantId"],
			},
			annotations: { readOnlyHint: true, untrustedContentHint: false },
			execute: async (input: { restaurantId: string }) => {
				const resolved = resolveRestaurant(input.restaurantId);
				if (!resolved) {
					return text({
						error: "That restaurant could not be found.",
						availableRestaurants: queryRestaurants({})
							.slice(0, 8)
							.map((r) => ({ id: r.id, name: r.name })),
					});
				}
				const menu = getMenuForRestaurant(resolved.id);
				useAgentUIStore.getState().showRestaurant(resolved, menu);
				return text({
					restaurant: { id: resolved.id, name: resolved.name },
					sections: [...new Set(menu.map((m) => m.category))],
					items: menu.map((m) => ({
						id: m.id,
						name: m.name,
						price: m.price,
						section: m.category,
						description: m.description,
						dietaryTags: m.dietaryTags,
						popular: m.popular,
					})),
				});
			},
		},

		"filter-menu-items": {
			name: "filter-menu-items",
			title: "Filter menu items",
			description:
				"Narrow the current menu by food name, dietary needs, section, or maximum item price. maxPrice applies per item, not to the full order. To satisfy a total budget, add a candidate and check the final total with get-cart.",
			inputSchema: {
				type: "object",
				properties: {
					restaurantId: {
						type: "string",
						description: "Restaurant id (defaults to the open restaurant)",
					},
					dietaryTags: {
						type: "array",
						items: { type: "string" },
						description:
							"Dietary filters: vegetarian, vegan, gluten-free, dairy-free, nut-free, spicy, halal, kosher",
					},
					maxPrice: { type: "number", description: "Maximum price per item" },
					section: {
						type: "string",
						description: "Menu section (e.g. Popular, Sides, Drinks, Desserts)",
					},
					query: {
						type: "string",
						description: "Text to match in item name/description",
					},
				},
			},
			annotations: { readOnlyHint: true, untrustedContentHint: false },
			execute: async (input: {
				restaurantId?: string;
				dietaryTags?: string[];
				maxPrice?: number;
				section?: string;
				query?: string;
			}) => {
				const store = useAgentUIStore.getState();
				const resolved = input.restaurantId
					? resolveRestaurant(input.restaurantId)
					: store.currentRestaurant;
				if (!resolved) {
					return text({
						error: "Open a restaurant first with get-restaurant-menu.",
					});
				}
				const all = getMenuForRestaurant(resolved.id);
				const q = input.query?.trim().toLowerCase();
				const filtered = all.filter((m) => {
					if (
						input.dietaryTags?.length &&
						!input.dietaryTags.every((t) =>
							m.dietaryTags.includes(t as MenuItem["dietaryTags"][number]),
						)
					)
						return false;
					if (input.maxPrice != null && m.price > input.maxPrice) return false;
					if (
						input.section &&
						m.category.toLowerCase() !== input.section.toLowerCase()
					)
						return false;
					if (
						q &&
						!m.name.toLowerCase().includes(q) &&
						!m.description.toLowerCase().includes(q)
					)
						return false;
					return true;
				});
				store.showRestaurant(resolved, filtered);
				return text({
					count: filtered.length,
					items: filtered.map((m) => ({
						id: m.id,
						name: m.name,
						price: m.price,
						section: m.category,
						dietaryTags: m.dietaryTags,
					})),
				});
			},
		},

		"find-meals": {
			name: "find-meals",
			title: "Find meals across restaurants",
			description:
				"Search individual dishes ACROSS ALL restaurants in one call by intent, budget, and meal time — the fastest way to answer requests like 'a healthy lunch under $15' or 'something spicy for dinner'. Returns matching dishes with their restaurant, price, and image, ranked by relevance, and updates the storefront the user is watching. Prefer this over opening menus one at a time. Then call add-to-cart with an item id. Intent words understood in query include: healthy, light, hearty, spicy, sweet, protein, comfort — plus any dish or cuisine name. maxPrice applies per dish; confirm the full order total with get-cart because fees and tax are added at checkout.",
			inputSchema: {
				type: "object",
				properties: {
					query: {
						type: "string",
						description:
							"Dish, cuisine, or intent keywords (e.g. 'healthy bowl', 'spicy', 'comfort')",
					},
					mealType: {
						type: "string",
						enum: ["breakfast", "lunch", "dinner", "dessert", "drink", "side"],
						description: "Filter by meal time or course",
					},
					maxPrice: {
						type: "number",
						description: "Maximum price per dish in USD",
					},
					dietaryTags: {
						type: "array",
						items: { type: "string" },
						description:
							"Dietary filters: vegetarian, vegan, gluten-free, dairy-free, nut-free, spicy, halal, kosher",
					},
					limit: {
						type: "number",
						description: "Maximum number of dishes to return (default 12)",
					},
				},
			},
			annotations: { readOnlyHint: true, untrustedContentHint: false },
			execute: async (input: {
				query?: string;
				mealType?: MealType;
				maxPrice?: number;
				dietaryTags?: string[];
				limit?: number;
			}) => {
				const results = searchMeals({
					query: input.query,
					mealType: input.mealType,
					maxPrice: input.maxPrice,
					dietaryTags: input.dietaryTags as DietaryTag[] | undefined,
					limit: input.limit,
				});
				const chips: string[] = [];
				if (input.mealType) chips.push(cap(input.mealType));
				if (input.query) chips.push(`"${input.query}"`);
				if (input.maxPrice != null) chips.push(`Under $${input.maxPrice}`);
				for (const t of input.dietaryTags ?? []) chips.push(cap(t));
				const title = input.query
					? cap(input.query)
					: input.mealType
						? `${cap(input.mealType)} picks`
						: "Meal picks";
				useAgentUIStore.getState().showMeals(results, { title, chips });
				return text({
					count: results.length,
					note: "These dishes span multiple restaurants. Pass an item 'id' to add-to-cart; adding from a different restaurant starts a fresh cart.",
					meals: results.map(({ item, restaurant }) => ({
						id: item.id,
						name: item.name,
						price: item.price,
						restaurantId: restaurant.id,
						restaurant: restaurant.name,
						rating: restaurant.rating,
						deliveryFee: restaurant.deliveryFee,
						mealType: item.mealType ?? [],
						dietaryTags: item.dietaryTags,
						image: item.imageUrl,
					})),
					...(results.length === 0
						? {
								hint: "No dishes matched. Relax the budget or broaden the query, then present the closest options.",
							}
						: {}),
				});
			},
		},

		"add-to-cart": {
			name: "add-to-cart",
			title: "Add item to cart",
			description:
				"Add a menu item using its item id, quantity, and optional size or extra option ids. Returns the updated cart and complete totals. For budget requests, inspect the returned total and adjust the cart if it exceeds the user's limit.",
			inputSchema: {
				type: "object",
				properties: {
					itemId: {
						type: "string",
						description: "The menu item id (an item name is also accepted)",
					},
					quantity: { type: "number", description: "Quantity (default 1)" },
					optionIds: {
						type: "array",
						items: { type: "string" },
						description:
							"Optional option ids (e.g. 'large') from the item's option groups",
					},
				},
				required: ["itemId"],
			},
			annotations: { readOnlyHint: false, untrustedContentHint: false },
			execute: async (input: {
				itemId: string;
				quantity?: number;
				optionIds?: string[];
			}) => {
				const store = useAgentUIStore.getState();
				const item = resolveMenuItem(input.itemId);
				if (!item) {
					return text({
						error: "That item isn't on the current menu.",
						availableItems: store.currentMenu
							.slice(0, 12)
							.map((m) => ({ id: m.id, name: m.name, price: m.price })),
					});
				}
				const options: MenuOption[] = [];
				if (input.optionIds?.length && item.optionGroups) {
					for (const group of item.optionGroups) {
						for (const opt of group.options) {
							if (input.optionIds.includes(opt.id)) options.push(opt);
						}
					}
				}
				const qty = Math.max(1, input.quantity ?? 1);
				useCartStore.getState().addItem(item, options, qty);
				return text({
					added: { id: item.id, name: item.name, quantity: qty },
					...cartSummary(),
				});
			},
		},

		"remove-from-cart": {
			name: "remove-from-cart",
			title: "Remove item from cart",
			description:
				"Remove an item from the cart by item id or name. Use to correct a selection or bring an order within budget. Returns the updated cart and totals.",
			inputSchema: {
				type: "object",
				properties: {
					itemId: { type: "string", description: "The menu item id or name" },
				},
				required: ["itemId"],
			},
			annotations: { readOnlyHint: false, untrustedContentHint: false },
			execute: async (input: { itemId: string }) => {
				const removed = useCartStore.getState().removeItem(input.itemId);
				if (!removed) {
					return text({
						error: "That item isn't in the cart.",
						...cartSummary(),
					});
				}
				return text({ removed: input.itemId, ...cartSummary() });
			},
		},

		"update-cart-item": {
			name: "update-cart-item",
			title: "Update cart quantity",
			description:
				"Set the quantity of an item already in the cart using its item id or name. Quantity 0 removes it. Returns recalculated totals for portion or budget adjustments.",
			inputSchema: {
				type: "object",
				properties: {
					itemId: { type: "string", description: "The menu item id or name" },
					quantity: { type: "number", description: "New quantity" },
				},
				required: ["itemId", "quantity"],
			},
			annotations: { readOnlyHint: false, untrustedContentHint: false },
			execute: async (input: { itemId: string; quantity: number }) => {
				useCartStore.getState().updateQuantity(input.itemId, input.quantity);
				return text(cartSummary());
			},
		},

		"get-cart": {
			name: "get-cart",
			title: "Review cart and total",
			description:
				"Get the current cart and authoritative checkout price, including subtotal, delivery fee, service fee, tax, and final total in USD. Always use this to verify a total budget; menu prices alone exclude fees and tax.",
			inputSchema: { type: "object", properties: {} },
			annotations: { readOnlyHint: true, untrustedContentHint: false },
			execute: async () => text(cartSummary()),
		},

		"start-checkout": {
			name: "start-checkout",
			title: "Prepare checkout for review",
			description:
				"Prepare the current cart for human review without placing it. Returns an absolute checkoutUrl that must be shown to the user. Opening it restores the items and recalculates prices so a human can review, edit the delivery address, and choose whether to press Place Order.",
			inputSchema: { type: "object", properties: {} },
			annotations: { readOnlyHint: false, untrustedContentHint: false },
			execute: async () => {
				const cart = useCartStore.getState();
				if (cart.items.length === 0) {
					return text({
						error: "The cart is empty. Add items before checking out.",
					});
				}
				const store = useAgentUIStore.getState();
				store.showCheckout();
				const checkoutUrl = createCheckoutLink(
					window.location.origin,
					cart.items,
					cart.restaurantId ?? "",
					store.deliveryAddress,
				);
				return text({
					message:
						"Checkout is ready for human review. Return checkoutUrl to the user; they can review or place the order there.",
					checkoutUrl,
					deliveryAddress: store.deliveryAddress,
					...cartSummary(),
				});
			},
		},

		"place-order": {
			name: "place-order",
			title: "Place approved order",
			description:
				"Place the current simulated order, clear the cart, and begin tracking. This changes state and must only be called after explicit user approval. For external-agent handoff or review-only requests, call start-checkout and return its checkoutUrl instead.",
			inputSchema: { type: "object", properties: {} },
			annotations: { readOnlyHint: false, untrustedContentHint: false },
			execute: async () => {
				const cart = useCartStore.getState();
				const rid = cart.restaurantId;
				if (cart.items.length === 0 || !rid) {
					return text({
						error: "The cart is empty. Add items before placing an order.",
					});
				}
				const store = useAgentUIStore.getState();
				const restaurant = getRestaurantById(rid);
				const totals = cart.getTotals();
				const order = useOrderStore.getState().placeOrder({
					restaurantId: rid,
					restaurantName: cart.restaurantName ?? restaurant?.name ?? "",
					items: cart.items,
					totals,
					address: store.deliveryAddress,
					etaMinutes: restaurant?.etaMinutes ?? 30,
				});
				cart.clearCart();
				store.showOrder();
				return text({
					success: true,
					orderId: order.id,
					status: order.status,
					etaMinutes: order.etaMinutes,
					total: totals.total,
					restaurant: order.restaurantName,
					courier: order.courierName,
					message: `Order ${order.id} placed and confirmed — arriving in about ${order.etaMinutes} minutes.`,
				});
			},
		},

		"get-order-status": {
			name: "get-order-status",
			title: "Get order status",
			description:
				"Check the latest status and ETA of the current placed order. Use after place-order; this does not inspect an unplaced checkout cart.",
			inputSchema: { type: "object", properties: {} },
			annotations: { readOnlyHint: true, untrustedContentHint: false },
			execute: async () => {
				const order = useOrderStore.getState().currentOrder;
				if (!order) {
					return text({ error: "No active order yet." });
				}
				return text({
					orderId: order.id,
					status: order.status,
					etaMinutes: order.etaMinutes,
					restaurant: order.restaurantName,
					courier: order.courierName,
					total: order.totals.total,
				});
			},
		},
	};
}
