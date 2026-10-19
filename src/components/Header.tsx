import React, { useState } from 'react';
import { Phone, MessageCircle, ShoppingBag, ShieldCheck, Menu, X, Train, Store, User, LogOut } from 'lucide-react';
import { SiteSettings } from '../types';
import { FOOD_CATEGORIES } from './CategoryIconBar.tsx';
import { CustomerUser } from './CustomerAuthModal.tsx';

interface HeaderProps {
  settings: SiteSettings;
  cartCount: number;
  onOpenCart: () => void;
  onSelectCategory: (category: string) => void;
  onOpenVendorRegister?: () => void;
  customer?: CustomerUser | null;
  onOpenAuthModal?: () => void;
  onLogoutCustomer?: () => void;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  cartCount,
  onOpenCart,
  onSelectCategory,
  onOpenVendorRegister,
  customer,
  onOpenAuthModal,
  onLogoutCustomer,
  onOpenAdmin
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // OWNER VERIFICATION: Only true for RailFoody official phone, email, or verified admin token
  const isOwner = Boolean(
    (customer && (
      customer.phone === '9752693979' || 
      customer.email?.toLowerCase() === 'railfoody@gmail.com' ||
      customer.email?.toLowerCase().includes('railfoody')
    )) ||
    (typeof window !== 'undefined' && localStorage.getItem('railfoody_admin_token'))
  );

