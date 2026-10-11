import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../redux/store.ts';
import { updateUserProfile } from '../../redux/actions/userActions.ts';
import { ArrowLeft } from 'lucide-react';

export default function UpdateProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state: RootState) => state.user);

  const [name, setName] = useState(user?.name || 'Jenifer Samuel');
  const [email, setEmail] = useState(user?.email || 'jenifer@foodgenie.com');
  const [phoneNumber, setPhoneNumber] = useState(
    user?.phoneNumber || '+1 (555) 234-8910'
  );
  const [address, setAddress] = useState(
    user?.defaultAddress.address || '742 Evergreen Terrace, Apt 4B'
  );
  const [city, setCity] = useState(
    user?.defaultAddress.city || 'San Francisco'
  );
  const [postalCode, setPostalCode] = useState(
    user?.defaultAddress.postalCode || '94107'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await dispatch(
      updateUserProfile({
        name,
        email,
        phoneNumber,
        address,
        city,
        postalCode,
      })
    );
    if (ok) {
      navigate('/users/me');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <div className="mb-6">
        <Link
          to="/users/me"
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-950"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </Link>
      </div>

      <div className="bg-white border border-stone-200/90 rounded-2xl p-8 space-y-6">
        <div>
          <h1 className="font-serif-display text-2xl font-bold text-stone-950">
            Update Diner Profile & Address
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Changes sync immediately with your active checkout delivery details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:bg-white focus:border-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:bg-white focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:bg-white focus:border-stone-900 tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Default Delivery Street Address
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:bg-white focus:border-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                City
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:bg-white focus:border-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:bg-white focus:border-stone-900 tabular-nums"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-stone-900 hover:bg-amber-800 rounded-lg transition-colors cursor-pointer"
          >
            {loading ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
