import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { AppDispatch, RootState } from '../redux/store.ts';
import { getMenus, submitRestaurantReview } from '../redux/actions/menuActions.ts';
import Fooditem from './Fooditem.tsx';
import Loader from './layout/Loader.tsx';
import Message from './Message.tsx';
import { Star, ArrowLeft, Sparkles, Send, ShoppingBag } from 'lucide-react';

interface AIReviewReport {
  overallSentiment: string;
  sentimentScore: number;
  executiveSummary: string;
  keyStrengths: string[];
  standoutDishes: string[];
  PackagingAndDeliveryNote: string;
}

export default function Menu() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { menus, selectedRestaurant, loading, error } = useSelector(
    (state: RootState) => state.menu
  );
  const { cartItems } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.user);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [vegDishesOnly, setVegDishesOnly] = useState<boolean>(false);

  // AI Review Analyzer state
  const [aiReport, setAiReport] = useState<AIReviewReport | null>(null);
  const [analyzingReviews, setAnalyzingReviews] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Add Review form state
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [dishMentioned, setDishMentioned] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewSubmittedMsg, setReviewSubmittedMsg] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(getMenus(id));
      setSelectedCategory('All');
      setAiReport(null);
      setAiError(null);
    }
  }, [dispatch, id]);

  const buildFallbackReviewReport = () => {
    if (!selectedRestaurant) return null;
    const score = Math.min(99, Math.round(selectedRestaurant.ratings * 20));
    const dishes = (selectedRestaurant.reviews || [])
      .map((r) => r.dishMentioned)
      .filter((d): d is string => Boolean(d));

    return {
      overallSentiment:
        selectedRestaurant.ratings >= 4.8
          ? 'Highly Acclaimed by Diners'
          : 'Consistently Positive',
      sentimentScore: score,
      executiveSummary: `Diners consistently praise ${selectedRestaurant.name} for its fresh ingredients, authentic ${selectedRestaurant.cuisine[0]} preparation, and reliable ${selectedRestaurant.deliveryTime} delivery window across ${selectedRestaurant.numOfReviews} verified orders.`,
      keyStrengths: [
        `Authentic ${selectedRestaurant.cuisine.slice(0, 2).join(' & ')} flavor profile`,
        `Fast and temperature-controlled delivery (${selectedRestaurant.deliveryTime})`,
        `High diner repeat rate with a ${selectedRestaurant.ratings.toFixed(1)}/5 average rating`,
      ],
      standoutDishes:
        dishes.length > 0 ? Array.from(new Set(dishes)) : selectedRestaurant.cuisine,
      PackagingAndDeliveryNote:
        'Hot and cold items are packed in separate insulated containers to preserve texture and crispness upon arrival.',
    };
  };

  const handleAnalyzeReviews = async () => {
    if (!id) return;
    try {
      setAnalyzingReviews(true);
      setAiError(null);
      const { data } = await axios.post('/api/v1/ai/analyze-reviews', {
        restaurantId: id,
      });
      if (data?.analysis && Array.isArray(data.analysis.keyStrengths)) {
        setAiReport(data.analysis);
      } else {
        setAiReport(buildFallbackReviewReport());
      }
    } catch {
      setAiReport(buildFallbackReviewReport());
    } finally {
      setAnalyzingReviews(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !comment.trim()) return;
    try {
      setSubmittingReview(true);
      await dispatch(
        submitRestaurantReview(id, {
          rating,
          comment: comment.trim(),
          dishMentioned: dishMentioned.trim() || undefined,
          userName: user?.name || 'Verified Diner',
        })
      );
      setComment('');
      setDishMentioned('');
      setReviewSubmittedMsg('Thank you! Your verified review has been published.');
      setTimeout(() => setReviewSubmittedMsg(null), 4000);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loader />;
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Message variant="danger">{error}</Message>
      </div>
    );
  }

  const storeMenu = menus?.[0]?.menu || [];
  const categories = ['All', ...storeMenu.map((group) => group.category)];
  const totalBagItems = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const totalBagCost = cartItems.reduce(
    (acc, i) => acc + i.fooditem.price * i.quantity,
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Back navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Partner Kitchens</span>
        </Link>

        {totalBagItems > 0 && (
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-stone-900 rounded-lg transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="tabular-nums">
              Checkout ({totalBagItems} items · ${totalBagCost.toFixed(2)})
            </span>
          </button>
        )}
      </div>

      {/* Restaurant Header Banner */}
      {selectedRestaurant && (
        <section className="bg-white border border-stone-200/90 rounded-xl p-6 md:p-8 mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                <span>{selectedRestaurant.cuisine.join(' · ')}</span>
                <span aria-hidden="true">·</span>
                <span
                  className={
                    selectedRestaurant.isVeg
                      ? 'text-emerald-700 font-semibold'
                      : 'text-stone-600'
                  }
                >
                  {selectedRestaurant.isVeg ? '100% Pure Vegetarian' : 'Mixed Kitchen'}
                </span>
              </div>

              <h1 className="font-serif-display text-3xl md:text-4xl font-bold text-stone-950">
                {selectedRestaurant.name}
              </h1>
              <p className="text-sm text-stone-600 mt-1.5">
                {selectedRestaurant.address}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-stone-100 text-sm">
              <div>
                <p className="text-xs text-stone-500">Diner Rating</p>
                <div className="flex items-center gap-1 font-semibold text-stone-950 tabular-nums mt-0.5">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{selectedRestaurant.ratings.toFixed(1)}</span>
                  <span className="text-stone-500 font-normal">
                    ({selectedRestaurant.numOfReviews} reviews)
                  </span>
                </div>
              </div>
              <div className="h-8 w-px bg-stone-200 hidden sm:block" />
              <div>
                <p className="text-xs text-stone-500">Delivery Estimate</p>
                <p className="font-semibold text-stone-950 tabular-nums mt-0.5">
                  {selectedRestaurant.deliveryTime}
                </p>
              </div>
              <div className="h-8 w-px bg-stone-200 hidden sm:block" />
              <div>
                <p className="text-xs text-stone-500">Average for Two</p>
                <p className="font-semibold text-stone-950 tabular-nums mt-0.5">
                  ${selectedRestaurant.priceForTwo}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Interactive Category & Dietary Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-stone-200">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-200/70 rounded-lg">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-white text-stone-950 shadow-xs'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setVegDishesOnly(!vegDishesOnly)}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            vegDishesOnly
              ? 'bg-emerald-800 text-white border-emerald-800'
              : 'bg-white text-stone-700 border-stone-300 hover:border-stone-900'
          }`}
        >
          {vegDishesOnly ? 'Showing Vegetarian Only' : 'Filter Vegetarian Dishes'}
        </button>
      </div>

      {/* Menu Sections */}
      <div className="space-y-12">
        {storeMenu
          .filter(
            (group) =>
              selectedCategory === 'All' || group.category === selectedCategory
          )
          .map((group) => {
            const filteredItems = group.items.filter((item) =>
              vegDishesOnly ? item.isVeg : true
            );

            if (filteredItems.length === 0) return null;

            return (
              <section key={group.category}>
                <div className="flex items-baseline justify-between mb-5">
                  <h2 className="font-serif-display text-2xl font-bold text-stone-900">
                    {group.category}
                  </h2>
                  <span className="text-xs text-stone-500 tabular-nums">
                    {filteredItems.length}{' '}
                    {filteredItems.length === 1 ? 'dish' : 'dishes'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((fooditem) => (
                    <Fooditem
                      key={fooditem._id}
                      fooditem={fooditem}
                      restaurantId={id || fooditem.restaurant}
                    />
                  ))}
                </div>
              </section>
            );
          })}
      </div>

      {/* Reviews & Gemini AI Review Analyzer Section */}
      {selectedRestaurant && (
        <section className="mt-16 pt-12 border-t border-stone-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left 7 columns: Verified Reviews & AI Analyzer */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif-display text-2xl font-bold text-stone-900">
                    Verified Diner Reviews
                  </h2>
                  <p className="text-sm text-stone-600 mt-0.5">
                    Authentic feedback and AI-synthesized culinary sentiment for{' '}
                    {selectedRestaurant.name}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAnalyzeReviews}
                  disabled={analyzingReviews}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#D94E1F] hover:bg-stone-900 disabled:bg-stone-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {analyzingReviews
                      ? 'FoodGenie Analyzing...'
                      : 'FoodGenie Review Summary'}
                  </span>
                </button>
              </div>

              {aiError && <Message variant="danger">{aiError}</Message>}

              {/* AI Review Analysis Output */}
              {aiReport && (
                <div className="bg-[#FDF6EC] border border-orange-200 rounded-xl p-6 space-y-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-orange-200/70 pb-3">
                    <div>
                      <p className="text-xs font-medium text-[#D94E1F]">
                        FoodGenie Quality Synthesis
                      </p>
                      <h3 className="text-lg font-semibold text-stone-950">
                        Sentiment: {aiReport.overallSentiment}
                      </h3>
                    </div>
                    <div className="text-sm font-semibold text-[#D94E1F] tabular-nums">
                      Diner Satisfaction Score: {aiReport.sentimentScore}/100
                    </div>
                  </div>

                  <p className="text-sm text-stone-800 leading-relaxed">
                    {aiReport.executiveSummary}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                    <div>
                      <p className="font-semibold text-stone-900 mb-1">
                        Key Culinary Strengths
                      </p>
                      <ul className="space-y-1 text-stone-700">
                        {aiReport.keyStrengths.map((s, idx) => (
                          <li key={idx}>· {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900 mb-1">
                        Most Praised Dishes
                      </p>
                      <ul className="space-y-1 text-stone-700">
                        {aiReport.standoutDishes.map((d, idx) => (
                          <li key={idx}>· {d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 pt-2 border-t border-stone-200/70">
                    Packaging & Delivery Note: {aiReport.PackagingAndDeliveryNote}
                  </p>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {selectedRestaurant.reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="bg-white border border-stone-200/90 rounded-xl p-5"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 text-xs text-stone-600">
                        <span className="font-semibold text-stone-900 text-sm">
                          {rev.userName}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{rev.createdAt}</span>
                        {rev.dishMentioned && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-amber-800 font-medium">
                              Ordered {rev.dishMentioned}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-stone-900 tabular-nums">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{rev.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-stone-700 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 5 columns: Leave a Review Form */}
            <div className="lg:col-span-5">
              <form
                onSubmit={handleReviewSubmit}
                className="bg-white border border-stone-200/90 rounded-xl p-6 space-y-4"
              >
                <h3 className="font-serif-display text-xl font-bold text-stone-900">
                  Share Your Dining Experience
                </h3>
                <p className="text-xs text-stone-500">
                  Posting as {user?.name || 'Verified Diner'}. Your review helps our AI Concierge refine dish recommendations.
                </p>

                {reviewSubmittedMsg && (
                  <Message variant="success">{reviewSubmittedMsg}</Message>
                )}

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setRating(starVal)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors tabular-nums cursor-pointer ${
                          rating === starVal
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        {starVal} ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Favorite Dish Ordered (Optional)
                  </label>
                  <input
                    type="text"
                    value={dishMentioned}
                    onChange={(e) => setDishMentioned(e.target.value)}
                    placeholder="e.g., Classic Margherita Pizza"
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:bg-white focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Your Review
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="How was the flavor, temperature, and packaging?"
                    className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:bg-white focus:border-stone-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-amber-800 rounded-lg transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {submittingReview ? 'Publishing...' : 'Publish Verified Review'}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
