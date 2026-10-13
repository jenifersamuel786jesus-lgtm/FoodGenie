// server.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// src/data/seedData.ts
var GENERATED_IMAGES = {
  feast: "/src/assets/images/hero_gourmet_feast_1791706198554.jpg",
  bistro: "/src/assets/images/restaurant_bistro_interior_1791706212212.jpg",
  burger: "/src/assets/images/dish_truffle_burger_1791706224500.jpg",
  pizza: "/src/assets/images/dish_artisan_pizza_1791706236798.jpg",
  grainBowl: "/src/assets/images/dish_avocado_grain_bowl_1791709345120.jpg",
  pasta: "/src/assets/images/dish_creamy_pasta_plate_1791709355168.jpg",
  indianCurry: "/src/assets/images/dish_indian_paneer_curry_1791709367245.jpg",
  friesAndBread: "/src/assets/images/dish_crispy_fries_bread_1791709379552.jpg",
  avatar: "/src/assets/images/avatar_diner_portrait_1791709391779.jpg"
};
var initialRestaurants = [
  {
    _id: "rest-1",
    name: "The Wood-Fired Oven",
    isVeg: true,
    address: "42 Baker Street, Downtown \xB7 Wood-Fired Pizza Kitchen",
    ratings: 4.9,
    numOfReviews: 342,
    deliveryTime: "25\u201330 min",
    priceForTwo: 38,
    cuisine: ["Wood-Fired Pizza", "Italian", "Fresh Salads"],
    images: [{ public_id: "forno_1", url: GENERATED_IMAGES.pizza }],
    reviews: [
      {
        _id: "rev-101",
        userName: "Aaron Miller",
        rating: 5,
        comment: "The sourdough crust on the Classic Margherita Pizza has an amazing crispness and airy edge. Easily the best wood-fired pizza in town.",
        createdAt: "2026-09-28",
        dishMentioned: "Classic Margherita Pizza"
      },
      {
        _id: "rev-102",
        userName: "Elena Ross",
        rating: 5,
        comment: "The Fresh Mozzarella & Heirloom Tomato Salad arrived chilled separately from the warm rosemary garlic bread. Thoughtful packaging and fresh ingredients.",
        createdAt: "2026-10-02",
        dishMentioned: "Fresh Mozzarella & Tomato Salad"
      },
      {
        _id: "rev-103",
        userName: "Kevin Brooks",
        rating: 4.5,
        comment: "The Truffle & Wild Mushroom White Pizza is rich and flavorful. Would love slightly more chili oil on the side, but the flavor balance is spot-on.",
        createdAt: "2026-10-07",
        dishMentioned: "Truffle & Wild Mushroom Pizza"
      }
    ]
  },
  {
    _id: "rest-2",
    name: "Craft Burger Kitchen",
    isVeg: false,
    address: "18 Mercer Avenue, Midtown \xB7 Gourmet Burgers & Fries",
    ratings: 4.8,
    numOfReviews: 518,
    deliveryTime: "20\u201325 min",
    priceForTwo: 34,
    cuisine: ["Smash Burgers", "Seasoned Fries", "Milkshakes"],
    images: [{ public_id: "atelier_1", url: GENERATED_IMAGES.burger }],
    reviews: [
      {
        _id: "rev-201",
        userName: "Ryan Cooper",
        rating: 5,
        comment: "The Double Beef Truffle Burger with melted aged cheddar and truffle mayo is unbeatable. The toasted brioche bun holds up great.",
        createdAt: "2026-10-01",
        dishMentioned: "Double Beef Truffle Burger"
      },
      {
        _id: "rev-202",
        userName: "Maya Lin",
        rating: 4.8,
        comment: "The Crispy Rosemary Parmesan Fries were still hot and crunchy on arrival! The smoky chipotle glaze on the grilled cheese burger is also fantastic.",
        createdAt: "2026-10-05",
        dishMentioned: "Crispy Rosemary Parmesan Fries"
      },
      {
        _id: "rev-203",
        userName: "Sam Rivera",
        rating: 4.5,
        comment: "Generous portions and great seasoning. Delivery took only 24 minutes during the dinner rush.",
        createdAt: "2026-10-08",
        dishMentioned: "Double Beef Truffle Burger"
      }
    ]
  },
  {
    _id: "rest-3",
    name: "The Open Hearth Grill",
    isVeg: false,
    address: "7 Copper Row, West End \xB7 Flame-Grilled Steaks & Pasta",
    ratings: 4.7,
    numOfReviews: 289,
    deliveryTime: "30\u201335 min",
    priceForTwo: 46,
    cuisine: ["Flame Grill", "Steaks & Skewers", "Fresh Pasta"],
    images: [{ public_id: "braise_1", url: GENERATED_IMAGES.bistro }],
    reviews: [
      {
        _id: "rev-301",
        userName: "Claire Dawson",
        rating: 5,
        comment: "The Flame-Grilled Herb Chicken Skewers and fresh pasta taste straight from an open kitchen. Rich smoky flavor in every bite.",
        createdAt: "2026-09-30",
        dishMentioned: "Flame-Grilled Herb Chicken Skewers"
      },
      {
        _id: "rev-302",
        userName: "Victor Nelson",
        rating: 4.5,
        comment: "The grilled steak medallions and roasted baby potatoes had wonderful texture. Restaurant-quality meal at home.",
        createdAt: "2026-10-04",
        dishMentioned: "Pan-Seared Steak & Baby Potatoes"
      }
    ]
  },
  {
    _id: "rest-4",
    name: "Green Harvest Kitchen",
    isVeg: true,
    address: "104 Garden Courtyard, Uptown \xB7 Healthy Bowls & Bakery",
    ratings: 4.9,
    numOfReviews: 412,
    deliveryTime: "20\u201325 min",
    priceForTwo: 28,
    cuisine: ["Healthy Grain Bowls", "Sourdough Bakery", "Plant-Based"],
    images: [{ public_id: "verdure_1", url: GENERATED_IMAGES.grainBowl }],
    reviews: [
      {
        _id: "rev-401",
        userName: "Hannah Scott",
        rating: 5,
        comment: "A 100% vegetarian kitchen that makes healthy food taste incredible. The Warm Grain & Avocado Harvest Bowl is my daily favorite.",
        createdAt: "2026-10-03",
        dishMentioned: "Warm Grain & Avocado Harvest Bowl"
      },
      {
        _id: "rev-402",
        userName: "Daniel Park",
        rating: 4.9,
        comment: "The Freshly Baked Sourdough Bread with herb butter and olive oil is pure comfort.",
        createdAt: "2026-10-09",
        dishMentioned: "Freshly Baked Country Sourdough"
      }
    ]
  },
  {
    _id: "rest-5",
    name: "Saffron & Spice Grill",
    isVeg: false,
    address: "29 Heritage Arcade, Eastside \xB7 Charcoal Skewers & Curries",
    ratings: 4.6,
    numOfReviews: 624,
    deliveryTime: "25\u201330 min",
    priceForTwo: 32,
    cuisine: ["Charcoal Skewers", "Slow-Cooked Curries", "Garlic Flatbreads"],
    images: [{ public_id: "saffron_1", url: GENERATED_IMAGES.indianCurry }],
    reviews: [
      {
        _id: "rev-501",
        userName: "Zoe Carter",
        rating: 4.8,
        comment: "The Charcoal-Grilled Cottage Cheese Skewers have an authentic smoky flavor, and the garlic butter flatbread is super soft and flaky.",
        createdAt: "2026-10-06",
        dishMentioned: "Charcoal-Grilled Cottage Cheese Skewers"
      },
      {
        _id: "rev-502",
        userName: "Nathan Vance",
        rating: 4.5,
        comment: "The Slow-Simmered Creamy Black Lentils are rich, velvety, and comforting. Great spice level.",
        createdAt: "2026-10-10",
        dishMentioned: "Slow-Simmered Creamy Black Lentils"
      }
    ]
  },
  {
    _id: "rest-6",
    name: "Garden Pasta House",
    isVeg: true,
    address: "61 Olive Grove Promenade \xB7 Vegetarian Pasta & Pizza",
    ratings: 4.8,
    numOfReviews: 195,
    deliveryTime: "25\u201330 min",
    priceForTwo: 36,
    cuisine: ["Fresh Pasta", "Garlic Breads", "Pure Vegetarian"],
    images: [{ public_id: "terracotta_1", url: GENERATED_IMAGES.pasta }],
    reviews: [
      {
        _id: "rev-601",
        userName: "Priya Mason",
        rating: 5,
        comment: "The Pistachio Pesto Pizza and roasted tomato garlic bread are delicious. Love that the entire menu is pure vegetarian!",
        createdAt: "2026-10-04",
        dishMentioned: "Pistachio Pesto & Mozzarella Pizza"
      }
    ]
  }
];
var initialMenus = [
  {
    _id: "menu-rest-1",
    restaurant: "rest-1",
    menu: [
      {
        category: "Wood-Fired Pizzas",
        items: [
          {
            _id: "item-101",
            name: "Classic Margherita Pizza",
            price: 18,
            description: "Crushed vine-ripened tomatoes, fresh mozzarella cheese, sweet organic basil leaves, and extra virgin olive oil on a wood-fired sourdough crust.",
            ratings: 4.9,
            numOfReviews: 184,
            images: [{ public_id: "img-101", url: GENERATED_IMAGES.pizza }],
            category: "Wood-Fired Pizzas",
            stock: 25,
            isVeg: true,
            calories: 740,
            prepTime: "15 min",
            restaurant: "rest-1",
            restaurantName: "The Wood-Fired Oven"
          },
          {
            _id: "item-102",
            name: "Truffle & Wild Mushroom Pizza",
            price: 22,
            description: "Roasted wild mushrooms, melted aged white cheese, black truffle cream sauce, fresh thyme, and roasted garlic.",
            ratings: 4.8,
            numOfReviews: 112,
            images: [{ public_id: "img-102", url: GENERATED_IMAGES.pizza }],
            category: "Wood-Fired Pizzas",
            stock: 18,
            isVeg: true,
            calories: 820,
            prepTime: "18 min",
            restaurant: "rest-1",
            restaurantName: "The Wood-Fired Oven"
          },
          {
            _id: "item-103",
            name: "Spicy Plant-Pepperoni Pizza",
            price: 20,
            description: "Smoky plant-based pepperoni slices, sweet chili honey drizzle, crushed tomato sauce, and melted provolone cheese.",
            ratings: 4.7,
            numOfReviews: 76,
            images: [{ public_id: "img-103", url: GENERATED_IMAGES.pizza }],
            category: "Wood-Fired Pizzas",
            stock: 20,
            isVeg: true,
            calories: 790,
            prepTime: "16 min",
            restaurant: "rest-1",
            restaurantName: "The Wood-Fired Oven"
          }
        ]
      },
      {
        category: "Salads & Warm Starters",
        items: [
          {
            _id: "item-104",
            name: "Fresh Mozzarella & Tomato Salad",
            price: 16,
            description: "Creamy fresh mozzarella over peppery arugula greens, sweet cherry tomatoes, aged balsamic glaze, and toasted pine nuts.",
            ratings: 4.9,
            numOfReviews: 145,
            images: [{ public_id: "img-104", url: GENERATED_IMAGES.grainBowl }],
            category: "Salads & Warm Starters",
            stock: 30,
            isVeg: true,
            calories: 460,
            prepTime: "10 min",
            restaurant: "rest-1",
            restaurantName: "The Wood-Fired Oven"
          },
          {
            _id: "item-105",
            name: "Warm Rosemary Garlic Bread & Herb Butter",
            price: 11,
            description: "Oven-baked sourdough flatbread topped with sea salt, fresh rosemary, whipped butter, and roasted garlic oil.",
            ratings: 4.8,
            numOfReviews: 92,
            images: [{ public_id: "img-105", url: GENERATED_IMAGES.friesAndBread }],
            category: "Salads & Warm Starters",
            stock: 40,
            isVeg: true,
            calories: 510,
            prepTime: "12 min",
            restaurant: "rest-1",
            restaurantName: "The Wood-Fired Oven"
          }
        ]
      }
    ]
  },
  {
    _id: "menu-rest-2",
    restaurant: "rest-2",
    menu: [
      {
        category: "Signature Smash Burgers",
        items: [
          {
            _id: "item-201",
            name: "Double Beef Truffle Burger",
            price: 19,
            description: "Two seared beef smash patties, melted aged cheddar cheese, sweet caramelized onions, and black truffle mayo on a toasted sesame brioche bun.",
            ratings: 4.9,
            numOfReviews: 290,
            images: [{ public_id: "img-201", url: GENERATED_IMAGES.burger }],
            category: "Signature Smash Burgers",
            stock: 35,
            isVeg: false,
            calories: 890,
            prepTime: "14 min",
            restaurant: "rest-2",
            restaurantName: "Craft Burger Kitchen"
          },
          {
            _id: "item-202",
            name: "Smoky Chipotle & Grilled Cheese Burger",
            price: 17,
            description: "Golden-seared halloumi cheese patty, roasted pepper relish, sliced avocado, pickled red onions, and smoky chipotle mayo on brioche.",
            ratings: 4.8,
            numOfReviews: 134,
            images: [{ public_id: "img-202", url: GENERATED_IMAGES.burger }],
            category: "Signature Smash Burgers",
            stock: 22,
            isVeg: true,
            calories: 760,
            prepTime: "12 min",
            restaurant: "rest-2",
            restaurantName: "Craft Burger Kitchen"
          }
        ]
      },
      {
        category: "Crispy Fries & Sides",
        items: [
          {
            _id: "item-203",
            name: "Crispy Rosemary Parmesan Fries",
            price: 9,
            description: "Twice-cooked golden potato fries tossed with crispy rosemary herbs, cracked black pepper, and grated Parmesan cheese.",
            ratings: 4.9,
            numOfReviews: 210,
            images: [{ public_id: "img-203", url: GENERATED_IMAGES.friesAndBread }],
            category: "Crispy Fries & Sides",
            stock: 50,
            isVeg: true,
            calories: 480,
            prepTime: "10 min",
            restaurant: "rest-2",
            restaurantName: "Craft Burger Kitchen"
          },
          {
            _id: "item-204",
            name: "Chargrilled Corn & Bell Pepper Skewers",
            price: 12,
            description: "Flame-grilled sweet corn and colorful bell pepper skewers served with smoky paprika dip and grilled lemon.",
            ratings: 4.7,
            numOfReviews: 68,
            images: [{ public_id: "img-204", url: GENERATED_IMAGES.feast }],
            category: "Crispy Fries & Sides",
            stock: 30,
            isVeg: true,
            calories: 340,
            prepTime: "12 min",
            restaurant: "rest-2",
            restaurantName: "Craft Burger Kitchen"
          }
        ]
      }
    ]
  },
  {
    _id: "menu-rest-3",
    restaurant: "rest-3",
    menu: [
      {
        category: "From the Open Grill",
        items: [
          {
            _id: "item-301",
            name: "Flame-Grilled Herb Chicken Skewers",
            price: 21,
            description: "Free-range herb-marinated chicken skewers grilled over oak flames with sweet peppers, zucchini, grilled lemon, and roasted garlic sauce.",
            ratings: 4.8,
            numOfReviews: 156,
            images: [{ public_id: "img-301", url: GENERATED_IMAGES.feast }],
            category: "From the Open Grill",
            stock: 20,
            isVeg: false,
            calories: 620,
            prepTime: "18 min",
            restaurant: "rest-3",
            restaurantName: "The Open Hearth Grill"
          },
          {
            _id: "item-302",
            name: "Roasted Tomato & Basil Ribbon Pasta",
            price: 20,
            description: "Fresh handmade ribbon pasta tossed with slow-roasted cherry tomatoes, fragrant basil oil, and creamy mozzarella.",
            ratings: 4.7,
            numOfReviews: 98,
            images: [{ public_id: "img-302", url: GENERATED_IMAGES.pasta }],
            category: "From the Open Grill",
            stock: 18,
            isVeg: true,
            calories: 680,
            prepTime: "16 min",
            restaurant: "rest-3",
            restaurantName: "The Open Hearth Grill"
          },
          {
            _id: "item-303",
            name: "Pan-Seared Steak & Baby Potatoes",
            price: 29,
            description: "Prime grass-fed beef medallions seared with rosemary pan gravy, crispy baby potatoes, and charred broccoli.",
            ratings: 4.9,
            numOfReviews: 124,
            images: [{ public_id: "img-303", url: GENERATED_IMAGES.bistro }],
            category: "From the Open Grill",
            stock: 15,
            isVeg: false,
            calories: 850,
            prepTime: "22 min",
            restaurant: "rest-3",
            restaurantName: "The Open Hearth Grill"
          }
        ]
      }
    ]
  },
  {
    _id: "menu-rest-4",
    restaurant: "rest-4",
    menu: [
      {
        category: "Harvest Bowls & Fresh Bakery",
        items: [
          {
            _id: "item-401",
            name: "Warm Grain & Avocado Harvest Bowl",
            price: 16,
            description: "Warm nutty whole grains, baby arugula greens, sweet cherry tomatoes, creamy mozzarella, toasted pumpkin seeds, and lemon-basil dressing.",
            ratings: 4.9,
            numOfReviews: 230,
            images: [{ public_id: "img-401", url: GENERATED_IMAGES.grainBowl }],
            category: "Harvest Bowls & Fresh Bakery",
            stock: 40,
            isVeg: true,
            calories: 520,
            prepTime: "12 min",
            restaurant: "rest-4",
            restaurantName: "Green Harvest Kitchen"
          },
          {
            _id: "item-402",
            name: "Freshly Baked Country Sourdough Bread",
            price: 10,
            description: "Thick-sliced country sourdough bread baked fresh daily, served with sea-salted whipped butter and cold-pressed olive oil.",
            ratings: 4.9,
            numOfReviews: 180,
            images: [{ public_id: "img-402", url: GENERATED_IMAGES.friesAndBread }],
            category: "Harvest Bowls & Fresh Bakery",
            stock: 35,
            isVeg: true,
            calories: 410,
            prepTime: "8 min",
            restaurant: "rest-4",
            restaurantName: "Green Harvest Kitchen"
          },
          {
            _id: "item-403",
            name: "Grilled Zucchini & Cheese Skewers",
            price: 15,
            description: "Flame-grilled zucchini, sweet bell peppers, and golden grilled cheese skewers with tangy pomegranate glaze and mint yogurt.",
            ratings: 4.8,
            numOfReviews: 94,
            images: [{ public_id: "img-403", url: GENERATED_IMAGES.feast }],
            category: "Harvest Bowls & Fresh Bakery",
            stock: 28,
            isVeg: true,
            calories: 440,
            prepTime: "14 min",
            restaurant: "rest-4",
            restaurantName: "Green Harvest Kitchen"
          }
        ]
      }
    ]
  },
  {
    _id: "menu-rest-5",
    restaurant: "rest-5",
    menu: [
      {
        category: "Charcoal Skewers & Slow-Cooked Classics",
        items: [
          {
            _id: "item-501",
            name: "Charcoal-Grilled Cottage Cheese Skewers",
            price: 16,
            description: "Soft cottage cheese cubes marinated in spiced yogurt, mild red chili, and roasted cumin, grilled over live charcoal.",
            ratings: 4.8,
            numOfReviews: 310,
            images: [{ public_id: "img-501", url: GENERATED_IMAGES.indianCurry }],
            category: "Charcoal Skewers & Slow-Cooked Classics",
            stock: 30,
            isVeg: true,
            calories: 560,
            prepTime: "15 min",
            restaurant: "rest-5",
            restaurantName: "Saffron & Spice Grill"
          },
          {
            _id: "item-502",
            name: "Smoky Grilled Chicken Skewers",
            price: 18,
            description: "Tender chicken skewers marinated with roasted garlic, warm spices, and saffron yogurt, served with fresh mint dip.",
            ratings: 4.7,
            numOfReviews: 275,
            images: [{ public_id: "img-502", url: GENERATED_IMAGES.feast }],
            category: "Charcoal Skewers & Slow-Cooked Classics",
            stock: 25,
            isVeg: false,
            calories: 610,
            prepTime: "18 min",
            restaurant: "rest-5",
            restaurantName: "Saffron & Spice Grill"
          },
          {
            _id: "item-503",
            name: "Slow-Simmered Creamy Black Lentils",
            price: 15,
            description: "Rich black lentils simmered overnight over slow embers with tomato pur\xE9e, fresh ginger, and cream.",
            ratings: 4.9,
            numOfReviews: 410,
            images: [{ public_id: "img-503", url: GENERATED_IMAGES.indianCurry }],
            category: "Charcoal Skewers & Slow-Cooked Classics",
            stock: 40,
            isVeg: true,
            calories: 590,
            prepTime: "12 min",
            restaurant: "rest-5",
            restaurantName: "Saffron & Spice Grill"
          }
        ]
      }
    ]
  },
  {
    _id: "menu-rest-6",
    restaurant: "rest-6",
    menu: [
      {
        category: "Vegetarian Pizzas & Garlic Breads",
        items: [
          {
            _id: "item-601",
            name: "Pistachio Pesto & Mozzarella Pizza",
            price: 21,
            description: "Stone-ground pistachio basil pesto base, melted mozzarella, creamy burrata cheese, crushed pistachios, and fresh lemon zest.",
            ratings: 4.9,
            numOfReviews: 128,
            images: [{ public_id: "img-601", url: GENERATED_IMAGES.pasta }],
            category: "Vegetarian Pizzas & Garlic Breads",
            stock: 22,
            isVeg: true,
            calories: 780,
            prepTime: "16 min",
            restaurant: "rest-6",
            restaurantName: "Garden Pasta House"
          },
          {
            _id: "item-602",
            name: "Roasted Tomato & Basil Garlic Toast",
            price: 13,
            description: "Toasted country bread rubbed with roasted garlic, topped with marinated sweet cherry tomatoes, fresh basil, and balsamic glaze.",
            ratings: 4.7,
            numOfReviews: 89,
            images: [{ public_id: "img-602", url: GENERATED_IMAGES.friesAndBread }],
            category: "Vegetarian Pizzas & Garlic Breads",
            stock: 30,
            isVeg: true,
            calories: 380,
            prepTime: "10 min",
            restaurant: "rest-6",
            restaurantName: "Garden Pasta House"
          }
        ]
      }
    ]
  }
];
var initialCoupons = [
  {
    _id: "coup-1",
    code: "FEAST20",
    description: "20% off on orders above $25 (up to $15 savings)",
    discountType: "PERCENTAGE",
    discountValue: 20,
    minOrderAmount: 25,
    maxDiscount: 15,
    isActive: true,
    expiryDate: "2027-12-31"
  },
  {
    _id: "coup-2",
    code: "WELCOME10",
    description: "Flat $10 off on orders of $30 or more",
    discountType: "FLAT",
    discountValue: 10,
    minOrderAmount: 30,
    maxDiscount: 10,
    isActive: true,
    expiryDate: "2027-12-31"
  },
  {
    _id: "coup-3",
    code: "PUREVEG15",
    description: "15% off on vegetarian orders above $20",
    discountType: "PERCENTAGE",
    discountValue: 15,
    minOrderAmount: 20,
    maxDiscount: 12,
    isActive: true,
    expiryDate: "2027-12-31"
  },
  {
    _id: "coup-4",
    code: "CHEF5",
    description: "Instant $5 off on any order above $15",
    discountType: "FLAT",
    discountValue: 5,
    minOrderAmount: 15,
    maxDiscount: 5,
    isActive: true,
    expiryDate: "2027-12-31"
  }
];

