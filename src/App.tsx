/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from './redux/store.ts';
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
            <Route path="/" element={<Home />} />
            <Route path="/eats/stores/:id/menus" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/success" element={<OrderSuccess />} />
            <Route path="/eats/orders/me/myOrders" element={<ListOrders />} />
            <Route path="/eats/orders/:id" element={<OrderDetails />} />
            <Route path="/users/login" element={<Login />} />
            <Route path="/users/signup" element={<Register />} />
            <Route path="/users/me" element={<Profile />} />
            <Route path="/users/me/update" element={<UpdateProfile />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
