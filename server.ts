import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  initialRestaurants,
  initialMenus,
  initialCoupons,
  GENERATED_IMAGES,
  FoodItemData,
  RestaurantData,
  RestaurantMenu,
  CouponData,
} from './server/seedData.ts';
import {
  generateDishRecommendations,
  analyzeRestaurantReviews,
} from './server/aiService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// In-memory state initialized from rich seed data
const restaurants: RestaurantData[] = structuredClone(initialRestaurants);
const menus: RestaurantMenu[] = structuredClone(initialMenus);
const coupons: CouponData[] = structuredClone(initialCoupons);

interface UserAccount {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  avatar: { public_id: string; url: string };
  role: string;
  createdAt: string;
  defaultAddress: {
    address: string;
    city: string;
    postalCode: string;
    phoneNo: string;
    country: string;
  };
}

const users: UserAccount[] = [
  {
    _id: 'user-demo-1',
    name: 'Jenifer Samuel',
    email: 'jenifer@foodgenie.com',
    phoneNumber: '+1 (555) 234-8910',
    avatar: {
      public_id: 'avatar_demo',
      url: GENERATED_IMAGES.avatar,
    },
    role: 'user',
    createdAt: '2026-01-15T10:00:00.000Z',
    defaultAddress: {
      address: '742 Evergreen Terrace, Apt 4B',
      city: 'San Francisco',
      postalCode: '94107',
      phoneNo: '+1 (555) 234-8910',
      country: 'United States',
    },
  },
];

let activeUser: UserAccount | null = users[0];

interface CartEntry {
  fooditem: FoodItemData;
  quantity: number;
}

interface CartState {
  user: string;
  restaurant: RestaurantData | null;
  items: CartEntry[];
}

let currentCart: CartState = {
  user: 'user-demo-1',
  restaurant: restaurants[0],
  items: [
    {
      fooditem: menus[0].menu[0].items[0],
      quantity: 1,
    },
    {
      fooditem: menus[0].menu[1].items[0],
      quantity: 1,
    },
  ],
};

export interface OrderRecord {
  _id: string;
  user: UserAccount;
  restaurant: {
    _id: string;
    name: string;
    address: string;
    image: string;
  };
  orderItems: {
    fooditem: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    isVeg: boolean;
  }[];
  deliveryInfo: {
    address: string;
    city: string;
    postalCode: string;
    phoneNo: string;
    country: string;
  };
  itemsPrice: number;
  taxPrice: number;
  deliveryCharge: number;
  discountAmount: number;
  couponApplied?: string;
  finalTotal: number;
  paymentInfo: {
    id: string;
    status: string;
    method: string;
  };
  orderStatus: 'Order Confirmed' | 'Preparing in Kitchen' | 'Out for Delivery' | 'Delivered';
  createdAt: string;
}

