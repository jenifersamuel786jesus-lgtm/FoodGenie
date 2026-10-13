import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../redux/store.ts';
import { logoutUser, updateUserProfile } from '../../redux/actions/userActions.ts';
import { Camera, CheckCircle2, User, LogOut, Edit3, ArrowRight, ShieldCheck } from 'lucide-react';
import AvatarEditorModal from './AvatarEditorModal.tsx';

export default function Profile() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user);

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <div className="bg-white border border-stone-200 rounded-2xl p-8 space-y-4">
          <h1 className="font-serif-display text-2xl font-bold text-stone-950">
            Please sign in to view your profile
          </h1>
          <Link
            to="/users/login"
            className="inline-block px-5 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-[#D94E1F] rounded-lg transition-colors"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/users/login', { replace: true });
  };

  const handleSaveAvatar = async (newUrl: string) => {
    const ok = await dispatch(
      updateUserProfile({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.defaultAddress?.address || '',
        city: user.defaultAddress?.city || '',
        postalCode: user.defaultAddress?.postalCode || '',
        avatar: {
          public_id: 'avatar_custom',
          url: newUrl,
        },
      })
    );

    if (ok) {
      setSaveFeedback('Profile picture updated successfully!');
      setTimeout(() => setSaveFeedback(null), 4000);
    }
  };

  return (
    <>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white border border-stone-200/90 rounded-2xl p-8 space-y-8 shadow-sm">
          {saveFeedback && (
            <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveFeedback}</span>
            </div>
          )}

          {/* Profile Header & Avatar Editing Zone */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-stone-200">
            <div className="flex items-center gap-5">
              {/* Interactive Avatar with Edit Trigger */}
              <div className="relative group shrink-0">
                <img
                  src={user.avatar?.url}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-full object-cover border-2 border-orange-200/80 bg-stone-100 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  title="Click to edit profile picture"
                  className="absolute inset-0 rounded-full bg-stone-950/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-semibold transition-opacity cursor-pointer backdrop-blur-2xs"
                >
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span>Change</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  title="Change photo"
                  className="sm:hidden absolute -bottom-1 -right-1 p-1.5 bg-[#D94E1F] text-white rounded-full shadow-md cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                  <span>Verified Diner</span>
                  <span>·</span>
                  <span>
                    Joined{' '}
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <h1 className="font-serif-display text-2xl md:text-3xl font-bold text-stone-950">
                  {user.name}
                </h1>
                <p className="text-xs text-stone-600">{user.email}</p>
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#D94E1F] hover:text-stone-900 font-semibold mt-1 cursor-pointer transition-colors"
                >
                  <Camera className="w-3 h-3" />
                  <span>Edit Profile Picture</span>
                </button>
              </div>
            </div>

            {/* Actions: Edit Profile & Sign Out */}
            <div className="flex items-center gap-3">
              <Link
                to="/users/me/update"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-[#D94E1F] rounded-lg transition-colors whitespace-nowrap shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-stone-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Diner Contact & Address Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="bg-stone-50/70 border border-stone-200/70 rounded-xl p-4 space-y-1">
              <p className="text-xs font-semibold text-stone-500">Contact Phone</p>
              <p className="font-medium text-stone-900 tabular-nums">
                {user.phoneNumber}
              </p>
            </div>

            <div className="bg-stone-50/70 border border-stone-200/70 rounded-xl p-4 space-y-1">
              <p className="text-xs font-semibold text-stone-500">
                Saved Delivery Address
              </p>
              <p className="font-medium text-stone-900">
                {user.defaultAddress?.address ? (
                  `${user.defaultAddress.address}, ${user.defaultAddress.city || ''} ${user.defaultAddress.postalCode || ''}`.trim()
                ) : (
                  <span className="text-stone-400 font-normal italic">No saved address yet</span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Navigation Footer */}
          <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/eats/orders/me/myOrders"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-900 hover:text-[#D94E1F] transition-colors"
            >
              <span>View My Order History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/cart"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-900 hover:text-[#D94E1F] transition-colors"
            >
              <span>Active Food Bag</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-stone-400 pt-2 border-t border-stone-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Profile and address changes sync with your database store</span>
          </div>
        </div>
      </div>

      {/* Profile Picture Modal */}
      <AvatarEditorModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatarUrl={user.avatar?.url || ''}
        onSaveAvatar={handleSaveAvatar}
      />
    </>
  );
}
