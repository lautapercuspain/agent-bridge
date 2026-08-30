"use client";

import { create } from "zustand";
import { filterMenuItems, getMenuForRestaurant } from "@/lib/mock-menus";
import { useCartStore } from "@/stores/cart-store";
import type { MenuItem, Restaurant } from "@/types";

// Store for agent-driven UI state updates
interface AgentUIState {
	restaurants: Restaurant[];
	currentMenu: MenuItem[];
	currentRestaurant: Restaurant | null;
	comparisonItems: MenuItem[];
	orderPrepared: boolean;

	setRestaurants: (restaurants: Restaurant[]) => void;
	setMenu: (restaurant: Restaurant, menu: MenuItem[]) => void;
	setComparisonItems: (items: MenuItem[]) => void;
	setOrderPrepared: (prepared: boolean) => void;
	reset: () => void;
}

export const useAgentUIStore = create<AgentUIState>((set) => ({
	restaurants: [],
	currentMenu: [],
	currentRestaurant: null,
	comparisonItems: [],
	orderPrepared: false,

	setRestaurants: (restaurants) => set({ restaurants }),
	setMenu: (restaurant, menu) =>
		set({ currentRestaurant: restaurant, currentMenu: menu }),
	setComparisonItems: (items) => set({ comparisonItems: items }),
	setOrderPrepared: (prepared) => set({ orderPrepared: prepared }),
	reset: () =>
		set({
			restaurants: [],
			currentMenu: [],
			currentRestaurant: null,
			comparisonItems: [],
			orderPrepared: false,
		}),
}));

// Resolve a restaurant from the last search results by exact id, exact name,
// or fuzzy name match — so the agent succeeds even when it passes a name.
function resolveRestaurant(idOrName: string): Restaurant | undefined {
	const list = useAgentUIStore.getState().restaurants;
	const q = idOrName.trim().toLowerCase();
	return (
		list.find((r) => r.id === idOrName) ??
		list.find((r) => r.name.toLowerCase() === q) ??
		list.find(
			(r) =>
				r.name.toLowerCase().includes(q) || q.includes(r.name.toLowerCase()),
		)
	);
}

// Resolve a menu item from the current menu by exact id, exact name, or fuzzy
// name match.
function resolveMenuItem(idOrName: string): MenuItem | undefined {
	const menu = useAgentUIStore.getState().currentMenu;
	const q = idOrName.trim().toLowerCase();
	return (
		menu.find((m) => m.id === idOrName) ??
		menu.find((m) => m.name.toLowerCase() === q) ??
		menu.find(
			(m) =>
				m.name.toLowerCase().includes(q) || q.includes(m.name.toLowerCase()),
		)
	);
}

