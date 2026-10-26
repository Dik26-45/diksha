import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Info,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { RideCard } from '../components/RideCard';
import { LeafletMap } from '../components/LeafletMap';
import { useAuth } from '../context/AuthContext';
import { RideMatchScore } from '../types';
import { api } from '../services/api';

const PRESET_CORRIDORS = [
  {
    name: 'Kothrud to Hinjawadi IT Park (Pune, Maharashtra)',
    originLat: 18.5074,
    originLng: 73.8077,
    destLat: 18.5912,
    destLng: 73.7389,
  },
  {
    name: 'Viman Nagar to EON Free Zone Kharadi (Pune, Maharashtra)',
    originLat: 18.5679,
    originLng: 73.9143,
    destLat: 18.5515,
    destLng: 73.9510,
  },
  {
    name: 'Bandra Kurla Complex (BKC) to Powai (Mumbai, Maharashtra)',
    originLat: 19.0660,
    originLng: 72.8680,
    destLat: 19.1197,
    destLng: 72.9051,
  },
  {
    name: 'Thane West to Mindspace Airoli (Navi Mumbai, Maharashtra)',
    originLat: 19.2090,
    originLng: 72.9710,
    destLat: 19.1550,
    destLng: 72.9980,
  },
  {
    name: 'Wakad to Magarpatta Cybercity (Pune, Maharashtra)',
    originLat: 18.5980,
    originLng: 73.7660,
    destLat: 18.5150,
    destLng: 73.9270,
  },
];

export const AiMatchesPage: React.FC = () => {
  const { user } = useAuth();

  const [selectedCorridor, setSelectedCorridor] = useState(PRESET_CORRIDORS[0]);
  const [preferredTime, setPreferredTime] = useState(
    new Date(Date.now() + 2 * 3600 * 1000).toISOString().slice(0, 16)
  );
  const [onlyWomenOnly, setOnlyWomenOnly] = useState(false);

  const [matches, setMatches] = useState<RideMatchScore[]>([]);
  const [algorithmNotice, setAlgorithmNotice] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const runMatching = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await api.findMatches({
        originLat: selectedCorridor.originLat,
        originLng: selectedCorridor.originLng,
        destLat: selectedCorridor.destLat,
        destLng: selectedCorridor.destLng,
        preferredDepartureTime: new Date(preferredTime).toISOString(),
        onlyWomenOnly,
      });

      setMatches(res.matches);
      setAlgorithmNotice(res.algorithm?.notice || '');
    } catch (err: any) {
      console.error('AI Matching error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runMatching();
  }, [selectedCorridor, onlyWomenOnly]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Explainable Rule-Based AI Engine
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          SAFAR AI Matching Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Transparent, deterministic ride matching evaluated against 5 weighted compatibility dimensions.
        </p>
      </div>

      {/* 5-Factor Scoring Weight Explainer Card */}
      <div className="bg-gradient-to-r from-violet-950 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-violet-200">
            Scoring Breakdown & Criteria (Total: 0–100%)
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
            <span className="text-2xl font-extrabold text-violet-300 block">30%</span>
            <span className="font-semibold block text-white mt-1">Pickup Proximity</span>
            <span className="text-[10px] text-slate-300">Within 0.5–15 km radius</span>
          </div>

          <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
            <span className="text-2xl font-extrabold text-indigo-300 block">30%</span>
            <span className="font-semibold block text-white mt-1">Drop-off Proximity</span>
            <span className="text-[10px] text-slate-300">Destination walking distance</span>
          </div>

          <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
            <span className="text-2xl font-extrabold text-blue-300 block">20%</span>
            <span className="font-semibold block text-white mt-1">Departure Window</span>
            <span className="text-[10px] text-slate-300">Time compatibility window</span>
          </div>

          <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
            <span className="text-2xl font-extrabold text-pink-300 block">15%</span>
            <span className="font-semibold block text-white mt-1">Route Bearing</span>
            <span className="text-[10px] text-slate-300">Highway vector alignment</span>
          </div>

          <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
            <span className="text-2xl font-extrabold text-emerald-300 block">5%</span>
            <span className="font-semibold block text-white mt-1">User Preferences</span>
            <span className="text-[10px] text-slate-300">Quiet ride, music, pets</span>
          </div>
        </div>

        <p className="text-[11px] text-violet-200/80 italic border-t border-white/10 pt-3">
          💡 Transparency note: This algorithm uses explainable mathematical heuristics and geodetic Haversine vectors. It strictly excludes full rides, cancelled trips, and incompatible gender restrictions.
        </p>
      </div>

      {/* Corridor Selector & Settings */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Configure Matching Test Route</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Corridor Preset */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Major Travel Corridor
            </label>
            <select
              value={selectedCorridor.name}
              onChange={(e) => {
                const found = PRESET_CORRIDORS.find((c) => c.name === e.target.value);
                if (found) setSelectedCorridor(found);
              }}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50 outline-hidden"
            >
              {PRESET_CORRIDORS.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Preferred Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Preferred Departure
            </label>
            <input
              type="datetime-local"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50 outline-hidden"
            />
          </div>

          {/* Women-Only Filter & Recalculate */}
          <div className="flex flex-col justify-end gap-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={onlyWomenOnly}
                onChange={(e) => setOnlyWomenOnly(e.target.checked)}
                className="w-4 h-4 text-pink-600 rounded border-slate-300 focus:ring-pink-500"
              />
              <ShieldCheck className="w-4 h-4 text-pink-500" />
              <span>Only Women-Only Rides</span>
            </label>

            <button
              onClick={runMatching}
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> Recalculate AI Matches
            </button>
          </div>
        </div>
      </div>

      {/* Scored Results Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            Ranked Compatibility Results ({matches.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Sorted strictly by overall AI score (0–100%)
          </span>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <Compass className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No compatible rides found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No active scheduled rides matched within the proximity threshold or selected corridor.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {matches.map((item) => (
              <div
                key={item.rideId}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:border-violet-300 transition-all p-6 space-y-5"
              >
                {/* Score Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex flex-col items-center justify-center shadow-md shadow-violet-600/20 shrink-0">
                      <span className="text-lg font-black leading-none">{item.overallScore}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-200">
                        Score
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {item.overallScore >= 85
                          ? '🌟 Excellent Route Match'
                          : item.overallScore >= 65
                          ? '👍 Strong Route Match'
                          : 'Moderate Compatibility'}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">{item.explanation}</p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                      Ranked #{matches.indexOf(item) + 1}
                    </span>
                  </div>
                </div>

                {/* Visual Progress Bar Breakdown for the 5 Factors */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-medium text-slate-600">
                      <span>Pickup</span>
                      <span className="font-bold text-slate-800">{item.pickupProximityScore}/30</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(item.pickupProximityScore / 30) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-medium text-slate-600">
                      <span>Destination</span>
                      <span className="font-bold text-slate-800">{item.destProximityScore}/30</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${(item.destProximityScore / 30) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-medium text-slate-600">
                      <span>Time Window</span>
                      <span className="font-bold text-slate-800">{item.timeCompatibilityScore}/20</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full"
                        style={{ width: `${(item.timeCompatibilityScore / 20) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-medium text-slate-600">
                      <span>Route Vector</span>
                      <span className="font-bold text-slate-800">{item.routeCompatibilityScore}/15</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-pink-500 rounded-full"
                        style={{ width: `${(item.routeCompatibilityScore / 15) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-medium text-slate-600">
                      <span>Preferences</span>
                      <span className="font-bold text-slate-800">{item.preferenceScore}/5</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(item.preferenceScore / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Ride Card Details Component */}
                <RideCard ride={item.ride} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
