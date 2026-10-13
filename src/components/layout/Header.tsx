import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store.ts';
import { ShoppingBag, User as UserIcon, LogIn } from 'lucide-react';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.user);

  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.fooditem.price * item.quantity,
    0
  );

  const isActive = (path: string) =>
    location.pathname === path
      ? 'text-stone-950 underline underline-offset-8 decoration-[#D94E1F] decoration-2'
      : 'text-stone-600 hover:text-stone-950 hover:underline hover:underline-offset-8';

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-sm border-b border-orange-200/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-6 py-4">
          {/* Brand Wordmark */}
          <Link
            to={isAuthenticated ? '/' : '/users/login'}
            className="font-serif-display text-2xl font-bold tracking-tight text-[#D94E1F] whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
          >
            FoodGenie
          </Link>

          {/* Navigation Links - ONLY shown when authenticated */}
          {isAuthenticated ? (
            <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
              <Link
                to="/"
                className={`transition-colors whitespace-nowrap shrink-0 ${isActive('/')}`}
              >
                Restaurants
              </Link>
              <a
                href="/#ai-concierge"
                onClick={(e) => {
                  if (location.pathname !== '/') {
                    e.preventDefault();
                    navigate('/#ai-concierge');
                  }
                }}
                className="text-stone-600 hover:text-stone-950 hover:underline hover:underline-offset-8 transition-colors whitespace-nowrap shrink-0"
              >
                Ask FoodGenie
              </a>
              <Link
                to="/eats/orders/me/myOrders"
                className={`transition-colors whitespace-nowrap shrink-0 ${isActive(
                  '/eats/orders/me/myOrders'
                )}`}
              >
                My Orders
              </Link>
              <Link
                to="/users/me"
                className={`inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                  location.pathname.startsWith('/users')
                    ? 'text-stone-950 underline underline-offset-8 decoration-[#D94E1F] decoration-2'
                    : 'text-stone-600 hover:text-stone-950 hover:underline hover:underline-offset-8'
                }`}
              >
                {user?.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover border border-stone-200"
                  />
                ) : (
                  <UserIcon className="w-4 h-4 text-stone-500" />
                )}
                <span>{user ? user.name.split(' ')[0] : 'Profile'}</span>
              </Link>
            </nav>
          ) : (
            <div className="hidden md:flex items-center text-xs text-stone-500 italic">
              Artisanal dining delivered to your doorstep
            </div>
          )}

          {/* Actions & Utilities */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Shopping Bag Button - ONLY shown when authenticated */}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="inline-flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-white bg-[#D94E1F] rounded-lg hover:bg-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="tabular-nums">
                  Bag ({totalCount}) · ${totalAmount.toFixed(2)}
                </span>
              </button>
            ) : (
              <Link
                to="/users/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-[#D94E1F] rounded-lg transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
