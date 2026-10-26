import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Search,
  CheckCircle2,
  PhoneCall,
  ArrowRight,
  TrendingDown,
  Lock,
} from 'lucide-react';
import { RideCard } from '../components/RideCard';
import { LeafletMap } from '../components/LeafletMap';
import { Ride } from '../types';
import { api } from '../services/api';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredRides, setFeaturedRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  // Search Bar State
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [womenOnly, setWomenOnly] = useState(false);

  useEffect(() => {
    api
      .listRides({ status: 'SCHEDULED' })
      .then((res) => {
        setFeaturedRides(res.rides.slice(0, 4));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading rides:', err);
        setLoading(false);
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (origin) query.append('origin', origin);
    if (destination) query.append('destination', destination);
    if (womenOnly) query.append('womenOnly', 'true');
    navigate(`/rides?${query.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white pt-16 pb-24 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Subtle background ambient glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-indigo-600/15 via-violet-600/20 to-pink-500/10 blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto">
          {/* Main Hero Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Next-Gen Community Mobility Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Your Route. Your People.{' '}
              <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
                Your Journey.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Intelligent, explainable AI matching that connects verified commuters. Travel safely, split fuel costs, and experience verified Women-Only safe journeys.
            </p>
          </div>

          {/* Unified Hero Search Box */}
          <div className="mt-10 max-w-4xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-200/80 text-slate-900">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Origin */}
                <div className="relative">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Pickup Location
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus-within:border-indigo-600 focus-within:bg-white transition-all">
                    <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                    <input
                      type="text"
                      placeholder="e.g. Kothrud, Pune / BKC Mumbai"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="w-full text-xs sm:text-sm bg-transparent border-none outline-hidden text-slate-800 placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Destination */}
                <div className="relative">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Drop-off Destination
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus-within:border-indigo-600 focus-within:bg-white transition-all">
                    <MapPin className="w-4 h-4 text-violet-600 shrink-0" />
                    <input
                      type="text"
                      placeholder="e.g. Hinjawadi Phase 1 / Powai"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full text-xs sm:text-sm bg-transparent border-none outline-hidden text-slate-800 placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Date & Search Button */}
                <div className="relative flex flex-col justify-end">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Departure Date
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus-within:border-indigo-600 focus-within:bg-white transition-all">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full text-xs sm:text-sm bg-transparent border-none outline-hidden text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Options & Submit */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 hover:text-pink-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={womenOnly}
                    onChange={(e) => setWomenOnly(e.target.checked)}
                    className="w-4 h-4 text-pink-600 rounded border-slate-300 focus:ring-pink-500"
                  />
                  <ShieldCheck className="w-4 h-4 text-pink-500" />
                  <span>Show Women-Only Commutes</span>
                </label>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <Link
                    to="/offer-ride"
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-center"
                  >
                    Offer a Ride
                  </Link>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs sm:text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                  >
                    <Search className="w-4 h-4" />
                    Find Smart Matches
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Hero Visual Preview */}
          <div className="mt-8 max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10 group relative">
            <img
              src="/hero-banner.jpg"
              alt="SAFAR AI Intelligent Mobility Corridor"
              className="w-full h-48 sm:h-72 object-cover object-center group-hover:scale-[1.01] transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4 sm:p-6">
              <span className="text-xs sm:text-sm font-semibold text-white/90 drop-shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
                Connected Metropolitan Corridors: Pune • Mumbai • Navi Mumbai • Thane • Nashik (Maharashtra)
              </span>
            </div>
          </div>

          {/* Trust Highlights */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-center text-xs text-slate-400">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-xl font-bold text-white mb-0.5">10,000+</p>
              <p>Verified Journeys</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-xl font-bold text-emerald-400 mb-0.5">100%</p>
              <p>ID Verified Community</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-xl font-bold text-pink-400 mb-0.5">Dedicated</p>
              <p>Women-Only Spaces</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-xl font-bold text-red-400 mb-0.5">112 SOS</p>
              <p>24/7 Rapid Safety Desk</p>
            </div>
          </div>
        </div>
      </section>

      {/* Women-Only Commutes Highlight Banner */}
      <section className="py-12 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 border-y border-pink-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-800 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-pink-600" />
              Safety Priority Feature
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Women-Only Commutes: Safe, Dignified & Verified
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Designed for female professionals, university students, and commuters seeking peaceful, verified carpools. Rides hosted exclusively by verified female drivers with strictly restricted female-only bookings.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-700">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Verified National Identity Checks
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                No inferred gender — explicit verification
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Direct 1091 Women Protection Hotline
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Link
              to="/rides?womenOnly=true"
              className="px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-pink-600/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <ShieldCheck className="w-4 h-4" />
              Browse Women-Only Rides
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Scheduled Rides */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Upcoming Verified Commutes</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Popular daily corridors across Pune, Mumbai, Thane, Navi Mumbai, and Nashik (Maharashtra).
            </p>
          </div>
          <Link
            to="/rides"
            className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredRides.map((ride) => (
              <RideCard key={ride.id} ride={ride} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="py-16 bg-slate-50 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              How SAFAR AI Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Simple, transparent, and built for safety from the ground up.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Publish or Search Route</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Enter your exact pickup and drop-off coordinates, preferred departure time, and safety preferences.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 font-bold flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Explainable AI Match</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Our rule-based engine scores rides 0–100 based on pickup proximity (30%), destination (30%), time (20%), route bearing (15%), and user habits (5%).
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Ride with Peace of Mind</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Pay with simulated wallet, view driver credentials, track trip live on OpenStreetMap, and trigger 112 SOS if emergency arises.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Matching Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Transparent Rule-Based Scoring
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              AI Matching You Can Understand & Trust
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Unlike opaque black-box models, SAFAR AI uses deterministic heuristics to ensure you only share rides with people whose travel schedules truly align:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 text-xs">
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <span className="text-lg font-bold text-indigo-400 block">30%</span>
                <span className="text-slate-300">Pickup Proximity</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <span className="text-lg font-bold text-indigo-400 block">30%</span>
                <span className="text-slate-300">Destination Proximity</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <span className="text-lg font-bold text-indigo-400 block">20%</span>
                <span className="text-slate-300">Departure Time</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <span className="text-lg font-bold text-indigo-400 block">15%</span>
                <span className="text-slate-300">Route Direction</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <span className="text-lg font-bold text-indigo-400 block">5%</span>
                <span className="text-slate-300">Quiet/Preferences</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3 border border-white/10 flex flex-col justify-center">
                <Link
                  to="/ai-matches"
                  className="text-violet-300 font-bold hover:text-white flex items-center gap-1"
                >
                  Test Matches <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Center Spotlight */}
      <section className="py-16 bg-slate-900 text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              24/7 Safety Command Center
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              One Tap to Emergency Dispatch 112
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Every ride on SAFAR AI is monitored with live GPS coordinate sharing. Passengers have instant access to silent panic triggers, route deviation reporting, and direct links to emergency responders.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/safety"
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 font-semibold text-xs sm:text-sm shadow-md shadow-red-600/30 transition-all flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              Visit Safety Center
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
