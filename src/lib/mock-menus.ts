import type { DietaryTag, MenuItem } from "@/types";

// Since Yelp doesn't expose menu data, we generate realistic menus per cuisine
const MENUS: Record<string, Omit<MenuItem, "id" | "restaurantId">[]> = {
	italian: [
		{
			name: "Margherita Pizza",
			description: "San Marzano tomatoes, fresh mozzarella, basil",
			price: 16.99,
			category: "Pizza",
			dietaryTags: ["vegetarian"],
			popular: true,
		},
		{
			name: "Spaghetti Carbonara",
			description: "Guanciale, egg yolk, pecorino romano, black pepper",
			price: 18.99,
			category: "Pasta",
			dietaryTags: [],
			popular: true,
		},
		{
			name: "Bruschetta",
			description: "Grilled bread, tomatoes, garlic, olive oil, basil",
			price: 10.99,
			category: "Appetizers",
			dietaryTags: ["vegan"],
			popular: false,
		},
		{
			name: "Caesar Salad",
			description: "Romaine, parmesan, croutons, classic Caesar dressing",
			price: 12.99,
			category: "Salads",
			dietaryTags: ["vegetarian"],
			popular: false,
		},
		{
			name: "Penne Arrabbiata",
			description: "Spicy tomato sauce, garlic, red chili flakes",
			price: 15.99,
			category: "Pasta",
			dietaryTags: ["vegan", "spicy"],
			popular: false,
		},
		{
			name: "Chicken Parmesan",
			description: "Breaded chicken, marinara, melted mozzarella, spaghetti",
			price: 21.99,
			category: "Entrees",
			dietaryTags: [],
			popular: true,
		},
		{
			name: "Tiramisu",
			description: "Espresso-soaked ladyfingers, mascarpone cream, cocoa",
			price: 9.99,
			category: "Desserts",
			dietaryTags: ["vegetarian"],
			popular: true,
		},
		{
			name: "Caprese Salad",
			description: "Buffalo mozzarella, heirloom tomatoes, basil, balsamic",
			price: 13.99,
			category: "Salads",
			dietaryTags: ["vegetarian", "gluten-free"],
			popular: false,
		},
	],
	mexican: [
		{
			name: "Tacos al Pastor",
			description:
				"Marinated pork, pineapple, onion, cilantro on corn tortillas",
			price: 14.99,
			category: "Tacos",
			dietaryTags: [],
			popular: true,
		},
		{
			name: "Chicken Burrito",
			description: "Grilled chicken, rice, beans, cheese, guacamole, salsa",
			price: 13.99,
			category: "Burritos",
			dietaryTags: [],
			popular: true,
		},
		{
			name: "Guacamole & Chips",
			description:
				"Fresh avocado, lime, cilantro, jalape\u00f1o with tortilla chips",
			price: 10.99,
			category: "Appetizers",
			dietaryTags: ["vegan", "gluten-free"],
			popular: true,
		},
		{
			name: "Enchiladas Verdes",
			description: "Chicken enchiladas, tomatillo sauce, sour cream, cheese",
			price: 16.99,
			category: "Entrees",
			dietaryTags: ["spicy"],
			popular: false,
		},
		{
			name: "Veggie Quesadilla",
			description:
				"Grilled peppers, onions, mushrooms, cheese in flour tortilla",
			price: 11.99,
			category: "Quesadillas",
			dietaryTags: ["vegetarian"],
			popular: false,
		},
		{
			name: "Churros",
			description: "Fried dough, cinnamon sugar, chocolate dipping sauce",
			price: 7.99,
			category: "Desserts",
			dietaryTags: ["vegetarian"],
			popular: false,
		},
		{
			name: "Fish Tacos",
			description: "Beer-battered cod, cabbage slaw, chipotle crema",
			price: 15.99,
			category: "Tacos",
			dietaryTags: [],
			popular: true,
		},
		{
			name: "Elote",
			description: "Grilled corn, mayo, cotija cheese, chili powder, lime",
			price: 6.99,
			category: "Sides",
			dietaryTags: ["vegetarian", "gluten-free"],
			popular: false,
		},
	],
	japanese: [
		{
			name: "Salmon Sashimi",
			description: "8 pieces of fresh Norwegian salmon",
			price: 18.99,
			category: "Sashimi",
			dietaryTags: ["gluten-free", "dairy-free"],
			popular: true,
		},
		{
			name: "Dragon Roll",
			description: "Eel, cucumber, avocado, eel sauce, sesame",
			price: 16.99,
			category: "Rolls",
			dietaryTags: [],
			popular: true,
		},
		{
			name: "Chicken Teriyaki",
			description:
				"Grilled chicken thigh, teriyaki glaze, steamed rice, vegetables",
			price: 17.99,
			category: "Entrees",
			dietaryTags: ["dairy-free"],
			popular: true,
		},
		{
			name: "Miso Soup",
			description: "Dashi broth, tofu, wakame seaweed, green onion",
			price: 4.99,
			category: "Soups",
			dietaryTags: ["vegan"],
			popular: false,
		},
		{
			name: "Edamame",
			description: "Steamed soybeans, sea salt",
			price: 5.99,
			category: "Appetizers",
			dietaryTags: ["vegan", "gluten-free"],
			popular: false,
		},
		{
			name: "Spicy Tuna Roll",
			description: "Tuna, spicy mayo, cucumber, sesame",
			price: 14.99,
			category: "Rolls",
			dietaryTags: ["spicy"],
			popular: true,
		},
		{
			name: "Vegetable Tempura",
			description:
				"Lightly battered sweet potato, zucchini, mushroom, dipping sauce",
			price: 11.99,
			category: "Appetizers",
			dietaryTags: ["vegetarian"],
			popular: false,
		},
		{
			name: "Ramen Tonkotsu",
			description: "Pork bone broth, chashu, soft egg, nori, green onion",
			price: 16.99,
			category: "Noodles",
			dietaryTags: [],
			popular: true,
		},
	],
	american: [
		{
			name: "Classic Cheeseburger",
			description:
				"Angus beef patty, cheddar, lettuce, tomato, pickles, brioche bun",
			price: 15.99,
			category: "Burgers",
			dietaryTags: [],
			popular: true,
		},
		{
			name: "BBQ Ribs",
			description: "Half rack baby back ribs, house BBQ sauce, coleslaw, fries",
			price: 24.99,
			category: "Entrees",
			dietaryTags: ["gluten-free"],
			popular: true,
		},
		{
			name: "Grilled Chicken Sandwich",
			description: "Herb-marinated chicken, avocado, bacon, Swiss, sourdough",
			price: 14.99,
			category: "Sandwiches",
			dietaryTags: [],
			popular: false,
		},
		{
			name: "Caesar Wrap",
			description:
				"Grilled chicken, romaine, parmesan, Caesar dressing, flour wrap",
			price: 12.99,
			category: "Sandwiches",
			dietaryTags: [],
			popular: false,
		},
		{
			name: "Buffalo Wings",
			description: "Crispy wings tossed in buffalo sauce, ranch, celery",
			price: 13.99,
			category: "Appetizers",
			dietaryTags: ["spicy", "gluten-free"],
			popular: true,
		},
		{
			name: "Mac & Cheese",
			description: "Creamy four-cheese blend, breadcrumb crust",
			price: 10.99,
			category: "Sides",
			dietaryTags: ["vegetarian"],
			popular: false,
		},
		{
			name: "Garden Salad",
			description:
				"Mixed greens, cherry tomatoes, cucumber, balsamic vinaigrette",
			price: 9.99,
			category: "Salads",
			dietaryTags: ["vegan", "gluten-free"],
			popular: false,
		},
		{
			name: "New York Cheesecake",
			description: "Classic dense cheesecake, strawberry compote",
			price: 8.99,
			category: "Desserts",
			dietaryTags: ["vegetarian"],
			popular: true,
		},
	],
	chinese: [
		{
			name: "Kung Pao Chicken",
			description: "Diced chicken, peanuts, dried chilies, Sichuan peppercorn",
			price: 15.99,
			category: "Entrees",
			dietaryTags: ["spicy", "nut-free"],
			popular: true,
		},
		{
			name: "Vegetable Fried Rice",
			description: "Wok-tossed rice with eggs, peas, carrots, green onion",
			price: 12.99,
			category: "Rice",
			dietaryTags: ["vegetarian"],
			popular: false,
		},
		{
			name: "Hot and Sour Soup",
			description: "Tofu, mushroom, bamboo shoots, egg, chili oil",
			price: 7.99,
			category: "Soups",
			dietaryTags: ["spicy"],
			popular: false,
		},
		{
			name: "Orange Chicken",
			description: "Crispy chicken, tangy orange glaze, steamed broccoli",
			price: 14.99,
			category: "Entrees",
			dietaryTags: [],
			popular: true,
		},
		{
			name: "Pork Dumplings",
			description: "Pan-fried pork dumplings with ginger soy dipping sauce",
			price: 10.99,
			category: "Appetizers",
			dietaryTags: [],
			popular: true,
		},
		{
			name: "Mapo Tofu",
			description: "Silken tofu, ground pork, Sichuan chili bean paste",
			price: 13.99,
			category: "Entrees",
			dietaryTags: ["spicy"],
			popular: false,
		},
		{
			name: "Spring Rolls",
			description: "Crispy vegetable rolls with sweet chili sauce",
			price: 8.99,
			category: "Appetizers",
			dietaryTags: ["vegan"],
			popular: false,
		},
		{
			name: "Beef Chow Mein",
			description: "Stir-fried egg noodles, beef, vegetables, oyster sauce",
			price: 14.99,
			category: "Noodles",
			dietaryTags: [],
			popular: true,
		},
	],
	indian: [
		{
			name: "Butter Chicken",
			description:
				"Tandoori chicken in creamy tomato-butter sauce, basmati rice",
			price: 17.99,
			category: "Entrees",
			dietaryTags: ["gluten-free"],
			popular: true,
		},
		{
			name: "Palak Paneer",
			description: "Spinach curry with fresh paneer cheese, spices",
			price: 15.99,
			category: "Entrees",
			dietaryTags: ["vegetarian", "gluten-free"],
			popular: true,
		},
		{
			name: "Chicken Tikka Masala",
			description: "Grilled chicken, spiced tomato-cream sauce, naan",
			price: 18.99,
			category: "Entrees",
			dietaryTags: [],
			popular: true,
		},
		{
			name: "Samosas",
			description: "Crispy pastry stuffed with spiced potatoes and peas",
			price: 8.99,
			category: "Appetizers",
			dietaryTags: ["vegan"],
			popular: true,
		},
		{
			name: "Garlic Naan",
			description: "Tandoor-baked flatbread with garlic butter",
			price: 4.99,
			category: "Breads",
			dietaryTags: ["vegetarian"],
			popular: false,
		},
		{
			name: "Chana Masala",
			description: "Chickpea curry with tomatoes, onions, garam masala",
			price: 13.99,
			category: "Entrees",
			dietaryTags: ["vegan", "gluten-free"],
			popular: false,
		},
		{
			name: "Lamb Biryani",
			description: "Aromatic basmati rice layered with spiced lamb, saffron",
			price: 19.99,
			category: "Rice",
			dietaryTags: ["gluten-free"],
			popular: false,
		},
		{
			name: "Gulab Jamun",
			description: "Fried milk dumplings soaked in cardamom rose syrup",
			price: 6.99,
			category: "Desserts",
			dietaryTags: ["vegetarian"],
			popular: false,
		},
	],
	thai: [
		{
			name: "Pad Thai",
			description: "Rice noodles, shrimp, tofu, peanuts, bean sprouts, lime",
			price: 15.99,
			category: "Noodles",
			dietaryTags: [],
			popular: true,
		},
		{
			name: "Green Curry",
			description: "Coconut milk, Thai basil, bamboo shoots, chicken",
			price: 16.99,
			category: "Curries",
			dietaryTags: ["spicy", "gluten-free", "dairy-free"],
			popular: true,
		},
		{
			name: "Tom Yum Soup",
			description: "Hot and sour soup with shrimp, lemongrass, galangal",
			price: 9.99,
			category: "Soups",
			dietaryTags: ["spicy", "gluten-free"],
			popular: true,
		},
		{
			name: "Mango Sticky Rice",
			description: "Sweet coconut sticky rice, fresh mango, sesame",
			price: 8.99,
			category: "Desserts",
			dietaryTags: ["vegan", "gluten-free"],
			popular: true,
		},
		{
			name: "Thai Iced Tea",
			description: "Strong brewed Thai tea, sweetened condensed milk, ice",
			price: 4.99,
			category: "Drinks",
			dietaryTags: ["vegetarian", "gluten-free"],
			popular: false,
		},
		{
			name: "Larb Gai",
			description: "Spiced minced chicken salad, lime, mint, toasted rice",
			price: 13.99,
			category: "Salads",
			dietaryTags: ["spicy", "gluten-free", "dairy-free"],
			popular: false,
		},
		{
			name: "Massaman Curry",
			description: "Rich coconut curry, potatoes, peanuts, beef",
			price: 17.99,
			category: "Curries",
			dietaryTags: ["gluten-free"],
			popular: false,
		},
		{
			name: "Satay Chicken",
			description: "Grilled chicken skewers, peanut sauce, cucumber relish",
			price: 11.99,
			category: "Appetizers",
			dietaryTags: ["gluten-free"],
			popular: false,
		},
	],
	mediterranean: [
		{
			name: "Falafel Plate",
			description: "Crispy chickpea falafel, hummus, tabbouleh, pita",
			price: 14.99,
			category: "Entrees",
			dietaryTags: ["vegan"],
			popular: true,
		},
		{
			name: "Chicken Shawarma",
			description: "Spiced rotisserie chicken, garlic sauce, pickles, pita",
			price: 15.99,
			category: "Entrees",
			dietaryTags: ["dairy-free"],
			popular: true,
		},
		{
			name: "Hummus & Pita",
			description: "Creamy chickpea hummus, warm pita bread, olive oil",
			price: 8.99,
			category: "Appetizers",
			dietaryTags: ["vegan"],
			popular: false,
		},
		{
			name: "Lamb Kofta",
			description: "Grilled spiced lamb skewers, tzatziki, rice pilaf",
			price: 19.99,
			category: "Entrees",
			dietaryTags: ["gluten-free"],
			popular: false,
		},
		{
			name: "Greek Salad",
			description: "Tomatoes, cucumber, olives, feta, red onion, oregano",
			price: 11.99,
			category: "Salads",
			dietaryTags: ["vegetarian", "gluten-free"],
			popular: true,
		},
		{
			name: "Baba Ganoush",
			description: "Smoky eggplant dip, tahini, lemon, pita",
			price: 9.99,
			category: "Appetizers",
			dietaryTags: ["vegan"],
			popular: false,
		},
		{
			name: "Grilled Salmon",
			description: "Herb-crusted salmon, lemon, roasted vegetables, rice",
			price: 22.99,
			category: "Entrees",
			dietaryTags: ["gluten-free", "dairy-free"],
			popular: false,
		},
		{
			name: "Baklava",
			description: "Layers of phyllo, walnuts, pistachios, honey syrup",
			price: 7.99,
			category: "Desserts",
			dietaryTags: ["vegetarian"],
			popular: false,
		},
	],
};

