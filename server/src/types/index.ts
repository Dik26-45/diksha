export type Role = 'PASSENGER' | 'RIDE_PROVIDER' | 'ADMIN';
export type Gender = 'FEMALE' | 'MALE' | 'NON_BINARY' | 'PREFER_NOT_TO_SAY';
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type RideStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type PaymentStatus = 'SIMULATED_PAID' | 'PENDING' | 'REFUNDED';
export type SafetyReportCategory = 'HARASSMENT' | 'UNSAFE_DRIVING' | 'ROUTE_DEVIATION' | 'SUSPICIOUS_BEHAVIOR' | 'OTHER';
export type ReportStatus = 'OPEN' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'DISMISSED';
export type EmergencyStatus = 'ACTIVE' | 'RESOLVED';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string | null;
  role: Role;
  gender: Gender;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  verificationDocUrl?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  ratingAvg: number;
  totalRatingsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  capacity: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RouteWaypoint {
  name: string;
  lat: number;
  lng: number;
}

export interface Ride {
  id: string;
  providerId: string;
  vehicleId?: string | null;
  originAddress: string;
  originLat: number;
  originLng: number;
  destAddress: string;
  destLat: number;
  destLng: number;
  departureTime: string;
  estimatedArrivalTime?: string | null;
  totalSeats: number;
  availableSeats: number;
  pricePerSeat: number;
  status: RideStatus;
  isWomenOnly: boolean;
  notes?: string | null;
  distanceKm?: number;
  durationMins?: number;
  highwayCorridor?: string;
  waypoints?: RouteWaypoint[];
  createdAt: string;
  updatedAt: string;

  // Joined fields
  provider?: Partial<User>;
  vehicle?: Vehicle | null;
  bookings?: Booking[];
}

export interface Booking {
  id: string;
  rideId: string;
  passengerId: string;
  seatCount: number;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  bookingReference: string;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
  shareLiveLocationWithRelative?: boolean;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  updatedAt: string;

  // Joined fields
  ride?: Ride;
  passenger?: Partial<User>;
}

export interface UserPreference {
  id: string;
  userId: string;
  maxWalkDistanceKm: number;
  musicPreference: string;
  smokingAllowed: boolean;
  petsAllowed: boolean;
  quietRide: boolean;
  womenOnlyPreferred: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RideMatchScore {
  rideId: string;
  overallScore: number; // 0 - 100
  pickupProximityScore: number; // 30%
  destProximityScore: number; // 30%
  timeCompatibilityScore: number; // 20%
  routeCompatibilityScore: number; // 15%
  preferenceScore: number; // 5%
  explanation: string;
  ride: Ride;
}

export interface SafetyReport {
  id: string;
  reporterId: string;
  rideId?: string | null;
  category: SafetyReportCategory;
  description: string;
  status: ReportStatus;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;

  reporter?: Partial<User>;
  ride?: Partial<Ride> | null;
}

export interface EmergencyEvent {
  id: string;
  userId: string;
  rideId?: string | null;
  lat: number;
  lng: number;
  message: string;
  emergencyNumber: string;
  status: EmergencyStatus;
  createdAt: string;
  updatedAt: string;

  user?: Partial<User>;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: Role;
  gender: Gender;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
}