const orders: OrderRecord[] = [
  {
    _id: 'ORD-89421',
    user: users[0],
    restaurant: {
      _id: 'rest-2',
      name: 'Craft Burger Kitchen',
      address: '18 Mercer Avenue, Midtown · Gourmet Burgers & Fries',
      image: GENERATED_IMAGES.burger,
    },
    orderItems: [
      {
        fooditem: 'item-201',
        name: 'Double Beef Truffle Burger',
        price: 19,
        quantity: 2,
        image: GENERATED_IMAGES.burger,
        isVeg: false,
      },
      {
        fooditem: 'item-203',
        name: 'Crispy Rosemary Parmesan Fries',
        price: 9,
        quantity: 1,
        image: GENERATED_IMAGES.friesAndBread,
        isVeg: true,
      },
    ],
    deliveryInfo: users[0].defaultAddress,
    itemsPrice: 47,
    taxPrice: 3.76,
    deliveryCharge: 0,
    discountAmount: 9.4,
    couponApplied: 'FEAST20',
    finalTotal: 41.36,
    paymentInfo: {
      id: 'pay_stripe_982341',
      status: 'Paid',
      method: 'Card ·••• 4242',
    },
    orderStatus: 'Delivered',
    createdAt: '2026-10-08T19:30:00.000Z',
  },
  {
    _id: 'ORD-90114',
    user: users[0],
    restaurant: {
      _id: 'rest-1',
      name: 'The Wood-Fired Oven',
      address: '42 Baker Street, Downtown · Wood-Fired Pizza Kitchen',
      image: GENERATED_IMAGES.pizza,
    },
    orderItems: [
      {
        fooditem: 'item-101',
        name: 'Classic Margherita Pizza',
        price: 18,
        quantity: 1,
        image: GENERATED_IMAGES.pizza,
        isVeg: true,
      },
      {
        fooditem: 'item-105',
        name: 'Warm Rosemary Garlic Bread & Herb Butter',
        price: 11,
        quantity: 1,
        image: GENERATED_IMAGES.friesAndBread,
        isVeg: true,
      },
    ],
    deliveryInfo: users[0].defaultAddress,
    itemsPrice: 29,
    taxPrice: 2.32,
    deliveryCharge: 3.5,
    discountAmount: 5,
    couponApplied: 'CHEF5',
    finalTotal: 29.82,
    paymentInfo: {
      id: 'pay_stripe_990142',
      status: 'Paid',
      method: 'Apple Pay',
    },
    orderStatus: 'Preparing in Kitchen',
    createdAt: '2026-10-11T07:45:00.000Z',
  },
];

function getAllFoodItemsFlat(): FoodItemData[] {
  const list: FoodItemData[] = [];
  for (const m of menus) {
    for (const cat of m.menu) {
      for (const item of cat.items) {
        list.push(item);
      }
    }
  }
  return list;
}

// ==========================================
// 1. RESTAURANT ROUTES (/api/v1/eats/stores)
// ==========================================
app.get('/api/v1/eats/stores/count', (_req, res) => {
  const count = restaurants.length;
  const pureVegCount = restaurants.filter((r) => r.isVeg).length;
  res.json({
    status: 'success',
    count,
    pureVegCount,
  });
});

app.get('/api/v1/eats/stores', (req, res) => {
  const { keyword, isVeg, sortByRatings, sortByReviews, cuisine } = req.query;
  let result = [...restaurants];

  if (keyword && typeof keyword === 'string' && keyword.trim() !== '') {
    const q = keyword.toLowerCase().trim();
    const matchingRestIdsFromDishes = new Set(
      getAllFoodItemsFlat()
        .filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q)
        )
        .map((item) => item.restaurant)
    );

    result = result.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q) ||
        r.cuisine.some((c) => c.toLowerCase().includes(q)) ||
        matchingRestIdsFromDishes.has(r._id)
    );
  }

  if (isVeg === 'true') {
    result = result.filter((r) => r.isVeg);
  }

  if (cuisine && typeof cuisine === 'string' && cuisine !== 'All') {
    result = result.filter((r) =>
      r.cuisine.some((c) => c.toLowerCase().includes(cuisine.toLowerCase()))
    );
  }

  if (sortByRatings === 'true') {
    result.sort((a, b) => b.ratings - a.ratings);
  } else if (sortByReviews === 'true') {
    result.sort((a, b) => b.numOfReviews - a.numOfReviews);
  }

  res.json({
    status: 'success',
    count: result.length,
    restaurants: result,
  });
});

app.get('/api/v1/eats/stores/:storeId', (req, res) => {
  const restaurant = restaurants.find((r) => r._id === req.params.storeId);
  if (!restaurant) {
    return res.status(404).json({ status: 'fail', message: 'Restaurant not found' });
  }
  res.json({ status: 'success', data: { restaurant } });
});

