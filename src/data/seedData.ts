export const GENERATED_IMAGES = {
  feast: '/src/assets/images/hero_gourmet_feast_1791706198554.jpg',
  bistro: '/src/assets/images/restaurant_bistro_interior_1791706212212.jpg',
  burger: '/src/assets/images/dish_truffle_burger_1791706224500.jpg',
  pizza: '/src/assets/images/dish_artisan_pizza_1791706236798.jpg',
  grainBowl: '/src/assets/images/dish_avocado_grain_bowl_1791709345120.jpg',
  pasta: '/src/assets/images/dish_creamy_pasta_plate_1791709355168.jpg',
  indianCurry: '/src/assets/images/dish_indian_paneer_curry_1791709367245.jpg',
  friesAndBread: '/src/assets/images/dish_crispy_fries_bread_1791709379552.jpg',
  avatar: '/src/assets/images/avatar_diner_portrait_1791709391779.jpg',
};

export interface FoodItemData {
  _id: string;
  name: string;
  price: number;
  description: string;
  ratings: number;
  numOfReviews: number;
  images: { public_id: string; url: string }[];
  category: string;
  stock: number;
  isVeg: boolean;
  calories: number;
  prepTime: string;
  restaurant: string;
  restaurantName: string;
}

export interface MenuCategory {
  category: string;
  items: FoodItemData[];
}

export interface RestaurantMenu {
  _id: string;
  restaurant: string;
  menu: MenuCategory[];
}

export interface ReviewItem {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  dishMentioned?: string;
}

export interface RestaurantData {
  _id: string;
  name: string;
  isVeg: boolean;
  address: string;
  ratings: number;
  numOfReviews: number;
  deliveryTime: string;
  priceForTwo: number;
  cuisine: string[];
  images: { public_id: string; url: string }[];
  reviews: ReviewItem[];
}

export interface CouponData {
  _id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number;
  isActive: boolean;
  expiryDate: string;
}

