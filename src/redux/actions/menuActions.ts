import axios from 'axios';
import { AppDispatch } from '../store.ts';
import {
  getMenuRequest,
  getMenuSuccess,
  getMenuFail,
  updateSelectedRestaurant,
} from '../slices/menuSlice.ts';

export const getMenus = (storeId: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(getMenuRequest());
    const { data } = await axios.get(`/api/v1/eats/stores/${storeId}/menus`);
    dispatch(
      getMenuSuccess({
        menus: data.data.menus,
        restaurant: data.data.restaurant,
      })
    );
  } catch (error: any) {
    dispatch(
      getMenuFail(error.response?.data?.message || 'Failed to load restaurant menu')
    );
  }
};

export const submitRestaurantReview =
  (
    storeId: string,
    reviewPayload: { rating: number; comment: string; dishMentioned?: string; userName?: string }
  ) =>
  async (dispatch: AppDispatch) => {
    const { data } = await axios.post(
      `/api/v1/eats/stores/${storeId}/reviews`,
      reviewPayload
    );
    if (data.restaurant) {
      dispatch(updateSelectedRestaurant(data.restaurant));
    }
    return data;
  };
