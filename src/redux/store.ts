import { configureStore } from '@reduxjs/toolkit';
import restaurantReducer from './slices/restaurantSlice.ts';
import menuReducer from './slices/menuSlice.ts';
import cartReducer from './slices/cartSlice.ts';
import orderReducer from './slices/orderSlice.ts';
import userReducer from './slices/userSlice.ts';

export const store = configureStore({
  reducer: {
    restaurants: restaurantReducer,
    menu: menuReducer,
    cart: cartReducer,
    order: orderReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