// server/aiService.ts
import { GoogleGenAI, Type } from "@google/genai";
var CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite"
];
function getGenAIClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
function buildSmartLocalRecommendations(prompt, dietaryPreference, filteredItems) {
  const q = prompt.toLowerCase();
  const scored = filteredItems.map((item) => {
    let score = item.ratings * 10;
    if (q.includes("pizza") && item.name.toLowerCase().includes("pizza")) score += 40;
    if (q.includes("burger") && item.name.toLowerCase().includes("burger")) score += 40;
    if (q.includes("fries") && item.name.toLowerCase().includes("fries")) score += 35;
    if ((q.includes("healthy") || q.includes("bowl") || q.includes("light") || q.includes("550") || q.includes("calorie")) && item.calories <= 560) {
      score += 40;
    }
    if ((q.includes("protein") || q.includes("workout") || q.includes("grill") || q.includes("skewer")) && (item.name.toLowerCase().includes("skewer") || item.name.toLowerCase().includes("steak") || item.name.toLowerCase().includes("burger"))) {
      score += 35;
    }
    if (q.includes("pasta") && item.name.toLowerCase().includes("pasta")) score += 40;
    if (q.includes("truffle") && item.name.toLowerCase().includes("truffle")) score += 35;
    return { item, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const topThree = scored.slice(0, 3).map(({ item }) => ({
    itemId: item._id,
    name: item.name,
    restaurantName: item.restaurantName,
    whyItMatches: `${item.description.split(".")[0]}. Prepared fresh in ${item.prepTime} (${item.calories} kcal, rated ${item.ratings}\u2605).`,
    pairingTip: item.isVeg ? "Pairs wonderfully with warm Rosemary Garlic Bread or a chilled sparkling citrus drink." : "Pairs great with Crispy Rosemary Parmesan Fries or a fresh side salad."
  }));
  return {
    conciergeNote: `FoodGenie curated these top-rated ${dietaryPreference === "VEG" ? "pure vegetarian " : dietaryPreference === "NON_VEG" ? "chef-special " : ""}dishes tailored to "${prompt}":`,
    recommendations: topThree
  };
}
function buildSmartLocalReviewReport(restaurant) {
  const score = Math.min(99, Math.round(restaurant.ratings * 20));
  const dishes = restaurant.reviews.map((r) => r.dishMentioned).filter((d) => Boolean(d));
  return {
    overallSentiment: restaurant.ratings >= 4.8 ? "Highly Acclaimed by Diners" : "Consistently Positive",
    sentimentScore: score,
    executiveSummary: `Diners consistently praise ${restaurant.name} for its fresh ingredients, authentic ${restaurant.cuisine[0]} preparation, and reliable ${restaurant.deliveryTime} delivery window across ${restaurant.numOfReviews} verified orders.`,
    keyStrengths: [
      `Authentic ${restaurant.cuisine.slice(0, 2).join(" & ")} flavor profile`,
      `Fast and temperature-controlled delivery (${restaurant.deliveryTime})`,
      `High diner repeat rate with a ${restaurant.ratings.toFixed(1)}/5 average rating`
    ],
    standoutDishes: dishes.length > 0 ? Array.from(new Set(dishes)) : restaurant.cuisine,
    PackagingAndDeliveryNote: "Hot and cold items are packed in separate insulated containers to preserve texture and crispness upon arrival."
  };
}
async function generateDishRecommendations(prompt, dietaryPreference, allItems) {
  const filteredItems = allItems.filter((item) => {
    if (dietaryPreference === "VEG") return item.isVeg;
    if (dietaryPreference === "NON_VEG") return !item.isVeg;
    return true;
  });
  const catalogForPrompt = filteredItems.map((item) => ({
    itemId: item._id,
    name: item.name,
    restaurantName: item.restaurantName,
    restaurantId: item.restaurant,
    price: item.price,
    isVeg: item.isVeg,
    calories: item.calories,
    description: item.description
  }));
  if (!process.env.GEMINI_API_KEY) {
    return buildSmartLocalRecommendations(prompt, dietaryPreference, filteredItems);
  }
  const ai = getGenAIClient();
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `User Craving / Request: "${prompt}"
Dietary Filter: ${dietaryPreference}

Available Catalog Items:
${JSON.stringify(catalogForPrompt, null, 2)}

Select the best 2 to 3 dishes from the catalog that match the user's craving, mood, or nutritional goal. Return only items that exist in the catalog above.`,
        config: {
          systemInstruction: "You are FoodGenie, a smart AI Food Assistant. Always respond in clear, plain English. Recommend real menu items from the provided catalog with simple, appetizing reasons and side dish pairing suggestions.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              conciergeNote: {
                type: Type.STRING,
                description: "A warm 1-2 sentence FoodGenie note addressing the user request."
              },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    itemId: { type: Type.STRING },
                    name: { type: Type.STRING },
                    restaurantName: { type: Type.STRING },
                    whyItMatches: { type: Type.STRING },
                    pairingTip: { type: Type.STRING }
                  },
                  required: [
                    "itemId",
                    "name",
                    "restaurantName",
                    "whyItMatches",
                    "pairingTip"
                  ]
                }
              }
            },
            required: ["conciergeNote", "recommendations"]
          }
        }
      });
      const text = response.text;
      if (text) {
        return JSON.parse(text);
      }
    } catch (err) {
      console.warn(
        `[FoodGenie AI] Model ${modelName} busy or unavailable (${err?.status || err?.message}), trying next...`
      );
    }
  }
  return buildSmartLocalRecommendations(prompt, dietaryPreference, filteredItems);
}
async function analyzeRestaurantReviews(restaurant) {
  if (!process.env.GEMINI_API_KEY) {
    return buildSmartLocalReviewReport(restaurant);
  }
  const ai = getGenAIClient();
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `Analyze the customer reviews for restaurant "${restaurant.name}" (${restaurant.cuisine.join(", ")}).
Current Rating: ${restaurant.ratings}/5 (${restaurant.numOfReviews} total reviews).

Recent Verified Reviews:
${JSON.stringify(restaurant.reviews, null, 2)}`,
        config: {
          systemInstruction: "You are FoodGenie Review Analyzer. Synthesize verified customer feedback into a structured, objective restaurant quality report in plain English.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallSentiment: {
                type: Type.STRING,
                description: "Positive, Highly Acclaimed, Mixed, or Needs Attention"
              },
              sentimentScore: {
                type: Type.NUMBER,
                description: "Score from 0 to 100 based on diner satisfaction"
              },
              executiveSummary: {
                type: Type.STRING,
                description: "Concise 2-sentence synthesis of what diners love and experience."
              },
              keyStrengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              standoutDishes: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              PackagingAndDeliveryNote: {
                type: Type.STRING
              }
            },
            required: [
              "overallSentiment",
              "sentimentScore",
              "executiveSummary",
              "keyStrengths",
              "standoutDishes",
              "PackagingAndDeliveryNote"
            ]
          }
        }
      });
      const text = response.text;
      if (text) {
        return JSON.parse(text);
      }
    } catch (err) {
      console.warn(
        `[FoodGenie AI] Review model ${modelName} busy (${err?.status || err?.message}), trying next...`
      );
    }
  }
  return buildSmartLocalReviewReport(restaurant);
}

