import React, { useState } from 'react';
import { 
  X, Star, Clock, ShieldCheck, MapPin, Search, Plus, Minus, 
  MessageCircle, ShoppingBag, Utensils, Sparkles, AlertCircle 
} from 'lucide-react';
import { Restaurant, FoodItem, CartItem, SiteSettings } from '../types';

interface RestaurantMenuModalProps {
  isOpen: boolean;
  restaurant: Restaurant | null;
  foodItems: FoodItem[];
  cart: CartItem[];
  onAddToCart: (item: FoodItem) => void;
  onRemoveFromCart: (itemId: string) => void;
  onOpenCart: () => void;
  onClose: () => void;
  settings: SiteSettings;
  journeyCriteria?: {
    trainQuery?: string;
    pnr?: string;
    coach?: string;
    berth?: string;
    journeyDate?: string;
  };
}

export const RestaurantMenuModal: React.FC<RestaurantMenuModalProps> = ({
  isOpen,
  restaurant,
  foodItems,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onOpenCart,
  onClose,
  settings,
  journeyCriteria
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dietFilter, setDietFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');

  if (!isOpen || !restaurant) return null;

  // Filter foods for this specific restaurant
  const restaurantFoods = foodItems.filter(f => f.restaurantId === restaurant.id);

  // Available categories for this restaurant
  const categories = ['All', ...Array.from(new Set(restaurantFoods.map(f => f.category)))];

  // Filtered foods based on search and diet filters
  const filteredFoods = restaurantFoods.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesDiet = 
      dietFilter === 'ALL' ||
      (dietFilter === 'VEG' && item.isVeg) ||
      (dietFilter === 'NON_VEG' && !item.isVeg);
    const matchesSearch = 
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesDiet && matchesSearch;
  });

  const getItemQuantity = (itemId: string): number => {
    const found = cart.find(c => c.foodItem.id === itemId);
    return found ? found.quantity : 0;
  };

  const totalCartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalCartValue = cart.reduce((acc, curr) => acc + curr.foodItem.price * curr.quantity, 0);

  // Items from this restaurant currently in cart
  const thisRestaurantCartItems = cart.filter(c => c.foodItem.restaurantId === restaurant.id);
  const thisRestaurantTotal = thisRestaurantCartItems.reduce((acc, curr) => acc + curr.foodItem.price * curr.quantity, 0);

  // Clean WhatsApp number
  const cleanWaNumber = (settings.whatsappNumber || '9752693979').replace(/\D/g, '');

  // Pre-fill WhatsApp message
  const generateWhatsAppUrl = () => {
    const itemsList = thisRestaurantCartItems.length > 0 
      ? thisRestaurantCartItems.map(c => `• ${c.foodItem.name} x ${c.quantity} (₹${c.foodItem.price * c.quantity})`).join('%0A')
      : `Interested in menu from ${restaurant.name}`;

    let msg = `*🚆 RAILFOODY TRAIN FOOD ORDER*%0A%0A`;
    msg += `*Restaurant:* ${restaurant.name} (${restaurant.stationName})%0A`;
    if (journeyCriteria?.trainQuery) msg += `*Train:* ${journeyCriteria.trainQuery}%0A`;
    if (journeyCriteria?.coach) msg += `*Coach/Seat:* ${journeyCriteria.coach} / ${journeyCriteria.berth || '--'}%0A`;
    if (journeyCriteria?.pnr) msg += `*PNR:* ${journeyCriteria.pnr}%0A`;
    if (journeyCriteria?.journeyDate) msg += `*Date:* ${journeyCriteria.journeyDate}%0A`;
    msg += `%0A*Selected Food Items:*%0A${itemsList}%0A`;
    if (thisRestaurantTotal > 0) msg += `%0A*Total Amount:* ₹${thisRestaurantTotal}%0A`;
    msg += `%0APlease confirm my train food delivery order.`;

    return `https://wa.me/91${cleanWaNumber}?text=${msg}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="relative bg-stone-900 text-white p-5 sm:p-6 border-b border-amber-400">
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={() => {
                onClose();
                onOpenCart();
              }}
              className="relative px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              title="Open Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart</span>
              {totalCartCount > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ml-0.5 border border-white">
                  {totalCartCount}
                </span>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-xl bg-stone-800/80 hover:bg-stone-700 transition-colors cursor-pointer"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                {restaurant.vegOnly ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    100% PURE VEG
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-amber-500 text-stone-950 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                    VEG &amp; NON-VEG
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] text-stone-300 bg-stone-800 px-2.5 py-0.5 rounded-full">
                  <MapPin className="w-3 h-3 text-rose-400" />
                  {restaurant.stationName}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  FSSAI: {restaurant.fssaiLicense}
                </span>
              </div>

              <h2 className="font-heading text-xl sm:text-2xl font-black text-white">
                {restaurant.name}
              </h2>

              <p className="text-xs text-stone-300 mt-0.5 line-clamp-1">
                {restaurant.address}
              </p>
            </div>

            {/* Quick stats badge */}
            <div className="flex items-center gap-3 bg-stone-800/80 p-2.5 rounded-2xl border border-stone-700/60 self-start sm:self-auto shrink-0">
              <div className="text-center px-1">
                <div className="flex items-center justify-center gap-1 text-amber-400 font-black text-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {restaurant.rating.toFixed(1)}
                </div>
                <div className="text-[10px] text-stone-400">({restaurant.reviewCount}+)</div>
              </div>
              <div className="w-px h-7 bg-stone-700" />
              <div className="text-center px-1">
                <div className="text-white font-bold text-xs flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  {restaurant.prepTime}
                </div>
                <div className="text-[10px] text-stone-400">Prep Time</div>
              </div>
              <div className="w-px h-7 bg-stone-700" />
              <div className="text-center px-1">
                <div className="text-emerald-400 font-bold text-xs">
                  ₹{restaurant.minOrder}
                </div>
                <div className="text-[10px] text-stone-400">Min Order</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="bg-stone-50 border-b border-stone-200 p-3 sm:p-4 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search dishes in ${restaurant.name}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Diet Filter */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-200 shrink-0 self-end sm:self-auto">
              <button
                onClick={() => setDietFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  dietFilter === 'ALL' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setDietFilter('VEG')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  dietFilter === 'VEG' ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Veg
              </button>
              {!restaurant.vegOnly && (
                <button
                  onClick={() => setDietFilter('NON_VEG')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                    dietFilter === 'NON_VEG' ? 'bg-rose-600 text-white' : 'text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Non-Veg
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          {categories.length > 2 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-amber-400 text-stone-950 shadow-xs'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Food Items Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredFoods.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFoods.map((food) => {
                const qty = getItemQuantity(food.id);
                return (
                  <div
                    key={food.id}
                    className="bg-white rounded-2xl border border-stone-200 p-4 flex gap-4 hover:border-amber-400/80 hover:shadow-md transition-all group"
                  >
                    {/* Food Image with Veg/Non-Veg Tag */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-stone-100 border border-stone-100">
                      <img
                        src={food.image}
                        alt={food.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-1.5 left-1.5 bg-white/90 backdrop-blur-xs p-1 rounded-sm shadow-xs">
                        <span
                          className={`block w-2.5 h-2.5 rounded-full ${
                            food.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Dish Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <h4 className="font-heading text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                            {food.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed mb-2">
                          {food.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                        <div>
                          <span className="font-heading font-black text-base text-stone-900">
                            ₹{food.price}
                          </span>
                          <span className="text-[10px] text-stone-400 block">
                            Fresh on Berth
                          </span>
                        </div>

                        {/* Add / Quantity Stepper */}
                        {qty === 0 ? (
                          <button
                            onClick={() => onAddToCart(food)}
                            className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>ADD</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 bg-stone-900 text-white rounded-xl px-2 py-1 shadow-xs">
                            <button
                              onClick={() => onRemoveFromCart(food.id)}
                              className="p-1 hover:bg-stone-800 rounded-lg text-amber-300 cursor-pointer"
                              title="Decrease"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-heading font-black text-xs px-1 text-white">
                              {qty}
                            </span>
                            <button
                              onClick={() => onAddToCart(food)}
                              className="p-1 hover:bg-stone-800 rounded-lg text-amber-300 cursor-pointer"
                              title="Increase"
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
            <div className="bg-stone-50 rounded-2xl p-10 text-center border border-stone-200">
              <Utensils className="w-10 h-10 text-stone-400 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-stone-800 mb-1">No items match your search</h4>
              <p className="text-xs text-stone-500 mb-4">Try clearing the search query or diet filter.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setDietFilter('ALL');
                  setSelectedCategory('All');
                }}
                className="px-3.5 py-1.5 bg-amber-400 text-stone-950 font-bold text-xs rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer / Action Bar */}
        <div className="bg-stone-900 text-white p-3.5 sm:p-5 border-t-2 border-amber-400 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-black shrink-0 shadow-md">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                  {totalCartCount > 0 ? `${totalCartCount} ${totalCartCount === 1 ? 'item' : 'items'} in cart` : 'Cart is empty'}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-black text-lg sm:text-xl text-white">
                    ₹{totalCartValue}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    Grand Total
                  </span>
                </div>
              </div>
            </div>

            {/* Quick WhatsApp Order Button */}
            <a
              href={generateWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-transform active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span className="hidden sm:inline">WhatsApp Order</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenCart();
              }}
              className="flex-2 sm:flex-none px-5 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-stone-900"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>🛒 View Cart &amp; Continue</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
