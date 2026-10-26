import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Navigation,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  PhoneCall,
  Share2,
  CheckCircle,
  ArrowLeft,
  Car,
  Users,
  CreditCard,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { LeafletMap } from '../components/LeafletMap';
import { Booking } from '../types';
import { api } from '../services/api';

export const TripDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .getBooking(id)
      .then((res) => {
        setBooking(res.booking);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching booking trip details:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Loading verified trip telemetry...</p>
        <p className="text-xs text-slate-400 mt-1">Connecting to Maharashtra GPS road corridor</p>
      </div>
    );
  }

  if (!booking || !booking.ride) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 bg-slate-100 text-slate-700 rounded-2xl text-sm font-medium">
          Trip information not found.
        </div>
        <Link
          to="/my-bookings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Bookings
        </Link>
      </div>
    );
  }

  const ride = booking.ride;
  // Midpoint simulated vehicle location
  const currentLat = (ride.originLat + ride.destLat) / 2 + 0.004;
  const currentLng = (ride.originLng + ride.destLng) / 2 - 0.003;

  const trackingUrl = `${window.location.origin}/track/${booking.bookingReference}`;

  const handleShareTrip = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmergencySos = async () => {
    if (
      confirm(
        'Trigger 112 Emergency Alert for this trip? Local Maharashtra Police responders and your designated relative will receive your live GPS coordinates immediately.'
      )
    ) {
      try {
        await api.triggerEmergencySos({
          rideId: ride.id,
          lat: currentLat,
          lng: currentLng,
          message: `112 SOS Emergency Alert dispatched from active trip (Ref: ${booking.bookingReference}). Passenger: ${booking.passenger?.fullName || 'Commuter'}.`,
        });
        setSosSent(true);
      } catch (err: any) {
        alert(err.message || 'Failed to dispatch SOS alert.');
      }
    }
  };

  const relativeWhatsAppUrl = `https://api.whatsapp.com/send?phone=${
    booking.emergencyContactPhone ? booking.emergencyContactPhone.replace(/[^0-9]/g, '') : ''
  }&text=${encodeURIComponent(
    `🚨 SAFAR AI Live Tracking for ${booking.passenger?.fullName || 'Passenger'}: I am commuting safely from ${ride.originAddress} to ${ride.destAddress} with driver ${ride.provider?.fullName || 'Verified Host'} (Vehicle: ${ride.vehicle?.licensePlate || ''}). Track my real-time GPS location here: ${trackingUrl}`
  )}`;

  // Cost calculation breakdown
  const baseFare = booking.totalPrice;
  const platformSafetyFee = 20;
  const gstAmount = Math.round(baseFare * 0.05);
  const totalAmount = baseFare + platformSafetyFee + gstAmount;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/my-bookings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Bookings
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleShareTrip}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Tracking Link Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-slate-500" /> Copy Tracking Link
              </>
            )}
          </button>

          <a
            href={trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200/80 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Relative Live View
          </a>

          <button
            onClick={handleEmergencySos}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" /> 112 SOS Alert
          </button>
        </div>
      </div>

      {sosSent && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-3xl text-xs space-y-1 shadow-xs">
          <span className="font-bold flex items-center gap-1.5 text-sm text-red-700">
            🚨 112 Emergency Dispatch Alert Sent!
          </span>
          <p>
            Emergency services (112), Maharashtra Highway Safety Command, and your designated emergency relative have been notified of your active coordinates.
          </p>
        </div>
      )}

      {/* For Women-Only: Dedicated Relative Location Sharing Banner */}
      {(ride.isWomenOnly || booking.shareLiveLocationWithRelative || booking.emergencyContactName) && (
        <div className="bg-gradient-to-r from-pink-900 via-rose-950 to-indigo-950 rounded-3xl p-6 text-white shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold border border-pink-400/30">
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping"></span>
                Women-Only Relative Safe-Tracking Active
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                Live Location Sharing with Relative
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Designated relative receives real-time GPS telemetry, vehicle plate (
                <b className="text-white font-mono">{ride.vehicle?.licensePlate}</b>), and driver identity for full peace of mind.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a
                href={relativeWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all hover:scale-[1.02]"
              >
                <MessageCircle className="w-4 h-4" /> Share on WhatsApp
              </a>

              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" /> Preview Relative Link
              </a>
            </div>
          </div>

          <div className="p-4 bg-white/10 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-pink-500/30 flex items-center justify-center font-bold text-pink-200 shrink-0">
                {booking.emergencyContactRelation?.[0] || 'R'}
              </div>
              <div>
                <span className="text-slate-300 block text-[11px]">Designated Relative / Guardian:</span>
                <span className="font-bold text-white text-sm">
                  {booking.emergencyContactName || 'Sunita Khan'}{' '}
                  <span className="text-pink-300 font-normal">
                    ({booking.emergencyContactRelation || 'Mother'})
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-300 text-xs">
              <span>
                Phone: <b className="text-white">{booking.emergencyContactPhone || '+91 98201 55432'}</b>
              </span>
              <span className="text-emerald-400 font-bold bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                ✓ Live Broadcast Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: 2 Cols Left (Map & Route details), 1 Col Right (Driver, Co-Passengers, Cost) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Live Map & Route Waypoints */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map Preview */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                Live GPS Telemetry (English Map)
              </span>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                Ref: {booking.bookingReference}
              </span>
            </div>

            <LeafletMap
              originLat={ride.originLat}
              originLng={ride.originLng}
              originAddress={ride.originAddress}
              destLat={ride.destLat}
              destLng={ride.destLng}
              destAddress={ride.destAddress}
              currentLat={currentLat}
              currentLng={currentLng}
              waypoints={ride.waypoints}
              height="380px"
            />
          </div>

          {/* Route Progression */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Trip Progression</h3>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 relative">
              <div className="flex flex-col items-center z-10">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  ✓
                </div>
                <span className="mt-1">Departed</span>
              </div>

              <div className="flex-1 h-1 bg-indigo-600 mx-2 relative top-[-10px]">
                <div className="w-1/2 h-full bg-indigo-600"></div>
              </div>

              <div className="flex flex-col items-center z-10">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs animate-pulse">
                  ●
                </div>
                <span className="mt-1 text-emerald-700">En Route (~45 km/h)</span>
              </div>

              <div className="flex-1 h-1 bg-slate-200 mx-2 relative top-[-10px]"></div>

              <div className="flex flex-col items-center z-10">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <span className="mt-1 text-slate-400">Arrived</span>
              </div>
            </div>
          </div>

          {/* Route Checkpoints & Itinerary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Corridor Route & Checkpoints</h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  {ride.distanceKm && (
                    <span>Distance: <b className="text-slate-800">{ride.distanceKm} km</b></span>
                  )}
                  {ride.durationMins && (
                    <>
                      <span>•</span>
                      <span>Duration: <b className="text-slate-800">{ride.durationMins} mins</b></span>
                    </>
                  )}
                </div>
              </div>

              {ride.highwayCorridor && (
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full">
                  🛣️ {ride.highwayCorridor}
                </span>
              )}
            </div>

            <div className="space-y-4 relative pl-7 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              <div>
                <div className="absolute left-1 top-1 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-xs" />
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                  Pickup Location
                </span>
                <p className="text-xs font-bold text-slate-900">{ride.originAddress}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Departure: {new Date(ride.departureTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {ride.waypoints && (
                <div className="space-y-2.5 py-1">
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

              <div>
                <div className="absolute left-1 top-1 w-3.5 h-3.5 rounded-full bg-violet-600 border-2 border-white shadow-xs" />
                <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider block">
                  Drop-off Destination
                </span>
                <p className="text-xs font-bold text-slate-900">{ride.destAddress}</p>
                {ride.estimatedArrivalTime && (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Est. Arrival:{' '}
                    {new Date(ride.estimatedArrivalTime).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Driver, Co-Passengers, Vehicle, and Cost Breakdown */}
        <div className="space-y-6">
          {/* Driver Detail Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Host Driver Credentials
            </span>

            <div className="flex items-center gap-3">
              <img
                src={
                  ride.provider?.avatarUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                }
                alt={ride.provider?.fullName}
                className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-900">{ride.provider?.fullName}</h4>
                  {ride.provider?.isVerified && (
                    <span title="Aadhaar Verified" className="text-emerald-500">
                      <ShieldCheck className="w-4 h-4 fill-emerald-100" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">★ {ride.provider?.ratingAvg?.toFixed(1) || '5.0'} Rating</p>
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
                <span className="font-semibold text-emerald-700">✓ Aadhaar Verified</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Driver Phone:</span>
                <span className="font-semibold text-slate-800">{ride.provider?.phone || '+91 98201 11101'}</span>
              </div>
            </div>

            {ride.provider?.phone && (
              <a
                href={`tel:${ride.provider.phone}`}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs text-center block transition-colors shadow-xs"
              >
                Call Driver Directly
              </a>
            )}
          </div>

          {/* Vehicle Information */}
          {ride.vehicle && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Vehicle Details
              </span>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Car className="w-5 h-5 text-indigo-600" />
                <span>
                  {ride.vehicle.make} {ride.vehicle.model}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">License Plate</span>
                  <span className="font-mono font-bold text-indigo-700 text-xs">
                    {ride.vehicle.licensePlate}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Color</span>
                  <span className="font-semibold text-slate-800">{ride.vehicle.color}</span>
                </div>
              </div>
            </div>
          )}

          {/* Co-Passengers On Board */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              Co-Passengers on this Trip
            </span>
            {ride.bookings && ride.bookings.length > 0 ? (
              <div className="space-y-2">
                {ride.bookings.map((b) => (
                  <div key={b.id} className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50">
                    <img
                      src={
                        b.passenger?.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                      }
                      alt={b.passenger?.fullName}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-slate-900 block truncate">
                        {b.passenger?.fullName || 'Verified Commuter'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {b.seatCount} Seat{b.seatCount > 1 ? 's' : ''} reserved
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 shrink-0">✓ Verified</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-[11px] italic">
                You are currently the only confirmed passenger on this route.
              </p>
            )}
          </div>

          {/* Transparent Cost Breakdown Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" /> Route Cost Breakdown
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Base Fare ({booking.seatCount} seat{booking.seatCount > 1 ? 's' : ''} × ₹{ride.pricePerSeat}):</span>
                <span className="font-medium text-slate-900">₹{baseFare}</span>
              </div>
              <div className="flex justify-between">
                <span>Safety & Insurance Protection:</span>
                <span className="font-medium text-slate-900">₹{platformSafetyFee}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5% Road Transport):</span>
                <span className="font-medium text-slate-900">₹{gstAmount}</span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-slate-900 text-sm">
                <span>Total Paid:</span>
                <span className="text-emerald-700">₹{totalAmount}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-500 space-y-1">
              <p>Payment Method: <b className="text-slate-800">Simulated UPI / Wallet</b></p>
              <p>Transaction Status: <b className="text-emerald-600">Settled (Simulated)</b></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