// server/db.ts
import mongoose6 from "mongoose";

// server/models/Restaurant.ts
import mongoose, { Schema } from "mongoose";
var ReviewSchema = new Schema(
  {
    _id: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    createdAt: { type: String, required: true },
    dishMentioned: { type: String }
  },
  { _id: false }
);
var RestaurantSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    isVeg: { type: Boolean, default: false },
    address: { type: String, required: true },
    ratings: { type: Number, default: 0 },
    numOfReviews: { type: Number, default: 0 },
    deliveryTime: { type: String, default: "30-40 min" },
    priceForTwo: { type: Number, default: 30 },
    cuisine: [{ type: String }],
    images: [
      {
        public_id: { type: String },
        url: { type: String }
      }
    ],
    reviews: [ReviewSchema]
  },
  {
    timestamps: true,
    _id: false
  }
);
var Restaurant = mongoose.models.Restaurant || mongoose.model("Restaurant", RestaurantSchema);

// server/models/Menu.ts
import mongoose2, { Schema as Schema2 } from "mongoose";
var FoodItemSchema = new Schema2(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, default: "" },
    ratings: { type: Number, default: 4.5 },
    numOfReviews: { type: Number, default: 0 },
    images: [{ public_id: String, url: String }],
    category: { type: String, required: true },
    stock: { type: Number, default: 20 },
    isVeg: { type: Boolean, default: false },
    calories: { type: Number, default: 450 },
    prepTime: { type: String, default: "15-20 min" },
    restaurant: { type: String, required: true },
    restaurantName: { type: String, required: true }
  },
  { _id: false }
);
var MenuCategorySchema = new Schema2(
  {
    category: { type: String, required: true },
    items: [FoodItemSchema]
  },
  { _id: false }
);
var MenuSchema = new Schema2(
  {
    _id: { type: String, required: true },
    restaurant: { type: String, required: true, index: true },
    menu: [MenuCategorySchema]
  },
  {
    timestamps: true,
    _id: false
  }
);
var Menu = mongoose2.models.Menu || mongoose2.model("Menu", MenuSchema);

