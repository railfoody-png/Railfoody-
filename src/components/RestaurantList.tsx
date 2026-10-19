import React, { useState } from 'react';
import { Star, Clock, MapPin, ShieldCheck, MessageCircle, Utensils, CheckCircle, ChevronRight, Filter } from 'lucide-react';
import { Restaurant } from '../types';

interface RestaurantListProps {
  restaurants: Restaurant[];
  selectedStation: string;
  onSelectStation: (station: string) => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  whatsappNumber: string;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  onOpenVendorRegister?: () => void;
}

export const RestaurantList: React.FC<RestaurantListProps> = ({
  restaurants,
  selectedStation,
  onSelectStation,
  onSelectRestaurant,
  whatsappNumber,
  selectedCategory = 'All',
  onSelectCategory,
  onOpenVendorRegister
}) => {
  const [dietFilter, setDietFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const cleanWaNumber = (whatsappNumber || '9752693979').replace(/\D/g, '');

  const filteredRestaurants = restaurants.filter(r => {
    const matchesStation = selectedStation === 'ALL' || r.stationCode.toLowerCase() === selectedStation.toLowerCase();
    const matchesDiet = 
      dietFilter === 'ALL' || 
      (dietFilter === 'VEG' && r.vegOnly) || 
      (dietFilter === 'NON_VEG' && !r.vegOnly);
    const matchesSearch = !searchTerm.trim() || 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.stationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.cuisines.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = !selectedCategory || selectedCategory === 'All' ||
      r.cuisines.some(c => c.toLowerCase().includes(selectedCategory.toLowerCase()) || selectedCategory.toLowerCase().includes(c.toLowerCase())) ||
      (selectedCategory.toLowerCase().includes('jain') && r.vegOnly) ||
      (selectedCategory.toLowerCase().includes('satvik') && r.vegOnly) ||
      (selectedCategory.toLowerCase().includes('combos') && r.cuisines.some(c => c.toLowerCase().includes('meals') || c.toLowerCase().includes('thali'))) ||
      (selectedCategory.toLowerCase().includes('express') && r.prepTime.includes('20'));

    return matchesStation && matchesDiet && matchesSearch && matchesCategory;
  });

  const vegCount = restaurants.filter(r => r.vegOnly).length;
  const nonVegCount = restaurants.filter(r => !r.vegOnly).length;

  const stations = [
    { code: 'ALL', label: 'All Stations' },
    { code: 'JBP', label: 'Jabalpur Jn (JBP)' },
    { code: 'MML', label: 'Madan Mahal (MML)' },
    { code: 'KTE', label: 'Katni Jn (KTE)' },
    { code: 'ET', label: 'Itarsi Jn (ET)' },
  ];

  return (
    <section id="restaurants-section" className="py-12 sm:py-16 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Verified FSSAI Food Partners
            </div>
            <h2 className="font-heading text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
              Live Approved Restaurants ({restaurants.length})
            </h2>
            <p className="text-stone-600 text-sm sm:text-base mt-1">
              Top hygienic kitchens delivering fresh meals at Jabalpur Junction and major railway halts.
            </p>
          </div>

          {/* Diet Filters */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-200">
              <button
                onClick={() => setDietFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  dietFilter === 'ALL'
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                All ({restaurants.length})
              </button>
              <button
                onClick={() => setDietFilter('VEG')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  dietFilter === 'VEG'
                    ? 'bg-emerald-600 text-white'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Veg Only ({vegCount})
              </button>
              <button
                onClick={() => setDietFilter('NON_VEG')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  dietFilter === 'NON_VEG'
                    ? 'bg-rose-600 text-white'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Non-Veg ({nonVegCount})
              </button>
            </div>
          </div>

        {/* Station Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none">
          {stations.map(st => (
            <button
              key={st.code}
              onClick={() => onSelectStation(st.code)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedStation === st.code
                  ? 'bg-stone-900 text-amber-400 shadow-md'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Active Category Filter indicator */}
        {selectedCategory && selectedCategory !== 'All' && (
          <div className="mb-6 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>
                Filtered by Category: <strong className="font-bold text-amber-950 capitalize">{selectedCategory}</strong> ({filteredRestaurants.length} kitchens found)
              </span>
            </div>
            {onSelectCategory && (
              <button
                onClick={() => onSelectCategory('All')}
                className="font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer"
              >
                Show All Kitchens
              </button>
            )}
          </div>
        )}

        {/* Restaurant Cards Grid */}
        {filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map(restaurant => {
              const directWaMsg = encodeURIComponent(
                `Hi Railfoody, I would like to order from "${restaurant.name}" at ${restaurant.stationName} for my train. Please share available meals!`
              );
              const waUrl = `https://wa.me/91${cleanWaNumber}?text=${directWaMsg}`;

              return (
                <div
                  key={restaurant.id}
                  className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  {/* Card Image */}
                  <div
                    onClick={() => onSelectRestaurant(restaurant)}
                    className="relative h-48 sm:h-52 w-full overflow-hidden bg-stone-100 cursor-pointer"
                  >
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      {restaurant.vegOnly ? (
                        <span className="bg-emerald-600 text-white text-[11px] font-black px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          100% PURE VEG
                        </span>
                      ) : (
                        <span className="bg-amber-600 text-white text-[11px] font-black px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
                          VEG &amp; NON-VEG
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3 bg-stone-950/85 backdrop-blur-xs text-amber-400 text-xs font-black px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{restaurant.rating.toFixed(1)}</span>
                      <span className="text-[10px] text-stone-300">({restaurant.reviewCount})</span>
                    </div>

                    {/* Bottom Status strip */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-stone-950/90 to-transparent p-3 pt-6 flex items-center justify-between text-white text-xs">
                      <span className="flex items-center gap-1 font-semibold text-emerald-300">
                        <Clock className="w-3.5 h-3.5" />
                        Prep &amp; Delivery: {restaurant.prepTime}
                      </span>
                      <span className="text-stone-300 text-[11px]">
                        Min Order ₹{restaurant.minOrder}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3
                          onClick={() => onSelectRestaurant(restaurant)}
                          className="font-heading text-lg font-bold text-stone-900 group-hover:text-amber-600 transition-colors line-clamp-1 cursor-pointer"
                        >
                          {restaurant.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-semibold text-stone-600 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="line-clamp-1">{restaurant.stationName}</span>
                      </div>

                      <p className="text-xs text-stone-500 line-clamp-1 mb-3">
                        {restaurant.address}
                      </p>

                      {/* Cuisines Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {restaurant.cuisines.map((c, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-medium bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md"
                          >
                            {c}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-semibold mb-4 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>FSSAI Lic: <strong className="text-stone-700 font-mono">{restaurant.fssaiLicense}</strong></span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                      <button
                        onClick={() => onSelectRestaurant(restaurant)}
                        className="w-full inline-flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs py-2.5 rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
                      >
                        <Utensils className="w-3.5 h-3.5" />
                        <span>Select Food</span>
                      </button>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 rounded-xl transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-white" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-stone-200">
            <Utensils className="w-12 h-12 text-stone-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-800 mb-1">No restaurants match your filters</h3>
            <p className="text-xs text-stone-500 mb-4">Try clearing the station filter or toggling Pure Veg mode.</p>
            <button
              onClick={() => {
                onSelectStation('ALL');
                setDietFilter('ALL');
                setSearchTerm('');
              }}
              className="px-4 py-2 bg-amber-400 text-stone-950 font-bold text-xs rounded-xl cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
