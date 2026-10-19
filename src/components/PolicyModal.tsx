import React from 'react';
import { X, ShieldCheck, FileText, RefreshCw, Truck } from 'lucide-react';

export type PolicyType = 'about' | 'privacy' | 'terms' | 'refund' | 'delivery';

interface PolicyModalProps {
  policyType: PolicyType | null;
  onClose: () => void;
  brandName: string;
  whatsappNumber: string;
  phone: string;
  email: string;
  address: string;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  policyType,
  onClose,
  brandName,
  whatsappNumber,
  phone,
  email,
  address
}) => {
  if (!policyType) return null;

  const contentMap: Record<PolicyType, { title: string; icon: any; content: React.ReactNode }> = {
    about: {
      title: `About ${brandName}`,
      icon: ShieldCheck,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
          <p>
            <strong>{brandName}</strong> is India's premier train food delivery platform, dedicated to transforming the dining experience of railway passengers across the nation. Headquartered with its primary operational hub at <strong>Jabalpur Junction (JBP)</strong>, we connect train passengers with trusted, FSSAI-certified restaurant partners.
          </p>
          <p>
            We eliminate the uncertainty of pantry car meals and unhygienic platform food stalls. Every meal is freshly cooked in authorized commercial kitchens shortly before the train's scheduled arrival, packaged in spill-proof and heat-retaining food containers, and delivered directly to the passenger's train seat and berth.
          </p>
          <h4 className="font-bold text-stone-900 text-sm">Our Core Pillars:</h4>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>100% Food Safety &amp; Hygiene:</strong> All food preparation complies with FSSAI regulations.</li>
            <li><strong>On-Time Platform Delivery:</strong> Trained delivery personnel coordinate with live train running to meet you at your coach door or window.</li>
            <li><strong>Convenient WhatsApp Ordering:</strong> Direct, seamless ordering through WhatsApp (+91 {whatsappNumber}) with real-time support.</li>
            <li><strong>Wide Culinary Choices:</strong> Authentic North Indian Thalis, South Indian delicacies, Royal Dum Biryanis, Jain Satvik Bhojan, and evening snacks.</li>
          </ul>
        </div>
      )
    },
    privacy: {
      title: 'Privacy Policy',
      icon: FileText,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
          <p>
            This Privacy Policy governs the manner in which {brandName} collects, uses, maintains, and discloses information collected from users of our website and WhatsApp ordering services.
          </p>
          <h4 className="font-bold text-stone-900 text-sm">Information We Collect:</h4>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Passenger name and mobile phone number for delivery coordination and order updates.</li>
            <li>Train details including train number, PNR, journey date, boarding station, coach number, and seat/berth number.</li>
            <li>Dietary preferences and special delivery instructions.</li>
          </ul>
          <h4 className="font-bold text-stone-900 text-sm">How We Protect &amp; Use Your Data:</h4>
          <p>
            We use your contact and journey details exclusively for preparing and delivering your meal. We do not sell, trade, or rent personal identification information to third parties. Your details are shared only with the preparing kitchen partner and the assigned platform delivery partner for fulfilling the train delivery.
          </p>
          <p>
            For any privacy inquiries or data requests, contact us at <a href={`mailto:${email}`} className="text-amber-700 underline">{email}</a>.
          </p>
        </div>
      )
    },
    terms: {
      title: 'Terms and Conditions',
      icon: FileText,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
          <p>
            By accessing {brandName} or placing an order via our website and WhatsApp, you agree to comply with and be bound by the following terms and conditions:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Order Placement:</strong> Orders must be placed with sufficient advance time before the train arrives at the designated station (minimum 30–45 minutes recommended).</li>
            <li><strong>Order Confirmation:</strong> An order initiated on the website is confirmed only after our team or the partner restaurant acknowledges receipt on WhatsApp.</li>
            <li><strong>Train Delays &amp; Schedule Changes:</strong> While our delivery partners monitor train movements, passengers are requested to inform our helpline in case of sudden rescheduling, diversion, or platform changes.</li>
            <li><strong>Accurate Details:</strong> Passengers are responsible for providing correct PNR, coach, and berth details to facilitate prompt delivery.</li>
          </ul>
        </div>
      )
    },
    refund: {
      title: 'Refund and Cancellation Policy',
      icon: RefreshCw,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
          <p>
            At {brandName}, customer satisfaction and transparent railway service are our top priorities.
          </p>
          <h4 className="font-bold text-stone-900 text-sm">Cancellation Rules:</h4>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Cancellations are accepted without any charge up to 60 minutes before the train's scheduled arrival at the delivery station.</li>
            <li>Once food preparation has commenced or the delivery partner has dispatched the order to the railway platform, cancellation may not be possible.</li>
          </ul>
          <h4 className="font-bold text-stone-900 text-sm">Refund Eligibility:</h4>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>100% Immediate Refund:</strong> If a delivery is missed due to the train departing ahead of schedule or delivery partner delay.</li>
            <li><strong>Train Cancellation or Diversion:</strong> Full refund if Indian Railways cancels or diverts your train.</li>
            <li><strong>Quality Disputes:</strong> If any item is found missing or tampered with, report within 15 minutes of delivery via WhatsApp (+91 {whatsappNumber}) with a photo for instant resolution or refund.</li>
          </ul>
          <p className="text-[11px] text-stone-500">
            Approved refunds are processed to your original payment method (UPI / Bank transfer) within 24 to 48 hours.
          </p>
        </div>
      )
    },
    delivery: {
      title: 'Train Food Delivery Policy',
      icon: Truck,
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
          <p>
            {brandName} specializes in seamless train-side delivery. Here is how our platform delivery protocol operates:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Platform Delivery Executive:</strong> Our uniformed delivery partner arrives at the designated platform 10–15 minutes before your train arrives.</li>
            <li><strong>Berth Delivery:</strong> The executive will locate your coach (e.g., B2, S4) and hand over the sealed hot meal packet through your coach entrance or window.</li>
            <li><strong>Communication:</strong> The delivery executive will call your registered phone number once the train is approaching the outer signals of the station.</li>
            <li><strong>Night Delivery:</strong> For night train halts, our executives maintain utmost quietness and verify berth details carefully to avoid disturbing co-passengers.</li>
          </ul>
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900">
            <strong>Emergency Helpline:</strong> In case your coach position changes, reach our priority support at +91 {whatsappNumber}.
          </div>
        </div>
      )
    }
  };

  const current = contentMap[policyType];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 to-stone-900 text-white p-6 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center">
              <Icon className="w-5 h-5 text-emerald-950" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-amber-400 tracking-wider">
                Railfoody Official Policies
              </span>
              <h3 className="font-heading text-xl font-black">
                {current.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white rounded-full bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {current.content}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <span className="text-[11px] text-stone-500">
            Operational Hub: {address}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
