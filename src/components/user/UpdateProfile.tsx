import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../redux/store.ts';
import { updateUserProfile } from '../../redux/actions/userActions.ts';
import { ArrowLeft, Camera, ShieldCheck, MapPin, Navigation } from 'lucide-react';
import AvatarEditorModal from './AvatarEditorModal.tsx';
import { sanitizeEmail, sanitizeInput, sanitizePhone, containsHtml } from '../../utils/security.ts';
import Message from '../Message.tsx';

export default function UpdateProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state: RootState) => state.user);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [address, setAddress] = useState(
    user?.defaultAddress?.address || ''
  );
  const [city, setCity] = useState(
    user?.defaultAddress?.city || ''
  );
  const [postalCode, setPostalCode] = useState(
    user?.defaultAddress?.postalCode || ''
  );
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar?.url || '');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingLocation(true);
    setLocationStatus(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const road = addr.road || addr.pedestrian || addr.suburb || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
            const house = addr.house_number ? `${addr.house_number} ` : '';
            const detectedCity = addr.city || addr.town || addr.village || addr.county || 'Local Area';
            const detectedPostcode = addr.postcode || '';

            setAddress(`${house}${road}`);
            setCity(detectedCity);
            if (detectedPostcode) setPostalCode(detectedPostcode);
            setLocationStatus('Address detected via GPS!');
            setTimeout(() => setLocationStatus(null), 4000);
          } else {
            setAddress(`GPS Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`);
            setLocationStatus('GPS coordinates captured.');
            setTimeout(() => setLocationStatus(null), 4000);
          }
        } catch {
          setAddress(`GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
          setLocationStatus('GPS coordinates captured.');
          setTimeout(() => setLocationStatus(null), 4000);
        } finally {
          setDetectingLocation(false);
        }
      },
      (err) => {
        setDetectingLocation(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationStatus('Location permission denied. Please enter address manually.');
        } else {
          setLocationStatus('Unable to determine location. Please enter manually.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Strictly disallow HTML tags and angle brackets across all profile & address fields
    if (containsHtml(name)) {
      setErrorMsg('Full Name cannot contain HTML tags (e.g. <h1>test</h1>) or angle brackets.');
      return;
    }
    if (containsHtml(email)) {
      setErrorMsg('Email address cannot contain HTML tags or angle brackets.');
      return;
    }
    if (containsHtml(phoneNumber)) {
      setErrorMsg('Phone number cannot contain HTML tags or angle brackets.');
      return;
    }
    if (containsHtml(address)) {
      setErrorMsg('Street address cannot contain HTML tags (e.g. <h1>) or angle brackets.');
      return;
    }
    if (containsHtml(city)) {
      setErrorMsg('City cannot contain HTML tags or angle brackets.');
      return;
    }
    if (containsHtml(postalCode)) {
      setErrorMsg('Postal code cannot contain HTML tags or angle brackets.');
      return;
    }

    const cleanName = sanitizeInput(name, 60);
    const cleanEmail = sanitizeEmail(email);
    const cleanPhone = sanitizePhone(phoneNumber);
    const cleanAddress = sanitizeInput(address, 120);
    const cleanCity = sanitizeInput(city, 60);
    const cleanPostal = sanitizeInput(postalCode, 20);

    if (!cleanName) {
      setErrorMsg('Full name cannot be blank.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    const ok = await dispatch(
      updateUserProfile({
        name: cleanName,
        email: cleanEmail,
        phoneNumber: cleanPhone,
        address: cleanAddress,
        city: cleanCity,
        postalCode: cleanPostal,
        avatar: avatarUrl ? { public_id: 'avatar_custom', url: avatarUrl } : undefined,
      })
    );
    if (ok) {
      navigate('/users/me');
    }
  };

  const handleSaveAvatar = async (newUrl: string) => {
    setAvatarUrl(newUrl);
    if (user) {
      await dispatch(
        updateUserProfile({
          name: name || user.name,
          email: email || user.email,
          phoneNumber: phoneNumber || user.phoneNumber,
          address: address || user.defaultAddress?.address,
          city: city || user.defaultAddress?.city,
          postalCode: postalCode || user.defaultAddress?.postalCode,
          avatar: {
            public_id: 'avatar_custom',
            url: newUrl,
          },
        })
      );
    }
  };

  return (
    <>
      <div className="max-w-xl mx-auto px-6 py-12">
        <div className="mb-6">
          <Link
            to="/users/me"
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Profile</span>
          </Link>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-8 space-y-6 shadow-sm">
          <div>
            <h1 className="font-serif-display text-2xl font-bold text-stone-950">
              Update Diner Profile & Address
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Changes sync immediately with your active checkout delivery details.
            </p>
          </div>

          {errorMsg && <Message variant="danger">{errorMsg}</Message>}

          {/* Profile Picture Editor Card */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200">
            <img
              src={avatarUrl || user?.avatar?.url}
              alt="Avatar"
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs bg-stone-200"
            />
            <div className="flex-1 text-xs">
              <p className="font-semibold text-stone-900">Profile Picture</p>
              <p className="text-stone-500 text-[11px]">
                Upload your own photo or choose from culinary avatars.
              </p>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-semibold rounded-lg text-xs cursor-pointer transition-colors shadow-2xs"
              >
                <Camera className="w-3.5 h-3.5 text-[#D94E1F]" />
                <span>Change Photo</span>
              </button>
            </div>
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700">
                  Default Delivery Street Address
                </label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={detectingLocation}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-stone-700 bg-stone-100 hover:bg-orange-50 hover:text-[#D94E1F] border border-stone-200 rounded-md transition-colors cursor-pointer disabled:opacity-60"
                  title="Detect location with GPS"
                >
                  <Navigation className="w-3 h-3 text-[#D94E1F]" />
                  <span>{detectingLocation ? 'Locating...' : 'Use Current Location'}</span>
                </button>
              </div>

              {locationStatus && (
                <div className="flex items-center gap-1.5 p-2 mb-2 bg-orange-50 border border-orange-200 text-stone-800 text-xs rounded-lg">
                  <MapPin className="w-3.5 h-3.5 text-[#D94E1F] shrink-0" />
                  <span>{locationStatus}</span>
                </div>
              )}

              <input
                type="text"
                placeholder="e.g. 123 Main St, Apt 2"
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
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-stone-900 hover:bg-[#D94E1F] rounded-lg transition-colors cursor-pointer"
            >
              {loading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 pt-2 border-t border-stone-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Inputs sanitized against injection attacks</span>
          </div>
        </div>
      </div>

      {/* Avatar Editor Modal */}
      <AvatarEditorModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatarUrl={avatarUrl || user?.avatar?.url || ''}
        onSaveAvatar={handleSaveAvatar}
      />
    </>
  );
}
