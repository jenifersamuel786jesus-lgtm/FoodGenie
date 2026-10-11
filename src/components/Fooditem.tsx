import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store.ts';
import { FoodItem } from '../redux/slices/menuSlice.ts';
import {
  addItemToCart,
  updateCartQuantity,
  removeItemFromCart,
} from '../redux/actions/cartActions.ts';
import { Plus, Minus, Star, Utensils } from 'lucide-react';

interface FooditemProps {
  fooditem: FoodItem;
  restaurantId: string;
}

export default function Fooditem({ fooditem, restaurantId }: FooditemProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { cartItems } = useSelector((state: RootState) => state.cart);
  const [imgError, setImgError] = useState(false);

  const existingEntry = cartItems.find(
    (entry) => entry.fooditem._id === fooditem._id
  );
  const quantity = existingEntry ? existingEntry.quantity : 0;

  const handleAdd = () => {
    if (fooditem.stock <= 0) return;
    dispatch(addItemToCart(fooditem._id, restaurantId, 1));
  };

  const handleIncrement = () => {
    if (quantity < fooditem.stock) {
      dispatch(updateCartQuantity(fooditem._id, quantity + 1));
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      dispatch(updateCartQuantity(fooditem._id, quantity - 1));
    } else {
      dispatch(removeItemFromCart(fooditem._id));
    }
  };

  const imageUrl = fooditem.images?.[0]?.url;

  return (
    <div className="bg-white border border-stone-200/90 rounded-xl overflow-hidden flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5">
      <div>
        <div className="aspect-[4/3] w-full bg-stone-100 overflow-hidden relative">
          {!imgError && imageUrl ? (
            <img
              src={imageUrl}
              alt={fooditem.name}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-400 p-4">
              <Utensils className="w-7 h-7 mb-1.5" />
              <span className="text-xs text-stone-600 text-center font-medium">
                {fooditem.name}
              </span>
            </div>
          )}
        </div>

        <div className="p-5">
          {/* Unboxed dietary and prep metadata */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1.5">
            <span className={fooditem.isVeg ? 'text-emerald-700 font-medium' : 'text-amber-800 font-medium'}>
              {fooditem.isVeg ? 'Vegetarian' : 'Non-Veg'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{fooditem.calories} kcal</span>
            <span aria-hidden="true">·</span>
            <span>{fooditem.prepTime}</span>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <h4 className="text-base font-semibold text-stone-900">
              {fooditem.name}
            </h4>
            <span className="text-base font-semibold text-stone-950 tabular-nums shrink-0">
              ${fooditem.price.toFixed(2)}
            </span>
          </div>

          <p className="text-xs text-stone-600 mt-2 leading-relaxed line-clamp-2">
            {fooditem.description}
          </p>
        </div>
      </div>

      <div className="px-5 py-3.5 border-t border-stone-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-xs text-stone-600 tabular-nums">
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span className="font-semibold text-stone-900">
            {fooditem.ratings.toFixed(1)}
          </span>
          <span className="text-stone-400">({fooditem.numOfReviews})</span>
          <span aria-hidden="true">·</span>
          <span className={fooditem.stock > 0 ? 'text-stone-500' : 'text-red-600'}>
            {fooditem.stock > 0 ? 'In Stock' : 'Sold Out'}
          </span>
        </div>

        {quantity === 0 ? (
          <button
            type="button"
            disabled={fooditem.stock <= 0}
            onClick={handleAdd}
            className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-amber-800 disabled:bg-stone-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Add to Bag
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 bg-stone-900 text-white rounded-lg px-2 py-1">
            <button
              type="button"
              onClick={handleDecrement}
              aria-label="Decrease quantity"
              className="p-1 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-semibold tabular-nums min-w-[1.25rem] text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              aria-label="Increase quantity"
              className="p-1 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
