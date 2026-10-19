import React, { useState, useEffect } from 'react';
import { 
  X, Trash2, Plus, Minus, MessageCircle, ShieldAlert, CheckCircle2, 
  User, Phone, Train, MapPin, Calendar, Hash, FileText, ArrowRight, 
  ArrowLeft, ShoppingBag, Bike, Sparkles
} from 'lucide-react';
import { CartItem, TrainRecord, SiteSettings } from '../types';
import { CustomerUser } from './CustomerAuthModal.tsx';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onAddToCart: (item: any) => void;
  onRemoveFromCart: (itemId: string) => void;
  onClearCart: () => void;
  prefillJourney: {
    trainQuery?: string;
    selectedTrain?: TrainRecord | null;
    pnr?: string;
    journeyDate?: string;
    boardingStation?: string;
    coach?: string;
    berth?: string;
  };
  settings: SiteSettings;
  onOrderSuccess: (orderData: any, waUrl: string) => void;
  customer?: CustomerUser | null;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  prefillJourney,
  settings,
  onOrderSuccess,
  customer
}) => {
  // Step 1: 'cart' (Review Food Items) | Step 2: 'details' (Customer & Delivery Details)
  const [currentStep, setCurrentStep] = useState<'cart' | 'details'>('cart');

  // Delivery type: 'train' | 'local'
  const [deliveryType, setDeliveryType] = useState<'train' | 'local'>('train');

  // Form Fields
  const [passengerName, setPassengerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  
  // Train Delivery Fields
  const [trainNumber, setTrainNumber] = useState(prefillJourney.selectedTrain?.trainNumber || prefillJourney.trainQuery?.split(' ')[0] || '');
  const [trainName, setTrainName] = useState(prefillJourney.selectedTrain?.trainName || prefillJourney.trainQuery || '');
  const [boardingStation, setBoardingStation] = useState(prefillJourney.boardingStation || 'Jabalpur Junction (JBP)');
  const [journeyDate, setJourneyDate] = useState(prefillJourney.journeyDate || new Date().toISOString().split('T')[0]);
  const [coachNumber, setCoachNumber] = useState(prefillJourney.coach || '');
  const [seatNumber, setSeatNumber] = useState(prefillJourney.berth || '');
  const [pnrNumber, setPnrNumber] = useState(prefillJourney.pnr || '');
  
  // Local Delivery Fields
  const [localAddress, setLocalAddress] = useState('');
  const [cityArea, setCityArea] = useState('Jabalpur City / Railway Colony');

  // Shared
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Reset to cart step if cart becomes empty
  useEffect(() => {
    if (cart.length === 0) {
      setCurrentStep('cart');
    }
  }, [cart.length]);

  // Update when prefill journey changes
  useEffect(() => {
    if (prefillJourney.selectedTrain) {
      setTrainNumber(prefillJourney.selectedTrain.trainNumber);
      setTrainName(prefillJourney.selectedTrain.trainName);
    } else if (prefillJourney.trainQuery) {
      setTrainNumber(prefillJourney.trainQuery.split(' ')[0]);
      setTrainName(prefillJourney.trainQuery);
    }
    if (prefillJourney.boardingStation) setBoardingStation(prefillJourney.boardingStation);
    if (prefillJourney.journeyDate) setJourneyDate(prefillJourney.journeyDate);
    if (prefillJourney.coach) setCoachNumber(prefillJourney.coach);
    if (prefillJourney.berth) setSeatNumber(prefillJourney.berth);
    if (prefillJourney.pnr) setPnrNumber(prefillJourney.pnr);
  }, [prefillJourney]);

  // Auto-prefill customer info when logged in
  useEffect(() => {
    if (customer) {
      if (customer.name && !passengerName) {
        setPassengerName(customer.name);
      }
      if (customer.phone && !mobileNumber) {
        setMobileNumber(customer.phone);
      }
    }
  }, [customer]);

  if (!isOpen) return null;

  const totalCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const subtotal = cart.reduce((acc, curr) => acc + curr.foodItem.price * curr.quantity, 0);
  const deliveryFee = subtotal > 299 ? 0 : 25;
  const packagingFee = 15;
  const totalAmount = subtotal + deliveryFee + packagingFee;

  // Determine Primary Restaurant Name
  const primaryRestaurantName = cart.length > 0 
    ? (cart[0].foodItem.restaurantName || cart[0].restaurantName || 'Railfoody Approved Kitchen') 
    : 'Railfoody Kitchen';
  const primaryRestaurantId = cart.length > 0 ? cart[0].restaurantId : 'general';

  // Completely delete item from cart
  const handleRemoveWholeItem = (foodId: string) => {
    const item = cart.find(c => c.foodItem.id === foodId);
    if (item) {
      for (let i = 0; i < item.quantity; i++) {
        onRemoveFromCart(foodId);
      }
    }
  };

  const handleContinueToOrder = () => {
    if (cart.length === 0) {
      setFormErrors(['Your cart is empty. Please add items to proceed.']);
      return;
    }
    setFormErrors([]);
    setCurrentStep('details');
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!passengerName.trim()) {
      errors.push('Full Name is required');
    }
    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      errors.push('Valid 10-digit Mobile / WhatsApp Number is required');
    }

    if (deliveryType === 'train') {
      if (!trainNumber.trim()) errors.push('Train Number is required for train delivery');
      if (!coachNumber.trim()) errors.push('Coach Number (e.g. B1, S4) is required');
      if (!seatNumber.trim()) errors.push('Seat / Berth Number is required');
      if (!boardingStation.trim()) errors.push('Boarding Station is required');
    } else {
      if (!localAddress.trim()) errors.push('Local Delivery Address is required');
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    if (cart.length === 0) {
      setFormErrors(['Your cart is empty.']);
      return;
    }

    setIsSubmitting(true);

    try {
      const customerPayload: any = {
        deliveryType,
        passengerName: passengerName.trim(),
        mobileNumber: mobileNumber.trim(),
        deliveryInstructions: deliveryInstructions.trim()
      };

      if (deliveryType === 'train') {
        customerPayload.trainNumber = trainNumber.trim();
        customerPayload.trainName = trainName.trim() || 'Express';
        customerPayload.pnrNumber = pnrNumber.trim();
        customerPayload.journeyDate = journeyDate;
        customerPayload.boardingStation = boardingStation.trim();
        customerPayload.coachNumber = coachNumber.trim().toUpperCase();
        customerPayload.seatNumber = seatNumber.trim();
      } else {
        customerPayload.localAddress = localAddress.trim();
        customerPayload.cityArea = cityArea.trim();
      }

      const orderPayload = {
        customer: customerPayload,
        restaurantId: primaryRestaurantId,
        restaurantName: primaryRestaurantName,
        items: cart.map(c => ({
          id: c.foodItem.id,
          name: c.foodItem.name,
          price: c.foodItem.price,
          quantity: c.quantity,
          isVeg: c.foodItem.isVeg
        })),
        subtotal,
        deliveryFee,
        gstAmount: packagingFee,
        totalAmount
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initiate order');
      }

      // Order saved to database. Now trigger WhatsApp to number 9752693979
      const waUrl = data.whatsappUrl;
      window.open(waUrl, '_blank');

      onOrderSuccess(data.order, waUrl);
      onClearCart();
      setCurrentStep('cart');
      onClose();
    } catch (err: any) {
      setFormErrors([err.message || 'Something went wrong while placing order.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/75 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white h-full flex flex-col shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header with Yellow / Black Branding */}
        <div className="sticky top-0 z-20 bg-stone-950 text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-amber-400">
          <div className="flex items-center gap-3">
            {currentStep === 'details' && (
              <button
                type="button"
                onClick={() => {
                  setFormErrors([]);
                  setCurrentStep('cart');
                }}
                className="p-1.5 bg-stone-800 hover:bg-stone-700 text-amber-400 rounded-xl transition-colors cursor-pointer"
                title="Back to Food Items"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                  {currentStep === 'cart' ? 'Step 1 of 2' : 'Step 2 of 2'}
                </span>
                <span className="text-stone-500 text-xs">•</span>
                <span className="text-stone-300 text-xs font-semibold">
                  {currentStep === 'cart' ? 'Meal Tray Review' : 'Delivery Details'}
                </span>
              </div>
              <h2 className="font-heading text-lg sm:text-xl font-black text-white">
                {currentStep === 'cart' ? 'Review Your Order Cart' : 'Enter Customer & Delivery Info'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
            title="Close Cart"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-4 sm:p-6 flex-1 space-y-6">

          {/* ================= STEP 1: CART ITEMS & REVIEW ================= */}
          {currentStep === 'cart' && (
            <div className="space-y-6">
              
              {/* Header Info */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-base font-bold text-stone-900 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-500" />
                    <span>Selected Food Items ({totalCount})</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Freshly prepared from approved station partner kitchens
                  </p>
                </div>

                {cart.length > 0 && (
                  <button
                    onClick={onClearCart}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer px-2.5 py-1 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Cart</span>
                  </button>
                )}
              </div>

              {/* Cart List */}
              {cart.length === 0 ? (
                <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-3xl p-10 text-center text-stone-500">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="font-heading text-base font-bold text-stone-900 mb-1">
                    Your Order Cart is Empty
                  </h4>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto mb-5 leading-relaxed">
                    Explore delicious thalis, biryanis, dal-rice combos and fresh snacks to add to your journey!
                  </p>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer"
                  >
                    Browse Restaurants &amp; Menu
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div
                      key={item.foodItem.id}
                      className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-xs hover:border-amber-300 transition-all flex items-center justify-between gap-3"
                    >
                      {/* Left: Food thumbnail & details */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-100">
                          <img
                            src={item.foodItem.image}
                            alt={item.foodItem.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-1 left-1 bg-white/90 p-0.5 rounded-xs">
                            <span
                              className={`block w-2 h-2 rounded-full ${
                                item.foodItem.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                              }`}
                            />
                          </div>
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                            {item.foodItem.name}
                          </h4>
                          <div className="text-[11px] text-stone-500 truncate">
                            {item.foodItem.restaurantName || item.restaurantName}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-black text-stone-950">
                              ₹{item.foodItem.price}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              (₹{item.foodItem.price * item.quantity} total)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Quantity controls & Delete */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 bg-stone-100 border border-stone-200 rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => onRemoveFromCart(item.foodItem.id)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-stone-200 rounded-lg text-stone-800 transition-colors cursor-pointer"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-black px-1.5 min-w-[20px] text-center text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onAddToCart(item.foodItem)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-stone-200 rounded-lg text-stone-800 transition-colors cursor-pointer"
                            title="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveWholeItem(item.foodItem.id)}
                          className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Bill Summary Breakdown */}
                  <div className="mt-4 bg-stone-50 rounded-2xl border border-stone-200 p-4 space-y-2 text-xs text-stone-600">
                    <h4 className="font-heading font-black text-stone-900 text-xs uppercase tracking-wider pb-1 border-b border-stone-200">
                      Payment Breakdown
                    </h4>
                    <div className="flex justify-between">
                      <span>Item Subtotal ({totalCount} items)</span>
                      <span className="font-bold text-stone-900">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>
                        {deliveryFee === 0 ? (
                          <strong className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                            FREE
                          </strong>
                        ) : (
                          `₹${deliveryFee}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Spill-Proof Packaging &amp; GST</span>
                      <span className="font-bold text-stone-900">₹{packagingFee}</span>
                    </div>
                    <div className="border-t border-stone-200 pt-2.5 flex justify-between items-center text-stone-950 font-black">
                      <div>
                        <span className="text-xs sm:text-sm block">Grand Total</span>
                        <span className="text-[10px] text-stone-400 font-normal">Pay at delivery via Cash/UPI</span>
                      </div>
                      <span className="font-heading text-xl sm:text-2xl text-stone-950">
                        ₹{totalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Primary "Continue to Order" Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleContinueToOrder}
                      className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-amber-400/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] border-2 border-stone-900"
                    >
                      <Train className="w-5 h-5 text-stone-950" />
                      <span>Enter Train &amp; Seat Details</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <p className="text-[11px] text-center text-stone-500 mt-2 font-medium">
                      Next: Enter Train Number, PNR, Coach &amp; Berth for direct seat delivery
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 2: CUSTOMER & DELIVERY DETAILS ================= */}
          {currentStep === 'details' && (
            <form onSubmit={handlePlaceOrder} className="space-y-5">
              
              {/* Delivery Type Selector Tabs */}
              <div>
                <label className="block font-heading font-black text-xs text-stone-900 uppercase tracking-wider mb-2">
                  Select Delivery Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('train')}
                    className={`p-3.5 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                      deliveryType === 'train'
                        ? 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-400/20'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="p-2 rounded-xl bg-amber-400 text-stone-950">
                        <Train className="w-4 h-4" />
                      </div>
                      {deliveryType === 'train' && (
                        <CheckCircle2 className="w-5 h-5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <span className="font-heading font-black text-xs sm:text-sm text-stone-900 block">
                        Train Food Delivery
                      </span>
                      <span className="text-[10px] text-stone-500">
                        Delivered directly to your train coach &amp; seat berth
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('local')}
                    className={`p-3.5 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                      deliveryType === 'local'
                        ? 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-400/20'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="p-2 rounded-xl bg-amber-400 text-stone-950">
                        <Bike className="w-4 h-4" />
                      </div>
                      {deliveryType === 'local' && (
                        <CheckCircle2 className="w-5 h-5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <span className="font-heading font-black text-xs sm:text-sm text-stone-900 block">
                        Local Food Delivery
                      </span>
                      <span className="text-[10px] text-stone-500">
                        Delivered to city address, hotel, or station entrance
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Form Validation Errors Banner */}
              {formErrors.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl text-xs text-rose-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 mb-1 text-rose-900">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Please fix the following to continue:</span>
                  </div>
                  {formErrors.map((err, i) => (
                    <div key={i} className="flex items-center gap-1.5 pl-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Common Passenger Details */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                <h4 className="font-heading font-black text-xs uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>Contact Information</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Passenger / Customer Name */}
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {deliveryType === 'train' ? 'Passenger Full Name *' : 'Customer Full Name *'}
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-200 rounded-xl font-medium text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Mobile / WhatsApp Number */}
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Mobile / WhatsApp Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-stone-200 rounded-xl font-medium text-stone-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* TRAIN SPECIFIC FIELDS */}
              {deliveryType === 'train' ? (
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 space-y-3">
                  <h4 className="font-heading font-black text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Train className="w-3.5 h-3.5 text-amber-600" />
                    <span>Train &amp; Berth Delivery Information</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Train Number */}
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Train Number *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 12192"
                        value={trainNumber}
                        onChange={(e) => setTrainNumber(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl font-medium text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-mono"
                      />
                    </div>

                    {/* Train Name */}
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Train Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Shridham Express"
                        value={trainName}
                        onChange={(e) => setTrainName(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl font-medium text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* PNR Number */}
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        PNR Number (Optional / Recommended)
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        placeholder="10-digit PNR"
                        value={pnrNumber}
                        onChange={(e) => setPnrNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl font-medium text-stone-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Journey Date */}
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Journey Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={journeyDate}
                        onChange={(e) => setJourneyDate(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl font-medium text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Coach Number */}
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Coach Number * (e.g. B1, S4, A2)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. B2, S4"
                        value={coachNumber}
                        onChange={(e) => setCoachNumber(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl font-bold uppercase text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Seat Number */}
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Seat / Berth Number *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 34 (Lower Berth)"
                        value={seatNumber}
                        onChange={(e) => setSeatNumber(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl font-medium text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Boarding Station */}
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-stone-700 mb-1">
                        Boarding / Delivery Station *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jabalpur Junction (JBP)"
                        value={boardingStation}
                        onChange={(e) => setBoardingStation(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl font-medium text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* LOCAL FOOD DELIVERY FIELDS */
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 space-y-3">
                  <h4 className="font-heading font-black text-xs uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Local Delivery Location</span>
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Full Delivery Address *
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="House / Flat No., Hotel Name & Room, Street, Landmark near Station"
                        value={localAddress}
                        onChange={(e) => setLocalAddress(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl font-medium text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        City / Area / Landmark
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Station Road, Jabalpur"
                        value={cityArea}
                        onChange={(e) => setCityArea(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-xl font-medium text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Note / Preferences */}
              <div className="text-xs">
                <label className="block font-bold text-stone-700 mb-1">
                  Special Instructions / Dietary Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Call 10 mins before train arrival, less spicy, extra spoons"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              {/* Crucial WhatsApp Confirmation Disclosure Notice */}
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-amber-950">
                <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-black block text-amber-900">
                    Official WhatsApp Order (9752693979):
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    Clicking below prepares your meal order and opens WhatsApp. <strong>Please tap "Send" in WhatsApp</strong> to transmit your meal order directly to Railfoody (+91 9752693979) for instant kitchen preparation.
                  </p>
                </div>
              </div>

              {/* Final Submit Button: Place Order on WhatsApp */}
              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl hover:shadow-emerald-700/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] border-2 border-emerald-900"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>
                    {isSubmitting ? 'Connecting to WhatsApp...' : `Place Order on WhatsApp (₹${totalAmount})`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep('cart')}
                  className="w-full py-2.5 bg-transparent hover:bg-stone-100 text-stone-600 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  ← Edit Food Items ({totalCount} meals)
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