const CUISINE_ALIASES: Record<string, string> = {
	pizza: "italian",
	pasta: "italian",
	sushi: "japanese",
	ramen: "japanese",
	tacos: "mexican",
	burrito: "mexican",
	burger: "american",
	burgers: "american",
	bbq: "american",
	curry: "indian",
	naan: "indian",
	dim_sum: "chinese",
	dumplings: "chinese",
	pad_thai: "thai",
	pho: "thai",
	kebab: "mediterranean",
	falafel: "mediterranean",
	shawarma: "mediterranean",
	greek: "mediterranean",
};

function resolveCuisine(categories: string[]): string {
	for (const cat of categories) {
		const lower = cat.toLowerCase().replace(/\s+/g, "_");
		if (MENUS[lower]) return lower;
		if (CUISINE_ALIASES[lower]) return CUISINE_ALIASES[lower];
	}
	return "american";
}

export function getMenuForRestaurant(
	restaurantId: string,
	categories: string[],
): MenuItem[] {
	const cuisine = resolveCuisine(categories);
	const template = MENUS[cuisine] ?? MENUS.american;

	return template.map((item, i) => ({
		...item,
		id: `${restaurantId}-item-${i}`,
		restaurantId,
	}));
}

export function filterMenuItems(
	items: MenuItem[],
	opts: {
		dietaryTags?: DietaryTag[];
		maxPrice?: number;
		category?: string;
		query?: string;
	},
): MenuItem[] {
	let filtered = items;

	if (opts.dietaryTags?.length) {
		const tags = opts.dietaryTags;
		filtered = filtered.filter((item) =>
			tags.every((tag) => item.dietaryTags.includes(tag)),
		);
	}

	if (opts.maxPrice != null) {
		const max = opts.maxPrice;
		filtered = filtered.filter((item) => item.price <= max);
	}

	if (opts.category) {
		const cat = opts.category.toLowerCase();
		filtered = filtered.filter((item) => item.category.toLowerCase() === cat);
	}

	if (opts.query) {
		const q = opts.query.toLowerCase();
		filtered = filtered.filter(
			(item) =>
				item.name.toLowerCase().includes(q) ||
				item.description.toLowerCase().includes(q),
		);
	}

	return filtered;
}
