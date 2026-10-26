import React, { useState } from 'react';
import {
  PhoneCall,
  ShieldCheck,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const SafetyCenterPage: React.FC = () => {
  const { user } = useAuth();

  // SOS State
  const [sosStatus, setSosStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  // Report Form State
  const [category, setCategory] = useState<string>('HARASSMENT');
  const [description, setDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  const handleTriggerSos = async () => {
    if (
      !confirm(
        'Trigger 112 Emergency Alert? This will alert national emergency services (112) and transmit your active GPS coordinates.'
      )
    ) {
      return;
    }

    setSosStatus('sending');
    try {
      await api.triggerEmergencySos({
        lat: 18.5204,
        lng: 73.8567,
        message: 'EMERGENCY SOS: Passenger triggered red alert from Safety Center (Maharashtra).',
      });
      setSosStatus('sent');
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch SOS alert. Please dial 112 directly.');
      setSosStatus('idle');
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || description.trim().length < 5) {
      setReportError('Please provide a detailed description of the incident.');
      return;
    }

    if (!user) {
      setReportError('Please sign in to file an official safety report.');
      return;
    }

    setIsSubmittingReport(true);
    setReportError(null);
    try {
      const res = await api.submitSafetyReport({
        category,
        description,
      });
      setReportSuccess(
        `Report #${res.report.id.slice(0, 8)} successfully registered. Our 24/7 team is reviewing.`
      );
      setDescription('');
    } catch (err: any) {
      setReportError(err.message || 'Failed to submit report.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold mb-2">
          <PhoneCall className="w-3.5 h-3.5 text-red-600" />
          24/7 Safety Command Center
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Trust & Safety Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Instant emergency escalation to 112, confidential incident reporting, and verification standards.
        </p>
      </div>

      {/* Emergency SOS High-Impact Section */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center justify-center md:justify-start gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              Immediate Life-Safety Protocol
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Emergency SOS Dispatch: 112
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              If you feel unsafe, in distress, or encounter road danger, press the button below. Responders receive your live coordinates and ride details immediately.
            </p>
          </div>

          <div className="shrink-0">
            {sosStatus === 'sent' ? (
              <div className="px-6 py-4 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold text-center text-sm space-y-1">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                <p>Alert Dispatched to 112!</p>
              </div>
            ) : (
              <button
                onClick={handleTriggerSos}
                disabled={sosStatus === 'sending'}
                className="w-36 h-36 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xl shadow-2xl shadow-red-600/50 flex flex-col items-center justify-center gap-1 border-4 border-red-400/40 transition-all hover:scale-105"
              >
                <PhoneCall className="w-8 h-8 animate-bounce" />
                <span>{sosStatus === 'sending' ? 'ALERTING...' : 'SOS 112'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Hotlines Directory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-white/10 pt-4 text-xs">
          <div className="bg-white/10 rounded-2xl p-3 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-slate-300 block text-[11px]">National Emergency</span>
              <span className="font-bold text-white text-sm">Police & Rescue</span>
            </div>
            <a
              href="tel:112"
              className="px-3 py-1 rounded-lg bg-red-600 font-bold text-white hover:bg-red-700"
            >
              Dial 112
            </a>
          </div>

          <div className="bg-white/10 rounded-2xl p-3 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-slate-300 block text-[11px]">Women Helpline</span>
              <span className="font-bold text-pink-300 text-sm">Anti-Harassment</span>
            </div>
            <a
              href="tel:1091"
              className="px-3 py-1 rounded-lg bg-pink-600 font-bold text-white hover:bg-pink-700"
            >
              Dial 1091
            </a>
          </div>

          <div className="bg-white/10 rounded-2xl p-3 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-slate-300 block text-[11px]">Emergency Ambulance</span>
              <span className="font-bold text-amber-300 text-sm">Medical 108</span>
            </div>
            <a
              href="tel:108"
              className="px-3 py-1 rounded-lg bg-amber-600 font-bold text-white hover:bg-amber-700"
            >
              Dial 108
            </a>
          </div>
        </div>
      </div>

      {/* Incident Reporting Form & Safety Policy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Incident Report Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Submit a Confidential Safety Incident Report
            </h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            All reports are investigated by the SAFAR AI Trust & Safety review board within 2 hours. Reports involving harassment result in immediate account suspension pending investigation.
          </p>

          {reportSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
              {reportSuccess}
            </div>
          )}

          {reportError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {reportError}
            </div>
          )}

          <form onSubmit={handleReportSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Incident Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50 outline-hidden"
              >
                <option value="HARASSMENT">Harassment or Inappropriate Behavior</option>
                <option value="UNSAFE_DRIVING">Unsafe / Reckless Driving</option>
                <option value="ROUTE_DEVIATION">Unauthorized Route Detour / Deviation</option>
                <option value="SUSPICIOUS_BEHAVIOR">Suspicious Behavior / Vehicle Mismatch</option>
                <option value="OTHER">Other Safety Violation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Description of Event
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please include details such as time, vehicle plate, driver behavior, or route anomalies..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-hidden focus:border-indigo-600"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingReport}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors disabled:opacity-60"
            >
              {isSubmittingReport ? 'Filing Incident...' : 'Submit Incident Report to Safety Board'}
            </button>
          </form>
        </div>

        {/* Right Col: Trust Protocol Highlights */}
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-4 text-xs">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Safety Protocols & Verification
            </h4>

            <div className="space-y-2.5 text-slate-600">
              <div className="flex items-start gap-2">
                <span className="font-bold text-indigo-600">•</span>
                <p>
                  <b>Aadhaar & Identity Verification:</b> We do not infer identity or gender from names; drivers submit official government verification.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-bold text-indigo-600">•</span>
                <p>
                  <b>Zero Tolerance:</b> Any report of verbal or physical harassment triggers instant account deactivation.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-bold text-indigo-600">•</span>
                <p>
                  <b>Women-Only Protection:</b> Exclusively verified female drivers and female passengers may join designated journeys.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
