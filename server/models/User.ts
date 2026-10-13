import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, default: '' },
    avatar: {
      public_id: { type: String, default: 'avatar_default' },
      url: { type: String, default: '' },
    },
    role: { type: String, default: 'user' },
    defaultAddress: {
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      phoneNo: { type: String, default: '' },
      country: { type: String, default: 'United States' },
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
