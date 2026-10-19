import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export interface CategoryItem {
  id: string;
  name: string;
  shortName: string;
  tag?: string;
  image: string;
  description: string;
}

export const FOOD_CATEGORIES: CategoryItem[] = [
  {
    id: 'biryani',
    name: 'Biryani',
    shortName: 'Biryani',
    tag: 'Bestseller',
    image: '/src/assets/images/cat_biryani_icon_1792361770033.jpg',
    description: 'Dum Biryani, Handi Biryani & Rice Combos'
  },
  {
    id: 'thali',
    name: 'Thali',
    shortName: 'Thali',
    tag: 'Most Loved',
    image: '/src/assets/images/cat_thali_icon_1792361771707.jpg',
    description: 'Maharaja, Deluxe, Standard & Veg Thalis'
  },
  {
    id: 'chinese',
    name: 'Chinese',
    shortName: 'Chinese',
    image: '/src/assets/images/cat_chinese_icon_1792361772315.jpg',
    description: 'Noodles, Manchurian, Fried Rice & Momos'
  },
  {
    id: 'south_indian',
    name: 'South Indian',
    shortName: 'South Indian',
    image: '/src/assets/images/cat_south_indian_1792361773234.jpg',
    description: 'Crispy Dosas, Idli Sambar & Vada'
  },
  {
    id: 'pizza',
    name: 'Pizza',
    shortName: 'Pizza',
    tag: 'Cheesy',
    image: '/src/assets/images/cat_pizza_icon_1792361773030.jpg',
    description: 'Fresh Hot Cheesy Pizzas'
  },
  {
    id: 'burgers',
    name: 'Burgers',
    shortName: 'Burgers',
    image: '/src/assets/images/cat_burger_icon_1792361774646.jpg',
    description: 'Crispy Patty Burgers & French Fries'
  },
  {
    id: 'combos',
    name: 'Combos / Quick Meals',
    shortName: 'Combos',
    tag: 'Quick Delivery',
    image: '/src/assets/images/cat_combo_icon_1792361775620.jpg',
    description: 'Meal Boxes, Paratha Combos & Rice Meals'
  },
  {
    id: 'sweets',
    name: 'Sweets',
    shortName: 'Sweets',
    image: '/src/assets/images/cat_sweets_icon_1792361775923.jpg',
    description: 'Gulab Jamun, Rasgulla & Traditional Mithai'
  },
  {
    id: 'drinks',
    name: 'Drinks / Beverages',
    shortName: 'Drinks',
    image: '/src/assets/images/cat_drinks_icon_1792361777546.jpg',
    description: 'Masala Chai, Lassi, Shakes & Juices'
  },
  {
    id: 'rolls',
    name: 'Rolls',
    shortName: 'Rolls',
    image: '/src/assets/images/cat_rolls_icon_1792361778651.jpg',
    description: 'Paneer Tikka Rolls, Kathi & Frankies'
  },
  {
    id: 'jain_meals',
    name: 'Jain Meals',
    shortName: 'Jain Meals',
    tag: 'No Onion Garlic',
    image: '/src/assets/images/cat_jain_meal_1792361779415.jpg',
    description: 'Pure Jain Certified Train Bhojan'
  },
  {
    id: 'satvik_meals',
    name: 'Satvik Meals',
    shortName: 'Satvik Meals',
    tag: 'Ayurvedic',
    image: '/src/assets/images/cat_satvik_meal_1792361780198.jpg',
    description: 'Fresh Khichdi, Ghee Roti & Light Food'
  },
  {
    id: 'express_meals',
    name: 'Express Meals',
    shortName: 'Express Meals',
    tag: '20 Min Halts',
    image: '/src/assets/images/cat_express_meal_1792361782336.jpg',
    description: 'Pre-packed Quick Station Delivery Boxes'
  },
  {
    id: 'group_meals',
    name: 'Group Meals',
    shortName: 'Group Meals',
    tag: 'Big Groups',
    image: '/src/assets/images/cat_group_meal_1792361781614.jpg',
    description: 'Family Packs & Tour Group Catering'
  },
  {
    id: 'cakes',
    name: 'Cakes',
    shortName: 'Cakes',
    tag: 'Birthdays',
    image: '/src/assets/images/cat_cake_icon_1792361781601.jpg',
    description: 'Birthday Celebrations & Bakery Pastries'
  }
];

interface CategoryIconBarProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryIconBar: React.FC<CategoryIconBarProps> = ({
  selectedCategory,
  onSelectCategory
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (cat: CategoryItem) => {
    if (selectedCategory.toLowerCase() === cat.name.toLowerCase() || selectedCategory.toLowerCase() === cat.id.toLowerCase()) {
      onSelectCategory('All');
    } else {
      onSelectCategory(cat.name);
    }

    // Scroll to restaurants section for instant browsing
    const el = document.getElementById('restaurants-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="bg-white border-y border-stone-200 py-6 sm:py-8 shadow-xs relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header bar */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 mb-0.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Inspiration For Your Train Journey</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-stone-900 tracking-tight font-heading">
              Explore What's On Your Mind
            </h2>
          </div>

          {/* Desktop Left/Right Scroll Arrows */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              aria-label="Scroll left"
              className="p-2 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 shadow-xs transition-colors cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              aria-label="Scroll right"
              className="p-2 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 shadow-xs transition-colors cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 15 Category Scroll Track */}
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x snap-mandatory focus:outline-hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {FOOD_CATEGORIES.map((cat, idx) => {
            const isSelected =
              selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
              selectedCategory.toLowerCase() === cat.id.toLowerCase();

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                type="button"
                className={`flex flex-col items-center group shrink-0 w-24 sm:w-28 text-center transition-all duration-200 cursor-pointer snap-start focus:outline-hidden ${
                  isSelected ? 'scale-105' : 'hover:-translate-y-1'
                }`}
                title={cat.description}
              >
                {/* 1:1 Square Realistic App Icon Container */}
                <div
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-1.5 transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-md ring-4 ring-amber-200'
                      : 'bg-stone-50 border border-stone-200 group-hover:border-amber-300 group-hover:shadow-md'
                  }`}
                >
                  {/* Subtle Badge Tag if available */}
                  {cat.tag && (
                    <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tight bg-stone-900 text-amber-300 rounded-full shadow-xs whitespace-nowrap">
                      {cat.tag}
                    </span>
                  )}

                  {/* Icon Image */}
                  <div className="w-full h-full rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-inner">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain p-0.5 group-hover:scale-108 transition-transform duration-300 ease-out"
                      loading={idx < 6 ? 'eager' : 'lazy'}
                    />
                  </div>
                </div>

                {/* Category Label */}
                <span
                  className={`mt-2 text-xs sm:text-sm font-bold line-clamp-1 transition-colors ${
                    isSelected
                      ? 'text-amber-600 font-extrabold'
                      : 'text-stone-700 group-hover:text-stone-950'
                  }`}
                >
                  {cat.shortName}
                </span>

                {/* Subtitle / Indicator */}
                <span className="text-[10px] text-stone-400 font-medium">
                  {isSelected ? 'Active' : 'Order Now'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Category Notice pill (if any selected) */}
        {selectedCategory !== 'All' && selectedCategory !== '' && (
          <div className="mt-3 flex items-center justify-between bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl text-xs">
            <span className="text-amber-900 font-medium">
              Showing kitchens offering{' '}
              <strong className="font-bold text-amber-950">{selectedCategory}</strong>
            </span>
            <button
              onClick={() => onSelectCategory('All')}
              className="font-bold text-amber-700 hover:text-amber-900 underline ml-2 cursor-pointer"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