// server/models/Order.ts
import mongoose3, { Schema as Schema3 } from "mongoose";
var OrderItemSchema = new Schema3(
  {
    fooditem: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    image: { type: String, default: "" },
    isVeg: { type: Boolean, default: false }
  },
  { _id: false }
);
var OrderSchema = new Schema3(
  {
    _id: { type: String, required: true },
    user: {
      _id: String,
      name: String,
      email: String,
      phoneNumber: String,
      avatar: { public_id: String, url: String }
    },
    restaurant: {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      address: { type: String, required: true },
      image: { type: String, default: "" }
    },
    orderItems: [OrderItemSchema],
    deliveryInfo: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      phoneNo: { type: String, required: true },
      country: { type: String, default: "United States" }
    },
    itemsPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    deliveryCharge: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponApplied: { type: String },
    finalTotal: { type: Number, required: true },
    paymentInfo: {
      id: { type: String, required: true },
      status: { type: String, default: "Paid" },
      method: { type: String, default: "Stripe Online Checkout" }
    },
    orderStatus: {
      type: String,
      enum: ["Order Confirmed", "Preparing in Kitchen", "Delivered"],
      default: "Order Confirmed"
    }
  },
  {
    timestamps: true,
    _id: false
  }
);
var Order = mongoose3.models.Order || mongoose3.model("Order", OrderSchema);

