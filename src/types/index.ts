export interface Category {
	id: string;
	name: string;
	imageUrl: string;
}

export interface Restaurant {
	id: string;
	name: string;
	cuisine: string;
	categoryIds: string[];
	rating: number;
	reviewCount: number;
	priceLevel: "$" | "$$" | "$$$" | "$$$$";
	deliveryFee: number;
	etaMinutes: number;
	imageUrl: string;
	promo?: string;
	tags: string[];
	isOpen: boolean;
	distance: string;
	address: string;
}

export interface MenuOption {
	id: string;
	name: string;
	price: number;
}

export interface MenuOptionGroup {
	id: string;
	name: string;
	options: MenuOption[];
}

export interface MenuItem {
	id: string;
	restaurantId: string;
	name: string;
	description: string;
	price: number;
	category: string;
	dietaryTags: DietaryTag[];
	imageUrl?: string;
	popular: boolean;
	optionGroups?: MenuOptionGroup[];
	// Intent facets used for cross-restaurant, intent-aware meal search.
	mealType?: MealType[];
	tags?: string[];
}

export type DietaryTag =
	| "vegetarian"
	| "vegan"
	| "gluten-free"
	| "dairy-free"
	| "nut-free"
	| "spicy"
	| "halal"
	| "kosher";

export type MealType =
	| "breakfast"
	| "lunch"
	| "dinner"
	| "dessert"
	| "drink"
	| "side";

export interface CartItem {
	lineId: string;
	menuItem: MenuItem;
	quantity: number;
	selectedOptions: MenuOption[];
	specialInstructions?: string;
}

export interface OrderTotals {
	subtotal: number;
	deliveryFee: number;
	serviceFee: number;
	tax: number;
	total: number;
}

export type OrderStatus =
	| "confirmed"
	| "preparing"
	| "on_the_way"
	| "delivered";

export interface Order {
	id: string;
	restaurantId: string;
	restaurantName: string;
	items: CartItem[];
	totals: OrderTotals;
	status: OrderStatus;
	placedAt: number;
	etaMinutes: number;
	address: string;
	courierName: string;
}

export type DeliveryPlatform =
	| "uber-eats"
	| "rappi"
	| "pedidosya"
	| "didi-food";

export interface DeliveryLink {
	platform: DeliveryPlatform;
	label: string;
	url: string;
	color: string;
	textColor: string;
}

export interface ChatMessage {
	id: string;
	role: "user" | "assistant" | "system";
	content: string;
	timestamp: number;
	toolCalls?: ToolCallResult[];
}

export interface ToolCallResult {
	toolName: string;
	args: Record<string, unknown>;
	result: unknown;
}

export interface SearchRestaurantsParams {
	cuisine?: string;
	location?: string;
	latitude?: number;
	longitude?: number;
	priceLevel?: string;
	sortBy?: "rating" | "distance" | "price";
	limit?: number;
}

export interface FilterMenuParams {
	restaurantId: string;
	dietaryTags?: DietaryTag[];
	maxPrice?: number;
	category?: string;
	query?: string;
}

export interface CompareOptionsParams {
	itemIds: string[];
}

export interface VoiceState {
	isConnected: boolean;
	isListening: boolean;
	isSpeaking: boolean;
	transcript: string;
}