app.get('/api/v1/eats/stores/:storeId/menus', (req, res) => {
  const { storeId } = req.params;
  const restaurant = restaurants.find((r) => r._id === storeId);
  const storeMenu = menus.find((m) => m.restaurant === storeId);

  if (!restaurant || !storeMenu) {
    return res.status(404).json({ status: 'fail', message: 'Menu not found for this store' });
  }

  res.json({
    status: 'success',
    count: storeMenu.menu.length,
    data: {
      restaurant,
      menus: [storeMenu],
    },
  });
});

app.post('/api/v1/eats/stores/:storeId/reviews', (req, res) => {
  const { storeId } = req.params;
  const { rating, comment, dishMentioned, userName } = req.body;
  const restaurant = restaurants.find((r) => r._id === storeId);
  if (!restaurant) {
    return res.status(404).json({ status: 'fail', message: 'Restaurant not found' });
  }

  const newReview = {
    _id: `rev-${Date.now()}`,
    userName: userName || activeUser?.name || 'Verified Diner',
    rating: Number(rating) || 5,
    comment: comment || 'Great food and timely delivery!',
    createdAt: new Date().toISOString().split('T')[0],
    dishMentioned: dishMentioned || undefined,
  };

  restaurant.reviews.unshift(newReview);
  restaurant.numOfReviews += 1;
  const avg =
    restaurant.reviews.reduce((acc, r) => acc + r.rating, 0) / restaurant.reviews.length;
  restaurant.ratings = Number(avg.toFixed(1));

  res.status(201).json({
    status: 'success',
    review: newReview,
    restaurant,
  });
});

// ==========================================
// 2. FOOD ITEMS ROUTES (/api/v1/eats/item)
// ==========================================
app.get('/api/v1/eats/item', (_req, res) => {
  const items = getAllFoodItemsFlat();
  res.json({ status: 'success', count: items.length, items });
});

// ==========================================
// 3. CART ROUTES (/api/v1/eats/cart)
// ==========================================
app.get('/api/v1/eats/cart/get-cart', (_req, res) => {
  res.json({
    status: 'success',
    data: currentCart,
  });
});

app.post('/api/v1/eats/cart/add-to-cart', (req, res) => {
  const { foodItemId, restaurant: restaurantId, quantity = 1 } = req.body;
  const allItems = getAllFoodItemsFlat();
  const targetItem = allItems.find((i) => i._id === foodItemId);
  if (!targetItem) {
    return res.status(404).json({ status: 'fail', message: 'Food item not found' });
  }

  const targetRestaurant =
    restaurants.find((r) => r._id === (restaurantId || targetItem.restaurant)) || null;

  // If switching restaurants, reset cart to the new restaurant
  if (
    currentCart.restaurant &&
    targetRestaurant &&
    currentCart.restaurant._id !== targetRestaurant._id
  ) {
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
    status: 'success',
    data: currentCart,
  });
});

app.post('/api/v1/eats/cart/update-cart-item', (req, res) => {
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
    status: 'success',
    data: currentCart,
  });
});

app.delete('/api/v1/eats/cart/delete-cart-item', (req, res) => {
  const foodItemId = req.body?.foodItemId || req.query?.foodItemId;
  currentCart.items = currentCart.items.filter((i) => i.fooditem._id !== foodItemId);
  if (currentCart.items.length === 0) {
    currentCart.restaurant = null;
  }
  res.json({
    status: 'success',
    data: currentCart,
  });
});

app.delete('/api/v1/eats/cart/clear-cart', (_req, res) => {
  currentCart.items = [];
  currentCart.restaurant = null;
  res.json({
    status: 'success',
    data: currentCart,
  });
});

// ==========================================
// 4. COUPONS ROUTES (/api/v1/coupons)
// ==========================================
app.get('/api/v1/coupons', (_req, res) => {
  res.json({
    status: 'success',
    coupons: coupons.filter((c) => c.isActive),
  });
});

