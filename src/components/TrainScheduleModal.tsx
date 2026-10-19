import React from 'react';
import { X, Train, Clock, MapPin, Calendar, ShieldCheck } from 'lucide-react';
import { TrainRecord } from '../types';

interface TrainScheduleModalProps {
  train: TrainRecord | null;
  onClose: () => void;
  onSelectStation?: (stationCode: string) => void;
}

export const TrainScheduleModal: React.FC<TrainScheduleModalProps> = ({
  train,
  onClose,
  onSelectStation
}) => {
  if (!train) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200">
        
        {/* Header */}
        <div className="bg-emerald-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-stone-300 hover:text-white rounded-full bg-emerald-900/60"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-400 text-stone-950 font-black text-xs px-2.5 py-0.5 rounded-md">
              {train.trainNumber}
            </span>
            <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              {train.syncStatus}
            </span>
          </div>

          <h2 className="font-heading text-2xl font-black">
            {train.trainName}
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 flex items-center gap-2">
            <span>{train.sourceStation}</span>
            <span>➔</span>
            <span>{train.destStation}</span>
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
            <span className="bg-emerald-900 px-2.5 py-1 rounded-md text-emerald-200">
              Days: {train.days.join(', ')}
            </span>
            <span className="bg-emerald-900 px-2.5 py-1 rounded-md text-emerald-200">
              Classes: {train.classes.join(', ')}
            </span>
          </div>
        </div>

        {/* Timetable Schedule Table */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              Route Stations &amp; Food Delivery Halts
            </h3>
            <span className="text-[11px] text-stone-500">
              {train.halts.length} Major Stations
            </span>
          </div>

          <div className="border border-stone-200 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-700 font-bold uppercase text-[10px] sticky top-0 border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Station</th>
                  <th className="py-2.5 px-2">Arrival</th>
                  <th className="py-2.5 px-2">Departure</th>
                  <th className="py-2.5 px-2">Halt</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {train.halts.map((halt, idx) => {
                  const isJbp = halt.code === 'JBP';
                  return (
                    <tr
                      key={idx}
                      className={isJbp ? 'bg-amber-50/80 font-semibold' : 'hover:bg-stone-50'}
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          {isJbp && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                          )}
                          <span className="font-bold text-stone-900">{halt.code}</span>
                          <span className="text-stone-500 hidden sm:inline">- {halt.name}</span>
                        </div>
                        {isJbp && (
                          <span className="text-[10px] text-amber-800 font-bold block sm:hidden">
                            {halt.name} (Hub)
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-stone-600 font-mono">{halt.arr}</td>
                      <td className="py-2.5 px-2 text-stone-600 font-mono">{halt.dep}</td>
                      <td className="py-2.5 px-2 text-stone-500">{halt.halt}</td>
                      <td className="py-2.5 px-3 text-right">
                        {onSelectStation && (
                          <button
                            onClick={() => {
                              onSelectStation(halt.code);
                              onClose();
                            }}
                            className="text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded cursor-pointer"
                          >
                            Order Here
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Last Synced: {new Date(train.lastUpdated).toLocaleDateString('en-IN')}</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-stone-900 text-white font-bold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
