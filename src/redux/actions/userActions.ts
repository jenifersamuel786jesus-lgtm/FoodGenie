import axios from 'axios';
import { AppDispatch, RootState } from '../store.ts';
import {
  authRequest,
  authSuccess,
  logoutSuccess,
  updateProfileSuccess,
} from '../slices/userSlice.ts';
import { clearCartLocal } from '../slices/cartSlice.ts';
import { GENERATED_IMAGES } from '../../data/seedData.ts';
import { sanitizeEmail, sanitizeInput, sanitizePhone } from '../../utils/security.ts';

export const SESSION_STORAGE_KEY = 'foodgenie_user_session';

export const defaultDemoUser = {
  _id: '',
  name: '',
  email: '',
  phoneNumber: '',
  avatar: {
    public_id: 'avatar_default',
    url: GENERATED_IMAGES.avatar,
  },
  role: 'user',
  createdAt: new Date().toISOString(),
  defaultAddress: {
    address: '',
    city: '',
    postalCode: '',
    phoneNo: '',
    country: '',
  },
};

/**
 * Loads the active user session.
 * For a first-time user (no session stored in localStorage), does NOT ask or auto-login.
 * Once a person has logged in, remembers their session until they explicitly sign out.
 */
export const loadUser = () => async (dispatch: AppDispatch) => {
  try {
    const rawSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!rawSession) {
      // First-time user: keep unauthenticated so they start on the Sign-in page alone
      dispatch(logoutSuccess());
      return;
    }

    const cachedUser = JSON.parse(rawSession);
    if (!cachedUser || !cachedUser._id) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      dispatch(logoutSuccess());
      return;
    }

    // Immediately restore cached session so UI is fast without flashing
    dispatch(authSuccess(cachedUser));

    // Synchronize with server in background
    try {
      const { data } = await axios.get('/api/v1/users/me', {
        headers: { 'x-user-email': cachedUser.email },
      });
      if (data?.user && data.user._id) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data.user));
        dispatch(authSuccess(data.user));
      }
    } catch {
      // Offline / fallback to cached session
    }
  } catch (err) {
    console.warn('Session load warning:', err);
    dispatch(logoutSuccess());
  }
};

/**
 * Signs in a user and permanently remembers their session until sign out
 */
export const loginUser =
  (email: string, password: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch(authRequest());
      const cleanEmail = sanitizeEmail(email);
      const cleanPassword = sanitizeInput(password, 100);

      const { data } = await axios.post('/api/v1/users/login', {
        email: cleanEmail,
        password: cleanPassword,
      });

      if (data?.user && data.user._id) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data.user));
        dispatch(authSuccess(data.user));
        return true;
      }
    } catch {
      // Fallback local sign-in
    }

    const cleanMail = sanitizeEmail(email);
    const rawName = cleanMail.split('@')[0].replace(/[._]/g, ' ') || 'Foodie Member';
    const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    const fallbackUser = {
      _id: `user-${Date.now()}`,
      name: formattedName,
      email: cleanMail,
      phoneNumber: '',
      avatar: {
        public_id: 'avatar_user',
        url: GENERATED_IMAGES.avatar,
      },
      role: 'user',
      createdAt: new Date().toISOString(),
      defaultAddress: {
        address: '',
        city: '',
        postalCode: '',
        phoneNo: '',
        country: '',
      },
    };
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(fallbackUser));
    } catch (err: any) {
      console.warn('[Session Warning] LocalStorage unavailable:', err.message);
    }
    dispatch(authSuccess(fallbackUser));
    return true;
  };

/**
 * Registers a new diner account and saves session
 */
