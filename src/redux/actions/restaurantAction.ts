import axios from 'axios';
import { AppDispatch } from '../store.ts';
import {
  allRestaurantsRequest,
  allRestaurantsSuccess,
  restaurantCountSuccess,
} from '../slices/restaurantSlice.ts';
import { initialRestaurants, getAllFoodItemsFlat } from '../../data/seedData.ts';

function filterAndSortLocalRestaurants(
  keyword = '',
  showVegOnly = false,
  sortBy: 'default' | 'ratings' | 'reviews' = 'default'
) {
  let result = [...initialRestaurants];
  if (keyword && keyword.trim() !== '') {
    const q = keyword.toLowerCase().trim();
    const matchingRestIdsFromDishes = new Set(
      getAllFoodItemsFlat()
        .filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q)
        )
        .map((item) => item.restaurant)
    );
    result = result.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q) ||
        r.cuisine.some((c) => c.toLowerCase().includes(q)) ||
        matchingRestIdsFromDishes.has(r._id)
    );
  }

  if (showVegOnly) {
    result = result.filter((r) => r.isVeg);
  }

  if (sortBy === 'ratings') {
    result.sort((a, b) => b.ratings - a.ratings);
  } else if (sortBy === 'reviews') {
    result.sort((a, b) => b.numOfReviews - a.numOfReviews);
  }

  return result;
}

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

      // Verify response is valid JSON array (not an HTML fallback page on static hosts)
      if (listData && Array.isArray(listData.restaurants)) {
        dispatch(
          allRestaurantsSuccess({
            count: listData.count ?? listData.restaurants.length,
            restaurants: listData.restaurants,
          })
        );
        dispatch(
          restaurantCountSuccess({
            count: countData?.count ?? initialRestaurants.length,
            pureVegCount:
              countData?.pureVegCount ??
              initialRestaurants.filter((r) => r.isVeg).length,
          })
        );
      } else {
        const fallbackList = filterAndSortLocalRestaurants(keyword, showVegOnly, sortBy);
        dispatch(
          allRestaurantsSuccess({
            count: fallbackList.length,
            restaurants: fallbackList,
          })
        );
        dispatch(
          restaurantCountSuccess({
            count: initialRestaurants.length,
            pureVegCount: initialRestaurants.filter((r) => r.isVeg).length,
          })
        );
      }
    } catch {
      const fallbackList = filterAndSortLocalRestaurants(keyword, showVegOnly, sortBy);
      dispatch(
        allRestaurantsSuccess({
          count: fallbackList.length,
          restaurants: fallbackList,
        })
      );
      dispatch(
        restaurantCountSuccess({
          count: initialRestaurants.length,
          pureVegCount: initialRestaurants.filter((r) => r.isVeg).length,
        })
      );
    }
  };
