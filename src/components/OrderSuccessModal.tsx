import React, { useState } from 'react';
import { CheckCircle2, MessageCircle, Copy, Check, ExternalLink, X, Train, Clock, ShieldCheck } from 'lucide-react';
import { OrderRecord } from '../types';

interface OrderSuccessModalProps {
  order: OrderRecord | null;
  whatsappUrl: string;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  whatsappUrl,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(order.whatsAppMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 animate-scale-up">
        
        {/* Top Header */}
        <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-stone-300 hover:text-white rounded-full bg-emerald-900/60"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 bg-amber-400 text-stone-950 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-950" />
          </div>

          <span className="inline-block bg-emerald-900/80 text-amber-300 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-1">
            Order Initiated: #{order.orderNumber}
          </span>
          <h2 className="font-heading text-2xl font-black">
            Action Required in WhatsApp!
          </h2>
          <p className="text-stone-200 text-xs mt-1 max-w-xs mx-auto">
            Your food details are ready. Please tap "Send" in WhatsApp to dispatch to the restaurant kitchen.
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          
          {/* WhatsApp Direct Action Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>Open WhatsApp to Send Order</span>
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>

          {/* Quick Summary Pill */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2 text-xs">
            {order.customer.deliveryType === 'local' ? (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <span className="text-stone-500">Delivery Type:</span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                    Local Food Delivery
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <span className="text-stone-500">Address / Location:</span>
                  <span className="font-bold text-stone-900 max-w-xs text-right truncate">
                    {order.customer.localAddress || 'Local Address'}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <span className="text-stone-500">Train &amp; Berth:</span>
                  <span className="font-bold text-stone-900">
                    {order.customer.trainNumber || 'Train'} • Coach {order.customer.coachNumber || '--'}, Berth {order.customer.seatNumber || '--'}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <span className="text-stone-500">Boarding Station:</span>
                  <span className="font-bold text-stone-900">{order.customer.boardingStation || 'Enroute'}</span>
                </div>
              </>
            )}
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <span className="text-stone-500">Customer / Passenger:</span>
              <span className="font-bold text-stone-900">{order.customer.passengerName} ({order.customer.mobileNumber})</span>
            </div>
            <div className="flex items-center justify-between text-sm pt-1">
              <span className="font-bold text-stone-700">Total Payable at Delivery:</span>
              <span className="font-heading font-black text-emerald-800 text-base">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Order Message Preview / Copy */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-stone-600">WhatsApp Message Content</span>
              <button
                onClick={handleCopy}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
            </div>
            <pre className="bg-stone-100 p-3 rounded-xl text-[11px] font-mono text-stone-700 max-h-36 overflow-y-auto whitespace-pre-wrap border border-stone-200">
              {order.whatsAppMessage}
            </pre>
          </div>

          {/* Status disclaimer */}
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Order Status:</strong> Pending restaurant confirmation. Once the restaurant reviews your train schedule and berth details, they will reply on WhatsApp with estimated delivery timing.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Done / Close
          </button>

        </div>
      </div>
    </div>
  );
};
