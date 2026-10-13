import mongoose from 'mongoose';
import {
  initialRestaurants,
  initialMenus,
  initialCoupons,
} from './seedData.ts';
import type {
  RestaurantData,
  RestaurantMenu,
  CouponData,
} from './seedData.ts';
import { Restaurant } from './models/Restaurant.ts';
import { Menu } from './models/Menu.ts';
import { Order } from './models/Order.ts';
import { User } from './models/User.ts';
import { Coupon } from './models/Coupon.ts';

let isConnected = false;
let connectionError: string | null = null;
let databaseName: string | null = null;
let connectionHost: string | null = null;

export async function connectMongoDB(): Promise<{
  connected: boolean;
  message: string;
}> {
  let uri = (process.env.MONGODB_URI || process.env.MONGO_URI || '').trim();

  // Strip wrapping single or double quotes
  if (
    (uri.startsWith('"') && uri.endsWith('"')) ||
    (uri.startsWith("'") && uri.endsWith("'"))
  ) {
    uri = uri.slice(1, -1).trim();
  }

  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    const msg =
      'MONGODB_URI contains unconfigured placeholder credentials (<username>/<password>). Operating in high-performance in-memory store mode until real MongoDB Atlas credentials are provided in .env.';
    console.log(`[Database] ℹ️ ${msg}`);
    return { connected: false, message: msg };
  }

  // Already connected
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return {
      connected: true,
      message: `Already connected to MongoDB: ${databaseName || 'cluster'}`,
    };
  }

  try {
    console.log('[Database] 🔌 Connecting to MongoDB Atlas / cluster...');
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    isConnected = true;
    connectionError = null;
    databaseName = conn.connection.name || 'foodgenie';
    connectionHost = conn.connection.host || 'remote-cluster';

    console.log(
      `[Database] ✅ Connected to MongoDB successfully! Database: "${databaseName}" on host: "${connectionHost}"`
    );

    // Seed database if empty
    await seedMongoIfEmpty();

    return {
      connected: true,
      message: `Successfully connected to MongoDB (${databaseName})`,
    };
  } catch (err: any) {
    isConnected = false;
    connectionError = err.message || 'Failed to connect to MongoDB';
    console.warn(
      `[Database] ⚠️ MongoDB connection attempt failed: ${connectionError}. Falling back to in-memory store so app remains 100% operational.`
    );
    return {
      connected: false,
      message: connectionError || 'Failed to connect to MongoDB',
    };
  }
}

export async function seedMongoIfEmpty() {
  if (!isConnected || mongoose.connection.readyState !== 1) return;

  try {
    const restaurantCount = await Restaurant.countDocuments();
    if (restaurantCount === 0) {
      console.log('[Database] 🚀 Seeding initial restaurants to MongoDB...');
      await Restaurant.insertMany(initialRestaurants);
    }

    const menuCount = await Menu.countDocuments();
    if (menuCount === 0) {
      console.log('[Database] 🚀 Seeding initial menus to MongoDB...');
      await Menu.insertMany(initialMenus);
    }

    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      console.log('[Database] 🚀 Seeding initial coupons to MongoDB...');
      await Coupon.insertMany(initialCoupons);
    }

    console.log('[Database] ✨ Seeding verified and synchronized.');
  } catch (err: any) {
    console.error('[Database] Seeding error:', err.message);
  }
}

export async function getDatabaseStatus(
  fallbackCounts: {
    restaurants: number;
    menus: number;
    orders: number;
    users: number;
    coupons: number;
  }
) {
  const isMongoReady = mongoose.connection.readyState === 1;
  const uriConfigured = !!(process.env.MONGODB_URI || process.env.MONGO_URI);

  let counts = { ...fallbackCounts };

  if (isMongoReady) {
    try {
      const [restCount, menuCount, orderCount, userCount, couponCount] =
        await Promise.all([
          Restaurant.countDocuments(),
          Menu.countDocuments(),
          Order.countDocuments(),
          User.countDocuments(),
          Coupon.countDocuments(),
        ]);
      counts = {
        restaurants: restCount,
        menus: menuCount,
        orders: orderCount,
        users: userCount,
        coupons: couponCount,
      };
    } catch {
      // Use fallback counts if query fails
    }
  }

  return {
    engine: isMongoReady ? 'MongoDB' : 'In-Memory (Seeded Store)',
    connected: isMongoReady,
    uriConfigured,
    databaseName: isMongoReady ? databaseName : 'in-memory-foodgenie',
    host: isMongoReady ? connectionHost : 'localhost/memory',
    connectionError,
    counts,
    features: [
      'Automatic Collection Seeding',
      'Real-Time Order Tracking',
      'Full Schema Validation',
      'Failover Resilience',
    ],
  };
}

export { isConnected };