export const initialRestaurants: RestaurantData[] = [
  {
    _id: 'rest-1',
    name: 'The Wood-Fired Oven',
    isVeg: true,
    address: '42 Baker Street, Downtown · Wood-Fired Pizza Kitchen',
    ratings: 4.9,
    numOfReviews: 342,
    deliveryTime: '25–30 min',
    priceForTwo: 38,
    cuisine: ['Wood-Fired Pizza', 'Italian', 'Fresh Salads'],
    images: [{ public_id: 'forno_1', url: GENERATED_IMAGES.pizza }],
    reviews: [
      {
        _id: 'rev-101',
        userName: 'Aaron Miller',
        rating: 5,
        comment: 'The sourdough crust on the Classic Margherita Pizza has an amazing crispness and airy edge. Easily the best wood-fired pizza in town.',
        createdAt: '2026-09-28',
        dishMentioned: 'Classic Margherita Pizza',
      },
      {
        _id: 'rev-102',
        userName: 'Elena Ross',
        rating: 5,
        comment: 'The Fresh Mozzarella & Heirloom Tomato Salad arrived chilled separately from the warm rosemary garlic bread. Thoughtful packaging and fresh ingredients.',
        createdAt: '2026-10-02',
        dishMentioned: 'Fresh Mozzarella & Tomato Salad',
      },
      {
        _id: 'rev-103',
        userName: 'Kevin Brooks',
        rating: 4.5,
        comment: 'The Truffle & Wild Mushroom White Pizza is rich and flavorful. Would love slightly more chili oil on the side, but the flavor balance is spot-on.',
        createdAt: '2026-10-07',
        dishMentioned: 'Truffle & Wild Mushroom Pizza',
      },
    ],
  },
  {
    _id: 'rest-2',
    name: 'Craft Burger Kitchen',
    isVeg: false,
    address: '18 Mercer Avenue, Midtown · Gourmet Burgers & Fries',
    ratings: 4.8,
    numOfReviews: 518,
    deliveryTime: '20–25 min',
    priceForTwo: 34,
    cuisine: ['Smash Burgers', 'Seasoned Fries', 'Milkshakes'],
    images: [{ public_id: 'atelier_1', url: GENERATED_IMAGES.burger }],
    reviews: [
      {
        _id: 'rev-201',
        userName: 'Ryan Cooper',
        rating: 5,
        comment: 'The Double Beef Truffle Burger with melted aged cheddar and truffle mayo is unbeatable. The toasted brioche bun holds up great.',
        createdAt: '2026-10-01',
        dishMentioned: 'Double Beef Truffle Burger',
      },
      {
        _id: 'rev-202',
        userName: 'Maya Lin',
        rating: 4.8,
        comment: 'The Crispy Rosemary Parmesan Fries were still hot and crunchy on arrival! The smoky chipotle glaze on the grilled cheese burger is also fantastic.',
        createdAt: '2026-10-05',
        dishMentioned: 'Crispy Rosemary Parmesan Fries',
      },
      {
        _id: 'rev-203',
        userName: 'Sam Rivera',
        rating: 4.5,
        comment: 'Generous portions and great seasoning. Delivery took only 24 minutes during the dinner rush.',
        createdAt: '2026-10-08',
        dishMentioned: 'Double Beef Truffle Burger',
      },
    ],
  },
  {
    _id: 'rest-3',
    name: 'The Open Hearth Grill',
    isVeg: false,
    address: '7 Copper Row, West End · Flame-Grilled Steaks & Pasta',
    ratings: 4.7,
    numOfReviews: 289,
    deliveryTime: '30–35 min',
    priceForTwo: 46,
    cuisine: ['Flame Grill', 'Steaks & Skewers', 'Fresh Pasta'],
    images: [{ public_id: 'braise_1', url: GENERATED_IMAGES.bistro }],
    reviews: [
      {
        _id: 'rev-301',
        userName: 'Claire Dawson',
        rating: 5,
        comment: 'The Flame-Grilled Herb Chicken Skewers and fresh pasta taste straight from an open kitchen. Rich smoky flavor in every bite.',
        createdAt: '2026-09-30',
        dishMentioned: 'Flame-Grilled Herb Chicken Skewers',
      },
      {
        _id: 'rev-302',
        userName: 'Victor Nelson',
        rating: 4.5,
        comment: 'The grilled steak medallions and roasted baby potatoes had wonderful texture. Restaurant-quality meal at home.',
        createdAt: '2026-10-04',
        dishMentioned: 'Pan-Seared Steak & Baby Potatoes',
      },
    ],
  },
  {
    _id: 'rest-4',
    name: 'Green Harvest Kitchen',
    isVeg: true,
    address: '104 Garden Courtyard, Uptown · Healthy Bowls & Bakery',
    ratings: 4.9,
    numOfReviews: 412,
    deliveryTime: '20–25 min',
    priceForTwo: 28,
    cuisine: ['Healthy Grain Bowls', 'Sourdough Bakery', 'Plant-Based'],
    images: [{ public_id: 'verdure_1', url: GENERATED_IMAGES.grainBowl }],
    reviews: [
      {
        _id: 'rev-401',
        userName: 'Hannah Scott',
        rating: 5,
        comment: 'A 100% vegetarian kitchen that makes healthy food taste incredible. The Warm Grain & Avocado Harvest Bowl is my daily favorite.',
        createdAt: '2026-10-03',
        dishMentioned: 'Warm Grain & Avocado Harvest Bowl',
      },
      {
        _id: 'rev-402',
        userName: 'Daniel Park',
        rating: 4.9,
        comment: 'The Freshly Baked Sourdough Bread with herb butter and olive oil is pure comfort.',
        createdAt: '2026-10-09',
        dishMentioned: 'Freshly Baked Country Sourdough',
      },
    ],
  },
  {
    _id: 'rest-5',
    name: 'Saffron & Spice Grill',
    isVeg: false,
    address: '29 Heritage Arcade, Eastside · Charcoal Skewers & Curries',
    ratings: 4.6,
    numOfReviews: 624,
    deliveryTime: '25–30 min',
    priceForTwo: 32,
    cuisine: ['Charcoal Skewers', 'Slow-Cooked Curries', 'Garlic Flatbreads'],
    images: [{ public_id: 'saffron_1', url: GENERATED_IMAGES.indianCurry }],
    reviews: [
      {
        _id: 'rev-501',
        userName: 'Zoe Carter',
        rating: 4.8,
        comment: 'The Charcoal-Grilled Cottage Cheese Skewers have an authentic smoky flavor, and the garlic butter flatbread is super soft and flaky.',
        createdAt: '2026-10-06',
        dishMentioned: 'Charcoal-Grilled Cottage Cheese Skewers',
      },
      {
        _id: 'rev-502',
        userName: 'Nathan Vance',
        rating: 4.5,
        comment: 'The Slow-Simmered Creamy Black Lentils are rich, velvety, and comforting. Great spice level.',
        createdAt: '2026-10-10',
        dishMentioned: 'Slow-Simmered Creamy Black Lentils',
      },
    ],
  },
  {
    _id: 'rest-6',
    name: 'Garden Pasta House',
    isVeg: true,
    address: '61 Olive Grove Promenade · Vegetarian Pasta & Pizza',
    ratings: 4.8,
    numOfReviews: 195,
    deliveryTime: '25–30 min',
    priceForTwo: 36,
    cuisine: ['Fresh Pasta', 'Garlic Breads', 'Pure Vegetarian'],
    images: [{ public_id: 'terracotta_1', url: GENERATED_IMAGES.pasta }],
    reviews: [
      {
        _id: 'rev-601',
        userName: 'Priya Mason',
        rating: 5,
        comment: 'The Pistachio Pesto Pizza and roasted tomato garlic bread are delicious. Love that the entire menu is pure vegetarian!',
        createdAt: '2026-10-04',
        dishMentioned: 'Pistachio Pesto & Mozzarella Pizza',
      },
    ],
  },
];

