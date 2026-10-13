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
} from './server/seedData.ts';
import type {
  FoodItemData,
  RestaurantData,
  RestaurantMenu,
  CouponData,
} from './server/seedData.ts';
import {
  generateDishRecommendations,
  analyzeRestaurantReviews,
} from './server/aiService.ts';
import { connectMongoDB, getDatabaseStatus } from './server/db.ts';
import { Restaurant } from './server/models/Restaurant.ts';
import { Menu } from './server/models/Menu.ts';
import { Order } from './server/models/Order.ts';
import { User } from './server/models/User.ts';
import { Coupon } from './server/models/Coupon.ts';
import { securitySanitizerMiddleware } from './server/security.ts';
import { createStripePaymentIntent } from './server/stripeService.ts';
import mongoose from 'mongoose';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(securitySanitizerMiddleware);

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

const users: UserAccount[] = [];

let activeUser: UserAccount | null = null;

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
  user: '',
  restaurant: null,
  items: [],
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

const orders: OrderRecord[] = [];

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
// DATABASE (MONGODB) & SYSTEM HEALTH ROUTES
// ==========================================
app.get('/api/v1/db/status', async (_req, res) => {
  const status = await getDatabaseStatus({
    restaurants: restaurants.length,
    menus: menus.length,
    orders: orders.length,
    users: users.length,
    coupons: coupons.length,
  });
  res.json({
    status: 'success',
    database: status,
  });
});

app.post('/api/v1/db/connect', async (req, res) => {
  const { uri } = req.body;
  if (uri && typeof uri === 'string') {
    process.env.MONGODB_URI = uri.trim();
  }
  const result = await connectMongoDB();
  const status = await getDatabaseStatus({
    restaurants: restaurants.length,
    menus: menus.length,
    orders: orders.length,
    users: users.length,
    coupons: coupons.length,
  });
  res.json({
    status: result.connected ? 'success' : 'warn',
    message: result.message,
    database: status,
  });
});

// ==========================================
// 5. AUTH & USER ROUTES (/api/v1/users)
// ==========================================
app.get('/api/v1/users/me', (req, res) => {
  // Check if client provided a session email header or query parameter for session restore
  const sessionEmail = (req.headers['x-user-email'] as string) || (req.query.email as string);
  if (!activeUser && sessionEmail) {
    const found = users.find((u) => u.email.toLowerCase() === sessionEmail.toLowerCase());
    if (found) {
      activeUser = found;
    }
  }

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
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  let user = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    const rawName = cleanEmail.split('@')[0].replace(/[._]/g, ' ') || 'Foodie Member';
    const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    user = {
      _id: `user-${Date.now()}`,
      name: formattedName,
      email: cleanEmail,
      phoneNumber: '',
      avatar: {
        public_id: 'avatar_user',
        url: GENERATED_IMAGES.avatar,
      },
      role: 'user',
      createdAt: new Date().toISOString(),
      defaultAddress: {
        address: '',
        city: '',
        postalCode: '',
        phoneNo: '',
        country: '',
      },
    };
    users.push(user);
  }
  activeUser = user;
  currentCart.user = user._id;
  res.json({
    status: 'success',
    token: `jwt-${Date.now()}-auth`,
    user: activeUser,
  });
});

app.post('/api/v1/users/signup', (req, res) => {
  const { name, email, phoneNumber } = req.body;
  const cleanEmail = String(email || '').trim().toLowerCase();

  let existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    activeUser = existing;
    currentCart.user = existing._id;
    return res.json({
      status: 'success',
      token: `jwt-${Date.now()}-auth`,
      user: existing,
    });
  }

  const rawName = name?.trim() || cleanEmail.split('@')[0].replace(/[._]/g, ' ') || 'New Food Lover';
  const newUser: UserAccount = {
    _id: `user-${Date.now()}`,
    name: rawName,
    email: cleanEmail,
    phoneNumber: phoneNumber?.trim() || '',
    avatar: {
      public_id: 'avatar_new',
      url: GENERATED_IMAGES.avatar,
    },
    role: 'user',
    createdAt: new Date().toISOString(),
    defaultAddress: {
      address: '',
      city: '',
      postalCode: '',
      phoneNo: phoneNumber?.trim() || '',
      country: '',
    },
  };
  users.push(newUser);
  activeUser = newUser;
  currentCart.user = newUser._id;
  currentCart.items = [];
  currentCart.restaurant = null;

  // Persist to MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    User.create(newUser).catch((e) =>
      console.warn('[Database] User signup save warning:', e.message)
    );
  }

  res.status(201).json({
    status: 'success',
    token: 'jwt-demo-token-orderit',
    user: activeUser,
  });
});

