import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, Heart, Train, ChevronRight } from 'lucide-react';
import { SiteSettings } from '../types';
import { PolicyType } from './PolicyModal';

interface FooterProps {
  settings: SiteSettings;
  onOpenPolicy: (type: PolicyType) => void;
  onOpenVendorRegister?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenPolicy,
  onOpenVendorRegister
}) => {
  const cleanWaNumber = (settings.whatsappNumber || '9752693979').replace(/\D/g, '');

  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t-4 border-amber-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top 3D Social Buttons Ribbon */}
        <div className="bg-stone-900 rounded-3xl p-6 sm:p-8 mb-12 border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <span className="text-xs font-black uppercase text-amber-400 tracking-wider block mb-1">
              Connect With Us
            </span>
            <h3 className="font-heading text-xl sm:text-2xl font-black text-white">
              Follow Railfoody &amp; Order on Official Channels
            </h3>
            <p className="text-stone-400 text-xs sm:text-sm mt-0.5">
              Available 24x7 for train food delivery inquiries &amp; bulk group train catering.
            </p>
          </div>

          {/* 3D Social Icons */}
          <div className="flex items-center gap-4">
            {/* 3D WhatsApp Button */}
            <a
              href={`https://wa.me/91${cleanWaNumber}?text=Hi%20Railfoody,%20I%20would%20like%20to%20order%20food%20on%20my%20train`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-3 sm:px-5 sm:py-3 rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-700 text-white font-bold text-xs flex items-center gap-2.5 shadow-lg shadow-emerald-950/60 hover:shadow-emerald-500/40 transform hover:-translate-y-1 active:translate-y-0 transition-all border-t border-emerald-300"
              title="Official WhatsApp: 9752693979"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </div>
              <span className="hidden sm:inline">WhatsApp Us</span>
            </a>

            {/* 3D Instagram Button */}
            <a
              href={settings.instagramUrl || 'https://instagram.com/railfoody'}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-3 sm:px-5 sm:py-3 rounded-2xl bg-gradient-to-b from-rose-500 via-pink-600 to-purple-700 text-white font-bold text-xs flex items-center gap-2.5 shadow-lg shadow-pink-950/60 hover:shadow-pink-500/40 transform hover:-translate-y-1 active:translate-y-0 transition-all border-t border-pink-300"
              title="Official Instagram"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
              <span className="hidden sm:inline">Instagram</span>
            </a>

            {/* 3D Facebook Button */}
            <a
              href={settings.facebookUrl || 'https://facebook.com/railfoody'}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-3 sm:px-5 sm:py-3 rounded-2xl bg-gradient-to-b from-blue-500 to-blue-700 text-white font-bold text-xs flex items-center gap-2.5 shadow-lg shadow-blue-950/60 hover:shadow-blue-500/40 transform hover:-translate-y-1 active:translate-y-0 transition-all border-t border-blue-300"
              title="Official Facebook"
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.657 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z" />
                </svg>
              </div>
              <span className="hidden sm:inline">Facebook</span>
            </a>
          </div>
        </div>

        {/* 4-Column Footer Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-amber-400 p-0.5">
                <img
                  src={settings.logoUrl || '/src/assets/images/railfoody_logo_3d_1792004055907.jpg'}
                  alt="Railfoody Logo"
                  className="w-full h-full object-cover rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="font-heading text-xl font-black text-white">
                  RAIL<span className="text-amber-400">FOODY</span>
                </span>
                <p className="text-[11px] font-semibold text-amber-300">
                  {settings.tagline || "India's No. 1 Train Food Delivery"}
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              Delivering restaurant-fresh, hot, and hygienic Indian meals straight to your train seat. Operating across Jabalpur Junction and major Indian Railways lines.
            </p>

            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                FSSAI Central Lic: {settings.fssaiNumber || '11423850001245'}
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-stone-800 pb-2">
              Explore &amp; Order
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <a href="#restaurants-section" className="hover:text-amber-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  Order Food on Train
                </a>
              </li>
              <li>
                <a href="#restaurants-section" className="hover:text-amber-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  Approved Kitchens &amp; Vendors
                </a>
              </li>
              {onOpenVendorRegister && (
                <li>
                  <button
                    onClick={onOpenVendorRegister}
                    className="hover:text-amber-300 flex items-center gap-1.5 transition-colors text-amber-400 font-bold cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                    + Add Your Restaurant (Vendor Partner)
                  </button>
                </li>
              )}
              <li>
                <a href="#how-it-works" className="hover:text-amber-400 flex items-center gap-1.5 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  How Seat Delivery Works
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Railway Delivery Policies */}
          <div>
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-stone-800 pb-2">
              Customer Policies
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={() => onOpenPolicy('about')}
                  className="hover:text-amber-400 text-left transition-colors cursor-pointer"
                >
                  About Railfoody
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('privacy')}
                  className="hover:text-amber-400 text-left transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('terms')}
                  className="hover:text-amber-400 text-left transition-colors cursor-pointer"
                >
                  Terms and Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('refund')}
                  className="hover:text-amber-400 text-left transition-colors cursor-pointer"
                >
                  Refund and Cancellation Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('delivery')}
                  className="hover:text-amber-400 text-left transition-colors cursor-pointer"
                >
                  Train Food Delivery Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Operations */}
          <div>
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-stone-800 pb-2">
              Headquarters &amp; Support
            </h4>
            <div className="space-y-3 text-xs text-stone-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  {settings.address || 'Platform 1 Circulating Area, Jabalpur Junction Railway Station, MP 482001'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`tel:${settings.phone || '+919752693979'}`} className="hover:text-white">
                  {settings.phone || '+91 9752693979'}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${settings.email || 'railfoody@gmail.com'}`} className="hover:text-white">
                  {settings.email || 'railfoody@gmail.com'}
                </a>
              </div>
              <div className="pt-2 text-[11px] text-stone-500">
                <span>Operational Stations: JBP (Jabalpur), ET (Itarsi), KTE (Katni), BPL (Bhopal), STA (Satna), VGLJ (Jhansi).</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Disclaimer Bar */}
        <div className="pt-8 border-t border-stone-800 text-center sm:flex sm:items-center sm:justify-between text-xs text-stone-500 space-y-2 sm:space-y-0">
          <p>
            &copy; {new Date().getFullYear()} <strong>{settings.brandName || 'Railfoody'}</strong>. All rights reserved. India's No. 1 Train Food Delivery.
          </p>
          <div className="flex items-center justify-center gap-4 text-[11px]">
            <span>Secured with HTTPS &amp; 256-bit SSL</span>
            <span>•</span>
            <span>IRCTC Friendly Ordering</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
