import axios from 'axios';
import { AppDispatch } from '../store.ts';
import {
  createOrderRequest,
  createOrderSuccess,
  createOrderFail,
  myOrdersRequest,
  myOrdersSuccess,
  myOrdersFail,
  orderDetailsRequest,
  orderDetailsSuccess,
  orderDetailsFail,
} from '../slices/orderSlice.ts';
import { clearCartLocal } from '../slices/cartSlice.ts';

export const createOrder = (orderPayload: any) => async (dispatch: AppDispatch) => {
  try {
    dispatch(createOrderRequest());
    const { data } = await axios.post('/api/v1/eats/orders/new', orderPayload);
    dispatch(createOrderSuccess(data.order));
    dispatch(clearCartLocal());
    return data.order;
  } catch (error: any) {
    dispatch(
      createOrderFail(error.response?.data?.message || 'Failed to place order')
    );
    throw error;
  }
};

export const myOrders = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(myOrdersRequest());
    const { data } = await axios.get('/api/v1/eats/orders/me/myOrders');
    dispatch(myOrdersSuccess(data.orders || []));
  } catch (error: any) {
    dispatch(
      myOrdersFail(error.response?.data?.message || 'Failed to fetch orders')
    );
  }
};

export const getOrderDetails = (id: string) => async (dispatch: AppDispatch) => {
  try {
    dispatch(orderDetailsRequest());
    const { data } = await axios.get(`/api/v1/eats/orders/${id}`);
    dispatch(orderDetailsSuccess(data.order));
  } catch (error: any) {
    dispatch(
      orderDetailsFail(error.response?.data?.message || 'Failed to fetch order details')
    );
  }
};
