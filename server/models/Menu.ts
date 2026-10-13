import mongoose, { Schema } from 'mongoose';
import type { FoodItemData } from '../seedData.ts';

const FoodItemSchema = new Schema<FoodItemData>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, default: '' },
    ratings: { type: Number, default: 4.5 },
    numOfReviews: { type: Number, default: 0 },
    images: [{ public_id: String, url: String }],
    category: { type: String, required: true },
    stock: { type: Number, default: 20 },
    isVeg: { type: Boolean, default: false },
    calories: { type: Number, default: 450 },
    prepTime: { type: String, default: '15-20 min' },
    restaurant: { type: String, required: true },
    restaurantName: { type: String, required: true },
  },
  { _id: false }
);

const MenuCategorySchema = new Schema(
  {
    category: { type: String, required: true },
    items: [FoodItemSchema],
  },
  { _id: false }
);

const MenuSchema = new Schema(
  {
    _id: { type: String, required: true },
    restaurant: { type: String, required: true, index: true },
    menu: [MenuCategorySchema],
  },
  {
    timestamps: true,
    _id: false,
  }
);

export const Menu = mongoose.models.Menu || mongoose.model('Menu', MenuSchema);
