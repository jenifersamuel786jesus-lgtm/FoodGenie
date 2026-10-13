import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FoodItem } from './menuSlice.ts';
import { RestaurantItem } from './restaurantSlice.ts';

export interface CartItemEntry {
  fooditem: FoodItem;
  quantity: number;
}

export interface DeliveryAddressInfo {
  address: string;
  city: string;
  postalCode: string;
  phoneNo: string;
  country: string;
}

export interface AppliedCoupon {
  code: string;
  discountAmount: number;
  description: string;
}

interface CartState {
  cartItems: CartItemEntry[];
  restaurant: RestaurantItem | null;
  deliveryInfo: DeliveryAddressInfo;
  appliedCoupon: AppliedCoupon | null;
  couponError: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cartItems: [],
  restaurant: null,
  deliveryInfo: {
    address: '',
    city: '',
    postalCode: '',
    phoneNo: '',
    country: '',
  },
  appliedCoupon: null,
  couponError: null,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    fetchCartRequest(state) {
      state.loading = true;
      state.error = null;
    },
    setCartData(
      state,
      action: PayloadAction<{ items: CartItemEntry[]; restaurant: RestaurantItem | null }>
    ) {
      state.loading = false;
      state.cartItems = action.payload.items || [];
      state.restaurant = action.payload.restaurant || null;
    },
    fetchCartFail(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    saveDeliveryInfo(state, action: PayloadAction<DeliveryAddressInfo>) {
      state.deliveryInfo = action.payload;
    },
    setAppliedCoupon(state, action: PayloadAction<AppliedCoupon | null>) {
      state.appliedCoupon = action.payload;
      state.couponError = null;
    },
    setCouponError(state, action: PayloadAction<string | null>) {
      state.couponError = action.payload;
    },
    clearCartLocal(state) {
      state.cartItems = [];
      state.restaurant = null;
      state.appliedCoupon = null;
      state.couponError = null;
    },
  },
});

export const {
  fetchCartRequest,
  setCartData,
  fetchCartFail,
  saveDeliveryInfo,
  setAppliedCoupon,
  setCouponError,
  clearCartLocal,
} = cartSlice.actions;

export default cartSlice.reducer;