export const initialMenus: RestaurantMenu[] = [
  {
    _id: 'menu-rest-1',
    restaurant: 'rest-1',
    menu: [
      {
        category: 'Wood-Fired Pizzas',
        items: [
          {
            _id: 'item-101',
            name: 'Classic Margherita Pizza',
            price: 18,
            description: 'Crushed vine-ripened tomatoes, fresh mozzarella cheese, sweet organic basil leaves, and extra virgin olive oil on a wood-fired sourdough crust.',
            ratings: 4.9,
            numOfReviews: 184,
            images: [{ public_id: 'img-101', url: GENERATED_IMAGES.pizza }],
            category: 'Wood-Fired Pizzas',
            stock: 25,
            isVeg: true,
            calories: 740,
            prepTime: '15 min',
            restaurant: 'rest-1',
            restaurantName: 'The Wood-Fired Oven',
          },
          {
            _id: 'item-102',
            name: 'Truffle & Wild Mushroom Pizza',
            price: 22,
            description: 'Roasted wild mushrooms, melted aged white cheese, black truffle cream sauce, fresh thyme, and roasted garlic.',
            ratings: 4.8,
            numOfReviews: 112,
            images: [{ public_id: 'img-102', url: GENERATED_IMAGES.pizza }],
            category: 'Wood-Fired Pizzas',
            stock: 18,
            isVeg: true,
            calories: 820,
            prepTime: '18 min',
            restaurant: 'rest-1',
            restaurantName: 'The Wood-Fired Oven',
          },
          {
            _id: 'item-103',
            name: 'Spicy Plant-Pepperoni Pizza',
            price: 20,
            description: 'Smoky plant-based pepperoni slices, sweet chili honey drizzle, crushed tomato sauce, and melted provolone cheese.',
            ratings: 4.7,
            numOfReviews: 76,
            images: [{ public_id: 'img-103', url: GENERATED_IMAGES.pizza }],
            category: 'Wood-Fired Pizzas',
            stock: 20,
            isVeg: true,
            calories: 790,
            prepTime: '16 min',
            restaurant: 'rest-1',
            restaurantName: 'The Wood-Fired Oven',
          },
        ],
      },
      {
        category: 'Salads & Warm Starters',
        items: [
          {
            _id: 'item-104',
            name: 'Fresh Mozzarella & Tomato Salad',
            price: 16,
            description: 'Creamy fresh mozzarella over peppery arugula greens, sweet cherry tomatoes, aged balsamic glaze, and toasted pine nuts.',
            ratings: 4.9,
            numOfReviews: 145,
            images: [{ public_id: 'img-104', url: GENERATED_IMAGES.grainBowl }],
            category: 'Salads & Warm Starters',
            stock: 30,
            isVeg: true,
            calories: 460,
            prepTime: '10 min',
            restaurant: 'rest-1',
            restaurantName: 'The Wood-Fired Oven',
          },
          {
            _id: 'item-105',
            name: 'Warm Rosemary Garlic Bread & Herb Butter',
            price: 11,
            description: 'Oven-baked sourdough flatbread topped with sea salt, fresh rosemary, whipped butter, and roasted garlic oil.',
            ratings: 4.8,
            numOfReviews: 92,
            images: [{ public_id: 'img-105', url: GENERATED_IMAGES.friesAndBread }],
            category: 'Salads & Warm Starters',
            stock: 40,
            isVeg: true,
            calories: 510,
            prepTime: '12 min',
            restaurant: 'rest-1',
            restaurantName: 'The Wood-Fired Oven',
          },
        ],
      },
    ],
  },
  {
    _id: 'menu-rest-2',
    restaurant: 'rest-2',
    menu: [
      {
        category: 'Signature Smash Burgers',
        items: [
          {
            _id: 'item-201',
            name: 'Double Beef Truffle Burger',
            price: 19,
            description: 'Two seared beef smash patties, melted aged cheddar cheese, sweet caramelized onions, and black truffle mayo on a toasted sesame brioche bun.',
            ratings: 4.9,
            numOfReviews: 290,
            images: [{ public_id: 'img-201', url: GENERATED_IMAGES.burger }],
            category: 'Signature Smash Burgers',
            stock: 35,
            isVeg: false,
            calories: 890,
            prepTime: '14 min',
            restaurant: 'rest-2',
            restaurantName: 'Craft Burger Kitchen',
          },
          {
            _id: 'item-202',
            name: 'Smoky Chipotle & Grilled Cheese Burger',
            price: 17,
            description: 'Golden-seared halloumi cheese patty, roasted pepper relish, sliced avocado, pickled red onions, and smoky chipotle mayo on brioche.',
            ratings: 4.8,
            numOfReviews: 134,
            images: [{ public_id: 'img-202', url: GENERATED_IMAGES.burger }],
            category: 'Signature Smash Burgers',
            stock: 22,
            isVeg: true,
            calories: 760,
            prepTime: '12 min',
            restaurant: 'rest-2',
            restaurantName: 'Craft Burger Kitchen',
          },
        ],
      },
      {
        category: 'Crispy Fries & Sides',
        items: [
          {
            _id: 'item-203',
            name: 'Crispy Rosemary Parmesan Fries',
            price: 9,
            description: 'Twice-cooked golden potato fries tossed with crispy rosemary herbs, cracked black pepper, and grated Parmesan cheese.',
            ratings: 4.9,
            numOfReviews: 210,
            images: [{ public_id: 'img-203', url: GENERATED_IMAGES.friesAndBread }],
            category: 'Crispy Fries & Sides',
            stock: 50,
            isVeg: true,
            calories: 480,
            prepTime: '10 min',
            restaurant: 'rest-2',
            restaurantName: 'Craft Burger Kitchen',
          },
          {
            _id: 'item-204',
            name: 'Chargrilled Corn & Bell Pepper Skewers',
            price: 12,
            description: 'Flame-grilled sweet corn and colorful bell pepper skewers served with smoky paprika dip and grilled lemon.',
            ratings: 4.7,
            numOfReviews: 68,
            images: [{ public_id: 'img-204', url: GENERATED_IMAGES.feast }],
            category: 'Crispy Fries & Sides',
            stock: 30,
            isVeg: true,
            calories: 340,
            prepTime: '12 min',
            restaurant: 'rest-2',
            restaurantName: 'Craft Burger Kitchen',
          },
        ],
      },
    ],
  },
  {
    _id: 'menu-rest-3',
    restaurant: 'rest-3',
    menu: [
      {
        category: 'From the Open Grill',
        items: [
          {
            _id: 'item-301',
            name: 'Flame-Grilled Herb Chicken Skewers',
            price: 21,
            description: 'Free-range herb-marinated chicken skewers grilled over oak flames with sweet peppers, zucchini, grilled lemon, and roasted garlic sauce.',
            ratings: 4.8,
            numOfReviews: 156,
            images: [{ public_id: 'img-301', url: GENERATED_IMAGES.feast }],
            category: 'From the Open Grill',
            stock: 20,
            isVeg: false,
            calories: 620,
            prepTime: '18 min',
            restaurant: 'rest-3',
            restaurantName: 'The Open Hearth Grill',
          },
          {
            _id: 'item-302',
            name: 'Roasted Tomato & Basil Ribbon Pasta',
            price: 20,
            description: 'Fresh handmade ribbon pasta tossed with slow-roasted cherry tomatoes, fragrant basil oil, and creamy mozzarella.',
            ratings: 4.7,
            numOfReviews: 98,
            images: [{ public_id: 'img-302', url: GENERATED_IMAGES.pasta }],
            category: 'From the Open Grill',
            stock: 18,
            isVeg: true,
            calories: 680,
            prepTime: '16 min',
            restaurant: 'rest-3',
            restaurantName: 'The Open Hearth Grill',
          },
          {
            _id: 'item-303',
            name: 'Pan-Seared Steak & Baby Potatoes',
            price: 29,
            description: 'Prime grass-fed beef medallions seared with rosemary pan gravy, crispy baby potatoes, and charred broccoli.',
            ratings: 4.9,
            numOfReviews: 124,
            images: [{ public_id: 'img-303', url: GENERATED_IMAGES.bistro }],
            category: 'From the Open Grill',
            stock: 15,
            isVeg: false,
            calories: 850,
            prepTime: '22 min',
            restaurant: 'rest-3',
            restaurantName: 'The Open Hearth Grill',
          },
        ],
      },
    ],
  },
  {
    _id: 'menu-rest-4',
    restaurant: 'rest-4',
    menu: [
      {
        category: 'Harvest Bowls & Fresh Bakery',
        items: [
          {
            _id: 'item-401',
            name: 'Warm Grain & Avocado Harvest Bowl',
            price: 16,
            description: 'Warm nutty whole grains, baby arugula greens, sweet cherry tomatoes, creamy mozzarella, toasted pumpkin seeds, and lemon-basil dressing.',
            ratings: 4.9,
            numOfReviews: 230,
            images: [{ public_id: 'img-401', url: GENERATED_IMAGES.grainBowl }],
            category: 'Harvest Bowls & Fresh Bakery',
            stock: 40,
            isVeg: true,
            calories: 520,
            prepTime: '12 min',
            restaurant: 'rest-4',
            restaurantName: 'Green Harvest Kitchen',
          },
          {
            _id: 'item-402',
            name: 'Freshly Baked Country Sourdough Bread',
            price: 10,
            description: 'Thick-sliced country sourdough bread baked fresh daily, served with sea-salted whipped butter and cold-pressed olive oil.',
            ratings: 4.9,
            numOfReviews: 180,
            images: [{ public_id: 'img-402', url: GENERATED_IMAGES.friesAndBread }],
            category: 'Harvest Bowls & Fresh Bakery',
            stock: 35,
            isVeg: true,
            calories: 410,
            prepTime: '8 min',
            restaurant: 'rest-4',
            restaurantName: 'Green Harvest Kitchen',
          },
          {
            _id: 'item-403',
            name: 'Grilled Zucchini & Cheese Skewers',
            price: 15,
            description: 'Flame-grilled zucchini, sweet bell peppers, and golden grilled cheese skewers with tangy pomegranate glaze and mint yogurt.',
            ratings: 4.8,
            numOfReviews: 94,
            images: [{ public_id: 'img-403', url: GENERATED_IMAGES.feast }],
            category: 'Harvest Bowls & Fresh Bakery',
            stock: 28,
            isVeg: true,
            calories: 440,
            prepTime: '14 min',
            restaurant: 'rest-4',
            restaurantName: 'Green Harvest Kitchen',
          },
        ],
      },
    ],
  },
  {
    _id: 'menu-rest-5',
    restaurant: 'rest-5',
    menu: [
      {
        category: 'Charcoal Skewers & Slow-Cooked Classics',
        items: [
          {
            _id: 'item-501',
            name: 'Charcoal-Grilled Cottage Cheese Skewers',
            price: 16,
            description: 'Soft cottage cheese cubes marinated in spiced yogurt, mild red chili, and roasted cumin, grilled over live charcoal.',
            ratings: 4.8,
            numOfReviews: 310,
            images: [{ public_id: 'img-501', url: GENERATED_IMAGES.indianCurry }],
            category: 'Charcoal Skewers & Slow-Cooked Classics',
            stock: 30,
            isVeg: true,
            calories: 560,
            prepTime: '15 min',
            restaurant: 'rest-5',
            restaurantName: 'Saffron & Spice Grill',
          },
          {
            _id: 'item-502',
            name: 'Smoky Grilled Chicken Skewers',
            price: 18,
            description: 'Tender chicken skewers marinated with roasted garlic, warm spices, and saffron yogurt, served with fresh mint dip.',
            ratings: 4.7,
            numOfReviews: 275,
            images: [{ public_id: 'img-502', url: GENERATED_IMAGES.feast }],
            category: 'Charcoal Skewers & Slow-Cooked Classics',
            stock: 25,
            isVeg: false,
            calories: 610,
            prepTime: '18 min',
            restaurant: 'rest-5',
            restaurantName: 'Saffron & Spice Grill',
          },
          {
            _id: 'item-503',
            name: 'Slow-Simmered Creamy Black Lentils',
            price: 15,
            description: 'Rich black lentils simmered overnight over slow embers with tomato purée, fresh ginger, and cream.',
            ratings: 4.9,
            numOfReviews: 410,
            images: [{ public_id: 'img-503', url: GENERATED_IMAGES.indianCurry }],
            category: 'Charcoal Skewers & Slow-Cooked Classics',
            stock: 40,
            isVeg: true,
            calories: 590,
            prepTime: '12 min',
            restaurant: 'rest-5',
            restaurantName: 'Saffron & Spice Grill',
          },
        ],
      },
    ],
  },
  {
    _id: 'menu-rest-6',
    restaurant: 'rest-6',
    menu: [
      {
        category: 'Vegetarian Pizzas & Garlic Breads',
        items: [
          {
            _id: 'item-601',
            name: 'Pistachio Pesto & Mozzarella Pizza',
            price: 21,
            description: 'Stone-ground pistachio basil pesto base, melted mozzarella, creamy burrata cheese, crushed pistachios, and fresh lemon zest.',
            ratings: 4.9,
            numOfReviews: 128,
            images: [{ public_id: 'img-601', url: GENERATED_IMAGES.pasta }],
            category: 'Vegetarian Pizzas & Garlic Breads',
            stock: 22,
            isVeg: true,
            calories: 780,
            prepTime: '16 min',
            restaurant: 'rest-6',
            restaurantName: 'Garden Pasta House',
          },
          {
            _id: 'item-602',
            name: 'Roasted Tomato & Basil Garlic Toast',
            price: 13,
            description: 'Toasted country bread rubbed with roasted garlic, topped with marinated sweet cherry tomatoes, fresh basil, and balsamic glaze.',
            ratings: 4.7,
            numOfReviews: 89,
            images: [{ public_id: 'img-602', url: GENERATED_IMAGES.friesAndBread }],
            category: 'Vegetarian Pizzas & Garlic Breads',
            stock: 30,
            isVeg: true,
            calories: 380,
            prepTime: '10 min',
            restaurant: 'rest-6',
            restaurantName: 'Garden Pasta House',
          },
        ],
      },
    ],
  },
];

