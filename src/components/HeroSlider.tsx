import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle, ArrowRight, ShieldCheck, Clock, Award } from 'lucide-react';
import { SliderBanner } from '../types';

interface HeroSliderProps {
  banners: SliderBanner[];
  whatsappNumber: string;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ banners, whatsappNumber }) => {
  const activeBanners = banners.filter(b => b.active);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeBanners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeBanners.length, isPaused]);

  if (!activeBanners.length) return null;

  const current = activeBanners[currentIndex];
  const cleanWaNumber = (whatsappNumber || '9752693979').replace(/\D/g, '');

  return (
    <section 
      className="relative bg-stone-950 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Banner Container: compact 390-400px on mobile, standard full height on desktop */}
      <div className="relative w-full h-[400px] sm:h-[520px] md:h-[580px] lg:h-[620px]">
        {activeBanners.map((banner, index) => {
          const isCurrent = index === currentIndex;
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Image with crisp rendering */}
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover object-center transform scale-105 duration-10000 transition-transform"
                referrerPolicy="no-referrer"
              />

              {/* Rich Gradient Overlay for high-contrast legible typography */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-stone-950/30 md:bg-gradient-to-r md:from-stone-950/90 md:via-stone-950/60 md:to-transparent" />

              {/* Banner Content with reduced padding on mobile */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-2xl text-white space-y-2.5 sm:space-y-4 md:space-y-5">
                    {/* Compact Badge */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-amber-400/95 text-stone-950 text-[11px] sm:text-xs font-black uppercase tracking-wide shadow-md backdrop-blur-xs">
                      <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-950 shrink-0" />
                      <span className="truncate max-w-[260px] sm:max-w-none">{banner.badge || "India's No. 1 Train Food Delivery"}</span>
                    </div>

                    {/* Headline: 30-34px on mobile, max 2-3 lines */}
                    <h1 className="font-heading text-[30px] sm:text-5xl md:text-6xl font-black text-white leading-[1.15] sm:leading-tight drop-shadow-md line-clamp-2 sm:line-clamp-none">
                      {banner.title}
                    </h1>

                    {/* Subtitle / Description: 14-16px on mobile */}
                    <p className="text-stone-200 text-[14px] sm:text-lg md:text-xl font-normal leading-snug sm:leading-relaxed drop-shadow-sm line-clamp-2 sm:line-clamp-none">
                      {banner.subtitle}
                    </p>

                    {/* Action Button: Exactly ONE main compact yellow WhatsApp button (height 48-50px) on mobile */}
                    <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-3">
                      <a
                        href={`https://wa.me/91${cleanWaNumber}?text=Hi%20Railfoody,%20I%20want%20to%20order%20fresh%20food%20on%20my%20train`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-sm sm:text-base px-5 sm:px-6 h-[48px] sm:h-[50px] rounded-xl shadow-lg hover:shadow-amber-400/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                      >
                        <MessageCircle className="w-5 h-5 fill-stone-950 text-stone-950 shrink-0" />
                        <span>Order on WhatsApp</span>
                      </a>

                      {/* Desktop only secondary link to avoid duplicate WhatsApp buttons */}
                      {banner.ctaLink && !banner.ctaLink.includes('wa.me') && (
                        <a
                          href={banner.ctaLink}
                          className="hidden sm:inline-flex items-center gap-2 bg-stone-900/80 hover:bg-stone-800 text-white font-bold text-sm px-5 h-[50px] rounded-xl border border-stone-700/60 transition-all"
                        >
                          <span>{banner.ctaText || 'Search Trains'}</span>
                          <ArrowRight className="w-4 h-4 text-amber-400" />
                        </a>
                      )}
                    </div>

                    {/* Compact Trust Indicators */}
                    <div className="pt-0.5 sm:pt-1 flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-semibold text-stone-300">
                      <div className="flex items-center gap-1.5 bg-stone-900/60 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-stone-800">
                        <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                        <span>FSSAI Certified</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-stone-900/60 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-stone-800">
                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                        <span>Delivery at Train Berth</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Small & Neatly Positioned Carousel Arrows */}
        <button
          onClick={() => setCurrentIndex(prev => (prev - 1 + activeBanners.length) % activeBanners.length)}
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-stone-900/70 hover:bg-amber-400 text-white hover:text-stone-950 backdrop-blur-xs transition-all border border-stone-700/50 shadow-md focus:outline-hidden"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={() => setCurrentIndex(prev => (prev + 1) % activeBanners.length)}
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-stone-900/70 hover:bg-amber-400 text-white hover:text-stone-950 backdrop-blur-xs transition-all border border-stone-700/50 shadow-md focus:outline-hidden"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
        </button>

        {/* Indicator Dots */}
        <div className="absolute bottom-2.5 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
          {activeBanners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`transition-all duration-300 rounded-full ${
                i === currentIndex
                  ? 'w-6 sm:w-10 h-2 sm:h-2.5 bg-amber-400 shadow-md'
                  : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/40 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