app.post('/api/v1/coupons/validate', (req, res) => {
  const { code, orderAmount } = req.body;
  if (!code) {
    return res.status(400).json({ valid: false, message: 'Please enter a coupon code.' });
  }

  const normalized = String(code).trim().toUpperCase();
  const coupon = coupons.find((c) => c.code === normalized && c.isActive);
  if (!coupon) {
    return res.status(404).json({
      valid: false,
      message: `Coupon "${normalized}" is not valid or has expired.`,
    });
  }

  const subtotal = Number(orderAmount) || 0;
  if (subtotal < coupon.minOrderAmount) {
    return res.status(400).json({
      valid: false,
      message: `Minimum item subtotal of $${coupon.minOrderAmount} required for ${coupon.code}.`,
    });
  }

  let discountAmount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discountAmount = Math.min(
      Number(((subtotal * coupon.discountValue) / 100).toFixed(2)),
      coupon.maxDiscount
    );
  } else {
    discountAmount = Math.min(coupon.discountValue, subtotal);
  }

  res.json({
    valid: true,
    coupon,
    discountAmount,
    message: `${coupon.code} applied! You saved $${discountAmount.toFixed(2)}.`,
  });
});

// ==========================================
// 5. AUTH & USER ROUTES (/api/v1/users)
// ==========================================
app.get('/api/v1/users/me', (_req, res) => {
  if (!activeUser) {
    return res.status(401).json({ status: 'fail', message: 'Not logged in' });
  }
  res.json({
    status: 'success',
    user: activeUser,
  });
});

app.post('/api/v1/users/login', (req, res) => {
  const { email } = req.body;
  let user = users.find((u) => u.email.toLowerCase() === String(email || '').toLowerCase());
  if (!user) {
    user = users[0];
  }
  activeUser = user;
  res.json({
    status: 'success',
    token: 'jwt-demo-token-orderit',
    user: activeUser,
  });
});

app.post('/api/v1/users/signup', (req, res) => {
  const { name, email, phoneNumber } = req.body;
  const newUser: UserAccount = {
    _id: `user-${Date.now()}`,
    name: name || 'New Food Lover',
    email: email || 'diner@orderit.com',
    phoneNumber: phoneNumber || '+1 (555) 019-2834',
    avatar: {
      public_id: 'avatar_new',
      url: GENERATED_IMAGES.avatar,
    },
    role: 'user',
    createdAt: new Date().toISOString(),
    defaultAddress: {
      address: '450 Artisan Boulevard',
      city: 'San Francisco',
      postalCode: '94102',
      phoneNo: phoneNumber || '+1 (555) 019-2834',
      country: 'United States',
    },
  };
  users.push(newUser);
  activeUser = newUser;
  res.status(201).json({
    status: 'success',
    token: 'jwt-demo-token-orderit',
    user: activeUser,
  });
});

