import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Calendar, Clock, Star, Users, Car } from 'lucide-react';
import { Ride } from '../types';

interface RideCardProps {
  ride: Ride;
  matchScore?: number;
  matchExplanation?: string;
}

export const RideCard: React.FC<RideCardProps> = ({
  ride,
  matchScore,
  matchExplanation,
}) => {
  const departureDate = new Date(ride.departureTime);
  const formattedDate = departureDate.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = departureDate.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all p-5 flex flex-col justify-between group">
      <div>
        {/* Header: Driver Info & Badges */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <img
              src={
                ride.provider?.avatarUrl ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
              }
              alt={ride.provider?.fullName || 'Driver'}
              className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {ride.provider?.fullName || 'Verified Commuter'}
                </h3>
                {ride.provider?.isVerified && (
                  <span title="Government Verified Identity" className="text-emerald-500">
                    <ShieldCheck className="w-4 h-4 fill-emerald-100" />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center text-amber-500 font-semibold gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {ride.provider?.ratingAvg?.toFixed(1) || '5.0'}
                </span>
                <span>•</span>
                <span>{ride.provider?.totalRatingsCount || 10} rides</span>
                {ride.vehicle && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <Car className="w-3 h-3" />
                      {ride.vehicle.make} {ride.vehicle.model}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Women-Only or Category Badge */}
          <div className="flex flex-col items-end gap-1">
            {ride.isWomenOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-200">
                <ShieldCheck className="w-3.5 h-3.5 text-pink-500" />
                Women-Only
              </span>
            )}

            {matchScore !== undefined && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-violet-100 text-violet-800">
                {matchScore}% Match
              </span>
            )}
          </div>
        </div>

        {/* AI Match Explanation Callout if present */}
        {matchExplanation && (
          <div className="mb-3 px-3 py-1.5 rounded-lg bg-violet-50/70 border border-violet-100 text-[11px] text-violet-900 leading-snug">
            <span className="font-semibold text-violet-700">AI Scoring: </span>
            {matchExplanation}
          </div>
        )}

        {/* Route Details with Visual Connector */}
        <div className="space-y-3 relative pl-6 my-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {/* Origin */}
          <div className="relative">
            <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-xs"></div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Pickup</p>
            <p className="text-sm font-medium text-slate-800 line-clamp-1">{ride.originAddress}</p>
          </div>

          {/* Destination */}
          <div className="relative">
            <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-violet-600 border-2 border-white shadow-xs"></div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Drop-off</p>
            <p className="text-sm font-medium text-slate-800 line-clamp-1">{ride.destAddress}</p>
          </div>
        </div>

        {/* Time, Availability, and Highway Corridor */}
        <div className="space-y-1.5 my-3">
          <div className="grid grid-cols-2 gap-2 py-2 px-3 bg-slate-50 rounded-xl text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-900">{formattedTime}</span>
            </div>
          </div>
          {ride.highwayCorridor && (
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span className="truncate">🛣️ {ride.highwayCorridor}</span>
              {ride.distanceKm && <span>{ride.distanceKm} km</span>}
            </div>
          )}
        </div>
      </div>

      {/* Footer: Seats, Price, and Action Button */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5 text-xs">
          <Users className="w-4 h-4 text-slate-400" />
          <span
            className={`font-semibold ${
              ride.availableSeats > 1 ? 'text-slate-700' : 'text-amber-600 font-bold'
            }`}
          >
            {ride.availableSeats} of {ride.totalSeats} seats left
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">per seat</span>
            <span className="text-base font-bold text-slate-900">
              ₹{ride.pricePerSeat}
            </span>
          </div>

          <Link
            to={`/rides/${ride.id}`}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs shadow-indigo-600/20 transition-all hover:scale-[1.02]"
          >
            Details & Book
          </Link>
        </div>
      </div>
    </div>
  );
};
