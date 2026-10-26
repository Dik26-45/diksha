import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Search,
  Filter,
  ShieldCheck,
  Calendar,
  ArrowUpDown,
  RotateCcw,
  Map as MapIcon,
} from 'lucide-react';
import { RideCard } from '../components/RideCard';
import { LeafletMap } from '../components/LeafletMap';
import { Ride } from '../types';
import { api } from '../services/api';

export const FindRidePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State from query parameters
  const [origin, setOrigin] = useState(searchParams.get('origin') || '');
  const [destination, setDestination] = useState(searchParams.get('destination') || '');
  const [womenOnly, setWomenOnly] = useState(
    searchParams.get('womenOnly') === 'true' || searchParams.get('isWomenOnly') === 'true'
  );
  const [sortBy, setSortBy] = useState('departureTime');
  const [order, setOrder] = useState('asc');

  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(true);

  const fetchRides = () => {
    setLoading(true);
    api
      .listRides({
        origin: origin || undefined,
        destination: destination || undefined,
        isWomenOnly: womenOnly ? true : undefined,
        sortBy,
        order,
      })
      .then((res) => {
        setRides(res.rides);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch rides:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRides();
  }, [womenOnly, sortBy, order]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRides();
  };

  const handleReset = () => {
    setOrigin('');
    setDestination('');
    setWomenOnly(false);
    setSortBy('departureTime');
    setOrder('asc');
    setSearchParams({});
  };

  // Find center coordinates from rides or fallback
  const firstRide = rides[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-7 h-7 text-indigo-600" />
            Find a Verified Ride
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search scheduled commutes across Pune, Mumbai, Thane, Navi Mumbai, Nashik, and Maharashtra corridors.
          </p>
        </div>

        <button
          onClick={() => setShowMap(!showMap)}
          className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <MapIcon className="w-4 h-4 text-indigo-600" />
          {showMap ? 'Hide Route Map' : 'Show Route Map'}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Origin */}
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-indigo-600 focus-within:bg-white transition-all">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
              <input
                type="text"
                placeholder="From: e.g. Kothrud, BKC, Viman Nagar"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full text-xs sm:text-sm bg-transparent outline-hidden text-slate-800"
              />
            </div>

            {/* Destination */}
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-indigo-600 focus-within:bg-white transition-all">
              <MapPin className="w-4 h-4 text-violet-600 shrink-0" />
              <input
                type="text"
                placeholder="To: e.g. Hinjawadi, Powai, Kharadi"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full text-xs sm:text-sm bg-transparent outline-hidden text-slate-800"
              />
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50">
              <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={`${sortBy}-${order}`}
                onChange={(e) => {
                  const [field, dir] = e.target.value.split('-');
                  setSortBy(field);
                  setOrder(dir);
                }}
                className="w-full text-xs sm:text-sm bg-transparent outline-hidden text-slate-800"
              >
                <option value="departureTime-asc">Departure: Earliest First</option>
                <option value="departureTime-desc">Departure: Latest First</option>
                <option value="price-asc">Price: Lowest First</option>
                <option value="price-desc">Price: Highest First</option>
                <option value="seats-desc">Seats: Most Available</option>
              </select>
            </div>

            {/* Submit & Reset Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
              <button
                type="button"
                onClick={handleReset}
                title="Reset filters"
                className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Women-Only Toggle Pill */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setWomenOnly(!womenOnly)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                womenOnly
                  ? 'bg-pink-100 text-pink-800 border border-pink-300 ring-2 ring-pink-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${womenOnly ? 'text-pink-600' : 'text-slate-400'}`} />
              Women-Only Rides Only {womenOnly && '✓ Active'}
            </button>

            <span className="text-xs text-slate-500">
              Showing <b className="text-slate-900">{rides.length}</b> scheduled journeys
            </span>
          </div>
        </form>
      </div>

      {/* Interactive Map View */}
      {showMap && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Maharashtra Corridor Geographic View (English Map)
            </span>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Pickup
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span> Women-Only
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-600"></span> Drop-off
              </span>
            </div>
          </div>
          <LeafletMap
            rides={rides}
            originLat={firstRide?.originLat || 18.5204}
            originLng={firstRide?.originLng || 73.8567}
            originAddress={firstRide?.originAddress || 'Central Pune, Maharashtra'}
            destLat={firstRide?.destLat || 18.5912}
            destLng={firstRide?.destLng || 73.7389}
            destAddress={firstRide?.destAddress || 'Hinjawadi IT Park, Pune'}
            height="320px"
          />
        </div>
      )}

      {/* Rides Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : rides.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Compass className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No rides match your current filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try broadening your location terms or resetting the Women-Only filter.
          </p>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 mt-2"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rides.map((ride) => (
            <RideCard key={ride.id} ride={ride} />
          ))}
        </div>
      )}
    </div>
  );
};
