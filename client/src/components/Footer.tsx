import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, PhoneCall, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Tagline */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                SAFAR <span className="text-violet-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-indigo-300 font-medium italic">
              “Your Route. Your People. Your Journey.”
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pakistan’s intelligent community ride-sharing platform. Connecting trusted commuters with explainable AI route matching and dedicated Women-Only safe spaces.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
              Explore Journeys
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/rides" className="hover:text-white transition-colors">
                  Find a Ride
                </Link>
              </li>
              <li>
                <Link to="/offer-ride" className="hover:text-white transition-colors">
                  Offer a Ride
                </Link>
              </li>
              <li>
                <Link to="/rides?womenOnly=true" className="hover:text-pink-400 text-pink-300/90 transition-colors flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
                  Women-Only Commutes
                </Link>
              </li>
              <li>
                <Link to="/ai-matches" className="hover:text-white transition-colors">
                  AI Matching Engine
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Trust */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
              Trust & Safety
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/safety" className="hover:text-white transition-colors">
                  Safety Center & 112 SOS
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  Aadhaar & Identity Verification
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Zero Tolerance Harassment Policy</span>
              </li>
              <li>
                <span className="text-slate-500">Simulated Safe Payments</span>
              </li>
            </ul>
          </div>

          {/* Emergency Hotlines */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-red-400" />
              Emergency Dispatch
            </h4>
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>National Emergency:</span>
                <span className="font-bold text-white bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                  112
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Women Helpline:</span>
                <span className="font-bold text-pink-400">1091</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Rescue Service:</span>
                <span className="font-bold text-amber-400">1122</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} SAFAR AI. All rights reserved.</p>
          <p className="flex items-center gap-1 text-[11px]">
            Engineered with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for safe, sustainable urban mobility.
          </p>
        </div>
      </div>
    </footer>
  );
};
