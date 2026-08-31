import type { Category, MenuItem, Restaurant } from "@/types";

// ---------------------------------------------------------------------------
// AgentBridge is its own delivery marketplace: all restaurants, menus, and
// pricing below are first-party data we control, so an agent can complete the
// entire journey (browse -> menu -> cart -> checkout) with no external API.
// ---------------------------------------------------------------------------

const P = "https://images.unsplash.com/photo-";
function img(id: string, w = 800): string {
	return `${P}${id}?auto=format&fit=crop&q=75&w=${w}`;
}

export const CATEGORIES: Category[] = [
	{
		id: "breakfast",
		name: "Breakfast",
		imageUrl: img("1567620905732-2d1ec7ab7445", 200),
	},
	{
		id: "burgers",
		name: "Burgers",
		imageUrl: img("1568901346375-23c9450c58cd", 200),
	},
	{
		id: "pizza",
		name: "Pizza",
		imageUrl: img("1513104890138-7c749659a591", 200),
	},
	{
		id: "sushi",
		name: "Sushi",
		imageUrl: img("1579584425555-c3ce17fd4351", 200),
	},
	{
		id: "indian",
		name: "Indian",
		imageUrl: img("1585937421612-70a008356fbe", 200),
	},
	{
		id: "mediterranean",
		name: "Mediterranean",
		imageUrl: img("1540189549336-e6e99c3679fe", 200),
	},
	{
		id: "healthy",
		name: "Healthy",
		imageUrl: img("1546069901-ba9599a7e63c", 200),
	},
	{
		id: "italian",
		name: "Italian",
		imageUrl: img("1551183053-bf91a1d81141", 200),
	},
	{
		id: "ramen",
		name: "Ramen",
		imageUrl: img("1569718212165-3a8278d5f624", 200),
	},
	{ id: "grill", name: "Grill", imageUrl: img("1544025162-d76694265947", 200) },
	{
		id: "dessert",
		name: "Dessert",
		imageUrl: img("1551024601-bec78aea704b", 200),
	},
	{
		id: "coffee",
		name: "Coffee",
		imageUrl: img("1509042239860-f550ce710b93", 200),
	},
];

interface RestaurantSeed extends Restaurant {
	template: string;
}

