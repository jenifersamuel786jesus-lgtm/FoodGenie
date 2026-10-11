import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RestaurantItem } from '../redux/slices/restaurantSlice.ts';
import { Star, ArrowUpRight, Utensils } from 'lucide-react';

interface RestaurantProps {
  restaurant: RestaurantItem;
}

export default function Restaurant({ restaurant }: RestaurantProps) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = restaurant.images?.[0]?.url;

  return (
    <article className="group bg-white border border-stone-200/90 rounded-xl overflow-hidden transition-transform duration-150 hover:-translate-y-0.5 flex flex-col justify-between">
      <Link
        to={`/eats/stores/${restaurant._id}/menus`}
        className="block focus:outline-none"
      >
        <div className="aspect-[4/3] w-full bg-stone-100 overflow-hidden relative">
          {!imgError && imageUrl ? (
            <img
              src={imageUrl}
              alt={restaurant.name}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 text-stone-500 p-6 text-center">
              <Utensils className="w-8 h-8 mb-2 text-stone-400" />
              <span className="font-serif-display text-sm font-semibold text-stone-700">
                {restaurant.name}
              </span>
            </div>
          )}
        </div>

        <div className="p-5">
          {/* Quiet 1-line text kicker with unboxed separators */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1.5 truncate">
            <span>{restaurant.cuisine.slice(0, 2).join(' · ')}</span>
            <span aria-hidden="true">·</span>
            <span className={restaurant.isVeg ? 'text-emerald-700 font-medium' : 'text-stone-500'}>
              {restaurant.isVeg ? 'Pure Vegetarian' : 'Mixed Kitchen'}
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-lg font-semibold text-stone-900 group-hover:text-amber-800 transition-colors truncate">
              {restaurant.name}
            </h3>
            <div className="flex items-center gap-1 text-sm font-semibold text-stone-900 tabular-nums shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{restaurant.ratings.toFixed(1)}</span>
              <span className="text-xs font-normal text-stone-500">
                ({restaurant.numOfReviews})
              </span>
            </div>
          </div>

          <p className="text-xs text-stone-500 mt-1 truncate">
            {restaurant.address}
          </p>
        </div>
      </Link>

      <div className="px-5 py-3.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
        <div className="flex items-center gap-2 tabular-nums">
          <span>{restaurant.deliveryTime}</span>
          <span aria-hidden="true">·</span>
          <span>${restaurant.priceForTwo} for two</span>
        </div>

        <Link
          to={`/eats/stores/${restaurant._id}/menus`}
          className="inline-flex items-center gap-1 font-semibold text-stone-900 group-hover:text-amber-800 transition-colors whitespace-nowrap shrink-0"
        >
          <span>View Menu</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
