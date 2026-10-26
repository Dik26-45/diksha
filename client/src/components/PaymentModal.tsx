import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  CreditCard,
  Wallet,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Plus,
  Minus,
  ArrowRight,
  Share2,
  Phone,
} from 'lucide-react';
import { Ride, Booking } from '../types';
import { api } from '../services/api';

interface PaymentModalProps {
  ride: Ride;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (booking: Booking) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  ride,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const [seatCount, setSeatCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'CARD' | 'UPI'>('WALLET');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Relative Location Sharing state
  const [emergencyContactName, setEmergencyContactName] = useState('Sunita Khan (Mother)');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('+91 98200 99881');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('Mother');
  const [shareWithRelative, setShareWithRelative] = useState<boolean>(true);

  if (!isOpen) return null;

  const safetyFee = 15; // Platform safety dispatch fee
  const subtotal = ride.pricePerSeat * seatCount;
  const gstTax = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = subtotal + safetyFee + gstTax;

  const handleSeatChange = (delta: number) => {
    const next = seatCount + delta;
    if (next >= 1 && next <= ride.availableSeats) {
      setSeatCount(next);
      setError(null);
    }
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await api.createBooking({
        rideId: ride.id,
        seatCount,
        paymentMethod: `SIMULATED_${paymentMethod}`,
        emergencyContactName: shareWithRelative ? emergencyContactName : undefined,
        emergencyContactPhone: shareWithRelative ? emergencyContactPhone : undefined,
        emergencyContactRelation: shareWithRelative ? emergencyContactRelation : undefined,
        shareLiveLocationWithRelative: shareWithRelative,
      });
      setConfirmedBooking(res.booking);
      onSuccess(res.booking);
    } catch (err: any) {
      setError(err.message || 'Payment simulation failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const trackingUrl = confirmedBooking
    ? `${window.location.origin}/track/${confirmedBooking.bookingReference}`
    : '';

  const whatsappMessage = confirmedBooking
    ? encodeURIComponent(
        `🚨 SAFAR AI Live Trip Tracking: I am traveling via verified carpool with ${ride.provider?.fullName || 'Host'} (${ride.vehicle?.make || 'Car'} ${ride.vehicle?.model || ''} - ${ride.vehicle?.licensePlate || ''}).\nRoute: ${ride.originAddress} ➜ ${ride.destAddress}.\nTrack my live GPS location here: ${trackingUrl}`
      )
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Confirm & Simulated Payment</h3>
              <p className="text-xs text-slate-500">Secure, zero-risk cashless reservation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-5">
          {confirmedBooking ? (
            /* Confirmation Success View */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900">Seat(s) Confirmed!</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Your journey with {ride.provider?.fullName} is officially scheduled.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Booking Reference:</span>
                  <span className="font-mono font-bold text-indigo-700 text-sm">
                    {confirmedBooking.bookingReference}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Total Simulated Paid:</span>
                  <span className="font-bold text-slate-800">₹{confirmedBooking.totalPrice}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Seats Booked:</span>
                  <span className="font-bold text-slate-800">{confirmedBooking.seatCount} Seat(s)</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Vehicle Assigned:</span>
                  <span className="font-semibold text-slate-800">
                    {ride.vehicle?.make} {ride.vehicle?.model} ({ride.vehicle?.licensePlate})
                  </span>
                </div>
              </div>

              {/* Relative Sharing Alert confirmation */}
              {confirmedBooking.shareLiveLocationWithRelative && confirmedBooking.emergencyContactName && (
                <div className="p-4 bg-pink-50 border border-pink-200 rounded-2xl text-left space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-pink-900 font-bold">
                    <ShieldCheck className="w-4 h-4 text-pink-600" />
                    <span>Relative Live Tracking Dispatched</span>
                  </div>
                  <p className="text-pink-800 text-[11px] leading-relaxed">
                    Live GPS tracking coordinates and vehicle details were transmitted to{' '}
                    <b>{confirmedBooking.emergencyContactName}</b> ({confirmedBooking.emergencyContactPhone}).
                  </p>
                  <div className="pt-1 flex gap-2">
                    <a
                      href={`https://api.whatsapp.com/send?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] inline-flex items-center gap-1 shadow-xs"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Send via WhatsApp
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(trackingUrl);
                        alert('Tracking Link Copied: ' + trackingUrl);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-pink-300 bg-white hover:bg-pink-100 text-pink-800 font-semibold text-[11px]"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/track/${confirmedBooking.bookingReference}`);
                  }}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  Open Live Route Telemetry
                </button>
                <button
                  onClick={() => {
                    onClose();
                    navigate('/my-bookings');
                  }}
                  className="py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  My Bookings
                </button>
              </div>
            </div>
          ) : (
            /* Payment Form View */
            <div className="space-y-4">
              {/* Warning / Disclaimer */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase tracking-wider block text-[10px]">
                    Simulated Payment Screen
                  </span>
                  Test checkout only. No real money or bank accounts will be charged.
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                  {error}
                </div>
              )}

              {/* Ride Mini Summary */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 text-xs space-y-1.5">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span className="truncate max-w-[45%]">{ride.originAddress}</span>
                  <ArrowRight className="w-3.5 h-3.5 mx-1 shrink-0 text-slate-400 self-center" />
                  <span className="truncate max-w-[45%] text-right">{ride.destAddress}</span>
                </div>
                <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200/60">
                  <span>Host: <b className="text-slate-700">{ride.provider?.fullName}</b></span>
                  <span>Vehicle: <b className="text-indigo-600">{ride.vehicle?.make} {ride.vehicle?.model}</b></span>
                </div>
              </div>

              {/* Seat Count Selector */}
              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-2xl">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Number of Seats</p>
                  <p className="text-[11px] text-slate-500">{ride.availableSeats} available</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSeatChange(-1)}
                    disabled={seatCount <= 1}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center font-bold text-slate-700"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-base w-4 text-center text-slate-900">
                    {seatCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSeatChange(1)}
                    disabled={seatCount >= ride.availableSeats}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center font-bold text-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Relative / Guardian Emergency Location Sharing Section */}
              <div className="p-4 bg-gradient-to-r from-pink-50 to-indigo-50/40 border border-pink-200 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-pink-900 flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-pink-600" />
                    Relative / Guardian Safe-Tracking
                  </span>
                  <span className="text-[10px] font-bold text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {ride.isWomenOnly ? 'Women-Only Safe Protocol' : 'Safety Recommended'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Provide your relative or emergency contact to automatically send them a tamper-proof live GPS tracking link with vehicle details and panic escalation.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Relative / Guardian Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sunita Khan (Mother)"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 outline-hidden focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Phone Number (WhatsApp / SMS)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +91 98200 99881"
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 outline-hidden focus:border-pink-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-semibold text-slate-600">Relationship:</label>
                    <select
                      value={emergencyContactRelation}
                      onChange={(e) => setEmergencyContactRelation(e.target.value)}
                      className="text-xs p-1 rounded-lg border border-slate-300 bg-white text-slate-700"
                    >
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Sister">Sister</option>
                      <option value="Husband">Husband</option>
                      <option value="Brother">Brother</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Friend">Trusted Friend</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-pink-900">
                    <input
                      type="checkbox"
                      checked={shareWithRelative}
                      onChange={(e) => setShareWithRelative(e.target.checked)}
                      className="w-3.5 h-3.5 text-pink-600 rounded border-slate-300"
                    />
                    <span>Auto-Send Live Link</span>
                  </label>
                </div>
              </div>

              {/* Simulated Payment Methods */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Simulated Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('WALLET')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      paymentMethod === 'WALLET'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Wallet className="w-4 h-4 mb-2 text-indigo-600" />
                    <span className="text-xs font-semibold block leading-tight">SAFAR Wallet</span>
                    <span className="text-[10px] text-slate-500">Credits: ₹5,000</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      paymentMethod === 'UPI'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 mb-2 text-indigo-600" />
                    <span className="text-xs font-semibold block leading-tight">UPI / QR</span>
                    <span className="text-[10px] text-slate-500">Instant Demo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      paymentMethod === 'CARD'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mb-2 text-indigo-600" />
                    <span className="text-xs font-semibold block leading-tight">Demo Card</span>
                    <span className="text-[10px] text-slate-500">•••• 4242</span>
                  </button>
                </div>
              </div>

              {/* Price Calculation Breakdown */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Base Fuel Split (₹{ride.pricePerSeat} × {seatCount} seat{seatCount > 1 ? 's' : ''})</span>
                  <span className="font-semibold text-slate-800">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Safe Ride Dispatch & 24/7 Operations</span>
                  <span className="font-semibold text-slate-800">₹{safetyFee}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>GST Taxes (5%)</span>
                  <span>₹{gstTax}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
                  <span>Total Payable</span>
                  <span className="text-indigo-600 font-extrabold text-base">₹{grandTotal}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  className="w-2/3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {isProcessing ? 'Processing Simulation...' : `Pay ₹${grandTotal} & Confirm`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
