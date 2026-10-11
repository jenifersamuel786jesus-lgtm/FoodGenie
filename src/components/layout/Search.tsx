import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store.ts';
import { setSearchKeyword } from '../../redux/slices/restaurantSlice.ts';
import { getRestaurants } from '../../redux/actions/restaurantAction.ts';
import { Search as SearchIcon, X } from 'lucide-react';

export default function Search() {
  const dispatch = useDispatch<AppDispatch>();
  const { searchKeyword, showVegOnly, sortBy } = useSelector(
    (state: RootState) => state.restaurants
  );
  const [inputVal, setInputVal] = useState(searchKeyword);

  useEffect(() => {
    setInputVal(searchKeyword);
  }, [searchKeyword]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setSearchKeyword(inputVal));
    dispatch(getRestaurants(inputVal, showVegOnly, sortBy));
  };

  const handleClear = () => {
    setInputVal('');
    dispatch(setSearchKeyword(''));
    dispatch(getRestaurants('', showVegOnly, sortBy));
  };

  return (
    <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <SearchIcon className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={inputVal}
          onChange={(e) => {
            setInputVal(e.target.value);
            dispatch(setSearchKeyword(e.target.value));
            dispatch(getRestaurants(e.target.value, showVegOnly, sortBy));
          }}
          placeholder="Search restaurants, pizza, burgers, pasta, salads..."
          className="w-full pl-10 pr-20 py-2.5 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
        />
        {inputVal && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-16 p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Find
        </button>
      </div>
    </form>
  );
}
