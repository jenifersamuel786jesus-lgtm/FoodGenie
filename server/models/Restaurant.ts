import mongoose, { Schema, Document } from 'mongoose';
import type { RestaurantData, ReviewItem } from '../seedData.ts';

const ReviewSchema = new Schema<ReviewItem>(
  {
    _id: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    createdAt: { type: String, required: true },
    dishMentioned: { type: String },
  },
  { _id: false }
);

const RestaurantSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    isVeg: { type: Boolean, default: false },
    address: { type: String, required: true },
    ratings: { type: Number, default: 0 },
    numOfReviews: { type: Number, default: 0 },
    deliveryTime: { type: String, default: '30-40 min' },
    priceForTwo: { type: Number, default: 30 },
    cuisine: [{ type: String }],
    images: [
      {
        public_id: { type: String },
        url: { type: String },
      },
    ],
    reviews: [ReviewSchema],
  },
  {
    timestamps: true,
    _id: false,
  }
);

export const Restaurant =
  mongoose.models.Restaurant || mongoose.model('Restaurant', RestaurantSchema);
