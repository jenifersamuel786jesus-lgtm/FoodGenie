import mongoose, { Schema } from 'mongoose';

const OrderItemSchema = new Schema(
  {
    fooditem: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    image: { type: String, default: '' },
    isVeg: { type: Boolean, default: false },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    _id: { type: String, required: true },
    user: {
      _id: String,
      name: String,
      email: String,
      phoneNumber: String,
      avatar: { public_id: String, url: String },
    },
    restaurant: {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      address: { type: String, required: true },
      image: { type: String, default: '' },
    },
    orderItems: [OrderItemSchema],
    deliveryInfo: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      phoneNo: { type: String, required: true },
      country: { type: String, default: 'United States' },
    },
    itemsPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    deliveryCharge: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponApplied: { type: String },
    finalTotal: { type: Number, required: true },
    paymentInfo: {
      id: { type: String, required: true },
      status: { type: String, default: 'Paid' },
      method: { type: String, default: 'Stripe Online Checkout' },
    },
    orderStatus: {
      type: String,
      enum: ['Order Confirmed', 'Preparing in Kitchen', 'Delivered'],
      default: 'Order Confirmed',
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

export const Order =
  mongoose.models.Order || mongoose.model('Order', OrderSchema);
