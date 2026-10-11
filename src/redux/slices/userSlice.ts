import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DeliveryAddressInfo } from './cartSlice.ts';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  avatar: { public_id: string; url: string };
  role: string;
  createdAt: string;
  defaultAddress: DeliveryAddressInfo;
}

interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isUpdated: boolean;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  isUpdated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    authRequest(state) {
      state.loading = true;
      state.error = null;
    },
    authSuccess(state, action: PayloadAction<UserProfile>) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
    authFail(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    logoutSuccess(state) {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
    },
    updateProfileSuccess(state, action: PayloadAction<UserProfile>) {
      state.loading = false;
      state.user = action.payload;
      state.isUpdated = true;
    },
    resetUpdateStatus(state) {
      state.isUpdated = false;
    },
    clearUserErrors(state) {
      state.error = null;
    },
  },
});

export const {
  authRequest,
  authSuccess,
  authFail,
  logoutSuccess,
  updateProfileSuccess,
  resetUpdateStatus,
  clearUserErrors,
} = userSlice.actions;

export default userSlice.reducer;