  const cleanWaNumber = (settings.whatsappNumber || '9752693979').replace(/\D/g, '');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/60 shadow-xs">
      {/* Top micro announcement bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white text-xs py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {settings.announcementActive && settings.announcementText ? (
              <span className="font-bold text-amber-300 animate-pulse">
                📢 {settings.announcementText}
              </span>
            ) : (
              <>
                <span className="hidden sm:inline">Delivering at Jabalpur Junction (JBP) & Major Indian Railway Stations</span>
                <span className="sm:hidden">Train Food Delivery at Jabalpur & Beyond</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-200 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              100% FSSAI Approved
            </span>
            <a
              href={`https://wa.me/91${cleanWaNumber}?text=Hi%20Railfoody,%20I%20need%20assistance%20with%20my%20train%20food%20order`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-amber-300 hover:text-amber-200 font-semibold text-[11px]"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-amber-300" />
              Order WhatsApp: {settings.whatsappNumber || '9752693979'}
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo with 3D aesthetic */}
          <a href="#" className="flex items-center gap-3 group focus:outline-hidden">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden p-1 bg-gradient-to-br from-amber-400 via-amber-200 to-emerald-600 shadow-md group-hover:shadow-amber-400/30 transition-all duration-300">
              <img
                src={settings.logoUrl || '/src/assets/images/railfoody_logo_3d_1792004055907.jpg'}
                alt="Railfoody 3D Logo"
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-2xl sm:text-3xl font-black tracking-tight text-emerald-950 uppercase group-hover:text-amber-600 transition-colors">
                  RAIL<span className="text-amber-500">FOODY</span>
                </span>
                <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  IRCTC PARTNER
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-semibold text-stone-500 tracking-wide">
                {settings.tagline || "India's No. 1 Train Food Delivery"}
              </p>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-stone-700">
            <a href="#restaurants-section" className="hover:text-amber-600 transition-colors flex items-center gap-1.5">
              <Train className="w-4 h-4 text-emerald-700" />
              Food Menu
            </a>
            <a href="#restaurants-section" className="hover:text-amber-600 transition-colors">
              Restaurants
            </a>
            <div className="relative group py-2">
              <a href="#restaurants-section" className="hover:text-amber-600 transition-colors flex items-center gap-1">
                Food Menu
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-bold">Hot</span>
              </a>
              {/* Menu Categories dropdown */}
              <div className="absolute top-full left-0 hidden group-hover:grid grid-cols-2 w-72 bg-white border border-stone-200 shadow-xl rounded-xl p-2 z-50 gap-1">
                {FOOD_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onSelectCategory(cat.name);
                      const el = document.getElementById('restaurants-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex items-center gap-2 text-left px-2.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-amber-50 hover:text-amber-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 rounded-md object-contain bg-stone-100 shrink-0"
                    />
                    <span className="truncate">{cat.shortName}</span>
                  </button>
                ))}
              </div>
            </div>
            <a href="#how-it-works" className="hover:text-amber-600 transition-colors">
              How It Works
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Customer Login / Account Button */}
            {customer ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-xl transition-all cursor-pointer border border-stone-200"
                  title="My Account"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-black text-xs">
                    {customer.name ? customer.name.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <span className="hidden sm:inline text-xs font-bold truncate max-w-[100px]">
                    {customer.name.split(' ')[0]}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-stone-200 p-3 z-50 animate-fadeIn">
                    <div className="pb-2 mb-2 border-b border-stone-100">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-black text-stone-900 truncate max-w-[140px]">{customer.name}</p>
                        {isOwner && (
                          <span className="text-[9px] font-black bg-amber-400 text-stone-950 px-1.5 py-0.5 rounded tracking-wider">
                            OWNER
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500">{customer.phone || customer.email}</p>
                      <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOwner ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isOwner ? '👑 RailFoody Verified Owner' : '✓ Verified Passenger'}
                      </span>
                    </div>

                    {/* ONLY OWNER SEES THIS ADMIN BUTTON */}
                    {isOwner && onOpenAdmin && (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onOpenAdmin();
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-black text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-xs mb-2 cursor-pointer border border-amber-500/50 active:scale-95"
                      >
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-stone-950" />
                          <span>Admin Dashboard</span>
                        </span>
                        <span className="text-[10px] bg-stone-950 text-white px-1.5 py-0.5 rounded font-black">Open</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        if (onLogoutCustomer) onLogoutCustomer();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-amber-100 text-stone-850 hover:text-stone-950 font-bold text-xs rounded-xl transition-all border border-stone-200 hover:border-amber-300 cursor-pointer active:scale-95"
                title="Customer Login with Mobile or Gmail"
              >
                <User className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-black">Login</span>
              </button>
            )}

            {/* Owner Admin Button in Navbar (ONLY visible to verified owner) */}
            {isOwner && onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black text-xs rounded-xl shadow-xs border border-amber-500/40 transition-transform active:scale-95 cursor-pointer"
                title="Open Owner Admin Dashboard"
              >
                <ShieldCheck className="w-4 h-4 text-stone-950" />
                <span>Admin Panel</span>
              </button>
            )}

            {/* WhatsApp Quick Order button */}
            <a
              href={`https://wa.me/91${cleanWaNumber}?text=Hi%20Railfoody,%20I%20want%20to%20order%20food%20on%20my%20train`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm px-3 sm:px-4 py-2.5 rounded-xl shadow-xs transition-transform active:scale-95"
            >
              <MessageCircle className="w-4 h-4 text-emerald-200 fill-emerald-200" />
              <span>WhatsApp: {settings.whatsappNumber || '9752693979'}</span>
            </a>

            {/* Cart Button with Count badge */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-2"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5 text-stone-950" />
              <span className="hidden md:inline text-xs font-black uppercase tracking-wider">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-700 hover:bg-stone-100 rounded-xl"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          {/* Passenger Profile / Login Card in Mobile */}
          {customer ? (
            <div className="space-y-2">
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center">
                    {customer.name ? customer.name.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-black text-stone-900">{customer.name}</p>
                      {isOwner && (
                        <span className="text-[9px] font-black bg-amber-400 text-stone-950 px-1 rounded">
                          OWNER
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-stone-500">{customer.phone || customer.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onLogoutCustomer) onLogoutCustomer();
                  }}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg"
                >
                  Log Out
                </button>
              </div>

              {/* ONLY OWNER SEES THIS ADMIN BUTTON */}
              {isOwner && onOpenAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950 rounded-2xl font-black text-xs shadow-md border border-amber-400 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-stone-950" />
                    <span>👑 Owner Admin Dashboard</span>
                  </span>
                  <span className="text-[10px] bg-stone-950 text-white px-2 py-0.5 rounded font-black">Open</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {isOwner && onOpenAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950 rounded-2xl font-black text-xs shadow-md border border-amber-400 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-stone-950" />
                    <span>👑 Owner Admin Dashboard</span>
                  </span>
                  <span className="text-[10px] bg-stone-950 text-white px-2 py-0.5 rounded font-black">Open</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenAuthModal) onOpenAuthModal();
                }}
                className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 rounded-2xl text-stone-950 font-bold text-xs shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-600" />
                  <span>Passenger Login (Mobile OTP / Gmail)</span>
                </div>
                <span className="text-[11px] font-black text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full">
                  Login
                </span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenCart();
            }}
            className="w-full flex items-center justify-between p-3 bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-xs"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-stone-950" />
              <span>🛒 View Food Cart</span>
            </div>
            <span className="bg-stone-950 text-amber-400 px-2 py-0.5 rounded-full text-[11px]">
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </span>
          </button>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <a
              href="#restaurants-section"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 bg-stone-50 rounded-xl text-stone-800 flex items-center gap-2"
            >
              <Train className="w-4 h-4 text-emerald-700" /> Food Menu
            </a>
            <a
              href="#restaurants-section"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 bg-stone-50 rounded-xl text-stone-800"
            >
              Restaurants
            </a>
            <a
              href="#restaurants-section"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 bg-stone-50 rounded-xl text-stone-800"
            >
              Food Menu
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 bg-stone-50 rounded-xl text-stone-800"
            >
              How To Order
            </a>
          </div>

          <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
            <a
              href={`https://wa.me/91${cleanWaNumber}?text=Hi%20Railfoody,%20I%20want%20to%20order%20food%20on%20my%20train`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-emerald-700 text-white font-bold text-sm py-2.5 rounded-xl shadow-xs"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              WhatsApp: {settings.whatsappNumber || '9752693979'}
            </a>
            <a
              href={`tel:${settings.phone || '+919752693979'}`}
              className="w-full flex items-center justify-center gap-2 bg-stone-100 text-stone-800 font-bold text-xs py-2 rounded-xl"
            >
              <Phone className="w-3.5 h-3.5 text-stone-600" />
              Helpline: {settings.phone || '+91 9752693979'}
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
