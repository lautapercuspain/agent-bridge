"use client";

import { create } from "zustand";
import {
	CATEGORIES,
	getMenuForRestaurant,
	getRestaurantById,
	queryRestaurants,
	resolveRestaurant,
} from "@/lib/catalog";
import { lineUnitPrice, useCartStore } from "@/stores/cart-store";
import { useOrderStore } from "@/stores/order-store";
import type { MenuItem, MenuOption, Restaurant } from "@/types";

export type StorefrontView = "browse" | "restaurant" | "checkout" | "order";

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
	showCheckout: () => void;
	showOrder: () => void;
	setDeliveryAddress: (address: string) => void;
	setFilters: (patch: Partial<StorefrontFilters>) => void;
	setActiveItem: (item: MenuItem | null) => void;
	reset: () => void;
}

export const useAgentUIStore = create<AgentUIState>((set) => ({
	view: "browse",
	restaurants: [],
	currentRestaurant: null,
	currentMenu: [],
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
		}),
	showRestaurant: (restaurant, menu) =>
		set({
			view: "restaurant",
			currentRestaurant: restaurant,
			currentMenu: menu,
		}),
	showCheckout: () => set({ view: "checkout" }),
	showOrder: () => set({ view: "order" }),
	setDeliveryAddress: (deliveryAddress) => set({ deliveryAddress }),
	setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
	setActiveItem: (activeItem) => set({ activeItem }),
	reset: () =>
		set({
			view: "browse",
			restaurants: [],
			currentRestaurant: null,
			currentMenu: [],
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
		return search(getMenuForRestaurant(state.currentRestaurant.id));
	}
	return undefined;
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
			description:
				"List all food categories available on AgentBridge (e.g. breakfast, burgers, sushi, indian, mediterranean). Use this to discover what the user can browse.",
			inputSchema: { type: "object", properties: {} },
			annotations: { readOnlyHint: true, untrustedContentHint: false },
			execute: async () =>
				text({
					categories: CATEGORIES.map((c) => ({ id: c.id, name: c.name })),
				}),
		},

		"search-restaurants": {
			name: "search-restaurants",
			description:
				"Search AgentBridge restaurants by category, cuisine, or free-text query, with optional filters. Returns matching restaurants with ratings, price, ETA, and delivery fee. Updates the storefront so the user sees the results.",
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
			description:
				"Open a restaurant and get its full menu. Pass the restaurant 'id' from search results (a name also works). Returns menu items with ids, prices, sections, and dietary tags, and shows the restaurant to the user.",
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
			description:
				"Filter the current restaurant's menu by dietary tags, maximum price, section, or a search query.",
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

		"add-to-cart": {
			name: "add-to-cart",
			description:
				"Add a menu item to the cart. Pass the item 'id' from the menu (a name also works), an optional quantity, and optional option ids for size/extras.",
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
			description: "Remove an item from the cart. Pass the item id or name.",
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
			description:
				"Set the quantity of an item already in the cart. Pass the item id or name and the new quantity (0 removes it).",
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
			description:
				"Get the current cart: items, quantities, and the full price breakdown (subtotal, delivery, service fee, tax, total).",
			inputSchema: { type: "object", properties: {} },
			annotations: { readOnlyHint: true, untrustedContentHint: false },
			execute: async () => text(cartSummary()),
		},

		"start-checkout": {
			name: "start-checkout",
			description:
				"Open the checkout screen with the current cart and delivery address. Call this before place-order so the user can review the order.",
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
				return text({
					message: "Checkout is open. Call place-order to confirm the order.",
					deliveryAddress: store.deliveryAddress,
					...cartSummary(),
				});
			},
		},

		"place-order": {
			name: "place-order",
			description:
				"Place the order on AgentBridge and complete checkout. Confirms the order, clears the cart, and shows live order tracking. Use this once the user has approved the order.",
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
			description:
				"Check the status of the current order (confirmed, preparing, on the way, or delivered) and its ETA.",
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
