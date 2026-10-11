import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppDispatch, RootState } from '../redux/store.ts';
import { getRestaurants } from '../redux/actions/restaurantAction.ts';
import { setVegOnly, setSortBy } from '../redux/slices/restaurantSlice.ts';
import { addItemToCart } from '../redux/actions/cartActions.ts';
import { getAllFoodItemsFlat } from '../data/seedData.ts';
import CountRestaurant from './CountRestaurant.tsx';
import Restaurant from './Restaurant.tsx';
import Search from './layout/Search.tsx';
import Loader from './layout/Loader.tsx';
import Message from './Message.tsx';
import { Sparkles, Plus, Check, ArrowRight } from 'lucide-react';

const HERO_IMAGE = '/src/assets/images/hero_gourmet_feast_1791706198554.jpg';

interface AIRecommendationItem {
  itemId: string;
  name: string;
  restaurantName: string;
  whyItMatches: string;
  pairingTip: string;
  foodItem?: {
    _id: string;
    name: string;
    price: number;
    restaurant: string;
    isVeg: boolean;
    calories: number;
  };
}

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const {
    restaurants,
    loading,
    error,
    showVegOnly,
    sortBy,
    searchKeyword,
  } = useSelector((state: RootState) => state.restaurants);

  // AI Culinary Concierge state
  const [cravingPrompt, setCravingPrompt] = useState<string>('');
  const [aiDietary, setAiDietary] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [aiRecs, setAiRecs] = useState<AIRecommendationItem[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getRestaurants(searchKeyword, showVegOnly, sortBy));
  }, [dispatch, searchKeyword, showVegOnly, sortBy]);

  const handleVegFilterChange = (vegOnly: boolean) => {
    dispatch(setVegOnly(vegOnly));
  };

  const handleSortChange = (newSort: 'default' | 'ratings' | 'reviews') => {
    dispatch(setSortBy(newSort));
  };

  const buildClientSideRecommendations = (queryText: string) => {
    const q = queryText.toLowerCase();
    const allItems = getAllFoodItemsFlat().filter((item) => {
      if (aiDietary === 'VEG') return item.isVeg;
      if (aiDietary === 'NON_VEG') return !item.isVeg;
      return true;
    });

    const scored = allItems.map((item) => {
      let score = item.ratings * 10;
      if (q.includes('pizza') && item.name.toLowerCase().includes('pizza')) score += 40;
      if (q.includes('burger') && item.name.toLowerCase().includes('burger')) score += 40;
      if (q.includes('fries') && item.name.toLowerCase().includes('fries')) score += 35;
      if (
        (q.includes('healthy') ||
          q.includes('bowl') ||
          q.includes('light') ||
          q.includes('550') ||
          q.includes('calorie')) &&
        item.calories <= 560
      ) {
        score += 40;
      }
      if (
        (q.includes('protein') ||
          q.includes('workout') ||
          q.includes('grill') ||
          q.includes('skewer')) &&
        (item.name.toLowerCase().includes('skewer') ||
          item.name.toLowerCase().includes('steak') ||
          item.name.toLowerCase().includes('burger'))
      ) {
        score += 35;
      }
      if (q.includes('pasta') && item.name.toLowerCase().includes('pasta')) score += 40;
      return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return {
      conciergeNote: `FoodGenie selected these top-rated ${
        aiDietary === 'VEG' ? 'vegetarian ' : aiDietary === 'NON_VEG' ? 'chef-special ' : ''
      }dishes matched to "${queryText}":`,
      recommendations: scored.slice(0, 3).map(({ item }) => ({
        itemId: item._id,
        name: item.name,
        restaurantName: item.restaurantName,
        whyItMatches: `${item.description.split('.')[0]}. Freshly prepared in ${item.prepTime} (${item.calories} kcal, ${item.ratings}★).`,
        pairingTip: item.isVeg
          ? 'Pairs great with Warm Rosemary Garlic Bread or a chilled citrus drink.'
          : 'Pairs wonderfully with Crispy Rosemary Parmesan Fries.',
        foodItem: item,
      })),
    };
  };

  const handleAskConcierge = async (e?: React.FormEvent, presetPrompt?: string) => {
    if (e) e.preventDefault();
    const queryToUse =
      presetPrompt ||
      cravingPrompt.trim() ||
      'Recommend a wood-fired dinner and a starter under 800 calories';

    try {
      setAiLoading(true);
      setAiError(null);
      const { data } = await axios.post('/api/v1/ai/recommend', {
        prompt: queryToUse,
        dietaryPreference: aiDietary,
      });
      if (data && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        setAiNote(data.conciergeNote);
        setAiRecs(data.recommendations);
      } else {
        const localResult = buildClientSideRecommendations(queryToUse);
        setAiNote(localResult.conciergeNote);
        setAiRecs(localResult.recommendations);
      }
    } catch {
      const localResult = buildClientSideRecommendations(queryToUse);
      setAiNote(localResult.conciergeNote);
      setAiRecs(localResult.recommendations);
    } finally {
      setAiLoading(false);
    }
  };

  const handleQuickAddRec = (rec: AIRecommendationItem) => {
    if (!rec.foodItem) return;
    dispatch(addItemToCart(rec.foodItem._id, rec.foodItem.restaurant, 1));
    setAddedId(rec.foodItem._id);
    setTimeout(() => setAddedId(null), 2000);
  };

  return (
    <div className="space-y-16">
      {/* Section 1: Storefront Split Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-white border border-orange-200/70 rounded-2xl overflow-hidden shadow-xs">
          <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#D94E1F]">
                <span>FoodGenie Express</span>
                <span aria-hidden="true">·</span>
                <span>25-Minute Delivery</span>
                <span aria-hidden="true">·</span>
                <span>Code FEAST20 for 20% Off</span>
              </div>

              <h1 className="font-serif-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-stone-950 leading-[1.12]">
                Your wish for great food, granted hot and fresh.
              </h1>

              <p className="text-base text-stone-600 leading-relaxed max-w-xl">
                FoodGenie brings wood-fired sourdough pizzas, double beef smash burgers, and healthy grain bowls straight from top local kitchens to your table.
              </p>
            </div>

            <div className="pt-8 space-y-4">
              <Search />

              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 pt-1">
                <span>Popular tonight:</span>
                <button
                  type="button"
                  onClick={() => navigate('/eats/stores/rest-1/menus')}
                  className="text-stone-800 font-medium hover:text-amber-800 underline underline-offset-4 cursor-pointer"
                >
                  The Wood-Fired Oven
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => navigate('/eats/stores/rest-2/menus')}
                  className="text-stone-800 font-medium hover:text-amber-800 underline underline-offset-4 cursor-pointer"
                >
                  Craft Burger Kitchen
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => navigate('/eats/stores/rest-4/menus')}
                  className="text-stone-800 font-medium hover:text-amber-800 underline underline-offset-4 cursor-pointer"
                >
                  Green Harvest Kitchen
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 min-h-[300px] lg:min-h-[420px] bg-stone-900 relative overflow-hidden">
            <img
              src={HERO_IMAGE}
              alt="Wood-fired pizza, fresh mozzarella salad, and grilled skewers"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-6 md:p-8">
              <div className="text-white max-w-md">
                <p className="text-xs text-stone-300 mb-1">
                  Featured Today · Downtown & Midtown
                </p>
                <p className="font-serif-display text-lg font-semibold">
                  Wood-Fired Margherita Pizza & Fresh Mozzarella Salad
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Partner Restaurants Catalog & Segmented Filter Controls */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200/90">
          <div>
            <h2 className="font-serif-display text-2xl md:text-3xl font-bold text-stone-950">
              All Restaurants
            </h2>
            <div className="mt-1">
              <CountRestaurant />
            </div>
          </div>

          {/* Interactive Filter & Sort Segmented Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Dietary Filter Segmented Control */}
            <div className="flex items-center gap-1 p-1 bg-stone-200/75 rounded-lg">
              <button
                type="button"
                onClick={() => handleVegFilterChange(false)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  !showVegOnly
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                All Kitchens
              </button>
              <button
                type="button"
                onClick={() => handleVegFilterChange(true)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  showVegOnly
                    ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                Pure Vegetarian
              </button>
            </div>

            {/* Sort Order Segmented Control */}
            <div className="flex items-center gap-1 p-1 bg-stone-200/75 rounded-lg">
              <button
                type="button"
                onClick={() => handleSortChange('default')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  sortBy === 'default'
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                Featured
              </button>
              <button
                type="button"
                onClick={() => handleSortChange('ratings')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  sortBy === 'ratings'
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                Top Rated
              </button>
              <button
                type="button"
                onClick={() => handleSortChange('reviews')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  sortBy === 'reviews'
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-950'
                }`}
              >
                Most Reviewed
              </button>
            </div>
          </div>
        </div>

        {/* Restaurant Cards Grid */}
        <div className="mt-8">
          {loading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">{error}</Message>
          ) : !Array.isArray(restaurants) || restaurants.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-xl p-12 text-center">
              <p className="font-serif-display text-xl font-semibold text-stone-900">
                No kitchens match your current filter
              </p>
              <p className="text-sm text-stone-500 mt-1">
                Try clearing your search keyword or switching from Pure Vegetarian to All Kitchens.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {restaurants.map((restaurant) => (
                <Restaurant key={restaurant._id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section 3: Ask FoodGenie AI Assistant */}
      <section id="ai-concierge" className="max-w-7xl mx-auto px-6">
        <div className="bg-[#FDF6EC] border border-orange-200/90 rounded-2xl p-8 md:p-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D94E1F] mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Ask FoodGenie · Smart Dish Finder</span>
            </div>
            <h2 className="font-serif-display text-2xl md:text-3xl font-bold text-stone-950">
              Make a food wish—tell FoodGenie what you are craving.
            </h2>
            <p className="text-sm text-stone-600 mt-2">
              FoodGenie scans every restaurant menu to recommend the best dishes for your mood, calorie target, or dietary preference.
            </p>
          </div>

          <form
            onSubmit={(e) => handleAskConcierge(e)}
            className="mt-6 flex flex-col md:flex-row gap-3"
          >
            <input
              type="text"
              value={cravingPrompt}
              onChange={(e) => setCravingPrompt(e.target.value)}
              placeholder="e.g., High-protein dinner after a workout, or a cheesy vegetarian pizza..."
              className="flex-1 px-4 py-3 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#D94E1F]"
            />

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-orange-100/80 rounded-lg">
                {(['ALL', 'VEG', 'NON_VEG'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setAiDietary(mode)}
                    className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      aiDietary === mode
                        ? 'bg-white text-stone-950 shadow-xs'
                        : 'text-stone-600 hover:text-stone-950'
                    }`}
                  >
                    {mode === 'ALL' ? 'All' : mode === 'VEG' ? 'Veg Only' : 'Non-Veg'}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={aiLoading}
                className="px-5 py-3 text-xs font-semibold text-white bg-[#D94E1F] hover:bg-stone-900 disabled:bg-stone-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {aiLoading ? 'Asking FoodGenie...' : 'Ask FoodGenie'}
              </button>
            </div>
          </form>

          {/* Preset Quick Craving Buttons */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-xs text-stone-500">Try asking:</span>
            {[
              'Wood-fired vegetarian pizza for two',
              'Double beef burger & crispy fries',
              'Healthy grain bowl under 550 calories',
            ].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setCravingPrompt(sample);
                  handleAskConcierge(undefined, sample);
                }}
                className="px-3 py-1 text-xs font-medium bg-white border border-stone-300 rounded-md text-stone-700 hover:border-stone-900 hover:text-stone-950 transition-colors cursor-pointer"
              >
                {sample}
              </button>
            ))}
          </div>

          {aiError && (
            <div className="mt-6">
              <Message variant="danger">{aiError}</Message>
            </div>
          )}

          {aiNote && (
            <div className="mt-8 pt-6 border-t border-stone-300/80 space-y-5">
              <p className="text-sm font-medium text-stone-900 italic">
                &ldquo;{aiNote}&rdquo;
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {aiRecs.map((rec, index) => (
                  <div
                    key={rec.itemId || index}
                    className="bg-white border border-stone-200 rounded-xl p-5 flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs text-stone-500 mb-1">
                        <span>{rec.restaurantName}</span>
                        {rec.foodItem && (
                          <span className="font-semibold text-stone-900 tabular-nums">
                            ${rec.foodItem.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-stone-950">
                        {rec.name}
                      </h3>
                      <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                        {rec.whyItMatches}
                      </p>
                      <p className="text-xs text-amber-900 mt-2 font-medium">
                        Best Paired With: {rec.pairingTip}
                      </p>
                    </div>

                    {rec.foodItem && (
                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/eats/stores/${rec.foodItem!.restaurant}/menus`)
                          }
                          className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-stone-950 cursor-pointer"
                        >
                          <span>Kitchen Menu</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickAddRec(rec)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-amber-800 rounded-lg transition-colors cursor-pointer"
                        >
                          {addedId === rec.foodItem._id ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add to Bag</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