export const registerUser =
  (userData: { name: string; email: string; password: string; phoneNumber: string }) =>
  async (dispatch: AppDispatch) => {
    try {
      dispatch(authRequest());
      const cleanData = {
        name: sanitizeInput(userData.name, 60),
        email: sanitizeEmail(userData.email),
        phoneNumber: sanitizePhone(userData.phoneNumber),
        password: sanitizeInput(userData.password, 100),
      };

      const { data } = await axios.post('/api/v1/users/signup', cleanData);
      if (data?.user && data.user._id) {
        try {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data.user));
        } catch (err: any) {
          console.warn('[Session Warning] LocalStorage quota exceeded:', err.message);
        }
        dispatch(authSuccess(data.user));
        return true;
      }
    } catch {
      // Fallback local registration
    }

    const newUser = {
      _id: `user-${Date.now()}`,
      name: sanitizeInput(userData.name, 60) || 'Foodie Member',
      email: sanitizeEmail(userData.email),
      phoneNumber: sanitizePhone(userData.phoneNumber) || '',
      avatar: {
        public_id: 'avatar_user',
        url: GENERATED_IMAGES.avatar,
      },
      role: 'user',
      createdAt: new Date().toISOString(),
      defaultAddress: {
        address: '',
        city: '',
        postalCode: '',
        phoneNo: sanitizePhone(userData.phoneNumber) || '',
        country: '',
      },
    };
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUser));
    } catch (err: any) {
      console.warn('[Session Warning] LocalStorage unavailable:', err.message);
    }
    dispatch(authSuccess(newUser));
    return true;
  };

/**
 * Updates profile details including avatar image
 */
export const updateUserProfile =
  (profileData: {
    name: string;
    email: string;
    phoneNumber: string;
    address?: string;
    city?: string;
    postalCode?: string;
    avatar?: { public_id: string; url: string } | string;
  }) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const current = getState().user.user || defaultDemoUser;
    try {
      dispatch(authRequest());

      const cleanData: any = {
        name: sanitizeInput(profileData.name, 60),
        email: sanitizeEmail(profileData.email),
        phoneNumber: sanitizePhone(profileData.phoneNumber),
        address: profileData.address ? sanitizeInput(profileData.address, 120) : undefined,
        city: profileData.city ? sanitizeInput(profileData.city, 60) : undefined,
        postalCode: profileData.postalCode ? sanitizeInput(profileData.postalCode, 20) : undefined,
      };

      if (profileData.avatar) {
        cleanData.avatar = profileData.avatar;
      }

      const activeEmail = cleanData.email || current.email;

      const { data } = await axios.put('/api/v1/users/me/update', cleanData, {
        headers: {
          'x-user-email': activeEmail,
        },
      });

      if (data?.user && data.user._id) {
        try {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data.user));
        } catch (storageErr) {
          console.warn('[LocalStorage] Quota warning while caching profile:', storageErr);
        }
        dispatch(updateProfileSuccess(data.user));
        return true;
      }
    } catch {
      // Fallback local update
    }

    let newAvatar = current.avatar;
    if (profileData.avatar) {
      if (typeof profileData.avatar === 'string') {
        newAvatar = { public_id: 'avatar_custom', url: profileData.avatar };
      } else if (profileData.avatar.url) {
        newAvatar = profileData.avatar;
      }
    }

    const updated = {
      ...current,
      name: sanitizeInput(profileData.name, 60) || current.name,
      email: sanitizeEmail(profileData.email) || current.email,
      phoneNumber: sanitizePhone(profileData.phoneNumber) || current.phoneNumber,
      avatar: newAvatar,
      defaultAddress: {
        ...current.defaultAddress,
        address: profileData.address ? sanitizeInput(profileData.address, 120) : current.defaultAddress?.address || '',
        city: profileData.city ? sanitizeInput(profileData.city, 60) : current.defaultAddress?.city || '',
        postalCode: profileData.postalCode ? sanitizeInput(profileData.postalCode, 20) : current.defaultAddress?.postalCode || '',
      },
    };

    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
    } catch (storageErr) {
      console.warn('[LocalStorage] Quota warning in fallback profile:', storageErr);
    }
    dispatch(updateProfileSuccess(updated));
    return true;
  };

/**
 * Signs out and removes stored session permanently
 */
export const logoutUser = () => async (dispatch: AppDispatch) => {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    await axios.get('/api/v1/users/logout');
  } catch {
    // Ignore error
  }
  dispatch(logoutSuccess());
  dispatch(clearCartLocal());
};
