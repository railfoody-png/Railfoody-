import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, CheckCircle2, ChevronLeft, ChevronRight, Quote, Train, MapPin, Award } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  city: string;
  train: string;
  seat: string;
  station: string;
  rating: number;
  date: string;
  avatar: string;
  orderSummary: string;
  comment: string;
  tag: string;
}

const REVIEWS: Review[] = [
  {
    id: 'rev-1',
    name: 'Rajesh Sharma',
    city: 'New Delhi',
    train: '12192 Shridham Superfast Exp',
    seat: 'Coach B2 - Berth 41',
    station: 'Jabalpur Jn (JBP)',
    rating: 5,
    date: 'Yesterday',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    orderSummary: 'Deluxe Maharaja Thali + Gulab Jamun',
    comment: 'Piping hot food delivered straight to my window within 3 minutes of the train halting at Jabalpur. Roti was soft in foil, dal tadka tasted like home, and packaging was 100% leak-proof!',
    tag: 'Family Travel'
  },
  {
    id: 'rev-2',
    name: 'Priya Patel',
    city: 'Ahmedabad',
    train: '12853 Amarkantak Express',
    seat: 'Coach A1 - Berth 18',
    station: 'Bhopal Jn (BPL)',
    rating: 5,
    date: '2 days ago',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    orderSummary: 'Pure Jain Satvik Bhojan (No Onion/Garlic)',
    comment: 'Finding genuine Jain food while traveling by train was always a headache. RailFoody delivered pure satvik thali prepared in a segregated kitchen with green tape seal. Truly trustworthy!',
    tag: 'Pure Jain Food'
  },
  {
    id: 'rev-3',
    name: 'Col. Vikram Singh (Retd.)',
    city: 'Bhopal',
    train: '20173 Vande Bharat Express',
    seat: 'Executive Class - C2',
    station: 'Itarsi Jn (ET)',
    rating: 5,
    date: '3 days ago',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    orderSummary: 'Handi Dum Biryani + Chilled Lassi',
    comment: 'WhatsApp order process took less than 30 seconds. The delivery boy was standing right outside coach C2 holding my order ticket. Fragrant basmati rice and juicy paneer tikka. Outstanding service!',
    tag: 'Quick Delivery'
  },
  {
    id: 'rev-4',
    name: 'Dr. Sunita Deshmukh',
    city: 'Nagpur',
    train: '12188 Mumbai CSMT Garibrath',
    seat: 'Coach G8 - Berth 33',
    station: 'Jabalpur Jn (JBP)',
    rating: 5,
    date: '4 days ago',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    orderSummary: 'Indo-Chinese Combo + Hakka Noodles',
    comment: 'Traveling with two kids who refuse train pantry food. The Chinese combo was flavorful, not overly spicy, and sealed with food-grade containers. Kids finished every bite!',
    tag: 'Kids Favorite'
  },
  {
    id: 'rev-5',
    name: 'Amitabh Mukherjee',
    city: 'Kolkata',
    train: '12322 Kolkata Mail via Chheoki',
    seat: 'Coach S4 - Berth 22',
    station: 'Katni Jn (KTE)',
    rating: 5,
    date: '5 days ago',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    orderSummary: 'Special Paneer Butter Masala + Naan Pack',
    comment: 'My train was delayed by 45 minutes, yet RailFoody delivery team tracked the train live and handed over piping hot food without missing the halt. Professional customer support on WhatsApp!',
    tag: 'Live Train Tracking'
  }
];

