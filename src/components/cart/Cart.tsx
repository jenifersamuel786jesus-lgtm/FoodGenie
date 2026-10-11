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
import Message from '../Message.tsx';
import {
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowLeft,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-react';

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

  const [couponInput, setCouponInput] = useState(appliedCoupon?.code || '');
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>('Card ·••• 4242');
  const [placingOrder, setPlacingOrder] = useState<boolean>(false);

  // Delivery address fields
  const [address, setAddress] = useState(deliveryInfo.address);
  const [city, setCity] = useState(deliveryInfo.city);
  const [postalCode, setPostalCode] = useState(deliveryInfo.postalCode);
  const [phoneNo, setPhoneNo] = useState(deliveryInfo.phoneNo);

  useEffect(() => {
    axios
      .get('/api/v1/coupons')
      .then(({ data }) => setAvailableCoupons(data.coupons || []))
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
    const code = (codeToApply ?? couponInput).trim();
    if (!code) return;
    setCouponInput(code.toUpperCase());
    const result = await dispatch(validateCouponCode(code, itemsPrice));
    if (result.success) {
      setCouponFeedback(result.message);
    } else {
      setCouponFeedback(null);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    const updatedDelivery = {
      address,
      city,
      postalCode,
      phoneNo,
      country: 'United States',
    };
    dispatch(saveDeliveryInfo(updatedDelivery));

    try {
      setPlacingOrder(true);
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
            id: `pay_${Date.now()}`,
            status: paymentMethod === 'Cash on Delivery (COD)' ? 'Pay on Arrival' : 'Paid',
            method: paymentMethod,
          },
        })
      );
      navigate('/success');
    } finally {
      setPlacingOrder(false);
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
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-amber-800 rounded-lg transition-colors"
            >
              <span>Browse Partner Kitchens</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to={restaurant ? `/eats/stores/${restaurant._id}/menus` : '/'}
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>
            {restaurant ? `Back to ${restaurant.name}` : 'Back to Kitchens'}
          </span>
        </Link>

        <button
          type="button"
          onClick={() => dispatch(clearCartServer())}
          className="text-xs font-medium text-stone-500 hover:text-red-700 transition-colors cursor-pointer"
        >
          Clear Bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left 7 Columns: Itemized Cart & Delivery Address */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white border border-stone-200/90 rounded-xl p-6">
            <div className="flex items-baseline justify-between border-b border-stone-200 pb-4 mb-5">
              <div>
                <p className="text-xs text-stone-500">Ordering from</p>
                <h1 className="font-serif-display text-2xl font-bold text-stone-950">
                  {restaurant?.name || 'Partner Kitchen'}
                </h1>
              </div>
              <span className="text-xs text-stone-500 tabular-nums">
                {cartItems.reduce((s, i) => s + i.quantity, 0)} items
              </span>
            </div>

            <div className="divide-y divide-stone-100">
              {cartItems.map(({ fooditem, quantity }) => (
                <div
                  key={fooditem._id}
                  className="py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={fooditem.images?.[0]?.url}
                      alt={fooditem.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-lg object-cover bg-stone-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs text-stone-500">
                        {fooditem.isVeg ? 'Vegetarian' : 'Non-Veg'} · ${fooditem.price.toFixed(2)} each
                      </p>
                      <h3 className="text-sm font-semibold text-stone-950 truncate">
                        {fooditem.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="inline-flex items-center gap-2 border border-stone-300 rounded-lg px-2 py-1">
                      <button
                        type="button"
                        onClick={() =>
                          quantity > 1
                            ? dispatch(updateCartQuantity(fooditem._id, quantity - 1))
                            : dispatch(removeItemFromCart(fooditem._id))
                        }
                        className="p-1 text-stone-600 hover:text-stone-950 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-semibold tabular-nums min-w-[1.25rem] text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(updateCartQuantity(fooditem._id, quantity + 1))
                        }
                        className="p-1 text-stone-600 hover:text-stone-950 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-sm font-semibold text-stone-950 tabular-nums w-16 text-right">
                      ${(fooditem.price * quantity).toFixed(2)}
                    </span>

                    <button
                      type="button"
                      onClick={() => dispatch(removeItemFromCart(fooditem._id))}
                      aria-label="Remove item"
                      className="p-1.5 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Verification Form */}
          <div className="bg-white border border-stone-200/90 rounded-xl p-6 space-y-4">
            <h2 className="font-serif-display text-xl font-bold text-stone-950">
              Delivery Destination & Contact
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Street Address & Apartment
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
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Courier Contact Phone
                </label>
                <input
                  type="text"
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
              <Tag className="w-4 h-4 text-amber-800" />
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
                className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-amber-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
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
                        ? 'border-amber-800 bg-amber-50/50'
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

          {/* Bill Summary & Payment */}
          <form
            onSubmit={handlePlaceOrder}
            className="bg-white border border-stone-200/90 rounded-xl p-6 space-y-5"
          >
            <h2 className="font-serif-display text-xl font-bold text-stone-950">
              Order Summary
            </h2>

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
                <span>Courier Dispatch (Free over $40)</span>
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
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-stone-700">
                Payment Method
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Card ·••• 4242',
                  'Apple Pay / Instant Pay',
                  'Cash on Delivery (COD)',
                ].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`flex items-center justify-between px-3.5 py-2.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                      paymentMethod === method
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    <span>{method}</span>
                    {paymentMethod === method && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={placingOrder}
              className="w-full py-3 px-5 text-sm font-semibold text-white bg-amber-800 hover:bg-stone-950 rounded-lg transition-colors cursor-pointer tabular-nums"
            >
              {placingOrder
                ? 'Confirming with Kitchen...'
                : `Confirm & Place Order · $${finalTotal.toFixed(2)}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
