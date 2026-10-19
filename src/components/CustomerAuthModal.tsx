import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Phone, Mail, ShieldCheck, CheckCircle2, ArrowRight, 
  Sparkles, User, Lock, Smartphone, RefreshCw, AlertCircle, 
  Clock, ArrowLeft, Train, HelpCircle, Check, Zap
} from 'lucide-react';
import { CustomerUser } from '../types.ts';
export type { CustomerUser };

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: CustomerUser) => void;
  brandName?: string;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  brandName = 'RailFoody'
}) => {
  const [authTab, setAuthTab] = useState<'phone' | 'google'>('phone');
  
  // Phone & OTP state with default applied phone number 9752693979
  const [phoneNumber, setPhoneNumber] = useState('9752693979');
  const [passengerName, setPassengerName] = useState('RailFoody Passenger');
  const [step, setStep] = useState<'input_phone' | 'input_otp'>('input_phone');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  
  // Expiry Timer (5 minutes = 300 seconds)
  const [timeLeft, setTimeLeft] = useState(300);
  // Resend Cooldown Timer (60 seconds)
  const [cooldownLeft, setCooldownLeft] = useState(0);

  // Sandbox debug helper & auto-mythical OTP
  const [sandboxDebugOtp, setSandboxDebugOtp] = useState<string | null>(null);

  // Gmail alternative state
  const [gmailAddress, setGmailAddress] = useState('');
  const [gmailName, setGmailName] = useState('');

  // 6 Input Box refs for auto-focus
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessNotice('');
      if (step !== 'input_otp') {
        if (!phoneNumber) setPhoneNumber('9752693979');
      }
    }
  }, [isOpen]);

  // 5-minute Expiration Countdown & 60-second Resend Timer
  useEffect(() => {
    if (step !== 'input_otp') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });

      setCooldownLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [step]);

  // WebOTP API for Android / Chrome automatic SMS capture
  useEffect(() => {
    if (step === 'input_otp' && typeof window !== 'undefined' && 'OTPCredential' in window) {
      const ac = new AbortController();
      (navigator as any).credentials?.get({
        otp: { transport: ['sms'] },
        signal: ac.signal
      })
      .then((otpCredential: any) => {
        if (otpCredential && otpCredential.code) {
          const code = String(otpCredential.code).replace(/\D/g, '').slice(0, 6);
          if (code.length === 6) {
            setOtpDigits(code.split(''));
            setSuccessNotice('✨ SMS OTP automatically detected!');
            setTimeout(() => {
              handleAutoVerify(code);
            }, 300);
          }
        }
      })
      .catch(() => {});

      return () => ac.abort();
    }
  }, [step]);

  if (!isOpen) return null;

  // Format seconds into MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1-Tap Auto Magical Login (Applies 9752693979, sends OTP, auto-fills OTP & logs in)
  const handleAutoMythicalLogin = async (phoneToUse = '9752693979') => {
    setPhoneNumber(phoneToUse);
    const pName = passengerName.trim() || 'RailFoody Passenger';
    setPassengerName(pName);
    setErrorMsg('');
    setSuccessNotice(`✨ Applying +91 ${phoneToUse} & generating auto-magical OTP...`);
    setIsLoading(true);

    try {
      const response = await fetch('/api/customer/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneToUse,
          name: pName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.error || 'Failed to dispatch OTP. Please check your number.');
        setIsLoading(false);
        return;
      }

      setStep('input_otp');
      setTimeLeft(data.expiresInSeconds || 300);
      setCooldownLeft(data.cooldownSeconds || 60);

      // Auto Magical OTP Detection & Auto-Fill
      if (data.debugOtp) {
        setSandboxDebugOtp(data.debugOtp);
        const digits = data.debugOtp.split('').slice(0, 6);
        setOtpDigits(digits);
        setSuccessNotice(`✨ Auto-Magical OTP [${data.debugOtp}] Applied! Verifying instantly...`);
        setTimeout(() => {
          handleAutoVerify(data.debugOtp, phoneToUse, pName);
        }, 500);
      } else {
        setSandboxDebugOtp(null);
        setSuccessNotice(data.message || `OTP sent to +91 ******${phoneToUse.slice(-4)}`);
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMsg('Connection error. Please try again.');
      setIsLoading(false);
    }
  };

  // 1. Standard Send OTP Request
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessNotice('');

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!/^[6-9]/.test(cleanPhone)) {
      setErrorMsg('Indian mobile numbers must start with 6, 7, 8, or 9.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/customer/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          name: passengerName.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.error || 'Failed to send OTP. Please check your number.');
        setIsLoading(false);
        return;
      }

      // Success
      setStep('input_otp');
      setTimeLeft(data.expiresInSeconds || 300);
      setCooldownLeft(data.cooldownSeconds || 60);

      // Auto Magical OTP check
      if (data.debugOtp) {
        setSandboxDebugOtp(data.debugOtp);
        const digits = data.debugOtp.split('').slice(0, 6);
        setOtpDigits(digits);
        setSuccessNotice(`✨ Auto-Magical OTP [${data.debugOtp}] Detected! Verifying...`);
        setTimeout(() => {
          handleAutoVerify(data.debugOtp, cleanPhone, passengerName.trim());
        }, 500);
      } else {
        setSandboxDebugOtp(null);
        setOtpDigits(['', '', '', '', '', '']);
        setSuccessNotice(data.message || `OTP sent to +91 ******${cleanPhone.slice(-4)}`);
        setIsLoading(false);
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 150);
      }

    } catch (err: any) {
      setErrorMsg('Connection error. Please check your internet connection.');
      setIsLoading(false);
    }
  };

  // 2. Verify OTP Request
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the OTP received on SMS.');
      return;
    }

    if (timeLeft <= 0) {
      setErrorMsg('This OTP has expired (5-minute limit). Please click Resend OTP.');
      return;
    }

    await handleAutoVerify(enteredOtp);
  };

  const handleAutoVerify = async (code: string, phoneOverride?: string, nameOverride?: string) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const cleanPhone = (phoneOverride || phoneNumber).replace(/\D/g, '');
      const cleanName = (nameOverride || passengerName).trim();
      const response = await fetch('/api/customer/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          otp: code,
          name: cleanName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.error || 'Invalid OTP code.');
        setIsLoading(false);
        return;
      }

      const user: CustomerUser = data.customer;
      user.token = data.token;

      try {
        localStorage.setItem('railfoody_customer_token', data.token);
        localStorage.setItem('railfoody_customer_user', JSON.stringify(user));
      } catch (err) {
        console.error(err);
      }

      setSuccessNotice('🎉 Mobile Verified! Welcome aboard RailFoody.');
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(user);
        onClose();
      }, 400);
    } catch {
      setErrorMsg('Verification failed. Please try again.');
      setIsLoading(false);
    }
  };

  // Handle 6-digit box key & paste events
  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);
    setErrorMsg('');

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (char && index === 5 && newDigits.every(d => d !== '')) {
      setTimeout(() => {
        handleAutoVerify(newDigits.join(''));
      }, 100);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...otpDigits];
        newDigits[index] = '';
        setOtpDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setOtpDigits(newDigits);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (pastedData.length === 6) {
      setTimeout(() => {
        handleAutoVerify(pastedData);
      }, 100);
    }
  };

  // Fast Google / Gmail login
  const handleGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToUse = gmailAddress.trim().toLowerCase();
    if (!emailToUse || !emailToUse.includes('@')) {
      setErrorMsg('Please enter a valid Gmail address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/customer/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToUse,
          name: gmailName.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMsg(data.error || 'Google login failed');
        setIsLoading(false);
        return;
      }

      const user: CustomerUser = data.customer;
      user.token = data.token;

      try {
        localStorage.setItem('railfoody_customer_token', data.token);
        localStorage.setItem('railfoody_customer_user', JSON.stringify(user));
      } catch (err) {
        console.error(err);
      }

      setIsLoading(false);
      onLoginSuccess(user);
      onClose();
    } catch {
      setErrorMsg('Google login connection error');
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-stone-200 relative animate-scaleUp max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-500 hover:text-stone-900 bg-white/80 hover:bg-white rounded-full transition-colors z-20 shadow-xs cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 p-5 sm:p-6 text-stone-950 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-950/10 text-stone-950 text-xs font-black uppercase tracking-wider mb-2">
            <Train className="w-3.5 h-3.5 text-stone-950" />
            <span>Passenger Fast Login</span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-black leading-tight text-stone-950">
            {step === 'input_otp' ? 'Verify 6-Digit OTP' : `Login to ${brandName}`}
          </h2>
          <p className="text-stone-900/85 text-xs sm:text-sm mt-1">
            {step === 'input_otp' 
              ? 'Enter the 6-digit OTP code or use auto-mythical detection.'
              : 'Sign in with your mobile number to unlock live order updates & 1-click checkout.'}
          </p>

          {/* Tab Selector: Mobile OTP vs Gmail */}
          {step === 'input_phone' && (
            <div className="flex bg-stone-950/15 p-1 rounded-xl mt-4">
              <button
                type="button"
                onClick={() => { setAuthTab('phone'); setErrorMsg(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  authTab === 'phone' 
                    ? 'bg-white text-stone-950 shadow-xs' 
                    : 'text-stone-800 hover:text-stone-950'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile OTP</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab('google'); setErrorMsg(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  authTab === 'google' 
                    ? 'bg-white text-stone-950 shadow-xs' 
                    : 'text-stone-800 hover:text-stone-950'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Gmail Login</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* Error Message Box */}
          {errorMsg && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-700 text-xs font-bold animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success / Notification Box */}
          {successNotice && !errorMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold animate-fadeIn">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-500 animate-pulse" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* STEP 1: PHONE NUMBER INPUT */}
          {step === 'input_phone' && authTab === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Quick Chip for 9752693979 */}
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setPhoneNumber('9752693979');
                    setPassengerName('RailFoody Passenger');
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-full transition-all cursor-pointer border border-amber-300 shadow-2xs"
                  title="Apply phone number 9752693979"
                >
                  <Zap className="w-3 h-3 fill-amber-500" />
                  <span>Apply: 9752693979</span>
                </button>
              </div>

              {/* Mobile Number Input Box */}
              <div>
                <div className="relative flex items-center rounded-2xl border-2 border-stone-200 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/10 bg-stone-50 transition-all overflow-hidden">
                  <div className="px-3.5 py-3.5 bg-stone-100 border-r border-stone-200 text-stone-700 font-black text-sm flex items-center gap-1.5 select-none">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhoneNumber(clean);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="9752693979"
                    className="w-full px-3.5 py-3.5 bg-transparent text-stone-900 font-black text-base placeholder:text-stone-400 placeholder:font-normal focus:outline-hidden"
                    autoFocus
                    required
                  />
                  {phoneNumber.length === 10 && /^[6-9]/.test(phoneNumber) && (
                    <div className="pr-3 text-emerald-600">
                      <CheckCircle2 className="w-5 h-5 fill-emerald-100" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Secure 6-digit OTP via SMS (valid for 5 minutes).</span>
                </p>
              </div>

              {/* Passenger Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Passenger Name <span className="text-stone-400 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-stone-200 bg-stone-50 text-stone-900 text-sm font-semibold focus:border-amber-500 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* 1-Tap Auto Mythical Login CTA */}
              <button
                type="button"
                onClick={() => handleAutoMythicalLogin(phoneNumber || '9752693979')}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black text-sm rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-amber-400/80 active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                    <span>Auto-Magical Login in Progress...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-amber-950 text-amber-950" />
                    <span>⚡ 1-Tap Auto Login with Mythical OTP</span>
                  </>
                )}
              </button>

              {/* Standard Send OTP Button */}
              <button
                type="submit"
                disabled={isLoading || phoneNumber.length !== 10}
                className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 active:bg-black disabled:bg-stone-200 disabled:text-stone-400 text-white font-bold text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <span>Send 6-Digit OTP via SMS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Trust Badges */}
              <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] text-stone-600 font-bold">
                <div className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-xl border border-stone-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Encrypted Token</span>
                </div>
                <div className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-xl border border-stone-100">
                  <Train className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Station Delivery</span>
                </div>
              </div>
            </form>
          )}

          {/* STEP 2: 6-DIGIT OTP VERIFICATION SCREEN */}
          {step === 'input_otp' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Back & Target Info */}
              <div className="flex items-center justify-between bg-stone-50 p-3 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('input_phone');
                      setErrorMsg('');
                    }}
                    className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
                    title="Change Mobile Number"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Target Mobile</span>
                    <span className="text-xs font-black text-stone-900">+91 {phoneNumber}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('input_phone');
                    setErrorMsg('');
                  }}
                  className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
                >
                  Edit Number
                </button>
              </div>

              {/* Sandbox Mythical OTP Auto-Fill Banner */}
              {sandboxDebugOtp && (
                <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 rounded-2xl text-xs text-amber-950 animate-fadeIn shadow-2xs">
                  <div className="flex items-center justify-between font-black mb-1">
                    <span className="flex items-center gap-1.5 text-amber-900">
                      <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                      <span>Auto-Magical OTP Ready:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const digits = sandboxDebugOtp.split('').slice(0, 6);
                        setOtpDigits(digits);
                        handleAutoVerify(sandboxDebugOtp);
                      }}
                      className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-stone-950 rounded-lg text-[11px] font-black cursor-pointer shadow-2xs transition-all active:scale-95"
                    >
                      Instant Verify ({sandboxDebugOtp})
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-900">
                    6-digit code <strong className="font-mono font-black text-stone-950 text-sm tracking-widest bg-white px-1.5 py-0.5 rounded border border-amber-300">{sandboxDebugOtp}</strong> detected automatically.
                  </p>
                </div>
              )}

              {/* 6 Individual Digit Input Boxes */}
              <div>
                <label className="block text-center text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Enter 6-Digit SMS Code
                </label>
                <div 
                  className="flex items-center justify-between gap-1.5 sm:gap-2.5"
                  onPaste={handlePaste}
                >
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-2xl border-2 transition-all focus:outline-hidden ${
                        digit
                          ? 'border-amber-500 bg-amber-50/50 text-stone-950 ring-2 ring-amber-500/10'
                          : 'border-stone-200 bg-stone-50 text-stone-900 hover:border-stone-300 focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Timers & Expiry Bar */}
              <div className="flex items-center justify-between text-xs font-bold pt-1">
                {/* 5-Min Expiry Indicator */}
                <div className={`flex items-center gap-1.5 ${timeLeft <= 60 ? 'text-rose-600' : 'text-stone-600'}`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    Expires in: <strong className="font-mono font-black">{formatTimer(timeLeft)}</strong>
                  </span>
                </div>

                {/* Resend OTP with 60-second Cooldown */}
                <div>
                  {cooldownLeft > 0 ? (
                    <span className="text-stone-400 cursor-not-allowed">
                      Resend in <strong className="font-mono">{cooldownLeft}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      disabled={isLoading}
                      className="text-amber-700 hover:text-amber-800 font-black hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Resend OTP</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                disabled={isLoading || otpDigits.some(d => !d) || timeLeft <= 0}
                className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:bg-stone-200 disabled:text-stone-400 text-stone-950 font-black text-sm rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Verify OTP & Continue</span>
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-stone-500">
                Valid for 5 minutes. Max 3 verification attempts allowed.
              </p>
            </div>
          )}

          {/* GMAIL ALTERNATIVE TAB */}
          {step === 'input_phone' && authTab === 'google' && (
            <form onSubmit={handleGoogleLogin} className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Gmail Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={gmailAddress}
                    onChange={(e) => setGmailAddress(e.target.value)}
                    placeholder="railfoody@gmail.com"
                    className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-stone-200 bg-stone-50 text-stone-900 text-sm font-semibold focus:border-amber-500 focus:bg-white focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Your Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={gmailName}
                    onChange={(e) => setGmailName(e.target.value)}
                    placeholder="e.g. Priya Patel"
                    className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-stone-200 bg-stone-50 text-stone-900 text-sm font-semibold focus:border-amber-500 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !gmailAddress}
                className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 active:bg-black disabled:bg-stone-200 disabled:text-stone-400 text-white font-black text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing in with Gmail...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Continue with Gmail</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>

        {/* Modal Footer Guarantee */}
        <div className="bg-stone-50 px-5 py-3 border-t border-stone-200 text-center text-[11px] text-stone-500 shrink-0">
          <span>By continuing, you agree to RailFoody's Terms of Service & Privacy Policy.</span>
        </div>
      </div>
    </div>
  );
};