export const CustomerReviews: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotating testimonials
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % REVIEWS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const current = REVIEWS[activeIndex];

  return (
    <section 
      id="customer-reviews"
      className="py-16 sm:py-20 bg-stone-900 text-white relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-400/30 mb-3">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Passenger Love & Trust</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Loved by 18,500+ Train Travelers
          </h2>
          <p className="text-stone-300 text-sm sm:text-base mt-3">
            Real reviews from verified train passengers who received fresh, hygienic restaurant food delivered right to their berths.
          </p>

          {/* Social Proof Stats Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-stone-800 text-left">
            <div className="bg-stone-800/60 p-3 sm:p-4 rounded-2xl border border-stone-700/60">
              <div className="flex items-center gap-1 text-amber-400 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="font-black text-xl sm:text-2xl text-white">4.9 / 5.0</p>
              <p className="text-xs text-stone-400">18,500+ Verified Ratings</p>
            </div>

            <div className="bg-stone-800/60 p-3 sm:p-4 rounded-2xl border border-stone-700/60">
              <p className="font-black text-xl sm:text-2xl text-emerald-400">99.4%</p>
              <p className="text-xs text-stone-200 font-bold mt-1">On-Time Berth Delivery</p>
              <p className="text-[11px] text-stone-400">Direct window delivery</p>
            </div>

            <div className="bg-stone-800/60 p-3 sm:p-4 rounded-2xl border border-stone-700/60">
              <p className="font-black text-xl sm:text-2xl text-amber-400">100%</p>
              <p className="text-xs text-stone-200 font-bold mt-1">FSSAI Certified</p>
              <p className="text-[11px] text-stone-400">Inspected hygiene</p>
            </div>

            <div className="bg-stone-800/60 p-3 sm:p-4 rounded-2xl border border-stone-700/60">
              <p className="font-black text-xl sm:text-2xl text-blue-400">50+ Hubs</p>
              <p className="text-xs text-stone-200 font-bold mt-1">JBP, BPL, ET, KTE</p>
              <p className="text-[11px] text-stone-400">Major railway junctions</p>
            </div>
          </div>
        </div>

        {/* Featured Testimonial Carousel Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-stone-800/90 to-stone-900/90 rounded-3xl p-6 sm:p-10 border border-stone-700/70 shadow-2xl relative">
            <Quote className="absolute top-6 right-6 w-16 h-16 text-stone-700/40 pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center gap-6 sm:gap-8">
              {/* Passenger Avatar & Details */}
              <div className="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-3 shrink-0 md:w-56 border-b sm:border-b-0 sm:border-r border-stone-700/70 pb-4 sm:pb-0 sm:pr-6">
                <img
                  src={current.avatar}
                  alt={current.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-lg"
                />
                <div>
                  <h3 className="font-heading font-black text-lg text-white leading-tight">
                    {current.name}
                  </h3>
                  <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                    <span>{current.city}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{current.date}</span>
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified Passenger</span>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div className="flex-1 space-y-4">
                {/* Stars and Category Tag */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    {[...Array(current.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-amber-300 ml-1">5.0 Star Meal</span>
                  </div>

                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-400 text-stone-950">
                    {current.tag}
                  </span>
                </div>

                {/* Quote Text */}
                <p className="text-stone-100 text-base sm:text-lg leading-relaxed italic">
                  "{current.comment}"
                </p>

                {/* Train & Journey Details Pill */}
                <div className="pt-3 border-t border-stone-800 flex flex-wrap items-center gap-3 text-xs text-stone-300">
                  <div className="flex items-center gap-1.5 bg-stone-950/60 px-3 py-1.5 rounded-xl border border-stone-800">
                    <Train className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-semibold text-white">{current.train}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-stone-950/60 px-3 py-1.5 rounded-xl border border-stone-800">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Delivered at <strong className="text-emerald-300">{current.station}</strong> ({current.seat})</span>
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 text-stone-400">
                    <span className="text-amber-400">Ordered:</span>
                    <span>{current.orderSummary}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Carousel Navigation Controls */}
            <div className="mt-6 pt-4 border-t border-stone-800 flex items-center justify-between">
              {/* Slide Dots */}
              <div className="flex items-center gap-2">
                {REVIEWS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === activeIndex ? 'w-8 bg-amber-400' : 'w-2 bg-stone-700 hover:bg-stone-500'
                    }`}
                    aria-label={`Go to review ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Prev / Next Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveIndex(prev => (prev - 1 + REVIEWS.length) % REVIEWS.length)}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-amber-400 hover:text-stone-950 text-white transition-all cursor-pointer"
                  title="Previous Review"
                  aria-label="Previous Review"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveIndex(prev => (prev + 1) % REVIEWS.length)}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-amber-400 hover:text-stone-950 text-white transition-all cursor-pointer"
                  title="Next Review"
                  aria-label="Next Review"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
