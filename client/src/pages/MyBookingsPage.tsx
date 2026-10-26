import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Navigation,
} from 'lucide-react';
import { Booking } from '../types';
import { api } from '../services/api';

export const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalId, setCancelModalId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('Change of schedule');
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadBookings = () => {
    setLoading(true);
    api
      .getMyBookings()
      .then((res) => {
        setBookings(res.bookings);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching bookings:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async () => {
    if (!cancelModalId) return;
    setIsCancelling(true);
    try {
      await api.cancelBooking(cancelModalId, cancelReason);
      setActionMessage('Booking successfully cancelled. Simulated refund processed.');
      setCancelModalId(null);
      loadBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Car className="w-7 h-7 text-indigo-600" />
            My Bookings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review your confirmed ride reservations and live trip tracking.
          </p>
        </div>
        <Link
          to="/rides"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs"
        >
          Book Another Ride
        </Link>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-emerald-900 font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Car className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">You have no reservations yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Book a seat on an upcoming journey to see your ticket and trip tracking here.
          </p>
          <Link
            to="/rides"
            className="inline-block mt-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Search Available Rides
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const isConfirmed = booking.status === 'CONFIRMED';
            const rideDate = booking.ride?.departureTime
              ? new Date(booking.ride.departureTime).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })
              : 'Upcoming';

            const rideTime = booking.ride?.departureTime
              ? new Date(booking.ride.departureTime).toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';

            return (
              <div
                key={booking.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-indigo-200 transition-all space-y-4"
              >
                {/* Top Row: Ref & Status */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                      {booking.bookingReference}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isConfirmed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {booking.paymentStatus}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400">Total: </span>
                    <span className="text-sm font-bold text-slate-900">
                      ₹{booking.totalPrice} ({booking.seatCount} Seat{booking.seatCount > 1 ? 's' : ''})
                    </span>
                  </div>
                </div>

                {/* Ride Route & Driver Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-xs">
                    <p className="font-semibold text-slate-800">
                      From: <span className="font-normal text-slate-600">{booking.ride?.originAddress}</span>
                    </p>
                    <p className="font-semibold text-slate-800">
                      To: <span className="font-normal text-slate-600">{booking.ride?.destAddress}</span>
                    </p>
                    <div className="flex items-center gap-2 pt-0.5 text-slate-500">
                      <span>Departure: <b className="text-slate-800">{rideDate}</b> at <b className="text-slate-800">{rideTime}</b></span>
                      {booking.ride?.highwayCorridor && (
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                          {booking.ride.highwayCorridor}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p className="text-slate-500">
                      Host Driver:{' '}
                      <span className="font-bold text-slate-800">
                        {booking.ride?.provider?.fullName || 'Verified Driver'}
                      </span>
                    </p>
                    {booking.ride?.vehicle && (
                      <p className="text-slate-500">
                        Vehicle: {booking.ride.vehicle.make} {booking.ride.vehicle.model} ({booking.ride.vehicle.licensePlate})
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {booking.ride?.isWomenOnly && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-pink-700 bg-pink-100/80 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3 text-pink-600" /> Women-Only Ride
                        </span>
                      )}
                      {(booking.emergencyContactName || booking.shareLiveLocationWithRelative) && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          ✓ Relative: {booking.emergencyContactName || 'Family'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/trips/${booking.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      <Navigation className="w-4 h-4" /> Live Passenger Telemetry
                    </Link>

                    <Link
                      to={`/track/${booking.bookingReference}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs font-medium text-pink-700 hover:text-pink-900 bg-pink-50 hover:bg-pink-100 px-2.5 py-1 rounded-lg border border-pink-200 transition-colors"
                    >
                      Relative Live Tracking
                    </Link>
                  </div>

                  {isConfirmed && (
                    <button
                      type="button"
                      onClick={() => setCancelModalId(booking.id)}
                      className="text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Cancel Reservation
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Cancel Reservation?
            </h3>
            <p className="text-xs text-slate-600">
              Cancelling will release your reserved seat(s) back to the ride. A simulated full refund will be credited.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-hidden"
              >
                <option value="Change of schedule">Change of schedule</option>
                <option value="Found alternative transport">Found alternative transport</option>
                <option value="Personal emergency">Personal emergency</option>
                <option value="Booked by mistake">Booked by mistake</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalId(null)}
                className="flex-1 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs"
              >
                {isCancelling ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
