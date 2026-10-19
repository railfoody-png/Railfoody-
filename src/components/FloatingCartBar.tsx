import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';

interface FloatingCartBarProps {
  cart: CartItem[];
  onOpenCart: () => void;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  cart,
  onOpenCart
}) => {
  const totalCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalPrice = cart.reduce((acc, curr) => acc + curr.foodItem.price * curr.quantity, 0);

  if (totalCount === 0) return null;

  return (
    <div className="fixed bottom-4 inset-x-3 sm:inset-x-auto sm:right-6 sm:bottom-6 z-50 max-w-lg w-full mx-auto sm:w-[420px] transition-all animate-bounce-short">
      <div 
        onClick={onOpenCart}
        className="group bg-stone-950 text-white rounded-2xl p-3 sm:p-3.5 shadow-2xl border-2 border-amber-400 flex items-center justify-between gap-3 cursor-pointer hover:bg-stone-900 transition-all active:scale-[0.99] select-none"
        role="button"
        tabIndex={0}
        aria-label="View Cart"
      >
        {/* Left Side: Cart Icon & Count & Total */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-11 h-11 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-black shrink-0 shadow-md group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-6 h-6" />
            <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs border border-white">
              {totalCount}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 truncate">
                {totalCount} {totalCount === 1 ? 'ITEM' : 'ITEMS'} ADDED
              </span>
              <span className="text-stone-400 text-xs">•</span>
              <span className="font-heading font-black text-base sm:text-lg text-white">
                ₹{totalPrice}
              </span>
            </div>
            <p className="text-[11px] text-amber-300 font-bold truncate">
              Food selected! Tap to enter Train &amp; Seat details ➔
            </p>
          </div>
        </div>

        {/* Right Side: Enter Train Details Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenCart();
          }}
          className="shrink-0 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-transform group-hover:translate-x-0.5 active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          <span>Enter Train Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
