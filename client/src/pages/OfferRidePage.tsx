import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle,
  Car,
  AlertTriangle,
} from 'lucide-react';
import { LeafletMap } from '../components/LeafletMap';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

// Popular Maharashtra, India corridor landmark presets
const LANDMARK_PRESETS = [
  { name: 'Kothrud Central, Karve Road, Pune, Maharashtra', lat: 18.5074, lng: 73.8077 },
  { name: 'Hinjawadi IT Park Phase 1, Pune, Maharashtra', lat: 18.5912, lng: 73.7389 },
  { name: 'Viman Nagar Phoenix Mall, Pune, Maharashtra', lat: 18.5679, lng: 73.9143 },
  { name: 'EON Free Zone IT Park, Kharadi, Pune, Maharashtra', lat: 18.5515, lng: 73.9510 },
  { name: 'Bandra Kurla Complex (BKC), Mumbai, Maharashtra', lat: 19.0660, lng: 72.8680 },
  { name: 'Hiranandani Gardens, Powai, Mumbai, Maharashtra', lat: 19.1197, lng: 72.9051 },
  { name: 'Viviana Mall, Eastern Express Highway, Thane, Maharashtra', lat: 19.2090, lng: 72.9710 },
  { name: 'Mindspace IT Park, Airoli, Navi Mumbai, Maharashtra', lat: 19.1550, lng: 72.9980 },
  { name: 'Magarpatta Cybercity, Hadapsar, Pune, Maharashtra', lat: 18.5150, lng: 73.9270 },
  { name: 'Dadar TT Circle, Central Mumbai, Maharashtra', lat: 19.0178, lng: 72.8478 },
];

export const OfferRidePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [originAddress, setOriginAddress] = useState(LANDMARK_PRESETS[0].name);
  const [originLat, setOriginLat] = useState(LANDMARK_PRESETS[0].lat);
  const [originLng, setOriginLng] = useState(LANDMARK_PRESETS[0].lng);

  const [destAddress, setDestAddress] = useState(LANDMARK_PRESETS[2].name);
  const [destLat, setDestLat] = useState(LANDMARK_PRESETS[2].lat);
  const [destLng, setDestLng] = useState(LANDMARK_PRESETS[2].lng);

  // Default departure time: 3 hours from now
  const defaultDeparture = new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(0, 16);
  const [departureTime, setDepartureTime] = useState(defaultDeparture);

  const [totalSeats, setTotalSeats] = useState(3);
  const [pricePerSeat, setPricePerSeat] = useState(350);
  const [isWomenOnly, setIsWomenOnly] = useState(user?.gender === 'FEMALE');
  const [notes, setNotes] = useState('Non-smoking air-conditioned vehicle. Punctual departure.');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEligibleForWomenOnly = user?.gender === 'FEMALE';

  const handleOriginPreset = (name: string) => {
    const found = LANDMARK_PRESETS.find((p) => p.name === name);
    if (found) {
      setOriginAddress(found.name);
      setOriginLat(found.lat);
      setOriginLng(found.lng);
    }
  };

  const handleDestPreset = (name: string) => {
    const found = LANDMARK_PRESETS.find((p) => p.name === name);
    if (found) {
      setDestAddress(found.name);
      setDestLat(found.lat);
      setDestLng(found.lng);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originAddress || !destAddress || !departureTime) {
      setError('Please provide origin, destination, and departure time.');
      return;
    }

    if (totalSeats < 1 || totalSeats > 7) {
      setError('Available seats must be between 1 and 7.');
      return;
    }

    if (pricePerSeat <= 0) {
      setError('Price per seat must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.createRide({
        originAddress,
        originLat,
        originLng,
        destAddress,
        destLat,
        destLng,
        departureTime: new Date(departureTime).toISOString(),
        totalSeats,
        pricePerSeat,
        isWomenOnly,
        notes,
      });

      navigate(`/rides/${res.ride.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create ride.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <PlusCircle className="w-7 h-7 text-indigo-600" />
          Offer a Shared Journey
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Share your daily commute, offset fuel costs, and ride with trusted community members.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Origin & Presets */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pickup Origin Address
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-indigo-600 focus-within:bg-white transition-all">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                <input
                  type="text"
                  required
                  value={originAddress}
                  onChange={(e) => setOriginAddress(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-transparent outline-hidden text-slate-800"
                />
              </div>

              {/* Presets quick tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 self-center">Popular:</span>
                {LANDMARK_PRESETS.slice(0, 4).map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleOriginPreset(p.name)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 truncate max-w-44 transition-colors"
                  >
                    {p.name.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Destination & Presets */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Drop-off Destination Address
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-indigo-600 focus-within:bg-white transition-all">
                <MapPin className="w-4 h-4 text-violet-600 shrink-0" />
                <input
                  type="text"
                  required
                  value={destAddress}
                  onChange={(e) => setDestAddress(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-transparent outline-hidden text-slate-800"
                />
              </div>

              {/* Presets quick tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 self-center">Popular:</span>
                {LANDMARK_PRESETS.slice(2, 6).map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleDestPreset(p.name)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 truncate max-w-44 transition-colors"
                  >
                    {p.name.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Departure Time */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Departure Date & Time
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-indigo-600 focus-within:bg-white transition-all">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="datetime-local"
                  required
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-transparent outline-hidden text-slate-800"
                />
              </div>
            </div>

            {/* Seats & Price */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Seats to Offer
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50">
                  <Users className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(Number(e.target.value))}
                    className="w-full text-xs sm:text-sm bg-transparent outline-hidden text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Price per Seat (₹ INR)
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-xs font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    min="50"
                    step="10"
                    value={pricePerSeat}
                    onChange={(e) => setPricePerSeat(Number(e.target.value))}
                    className="w-full text-xs sm:text-sm bg-transparent outline-hidden text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Women-Only Toggle Card */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                isWomenOnly
                  ? 'border-pink-300 bg-pink-50/60'
                  : 'border-slate-200 bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck
                    className={`w-5 h-5 ${isWomenOnly ? 'text-pink-600' : 'text-slate-400'}`}
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Designate as Women-Only Commute
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Restricts bookings exclusively to verified female passengers
                    </span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={isWomenOnly}
                  disabled={!isEligibleForWomenOnly}
                  onChange={(e) => setIsWomenOnly(e.target.checked)}
                  className="w-5 h-5 text-pink-600 rounded border-slate-300 focus:ring-pink-500 disabled:opacity-40"
                />
              </div>

              {!isEligibleForWomenOnly && (
                <p className="text-[11px] text-amber-700 mt-2 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Only female accounts may host Women-Only journeys.
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Commuter Notes & Carpool Guidelines
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Non-smoking, trunk has luggage space, departure is sharp on time."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-indigo-600 outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 hover:scale-[1.01]"
            >
              {isSubmitting ? 'Publishing Ride...' : 'Publish Journey'}
            </button>
          </form>
        </div>

        {/* Live Route Map Preview Column */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Live Route Preview
            </span>
            <LeafletMap
              originLat={originLat}
              originLng={originLng}
              originAddress={originAddress}
              destLat={destLat}
              destLng={destLng}
              destAddress={destAddress}
              height="300px"
            />
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-600">
              <p className="font-semibold text-slate-800">Route Summary:</p>
              <p className="truncate">From: {originAddress}</p>
              <p className="truncate">To: {destAddress}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
