import { create } from "zustand";
import type { CartItem, MenuItem } from "@/types";

interface CartState {
	items: CartItem[];
	restaurantId: string | null;
	restaurantName: string | null;

	addItem: (
		item: MenuItem,
		restaurantId: string,
		restaurantName: string,
	) => void;
	removeItem: (menuItemId: string) => void;
	updateQuantity: (menuItemId: string, quantity: number) => void;
	clearCart: () => void;
	getSubtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
	items: [],
	restaurantId: null,
	restaurantName: null,

	addItem: (item, restaurantId, restaurantName) => {
		const state = get();

		// If switching restaurants, clear cart first
		if (state.restaurantId && state.restaurantId !== restaurantId) {
			set({ items: [], restaurantId, restaurantName });
		}

		const existing = state.items.find((ci) => ci.menuItem.id === item.id);
		if (existing) {
			set({
				items: state.items.map((ci) =>
					ci.menuItem.id === item.id
						? { ...ci, quantity: ci.quantity + 1 }
						: ci,
				),
				restaurantId,
				restaurantName,
			});
		} else {
			set({
				items: [...state.items, { menuItem: item, quantity: 1 }],
				restaurantId,
				restaurantName,
			});
		}
	},

	removeItem: (menuItemId) => {
		const state = get();
		const newItems = state.items.filter((ci) => ci.menuItem.id !== menuItemId);
		set({
			items: newItems,
			restaurantId: newItems.length > 0 ? state.restaurantId : null,
			restaurantName: newItems.length > 0 ? state.restaurantName : null,
		});
	},

	updateQuantity: (menuItemId, quantity) => {
		if (quantity <= 0) {
			get().removeItem(menuItemId);
			return;
		}
		set({
			items: get().items.map((ci) =>
				ci.menuItem.id === menuItemId ? { ...ci, quantity } : ci,
			),
		});
	},

	clearCart: () => set({ items: [], restaurantId: null, restaurantName: null }),

	getSubtotal: () =>
		get().items.reduce((sum, ci) => sum + ci.menuItem.price * ci.quantity, 0),
}));
