import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../redux/store.ts';
import { registerUser } from '../../redux/actions/userActions.ts';
import Message from '../Message.tsx';
import { sanitizeEmail, sanitizeInput, sanitizePhone, containsHtml } from '../../utils/security.ts';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function Register() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.user);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // If already logged in, redirect to restaurants feed
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Explicitly disallow HTML tags / angle brackets (e.g. <h1>test</h1>)
    if (containsHtml(name)) {
      setValidationError('Full Name cannot contain HTML tags (e.g., <h1>test</h1>) or angle brackets.');
      return;
    }
    if (containsHtml(email)) {
      setValidationError('Email cannot contain HTML tags or angle brackets.');
      return;
    }
    if (containsHtml(phoneNumber)) {
      setValidationError('Phone number cannot contain HTML tags or angle brackets.');
      return;
    }
    if (containsHtml(password)) {
      setValidationError('Password cannot contain HTML tags or angle brackets.');
      return;
    }

    const cleanName = sanitizeInput(name, 60);
    const cleanEmail = sanitizeEmail(email);
    const cleanPhone = sanitizePhone(phoneNumber);
    const cleanPassword = sanitizeInput(password, 100);

    if (!cleanName) {
      setValidationError('Please enter your full name.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    if (cleanPassword.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    const ok = await dispatch(
      registerUser({
        name: cleanName,
        email: cleanEmail,
        phoneNumber: cleanPhone,
        password: cleanPassword,
      })
    );
    if (ok) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-14">
      <div className="bg-white border border-stone-200/90 rounded-2xl p-8 space-y-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[11px] font-semibold text-[#D94E1F] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join FoodGenie</span>
          </div>
          <h1 className="font-serif-display text-3xl font-bold text-stone-950">
            Create Diner Profile
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Enjoy artisanal meals, real-time kitchen perks, and personalized recommendations.
          </p>
        </div>

        {validationError && <Message variant="danger">{validationError}</Message>}
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
              placeholder="e.g., Samuel Marcus"
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
              placeholder="samuel@example.com"
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:bg-white focus:border-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Contact Mobile Number
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
              placeholder="At least 6 characters"
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:bg-white focus:border-stone-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-stone-900 hover:bg-[#D94E1F] rounded-lg transition-colors cursor-pointer"
          >
            {loading ? 'Creating Account...' : 'Create Account & Enter'}
          </button>
        </form>

        <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
          <span>Already registered?</span>
          <Link
            to="/users/login"
            className="font-semibold text-[#D94E1F] hover:text-stone-900 underline underline-offset-4"
          >
            Sign In Instead
          </Link>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Inputs protected against SQL/NoSQL injection</span>
        </div>
      </div>
    </div>
  );
}