// Tool definitions that map to WebMCP ModelContextTool shape.
// Each execute reads fresh store state via getState() so tools never operate
// on a stale snapshot captured at registration time. Tools are designed to be
// self-healing: they accept ids or names and return actionable alternatives
// rather than hard errors, so the agent can recover autonomously.
export function createToolDefinitions() {
	return {
		"search-restaurants": {
			name: "search-restaurants",
			description:
				"Search for restaurants by cuisine type, location, and price range. Returns a list of matching restaurants with ratings, distance, and price level.",
			inputSchema: {
				type: "object",
				properties: {
					cuisine: {
						type: "string",
						description:
							"Type of cuisine (e.g., italian, mexican, japanese, thai, indian, chinese, american, mediterranean)",
					},
					location: {
						type: "string",
						description:
							"Delivery location or area (e.g., 'San Francisco, CA')",
					},
					priceLevel: {
						type: "string",
						enum: ["$", "$$", "$$$", "$$$$"],
						description: "Price range filter",
					},
					sortBy: {
						type: "string",
						enum: ["rating", "distance", "price"],
						description: "How to sort results",
					},
				},
			},
			annotations: { readOnlyHint: true, untrustedContentHint: false },
			execute: async (input: Record<string, unknown>) => {
				const agentUI = useAgentUIStore.getState();
				const res = await fetch(
					`/api/restaurants?${new URLSearchParams(
						Object.entries(input)
							.filter(([, v]) => v != null)
							.map(([k, v]) => [k, String(v)]),
					).toString()}`,
				);
				if (!res.ok) throw new Error("Restaurant search failed");
				const data = await res.json();
				agentUI.setRestaurants(data.restaurants);
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({
								count: data.restaurants.length,
								note: "When calling get-restaurant-menu or filter-menu-items, pass the exact 'id' value below.",
								restaurants: data.restaurants.map((r: Restaurant) => ({
									id: r.id,
									name: r.name,
									cuisine: r.cuisine,
									priceLevel: r.priceLevel,
									rating: r.rating,
									distance: r.distance,
								})),
							}),
						},
					],
				};
			},
		},

		"get-restaurant-menu": {
			name: "get-restaurant-menu",
			description:
				"Get the full menu for a restaurant. Pass the restaurant's 'id' from search results (a name also works). Returns menu items with their ids, prices, and dietary tags.",
			inputSchema: {
				type: "object",
				properties: {
					restaurantId: {
						type: "string",
						description:
							"The restaurant id from search results (a restaurant name is also accepted)",
					},
				},
				required: ["restaurantId"],
			},
			annotations: { readOnlyHint: true, untrustedContentHint: false },
			execute: async (input: { restaurantId: string }) => {
				const agentUI = useAgentUIStore.getState();
				const resolved = resolveRestaurant(input.restaurantId);

				// Fast, reliable path: the restaurant is already known from search,
				// so build its menu locally with no extra network call.
				if (resolved) {
					const menu = getMenuForRestaurant(resolved.id, resolved.categories);
					agentUI.setMenu(resolved, menu);
					return {
						content: [
							{
								type: "text",
								text: JSON.stringify({
									restaurant: resolved.name,
									items: menu.map((m) => ({
										id: m.id,
										name: m.name,
										price: m.price,
										description: m.description,
										dietaryTags: m.dietaryTags,
									})),
								}),
							},
						],
					};
				}

				const res = await fetch(
					`/api/menu/${encodeURIComponent(input.restaurantId)}`,
				);

				if (!res.ok) {
					// Auto-recover: hand the agent the valid choices instead of failing.
					return {
						content: [
							{
								type: "text",
								text: JSON.stringify({
									error: "That menu could not be loaded.",
									hint: "Choose one of the available restaurants below by its exact id and call get-restaurant-menu again.",
									availableRestaurants: agentUI.restaurants
										.slice(0, 6)
										.map((r) => ({ id: r.id, name: r.name })),
								}),
							},
						],
					};
				}

				const data = await res.json();
				agentUI.setMenu(data.restaurant, data.menu);
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({
								restaurant: data.restaurant.name,
								items: data.menu.map((m: MenuItem) => ({
									id: m.id,
									name: m.name,
									price: m.price,
									description: m.description,
									dietaryTags: m.dietaryTags,
								})),
							}),
						},
					],
				};
			},
		},

		"filter-menu-items": {
			name: "filter-menu-items",
			description:
				"Filter menu items by dietary preferences, maximum price, category, or search query.",
			inputSchema: {
				type: "object",
				properties: {
					restaurantId: {
						type: "string",
						description: "The restaurant ID",
					},
					dietaryTags: {
						type: "array",
						items: { type: "string" },
						description:
							"Dietary filters: vegetarian, vegan, gluten-free, dairy-free, nut-free, spicy, halal, kosher",
					},
					maxPrice: { type: "number", description: "Maximum price per item" },
					category: {
						type: "string",
						description: "Menu category (e.g., Appetizers, Entrees, Desserts)",
					},
					query: {
						type: "string",
						description:
							"Search query to match against item names and descriptions",
					},
				},
				required: ["restaurantId"],
			},
			annotations: { readOnlyHint: true, untrustedContentHint: false },
			execute: async (input: {
				restaurantId: string;
				dietaryTags?: string[];
				maxPrice?: number;
				category?: string;
				query?: string;
			}) => {
				const agentUI = useAgentUIStore.getState();
				const resolved =
					resolveRestaurant(input.restaurantId) ?? agentUI.currentRestaurant;
				const restaurantId = resolved?.id ?? input.restaurantId;
				const categories = resolved?.categories ?? ["American"];
				const allItems = getMenuForRestaurant(restaurantId, categories);
				const filtered = filterMenuItems(allItems, {
					dietaryTags: input.dietaryTags as MenuItem["dietaryTags"],
					maxPrice: input.maxPrice,
					category: input.category,
					query: input.query,
				});
				agentUI.setMenu(
					resolved ?? {
						id: restaurantId,
						name: "Restaurant",
						cuisine: "",
						rating: 0,
						reviewCount: 0,
						priceLevel: "$$",
						address: "",
						distance: "",
						imageUrl: "",
						phone: "",
						categories: [],
						isOpen: true,
					},
					filtered,
				);
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({
								count: filtered.length,
								items: filtered.map((m) => ({
									id: m.id,
									name: m.name,
									price: m.price,
									description: m.description,
									dietaryTags: m.dietaryTags,
								})),
							}),
						},
					],
				};
			},
		},

		"compare-options": {
			name: "compare-options",
			description:
				"Compare multiple menu items side by side. Shows price, dietary info, and descriptions for easy comparison.",
			inputSchema: {
				type: "object",
				properties: {
					itemIds: {
						type: "array",
						items: { type: "string" },
						description: "Array of menu item IDs to compare",
					},
				},
				required: ["itemIds"],
			},
			annotations: { readOnlyHint: true, untrustedContentHint: false },
			execute: async (input: { itemIds: string[] }) => {
				const agentUI = useAgentUIStore.getState();
				const items = input.itemIds
					.map((idOrName) => resolveMenuItem(idOrName))
					.filter((m): m is MenuItem => m != null);
				agentUI.setComparisonItems(items);
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({
								comparison: items.map((m) => ({
									id: m.id,
									name: m.name,
									price: m.price,
									description: m.description,
									dietaryTags: m.dietaryTags,
									popular: m.popular,
								})),
							}),
						},
					],
				};
			},
		},

		"add-to-cart": {
			name: "add-to-cart",
			description:
				"Add a menu item to the user's cart. Pass the item's 'id' from the menu (a name also works).",
			inputSchema: {
				type: "object",
				properties: {
					itemId: {
						type: "string",
						description: "The menu item id (an item name is also accepted)",
					},
					quantity: {
						type: "number",
						description: "Number of items to add (default: 1)",
					},
				},
				required: ["itemId"],
			},
			annotations: { readOnlyHint: false, untrustedContentHint: false },
			execute: async (input: { itemId: string; quantity?: number }) => {
				const agentUI = useAgentUIStore.getState();
				const cart = useCartStore.getState();
				const item = resolveMenuItem(input.itemId);
				if (!item) {
					// Auto-recover: give the agent the valid items to choose from.
					return {
						content: [
							{
								type: "text",
								text: JSON.stringify({
									error: "That item isn't on the current menu.",
									hint: "Pick one of the available items below by its exact id and call add-to-cart again.",
									availableItems: agentUI.currentMenu
										.slice(0, 12)
										.map((m) => ({ id: m.id, name: m.name, price: m.price })),
								}),
							},
						],
					};
				}
				const restaurant = agentUI.currentRestaurant;
				const qty = input.quantity ?? 1;
				for (let i = 0; i < qty; i++) {
					cart.addItem(item, restaurant?.id ?? "", restaurant?.name ?? "");
				}
				return {
					content: [
						{
							type: "text",
							text: `Added ${qty}x ${item.name} ($${item.price.toFixed(2)} each) to cart`,
						},
					],
				};
			},
		},

		"remove-from-cart": {
			name: "remove-from-cart",
			description:
				"Remove an item from the user's cart. Pass the item's id or name.",
			inputSchema: {
				type: "object",
				properties: {
					itemId: {
						type: "string",
						description: "The menu item id or name to remove",
					},
				},
				required: ["itemId"],
			},
			annotations: { readOnlyHint: false, untrustedContentHint: false },
			execute: async (input: { itemId: string }) => {
				const cart = useCartStore.getState();
				const q = input.itemId.trim().toLowerCase();
				const target =
					cart.items.find((ci) => ci.menuItem.id === input.itemId) ??
					cart.items.find((ci) => ci.menuItem.name.toLowerCase() === q) ??
					cart.items.find((ci) => ci.menuItem.name.toLowerCase().includes(q));
				if (!target) {
					return {
						content: [
							{
								type: "text",
								text: JSON.stringify({
									error: "That item isn't in the cart.",
									cartItems: cart.items.map((ci) => ({
										id: ci.menuItem.id,
										name: ci.menuItem.name,
									})),
								}),
							},
						],
					};
				}
				cart.removeItem(target.menuItem.id);
				return {
					content: [
						{ type: "text", text: `Removed ${target.menuItem.name} from cart` },
					],
				};
			},
		},

		"get-cart-summary": {
			name: "get-cart-summary",
			description:
				"Get the current cart contents including items, quantities, and total price.",
			inputSchema: {
				type: "object",
				properties: {},
			},
			annotations: { readOnlyHint: true, untrustedContentHint: false },
			execute: async () => {
				const cart = useCartStore.getState();
				const items = cart.items;
				const subtotal = cart.getSubtotal();
				const tax = cart.getTax();
				const deliveryFee = cart.getDeliveryFee();
				const total = cart.getTotal();

				return {
					content: [
						{
							type: "text",
							text: JSON.stringify({
								restaurant: cart.restaurantName,
								items: items.map((ci) => ({
									name: ci.menuItem.name,
									quantity: ci.quantity,
									price: ci.menuItem.price,
									lineTotal: ci.menuItem.price * ci.quantity,
								})),
								subtotal: subtotal.toFixed(2),
								tax: tax.toFixed(2),
								deliveryFee: deliveryFee.toFixed(2),
								total: total.toFixed(2),
							}),
						},
					],
				};
			},
		},

		"prepare-order": {
			name: "prepare-order",
			description:
				"Prepare the current cart as an order for user review. The user must confirm before the order is placed. This shows the order review screen.",
			inputSchema: {
				type: "object",
				properties: {
					deliveryAddress: {
						type: "string",
						description: "Delivery address for the order",
					},
				},
			},
			annotations: { readOnlyHint: false, untrustedContentHint: false },
			execute: async () => {
				const agentUI = useAgentUIStore.getState();
				const cart = useCartStore.getState();
				if (cart.items.length === 0) {
					return {
						content: [
							{
								type: "text",
								text: "Cart is empty. Add items before preparing an order.",
							},
						],
					};
				}
				agentUI.setOrderPrepared(true);
				return {
					content: [
						{
							type: "text",
							text: `Order prepared for review. ${cart.items.length} items totaling $${cart.getTotal().toFixed(2)}. The user can now review and confirm the order.`,
						},
					],
				};
			},
		},
	};
}
