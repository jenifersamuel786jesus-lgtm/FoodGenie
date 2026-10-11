import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DeliveryAddressInfo } from './cartSlice.ts';

export interface OrderItemSummary {
  fooditem: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  isVeg: boolean;
}

export interface OrderData {
  _id: string;
  restaurant: {
    _id: string;
    name: string;
    address: string;
    image: string;
  };
  orderItems: OrderItemSummary[];
  deliveryInfo: DeliveryAddressInfo;
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

interface OrderState {
  orders: OrderData[];
  orderDetails: OrderData | null;
  latestCreatedOrder: OrderData | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  orderDetails: null,
  latestCreatedOrder: null,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    createOrderRequest(state) {
      state.loading = true;
      state.error = null;
    },
    createOrderSuccess(state, action: PayloadAction<OrderData>) {
      state.loading = false;
      state.latestCreatedOrder = action.payload;
      state.orders.unshift(action.payload);
    },
    createOrderFail(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    myOrdersRequest(state) {
      state.loading = true;
      state.error = null;
    },
    myOrdersSuccess(state, action: PayloadAction<OrderData[]>) {
      state.loading = false;
      state.orders = action.payload;
    },
    myOrdersFail(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    orderDetailsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    orderDetailsSuccess(state, action: PayloadAction<OrderData>) {
      state.loading = false;
      state.orderDetails = action.payload;
    },
    orderDetailsFail(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    clearOrderErrors(state) {
      state.error = null;
    },
  },
});

export const {
  createOrderRequest,
  createOrderSuccess,
  createOrderFail,
  myOrdersRequest,
  myOrdersSuccess,
  myOrdersFail,
  orderDetailsRequest,
  orderDetailsSuccess,
  orderDetailsFail,
  clearOrderErrors,
} = orderSlice.actions;

export default orderSlice.reducer;
