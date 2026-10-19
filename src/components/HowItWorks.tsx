import React from 'react';
import { Search, Utensils, MessageCircle, Bike, ShieldCheck, HeartHandshake, Sparkles, Clock, CheckCircle } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Search Train & Berth',
      desc: 'Enter your train number (e.g. 12192 Shridham), journey date, and boarding station like Jabalpur Junction.',
      icon: Search,
      color: 'bg-amber-100 text-amber-800'
    },
    {
      num: '02',
      title: 'Choose Favorite Meals',
      desc: 'Pick Maharaja Thalis, Dum Biryanis, hot Dal Rice, Paneer Combos, or snacks from verified kitchens.',
      icon: Utensils,
      color: 'bg-emerald-100 text-emerald-800'
    },
    {
      num: '03',
      title: 'Send Order on WhatsApp',
      desc: 'Tap "Place Order on WhatsApp" to dispatch your pre-formatted order message directly to 9752693979.',
      icon: MessageCircle,
      color: 'bg-amber-100 text-amber-800'
    },
    {
      num: '04',
      title: 'Delivery at Your Seat',
      desc: 'Our delivery partner waits at your coach with piping hot, sealed food when the train reaches the platform.',
      icon: Bike,
      color: 'bg-emerald-100 text-emerald-800'
    }
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-gradient-to-b from-stone-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full">
            Simple 4-Step Process
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-black text-stone-900 mt-2">
            How Train Food Delivery Works
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-2">
            No messy pantry cars or unhygienic platform vendors. Enjoy restaurant-grade meals right at your train window.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 relative group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.color} shadow-xs`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="font-heading text-4xl font-black text-stone-200 group-hover:text-amber-400 transition-colors">
                      {s.num}
                    </span>
                  </div>

                  <h3 className="font-heading text-lg font-bold text-stone-900 mb-2">
                    {s.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Guaranteed Fresh</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