export const initialCoupons: CouponData[] = [
  {
    _id: 'coup-1',
    code: 'FEAST20',
    description: '20% off on orders above $25 (up to $15 savings)',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minOrderAmount: 25,
    maxDiscount: 15,
    isActive: true,
    expiryDate: '2027-12-31',
  },
  {
    _id: 'coup-2',
    code: 'WELCOME10',
    description: 'Flat $10 off on orders of $30 or more',
    discountType: 'FLAT',
    discountValue: 10,
    minOrderAmount: 30,
    maxDiscount: 10,
    isActive: true,
    expiryDate: '2027-12-31',
  },
  {
    _id: 'coup-3',
    code: 'PUREVEG15',
    description: '15% off on vegetarian orders above $20',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minOrderAmount: 20,
    maxDiscount: 12,
    isActive: true,
    expiryDate: '2027-12-31',
  },
  {
    _id: 'coup-4',
    code: 'CHEF5',
    description: 'Instant $5 off on any order above $15',
    discountType: 'FLAT',
    discountValue: 5,
    minOrderAmount: 15,
    maxDiscount: 5,
    isActive: true,
    expiryDate: '2027-12-31',
  },
];

export function getAllFoodItemsFlat(menusList: RestaurantMenu[] = initialMenus): FoodItemData[] {
  const list: FoodItemData[] = [];
  for (const m of menusList) {
    for (const cat of m.menu) {
      for (const item of cat.items) {
        list.push(item);
      }
    }
  }
  return list;
}