const SEEDS: RestaurantSeed[] = [
	{
		id: "char-and-cheese",
		name: "Char & Cheese",
		cuisine: "Burgers",
		categoryIds: ["burgers"],
		rating: 4.6,
		reviewCount: 1243,
		priceLevel: "$$",
		deliveryFee: 0,
		etaMinutes: 20,
		imageUrl: img("1550547660-d9450f859349"),
		promo: "30% off select items",
		tags: ["Great value"],
		isOpen: true,
		distance: "0.8 mi",
		address: "142 Ember St",
		template: "burgers",
	},
	{
		id: "patty-republic",
		name: "Patty Republic",
		cuisine: "Burgers",
		categoryIds: ["burgers"],
		rating: 4.4,
		reviewCount: 862,
		priceLevel: "$",
		deliveryFee: 1.99,
		etaMinutes: 18,
		imageUrl: img("1571091718767-18b5b1457add"),
		tags: [],
		isOpen: true,
		distance: "1.1 mi",
		address: "9 Grill Ave",
		template: "burgers",
	},
	{
		id: "napoli-slice",
		name: "Napoli Slice",
		cuisine: "Pizza",
		categoryIds: ["pizza", "italian"],
		rating: 4.7,
		reviewCount: 3011,
		priceLevel: "$$",
		deliveryFee: 0,
		etaMinutes: 25,
		imageUrl: img("1513104890138-7c749659a591"),
		promo: "Buy 1 Get 1 Free",
		tags: ["Great value"],
		isOpen: true,
		distance: "1.4 mi",
		address: "77 Dough Ln",
		template: "pizza",
	},
	{
		id: "la-cucina",
		name: "La Cucina",
		cuisine: "Italian",
		categoryIds: ["italian", "pizza"],
		rating: 4.5,
		reviewCount: 947,
		priceLevel: "$$$",
		deliveryFee: 2.99,
		etaMinutes: 30,
		imageUrl: img("1551183053-bf91a1d81141"),
		tags: [],
		isOpen: true,
		distance: "2.0 mi",
		address: "31 Basilico Rd",
		template: "italian",
	},
	{
		id: "sakura-house",
		name: "Sakura House",
		cuisine: "Sushi",
		categoryIds: ["sushi"],
		rating: 4.8,
		reviewCount: 2140,
		priceLevel: "$$$",
		deliveryFee: 3.49,
		etaMinutes: 27,
		imageUrl: img("1579584425555-c3ce17fd4351"),
		tags: ["Highest rated"],
		isOpen: true,
		distance: "1.7 mi",
		address: "5 Koi Way",
		template: "sushi",
	},
	{
		id: "ramen-lab",
		name: "Ramen Lab",
		cuisine: "Ramen",
		categoryIds: ["ramen"],
		rating: 4.6,
		reviewCount: 1502,
		priceLevel: "$$",
		deliveryFee: 1.49,
		etaMinutes: 22,
		imageUrl: img("1569718212165-3a8278d5f624"),
		tags: ["Great value"],
		isOpen: true,
		distance: "1.2 mi",
		address: "88 Broth St",
		template: "ramen",
	},
	{
		id: "spice-route",
		name: "Spice Route",
		cuisine: "Indian",
		categoryIds: ["indian"],
		rating: 4.6,
		reviewCount: 781,
		priceLevel: "$$",
		deliveryFee: 0,
		etaMinutes: 30,
		imageUrl: img("1585937421612-70a008356fbe"),
		promo: "Free delivery over $25",
		tags: [],
		isOpen: true,
		distance: "2.3 mi",
		address: "14 Masala Blvd",
		template: "indian",
	},
	{
		id: "olive-and-zaatar",
		name: "Olive & Za'atar",
		cuisine: "Mediterranean",
		categoryIds: ["mediterranean", "healthy"],
		rating: 4.5,
		reviewCount: 642,
		priceLevel: "$$",
		deliveryFee: 1.99,
		etaMinutes: 26,
		imageUrl: img("1540189549336-e6e99c3679fe"),
		tags: [],
		isOpen: true,
		distance: "1.9 mi",
		address: "60 Cedar St",
		template: "mediterranean",
	},
	{
		id: "green-bowl",
		name: "Green Bowl",
		cuisine: "Healthy",
		categoryIds: ["healthy"],
		rating: 4.7,
		reviewCount: 503,
		priceLevel: "$$",
		deliveryFee: 0,
		etaMinutes: 20,
		imageUrl: img("1546069901-ba9599a7e63c"),
		tags: ["Great value"],
		isOpen: true,
		distance: "0.6 mi",
		address: "3 Sprout Ave",
		template: "healthy",
	},
	{
		id: "sunrise-kitchen",
		name: "Sunrise Kitchen",
		cuisine: "Breakfast",
		categoryIds: ["breakfast", "coffee"],
		rating: 4.5,
		reviewCount: 414,
		priceLevel: "$",
		deliveryFee: 1.49,
		etaMinutes: 18,
		imageUrl: img("1533089860892-a7c6f0a88666"),
		tags: [],
		isOpen: true,
		distance: "0.9 mi",
		address: "21 Dawn Rd",
		template: "breakfast",
	},
	{
		id: "the-daily-grind",
		name: "The Daily Grind",
		cuisine: "Coffee",
		categoryIds: ["coffee", "breakfast"],
		rating: 4.8,
		reviewCount: 912,
		priceLevel: "$",
		deliveryFee: 0,
		etaMinutes: 12,
		imageUrl: img("1509042239860-f550ce710b93"),
		tags: ["Great value"],
		isOpen: true,
		distance: "0.4 mi",
		address: "1 Roast St",
		template: "coffee",
	},
	{
		id: "sweet-theory",
		name: "Sweet Theory",
		cuisine: "Dessert",
		categoryIds: ["dessert"],
		rating: 4.7,
		reviewCount: 723,
		priceLevel: "$$",
		deliveryFee: 1.99,
		etaMinutes: 20,
		imageUrl: img("1551024601-bec78aea704b"),
		promo: "30% off select items",
		tags: [],
		isOpen: true,
		distance: "1.5 mi",
		address: "48 Sugar Ln",
		template: "dessert",
	},
	{
		id: "ember-grill",
		name: "Ember Grill",
		cuisine: "Grill",
		categoryIds: ["grill"],
		rating: 4.6,
		reviewCount: 1108,
		priceLevel: "$$$",
		deliveryFee: 2.49,
		etaMinutes: 32,
		imageUrl: img("1544025162-d76694265947"),
		tags: [],
		isOpen: true,
		distance: "2.6 mi",
		address: "7 Flame Ct",
		template: "grill",
	},
	{
		id: "prime-cut",
		name: "Prime Cut Steakhouse",
		cuisine: "Grill",
		categoryIds: ["grill"],
		rating: 4.7,
		reviewCount: 1642,
		priceLevel: "$$$$",
		deliveryFee: 3.99,
		etaMinutes: 35,
		imageUrl: img("1504674900247-0877df9cc836"),
		tags: ["Highest rated"],
		isOpen: true,
		distance: "3.0 mi",
		address: "100 Prime Ave",
		template: "grill",
	},
	{
		id: "catch-of-the-day",
		name: "Catch of the Day",
		cuisine: "Seafood",
		categoryIds: ["grill", "healthy"],
		rating: 4.5,
		reviewCount: 388,
		priceLevel: "$$$",
		deliveryFee: 2.99,
		etaMinutes: 30,
		imageUrl: img("1467003909585-2f8a72700288"),
		tags: [],
		isOpen: true,
		distance: "2.2 mi",
		address: "12 Harbor Way",
		template: "seafood",
	},
	{
		id: "noodle-bar",
		name: "Noodle Bar",
		cuisine: "Asian",
		categoryIds: ["ramen"],
		rating: 4.4,
		reviewCount: 561,
		priceLevel: "$$",
		deliveryFee: 1.49,
		etaMinutes: 24,
		imageUrl: img("1476224203421-9ac39bcb3327"),
		tags: [],
		isOpen: true,
		distance: "1.6 mi",
		address: "39 Wok St",
		template: "ramen",
	},
];

