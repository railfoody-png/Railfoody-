import React, { useState } from 'react';
import { 
  Search, Train, Calendar, Hash, MapPin, CheckCircle, Info, Sparkles, 
  ChevronRight, LayoutGrid, Ticket, UtensilsCrossed, 
  ArrowRight, ShieldCheck, X, Check
} from 'lucide-react';
import { TrainRecord } from '../types';

interface SearchCriteria {
  trainQuery: string;
  selectedTrain: TrainRecord | null;
  pnr: string;
  journeyDate: string;
  boardingStation: string;
  coach: string;
  berth: string;
  foodSearch: string;
}

interface JourneySearchProps {
  trains: TrainRecord[];
  onSearchSubmit: (criteria: SearchCriteria) => void;
  onViewTrainSchedule: (train: TrainRecord) => void;
  lastUpdatedDate?: string;
  syncStatus?: string;
}

export const JourneySearch: React.FC<JourneySearchProps> = ({
  trains,
  onSearchSubmit,
  onViewTrainSchedule,
  lastUpdatedDate = '14 Oct 2026',
  syncStatus = 'Official Schedule'
}) => {
  const today = new Date().toISOString().split('T')[0];

  const [trainQuery, setTrainQuery] = useState('');
  const [selectedTrain, setSelectedTrain] = useState<TrainRecord | null>(null);
  const [pnr, setPnr] = useState('');
  const [journeyDate, setJourneyDate] = useState(today);
  const [boardingStation, setBoardingStation] = useState('JBP');
  const [coach, setCoach] = useState('');
  const [berth, setBerth] = useState('');
  const [foodSearch, setFoodSearch] = useState('');
  const [isTrainDropdownOpen, setIsTrainDropdownOpen] = useState(false);

  // Train suggestions filtered by query
  const filteredTrains = trainQuery.trim()
    ? trains.filter(
        t =>
          t.trainNumber.includes(trainQuery.trim()) ||
          t.trainName.toLowerCase().includes(trainQuery.toLowerCase().trim()) ||
          t.sourceStation.toLowerCase().includes(trainQuery.toLowerCase().trim()) ||
          t.destStation.toLowerCase().includes(trainQuery.toLowerCase().trim())
      )
    : trains.slice(0, 8);

  const handleSelectTrain = (t: TrainRecord) => {
    setSelectedTrain(t);
    setTrainQuery(`${t.trainNumber} - ${t.trainName}`);
    setIsTrainDropdownOpen(false);

    // If train halts include JBP, default to JBP, otherwise first halt
    const hasJbp = t.halts.some(h => h.code === 'JBP');
    if (hasJbp) {
      setBoardingStation('JBP');
    } else if (t.halts.length > 0) {
      setBoardingStation(t.halts[0].code);
    }
  };

  const handleQuickSelect = (trainNumber: string) => {
    const t = trains.find(item => item.trainNumber === trainNumber);
    if (t) {
      handleSelectTrain(t);
    }
  };

  const handleContinueToMenu = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit({
      trainQuery,
      selectedTrain,
      pnr,
      journeyDate,
      boardingStation,
      coach,
      berth,
      foodSearch
    });

    // Scroll smoothly to top of restaurants section
    const el = document.getElementById('restaurants-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="search-section" className="relative -mt-8 sm:-mt-12 z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden transition-all duration-300">
        
        {/* Clean Modern Header (No bulky collapsible front face) */}
        <div className="bg-stone-900 text-stone-100 px-5 py-4 sm:px-8 sm:py-4.5 flex flex-wrap items-center justify-between gap-3 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-black shadow-xs shrink-0">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Train Food Order – Enter Journey Details
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 bg-amber-400 text-stone-950 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-stone-950" />
                  Seat Delivery
                </span>
              </div>
              <p className="text-xs text-stone-400 font-medium mt-0.5">
                Fill train number, PNR, coach &amp; seat for guaranteed delivery on your berth at Jabalpur Junction &amp; stations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-stone-800/90 px-3 py-1.5 rounded-xl border border-stone-700/60 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{syncStatus} • Updated {lastUpdatedDate}</span>
          </div>
        </div>

        {/* DIRECT SEARCH FORM (ALWAYS OPEN & CLEANLY ACCESSIBLE) */}
        <form onSubmit={handleContinueToMenu} className="p-5 sm:p-7 space-y-5">
          
          {/* 6 Form Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            
            {/* 1. Train Number or Train Name – search/autocomplete */}
            <div className="relative">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>1. Train Number or Name *</span>
                {selectedTrain && (
                  <button
                    type="button"
                    onClick={() => onViewTrainSchedule(selectedTrain)}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold underline flex items-center gap-0.5 cursor-pointer"
                  >
                    View Timetable
                  </button>
                )}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none z-10">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 text-stone-950 flex items-center justify-center shadow-md shadow-amber-500/30 border-t border-white/70 border-b border-amber-800/30">
                    <Train className="w-4 h-4 text-stone-950 drop-shadow-xs" />
                  </div>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Search e.g. 12192 Shridham / 22181 Gondwana"
                  value={trainQuery}
                  onChange={(e) => {
                    setTrainQuery(e.target.value);
                    setIsTrainDropdownOpen(true);
                    if (selectedTrain && e.target.value !== `${selectedTrain.trainNumber} - ${selectedTrain.trainName}`) {
                      setSelectedTrain(null);
                    }
                  }}
                  onFocus={() => setIsTrainDropdownOpen(true)}
                  className="w-full pl-13 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-inner/10"
                />
              </div>

              {/* Autocomplete Dropdown showing Train Number + Name */}
              {isTrainDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-stone-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-stone-100">
                  <div className="p-2 text-[11px] font-bold text-stone-400 uppercase bg-stone-50 flex items-center justify-between">
                    <span>Select Train ({filteredTrains.length} available)</span>
                    <button
                      type="button"
                      onClick={() => setIsTrainDropdownOpen(false)}
                      className="text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {filteredTrains.length > 0 ? (
                    filteredTrains.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSelectTrain(t)}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-amber-50 flex items-center justify-between text-xs transition-colors cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-stone-900 flex items-center gap-1.5">
                            <span className="text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-black">
                              {t.trainNumber}
                            </span>
                            <span>{t.trainName}</span>
                          </div>
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            {t.sourceStation} ➔ {t.destStation}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-400" />
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-xs text-stone-500 text-center">
                      No matching train found. Enter your train number manually.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. PNR Number (10 digits) */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                2. 10-Digit PNR Number (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none z-10">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 border-t border-white/60 border-b border-emerald-900/30">
                    <Hash className="w-4 h-4 text-white drop-shadow-xs" />
                  </div>
                </div>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="e.g. 6428190345 (Auto berth sync)"
                  value={pnr}
                  onChange={(e) => setPnr(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-13 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-inner/10"
                />
              </div>
            </div>

            {/* 3. Date of Journey */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                3. Date of Journey *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none z-10">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-rose-400 via-rose-500 to-rose-700 text-white flex items-center justify-center shadow-md shadow-rose-500/25 border-t border-white/60 border-b border-rose-900/30">
                    <Calendar className="w-4 h-4 text-white drop-shadow-xs" />
                  </div>
                </div>
                <input
                  type="date"
                  required
                  value={journeyDate}
                  min={today}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  className="w-full pl-13 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-inner/10"
                />
              </div>
            </div>

            {/* 4. Boarding Station / Halts */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                4. Delivery Station *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none z-10">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-amber-400 via-orange-500 to-orange-700 text-white flex items-center justify-center shadow-md shadow-orange-500/25 border-t border-white/60 border-b border-orange-900/30">
                    <MapPin className="w-4 h-4 text-white drop-shadow-xs" />
                  </div>
                </div>
                <select
                  value={boardingStation}
                  onChange={(e) => setBoardingStation(e.target.value)}
                  className="w-full pl-13 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  {selectedTrain && selectedTrain.halts ? (
                    selectedTrain.halts.map((halt) => (
                      <option key={halt.code} value={halt.code}>
                        {halt.code} – {halt.name} (Arr: {halt.arr}, Dep: {halt.dep})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="JBP">JBP – Jabalpur Junction (100% Express Delivery)</option>
                      <option value="MML">MML – Madan Mahal</option>
                      <option value="KTE">KTE – Katni Junction</option>
                      <option value="ET">ET – Itarsi Junction</option>
                      <option value="BPL">BPL – Bhopal Junction</option>
                      <option value="NDLS">NDLS – New Delhi</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* 5. Coach Number (e.g. B2, S4) */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                5. Coach Number (e.g. B2 / S4)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none z-10">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-blue-400 via-blue-500 to-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/25 border-t border-white/60 border-b border-blue-900/30">
                    <LayoutGrid className="w-4 h-4 text-white drop-shadow-xs" />
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="e.g. B2 / S4"
                  value={coach}
                  onChange={(e) => setCoach(e.target.value.toUpperCase())}
                  className="w-full pl-13 pr-3 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white uppercase"
                />
              </div>
            </div>

            {/* 6. Seat Number / Berth Number */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                6. Seat / Berth Number (e.g. 45)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none z-10">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-purple-400 via-purple-500 to-purple-700 text-white flex items-center justify-center shadow-md shadow-purple-500/25 border-t border-white/60 border-b border-purple-900/30">
                    <Ticket className="w-4 h-4 text-white drop-shadow-xs" />
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="e.g. 45 (Lower Berth)"
                  value={berth}
                  onChange={(e) => setBerth(e.target.value)}
                  className="w-full pl-13 pr-3 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>
            </div>

          </div>

          {/* Quick Selection Train Pills (Jabalpur trains) */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
            <span className="text-xs font-bold text-stone-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Jabalpur Serving Trains:
            </span>
            {[
              { num: '12192', name: 'Shridham Exp' },
              { num: '22181', name: 'Gondwana Exp' },
              { num: '12062', name: 'Jan Shatabdi' },
              { num: '12321', name: 'Mumbai Mail' },
              { num: '20174', name: 'Vande Bharat' }
            ].map((pt) => (
              <button
                key={pt.num}
                type="button"
                onClick={() => handleQuickSelect(pt.num)}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 border border-stone-200 transition-colors cursor-pointer"
              >
                <span className="font-bold text-amber-600">{pt.num}</span> {pt.name}
              </button>
            ))}
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-stone-500 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Choose dishes next &amp; place your order on WhatsApp at <strong>9752693979</strong>. Delivered hot to your berth.</span>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm sm:text-base px-8 py-3.5 rounded-2xl shadow-xl shadow-amber-500/25 border-t border-white/70 border-b border-amber-600/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>Continue to Food Menu</span>
              <ArrowRight className="w-4 h-4 text-stone-950" />
            </button>
          </div>

        </form>

      </div>
    </section>
  );
};
