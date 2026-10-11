import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../redux/store.ts';
import { logoutUser } from '../../redux/actions/userActions.ts';

export default function Profile() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <div className="bg-white border border-stone-200 rounded-2xl p-8 space-y-4">
          <h1 className="font-serif-display text-2xl font-bold text-stone-950">
            Please sign in to view your profile
          </h1>
          <Link
            to="/users/login"
            className="inline-block px-5 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-amber-800 rounded-lg transition-colors"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/users/login');
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="bg-white border border-stone-200/90 rounded-2xl p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-stone-200">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar?.url}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full object-cover border border-stone-200 bg-stone-100"
            />
            <div>
              <p className="text-xs text-stone-500">
                Verified Diner · Joined{' '}
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <h1 className="font-serif-display text-2xl font-bold text-stone-950">
                {user.name}
              </h1>
              <p className="text-xs text-stone-600">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/users/me/update"
              className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-amber-800 rounded-lg transition-colors whitespace-nowrap"
            >
              Edit Profile
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-xs font-semibold text-stone-500 mb-1">
              Contact Phone
            </p>
            <p className="font-medium text-stone-900 tabular-nums">
              {user.phoneNumber}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-stone-500 mb-1">
              Saved Delivery Address
            </p>
            <p className="font-medium text-stone-900">
              {user.defaultAddress.address}, {user.defaultAddress.city}{' '}
              {user.defaultAddress.postalCode}
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/eats/orders/me/myOrders"
            className="text-xs font-semibold text-stone-900 hover:text-amber-800 underline underline-offset-4"
          >
            View My Order History →
          </Link>
          <Link
            to="/cart"
            className="text-xs font-semibold text-stone-900 hover:text-amber-800 underline underline-offset-4"
          >
            Go to Active Bag →
          </Link>
        </div>
      </div>
    </div>
  );
}
