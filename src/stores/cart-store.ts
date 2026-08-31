import { create } from "zustand";
import { getRestaurantById } from "@/lib/catalog";
import type { CartItem, MenuItem, MenuOption, OrderTotals } from "@/types";

function makeLineId(itemId: string, options: MenuOption[]): string {
	return `${itemId}::${options
		.map((o) => o.id)
		.sort()
		.join(",")}`;
}

export function lineUnitPrice(item: CartItem): number {
	return (
		item.menuItem.price +
		item.selectedOptions.reduce((sum, o) => sum + o.price, 0)
	);
}

function money(n: number): number {
	return Math.round(n * 100) / 100;
}

interface CartState {
	items: CartItem[];
	restaurantId: string | null;
	restaurantName: string | null;

	addItem: (item: MenuItem, options?: MenuOption[], quantity?: number) => void;
	removeItem: (target: string) => boolean;
	updateQuantity: (target: string, quantity: number) => void;
	clearCart: () => void;
	getCount: () => number;
	getSubtotal: () => number;
	getTotals: () => OrderTotals;
}

export const useCartStore = create<CartState>((set, get) => ({
	items: [],
	restaurantId: null,
	restaurantName: null,

	addItem: (item, options = [], quantity = 1) => {
		const state = get();
		const rid = item.restaurantId;
		const rname = getRestaurantById(rid)?.name ?? state.restaurantName ?? "";
		const id = makeLineId(item.id, options);

		// Switching restaurants replaces the cart (single-restaurant order).
		if (state.restaurantId && state.restaurantId !== rid) {
			set({
				items: [
					{ lineId: id, menuItem: item, quantity, selectedOptions: options },
				],
				restaurantId: rid,
				restaurantName: rname,
			});
			return;
		}

		const existing = state.items.find((ci) => ci.lineId === id);
		set({
			restaurantId: rid,
			restaurantName: rname,
			items: existing
				? state.items.map((ci) =>
						ci.lineId === id ? { ...ci, quantity: ci.quantity + quantity } : ci,
					)
				: [
						...state.items,
						{ lineId: id, menuItem: item, quantity, selectedOptions: options },
					],
		});
	},

	removeItem: (target) => {
		const state = get();
		const t = target.trim().toLowerCase();
		const line = state.items.find(
			(ci) =>
				ci.lineId === target ||
				ci.menuItem.id === target ||
				ci.menuItem.name.toLowerCase() === t ||
				ci.menuItem.name.toLowerCase().includes(t),
		);
		if (!line) return false;
		const newItems = state.items.filter((ci) => ci.lineId !== line.lineId);
		set({
			items: newItems,
			restaurantId: newItems.length > 0 ? state.restaurantId : null,
			restaurantName: newItems.length > 0 ? state.restaurantName : null,
		});
		return true;
	},

	updateQuantity: (target, quantity) => {
		const state = get();
		const t = target.trim().toLowerCase();
		const line = state.items.find(
			(ci) =>
				ci.lineId === target ||
				ci.menuItem.id === target ||
				ci.menuItem.name.toLowerCase() === t,
		);
		if (!line) return;
		if (quantity <= 0) {
			get().removeItem(line.lineId);
			return;
		}
		set({
			items: state.items.map((ci) =>
				ci.lineId === line.lineId ? { ...ci, quantity } : ci,
			),
		});
	},

	clearCart: () => set({ items: [], restaurantId: null, restaurantName: null }),

	getCount: () => get().items.reduce((n, ci) => n + ci.quantity, 0),

	getSubtotal: () =>
		get().items.reduce((sum, ci) => sum + lineUnitPrice(ci) * ci.quantity, 0),

	getTotals: () => {
		const state = get();
		const subtotal = money(state.getSubtotal());
		const restaurant = state.restaurantId
			? getRestaurantById(state.restaurantId)
			: undefined;
		const deliveryFee = subtotal > 0 ? (restaurant?.deliveryFee ?? 0) : 0;
		const serviceFee = subtotal > 0 ? money(Math.min(subtotal * 0.1, 5)) : 0;
		const tax = money(subtotal * 0.08);
		const total = money(subtotal + deliveryFee + serviceFee + tax);
		return { subtotal, deliveryFee, serviceFee, tax, total };
	},
}));
