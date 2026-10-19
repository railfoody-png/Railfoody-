import React, { useState } from 'react';
import { X, Store, CheckCircle, ShieldCheck, MapPin, Phone, MessageCircle, FileText, Utensils } from 'lucide-react';

interface VendorRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  whatsappNumber: string;
}

export const VendorRegisterModal: React.FC<VendorRegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  whatsappNumber
}) => {
  const [restaurantName, setRestaurantName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [stationName, setStationName] = useState('Jabalpur Junction (JBP)');
  const [fssaiLicense, setFssaiLicense] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/vendor-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantName: restaurantName.trim(),
          ownerName: ownerName.trim(),
          phone: phone.trim(),
          stationName: stationName.trim(),
          fssaiLicense: fssaiLicense.trim(),
          vegOnly,
          address: address.trim(),
          cuisines: vegOnly ? ['100% Pure Veg', 'Thali', 'Meals'] : ['North Indian', 'Biryani', 'Meals']
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit registration');
      }

      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank');
      }

      setSubmitted(true);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 animate-scale-up">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-950 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-stone-300 hover:text-white rounded-full bg-emerald-900/60"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-amber-400 text-stone-950">
              <Store className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-300">
              Railfoody Vendor Partner Program
            </span>
          </div>

          <h2 className="font-heading text-xl sm:text-2xl font-black">
            Add Your Restaurant on Railfoody
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            Reach thousands of railway passengers daily with direct berth delivery at Jabalpur and across Indian Railways.
          </p>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="font-heading text-xl font-bold text-stone-900">
                Restaurant Added Successfully!
              </h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{ownerName}</strong>! Your restaurant <strong>{restaurantName}</strong> is registered. Our onboarding team has also received your WhatsApp details at <strong>{whatsappNumber || '9752693979'}</strong> for verification.
              </p>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow-md"
                >
                  Done / View Restaurants
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Bhojanalaya"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Owner / Manager Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    WhatsApp / Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Station Name &amp; Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jabalpur Junction (JBP)"
                    value={stationName}
                    onChange={(e) => setStationName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">
                    FSSAI Food License Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="14-digit FSSAI Registration or License Number"
                    value={fssaiLicense}
                    onChange={(e) => setFssaiLicense(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">
                    Kitchen Address &amp; Delivery Coverage
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Station Road, Platform 1 Exit, Jabalpur"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Kitchen Food Type Toggle */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1.5">
                <span className="text-xs font-bold text-stone-800 block">Food Type:</span>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <label className="flex items-center gap-2 cursor-pointer text-emerald-800">
                    <input
                      type="radio"
                      name="vegType"
                      checked={vegOnly}
                      onChange={() => setVegOnly(true)}
                      className="text-emerald-600"
                    />
                    <span>100% Pure Veg Kitchen</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-amber-900">
                    <input
                      type="radio"
                      name="vegType"
                      checked={!vegOnly}
                      onChange={() => setVegOnly(false)}
                      className="text-amber-600"
                    />
                    <span>Veg &amp; Non-Veg Kitchen</span>
                  </label>
                </div>
              </div>

              {/* WhatsApp Notice */}
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Upon submitting, this restaurant will be listed on Railfoody and your application will automatically open on WhatsApp to <strong>{whatsappNumber || '9752693979'}</strong> for verification.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>{loading ? 'Submitting...' : 'Register Restaurant on WhatsApp'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
