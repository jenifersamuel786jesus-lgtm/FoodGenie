import axios from 'axios';
import { AppDispatch } from '../store.ts';
import {
  authRequest,
  authSuccess,
  authFail,
  logoutSuccess,
  updateProfileSuccess,
} from '../slices/userSlice.ts';

export const loadUser = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(authRequest());
    const { data } = await axios.get('/api/v1/users/me');
    dispatch(authSuccess(data.user));
  } catch {
    // Silent fallback when not logged in
  }
};

export const loginUser =
  (email: string, password: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch(authRequest());
      const { data } = await axios.post('/api/v1/users/login', { email, password });
      dispatch(authSuccess(data.user));
      return true;
    } catch (error: any) {
      dispatch(authFail(error.response?.data?.message || 'Login failed'));
      return false;
    }
  };

export const registerUser =
  (userData: { name: string; email: string; password: string; phoneNumber: string }) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch(authRequest());
      const { data } = await axios.post('/api/v1/users/signup', userData);
      dispatch(authSuccess(data.user));
      return true;
    } catch (error: any) {
      dispatch(authFail(error.response?.data?.message || 'Registration failed'));
      return false;
    }
  };

export const updateUserProfile =
  (profileData: {
    name: string;
    email: string;
    phoneNumber: string;
    address?: string;
    city?: string;
    postalCode?: string;
  }) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch(authRequest());
      const { data } = await axios.put('/api/v1/users/me/update', profileData);
      dispatch(updateProfileSuccess(data.user));
      return true;
    } catch (error: any) {
      dispatch(authFail(error.response?.data?.message || 'Failed to update profile'));
      return false;
    }
  };

export const logoutUser = () => async (dispatch: AppDispatch) => {
  await axios.get('/api/v1/users/logout');
  dispatch(logoutSuccess());
};
