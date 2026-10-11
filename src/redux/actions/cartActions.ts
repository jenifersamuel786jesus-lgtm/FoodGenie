import axios from 'axios';
import { AppDispatch, RootState } from '../store.ts';
import {
  setCartData,
  setAppliedCoupon,
  setCouponError,
  clearCartLocal,
} from '../slices/cartSlice.ts';
import {
  initialRestaurants,
  initialMenus,
  initialCoupons,
  getAllFoodItemsFlat,
} from '../../data/seedData.ts';

export const fetchCartItems = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    const { data } = await axios.get('/api/v1/eats/cart/get-cart');
    if (data?.data && Array.isArray(data.data.items)) {
      dispatch(
        setCartData({
          items: data.data.items,
          restaurant: data.data.restaurant || null,
        })
      );
      return;
    }
  } catch {
    // Use existing or default seeded cart
  }

  const current = getState().cart;
  if (!Array.isArray(current.cartItems) || current.cartItems.length === 0) {
    dispatch(
      setCartData({
        items: [
          { fooditem: initialMenus[0].menu[0].items[0], quantity: 1 },
          { fooditem: initialMenus[0].menu[1].items[0], quantity: 1 },
        ],
        restaurant: initialRestaurants[0],
      })
    );
  }
};

export const addItemToCart =
  (foodItemId: string, restaurantId: string, quantity = 1) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const { data } = await axios.post('/api/v1/eats/cart/add-to-cart', {
        foodItemId,
        restaurant: restaurantId,
        quantity,
      });
      if (data?.data && Array.isArray(data.data.items)) {
        dispatch(
          setCartData({
            items: data.data.items,
            restaurant: data.data.restaurant || null,
          })
        );
        return;
      }
    } catch {
      // Client-side fallback below
    }

    const allItems = getAllFoodItemsFlat();
    const targetItem = allItems.find((i) => i._id === foodItemId);
    if (!targetItem) return;

    const targetRestaurant =
      initialRestaurants.find((r) => r._id === (restaurantId || targetItem.restaurant)) ||
      null;
    const state = getState().cart;
    const currentItems = Array.isArray(state.cartItems) ? [...state.cartItems] : [];

    if (
      state.restaurant &&
      targetRestaurant &&
      state.restaurant._id !== targetRestaurant._id
    ) {
      dispatch(
        setCartData({
          items: [{ fooditem: targetItem, quantity: Number(quantity) }],
          restaurant: targetRestaurant,
        })
      );
    } else {
      const idx = currentItems.findIndex((e) => e.fooditem._id === foodItemId);
      if (idx >= 0) {
        currentItems[idx] = {
          ...currentItems[idx],
          quantity: Number(quantity),
        };
      } else {
        currentItems.push({ fooditem: targetItem, quantity: Number(quantity) });
      }
      dispatch(
        setCartData({
          items: currentItems,
          restaurant: targetRestaurant || state.restaurant,
        })
      );
    }
  };

export const updateCartQuantity =
  (foodItemId: string, quantity: number) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const { data } = await axios.post('/api/v1/eats/cart/update-cart-item', {
        foodItemId,
        quantity,
      });
      if (data?.data && Array.isArray(data.data.items)) {
        dispatch(
          setCartData({
            items: data.data.items,
            restaurant: data.data.restaurant || null,
          })
        );
        return;
      }
    } catch {
      // Client-side fallback below
    }

    const state = getState().cart;
    const qty = Number(quantity);
    const updated = (state.cartItems || [])
      .map((entry) =>
        entry.fooditem._id === foodItemId ? { ...entry, quantity: qty } : entry
      )
      .filter((entry) => entry.quantity > 0);

    dispatch(
      setCartData({
        items: updated,
        restaurant: updated.length > 0 ? state.restaurant : null,
      })
    );
  };

export const removeItemFromCart =
  (foodItemId: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const { data } = await axios.delete('/api/v1/eats/cart/delete-cart-item', {
        data: { foodItemId },
      });
      if (data?.data && Array.isArray(data.data.items)) {
        dispatch(
          setCartData({
            items: data.data.items,
            restaurant: data.data.restaurant || null,
          })
        );
        return;
      }
    } catch {
      // Client-side fallback below
    }

    const state = getState().cart;
    const updated = (state.cartItems || []).filter(
      (entry) => entry.fooditem._id !== foodItemId
    );
    dispatch(
      setCartData({
        items: updated,
        restaurant: updated.length > 0 ? state.restaurant : null,
      })
    );
  };

export const validateCouponCode =
  (code: string, orderAmount: number) => async (dispatch: AppDispatch) => {
    const normalized = String(code || '').trim().toUpperCase();
    try {
      dispatch(setCouponError(null));
      const { data } = await axios.post('/api/v1/coupons/validate', {
        code: normalized,
        orderAmount,
      });
      if (data && typeof data === 'object' && data.coupon) {
        dispatch(
          setAppliedCoupon({
            code: data.coupon.code,
            discountAmount: data.discountAmount,
            description: data.coupon.description,
          })
        );
        return { success: true, message: data.message };
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        const msg = error.response.data.message;
        dispatch(setCouponError(msg));
        dispatch(setAppliedCoupon(null));
        return { success: false, message: msg };
      }
    }

    // Local coupon validation fallback
    const coupon = initialCoupons.find((c) => c.code === normalized && c.isActive);
    if (!coupon) {
      const msg = `Coupon "${normalized}" is not valid or has expired.`;
      dispatch(setCouponError(msg));
      dispatch(setAppliedCoupon(null));
      return { success: false, message: msg };
    }
    if (orderAmount < coupon.minOrderAmount) {
      const msg = `Minimum item subtotal of $${coupon.minOrderAmount} required for ${coupon.code}.`;
      dispatch(setCouponError(msg));
      dispatch(setAppliedCoupon(null));
      return { success: false, message: msg };
    }

    const discountAmount =
      coupon.discountType === 'PERCENTAGE'
        ? Math.min(
            Number(((orderAmount * coupon.discountValue) / 100).toFixed(2)),
            coupon.maxDiscount
          )
        : Math.min(coupon.discountValue, orderAmount);

    dispatch(
      setAppliedCoupon({
        code: coupon.code,
        discountAmount,
        description: coupon.description,
      })
    );
    return {
      success: true,
      message: `${coupon.code} applied! You saved $${discountAmount.toFixed(2)}.`,
    };
  };

export const clearCartServer = () => async (dispatch: AppDispatch) => {
  try {
    await axios.delete('/api/v1/eats/cart/clear-cart');
  } catch {
    // Ignore if static
  }
  dispatch(clearCartLocal());
};
