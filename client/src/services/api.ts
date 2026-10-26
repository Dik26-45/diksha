import {
  User,
  Ride,
  Booking,
  RideMatchScore,
  SafetyReport,
  EmergencyEvent,
  Notification,
  UserPreference,
  Role,
  VerificationStatus,
  ReportStatus,
} from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('safar_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || data.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Health & System
  getHealth: () =>
    request<{
      status: string;
      database: { connected: boolean; mode: string; notice: string };
    }>('/health'),

  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ token: string; user: User; isDemoMode: boolean }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (payload: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    role?: Role;
    gender?: string;
    bio?: string;
  }) =>
    request<{ token: string; user: User; isDemoMode: boolean }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () =>
    request<{
      user: User;
      preferences: UserPreference | null;
      vehicles: any[];
      isDemoMode: boolean;
    }>('/auth/me'),

  updateProfile: (updates: Partial<User>) =>
    request<{ message: string; user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  requestVerification: (docUrl?: string) =>
    request<{ message: string; user: User }>('/auth/request-verification', {
      method: 'POST',
      body: JSON.stringify({ docUrl }),
    }),

  // Rides
  listRides: (params: {
    origin?: string;
    destination?: string;
    isWomenOnly?: boolean;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    minSeats?: number;
    sortBy?: string;
    order?: string;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.origin) query.append('origin', params.origin);
    if (params.destination) query.append('destination', params.destination);
    if (params.isWomenOnly !== undefined) query.append('isWomenOnly', String(params.isWomenOnly));
    if (params.status) query.append('status', params.status);
    if (params.minPrice) query.append('minPrice', String(params.minPrice));
    if (params.maxPrice) query.append('maxPrice', String(params.maxPrice));
    if (params.minSeats) query.append('minSeats', String(params.minSeats));
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.order) query.append('order', params.order);

    return request<{ rides: Ride[]; totalCount: number; isDemoMode: boolean }>(
      `/rides?${query.toString()}`
    );
  },

  getRide: (id: string) =>
    request<{ ride: Ride; isDemoMode: boolean }>(`/rides/${id}`),

  createRide: (payload: Partial<Ride>) =>
    request<{ message: string; ride: Ride }>('/rides', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  cancelRide: (id: string) =>
    request<{ message: string; ride: Ride }>(`/rides/${id}/cancel`, {
      method: 'PUT',
    }),

  getMyOfferedRides: () =>
    request<{ rides: Ride[]; totalCount: number }>('/rides/provider/my-rides'),

  // Bookings
  createBooking: (payload: {
    rideId: string;
    seatCount: number;
    paymentMethod?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    shareLiveLocationWithRelative?: boolean;
  }) =>
    request<{ message: string; booking: Booking }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMyBookings: () =>
    request<{ bookings: Booking[]; totalCount: number }>('/bookings/my-bookings'),

  getBooking: (id: string) =>
    request<{ booking: Booking }>(`/bookings/${id}`),

  cancelBooking: (id: string, reason?: string) =>
    request<{ message: string; booking: Booking }>(`/bookings/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }),

  // AI Matching
  findMatches: (payload: {
    originLat: number;
    originLng: number;
    destLat: number;
    destLng: number;
    preferredDepartureTime?: string;
    onlyWomenOnly?: boolean;
    userPreference?: Partial<UserPreference>;
  }) =>
    request<{
      matches: RideMatchScore[];
      totalMatches: number;
      algorithm: any;
      isDemoMode: boolean;
    }>('/matching/find-matches', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Safety Center
  submitSafetyReport: (payload: {
    rideId?: string;
    category: string;
    description: string;
  }) =>
    request<{ message: string; report: SafetyReport }>('/safety/report', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  triggerEmergencySos: (payload: {
    rideId?: string;
    lat?: number;
    lng?: number;
    message?: string;
  }) =>
    request<{
      message: string;
      emergency: EmergencyEvent;
      emergencyContacts: any;
    }>('/safety/emergency-sos', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getSafetyContacts: () =>
    request<{
      nationalEmergency: string;
      policeHelpline: string;
      womenProtectionHelpline: string;
      ambulanceRescue: string;
      safarSafetyDesk: string;
      supportEmail: string;
      operationalHours: string;
    }>('/safety/contacts'),

  // Notifications
  getMyNotifications: () =>
    request<{ notifications: Notification[]; unreadCount: number }>(
      '/notifications/my-notifications'
    ),

  markNotificationRead: (id: string) =>
    request<{ notification: Notification }>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  // Admin
  getAdminOverview: () =>
    request<{ metrics: any; isDemoMode: boolean }>('/admin/overview'),

  getAdminUsers: () =>
    request<{ users: User[] }>('/admin/users'),

  verifyUser: (userId: string, verificationStatus: VerificationStatus, isVerified?: boolean) =>
    request<{ message: string; user: User }>(`/admin/users/${userId}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ verificationStatus, isVerified }),
    }),

  getAdminRides: () =>
    request<{ rides: Ride[] }>('/admin/rides'),

  getAdminBookings: () =>
    request<{ bookings: Booking[] }>('/admin/bookings'),

  getAdminSafetyReports: () =>
    request<{ reports: SafetyReport[] }>('/admin/safety-reports'),

  updateAdminSafetyReport: (id: string, status: ReportStatus, adminNotes?: string) =>
    request<{ message: string; report: SafetyReport }>(`/admin/safety-reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNotes }),
    }),

  getAdminEmergencies: () =>
    request<{ emergencies: EmergencyEvent[] }>('/admin/emergency-events'),
};
