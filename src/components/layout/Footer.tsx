import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-orange-200/60 bg-[#F7F2E9] mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <p className="font-serif-display text-xl font-bold text-[#D94E1F]">
            FoodGenie
          </p>
          <p className="text-sm text-stone-600 mt-1 max-w-md">
            Your smart food delivery genie—connecting you to local wood-fired kitchens, burger grills, and healthy bowls in minutes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm text-stone-600">
          <Link to="/" className="hover:text-stone-950 transition-colors whitespace-nowrap">
            Restaurants
          </Link>
          <Link to="/cart" className="hover:text-stone-950 transition-colors whitespace-nowrap">
            Checkout Bag
          </Link>
          <Link
            to="/eats/orders/me/myOrders"
            className="hover:text-stone-950 transition-colors whitespace-nowrap"
          >
            Order History
          </Link>
          <Link to="/users/me" className="hover:text-stone-950 transition-colors whitespace-nowrap">
            My Profile
          </Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-4 border-t border-stone-200/60 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500">
        <p>© 2026 FoodGenie Delivery. All rights reserved.</p>
        <p>Freshly prepared upon order · Smart AI dish recommendations</p>
      </div>
    </footer>
  );
}