app.get('/api/v1/users/logout', (_req, res) => {
  activeUser = null;
  currentCart.items = [];
  currentCart.restaurant = null;
  res.json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

app.put('/api/v1/users/me/update', async (req, res) => {
  const sessionEmail =
    (req.headers['x-user-email'] as string) ||
    (req.body.email as string) ||
    (req.query.email as string);

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
      const cleanEmail = sessionEmail || 'diner@foodgenie.com';
      targetUser = {
        _id: `user-${Date.now()}`,
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        phoneNumber: '',
        avatar: { public_id: 'avatar_custom', url: GENERATED_IMAGES.avatar },
        role: 'user',
        createdAt: new Date().toISOString(),
        defaultAddress: {
          address: '',
          city: '',
          postalCode: '',
          phoneNo: '',
          country: 'United States',
        },
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
      address: '',
      city: '',
      postalCode: '',
      phoneNo: '',
      country: 'United States',
    };
  }
  if (address !== undefined) targetUser.defaultAddress.address = address;
  if (city !== undefined) targetUser.defaultAddress.city = city;
  if (postalCode !== undefined) targetUser.defaultAddress.postalCode = postalCode;
  if (avatar) {
    if (typeof avatar === 'string') {
      targetUser.avatar = { public_id: 'avatar_custom', url: avatar };
    } else if (avatar && avatar.url) {
      targetUser.avatar = {
        public_id: avatar.public_id || 'avatar_custom',
        url: avatar.url,
      };
    }
  }

  // Update in MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      await User.findByIdAndUpdate(targetUser._id, targetUser, { upsert: true });
    } catch (e: any) {
      console.warn('[Database] User sync warning:', e.message);
    }
  }

  res.json({
    status: 'success',
    user: targetUser,
  });
});

// ==========================================
// ==========================================
// 6. STRIPE PAYMENT & ORDERS ROUTES (/api/v1/eats/orders)
// ==========================================
app.post('/api/v1/payment/stripe-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', orderId } = req.body;
    const amountVal = Number(amount) || 20;
    const result = await createStripePaymentIntent(amountVal, currency, { orderId });
    res.json(result);
  } catch (error: any) {
    console.error('Stripe Payment Intent Error:', error);
    res.status(500).json({ success: false, message: error?.message || 'Payment processing error' });
  }
});

app.post('/api/v1/payment/process', async (req, res) => {
  try {
    const { amount, paymentMethodId } = req.body;
    const amountVal = Number(amount) || 20;
    const intent = await createStripePaymentIntent(amountVal, 'usd', { paymentMethodId });
    res.json({
      success: true,
      client_secret: intent.clientSecret,
      paymentIntentId: intent.paymentIntentId,
      mode: intent.mode,
      amount: amountVal,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Payment error' });
  }
});

app.post('/api/v1/eats/orders/new', async (req, res) => {
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

  const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

  const currentUserRecord: UserAccount = activeUser || (users.length > 0 ? users[0] : {
    _id: `user-${Date.now()}`,
    name: 'FoodGenie Diner',
    email: 'diner@foodgenie.com',
    phoneNumber: '',
    avatar: { public_id: 'avatar_default', url: GENERATED_IMAGES.avatar },
    role: 'user',
    createdAt: new Date().toISOString(),
    defaultAddress: {
      address: deliveryInfo?.address || '',
      city: deliveryInfo?.city || '',
      postalCode: deliveryInfo?.postalCode || '',
      phoneNo: deliveryInfo?.phoneNo || '',
      country: 'United States',
    },
  });

  const newOrder: OrderRecord = {
    _id: orderId,
    user: currentUserRecord,
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
    deliveryInfo: deliveryInfo || currentUserRecord.defaultAddress,
    itemsPrice: Number(itemsPrice) || 0,
    taxPrice: Number(taxPrice) || 0,
    deliveryCharge: Number(deliveryCharge) || 0,
    discountAmount: Number(discountAmount) || 0,
    couponApplied: couponApplied || undefined,
    finalTotal: Number(finalTotal) || 0,
    paymentInfo: paymentInfo || {
      id: `pi_stripe_${Date.now()}`,
      status: 'Paid',
      method: 'Stripe Online Checkout',
    },
    orderStatus: 'Order Confirmed',
    createdAt: new Date().toISOString(),
  };

  orders.unshift(newOrder);

  // Clear cart after order creation
  currentCart.items = [];
  currentCart.restaurant = null;

  // Persist to MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      await Order.create(newOrder);
    } catch (e: any) {
      console.warn('[Database] MongoDB order persist warning:', e.message);
    }
  }

  res.status(201).json({
    status: 'success',
    order: newOrder,
  });
});

app.get('/api/v1/eats/orders/me/myOrders', (req, res) => {
  const userEmail = (req.headers['x-user-email'] as string) || activeUser?.email;
  const userOrders = activeUser
    ? orders.filter(
        (o) =>
          o.user?._id === activeUser?._id ||
          (userEmail && o.user?.email === userEmail)
      )
    : [];

  res.json({
    status: 'success',
    count: userOrders.length,
    orders: userOrders,
  });
});

app.get('/api/v1/eats/orders/:id', async (req, res) => {
  let order = orders.find((o) => o._id === req.params.id);

  if (!order && mongoose.connection.readyState === 1) {
    try {
      const dbOrder = await Order.findOne({ _id: req.params.id }).lean();
      if (dbOrder) order = dbOrder as any;
    } catch {}
  }

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

  // Connect to MongoDB Atlas / cluster if MONGODB_URI is provided
  connectMongoDB().catch((err) => {
    console.log('[Database] MongoDB background initialization:', err.message);
  });

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
} else {
  // On Vercel serverless functions, initiate connection once per cold start
  connectMongoDB().catch(() => {});
}

export default app;