// server/models/User.ts
import mongoose4, { Schema as Schema4 } from "mongoose";
var UserSchema = new Schema4(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, default: "" },
    avatar: {
      public_id: { type: String, default: "avatar_default" },
      url: { type: String, default: "" }
    },
    role: { type: String, default: "user" },
    defaultAddress: {
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      postalCode: { type: String, default: "" },
      phoneNo: { type: String, default: "" },
      country: { type: String, default: "United States" }
    }
  },
  {
    timestamps: true,
    _id: false
  }
);
var User = mongoose4.models.User || mongoose4.model("User", UserSchema);

// server/models/Coupon.ts
import mongoose5, { Schema as Schema5 } from "mongoose";
var CouponSchema = new Schema5(
  {
    _id: { type: String, required: true },
    code: { type: String, required: true, uppercase: true, unique: true },
    description: { type: String, default: "" },
    discountType: { type: String, enum: ["PERCENTAGE", "FLAT"], required: true },
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true },
    expiryDate: { type: String, required: true }
  },
  {
    timestamps: true,
    _id: false
  }
);
var Coupon = mongoose5.models.Coupon || mongoose5.model("Coupon", CouponSchema);

// server/db.ts
var isConnected = false;
var connectionError = null;
var databaseName = null;
var connectionHost = null;
async function connectMongoDB() {
  let uri = (process.env.MONGODB_URI || process.env.MONGO_URI || "").trim();
  if (uri.startsWith('"') && uri.endsWith('"') || uri.startsWith("'") && uri.endsWith("'")) {
    uri = uri.slice(1, -1).trim();
  }
  if (!uri || uri.includes("<username>") || uri.includes("<password>")) {
    const msg = "MONGODB_URI contains unconfigured placeholder credentials (<username>/<password>). Operating in high-performance in-memory store mode until real MongoDB Atlas credentials are provided in .env.";
    console.log(`[Database] \u2139\uFE0F ${msg}`);
    return { connected: false, message: msg };
  }
  if (mongoose6.connection.readyState === 1) {
    isConnected = true;
    return {
      connected: true,
      message: `Already connected to MongoDB: ${databaseName || "cluster"}`
    };
  }
  try {
    console.log("[Database] \u{1F50C} Connecting to MongoDB Atlas / cluster...");
    const conn = await mongoose6.connect(uri, {
      serverSelectionTimeoutMS: 5e3,
      connectTimeoutMS: 5e3
    });
    isConnected = true;
    connectionError = null;
    databaseName = conn.connection.name || "foodgenie";
    connectionHost = conn.connection.host || "remote-cluster";
    console.log(
      `[Database] \u2705 Connected to MongoDB successfully! Database: "${databaseName}" on host: "${connectionHost}"`
    );
    await seedMongoIfEmpty();
    return {
      connected: true,
      message: `Successfully connected to MongoDB (${databaseName})`
    };
  } catch (err) {
    isConnected = false;
    connectionError = err.message || "Failed to connect to MongoDB";
    console.warn(
      `[Database] \u26A0\uFE0F MongoDB connection attempt failed: ${connectionError}. Falling back to in-memory store so app remains 100% operational.`
    );
    return {
      connected: false,
      message: connectionError || "Failed to connect to MongoDB"
    };
  }
}
async function seedMongoIfEmpty() {
  if (!isConnected || mongoose6.connection.readyState !== 1) return;
  try {
    const restaurantCount = await Restaurant.countDocuments();
    if (restaurantCount === 0) {
      console.log("[Database] \u{1F680} Seeding initial restaurants to MongoDB...");
      await Restaurant.insertMany(initialRestaurants);
    }
    const menuCount = await Menu.countDocuments();
    if (menuCount === 0) {
      console.log("[Database] \u{1F680} Seeding initial menus to MongoDB...");
      await Menu.insertMany(initialMenus);
    }
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      console.log("[Database] \u{1F680} Seeding initial coupons to MongoDB...");
      await Coupon.insertMany(initialCoupons);
    }
    console.log("[Database] \u2728 Seeding verified and synchronized.");
  } catch (err) {
    console.error("[Database] Seeding error:", err.message);
  }
}
async function getDatabaseStatus(fallbackCounts) {
  const isMongoReady = mongoose6.connection.readyState === 1;
  const uriConfigured = !!(process.env.MONGODB_URI || process.env.MONGO_URI);
  let counts = { ...fallbackCounts };
  if (isMongoReady) {
    try {
      const [restCount, menuCount, orderCount, userCount, couponCount] = await Promise.all([
        Restaurant.countDocuments(),
        Menu.countDocuments(),
        Order.countDocuments(),
        User.countDocuments(),
        Coupon.countDocuments()
      ]);
      counts = {
        restaurants: restCount,
        menus: menuCount,
        orders: orderCount,
        users: userCount,
        coupons: couponCount
      };
    } catch {
    }
  }
  return {
    engine: isMongoReady ? "MongoDB" : "In-Memory (Seeded Store)",
    connected: isMongoReady,
    uriConfigured,
    databaseName: isMongoReady ? databaseName : "in-memory-foodgenie",
    host: isMongoReady ? connectionHost : "localhost/memory",
    connectionError,
    counts,
    features: [
      "Automatic Collection Seeding",
      "Real-Time Order Tracking",
      "Full Schema Validation",
      "Failover Resilience"
    ]
  };
}

