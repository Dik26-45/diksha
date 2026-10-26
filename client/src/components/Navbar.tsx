import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Lock,
  ChevronDown,
  Car,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      api
        .getMyNotifications()
        .then((res) => setUnreadCount(res.unreadCount))
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-900 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-violet-900 bg-clip-text text-transparent">
                  SAFAR <span className="text-violet-600 font-extrabold">AI</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide hidden sm:block">
                  Your Route. Your People. Your Journey.
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link
                to="/rides"
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive('/rides')
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                <Compass className="w-4 h-4" />
                Find a Ride
              </Link>

              <Link
                to="/offer-ride"
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive('/offer-ride')
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                Offer a Ride
              </Link>

              <Link
                to="/rides?womenOnly=true"
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  location.search.includes('womenOnly=true')
                    ? 'bg-pink-50 text-pink-700 font-semibold'
                    : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50/50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-pink-500" />
                Women-Only
              </Link>

              <Link
                to="/track/SFR-2026-8812"
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  location.pathname.startsWith('/track')
                    ? 'bg-rose-50 text-rose-700 font-semibold'
                    : 'text-rose-600 hover:text-rose-700 hover:bg-rose-50/50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                Relative Tracking
              </Link>

              <Link
                to="/ai-matches"
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive('/ai-matches')
                    ? 'bg-violet-50 text-violet-700 font-semibold'
                    : 'text-slate-600 hover:text-violet-600 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-violet-500" />
                AI Matching
              </Link>

              <Link
                to="/safety"
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive('/safety')
                    ? 'bg-red-50 text-red-700 font-semibold'
                    : 'text-slate-600 hover:text-red-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Safety Center
              </Link>
            </div>
          </div>

          {/* Right Action Menu */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* Notification Bell */}
                <Link
                  to="/notifications"
                  className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* Admin Quick Badge if role is ADMIN */}
                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Admin Panel
                  </Link>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-hidden"
                  >
                    <img
                      src={
                        user.avatarUrl ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                      }
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-300"
                    />
                    <div className="text-left hidden lg:block pr-1">
                      <p className="text-xs font-semibold text-slate-800 leading-tight">
                        {user.fullName}
                      </p>
                      <span className="text-[10px] text-slate-500 capitalize">
                        {user.role.toLowerCase().replace('_', ' ')}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          {user.isVerified ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
                              ✓ Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">
                              {user.verificationStatus}
                            </span>
                          )}
                        </div>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-500" />
                        Dashboard
                      </Link>

                      <Link
                        to="/my-bookings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Car className="w-4 h-4 text-slate-500" />
                        My Bookings
                      </Link>

                      <Link
                        to="/my-offered-rides"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <PlusCircle className="w-4 h-4 text-slate-500" />
                        My Offered Rides
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        Profile & Verification
                      </Link>

                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 font-medium"
                        >
                          <Lock className="w-4 h-4 text-purple-600" />
                          Admin Command Center
                        </Link>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                >
                  Join SAFAR AI
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/rides"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Find a Ride
          </Link>
          <Link
            to="/offer-ride"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Offer a Ride
          </Link>
          <Link
            to="/rides?womenOnly=true"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-pink-600 hover:bg-pink-50"
          >
            Women-Only Rides
          </Link>
          <Link
            to="/ai-matches"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-violet-600 hover:bg-violet-50"
          >
            AI Matching
          </Link>
          <Link
            to="/safety"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
          >
            Safety Center (112 SOS)
          </Link>

          {user ? (
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-900 bg-slate-50"
              >
                Dashboard
              </Link>
              <Link
                to="/my-bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700"
              >
                My Bookings
              </Link>
              <Link
                to="/my-offered-rides"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700"
              >
                My Offered Rides
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700"
              >
                Profile & Verification
              </Link>
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-purple-700"
                >
                  Admin Command Center
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-600"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-lg bg-indigo-600 text-white font-medium shadow-xs"
              >
                Join SAFAR AI
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
