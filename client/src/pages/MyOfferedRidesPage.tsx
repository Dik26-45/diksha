import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Car, Calendar, Users, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Ride } from '../types';
import { api } from '../services/api';

export const MyOfferedRidesPage: React.FC = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadRides = () => {
    setLoading(true);
    api
      .getMyOfferedRides()
      .then((res) => {
        setRides(res.rides);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching offered rides:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadRides();
  }, []);

  const handleCancelRide = async (rideId: string) => {
    if (!confirm('Are you sure you want to cancel this ride? All passenger bookings will be cancelled and refunded.')) {
      return;
    }
    setCancellingId(rideId);
    try {
      await api.cancelRide(rideId);
      loadRides();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel ride.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <PlusCircle className="w-7 h-7 text-indigo-600" />
            My Offered Journeys
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your published commutes and passenger reservations.
          </p>
        </div>
        <Link
          to="/offer-ride"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs"
        >
          Offer New Ride
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : rides.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Car className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">You haven’t posted any rides yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Have empty seats in your car? Share your daily route and split fuel costs.
          </p>
          <Link
            to="/offer-ride"
            className="inline-block mt-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Offer Your First Ride
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {rides.map((ride) => {
            const isScheduled = ride.status === 'SCHEDULED';
            const departureDate = new Date(ride.departureTime).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
            const departureTime = new Date(ride.departureTime).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            });
            const seatsBooked = ride.totalSeats - ride.availableSeats;

            return (
              <div
                key={ride.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-indigo-200 transition-all space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        isScheduled
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {ride.status}
                    </span>
                    {ride.isWomenOnly && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-pink-500" />
                        Women-Only Commute
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900">
                      ₹{ride.pricePerSeat} / seat
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-800">
                      Pickup: <span className="font-normal text-slate-600">{ride.originAddress}</span>
                    </p>
                    <p className="font-semibold text-slate-800">
                      Drop-off: <span className="font-normal text-slate-600">{ride.destAddress}</span>
                    </p>
                    <p className="text-slate-500 pt-1">
                      Departure: <b className="text-slate-800">{departureDate}</b> at <b className="text-slate-800">{departureTime}</b>
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                    <p className="text-slate-600">
                      Seat Occupancy: <b className="text-slate-900">{seatsBooked} Booked</b> ({ride.availableSeats} Remaining)
                    </p>
                    {ride.vehicle && (
                      <p className="text-slate-500">
                        Vehicle: {ride.vehicle.make} {ride.vehicle.model} ({ride.vehicle.licensePlate})
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <Link
                    to={`/rides/${ride.id}`}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    View Public Details
                  </Link>

                  {isScheduled && (
                    <button
                      type="button"
                      onClick={() => handleCancelRide(ride.id)}
                      disabled={cancellingId === ride.id}
                      className="text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {cancellingId === ride.id ? 'Cancelling...' : 'Cancel Ride'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
