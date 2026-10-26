import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  Users,
  Car,
  FileText,
  PhoneCall,
  Check,
  X,
  AlertTriangle,
  RotateCcw,
  Clock,
  Eye,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { User, Ride, Booking, SafetyReport, EmergencyEvent, VerificationStatus, ReportStatus } from '../types';
import { api } from '../services/api';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'verifications' | 'safety' | 'users' | 'rides' | 'emergencies'>('verifications');

  const [metrics, setMetrics] = useState<any>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [ridesList, setRidesList] = useState<Ride[]>([]);
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [safetyReports, setSafetyReports] = useState<SafetyReport[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyEvent[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [overview, usersRes, ridesRes, bookingsRes, safetyRes, emgRes] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminUsers(),
        api.getAdminRides(),
        api.getAdminBookings(),
        api.getAdminSafetyReports(),
        api.getAdminEmergencies(),
      ]);

      setMetrics(overview.metrics);
      setUsersList(usersRes.users);
      setRidesList(ridesRes.rides);
      setBookingsList(bookingsRes.bookings);
      setSafetyReports(safetyRes.reports);
      setEmergencies(emgRes.emergencies);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadAdminData();
    }
  }, [user]);

  // Authorization Guard
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">403 Forbidden: Admin Access Required</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          You do not have administrative privileges to access the Trust & Safety Command Center. Please sign in with an Administrator account (e.g. <code>admin@safar.ai</code>).
        </p>
      </div>
    );
  }

  const handleVerifyUser = async (userId: string, status: VerificationStatus) => {
    try {
      await api.verifyUser(userId, status, status === 'VERIFIED');
      setActionSuccess(`User verification updated to ${status}.`);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update verification status.');
    }
  };

  const handleUpdateReport = async (reportId: string, status: ReportStatus) => {
    try {
      await api.updateAdminSafetyReport(reportId, status, 'Resolved via Safety Protocol #409');
      setActionSuccess(`Incident report status updated to ${status}.`);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update report status.');
    }
  };

  const pendingUsers = usersList.filter((u) => u.verificationStatus === 'PENDING');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-2">
            <Lock className="w-3.5 h-3.5" />
            Superadmin Operations Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            SAFAR AI Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Audit national ID verifications, incident reports, ride listings, and emergency events.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-indigo-600" /> Refresh Data
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-950 font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Users
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {metrics.totalUsers}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold">
              {metrics.verifiedUsers} Verified Identity
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Pending ID & Aadhaar Audits
            </span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">
              {metrics.pendingVerifications}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Awaiting review</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Scheduled Rides
            </span>
            <span className="text-2xl font-black text-indigo-600 mt-1 block">
              {metrics.scheduledRides}
            </span>
            <span className="text-[11px] text-pink-600 font-semibold">
              {metrics.womenOnlyRides} Women-Only Commutes
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Open Safety Reports
            </span>
            <span
              className={`text-2xl font-black mt-1 block ${
                metrics.openSafetyReports > 0 ? 'text-red-600' : 'text-slate-900'
              }`}
            >
              {metrics.openSafetyReports}
            </span>
            <span className="text-[11px] text-red-600 font-semibold">
              {metrics.activeEmergencies} Active 112 SOS
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs sm:text-sm font-semibold gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'verifications'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Verification Queue ({pendingUsers.length})
        </button>

        <button
          onClick={() => setActiveTab('safety')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'safety'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Safety Reports ({safetyReports.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          User Management ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('rides')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'rides'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Car className="w-4 h-4" />
          All Rides ({ridesList.length})
        </button>

        <button
          onClick={() => setActiveTab('emergencies')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
            activeTab === 'emergencies'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          112 SOS Events ({emergencies.length})
        </button>
      </div>

      {/* Tab 1: Verification Queue */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              Pending Govt ID & Aadhaar Verification Submissions
            </h3>
            <span className="text-xs text-slate-500">{pendingUsers.length} user(s) pending</span>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500">
              No pending verification requests in queue.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingUsers.map((u) => (
                <div
                  key={u.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        u.avatarUrl ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                      }
                      alt={u.fullName}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{u.fullName}</h4>
                      <p className="text-xs text-slate-500">{u.email}</p>
                      <span className="text-[10px] text-slate-500 capitalize">
                        Gender: {u.gender} • Role: {u.role}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                    <p className="font-medium text-slate-700">Submitted Document:</p>
                    <a
                      href={u.verificationDocUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 font-mono text-[11px] underline truncate block"
                    >
                      {u.verificationDocUrl || 'https://docs.safar.ai/verifications/user-id.pdf'}
                    </a>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleVerifyUser(u.id, 'VERIFIED')}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve Verification
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerifyUser(u.id, 'REJECTED')}
                      className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-xs"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Safety Reports */}
      {activeTab === 'safety' && (
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-900">
            Confidential Incident Reports Review
          </h3>

          <div className="space-y-3">
            {safetyReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-800">
                      #{report.id.slice(0, 8)}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800">
                      {report.category}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        report.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400">
                    {new Date(report.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl leading-relaxed">
                  {report.description}
                </p>

                {report.adminNotes && (
                  <p className="text-[11px] text-indigo-700 italic">
                    <b>Admin Notes:</b> {report.adminNotes}
                  </p>
                )}

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  {report.status !== 'RESOLVED' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateReport(report.id, 'RESOLVED')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Mark Resolved
                    </button>
                  )}
                  {report.status === 'OPEN' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateReport(report.id, 'UNDER_INVESTIGATION')}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs"
                    >
                      Move to Under Investigation
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: User Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Gender</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={
                          u.avatarUrl ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                        }
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{u.fullName}</span>
                        <span className="text-[11px] text-slate-400">{u.email}</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">{u.role}</td>
                    <td className="p-4 capitalize">{u.gender.toLowerCase()}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.isVerified
                            ? 'bg-emerald-100 text-emerald-800'
                            : u.verificationStatus === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {u.verificationStatus}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-amber-500">★ {u.ratingAvg?.toFixed(1) || '5.0'}</td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleVerifyUser(u.id, u.isVerified ? 'UNVERIFIED' : 'VERIFIED')
                        }
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        {u.isVerified ? 'Revoke Verify' : 'Grant Verify'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: All Rides */}
      {activeTab === 'rides' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ridesList.map((ride) => (
              <div
                key={ride.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2 text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 truncate max-w-xs">
                    {ride.originAddress} → {ride.destAddress}
                  </span>
                  <span className="font-bold text-indigo-600">₹{ride.pricePerSeat}</span>
                </div>
                <p className="text-slate-500">
                  Host Driver: <b className="text-slate-800">{ride.provider?.fullName}</b>
                </p>
                <p className="text-slate-500">
                  Seats: {ride.availableSeats} available of {ride.totalSeats}
                </p>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    ride.status === 'SCHEDULED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {ride.status} {ride.isWomenOnly && '• Women-Only'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Emergencies */}
      {activeTab === 'emergencies' && (
        <div className="space-y-3">
          {emergencies.map((emg) => (
            <div
              key={emg.id}
              className="bg-white rounded-3xl p-5 border border-red-200 shadow-xs flex items-center justify-between text-xs"
            >
              <div className="space-y-1">
                <span className="font-bold text-red-700 text-sm flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4" /> 112 Emergency Dispatch Event
                </span>
                <p className="text-slate-600">{emg.message}</p>
                <p className="text-slate-400 text-[11px]">
                  Coordinates: Lat {emg.lat}, Lng {emg.lng} • Dispatched:{' '}
                  {new Date(emg.createdAt).toLocaleString()}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                {emg.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
