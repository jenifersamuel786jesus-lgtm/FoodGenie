import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
  restaurants: [],
  loading: false,
  error: null,
  count: 0,
  pureVegCount: 0,
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
      state.count = action.payload.count;
      state.restaurants = action.payload.restaurants;
    },
    allRestaurantsFail(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    restaurantCountSuccess(
      state,
      action: PayloadAction<{ count: number; pureVegCount: number }>
    ) {
      state.count = action.payload.count;
      state.pureVegCount = action.payload.pureVegCount;
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
