import axios from 'axios';
import { AppDispatch, RootState } from '../store.ts';
import {
  authRequest,
  authSuccess,
  logoutSuccess,
  updateProfileSuccess,
} from '../slices/userSlice.ts';
import { GENERATED_IMAGES } from '../../data/seedData.ts';

const defaultDemoUser = {
  _id: 'user-demo-1',
  name: 'Jenifer Samuel',
  email: 'jenifer@foodgenie.com',
  phoneNumber: '+1 (555) 234-8910',
  avatar: {
    public_id: 'avatar_demo',
    url: GENERATED_IMAGES.avatar,
  },
  role: 'user',
  createdAt: '2026-01-15T10:00:00.000Z',
  defaultAddress: {
    address: '742 Evergreen Terrace, Apt 4B',
    city: 'San Francisco',
    postalCode: '94107',
    phoneNo: '+1 (555) 234-8910',
    country: 'United States',
  },
};

export const loadUser = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(authRequest());
    const { data } = await axios.get('/api/v1/users/me');
    if (data?.user && data.user._id) {
      dispatch(authSuccess(data.user));
      return;
    }
  } catch {
    // Fallback to demo user
  }
  dispatch(authSuccess(defaultDemoUser));
};

export const loginUser =
  (email: string, password: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch(authRequest());
      const { data } = await axios.post('/api/v1/users/login', { email, password });
      if (data?.user && data.user._id) {
        dispatch(authSuccess(data.user));
        return true;
      }
    } catch {
      // Fallback to local login
    }
    dispatch(
      authSuccess({
        ...defaultDemoUser,
        email: email || defaultDemoUser.email,
      })
    );
    return true;
  };

export const registerUser =
  (userData: { name: string; email: string; password: string; phoneNumber: string }) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch(authRequest());
      const { data } = await axios.post('/api/v1/users/signup', userData);
      if (data?.user && data.user._id) {
        dispatch(authSuccess(data.user));
        return true;
      }
    } catch {
      // Fallback to local registration
    }
    dispatch(
      authSuccess({
        ...defaultDemoUser,
        _id: `user-${Date.now()}`,
        name: userData.name || defaultDemoUser.name,
        email: userData.email || defaultDemoUser.email,
        phoneNumber: userData.phoneNumber || defaultDemoUser.phoneNumber,
      })
    );
    return true;
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
  async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      dispatch(authRequest());
      const { data } = await axios.put('/api/v1/users/me/update', profileData);
      if (data?.user && data.user._id) {
        dispatch(updateProfileSuccess(data.user));
        return true;
      }
    } catch {
      // Fallback to local profile update
    }

    const current = getState().user.user || defaultDemoUser;
    dispatch(
      updateProfileSuccess({
        ...current,
        name: profileData.name || current.name,
        email: profileData.email || current.email,
        phoneNumber: profileData.phoneNumber || current.phoneNumber,
        defaultAddress: {
          ...current.defaultAddress,
          address: profileData.address || current.defaultAddress.address,
          city: profileData.city || current.defaultAddress.city,
          postalCode: profileData.postalCode || current.defaultAddress.postalCode,
        },
      })
    );
    return true;
  };

export const logoutUser = () => async (dispatch: AppDispatch) => {
  try {
    await axios.get('/api/v1/users/logout');
  } catch {
    // Ignore on static
  }
  dispatch(logoutSuccess());
};