// server/security.ts
var HTML_TAG_REGEX = /<[^>]+>|<\s*[a-z/][^>]*>|[<>]/i;
function containsHtml(value) {
  if (value === null || value === void 0) return false;
  return HTML_TAG_REGEX.test(String(value));
}
function sanitizeString(value, maxLength = 1e3) {
  if (value === null || value === void 0) return "";
  let str = String(value).trim();
  str = str.replace(/\0/g, "");
  if (str.length > maxLength) {
    str = str.slice(0, maxLength);
  }
  str = str.replace(/<[^>]*>/g, "");
  str = str.replace(/[<>]/g, "");
  str = str.replace(/--+/g, "-").replace(/\/\*[\s\S]*?\*\//g, "");
  return str.trim();
}
function sanitizePayload(input) {
  if (input === null || input === void 0) {
    return input;
  }
  if (Array.isArray(input)) {
    return input.map((item) => sanitizePayload(item));
  }
  if (typeof input === "object") {
    const cleanObj = {};
    for (const [key, val] of Object.entries(input)) {
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        console.warn(`[Security Alert] Blocked prototype pollution attempt: "${key}"`);
        continue;
      }
      if (key.startsWith("$") || key.includes(".")) {
        console.warn(`[Security Alert] Blocked suspicious NoSQL operator key: "${key}"`);
        continue;
      }
      cleanObj[key] = sanitizePayload(val);
    }
    return cleanObj;
  }
  if (typeof input === "string") {
    return sanitizeString(input, 2e3);
  }
  return input;
}
function payloadContainsHtml(input) {
  if (input === null || input === void 0) return false;
  if (typeof input === "string") return containsHtml(input);
  if (Array.isArray(input)) return input.some(payloadContainsHtml);
  if (typeof input === "object") {
    return Object.values(input).some(payloadContainsHtml);
  }
  return false;
}
function securitySanitizerMiddleware(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    if (req.body && typeof req.body === "object") {
      const hasHtml = payloadContainsHtml(req.body);
      if (hasHtml) {
        return res.status(400).json({
          status: "fail",
          message: "Prohibited input: HTML tags (e.g., <h1>, <script>) and angle brackets (< >) are not permitted."
        });
      }
    }
  }
  if (req.query && typeof req.query === "object") {
    req.query = sanitizePayload(req.query);
  }
  if (req.params && typeof req.params === "object") {
    req.params = sanitizePayload(req.params);
  }
  if (req.body && typeof req.body === "object") {
    req.body = sanitizePayload(req.body);
  }
  next();
}

// server/stripeService.ts
import Stripe from "stripe";
var stripeClient = null;
function getStripeInstance() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: "2025-02-24.acacia"
    });
  }
  return stripeClient;
}
async function createStripePaymentIntent(amountInDollars, currency = "usd", metadata = {}) {
  const stripe = getStripeInstance();
  const amountInCents = Math.round(Math.max(1, amountInDollars) * 100);
  if (stripe) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency,
        metadata: {
          app: "FoodGenie",
          ...metadata
        },
        automatic_payment_methods: {
          enabled: true
        }
      });
      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        mode: "live_stripe",
        amount: amountInDollars
      };
    } catch (err) {
      console.warn("[Stripe] PaymentIntent creation error:", err.message);
    }
  }
  const mockIntentId = `pi_${Date.now()}_test_${Math.floor(1e3 + Math.random() * 9e3)}`;
  const mockClientSecret = `${mockIntentId}_secret_${Math.floor(1e4 + Math.random() * 9e4)}`;
  return {
    success: true,
    clientSecret: mockClientSecret,
    paymentIntentId: mockIntentId,
    mode: "test_stripe",
    amount: amountInDollars,
    note: process.env.STRIPE_SECRET_KEY ? "Stripe test mode" : "Using Stripe test sandbox. Set STRIPE_SECRET_KEY in your .env or Vercel for production charges."
  };
}

