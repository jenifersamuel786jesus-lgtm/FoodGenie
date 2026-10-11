import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../redux/store.ts';
import { registerUser } from '../../redux/actions/userActions.ts';
import Message from '../Message.tsx';

export default function Register() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.user);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await dispatch(
      registerUser({ name, email, phoneNumber, password })
    );
    if (ok) {
      navigate('/users/me');
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-14">
      <div className="bg-white border border-stone-200/90 rounded-2xl p-8 space-y-6">
        <div>
          <p className="text-xs font-semibold text-[#D94E1F]">
            Join FoodGenie
          </p>
          <h1 className="font-serif-display text-3xl font-bold text-stone-950 mt-1">
            Create Diner Profile
          </h1>
        </div>

        {error && <Message variant="danger">{error}</Message>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Jenifer Samuel"
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:bg-white focus:border-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:bg-white focus:border-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Mobile Number
            </label>
            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 234-5678"
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:bg-white focus:border-stone-900 tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:bg-white focus:border-stone-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-stone-900 hover:bg-amber-800 rounded-lg transition-colors cursor-pointer"
          >
            {loading ? 'Creating Profile...' : 'Register Account'}
          </button>
        </form>

        <div className="pt-4 border-t border-stone-100 text-xs text-stone-600 text-center">
          Already have an account?{' '}
          <Link
            to="/users/login"
            className="font-semibold text-stone-900 hover:text-amber-800 underline underline-offset-4"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
