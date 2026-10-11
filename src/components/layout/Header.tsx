import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store.ts';
import { ShoppingBag } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-sm border-b border-orange-200/60">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Single text element wordmark */}
        <Link
          to="/"
          className="font-serif-display text-2xl font-bold tracking-tight text-[#D94E1F] whitespace-nowrap shrink-0"
        >
          FoodGenie
        </Link>

        {/* Zone 2: 4 concise single-line text navigation links */}
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
            to={isAuthenticated ? '/users/me' : '/users/login'}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              location.pathname.startsWith('/users')
                ? 'text-stone-950 underline underline-offset-8 decoration-[#D94E1F] decoration-2'
                : 'text-stone-600 hover:text-stone-950 hover:underline hover:underline-offset-8'
            }`}
          >
            {isAuthenticated && user ? user.name.split(' ')[0] : 'Sign In'}
          </Link>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
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
        </div>
      </div>
    </header>
  );
}