// server.ts
import mongoose7 from "mongoose";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(securitySanitizerMiddleware);
var restaurants = structuredClone(initialRestaurants);
var menus = structuredClone(initialMenus);
var coupons = structuredClone(initialCoupons);
var users = [];
var activeUser = null;
var currentCart = {
  user: "",
  restaurant: null,
  items: []
};
var orders = [];
function getAllFoodItemsFlat() {
  const list = [];
  for (const m of menus) {
    for (const cat of m.menu) {
      for (const item of cat.items) {
        list.push(item);
      }
    }
  }
  return list;
}
app.get("/api/v1/eats/stores/count", (_req, res) => {
  const count = restaurants.length;
  const pureVegCount = restaurants.filter((r) => r.isVeg).length;
  res.json({
    status: "success",
    count,
    pureVegCount
  });
});
app.get("/api/v1/eats/stores", (req, res) => {
  const { keyword, isVeg, sortByRatings, sortByReviews, cuisine } = req.query;
  let result = [...restaurants];
  if (keyword && typeof keyword === "string" && keyword.trim() !== "") {
    const q = keyword.toLowerCase().trim();
    const matchingRestIdsFromDishes = new Set(
      getAllFoodItemsFlat().filter(
        (item) => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
      ).map((item) => item.restaurant)
    );
    result = result.filter(
      (r) => r.name.toLowerCase().includes(q) || r.address.toLowerCase().includes(q) || r.cuisine.some((c) => c.toLowerCase().includes(q)) || matchingRestIdsFromDishes.has(r._id)
    );
  }
  if (isVeg === "true") {
    result = result.filter((r) => r.isVeg);
  }
  if (cuisine && typeof cuisine === "string" && cuisine !== "All") {
    result = result.filter(
      (r) => r.cuisine.some((c) => c.toLowerCase().includes(cuisine.toLowerCase()))
    );
  }
  if (sortByRatings === "true") {
    result.sort((a, b) => b.ratings - a.ratings);
  } else if (sortByReviews === "true") {
    result.sort((a, b) => b.numOfReviews - a.numOfReviews);
  }
  res.json({
    status: "success",
    count: result.length,
    restaurants: result
  });
});
app.get("/api/v1/eats/stores/:storeId", (req, res) => {
  const restaurant = restaurants.find((r) => r._id === req.params.storeId);
  if (!restaurant) {
    return res.status(404).json({ status: "fail", message: "Restaurant not found" });
  }
  res.json({ status: "success", data: { restaurant } });
});
app.get("/api/v1/eats/stores/:storeId/menus", (req, res) => {
  const { storeId } = req.params;
  const restaurant = restaurants.find((r) => r._id === storeId);
  const storeMenu = menus.find((m) => m.restaurant === storeId);
  if (!restaurant || !storeMenu) {
    return res.status(404).json({ status: "fail", message: "Menu not found for this store" });
  }
  res.json({
    status: "success",
    count: storeMenu.menu.length,
    data: {
      restaurant,
      menus: [storeMenu]
    }
  });
});
app.post("/api/v1/eats/stores/:storeId/reviews", (req, res) => {
  const { storeId } = req.params;
  const { rating, comment, dishMentioned, userName } = req.body;
  const restaurant = restaurants.find((r) => r._id === storeId);
  if (!restaurant) {
    return res.status(404).json({ status: "fail", message: "Restaurant not found" });
  }
  const newReview = {
    _id: `rev-${Date.now()}`,
    userName: userName || activeUser?.name || "Verified Diner",
    rating: Number(rating) || 5,
    comment: comment || "Great food and timely delivery!",
    createdAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    dishMentioned: dishMentioned || void 0
  };
  restaurant.reviews.unshift(newReview);
  restaurant.numOfReviews += 1;
  const avg = restaurant.reviews.reduce((acc, r) => acc + r.rating, 0) / restaurant.reviews.length;
  restaurant.ratings = Number(avg.toFixed(1));
  res.status(201).json({
    status: "success",
    review: newReview,
    restaurant
  });
});
app.get("/api/v1/eats/item", (_req, res) => {
  const items = getAllFoodItemsFlat();
  res.json({ status: "success", count: items.length, items });
});
app.get("/api/v1/eats/cart/get-cart", (_req, res) => {
  res.json({
    status: "success",
    data: currentCart
  });
});
app.post("/api/v1/eats/cart/add-to-cart", (req, res) => {
  const { foodItemId, restaurant: restaurantId, quantity = 1 } = req.body;
  const allItems = getAllFoodItemsFlat();
  const targetItem = allItems.find((i) => i._id === foodItemId);
  if (!targetItem) {
    return res.status(404).json({ status: "fail", message: "Food item not found" });
  }
  const targetRestaurant = restaurants.find((r) => r._id === (restaurantId || targetItem.restaurant)) || null;
  if (currentCart.restaurant && targetRestaurant && currentCart.restaurant._id !== targetRestaurant._id) {
    currentCart.restaurant = targetRestaurant;
    currentCart.items = [{ fooditem: targetItem, quantity: Number(quantity) }];
  } else {
    currentCart.restaurant = targetRestaurant;
    const existing = currentCart.items.find((entry) => entry.fooditem._id === foodItemId);
    if (existing) {
      existing.quantity = Number(quantity);
    } else {
      currentCart.items.push({ fooditem: targetItem, quantity: Number(quantity) });
    }
  }
  res.json({
    status: "success",
    data: currentCart
  });
});
app.post("/api/v1/eats/cart/update-cart-item", (req, res) => {
  const { foodItemId, quantity } = req.body;
  const qty = Number(quantity);
  if (qty <= 0) {
    currentCart.items = currentCart.items.filter((i) => i.fooditem._id !== foodItemId);
  } else {
    const existing = currentCart.items.find((i) => i.fooditem._id === foodItemId);
    if (existing) {
      existing.quantity = qty;
    }
  }
  if (currentCart.items.length === 0) {
    currentCart.restaurant = null;
  }
  res.json({
    status: "success",
    data: currentCart
  });
});
app.delete("/api/v1/eats/cart/delete-cart-item", (req, res) => {
  const foodItemId = req.body?.foodItemId || req.query?.foodItemId;
  currentCart.items = currentCart.items.filter((i) => i.fooditem._id !== foodItemId);
  if (currentCart.items.length === 0) {
    currentCart.restaurant = null;
  }
  res.json({
    status: "success",
    data: currentCart
  });
});
app.delete("/api/v1/eats/cart/clear-cart", (_req, res) => {
  currentCart.items = [];
  currentCart.restaurant = null;
  res.json({
    status: "success",
    data: currentCart
  });
});
app.get("/api/v1/coupons", (_req, res) => {
  res.json({
    status: "success",
    coupons: coupons.filter((c) => c.isActive)
  });
});
app.post("/api/v1/coupons/validate", (req, res) => {
  const { code, orderAmount } = req.body;
  if (!code) {
    return res.status(400).json({ valid: false, message: "Please enter a coupon code." });
  }
  const normalized = String(code).trim().toUpperCase();
  const coupon = coupons.find((c) => c.code === normalized && c.isActive);
  if (!coupon) {
    return res.status(404).json({
      valid: false,
      message: `Coupon "${normalized}" is not valid or has expired.`
    });
  }
  const subtotal = Number(orderAmount) || 0;
  if (subtotal < coupon.minOrderAmount) {
    return res.status(400).json({
      valid: false,
      message: `Minimum item subtotal of $${coupon.minOrderAmount} required for ${coupon.code}.`
    });
  }
  let discountAmount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    discountAmount = Math.min(
      Number((subtotal * coupon.discountValue / 100).toFixed(2)),
      coupon.maxDiscount
    );
  } else {
    discountAmount = Math.min(coupon.discountValue, subtotal);
  }
  res.json({
    valid: true,
    coupon,
    discountAmount,
    message: `${coupon.code} applied! You saved $${discountAmount.toFixed(2)}.`
  });
});
app.get("/api/v1/db/status", async (_req, res) => {
  const status = await getDatabaseStatus({
    restaurants: restaurants.length,
    menus: menus.length,
    orders: orders.length,
    users: users.length,
    coupons: coupons.length
  });
  res.json({
    status: "success",
    database: status
  });
});
app.post("/api/v1/db/connect", async (req, res) => {
  const { uri } = req.body;
  if (uri && typeof uri === "string") {
    process.env.MONGODB_URI = uri.trim();
  }
  const result = await connectMongoDB();
  const status = await getDatabaseStatus({
    restaurants: restaurants.length,
    menus: menus.length,
    orders: orders.length,
    users: users.length,
    coupons: coupons.length
  });
  res.json({
    status: result.connected ? "success" : "warn",
    message: result.message,
    database: status
  });
});
app.get("/api/v1/users/me", (req, res) => {
  const sessionEmail = req.headers["x-user-email"] || req.query.email;
  if (!activeUser && sessionEmail) {
    const found = users.find((u) => u.email.toLowerCase() === sessionEmail.toLowerCase());
    if (found) {
      activeUser = found;
    }
  }
  if (!activeUser) {
    return res.status(401).json({ status: "fail", message: "Not logged in" });
  }
  res.json({
    status: "success",
    user: activeUser
  });
});
app.post("/api/v1/users/login", (req, res) => {
  const { email } = req.body;
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!cleanEmail) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }
  let user = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    const rawName = cleanEmail.split("@")[0].replace(/[._]/g, " ") || "Foodie Member";
    const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    user = {
      _id: `user-${Date.now()}`,
      name: formattedName,
      email: cleanEmail,
      phoneNumber: "",
      avatar: {
        public_id: "avatar_user",
        url: GENERATED_IMAGES.avatar
      },
      role: "user",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      defaultAddress: {
        address: "",
        city: "",
        postalCode: "",
        phoneNo: "",
        country: ""
      }
    };
    users.push(user);
  }
  activeUser = user;
  currentCart.user = user._id;
  res.json({
    status: "success",
    token: `jwt-${Date.now()}-auth`,
    user: activeUser
  });
});
app.post("/api/v1/users/signup", (req, res) => {
  const { name, email, phoneNumber } = req.body;
  const cleanEmail = String(email || "").trim().toLowerCase();
  let existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    activeUser = existing;
    currentCart.user = existing._id;
    return res.json({
      status: "success",
      token: `jwt-${Date.now()}-auth`,
      user: existing
    });
  }
  const rawName = name?.trim() || cleanEmail.split("@")[0].replace(/[._]/g, " ") || "New Food Lover";
  const newUser = {
    _id: `user-${Date.now()}`,
    name: rawName,
    email: cleanEmail,
    phoneNumber: phoneNumber?.trim() || "",
    avatar: {
      public_id: "avatar_new",
      url: GENERATED_IMAGES.avatar
    },
    role: "user",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    defaultAddress: {
      address: "",
      city: "",
      postalCode: "",
      phoneNo: phoneNumber?.trim() || "",
      country: ""
    }
  };
  users.push(newUser);
  activeUser = newUser;
  currentCart.user = newUser._id;
  currentCart.items = [];
  currentCart.restaurant = null;
  if (mongoose7.connection.readyState === 1) {
    User.create(newUser).catch(
      (e) => console.warn("[Database] User signup save warning:", e.message)
    );
  }
  res.status(201).json({
    status: "success",
    token: "jwt-demo-token-orderit",
    user: activeUser
  });
});
app.get("/api/v1/users/logout", (_req, res) => {
  activeUser = null;
  currentCart.items = [];
  currentCart.restaurant = null;
  res.json({
    status: "success",
    message: "Logged out successfully"
  });
});
app.put("/api/v1/users/me/update", async (req, res) => {
  const sessionEmail = req.headers["x-user-email"] || req.body.email || req.query.email;
  let targetUser = activeUser;
  if (sessionEmail) {
    const found = users.find(
      (u) => u.email.toLowerCase() === sessionEmail.toLowerCase()
    );
    if (found) {
      targetUser = found;
      activeUser = found;
    }
  }
  if (!targetUser) {
    if (users.length > 0) {
      targetUser = users[0];
      activeUser = users[0];
    } else {
      const cleanEmail = sessionEmail || "diner@foodgenie.com";
      targetUser = {
        _id: `user-${Date.now()}`,
        name: cleanEmail.split("@")[0],
        email: cleanEmail,
        phoneNumber: "",
        avatar: { public_id: "avatar_custom", url: GENERATED_IMAGES.avatar },
        role: "user",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        defaultAddress: {
          address: "",
          city: "",
          postalCode: "",
          phoneNo: "",
          country: "United States"
        }
      };
      users.push(targetUser);
      activeUser = targetUser;
    }
  }
  const { name, email, phoneNumber, address, city, postalCode, avatar } = req.body;
  if (name) targetUser.name = name;
  if (email) targetUser.email = email;
  if (phoneNumber) targetUser.phoneNumber = phoneNumber;
  if (!targetUser.defaultAddress) {
    targetUser.defaultAddress = {
      address: "",
      city: "",
      postalCode: "",
      phoneNo: "",
      country: "United States"
    };
  }
  if (address !== void 0) targetUser.defaultAddress.address = address;
  if (city !== void 0) targetUser.defaultAddress.city = city;
  if (postalCode !== void 0) targetUser.defaultAddress.postalCode = postalCode;
  if (avatar) {
    if (typeof avatar === "string") {
      targetUser.avatar = { public_id: "avatar_custom", url: avatar };
    } else if (avatar && avatar.url) {
      targetUser.avatar = {
        public_id: avatar.public_id || "avatar_custom",
        url: avatar.url
      };
    }
  }
  if (mongoose7.connection.readyState === 1) {
    try {
      await User.findByIdAndUpdate(targetUser._id, targetUser, { upsert: true });
    } catch (e) {
      console.warn("[Database] User sync warning:", e.message);
    }
  }
  res.json({
    status: "success",
    user: targetUser
  });
});
app.post("/api/v1/payment/stripe-intent", async (req, res) => {
  try {
    const { amount, currency = "usd", orderId } = req.body;
    const amountVal = Number(amount) || 20;
    const result = await createStripePaymentIntent(amountVal, currency, { orderId });
    res.json(result);
  } catch (error) {
    console.error("Stripe Payment Intent Error:", error);
    res.status(500).json({ success: false, message: error?.message || "Payment processing error" });
  }
});
app.post("/api/v1/payment/process", async (req, res) => {
  try {
    const { amount, paymentMethodId } = req.body;
    const amountVal = Number(amount) || 20;
    const intent = await createStripePaymentIntent(amountVal, "usd", { paymentMethodId });
    res.json({
      success: true,
      client_secret: intent.clientSecret,
      paymentIntentId: intent.paymentIntentId,
      mode: intent.mode,
      amount: amountVal
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error?.message || "Payment error" });
  }
});
app.post("/api/v1/eats/orders/new", async (req, res) => {
  const {
    deliveryInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    deliveryCharge,
    discountAmount = 0,
    couponApplied,
    finalTotal,
    restaurant
  } = req.body;
  const targetRest = restaurants.find((r) => r._id === restaurant) || currentCart.restaurant || restaurants[0];
  const orderId = `ORD-${Math.floor(1e4 + Math.random() * 9e4)}`;
  const currentUserRecord = activeUser || (users.length > 0 ? users[0] : {
    _id: `user-${Date.now()}`,
    name: "FoodGenie Diner",
    email: "diner@foodgenie.com",
    phoneNumber: "",
    avatar: { public_id: "avatar_default", url: GENERATED_IMAGES.avatar },
    role: "user",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    defaultAddress: {
      address: deliveryInfo?.address || "",
      city: deliveryInfo?.city || "",
      postalCode: deliveryInfo?.postalCode || "",
      phoneNo: deliveryInfo?.phoneNo || "",
      country: "United States"
    }
  });
  const newOrder = {
    _id: orderId,
    user: currentUserRecord,
    restaurant: {
      _id: targetRest._id,
      name: targetRest.name,
      address: targetRest.address,
      image: targetRest.images[0]?.url || GENERATED_IMAGES.feast
    },
    orderItems: orderItems && orderItems.length > 0 ? orderItems : currentCart.items.map((entry) => ({
      fooditem: entry.fooditem._id,
      name: entry.fooditem.name,
      price: entry.fooditem.price,
      quantity: entry.quantity,
      image: entry.fooditem.images[0]?.url || GENERATED_IMAGES.feast,
      isVeg: entry.fooditem.isVeg
    })),
    deliveryInfo: deliveryInfo || currentUserRecord.defaultAddress,
    itemsPrice: Number(itemsPrice) || 0,
    taxPrice: Number(taxPrice) || 0,
    deliveryCharge: Number(deliveryCharge) || 0,
    discountAmount: Number(discountAmount) || 0,
    couponApplied: couponApplied || void 0,
    finalTotal: Number(finalTotal) || 0,
    paymentInfo: paymentInfo || {
      id: `pi_stripe_${Date.now()}`,
      status: "Paid",
      method: "Stripe Online Checkout"
    },
    orderStatus: "Order Confirmed",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  orders.unshift(newOrder);
  currentCart.items = [];
  currentCart.restaurant = null;
  if (mongoose7.connection.readyState === 1) {
    try {
      await Order.create(newOrder);
    } catch (e) {
      console.warn("[Database] MongoDB order persist warning:", e.message);
    }
  }
  res.status(201).json({
    status: "success",
    order: newOrder
  });
});
app.get("/api/v1/eats/orders/me/myOrders", (req, res) => {
  const userEmail = req.headers["x-user-email"] || activeUser?.email;
  const userOrders = activeUser ? orders.filter(
    (o) => o.user?._id === activeUser?._id || userEmail && o.user?.email === userEmail
  ) : [];
  res.json({
    status: "success",
    count: userOrders.length,
    orders: userOrders
  });
});
app.get("/api/v1/eats/orders/:id", async (req, res) => {
  let order = orders.find((o) => o._id === req.params.id);
  if (!order && mongoose7.connection.readyState === 1) {
    try {
      const dbOrder = await Order.findOne({ _id: req.params.id }).lean();
      if (dbOrder) order = dbOrder;
    } catch {
    }
  }
  if (!order) {
    return res.status(404).json({ status: "fail", message: "Order not found" });
  }
  res.json({
    status: "success",
    order
  });
});
app.post("/api/v1/ai/recommend", async (req, res) => {
  try {
    const { prompt, dietaryPreference = "ALL" } = req.body;
    const allItems = getAllFoodItemsFlat();
    const result = await generateDishRecommendations(
      prompt || "Recommend something comforting and flavorful for dinner tonight",
      dietaryPreference,
      allItems
    );
    const enriched = (result.recommendations || []).map((rec) => {
      const matched = allItems.find((i) => i._id === rec.itemId) || allItems.find((i) => i.name.toLowerCase() === String(rec.name || "").toLowerCase()) || allItems[0];
      return {
        ...rec,
        foodItem: matched
      };
    });
    res.json({
      status: "success",
      conciergeNote: result.conciergeNote,
      recommendations: enriched
    });
  } catch (error) {
    console.error("Gemini AI Recommendation Error:", error);
    res.status(500).json({
      status: "error",
      message: error?.message || "Failed to generate AI culinary recommendations."
    });
  }
});
app.post("/api/v1/ai/analyze-reviews", async (req, res) => {
  try {
    const { restaurantId } = req.body;
    const restaurant = restaurants.find((r) => r._id === restaurantId) || restaurants[0];
    const analysis = await analyzeRestaurantReviews(restaurant);
    res.json({
      status: "success",
      restaurantName: restaurant.name,
      analysis
    });
  } catch (error) {
    console.error("Gemini AI Review Analyzer Error:", error);
    res.status(500).json({
      status: "error",
      message: error?.message || "Failed to analyze restaurant reviews with Gemini AI."
    });
  }
});
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";
  connectMongoDB().catch((err) => {
    console.log("[Database] MongoDB background initialization:", err.message);
  });
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  const PORT = 3e3;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FoodGenie Full-Stack Server listening on http://0.0.0.0:${PORT}`);
  });
}
if (!process.env.VERCEL) {
  startServer();
} else {
  connectMongoDB().catch(() => {
  });
}
var server_default = app;
export {
  server_default as default
};
