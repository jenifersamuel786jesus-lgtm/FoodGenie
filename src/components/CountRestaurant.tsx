import { useSelector } from 'react-redux';
import { RootState } from '../redux/store.ts';

export default function CountRestaurant() {
  const { count, pureVegCount, showVegOnly, restaurants } = useSelector(
    (state: RootState) => state.restaurants
  );

  const safeRestaurants = Array.isArray(restaurants) ? restaurants : [];
  const displayedCount = showVegOnly
    ? pureVegCount
    : safeRestaurants.length || count;
  const label =
    displayedCount === 1
      ? showVegOnly
        ? 'Pure Vegetarian Kitchen'
        : 'Partner Kitchen'
      : showVegOnly
      ? 'Pure Vegetarian Kitchens'
      : 'Partner Kitchens';

  return (
    <div className="flex items-baseline gap-2 text-sm text-stone-600">
      <span className="font-semibold text-stone-950 tabular-nums">
        {displayedCount}
      </span>
      <span>{label}</span>
      <span aria-hidden="true">·</span>
      <span className="tabular-nums">{pureVegCount} Pure Veg</span>
    </div>
  );
}