export const RESTAURANTS: Restaurant[] = SEEDS.map(
	({ template: _t, ...rest }) => rest,
);

const TEMPLATE_BY_RESTAURANT: Record<string, string> = Object.fromEntries(
	SEEDS.map((s) => [s.id, s.template]),
);

interface ItemSeed {
	name: string;
	description: string;
	price: number;
	category: string;
	dietaryTags: MenuItem["dietaryTags"];
	popular?: boolean;
	image: string;
	optionGroups?: MenuItem["optionGroups"];
}

const SIZE_GROUP: MenuItem["optionGroups"] = [
	{
		id: "size",
		name: "Choose a size",
		options: [
			{ id: "regular", name: "Regular", price: 0 },
			{ id: "large", name: "Large", price: 2.5 },
		],
	},
];

const MENU_TEMPLATES: Record<string, ItemSeed[]> = {
	burgers: [
		{
			name: "Double Smash Burger",
			description:
				"Two seared beef patties, melted cheddar, house sauce, brioche bun.",
			price: 11.5,
			category: "Popular",
			dietaryTags: [],
			popular: true,
			image: img("1568901346375-23c9450c58cd", 400),
			optionGroups: SIZE_GROUP,
		},
		{
			name: "Classic Cheeseburger",
			description: "Beef patty, American cheese, pickles, onion, ketchup.",
			price: 9.0,
			category: "Popular",
			dietaryTags: [],
			popular: true,
			image: img("1550547660-d9450f859349", 400),
		},
		{
			name: "Crispy Chicken Sandwich",
			description: "Buttermilk-fried chicken, slaw, spicy mayo.",
			price: 10.5,
			category: "Sandwiches",
			dietaryTags: ["spicy"],
			image: img("1571091718767-18b5b1457add", 400),
		},
		{
			name: "Beyond Veggie Burger",
			description: "Plant-based patty, vegan cheese, lettuce, tomato.",
			price: 10.0,
			category: "Sandwiches",
			dietaryTags: ["vegetarian", "vegan"],
			image: img("1512621776951-a57141f2eefd", 400),
		},
		{
			name: "Loaded Fries",
			description: "Crispy fries, cheese sauce, bacon, scallions.",
			price: 6.0,
			category: "Sides",
			dietaryTags: [],
			image: img("1550547660-d9450f859349", 400),
		},
		{
			name: "Chocolate Shake",
			description: "Thick hand-spun chocolate malt shake.",
			price: 5.5,
			category: "Drinks",
			dietaryTags: ["vegetarian"],
			image: img("1551024601-bec78aea704b", 400),
		},
	],
	pizza: [
		{
			name: "Margherita",
			description: "San Marzano tomato, fresh mozzarella, basil.",
			price: 13.0,
			category: "Popular",
			dietaryTags: ["vegetarian"],
			popular: true,
			image: img("1513104890138-7c749659a591", 400),
			optionGroups: SIZE_GROUP,
		},
		{
			name: "Pepperoni",
			description: "Double pepperoni, mozzarella, oregano.",
			price: 15.0,
			category: "Popular",
			dietaryTags: [],
			popular: true,
			image: img("1513104890138-7c749659a591", 400),
			optionGroups: SIZE_GROUP,
		},
		{
			name: "Truffle Funghi",
			description: "Wild mushrooms, truffle cream, fontina.",
			price: 17.0,
			category: "Pizzas",
			dietaryTags: ["vegetarian"],
			image: img("1551183053-bf91a1d81141", 400),
		},
		{
			name: "Garlic Knots",
			description: "Six knots, garlic butter, parmesan, marinara.",
			price: 6.5,
			category: "Sides",
			dietaryTags: ["vegetarian"],
			image: img("1513104890138-7c749659a591", 400),
		},
		{
			name: "Caesar Salad",
			description: "Romaine, parmesan, croutons, creamy dressing.",
			price: 8.0,
			category: "Sides",
			dietaryTags: ["vegetarian"],
			image: img("1546069901-ba9599a7e63c", 400),
		},
		{
			name: "Tiramisu",
			description: "Espresso-soaked ladyfingers, mascarpone.",
			price: 7.0,
			category: "Desserts",
			dietaryTags: ["vegetarian"],
			image: img("1551024601-bec78aea704b", 400),
		},
	],
	italian: [
		{
			name: "Spaghetti Carbonara",
			description: "Guanciale, egg yolk, pecorino, black pepper.",
			price: 16.0,
			category: "Popular",
			dietaryTags: [],
			popular: true,
			image: img("1551183053-bf91a1d81141", 400),
		},
		{
			name: "Rigatoni Bolognese",
			description: "Slow-cooked beef and pork ragù, parmesan.",
			price: 17.0,
			category: "Popular",
			dietaryTags: [],
			popular: true,
			image: img("1551183053-bf91a1d81141", 400),
		},
		{
			name: "Margherita Pizza",
			description: "Tomato, fresh mozzarella, basil.",
			price: 14.0,
			category: "Mains",
			dietaryTags: ["vegetarian"],
			image: img("1513104890138-7c749659a591", 400),
		},
		{
			name: "Bruschetta",
			description: "Grilled sourdough, tomato, garlic, basil.",
			price: 7.5,
			category: "Starters",
			dietaryTags: ["vegetarian", "vegan"],
			image: img("1540189549336-e6e99c3679fe", 400),
		},
		{
			name: "Tiramisu",
			description: "Classic espresso and mascarpone.",
			price: 8.0,
			category: "Desserts",
			dietaryTags: ["vegetarian"],
			image: img("1551024601-bec78aea704b", 400),
		},
	],
	sushi: [
		{
			name: "Omakase Nigiri (8 pc)",
			description: "Chef's selection of eight seasonal nigiri.",
			price: 24.0,
			category: "Popular",
			dietaryTags: [],
			popular: true,
			image: img("1579584425555-c3ce17fd4351", 400),
		},
		{
			name: "Spicy Tuna Roll",
			description: "Tuna, sriracha aioli, cucumber, scallion.",
			price: 9.5,
			category: "Rolls",
			dietaryTags: ["spicy"],
			popular: true,
			image: img("1579584425555-c3ce17fd4351", 400),
		},
		{
			name: "Salmon Avocado Roll",
			description: "Fresh salmon, avocado, nori, sushi rice.",
			price: 9.0,
			category: "Rolls",
			dietaryTags: ["dairy-free"],
			image: img("1467003909585-2f8a72700288", 400),
		},
		{
			name: "Edamame",
			description: "Steamed soybeans, sea salt.",
			price: 5.0,
			category: "Sides",
			dietaryTags: ["vegan", "vegetarian", "gluten-free"],
			image: img("1546069901-ba9599a7e63c", 400),
		},
		{
			name: "Miso Soup",
			description: "White miso, tofu, wakame, scallion.",
			price: 4.0,
			category: "Sides",
			dietaryTags: ["vegetarian"],
			image: img("1569718212165-3a8278d5f624", 400),
		},
		{
			name: "Mochi Ice Cream",
			description: "Three pieces, assorted flavors.",
			price: 6.0,
			category: "Desserts",
			dietaryTags: ["vegetarian"],
			image: img("1551024601-bec78aea704b", 400),
		},
	],
	ramen: [
		{
			name: "Tonkotsu Ramen",
			description: "12-hour pork broth, chashu, egg, scallion.",
			price: 14.0,
			category: "Popular",
			dietaryTags: [],
			popular: true,
			image: img("1569718212165-3a8278d5f624", 400),
			optionGroups: SIZE_GROUP,
		},
		{
			name: "Spicy Miso Ramen",
			description: "Miso broth, chili oil, corn, bean sprouts.",
			price: 14.5,
			category: "Popular",
			dietaryTags: ["spicy"],
			popular: true,
			image: img("1476224203421-9ac39bcb3327", 400),
		},
		{
			name: "Veggie Shoyu Ramen",
			description: "Soy broth, mushrooms, greens, tofu.",
			price: 13.0,
			category: "Ramen",
			dietaryTags: ["vegetarian", "vegan"],
			image: img("1490645935967-10de6ba17061", 400),
		},
		{
			name: "Pork Gyoza (6 pc)",
			description: "Pan-fried dumplings, ponzu dip.",
			price: 7.0,
			category: "Sides",
			dietaryTags: [],
			image: img("1476224203421-9ac39bcb3327", 400),
		},
		{
			name: "Green Tea",
			description: "Hot sencha green tea.",
			price: 3.0,
			category: "Drinks",
			dietaryTags: ["vegan"],
			image: img("1509042239860-f550ce710b93", 400),
		},
	],
	indian: [
		{
			name: "Butter Chicken",
			description: "Tandoori chicken in silky tomato cream sauce.",
			price: 15.0,
			category: "Popular",
			dietaryTags: [],
			popular: true,
			image: img("1585937421612-70a008356fbe", 400),
		},
		{
			name: "Paneer Tikka Masala",
			description: "Grilled paneer, spiced tomato gravy.",
			price: 14.0,
			category: "Popular",
			dietaryTags: ["vegetarian"],
			popular: true,
			image: img("1585937421612-70a008356fbe", 400),
		},
		{
			name: "Lamb Rogan Josh",
			description: "Kashmiri lamb curry, aromatic spices.",
			price: 17.0,
			category: "Curries",
			dietaryTags: ["spicy"],
			image: img("1544025162-d76694265947", 400),
		},
		{
			name: "Garlic Naan",
			description: "Tandoor-baked flatbread, garlic butter.",
			price: 4.0,
			category: "Sides",
			dietaryTags: ["vegetarian"],
			image: img("1585937421612-70a008356fbe", 400),
		},
		{
			name: "Vegetable Samosas (2)",
			description: "Crispy pastry, spiced potato and peas.",
			price: 5.5,
			category: "Sides",
			dietaryTags: ["vegetarian", "vegan"],
			image: img("1540189549336-e6e99c3679fe", 400),
		},
		{
			name: "Mango Lassi",
			description: "Yogurt, mango, cardamom.",
			price: 4.5,
			category: "Drinks",
			dietaryTags: ["vegetarian"],
			image: img("1551024601-bec78aea704b", 400),
		},
	],
	mediterranean: [
		{
			name: "Chicken Shawarma Bowl",
			description: "Marinated chicken, rice, salad, garlic sauce.",
			price: 13.0,
			category: "Popular",
			dietaryTags: [],
			popular: true,
			image: img("1540189549336-e6e99c3679fe", 400),
		},
		{
			name: "Falafel Wrap",
			description: "Crispy falafel, hummus, pickles, tahini.",
			price: 10.0,
			category: "Popular",
			dietaryTags: ["vegetarian", "vegan"],
			popular: true,
			image: img("1481931098730-318b6f776db0", 400),
		},
		{
			name: "Lamb Gyro Plate",
			description: "Sliced lamb, tzatziki, warm pita, fries.",
			price: 14.0,
			category: "Plates",
			dietaryTags: [],
			image: img("1544025162-d76694265947", 400),
		},
		{
			name: "Hummus & Pita",
			description: "Whipped hummus, olive oil, warm pita.",
			price: 6.5,
			category: "Sides",
			dietaryTags: ["vegetarian", "vegan"],
			image: img("1540189549336-e6e99c3679fe", 400),
		},
		{
			name: "Greek Salad",
			description: "Tomato, cucumber, feta, olives, oregano.",
			price: 8.5,
			category: "Sides",
			dietaryTags: ["vegetarian", "gluten-free"],
			image: img("1546069901-ba9599a7e63c", 400),
		},
		{
			name: "Baklava",
			description: "Layered filo, walnuts, honey syrup.",
			price: 5.0,
			category: "Desserts",
			dietaryTags: ["vegetarian"],
			image: img("1551024601-bec78aea704b", 400),
		},
	],
	healthy: [
		{
			name: "Harvest Grain Bowl",
			description: "Quinoa, roasted veg, avocado, tahini.",
			price: 12.5,
			category: "Popular",
			dietaryTags: ["vegetarian", "vegan", "gluten-free"],
			popular: true,
			image: img("1546069901-ba9599a7e63c", 400),
		},
		{
			name: "Grilled Chicken Salad",
			description: "Greens, chicken, cherry tomato, vinaigrette.",
			price: 12.0,
			category: "Popular",
			dietaryTags: ["gluten-free"],
			popular: true,
			image: img("1512621776951-a57141f2eefd", 400),
		},
		{
			name: "Poke Bowl",
			description: "Ahi tuna, edamame, mango, sushi rice.",
			price: 14.0,
			category: "Bowls",
			dietaryTags: ["dairy-free", "gluten-free"],
			image: img("1481931098730-318b6f776db0", 400),
		},
		{
			name: "Avocado Toast",
			description: "Sourdough, smashed avocado, chili, egg.",
			price: 9.0,
			category: "Bowls",
			dietaryTags: ["vegetarian"],
			image: img("1533089860892-a7c6f0a88666", 400),
		},
		{
			name: "Green Detox Smoothie",
			description: "Spinach, apple, ginger, lime.",
			price: 6.5,
			category: "Drinks",
			dietaryTags: ["vegan", "gluten-free"],
			image: img("1490645935967-10de6ba17061", 400),
		},
	],
	breakfast: [
		{
			name: "Buttermilk Pancakes",
			description: "Stack of three, maple syrup, butter.",
			price: 9.0,
			category: "Popular",
			dietaryTags: ["vegetarian"],
			popular: true,
			image: img("1567620905732-2d1ec7ab7445", 400),
		},
		{
			name: "Farmhouse Big Breakfast",
			description: "Eggs, bacon, sausage, hash browns, toast.",
			price: 12.0,
			category: "Popular",
			dietaryTags: [],
			popular: true,
			image: img("1533089860892-a7c6f0a88666", 400),
		},
		{
			name: "Avocado Toast",
			description: "Sourdough, avocado, poached egg, chili.",
			price: 9.5,
			category: "Plates",
			dietaryTags: ["vegetarian"],
			image: img("1484723091739-30a097e8f929", 400),
		},
		{
			name: "Belgian Waffle",
			description: "Crisp waffle, berries, whipped cream.",
			price: 8.5,
			category: "Plates",
			dietaryTags: ["vegetarian"],
			image: img("1567620905732-2d1ec7ab7445", 400),
		},
		{
			name: "Cappuccino",
			description: "Double shot, steamed milk, microfoam.",
			price: 4.0,
			category: "Drinks",
			dietaryTags: ["vegetarian"],
			image: img("1509042239860-f550ce710b93", 400),
		},
	],
	coffee: [
		{
			name: "Flat White",
			description: "Double ristretto, silky steamed milk.",
			price: 4.5,
			category: "Popular",
			dietaryTags: ["vegetarian"],
			popular: true,
			image: img("1509042239860-f550ce710b93", 400),
			optionGroups: SIZE_GROUP,
		},
		{
			name: "Cold Brew",
			description: "18-hour steeped, smooth and bold.",
			price: 4.0,
			category: "Popular",
			dietaryTags: ["vegan"],
			popular: true,
			image: img("1509042239860-f550ce710b93", 400),
			optionGroups: SIZE_GROUP,
		},
		{
			name: "Caramel Latte",
			description: "Espresso, steamed milk, caramel.",
			price: 5.0,
			category: "Coffee",
			dietaryTags: ["vegetarian"],
			image: img("1509042239860-f550ce710b93", 400),
		},
		{
			name: "Almond Croissant",
			description: "Flaky, filled with almond cream.",
			price: 4.5,
			category: "Bakery",
			dietaryTags: ["vegetarian"],
			image: img("1466978913421-dad2ebd01d17", 400),
		},
		{
			name: "Blueberry Muffin",
			description: "Buttery muffin, wild blueberries.",
			price: 3.5,
			category: "Bakery",
			dietaryTags: ["vegetarian"],
			image: img("1432139555190-58524dae6a55", 400),
		},
	],
	dessert: [
		{
			name: "Molten Chocolate Cake",
			description: "Warm cake, gooey center, vanilla gelato.",
			price: 8.0,
			category: "Popular",
			dietaryTags: ["vegetarian"],
			popular: true,
			image: img("1551024601-bec78aea704b", 400),
		},
		{
			name: "New York Cheesecake",
			description: "Classic baked cheesecake, berry compote.",
			price: 7.5,
			category: "Popular",
			dietaryTags: ["vegetarian"],
			popular: true,
			image: img("1466978913421-dad2ebd01d17", 400),
		},
		{
			name: "Gelato Trio",
			description: "Three scoops, choice of flavors.",
			price: 6.5,
			category: "Frozen",
			dietaryTags: ["vegetarian"],
			image: img("1551024601-bec78aea704b", 400),
		},
		{
			name: "Red Velvet Cupcake",
			description: "Cream cheese frosting, cocoa sponge.",
			price: 4.0,
			category: "Bakery",
			dietaryTags: ["vegetarian"],
			image: img("1432139555190-58524dae6a55", 400),
		},
		{
			name: "Fresh Berry Tart",
			description: "Vanilla custard, seasonal berries.",
			price: 6.0,
			category: "Bakery",
			dietaryTags: ["vegetarian"],
			image: img("1466978913421-dad2ebd01d17", 400),
		},
	],
	grill: [
		{
			name: "Ribeye Steak",
			description: "12oz prime ribeye, herb butter, fries.",
			price: 28.0,
			category: "Popular",
			dietaryTags: ["gluten-free"],
			popular: true,
			image: img("1504674900247-0877df9cc836", 400),
		},
		{
			name: "BBQ Baby Back Ribs",
			description: "Slow-smoked ribs, house BBQ, slaw.",
			price: 22.0,
			category: "Popular",
			dietaryTags: [],
			popular: true,
			image: img("1544025162-d76694265947", 400),
		},
		{
			name: "Grilled Salmon",
			description: "Atlantic salmon, lemon butter, asparagus.",
			price: 21.0,
			category: "Mains",
			dietaryTags: ["gluten-free", "dairy-free"],
			image: img("1467003909585-2f8a72700288", 400),
		},
		{
			name: "Half Roast Chicken",
			description: "Rotisserie chicken, chimichurri, potatoes.",
			price: 18.0,
			category: "Mains",
			dietaryTags: ["gluten-free"],
			image: img("1544025162-d76694265947", 400),
		},
		{
			name: "Truffle Fries",
			description: "Hand-cut fries, truffle oil, parmesan.",
			price: 7.0,
			category: "Sides",
			dietaryTags: ["vegetarian"],
			image: img("1550547660-d9450f859349", 400),
		},
	],
	seafood: [
		{
			name: "Grilled Salmon Plate",
			description: "Salmon fillet, quinoa, seasonal greens.",
			price: 20.0,
			category: "Popular",
			dietaryTags: ["gluten-free", "dairy-free"],
			popular: true,
			image: img("1467003909585-2f8a72700288", 400),
		},
		{
			name: "Fish & Chips",
			description: "Beer-battered cod, fries, tartar sauce.",
			price: 16.0,
			category: "Popular",
			dietaryTags: [],
			popular: true,
			image: img("1504674900247-0877df9cc836", 400),
		},
		{
			name: "Shrimp Poke Bowl",
			description: "Poached shrimp, rice, avocado, ponzu.",
			price: 15.0,
			category: "Bowls",
			dietaryTags: ["dairy-free"],
			image: img("1481931098730-318b6f776db0", 400),
		},
		{
			name: "Clam Chowder",
			description: "Creamy New England chowder, sourdough.",
			price: 8.0,
			category: "Sides",
			dietaryTags: [],
			image: img("1563379926898-05f4575a45d8", 400),
		},
		{
			name: "Lemon Tart",
			description: "Zesty lemon curd, torched meringue.",
			price: 6.0,
			category: "Desserts",
			dietaryTags: ["vegetarian"],
			image: img("1466978913421-dad2ebd01d17", 400),
		},
	],
};

