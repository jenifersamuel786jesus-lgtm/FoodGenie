import axios from 'axios';
import { AppDispatch, RootState } from '../store.ts';
import {
  getMenuRequest,
  getMenuSuccess,
  updateSelectedRestaurant,
} from '../slices/menuSlice.ts';
import { initialRestaurants, initialMenus } from '../../data/seedData.ts';

export const getMenus = (storeId: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(getMenuRequest());
    const { data } = await axios.get(`/api/v1/eats/stores/${storeId}/menus`);
    if (data?.data?.menus && Array.isArray(data.data.menus) && data.data.restaurant) {
      dispatch(
        getMenuSuccess({
          menus: data.data.menus,
          restaurant: data.data.restaurant,
        })
      );
      return;
    }
  } catch {
    // Fallback to local seed data below
  }

  const restaurant =
    initialRestaurants.find((r) => r._id === storeId) || initialRestaurants[0];
  const storeMenu =
    initialMenus.find((m) => m.restaurant === storeId) || initialMenus[0];

  dispatch(
    getMenuSuccess({
      menus: [storeMenu],
      restaurant,
    })
  );
};

export const submitRestaurantReview =
  (
    storeId: string,
    reviewPayload: {
      rating: number;
      comment: string;
      dishMentioned?: string;
      userName?: string;
    }
  ) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const { data } = await axios.post(
        `/api/v1/eats/stores/${storeId}/reviews`,
        reviewPayload
      );
      if (data?.restaurant && Array.isArray(data.restaurant.reviews)) {
        dispatch(updateSelectedRestaurant(data.restaurant));
        return data;
      }
    } catch {
      // Fallback to local state update below
    }

    const currentRest =
      getState().menu.selectedRestaurant ||
      initialRestaurants.find((r) => r._id === storeId) ||
      initialRestaurants[0];

    const newReview = {
      _id: `rev-${Date.now()}`,
      userName: reviewPayload.userName || 'Verified Diner',
      rating: Number(reviewPayload.rating) || 5,
      comment: reviewPayload.comment,
      createdAt: new Date().toISOString().split('T')[0],
      dishMentioned: reviewPayload.dishMentioned,
    };

    const updatedReviews = [newReview, ...(currentRest.reviews || [])];
    const avg =
      updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;

    const updatedRestaurant = {
      ...currentRest,
      reviews: updatedReviews,
      numOfReviews: currentRest.numOfReviews + 1,
      ratings: Number(avg.toFixed(1)),
    };

    dispatch(updateSelectedRestaurant(updatedRestaurant));
    return { status: 'success', review: newReview, restaurant: updatedRestaurant };
  };
