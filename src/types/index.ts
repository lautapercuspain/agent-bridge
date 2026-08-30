export interface Restaurant {
	id: string;
	name: string;
	cuisine: string;
	rating: number;
	reviewCount: number;
	priceLevel: "$" | "$$" | "$$$" | "$$$$";
	address: string;
	distance: string;
	imageUrl: string;
	phone: string;
	categories: string[];
	isOpen: boolean;
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

export interface CartItem {
	menuItem: MenuItem;
	quantity: number;
	specialInstructions?: string;
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