export function getMenuForRestaurant(restaurantId: string): MenuItem[] {
	const template = TEMPLATE_BY_RESTAURANT[restaurantId] ?? "burgers";
	const seeds = MENU_TEMPLATES[template] ?? MENU_TEMPLATES.burgers;
	return seeds.map((seed, i) => ({
		id: `${restaurantId}-${i}`,
		restaurantId,
		name: seed.name,
		description: seed.description,
		price: seed.price,
		category: seed.category,
		dietaryTags: seed.dietaryTags,
		imageUrl: seed.image,
		popular: seed.popular ?? false,
		optionGroups: seed.optionGroups,
	}));
}

export function getRestaurantById(id: string): Restaurant | undefined {
	return RESTAURANTS.find((r) => r.id === id);
}

export function resolveRestaurant(idOrName: string): Restaurant | undefined {
	const q = idOrName.trim().toLowerCase();
	return (
		RESTAURANTS.find((r) => r.id === idOrName) ??
		RESTAURANTS.find((r) => r.name.toLowerCase() === q) ??
		RESTAURANTS.find(
			(r) =>
				r.name.toLowerCase().includes(q) || q.includes(r.name.toLowerCase()),
		) ??
		RESTAURANTS.find((r) => r.cuisine.toLowerCase() === q)
	);
}

