import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  Compass,
  PlusCircle,
  Car,
  Calendar,
  Sparkles,
  PhoneCall,
  Bell,
  CheckCircle,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RideCard } from '../components/RideCard';
import { Booking, Ride, Notification } from '../types';
import { api } from '../services/api';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [offeredRides, setOfferedRides] = useState<Ride[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recommendedRides, setRecommendedRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [bookingsRes, ridesRes, notifsRes] = await Promise.all([
          api.getMyBookings().catch(() => ({ bookings: [] })),
          api.listRides({ status: 'SCHEDULED' }).catch(() => ({ rides: [] })),
          api.getMyNotifications().catch(() => ({ notifications: [] })),
        ]);

        setBookings(bookingsRes.bookings || []);
        setNotifications((notifsRes.notifications || []).slice(0, 3));

        if (user) {
          const myOffered = (ridesRes.rides || []).filter((r) => r.providerId === user.id);
          setOfferedRides(myOffered);

          // Recommended rides (excluding user's own)
          const otherRides = (ridesRes.rides || []).filter((r) => r.providerId !== user.id);
          setRecommendedRides(otherRides.slice(0, 2));
        }
      } catch (err) {
        console.error('Error fetching dashboard info:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  if (!user) return null;

  const activeBookings = bookings.filter((b) => b.status === 'CONFIRMED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Verification Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase tracking-wider">
              {user.role.replace('_', ' ')} Portal
            </span>

            {user.isVerified ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Verified Identity
              </span>
            ) : (
              <Link
                to="/profile"
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 hover:bg-amber-500/30 transition-colors"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                {user.verificationStatus === 'PENDING'
                  ? 'Verification Pending Review'
                  : 'Verify Govt ID (Aadhaar) to Unlock Badges'}
              </Link>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user.fullName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            “Your Route. Your People. Your Journey.” Connect with verified carpool partners across Pune, Mumbai, Thane, Navi Mumbai, and Nashik (Maharashtra).
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto text-center shrink-0">
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10 min-w-24">
            <span className="text-2xl font-bold block">{activeBookings.length}</span>
            <span className="text-[11px] text-slate-300">Bookings</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10 min-w-24">
            <span className="text-2xl font-bold block">{offeredRides.length}</span>
            <span className="text-[11px] text-slate-300">Offered</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 border border-white/10 min-w-24">
            <span className="text-2xl font-bold text-amber-400 block">
              ★ {user.ratingAvg?.toFixed(1) || '5.0'}
            </span>
            <span className="text-[11px] text-slate-300">Rating</span>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Link
          to="/rides"
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 block">Find a Ride</span>
            <span className="text-[11px] text-slate-500">Search scheduled commutes</span>
          </div>
        </Link>

        <Link
          to="/offer-ride"
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 block">Offer a Ride</span>
            <span className="text-[11px] text-slate-500">Share your empty seats</span>
          </div>
        </Link>

        <Link
          to="/ai-matches"
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-violet-400 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 block">AI Matching</span>
            <span className="text-[11px] text-slate-500">5-factor scored routes</span>
          </div>
        </Link>

        <Link
          to="/safety"
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-red-400 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 block">Safety & 112 SOS</span>
            <span className="text-[11px] text-slate-500">Rapid response desk</span>
          </div>
        </Link>
      </div>

      {/* Main Content Sections: Bookings & Recommended */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: My Active Bookings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Car className="w-5 h-5 text-indigo-600" />
              Active Bookings ({activeBookings.length})
            </h2>
            <Link
              to="/my-bookings"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              All Bookings <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeBookings.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <Car className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No active ride reservations</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Ready to travel? Search our verified shared rides or check AI route matches.
              </p>
              <Link
                to="/rides"
                className="inline-block mt-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Find a Ride
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activeBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col sm:flex-row justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {b.bookingReference}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        Confirmed
                      </span>
                      {b.ride?.isWomenOnly && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700">
                          Women-Only
                        </span>
                      )}
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="font-medium text-slate-800">
                        {b.ride?.originAddress} <span className="text-slate-400">→</span> {b.ride?.destAddress}
                      </p>
                      <p className="text-slate-500">
                        Driver: <span className="font-semibold text-slate-700">{b.ride?.provider?.fullName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">{b.seatCount} Seat(s)</span>
                      <span className="text-base font-bold text-slate-900">₹{b.totalPrice}</span>
                    </div>

                    <Link
                      to={`/trips/${b.id}`}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                    >
                      Trip Tracking
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recommended Rides */}
          <div className="pt-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-600" />
              Suggested Journeys
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedRides.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Notifications & Safety Shortcut */}
        <div className="space-y-6">
          {/* Recent In-App Alerts */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                Recent Notifications
              </h3>
              <Link
                to="/notifications"
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                View All
              </Link>
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No new notifications</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl text-xs space-y-1 ${
                      n.isRead ? 'bg-slate-50' : 'bg-indigo-50/60 border border-indigo-100'
                    }`}
                  >
                    <p className="font-bold text-slate-800">{n.title}</p>
                    <p className="text-slate-600 leading-snug">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Safety Center Card */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
              <PhoneCall className="w-4 h-4 text-red-600" />
              24/7 Emergency Dispatch
            </div>
            <p className="text-xs text-red-700 leading-relaxed">
              In any urgent situation, tap the SOS button to alert national emergency responders (112) with your current live GPS coordinates.
            </p>
            <Link
              to="/safety"
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs text-center block shadow-sm transition-colors"
            >
              Open Safety Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
