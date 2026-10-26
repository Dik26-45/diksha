import React, { useState } from 'react';
import {
  User as UserIcon,
  ShieldCheck,
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle,
  Settings,
  Phone,
  Mail,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  // Verification state
  const [docUrl, setDocUrl] = useState('https://docs.safar.ai/verifications/aadhaar-sample.pdf');
  const [isUploading, setIsUploading] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState<string | null>(null);

  if (!user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMsg(null);
    try {
      await api.updateProfile({ phone, bio });
      await refreshUser();
      setUpdateMsg('Profile details updated successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRequestVerification = async () => {
    setIsUploading(true);
    setVerificationSuccess(null);
    try {
      await api.requestVerification(docUrl);
      await refreshUser();
      setVerificationSuccess(
        'Government ID verification submitted! Our Trust & Safety team is reviewing your document.'
      );
    } catch (err: any) {
      alert(err.message || 'Failed to submit verification document.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <UserIcon className="w-7 h-7 text-indigo-600" />
          Profile & Identity Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal details, government verification credentials, and carpool preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Status */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs text-center space-y-4">
          <img
            src={
              user.avatarUrl ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'
            }
            alt={user.fullName}
            className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-slate-100 shadow-sm"
          />

          <div>
            <h3 className="font-bold text-slate-900 text-lg">{user.fullName}</h3>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span>Account Role:</span>
              <span className="font-bold text-indigo-600 uppercase">
                {user.role.replace('_', ' ')}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>Gender:</span>
              <span className="font-bold text-slate-800 capitalize">
                {user.gender.toLowerCase().replace('_', ' ')}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>Verification Status:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  user.isVerified
                    ? 'bg-emerald-100 text-emerald-800'
                    : user.verificationStatus === 'PENDING'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {user.verificationStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Verification Upload & Profile Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Identity Verification Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Government Identity (Aadhaar / Smart ID) Verification
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verified members enjoy enhanced trust, higher passenger acceptance, and access to verified Women-Only journeys. We verify your legal identification document against platform records.
            </p>

            {verificationSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
                {verificationSuccess}
              </div>
            )}

            {user.isVerified ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-900">
                <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold block text-sm">You are Officially Verified!</span>
                  Your identity document has been audited and approved by the Safety Team.
                </div>
              </div>
            ) : user.verificationStatus === 'PENDING' ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-900">
                <Clock className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold block text-sm">Verification Under Review</span>
                  Your document submission is currently being evaluated in the Admin Command Center.
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Document Verification URL / Aadhaar Upload Simulation
                  </label>
                  <input
                    type="text"
                    value={docUrl}
                    onChange={(e) => setDocUrl(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRequestVerification}
                  disabled={isUploading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  {isUploading ? 'Submitting...' : 'Submit Document for Verification'}
                </button>
              </div>
            )}
          </div>

          {/* Edit Profile Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-600" />
              Edit Personal Information
            </h3>

            {updateMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
                {updateMsg}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Contact Number
                </label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Commuter Bio & Habits
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio about your daily commute..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-hidden focus:border-indigo-600"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                {isUpdating ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
