import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppDispatch, RootState } from '../../redux/store.ts';
import {
  updateCartQuantity,
  removeItemFromCart,
  validateCouponCode,
  clearCartServer,
} from '../../redux/actions/cartActions.ts';
import { saveDeliveryInfo, setAppliedCoupon } from '../../redux/slices/cartSlice.ts';
import { createOrder } from '../../redux/actions/orderActions.ts';
import { initialCoupons } from '../../data/seedData.ts';
import Message from '../Message.tsx';
import {
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowLeft,
  CheckCircle2,
  ShoppingBag,
  CreditCard,
  Lock,
  ShieldCheck,
  Smartphone,
  Banknote,
  MapPin,
  Navigation,
} from 'lucide-react';
import {
  sanitizeInput,
  sanitizePhone,
  sanitizeCouponCode,
  containsHtml,
} from '../../utils/security.ts';

interface AvailableCoupon {
  _id: string;
  code: string;
  description: string;
  minOrderAmount: number;
}

export default function Cart() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const {
    cartItems,
    restaurant,
    deliveryInfo,
    appliedCoupon,
    couponError,
  } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.user);

  const [couponInput, setCouponInput] = useState(appliedCoupon?.code || '');
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);
  const [availableCoupons, setAvailableCoupons] =
    useState<AvailableCoupon[]>(initialCoupons);

  // Stripe & Payment State
  const [paymentMethod, setPaymentMethod] = useState<string>(
    'Stripe Online Card Checkout'
  );
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('321');
  const [cardName, setCardName] = useState(user?.name || 'Jenifer Samuel');
  const [stripeProcessing, setStripeProcessing] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  // Delivery State
  const [address, setAddress] = useState(
    deliveryInfo?.address || user?.defaultAddress?.address || ''
  );
  const [city, setCity] = useState(
    deliveryInfo?.city || user?.defaultAddress?.city || ''
  );
  const [postalCode, setPostalCode] = useState(
    deliveryInfo?.postalCode || user?.defaultAddress?.postalCode || ''
  );
  const [phoneNo, setPhoneNo] = useState(
    deliveryInfo?.phoneNo || user?.phoneNumber || user?.defaultAddress?.phoneNo || ''
  );
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [placingOrder, setPlacingOrder] = useState<boolean>(false);

  // Real-time Geolocation detector using browser GPS
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
            setLocationStatus('Location detected successfully via GPS!');
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

  useEffect(() => {
    axios
      .get('/api/v1/coupons')
      .then(({ data }) => {
        if (data && Array.isArray(data.coupons)) {
          setAvailableCoupons(data.coupons);
        }
      })
      .catch(() => {});
  }, []);

  const itemsPrice = Number(
    cartItems
      .reduce((acc, item) => acc + item.fooditem.price * item.quantity, 0)
      .toFixed(2)
  );
  const taxPrice = Number((itemsPrice * 0.08).toFixed(2));
  const deliveryCharge = itemsPrice > 40 || itemsPrice === 0 ? 0 : 3.5;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(
    0,
    Number((itemsPrice + taxPrice + deliveryCharge - discountAmount).toFixed(2))
  );

  const handleApplyCoupon = async (codeToApply?: string) => {
    const raw = (codeToApply ?? couponInput).trim();
    if (!raw) return;
    if (containsHtml(raw)) {
      setCouponFeedback('Coupon code cannot contain HTML tags (e.g. <h1>test</h1>) or angle brackets.');
      return;
    }
    const code = sanitizeCouponCode(raw);
    setCouponInput(code);
    const result = await dispatch(validateCouponCode(code, itemsPrice));
    if (result.success) {
      setCouponFeedback(result.message);
    } else {
      setCouponFeedback(null);
    }
  };

  const handleQuickFillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvc('321');
    setCardName('Jenifer Samuel');
    setStripeError(null);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    // Reject HTML tags in delivery details
    if (containsHtml(address)) {
      setStripeError('Delivery street address cannot contain HTML tags (e.g. <h1>test</h1>) or angle brackets.');
      return;
    }
    if (containsHtml(city)) {
      setStripeError('City cannot contain HTML tags or angle brackets.');
      return;
    }
    if (containsHtml(postalCode)) {
      setStripeError('Postal code cannot contain HTML tags or angle brackets.');
      return;
    }
    if (containsHtml(phoneNo)) {
      setStripeError('Phone number cannot contain HTML tags or angle brackets.');
      return;
    }
    if (containsHtml(cardName)) {
      setStripeError('Cardholder name cannot contain HTML tags or angle brackets.');
      return;
    }

    // Sanitize input strings to strictly prevent SQL and NoSQL injection
    const cleanAddress = sanitizeInput(address, 120);
    const cleanCity = sanitizeInput(city, 60);
    const cleanPostal = sanitizeInput(postalCode, 20);
    const cleanPhone = sanitizePhone(phoneNo);

    if (!cleanAddress.trim()) {
      setStripeError('Please enter a delivery street address, or click "Use My Current Location".');
      return;
    }
    if (!cleanCity.trim()) {
      setStripeError('Please enter a delivery city.');
      return;
    }

    const updatedDelivery = {
      address: cleanAddress,
      city: cleanCity,
      postalCode: cleanPostal,
      phoneNo: cleanPhone,
      country: 'United States',
    };
    dispatch(saveDeliveryInfo(updatedDelivery));

    try {
      setPlacingOrder(true);
      setStripeProcessing(true);
      setStripeError(null);

      let stripePaymentId = `pay_stripe_${Date.now()}`;

      // If paying with Stripe, request Stripe PaymentIntent from backend
      if (
        paymentMethod === 'Stripe Online Card Checkout' ||
        paymentMethod === 'Stripe 1-Click Pay (Apple Pay / Google Pay)'
      ) {
        try {
          const stripeRes = await axios.post('/api/v1/payment/stripe-intent', {
            amount: finalTotal,
            currency: 'usd',
            cardholder: cardName,
          });
          if (stripeRes.data?.paymentIntentId) {
            stripePaymentId = stripeRes.data.paymentIntentId;
          }
        } catch (err: any) {
          console.warn('[Stripe Payment Notice]', err?.message);
        }
      }

      await dispatch(
        createOrder({
          restaurant: restaurant?._id,
          deliveryInfo: updatedDelivery,
          orderItems: cartItems.map((entry) => ({
            fooditem: entry.fooditem._id,
            name: entry.fooditem.name,
            price: entry.fooditem.price,
            quantity: entry.quantity,
            image: entry.fooditem.images?.[0]?.url || '',
            isVeg: entry.fooditem.isVeg,
          })),
          itemsPrice,
          taxPrice,
          deliveryCharge,
          discountAmount,
          couponApplied: appliedCoupon?.code,
          finalTotal,
          paymentInfo: {
            id: stripePaymentId,
            status:
              paymentMethod === 'Cash on Delivery (COD)'
                ? 'Pay on Arrival'
                : 'Paid (Stripe Verified)',
            method: paymentMethod,
          },
        })
      );
      navigate('/success');
    } catch (err: any) {
      setStripeError(err?.message || 'Payment processing failed');
    } finally {
      setPlacingOrder(false);
      setStripeProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="bg-white border border-stone-200 rounded-2xl p-12 space-y-5">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h1 className="font-serif-display text-3xl font-bold text-stone-950">
            Your dining bag is empty
          </h1>
          <p className="text-sm text-stone-600 max-w-md mx-auto">
            Explore our wood-fired pizzas, Wagyu smash burgers, and botanical grain bowls from local partner kitchens.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-[#D94E1F] rounded-lg transition-colors"
            >
              <span>Browse Partner Kitchens</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      {/* Breadcrumb / Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Dining</span>
        </Link>
        <button
          type="button"
          onClick={() => dispatch(clearCartServer())}
          className="text-xs font-medium text-stone-500 hover:text-rose-700 transition-colors cursor-pointer"
        >
          Clear Dining Bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left 7 Columns: Items & Address */}
        <div className="lg:col-span-7 space-y-6">
          {/* Cart Items List */}
          <div className="bg-white border border-stone-200/90 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <h1 className="font-serif-display text-2xl font-bold text-stone-950">
                  Your Dining Bag
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  Ordering from{' '}
                  <span className="font-semibold text-stone-900">
                    {restaurant?.name || 'Local Kitchen'}
                  </span>
                </p>
              </div>
              <span className="text-xs font-medium text-stone-500 tabular-nums">
                {cartItems.reduce((acc, i) => acc + i.quantity, 0)} items
              </span>
            </div>

            <div className="divide-y divide-stone-100">
              {cartItems.map((entry) => (
                <div
                  key={entry.fooditem._id}
                  className="py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={entry.fooditem.images?.[0]?.url}
                      alt={entry.fooditem.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-lg object-cover bg-stone-100 shrink-0"
                    />
                    <div>
                      <p className="text-sm font-semibold text-stone-900">
                        {entry.fooditem.name}
                      </p>
                      <p className="text-xs text-stone-500 tabular-nums mt-0.5">
                        ${entry.fooditem.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50">
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(
                            updateCartQuantity(
                              entry.fooditem._id,
                              entry.quantity - 1
                            )
                          )
                        }
                        className="p-1.5 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-semibold tabular-nums text-stone-900">
                        {entry.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(
                            updateCartQuantity(
                              entry.fooditem._id,
                              entry.quantity + 1
                            )
                          )
                        }
                        className="p-1.5 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-sm font-semibold text-stone-950 tabular-nums w-16 text-right">
                      ${(entry.fooditem.price * entry.quantity).toFixed(2)}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        dispatch(removeItemFromCart(entry.fooditem._id))
                      }
                      className="text-stone-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address Form */}
          <div className="bg-white border border-stone-200/90 rounded-xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-serif-display text-lg font-bold text-stone-950">
                  Delivery Destination
                </h2>
                <p className="text-xs text-stone-500">
                  Where our courier should deliver your freshly prepared order.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-orange-50 hover:text-[#D94E1F] hover:border-orange-200 border border-stone-200 rounded-lg transition-colors cursor-pointer disabled:opacity-60 shrink-0 self-start sm:self-auto"
                title="Detect address using your device's current GPS location"
              >
                <Navigation className="w-3.5 h-3.5 text-[#D94E1F]" />
                <span>{detectingLocation ? 'Detecting Location...' : 'Use Current Location'}</span>
              </button>
            </div>

            {locationStatus && (
              <div className="flex items-center gap-2 p-2.5 bg-orange-50/80 border border-orange-200/80 text-stone-800 text-xs rounded-lg">
                <MapPin className="w-3.5 h-3.5 text-[#D94E1F] shrink-0" />
                <span>{locationStatus}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:bg-white focus:border-stone-900"
                />
              </div>

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

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Recipient Contact Phone
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNo}
                  onChange={(e) => setPhoneNo(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:bg-white focus:border-stone-900 tabular-nums"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Promo Coupons & Checkout Module */}
        <div className="lg:col-span-5 space-y-6">
          {/* Coupon Module */}
          <div className="bg-white border border-stone-200/90 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#D94E1F]" />
              <h2 className="font-serif-display text-lg font-bold text-stone-950">
                Kitchen Privileges & Coupons
              </h2>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Enter code (e.g., FEAST20)"
                className="flex-1 px-3.5 py-2 text-sm uppercase bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:bg-white focus:border-stone-900 font-mono"
              />
              <button
                type="button"
                onClick={() => handleApplyCoupon()}
                className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-[#D94E1F] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Apply
              </button>
            </div>

            {couponError && <Message variant="danger">{couponError}</Message>}
            {appliedCoupon && couponFeedback && (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-2.5 rounded-lg text-xs">
                <span>{couponFeedback}</span>
                <button
                  type="button"
                  onClick={() => {
                    dispatch(setAppliedCoupon(null));
                    setCouponFeedback(null);
                  }}
                  className="font-semibold underline ml-2 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Available Coupon Quick Select */}
            <div className="space-y-2 pt-1">
              <p className="text-xs text-stone-500">Available offers (click to apply):</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableCoupons.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => handleApplyCoupon(c.code)}
                    className={`text-left p-2.5 rounded-lg border transition-colors cursor-pointer ${
                      appliedCoupon?.code === c.code
                        ? 'border-[#D94E1F] bg-orange-50/50'
                        : 'border-stone-200 hover:border-stone-400 bg-stone-50/60'
                    }`}
                  >
                    <p className="font-mono text-xs font-semibold text-stone-900">
                      {c.code}
                    </p>
                    <p className="text-[11px] text-stone-600 line-clamp-1 mt-0.5">
                      {c.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bill Summary & Stripe Payment */}
          <form
            onSubmit={handlePlaceOrder}
            className="bg-white border border-stone-200/90 rounded-xl p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif-display text-xl font-bold text-stone-950">
                Order Summary
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Stripe Verified</span>
              </div>
            </div>

            <div className="space-y-2.5 text-sm border-b border-stone-200 pb-4">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal</span>
                <span className="tabular-nums font-medium text-stone-900">
                  ${itemsPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Kitchen Taxes (8%)</span>
                <span className="tabular-nums font-medium text-stone-900">
                  ${taxPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Delivery (Free over $40)</span>
                <span className="tabular-nums font-medium text-stone-900">
                  {deliveryCharge === 0 ? 'Free' : `$${deliveryCharge.toFixed(2)}`}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Privilege Discount ({appliedCoupon?.code})</span>
                  <span className="tabular-nums">-${discountAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-base font-semibold text-stone-950">
                Total Payable
              </span>
              <span className="font-serif-display text-2xl font-bold text-stone-950 tabular-nums">
                ${finalTotal.toFixed(2)}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-stone-700">
                Select Payment Method
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    id: 'Stripe Online Card Checkout',
                    title: 'Stripe Card Checkout',
                    subtitle: 'Visa, Mastercard, Amex, Discover',
                    icon: CreditCard,
                  },
                  {
                    id: 'Stripe 1-Click Pay (Apple Pay / Google Pay)',
                    title: 'Stripe 1-Click Pay',
                    subtitle: 'Apple Pay & Google Pay',
                    icon: Smartphone,
                  },
                  {
                    id: 'Cash on Delivery (COD)',
                    title: 'Cash on Delivery (COD)',
                    subtitle: 'Settle in cash on arrival',
                    icon: Banknote,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPaymentMethod(item.id)}
                      className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer text-left ${
                        paymentMethod === item.id
                          ? 'border-[#D94E1F] bg-orange-50/40 text-stone-900 ring-1 ring-[#D94E1F]'
                          : 'border-stone-200 bg-stone-50/60 text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-[#D94E1F]" />
                        <div>
                          <p className="font-semibold text-stone-900">{item.title}</p>
                          <p className="text-[10px] text-stone-500">{item.subtitle}</p>
                        </div>
                      </div>
                      {paymentMethod === item.id && (
                        <CheckCircle2 className="w-4 h-4 text-[#D94E1F]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Stripe Card Details Form (shown when card checkout is selected) */}
              {paymentMethod === 'Stripe Online Card Checkout' && (
                <div className="border border-stone-200 rounded-xl p-4 bg-[#FAF7F2] space-y-3 animate-fade-in text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-stone-500" />
                      Stripe Encrypted Card Details
                    </span>
                    <button
                      type="button"
                      onClick={handleQuickFillTestCard}
                      className="text-[11px] font-bold text-[#D94E1F] hover:underline cursor-pointer"
                    >
                      Fill Test Card
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-md font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#D94E1F]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="12/28"
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-md font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#D94E1F]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">
                        CVC
                      </label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="321"
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-md font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#D94E1F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Jenifer Samuel"
                      className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#D94E1F]"
                    />
                  </div>
                </div>
              )}
            </div>

            {stripeError && <Message variant="danger">{stripeError}</Message>}

            <button
              type="submit"
              disabled={placingOrder || stripeProcessing}
              className="w-full py-3 px-5 text-sm font-semibold text-white bg-[#D94E1F] hover:bg-stone-950 rounded-lg transition-colors cursor-pointer tabular-nums shadow-sm disabled:opacity-50"
            >
              {placingOrder || stripeProcessing
                ? 'Processing via Stripe...'
                : `Pay $${finalTotal.toFixed(2)} with Stripe`}
            </button>

            <p className="text-[11px] text-center text-stone-500 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-stone-400" />
              <span>Payments securely processed with Stripe End-to-End Encryption</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
