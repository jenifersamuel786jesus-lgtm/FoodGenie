import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../redux/store.ts';
import { loginUser } from '../../redux/actions/userActions.ts';
import Message from '../Message.tsx';
import { sanitizeEmail, sanitizeInput, containsHtml } from '../../utils/security.ts';
import { Sparkles, ShieldCheck, Lock } from 'lucide-react';

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.user);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // If already logged in, redirect straight to restaurants feed
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (containsHtml(email)) {
      setValidationError('Email cannot contain HTML tags (e.g. <h1>test</h1>) or angle brackets.');
      return;
    }
    if (containsHtml(password)) {
      setValidationError('Password cannot contain HTML tags or angle brackets.');
      return;
    }

    const cleanEmail = sanitizeEmail(email);
    const cleanPassword = sanitizeInput(password, 100);

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    if (!cleanPassword) {
      setValidationError('Please enter your password.');
      return;
    }

    const ok = await dispatch(loginUser(cleanEmail, cleanPassword));
    if (ok) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-14">
      <div className="bg-white border border-stone-200/90 rounded-2xl p-8 space-y-6 shadow-sm">
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[11px] font-semibold text-[#D94E1F] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to FoodGenie</span>
          </div>
          <h1 className="font-serif-display text-3xl font-bold text-stone-950">
            Sign In to Dine
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Access curated menus, chef specials, and order tracking.
          </p>
        </div>

        {validationError && <Message variant="danger">{validationError}</Message>}
        {error && <Message variant="danger">{error}</Message>}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-stone-700">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:bg-white focus:border-stone-900"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-stone-900 hover:bg-[#D94E1F] rounded-lg transition-colors cursor-pointer"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
          <span>New to FoodGenie?</span>
          <Link
            to="/users/signup"
            className="font-semibold text-[#D94E1F] hover:text-stone-900 underline underline-offset-4"
          >
            Create an Account
          </Link>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sessions securely preserved until you sign out</span>
        </div>
      </div>
    </div>
  );
}