export interface RestaurantQuery {
	categoryId?: string;
	cuisine?: string;
	query?: string;
	priceLevel?: string;
	sortBy?: "recommended" | "rating" | "eta" | "deliveryFee";
	freeDelivery?: boolean;
	offers?: boolean;
	topRated?: boolean;
	under30?: boolean;
}

export function queryRestaurants(params: RestaurantQuery = {}): Restaurant[] {
	let list = [...RESTAURANTS];
	const q = params.query?.trim().toLowerCase();

	if (params.categoryId) {
		list = list.filter((r) =>
			r.categoryIds.includes(params.categoryId as string),
		);
	}
	if (params.cuisine) {
		const c = params.cuisine.toLowerCase();
		list = list.filter(
			(r) =>
				r.cuisine.toLowerCase().includes(c) ||
				r.categoryIds.some((id) => id.includes(c)),
		);
	}
	if (q) {
		const words = q.split(/\s+/).filter(Boolean);
		list = list.filter((r) => {
			const hay =
				`${r.name} ${r.cuisine} ${r.categoryIds.join(" ")}`.toLowerCase();
			return words.some((w) => hay.includes(w));
		});
	}
	if (params.priceLevel) {
		list = list.filter((r) => r.priceLevel === params.priceLevel);
	}
	if (params.freeDelivery) list = list.filter((r) => r.deliveryFee === 0);
	if (params.offers) list = list.filter((r) => Boolean(r.promo));
	if (params.topRated) list = list.filter((r) => r.rating >= 4.6);
	if (params.under30) list = list.filter((r) => r.etaMinutes <= 30);

	switch (params.sortBy) {
		case "rating":
			list.sort((a, b) => b.rating - a.rating);
			break;
		case "eta":
			list.sort((a, b) => a.etaMinutes - b.etaMinutes);
			break;
		case "deliveryFee":
			list.sort((a, b) => a.deliveryFee - b.deliveryFee);
			break;
		default:
			list.sort(
				(a, b) =>
					b.rating * 100 +
					b.reviewCount / 100 -
					(a.rating * 100 + a.reviewCount / 100),
			);
	}
	return list;
}
