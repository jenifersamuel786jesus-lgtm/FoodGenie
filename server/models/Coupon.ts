import mongoose, { Schema } from 'mongoose';

const CouponSchema = new Schema(
  {
    _id: { type: String, required: true },
    code: { type: String, required: true, uppercase: true, unique: true },
    description: { type: String, default: '' },
    discountType: { type: String, enum: ['PERCENTAGE', 'FLAT'], required: true },
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true },
    expiryDate: { type: String, required: true },
  },
  {
    timestamps: true,
    _id: false,
  }
);

export const Coupon =
  mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
