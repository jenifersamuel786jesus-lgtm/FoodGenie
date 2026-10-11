import axios from 'axios';
import { AppDispatch } from '../store.ts';
import {
  fetchCartRequest,
  setCartData,
  fetchCartFail,
  setAppliedCoupon,
  setCouponError,
  clearCartLocal,
} from '../slices/cartSlice.ts';

export const fetchCartItems = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(fetchCartRequest());
    const { data } = await axios.get('/api/v1/eats/cart/get-cart');
    dispatch(
      setCartData({
        items: data.data?.items || [],
        restaurant: data.data?.restaurant || null,
      })
    );
  } catch (error: any) {
    dispatch(fetchCartFail(error.response?.data?.message || 'Failed to load cart'));
  }
};

export const addItemToCart =
  (foodItemId: string, restaurantId: string, quantity = 1) =>
  async (dispatch: AppDispatch) => {
    try {
      const { data } = await axios.post('/api/v1/eats/cart/add-to-cart', {
        foodItemId,
        restaurant: restaurantId,
        quantity,
      });
      dispatch(
        setCartData({
          items: data.data?.items || [],
          restaurant: data.data?.restaurant || null,
        })
      );
    } catch (error: any) {
      dispatch(
        fetchCartFail(error.response?.data?.message || 'Failed to add item to cart')
      );
    }
  };

export const updateCartQuantity =
  (foodItemId: string, quantity: number) => async (dispatch: AppDispatch) => {
    try {
      const { data } = await axios.post('/api/v1/eats/cart/update-cart-item', {
        foodItemId,
        quantity,
      });
      dispatch(
        setCartData({
          items: data.data?.items || [],
          restaurant: data.data?.restaurant || null,
        })
      );
    } catch (error: any) {
      dispatch(fetchCartFail(error.response?.data?.message || 'Failed to update item'));
    }
  };

export const removeItemFromCart =
  (foodItemId: string) => async (dispatch: AppDispatch) => {
    try {
      const { data } = await axios.delete('/api/v1/eats/cart/delete-cart-item', {
        data: { foodItemId },
      });
      dispatch(
        setCartData({
          items: data.data?.items || [],
          restaurant: data.data?.restaurant || null,
        })
      );
    } catch (error: any) {
      dispatch(fetchCartFail(error.response?.data?.message || 'Failed to remove item'));
    }
  };

export const validateCouponCode =
  (code: string, orderAmount: number) => async (dispatch: AppDispatch) => {
    try {
      dispatch(setCouponError(null));
      const { data } = await axios.post('/api/v1/coupons/validate', {
        code,
        orderAmount,
      });
      dispatch(
        setAppliedCoupon({
          code: data.coupon.code,
          discountAmount: data.discountAmount,
          description: data.coupon.description,
        })
      );
      return { success: true, message: data.message };
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Invalid coupon code.';
      dispatch(setCouponError(msg));
      dispatch(setAppliedCoupon(null));
      return { success: false, message: msg };
    }
  };

export const clearCartServer = () => async (dispatch: AppDispatch) => {
  await axios.delete('/api/v1/eats/cart/clear-cart');
  dispatch(clearCartLocal());
};
