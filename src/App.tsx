/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './redux/store.ts';
import { loadUser } from './redux/actions/userActions.ts';
import { fetchCartItems } from './redux/actions/cartActions.ts';
import Header from './components/layout/Header.tsx';
import Footer from './components/layout/Footer.tsx';
import Home from './components/Home.tsx';
import Menu from './components/Menu.tsx';
import Cart from './components/cart/Cart.tsx';
import OrderSuccess from './components/cart/OrderSuccess.tsx';
import ListOrders from './components/order/ListOrders.tsx';
import OrderDetails from './components/order/OrderDetails.tsx';
import Login from './components/user/Login.tsx';
import Register from './components/user/Register.tsx';
import Profile from './components/user/Profile.tsx';
import UpdateProfile from './components/user/UpdateProfile.tsx';

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(loadUser());
    dispatch(fetchCartItems());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900">
        <Header />
        <main className="flex-1">
          <Routes>
            {/* If not authenticated, first user starts directly on the Sign-In page alone */}
            <Route
              path="/"
              element={isAuthenticated ? <Home /> : <Login />}
            />
            <Route path="/users/login" element={<Login />} />
            <Route path="/users/signup" element={<Register />} />

            {/* Protected Routes: accessible only once signed in */}
            <Route
              path="/eats/stores/:id/menus"
              element={isAuthenticated ? <Menu /> : <Navigate to="/users/login" replace />}
            />
            <Route
              path="/cart"
              element={isAuthenticated ? <Cart /> : <Navigate to="/users/login" replace />}
            />
            <Route
              path="/success"
              element={isAuthenticated ? <OrderSuccess /> : <Navigate to="/users/login" replace />}
            />
            <Route
              path="/eats/orders/me/myOrders"
              element={isAuthenticated ? <ListOrders /> : <Navigate to="/users/login" replace />}
            />
            <Route
              path="/eats/orders/:id"
              element={isAuthenticated ? <OrderDetails /> : <Navigate to="/users/login" replace />}
            />
            <Route
              path="/users/me"
              element={isAuthenticated ? <Profile /> : <Navigate to="/users/login" replace />}
            />
            <Route
              path="/users/me/update"
              element={isAuthenticated ? <UpdateProfile /> : <Navigate to="/users/login" replace />}
            />

            {/* Catch-all fallback */}
            <Route
              path="*"
              element={<Navigate to={isAuthenticated ? '/' : '/users/login'} replace />}
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
