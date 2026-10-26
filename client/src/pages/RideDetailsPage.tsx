import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  Star,
  Users,
  Car,
  AlertTriangle,
  ArrowLeft,
  Share2,
  CheckCircle,
} from 'lucide-react';
import { LeafletMap } from '../components/LeafletMap';
import { PaymentModal } from '../components/PaymentModal';
import { useAuth } from '../context/AuthContext';
import { Ride, Booking } from '../types';
import { api } from '../services/api';

export const RideDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .getRide(id)
      .then((res) => {
        setRide(res.ride);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Ride not found.');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">Loading ride information...</p>
      </div>
    );
  }

  if (error || !ride) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-medium border border-red-200">
          {error || 'The requested ride could not be located.'}
        </div>
        <Link
          to="/rides"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Rides Search
        </Link>
      </div>
    );
  }

  const departureDate = new Date(ride.departureTime);
  const formattedDate = departureDate.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = departureDate.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Eligibility check for Women-Only rides
  const isEligibleToBook = !ride.isWomenOnly || (user && user.gender === 'FEMALE');
  const isDriver = user && user.id === ride.providerId;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Share */}
      <div className="flex items-center justify-between">
        <Link
          to="/rides"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Rides
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          {copied ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Copied Link!
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-slate-500" /> Share Journey
            </>
          )}
        </button>
      </div>

      {/* Main Grid: Map & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Map, Route, Checkpoints, Vehicle & Co-Passengers */}
        <div className="lg:col-span-2 space-y-6">
          {/* Leaflet Map Preview */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Interactive Road Path & Waypoints
              </span>
              {ride.highwayCorridor && (
                <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full">
                  🛣️ {ride.highwayCorridor}
                </span>
              )}
            </div>
            <LeafletMap
              originLat={ride.originLat}
              originLng={ride.originLng}
              originAddress={ride.originAddress}
              destLat={ride.destLat}
              destLng={ride.destLng}
              destAddress={ride.destAddress}
              waypoints={ride.waypoints}
              height="360px"
            />
          </div>

          {/* Route Overview & Checkpoints Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Journey Itinerary & Road Route</h2>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  {ride.distanceKm && (
                    <span>Distance: <b className="text-slate-800">{ride.distanceKm} km</b></span>
                  )}
                  {ride.durationMins && (
                    <>
                      <span>•</span>
                      <span>Estimated Time: <b className="text-slate-800">{ride.durationMins} mins</b></span>
                    </>
                  )}
                </div>
              </div>

              {ride.isWomenOnly && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-pink-50 text-pink-700 border border-pink-200 shrink-0">
                  <ShieldCheck className="w-4 h-4 text-pink-600" />
                  Women-Only Safe Commute
                </span>
              )}
            </div>

            {/* Checkpoint list */}
            <div className="space-y-4 relative pl-7 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {/* Departure */}
              <div>
                <div className="absolute left-1 top-1 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-xs" />
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                  Departure Point
                </span>
                <p className="text-sm font-bold text-slate-900">{ride.originAddress}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formattedDate} at <b className="text-slate-800">{formattedTime}</b>
                </p>
              </div>

              {/* Waypoints */}
              {ride.waypoints && ride.waypoints.length > 0 && (
                <div className="space-y-3 pt-1 pb-1">
                  {ride.waypoints.map((wp, idx) => (
                    <div key={idx} className="relative pl-1">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-white" />
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                        Road Checkpoint {idx + 1}
                      </span>
                      <p className="text-xs font-semibold text-slate-700">{wp.name}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Destination */}
              <div>
                <div className="absolute left-1 top-1 w-3.5 h-3.5 rounded-full bg-violet-600 border-2 border-white shadow-xs" />
                <span className="text-[11px] font-bold text-violet-600 uppercase tracking-wider block">
                  Final Drop-off Destination
                </span>
                <p className="text-sm font-bold text-slate-900">{ride.destAddress}</p>
                {ride.estimatedArrivalTime && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Estimated arrival:{' '}
                    {new Date(ride.estimatedArrivalTime).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            </div>

            {ride.notes && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
                <span className="font-bold text-slate-800 block mb-1">Host Notes:</span>
                {ride.notes}
              </div>
            )}
          </div>

          {/* Vehicle Information */}
          {ride.vehicle && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Car className="w-4 h-4 text-indigo-600" /> Vehicle Information
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50">
                  <span className="text-slate-400 block text-[11px]">Make & Model</span>
                  <span className="font-semibold text-slate-900">
                    {ride.vehicle.make} {ride.vehicle.model}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50">
                  <span className="text-slate-400 block text-[11px]">Year & Color</span>
                  <span className="font-semibold text-slate-900">
                    {ride.vehicle.year} • {ride.vehicle.color}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50">
                  <span className="text-slate-400 block text-[11px]">License Plate</span>
                  <span className="font-mono font-bold text-indigo-700">
                    {ride.vehicle.licensePlate}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50">
                  <span className="text-slate-400 block text-[11px]">Total Capacity</span>
                  <span className="font-semibold text-slate-900">
                    {ride.vehicle.capacity} Passengers
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Co-Passengers On This Journey */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Co-Passengers on this Journey
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {ride.bookings && ride.bookings.length > 0
                  ? `${ride.bookings.length} confirmed companion(s)`
                  : 'Open seats available'}
              </span>
            </div>

            {ride.bookings && ride.bookings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ride.bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3"
                  >
                    <img
                      src={
                        b.passenger?.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                      }
                      alt={b.passenger?.fullName || 'Passenger'}
                      className="w-11 h-11 rounded-full object-cover border border-white shadow-xs shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {b.passenger?.fullName || 'Verified Passenger'}
                        </span>
                        {b.passenger?.isVerified && (
                          <span title="Aadhaar Verified" className="text-emerald-500 shrink-0">
                            <ShieldCheck className="w-3.5 h-3.5 fill-emerald-100" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {b.passenger?.bio || 'Professional Commuter'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                        <span className="font-semibold text-indigo-600">
                          {b.seatCount} Seat{b.seatCount > 1 ? 's' : ''} reserved
                        </span>
                        <span>•</span>
                        <span className="capitalize">{b.passenger?.gender?.toLowerCase()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-center text-xs text-slate-500">
                No co-passengers have reserved a seat yet. You will be the first companion on this route!
              </div>
            )}
          </div>

          {/* Women-Only Relative Safe-Tracking Guarantee */}
          {ride.isWomenOnly && (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 border border-pink-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-pink-900 font-bold">
                <ShieldCheck className="w-5 h-5 text-pink-600" />
                <span>Guardian & Relative Safe-Tracking Guarantee</span>
              </div>
              <p className="text-pink-800 text-[11px] leading-relaxed">
                When you reserve this Women-Only journey, a tamper-proof live GPS tracking link is generated with vehicle plate details (<b>{ride.vehicle?.licensePlate}</b>) and driver verified credentials. You can easily broadcast this link to your mother, father, sibling, or guardian via WhatsApp or SMS.
              </p>
            </div>
          )}
        </div>

        {/* Right Col: Driver & Booking Box */}
        <div className="space-y-6">
          {/* Driver Credentials Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Host Driver
            </h3>

            <div className="flex items-center gap-3">
              <img
                src={
                  ride.provider?.avatarUrl ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                }
                alt={ride.provider?.fullName}
                className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-900">{ride.provider?.fullName}</h4>
                  {ride.provider?.isVerified && (
                    <span title="Government Identity Verified" className="text-emerald-500">
                      <ShieldCheck className="w-4 h-4 fill-emerald-100" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span className="flex items-center text-amber-500 font-bold gap-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {ride.provider?.ratingAvg?.toFixed(1) || '5.0'}
                  </span>
                  <span>•</span>
                  <span>{ride.provider?.totalRatingsCount || 0} reviews</span>
                </div>
              </div>
            </div>

            {ride.provider?.bio && (
              <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl leading-relaxed">
                “{ride.provider.bio}”
              </p>
            )}

            <div className="border-t border-slate-100 pt-3 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Identity Status:</span>
                <span className="font-semibold text-emerald-700">
                  {ride.provider?.isVerified ? '✓ Aadhaar Verified' : 'Standard'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Gender:</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {ride.provider?.gender?.toLowerCase().replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Contact Phone:</span>
                <span className="font-semibold text-slate-800">{ride.provider?.phone}</span>
              </div>
            </div>
          </div>

          {/* Pricing & Booking Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Price per seat</span>
                <span className="text-3xl font-extrabold text-slate-900">
                  ₹{ride.pricePerSeat}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                  {ride.availableSeats} of {ride.totalSeats} seats left
                </span>
              </div>
            </div>

            {/* Women-Only Warning / Ineligibility Banner */}
            {ride.isWomenOnly && (
              <div className="p-3 bg-pink-50 border border-pink-200 rounded-xl text-xs text-pink-900 space-y-1">
                <span className="font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider text-pink-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-pink-600" />
                  Restricted Category: Women-Only
                </span>
                <p className="text-[11px] text-pink-800 leading-snug">
                  Only verified female passengers may reserve seats on this ride to preserve a safe, comfortable environment.
                </p>
              </div>
            )}

            {/* CTA Buttons */}
            {isDriver ? (
              <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-500 font-medium">
                You are the provider hosting this ride.
              </div>
            ) : !user ? (
              <Link
                to="/login"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm text-center block shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01]"
              >
                Sign In to Reserve Seat
              </Link>
            ) : !isEligibleToBook ? (
              <div className="space-y-2">
                <button
                  disabled
                  className="w-full py-3 rounded-xl bg-slate-200 text-slate-400 font-semibold text-xs cursor-not-allowed"
                >
                  Booking Restricted
                </button>
                <p className="text-[11px] text-center text-red-600 font-medium">
                  Safety policy: Only female commuters may book this ride.
                </p>
              </div>
            ) : ride.availableSeats <= 0 ? (
              <button
                disabled
                className="w-full py-3 rounded-xl bg-slate-200 text-slate-400 font-semibold text-xs cursor-not-allowed"
              >
                Fully Booked
              </button>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                Reserve Seat Now
              </button>
            )}

            <p className="text-[11px] text-center text-slate-400">
              Free cancellation up to 1 hour before departure.
            </p>
          </div>
        </div>
      </div>

      {/* Simulated Payment Modal */}
      {ride && (
        <PaymentModal
          ride={ride}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            // refresh ride to update available seats and bookings
            api.getRide(ride.id).then((res) => setRide(res.ride));
          }}
        />
      )}
    </div>
  );
};
