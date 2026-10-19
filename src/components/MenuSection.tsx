import React, { useState } from 'react';
import { Plus, Minus, Check, Clock, Star, Flame, Sparkles, Filter, X, Utensils } from 'lucide-react';
import { FoodItem, Restaurant, CartItem } from '../types';

interface MenuSectionProps {
  foodItems: FoodItem[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedRestaurant: Restaurant | null;
  onClearRestaurant: () => void;
  cart: CartItem[];
  onAddToCart: (item: FoodItem) => void;
  onRemoveFromCart: (itemId: string) => void;
  onOpenCart: () => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  foodItems,
  selectedCategory,
  onSelectCategory,
  selectedRestaurant,
  onClearRestaurant,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onOpenCart
}) => {
  const [dietFilter, setDietFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'All',
    'Thali',
    'Biryani',
    'Dal Rice',
    'Paneer',
    'Veg Meals',
    'Non-Veg Meals',
    'Chinese',
    'Snacks',
    'Beverages & Sweets'
  ];

  const filteredFoods = foodItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesRestaurant = !selectedRestaurant || item.restaurantId === selectedRestaurant.id;
    const matchesDiet =
      dietFilter === 'ALL' ||
      (dietFilter === 'VEG' && item.isVeg) ||
      (dietFilter === 'NON_VEG' && !item.isVeg);
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesRestaurant && matchesDiet && matchesSearch;
  });

  const getItemQuantity = (itemId: string): number => {
    const found = cart.find(c => c.foodItem.id === itemId);
    return found ? found.quantity : 0;
  };

  const totalCartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalCartValue = cart.reduce((acc, curr) => acc + curr.foodItem.price * curr.quantity, 0);

  return (
    <section id="menu-section" className="py-12 sm:py-20 bg-white border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            Hygienic Train Meal Menu
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 tracking-tight">
            Delicious Dishes Delivered Hot &amp; Fresh
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-2">
            Prepared fresh right before your train pulls into the station. Packaged in sealed, spill-proof microwave-safe containers.
          </p>
        </div>

        {/* Selected Restaurant Filter Indicator if active */}
        {selectedRestaurant && (
          <div className="mb-6 bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-400 text-stone-950">
                <Utensils className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs text-amber-800 font-semibold block">Showing menu exclusively from:</span>
                <span className="text-sm font-bold text-stone-900">{selectedRestaurant.name} ({selectedRestaurant.stationCode})</span>
              </div>
            </div>
            <button
              onClick={onClearRestaurant}
              className="text-xs font-bold text-stone-700 hover:text-rose-600 flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-xs cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Show All Kitchens
            </button>
          </div>
        )}

        {/* Filter Bar: Categories + Veg/NonVeg + Search */}
        <div className="space-y-4 mb-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-400 text-stone-950 shadow-md transform -translate-y-0.5'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Secondary Controls: Diet toggles and keyword search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            {/* Diet Filter Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDietFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  dietFilter === 'ALL'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                All Meals
              </button>

              <button
                onClick={() => setDietFilter('VEG')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  dietFilter === 'VEG'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
                Pure Veg
              </button>

              <button
                onClick={() => setDietFilter('NON_VEG')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  dietFilter === 'NON_VEG'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white" />
                Non-Veg
              </button>
            </div>

            {/* In-Menu Search */}
            <div className="w-full sm:w-72">
              <input
                type="text"
                placeholder="Search food in menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Menu Cards Grid */}
        {filteredFoods.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFoods.map(food => {
              const qty = getItemQuantity(food.id);

              return (
                <div
                  key={food.id}
                  className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:border-amber-300"
                >
                  <div>
                    {/* Food Thumbnail */}
                    <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                      <img
                        src={food.image}
                        alt={food.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />

                      {/* Veg / Non-Veg Indicator Symbol */}
                      <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs p-1 rounded-md shadow-xs">
                        <div
                          className={`w-4 h-4 border-2 flex items-center justify-center rounded-xs ${
                            food.isVeg ? 'border-emerald-600' : 'border-rose-600'
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              food.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Popular / Spicy Badge */}
                      {food.popular && (
                        <div className="absolute top-2.5 right-2.5 bg-amber-400 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                          <Flame className="w-3 h-3 text-rose-600 fill-rose-600" />
                          BESTSELLER
                        </div>
                      )}

                      {/* Preparation Time */}
                      <div className="absolute bottom-2 left-2 bg-stone-950/75 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-300" />
                        <span>{food.preparationTime}</span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <h3 className="font-heading text-base font-bold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                          {food.name}
                        </h3>
                      </div>

                      <div className="text-[11px] font-semibold text-emerald-800 mb-1.5 line-clamp-1">
                        {food.restaurantName || 'Railway Partner Kitchen'}
                      </div>

                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-3">
                        {food.description}
                      </p>
                    </div>
                  </div>

                  {/* Price & Add to Order Bar */}
                  <div className="p-4 pt-0">
                    <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase font-bold block">Price</span>
                        <span className="font-heading text-xl font-black text-stone-950">
                          ₹{food.price}
                        </span>
                      </div>

                      {/* Add Button or Quantity Selector */}
                      {qty === 0 ? (
                        <button
                          onClick={() => onAddToCart(food)}
                          disabled={!food.isAvailable}
                          className={`inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-black shadow-xs transition-transform active:scale-95 cursor-pointer ${
                            food.isAvailable
                              ? 'bg-amber-400 hover:bg-amber-500 text-stone-950'
                              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{food.isAvailable ? 'ADD' : 'SOLD OUT'}</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-stone-900 text-white rounded-xl p-1 shadow-md">
                          <button
                            onClick={() => onRemoveFromCart(food.id)}
                            className="p-1 hover:bg-stone-800 rounded-lg text-amber-300 cursor-pointer"
                            title="Decrease Quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-heading font-black text-xs px-1 text-white">
                            {qty}
                          </span>
                          <button
                            onClick={() => onAddToCart(food)}
                            className="p-1 hover:bg-stone-800 rounded-lg text-amber-300 cursor-pointer"
                            title="Increase Quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-stone-50 rounded-2xl p-12 text-center border border-stone-200 max-w-lg mx-auto">
            <Utensils className="w-12 h-12 text-stone-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-800 mb-1">No food items found</h3>
            <p className="text-xs text-stone-500 mb-4">Try selecting another category or resetting the diet filters.</p>
            <button
              onClick={() => {
                onSelectCategory('All');
                setDietFilter('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-amber-400 text-stone-950 font-bold text-xs rounded-xl"
            >
              Reset Menu Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
