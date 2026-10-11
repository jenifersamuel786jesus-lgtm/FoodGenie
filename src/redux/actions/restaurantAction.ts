import axios from 'axios';
import { AppDispatch } from '../store.ts';
import {
  allRestaurantsRequest,
  allRestaurantsSuccess,
  allRestaurantsFail,
  restaurantCountSuccess,
} from '../slices/restaurantSlice.ts';

export const getRestaurants =
  (keyword = '', showVegOnly = false, sortBy: 'default' | 'ratings' | 'reviews' = 'default') =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch(allRestaurantsRequest());
      const params = new URLSearchParams();
      if (keyword.trim()) params.set('keyword', keyword.trim());
      if (showVegOnly) params.set('isVeg', 'true');
      if (sortBy === 'ratings') params.set('sortByRatings', 'true');
      if (sortBy === 'reviews') params.set('sortByReviews', 'true');

      const [{ data: listData }, { data: countData }] = await Promise.all([
        axios.get(`/api/v1/eats/stores?${params.toString()}`),
        axios.get('/api/v1/eats/stores/count'),
      ]);

      dispatch(
        allRestaurantsSuccess({
          count: listData.count,
          restaurants: listData.restaurants,
        })
      );
      dispatch(
        restaurantCountSuccess({
          count: countData.count,
          pureVegCount: countData.pureVegCount,
        })
      );
    } catch (error: any) {
      dispatch(
        allRestaurantsFail(
          error.response?.data?.message || 'Unable to load restaurants'
        )
      );
    }
  };
