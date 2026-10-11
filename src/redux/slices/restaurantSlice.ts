import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialRestaurants } from '../../data/seedData.ts';

export interface ReviewItem {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  dishMentioned?: string;
}

export interface RestaurantItem {
  _id: string;
  name: string;
  isVeg: boolean;
  address: string;
  ratings: number;
  numOfReviews: number;
  deliveryTime: string;
  priceForTwo: number;
  cuisine: string[];
  images: { public_id: string; url: string }[];
  reviews: ReviewItem[];
}

interface RestaurantState {
  restaurants: RestaurantItem[];
  loading: boolean;
  error: string | null;
  count: number;
  pureVegCount: number;
  showVegOnly: boolean;
  sortBy: 'default' | 'ratings' | 'reviews';
  searchKeyword: string;
}

const initialState: RestaurantState = {
  restaurants: initialRestaurants,
  loading: false,
  error: null,
  count: initialRestaurants.length,
  pureVegCount: initialRestaurants.filter((r) => r.isVeg).length,
  showVegOnly: false,
  sortBy: 'default',
  searchKeyword: '',
};

const restaurantSlice = createSlice({
  name: 'restaurants',
  initialState,
  reducers: {
    allRestaurantsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    allRestaurantsSuccess(
      state,
      action: PayloadAction<{ count: number; restaurants: RestaurantItem[] }>
    ) {
      state.loading = false;
      const list = Array.isArray(action.payload?.restaurants)
        ? action.payload.restaurants
        : initialRestaurants;
      state.restaurants = list;
      state.count =
        typeof action.payload?.count === 'number' ? action.payload.count : list.length;
    },
    allRestaurantsFail(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      if (!Array.isArray(state.restaurants)) {
        state.restaurants = initialRestaurants;
      }
    },
    restaurantCountSuccess(
      state,
      action: PayloadAction<{ count: number; pureVegCount: number }>
    ) {
      if (typeof action.payload?.count === 'number') {
        state.count = action.payload.count;
      }
      if (typeof action.payload?.pureVegCount === 'number') {
        state.pureVegCount = action.payload.pureVegCount;
      }
    },
    toggleVegOnly(state) {
      state.showVegOnly = !state.showVegOnly;
    },
    setVegOnly(state, action: PayloadAction<boolean>) {
      state.showVegOnly = action.payload;
    },
    setSortBy(state, action: PayloadAction<'default' | 'ratings' | 'reviews'>) {
      state.sortBy = action.payload;
    },
    setSearchKeyword(state, action: PayloadAction<string>) {
      state.searchKeyword = action.payload;
    },
    clearErrors(state) {
      state.error = null;
    },
  },
});

export const {
  allRestaurantsRequest,
  allRestaurantsSuccess,
  allRestaurantsFail,
  restaurantCountSuccess,
  toggleVegOnly,
  setVegOnly,
  setSortBy,
  setSearchKeyword,
  clearErrors,
} = restaurantSlice.actions;

export default restaurantSlice.reducer;
