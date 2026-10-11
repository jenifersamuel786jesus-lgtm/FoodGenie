import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RestaurantItem } from './restaurantSlice.ts';

export interface FoodItem {
  _id: string;
  name: string;
  price: number;
  description: string;
  ratings: number;
  numOfReviews: number;
  images: { public_id: string; url: string }[];
  category: string;
  stock: number;
  isVeg: boolean;
  calories: number;
  prepTime: string;
  restaurant: string;
  restaurantName: string;
}

export interface MenuCategoryGroup {
  category: string;
  items: FoodItem[];
}

export interface StoreMenuDoc {
  _id: string;
  restaurant: string;
  menu: MenuCategoryGroup[];
}

interface MenuState {
  menus: StoreMenuDoc[];
  selectedRestaurant: RestaurantItem | null;
  loading: boolean;
  error: string | null;
}

const initialState: MenuState = {
  menus: [],
  selectedRestaurant: null,
  loading: false,
  error: null,
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    getMenuRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getMenuSuccess(
      state,
      action: PayloadAction<{ menus: StoreMenuDoc[]; restaurant: RestaurantItem }>
    ) {
      state.loading = false;
      state.menus = action.payload.menus;
      state.selectedRestaurant = action.payload.restaurant;
    },
    getMenuFail(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    updateSelectedRestaurant(state, action: PayloadAction<RestaurantItem>) {
      state.selectedRestaurant = action.payload;
    },
  },
});

export const {
  getMenuRequest,
  getMenuSuccess,
  getMenuFail,
  updateSelectedRestaurant,
} = menuSlice.actions;

export default menuSlice.reducer;
