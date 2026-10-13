import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DeliveryAddressInfo } from './cartSlice.ts';
import { GENERATED_IMAGES } from '../../data/seedData.ts';

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

const seededOrders: OrderData[] = [
  {
    _id: 'ORD-89421',
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
    deliveryInfo: {
      address: '742 Evergreen Terrace, Apt 4B',
      city: 'San Francisco',
      postalCode: '94107',
      phoneNo: '+1 (555) 234-8910',
      country: 'United States',
    },
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
    deliveryInfo: {
      address: '742 Evergreen Terrace, Apt 4B',
      city: 'San Francisco',
      postalCode: '94107',
      phoneNo: '+1 (555) 234-8910',
      country: 'United States',
    },
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
      if (!Array.isArray(state.orders)) {
        state.orders = [...seededOrders];
      }
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
      state.orders = Array.isArray(action.payload) ? action.payload : seededOrders;
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
