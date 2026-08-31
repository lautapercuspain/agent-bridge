import { create } from "zustand";
import type { CartItem, Order, OrderStatus, OrderTotals } from "@/types";

const COURIERS = ["Marco", "Sofia", "Diego", "Amara", "Kenji", "Lena", "Owen"];
const SEQUENCE: OrderStatus[] = [
	"confirmed",
	"preparing",
	"on_the_way",
	"delivered",
];

let timers: ReturnType<typeof setTimeout>[] = [];
function clearTimers() {
	for (const t of timers) clearTimeout(t);
	timers = [];
}

interface PlaceOrderInput {
	restaurantId: string;
	restaurantName: string;
	items: CartItem[];
	totals: OrderTotals;
	address: string;
	etaMinutes: number;
}

interface OrderState {
	currentOrder: Order | null;
	placeOrder: (input: PlaceOrderInput) => Order;
	advanceStatus: () => void;
	reset: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
	currentOrder: null,

	placeOrder: (input) => {
		clearTimers();
		const order: Order = {
			id: `AB-${Math.floor(100000 + Math.random() * 900000)}`,
			restaurantId: input.restaurantId,
			restaurantName: input.restaurantName,
			items: input.items,
			totals: input.totals,
			status: "confirmed",
			placedAt: Date.now(),
			etaMinutes: input.etaMinutes,
			address: input.address,
			courierName:
				COURIERS[Math.floor(Math.random() * COURIERS.length)] ?? "Alex",
		};
		set({ currentOrder: order });
		// Compressed demo timeline so the audience sees the order progress live.
		timers.push(setTimeout(() => get().advanceStatus(), 4000));
		timers.push(setTimeout(() => get().advanceStatus(), 9000));
		timers.push(setTimeout(() => get().advanceStatus(), 16000));
		return order;
	},

	advanceStatus: () => {
		const order = get().currentOrder;
		if (!order) return;
		const idx = SEQUENCE.indexOf(order.status);
		if (idx < 0 || idx >= SEQUENCE.length - 1) return;
		const next = SEQUENCE[idx + 1];
		if (!next) return;
		set({ currentOrder: { ...order, status: next } });
	},

	reset: () => {
		clearTimers();
		set({ currentOrder: null });
	},
}));