app.get('/api/v1/users/logout', (_req, res) => {
  activeUser = null;
  res.json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

app.put('/api/v1/users/me/update', (req, res) => {
  if (!activeUser) {
    activeUser = users[0];
  }
  const { name, email, phoneNumber, address, city, postalCode } = req.body;
  if (name) activeUser.name = name;
  if (email) activeUser.email = email;
  if (phoneNumber) activeUser.phoneNumber = phoneNumber;
  if (address) activeUser.defaultAddress.address = address;
  if (city) activeUser.defaultAddress.city = city;
  if (postalCode) activeUser.defaultAddress.postalCode = postalCode;

  res.json({
    status: 'success',
    user: activeUser,
  });
});

// ==========================================
// 6. ORDERS & PAYMENT ROUTES (/api/v1/eats/orders)
// ==========================================
app.post('/api/v1/payment/process', (req, res) => {
  const { amount } = req.body;
  res.json({
    success: true,
    client_secret: `pi_${Date.now()}_secret_${Math.round((Number(amount) || 20) * 100)}`,
  });
});

app.post('/api/v1/eats/orders/new', (req, res) => {
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
    restaurant,
  } = req.body;

  const targetRest =
    restaurants.find((r) => r._id === restaurant) ||
    currentCart.restaurant ||
    restaurants[0];

  const newOrder: OrderRecord = {
    _id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
    user: activeUser || users[0],
    restaurant: {
      _id: targetRest._id,
      name: targetRest.name,
      address: targetRest.address,
      image: targetRest.images[0]?.url || GENERATED_IMAGES.feast,
    },
    orderItems:
      orderItems && orderItems.length > 0
        ? orderItems
        : currentCart.items.map((entry) => ({
            fooditem: entry.fooditem._id,
            name: entry.fooditem.name,
            price: entry.fooditem.price,
            quantity: entry.quantity,
            image: entry.fooditem.images[0]?.url || GENERATED_IMAGES.feast,
            isVeg: entry.fooditem.isVeg,
          })),
    deliveryInfo: deliveryInfo || (activeUser || users[0]).defaultAddress,
    itemsPrice: Number(itemsPrice) || 0,
    taxPrice: Number(taxPrice) || 0,
    deliveryCharge: Number(deliveryCharge) || 0,
    discountAmount: Number(discountAmount) || 0,
    couponApplied: couponApplied || undefined,
    finalTotal: Number(finalTotal) || 0,
    paymentInfo: paymentInfo || {
      id: `pay_${Date.now()}`,
      status: 'Paid',
      method: 'Instant Online Checkout',
    },
    orderStatus: 'Order Confirmed',
    createdAt: new Date().toISOString(),
  };

  orders.unshift(newOrder);
  // Clear cart after order creation
  currentCart.items = [];
  currentCart.restaurant = null;

  res.status(201).json({
    status: 'success',
    order: newOrder,
  });
});

app.get('/api/v1/eats/orders/me/myOrders', (_req, res) => {
  res.json({
    status: 'success',
    count: orders.length,
    orders,
  });
});

app.get('/api/v1/eats/orders/:id', (req, res) => {
  const order = orders.find((o) => o._id === req.params.id);
  if (!order) {
    return res.status(404).json({ status: 'fail', message: 'Order not found' });
  }
  res.json({
    status: 'success',
    order,
  });
});

// ==========================================
// 7. GEMINI AI ROUTES (/api/v1/ai)
// ==========================================
app.post('/api/v1/ai/recommend', async (req, res) => {
  try {
    const { prompt, dietaryPreference = 'ALL' } = req.body;
    const allItems = getAllFoodItemsFlat();
    const result = await generateDishRecommendations(
      prompt || 'Recommend something comforting and flavorful for dinner tonight',
      dietaryPreference,
      allItems
    );

    // Enrich recommendations with full foodItem object so the user can add to cart in 1 click
    const enriched = (result.recommendations || []).map((rec: any) => {
      const matched =
        allItems.find((i) => i._id === rec.itemId) ||
        allItems.find((i) => i.name.toLowerCase() === String(rec.name || '').toLowerCase()) ||
        allItems[0];
      return {
        ...rec,
        foodItem: matched,
      };
    });

    res.json({
      status: 'success',
      conciergeNote: result.conciergeNote,
      recommendations: enriched,
    });
  } catch (error: any) {
    console.error('Gemini AI Recommendation Error:', error);
    res.status(500).json({
      status: 'error',
      message: error?.message || 'Failed to generate AI culinary recommendations.',
    });
  }
});

app.post('/api/v1/ai/analyze-reviews', async (req, res) => {
  try {
    const { restaurantId } = req.body;
    const restaurant =
      restaurants.find((r) => r._id === restaurantId) || restaurants[0];
    const analysis = await analyzeRestaurantReviews(restaurant);
    res.json({
      status: 'success',
      restaurantName: restaurant.name,
      analysis,
    });
  } catch (error: any) {
    console.error('Gemini AI Review Analyzer Error:', error);
    res.status(500).json({
      status: 'error',
      message: error?.message || 'Failed to analyze restaurant reviews with Gemini AI.',
    });
  }
});

// ==========================================
// VITE DEV MIDDLEWARE / STATIC PROD SERVING
// ==========================================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FoodGenie Full-Stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
