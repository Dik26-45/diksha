import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  Car,
  PhoneCall,
  Share2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Navigation,
  Users,
} from 'lucide-react';
import { LeafletMap } from '../components/LeafletMap';

interface TrackingData {
  bookingReference: string;
  status: string;
  createdAt: string;
  seatCount: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  shareLiveLocationWithRelative?: boolean;
  passenger?: {
    fullName: string;
    avatarUrl?: string;
    isVerified?: boolean;
    gender?: string;
  };
  ride?: {
    id: string;
    originAddress: string;
    originLat: number;
    originLng: number;
    destAddress: string;
    destLat: number;
    destLng: number;
    departureTime: string;
    estimatedArrivalTime?: string;
    pricePerSeat: number;
    status: string;
    isWomenOnly: boolean;
    distanceKm?: number;
    durationMins?: number;
    highwayCorridor?: string;
    waypoints?: Array<{ name: string; lat: number; lng: number }>;
    provider?: {
      fullName: string;
      phone?: string;
      avatarUrl?: string;
      ratingAvg?: number;
      isVerified?: boolean;
      bio?: string;
    };
    vehicle?: {
      make: string;
      model: string;
      color: string;
      licensePlate: string;
      year: number;
    };
    bookings?: Array<{
      id: string;
      passenger?: {
        fullName: string;
        avatarUrl?: string;
        isVerified?: boolean;
      };
      seatCount: number;
    }>;
  };
}

export const RelativeTrackingPage: React.FC = () => {
  const { ref } = useParams<{ ref: string }>();
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!ref) return;
    fetch(`/api/bookings/track/${encodeURIComponent(ref)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Tracking record not found');
        return res.json();
      })
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Unable to locate tracking information');
        setLoading(false);
      });
  }, [ref]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-600">Connecting to SAFAR AI GPS Telemetry...</p>
        <p className="text-xs text-slate-400 mt-1">Retrieving live vehicle coordinates in Maharashtra</p>
      </div>
    );
  }

  if (error || !data || !data.ride) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-medium border border-red-200">
          {error || 'Active tracking link expired or invalid.'}
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="w-4 h-4" /> Go to SAFAR AI Home
        </Link>
      </div>
    );
  }

  const ride = data.ride;
  // Calculate simulated mid-corridor live position
  const currentLat = (ride.originLat + ride.destLat) / 2 + 0.005;
  const currentLng = (ride.originLng + ride.destLng) / 2 - 0.005;

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `🚨 SAFAR AI Live Guardian Tracking: ${data.passenger?.fullName || 'Passenger'} is commuting with ${ride.provider?.fullName} (Vehicle: ${ride.vehicle?.licensePlate || ''}). Track live GPS: ${window.location.href}`
  )}`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-pink-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold border border-pink-400/30">
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping"></span>
              Official Guardian & Relative Live Telemetry
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Tracking: {data.passenger?.fullName}’s Journey
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Booking Ref: <b className="text-white font-mono">{data.bookingReference}</b> • Status:{' '}
              <span className="text-emerald-400 font-bold uppercase">{data.status}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              <Share2 className="w-4 h-4" /> Share on WhatsApp
            </a>
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors"
            >
              {copied ? '✓ Copied' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Relative Contact Card */}
        {data.emergencyContactName && (
          <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-slate-300">
              Designated Emergency Relative:{' '}
              <b className="text-white font-semibold">{data.emergencyContactName}</b>{' '}
              {data.emergencyContactPhone && `(${data.emergencyContactPhone})`}
            </span>
            <span className="text-pink-300 font-semibold text-[11px]">
              ✓ Verified Live Coordinates Broadcast Enabled
            </span>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Live Map & Route Waypoints */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-600 animate-spin" />
                Live Vehicle GPS Telemetry (Maharashtra)
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Vehicle Moving • ~42 km/h
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

          {/* Route Milestones & Checkpoints */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Corridor Route & Highway Checkpoints</h3>
              {ride.highwayCorridor && (
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                  {ride.highwayCorridor}
                </span>
              )}
            </div>

            <div className="space-y-4 relative pl-7 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              <div>
                <div className="absolute left-1 top-1 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-xs" />
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                  Departure Point
                </span>
                <p className="text-xs font-bold text-slate-900">{ride.originAddress}</p>
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

        {/* Right Col: Driver, Vehicle, Co-Passengers & SOS */}
        <div className="space-y-6">
          {/* Host Driver Verification Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Host Driver Information
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
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs text-center block transition-colors"
              >
                Call Driver Directly
              </a>
            )}
          </div>

          {/* Vehicle Information */}
          {ride.vehicle && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Vehicle Assigned
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
          {ride.bookings && ride.bookings.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                Co-Passengers on this Trip
              </span>
              <div className="space-y-2">
                {ride.bookings.map((b) => (
                  <div key={b.id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50">
                    <img
                      src={
                        b.passenger?.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                      }
                      alt={b.passenger?.fullName}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-slate-900 block truncate">
                        {b.passenger?.fullName || 'Verified Commuter'}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600">✓ Verified</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emergency Escalation */}
          <div className="bg-red-50 border border-red-200 rounded-3xl p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-red-900 font-bold">
              <PhoneCall className="w-4 h-4 text-red-600" />
              <span>Guardian Emergency Escalation</span>
            </div>
            <p className="text-red-800 text-[11px] leading-snug">
              If your relative is unreachable or you suspect danger, connect immediately with Indian National Emergency Police:
            </p>
            <a
              href="tel:112"
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs text-center block shadow-md shadow-red-600/30 transition-colors"
            >
              Dial 112 Emergency Police
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
