import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import {
  User,
  Vehicle,
  Ride,
  Booking,
  UserPreference,
  SafetyReport,
  EmergencyEvent,
  Notification,
  Role,
  VerificationStatus,
  ReportStatus,
} from '../types';
import {
  initialUsers,
  initialVehicles,
  initialRides,
  initialBookings,
  initialPreferences,
  initialSafetyReports,
  initialEmergencyEvents,
  initialNotifications,
} from './mockData';

export interface IDataStore {
  isDemoMode: boolean;
  init(): Promise<void>;

  // Users
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  createUser(userData: Partial<User>): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  listUsers(): Promise<User[]>;

  // Vehicles
  findVehicleById(id: string): Promise<Vehicle | null>;
  findVehiclesByUserId(userId: string): Promise<Vehicle[]>;
  createVehicle(vehicleData: Partial<Vehicle>): Promise<Vehicle>;

  // Rides
  findRideById(id: string): Promise<Ride | null>;
  listRides(filter?: {
    isWomenOnly?: boolean;
    status?: string;
  }): Promise<Ride[]>;
  createRide(rideData: Partial<Ride>): Promise<Ride>;
  updateRide(id: string, updates: Partial<Ride>): Promise<Ride>;
  decrementRideSeats(rideId: string, count: number): Promise<Ride>;
  incrementRideSeats(rideId: string, count: number): Promise<Ride>;

  // Bookings
  findBookingById(id: string): Promise<Booking | null>;
  findBookingsByPassengerId(passengerId: string): Promise<Booking[]>;
  findBookingsByRideId(rideId: string): Promise<Booking[]>;
  listAllBookings(): Promise<Booking[]>;
  createBooking(bookingData: Partial<Booking>): Promise<Booking>;
  cancelBooking(id: string, reason?: string): Promise<Booking>;

  // User Preferences
  getUserPreference(userId: string): Promise<UserPreference | null>;
  upsertUserPreference(userId: string, prefs: Partial<UserPreference>): Promise<UserPreference>;

  // Safety Reports
  createSafetyReport(reportData: Partial<SafetyReport>): Promise<SafetyReport>;
  listSafetyReports(): Promise<SafetyReport[]>;
  updateSafetyReport(id: string, status: ReportStatus, adminNotes?: string): Promise<SafetyReport>;

  // Emergency Events
  createEmergencyEvent(eventData: Partial<EmergencyEvent>): Promise<EmergencyEvent>;
  listEmergencyEvents(): Promise<EmergencyEvent[]>;

  // Notifications
  getNotificationsByUserId(userId: string): Promise<Notification[]>;
  createNotification(notifData: Partial<Notification>): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<Notification>;
}

/**
 * Isolated Mock Store for Demo Mode.
 * Maintains state and returns deep copies.
 */
export class MockDataStore implements IDataStore {
  public isDemoMode = true;
  private users: User[] = JSON.parse(JSON.stringify(initialUsers));
  private vehicles: Vehicle[] = JSON.parse(JSON.stringify(initialVehicles));
  private rides: Ride[] = JSON.parse(JSON.stringify(initialRides));
  private bookings: Booking[] = JSON.parse(JSON.stringify(initialBookings));
  private preferences: UserPreference[] = JSON.parse(JSON.stringify(initialPreferences));
  private safetyReports: SafetyReport[] = JSON.parse(JSON.stringify(initialSafetyReports));
  private emergencyEvents: EmergencyEvent[] = JSON.parse(JSON.stringify(initialEmergencyEvents));
  private notifications: Notification[] = JSON.parse(JSON.stringify(initialNotifications));

  async init(): Promise<void> {
    console.log('[SAFAR AI DataStore]: Initialized in DEMO MODE with fictional sample dataset.');
  }

  // Users
  async findUserByEmail(email: string): Promise<User | null> {
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user ? JSON.parse(JSON.stringify(user)) : null;
  }

  async findUserById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === id);
    return user ? JSON.parse(JSON.stringify(user)) : null;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const newUser: User = {
      id: `user-${crypto.randomUUID().slice(0, 8)}`,
      email: userData.email!,
      passwordHash: userData.passwordHash!,
      fullName: userData.fullName!,
      phone: userData.phone || null,
      role: userData.role || 'PASSENGER',
      gender: userData.gender || 'PREFER_NOT_TO_SAY',
      isVerified: false,
      verificationStatus: 'UNVERIFIED',
      verificationDocUrl: null,
      avatarUrl: userData.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
      bio: userData.bio || '',
      ratingAvg: 5.0,
      totalRatingsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return JSON.parse(JSON.stringify(newUser));
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('User not found');
    this.users[idx] = {
      ...this.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return JSON.parse(JSON.stringify(this.users[idx]));
  }

  async listUsers(): Promise<User[]> {
    return JSON.parse(JSON.stringify(this.users));
  }

  // Vehicles
  async findVehicleById(id: string): Promise<Vehicle | null> {
    const v = this.vehicles.find((veh) => veh.id === id);
    return v ? JSON.parse(JSON.stringify(v)) : null;
  }

  async findVehiclesByUserId(userId: string): Promise<Vehicle[]> {
    const list = this.vehicles.filter((v) => v.userId === userId);
    return JSON.parse(JSON.stringify(list));
  }

  async createVehicle(vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    const newVehicle: Vehicle = {
      id: `veh-${crypto.randomUUID().slice(0, 8)}`,
      userId: vehicleData.userId!,
      make: vehicleData.make || 'Toyota',
      model: vehicleData.model || 'Corolla',
      year: vehicleData.year || 2022,
      color: vehicleData.color || 'White',
      licensePlate: vehicleData.licensePlate || `ISB-${Math.floor(100 + Math.random() * 900)}`,
      capacity: vehicleData.capacity || 4,
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.vehicles.push(newVehicle);
    return JSON.parse(JSON.stringify(newVehicle));
  }

  // Rides
  private attachRideRelations(ride: Ride): Ride {
    const copy = JSON.parse(JSON.stringify(ride));
    const provider = this.users.find((u) => u.id === ride.providerId);
    if (provider) {
      copy.provider = {
        id: provider.id,
        fullName: provider.fullName,
        email: provider.email,
        phone: provider.phone,
        avatarUrl: provider.avatarUrl,
        ratingAvg: provider.ratingAvg,
        totalRatingsCount: provider.totalRatingsCount,
        gender: provider.gender,
        isVerified: provider.isVerified,
        verificationStatus: provider.verificationStatus,
      };
    }
    if (ride.vehicleId) {
      copy.vehicle = this.vehicles.find((v) => v.id === ride.vehicleId) || null;
    }
    const confirmedBookings = this.bookings.filter(
      (b) => b.rideId === ride.id && b.status === 'CONFIRMED'
    );
    copy.bookings = confirmedBookings.map((b) => {
      const passenger = this.users.find((u) => u.id === b.passengerId);
      return {
        id: b.id,
        rideId: b.rideId,
        passengerId: b.passengerId,
        seatCount: b.seatCount,
        totalPrice: b.totalPrice,
        status: b.status,
        bookingReference: b.bookingReference,
        emergencyContactName: b.emergencyContactName,
        emergencyContactRelation: b.emergencyContactRelation,
        emergencyContactPhone: b.emergencyContactPhone,
        shareLiveLocationWithRelative: b.shareLiveLocationWithRelative,
        createdAt: b.createdAt,
        passenger: passenger
          ? {
              id: passenger.id,
              fullName: passenger.fullName,
              avatarUrl: passenger.avatarUrl,
              gender: passenger.gender,
              isVerified: passenger.isVerified,
              bio: passenger.bio,
            }
          : null,
      };
    });
    return copy;
  }

  async findRideById(id: string): Promise<Ride | null> {
    const r = this.rides.find((ride) => ride.id === id);
    if (!r) return null;
    return this.attachRideRelations(r);
  }

  async listRides(filter?: { isWomenOnly?: boolean; status?: string }): Promise<Ride[]> {
    let result = this.rides;
    if (filter?.status) {
      result = result.filter((r) => r.status === filter.status);
    }
    if (filter?.isWomenOnly !== undefined) {
      result = result.filter((r) => r.isWomenOnly === filter.isWomenOnly);
    }
    return result.map((r) => this.attachRideRelations(r));
  }

  async createRide(rideData: Partial<Ride>): Promise<Ride> {
    const newRide: Ride = {
      id: `ride-${crypto.randomUUID().slice(0, 8)}`,
      providerId: rideData.providerId!,
      vehicleId: rideData.vehicleId || null,
      originAddress: rideData.originAddress!,
      originLat: rideData.originLat!,
      originLng: rideData.originLng!,
      destAddress: rideData.destAddress!,
      destLat: rideData.destLat!,
      destLng: rideData.destLng!,
      departureTime: rideData.departureTime!,
      estimatedArrivalTime: rideData.estimatedArrivalTime || null,
      totalSeats: rideData.totalSeats || 3,
      availableSeats: rideData.availableSeats ?? (rideData.totalSeats || 3),
      pricePerSeat: rideData.pricePerSeat || 300,
      status: rideData.status || 'SCHEDULED',
      isWomenOnly: !!rideData.isWomenOnly,
      notes: rideData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.rides.push(newRide);
    return this.attachRideRelations(newRide);
  }

  async updateRide(id: string, updates: Partial<Ride>): Promise<Ride> {
    const idx = this.rides.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Ride not found');
    this.rides[idx] = {
      ...this.rides[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.attachRideRelations(this.rides[idx]);
  }

  async decrementRideSeats(rideId: string, count: number): Promise<Ride> {
    const idx = this.rides.findIndex((r) => r.id === rideId);
    if (idx === -1) throw new Error('Ride not found');
    if (this.rides[idx].availableSeats < count) {
      throw new Error(`Insufficient seats available. Only ${this.rides[idx].availableSeats} remaining.`);
    }
    this.rides[idx].availableSeats -= count;
    this.rides[idx].updatedAt = new Date().toISOString();
    return this.attachRideRelations(this.rides[idx]);
  }

  async incrementRideSeats(rideId: string, count: number): Promise<Ride> {
    const idx = this.rides.findIndex((r) => r.id === rideId);
    if (idx === -1) throw new Error('Ride not found');
    this.rides[idx].availableSeats = Math.min(
      this.rides[idx].totalSeats,
      this.rides[idx].availableSeats + count
    );
    this.rides[idx].updatedAt = new Date().toISOString();
    return this.attachRideRelations(this.rides[idx]);
  }

  // Bookings
  private attachBookingRelations(b: Booking): Booking {
    const copy = JSON.parse(JSON.stringify(b));
    const ride = this.rides.find((r) => r.id === b.rideId);
    if (ride) {
      copy.ride = this.attachRideRelations(ride);
    }
    const passenger = this.users.find((u) => u.id === b.passengerId);
    if (passenger) {
      copy.passenger = {
        id: passenger.id,
        fullName: passenger.fullName,
        email: passenger.email,
        phone: passenger.phone,
        avatarUrl: passenger.avatarUrl,
        gender: passenger.gender,
        isVerified: passenger.isVerified,
      };
    }
    return copy;
  }

  async findBookingById(id: string): Promise<Booking | null> {
    const b = this.bookings.find((item) => item.id === id || item.bookingReference === id);
    if (!b) return null;
    return this.attachBookingRelations(b);
  }

  async findBookingsByPassengerId(passengerId: string): Promise<Booking[]> {
    return this.bookings
      .filter((b) => b.passengerId === passengerId)
      .map((b) => this.attachBookingRelations(b));
  }

  async findBookingsByRideId(rideId: string): Promise<Booking[]> {
    return this.bookings
      .filter((b) => b.rideId === rideId)
      .map((b) => this.attachBookingRelations(b));
  }

  async listAllBookings(): Promise<Booking[]> {
    return this.bookings.map((b) => this.attachBookingRelations(b));
  }

  async createBooking(bookingData: Partial<Booking>): Promise<Booking> {
    const newBooking: Booking = {
      id: `book-${crypto.randomUUID().slice(0, 8)}`,
      rideId: bookingData.rideId!,
      passengerId: bookingData.passengerId!,
      seatCount: bookingData.seatCount || 1,
      totalPrice: bookingData.totalPrice!,
      status: 'CONFIRMED',
      paymentStatus: 'SIMULATED_PAID',
      paymentMethod: bookingData.paymentMethod || 'SIMULATED_WALLET',
      bookingReference: `SFR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      emergencyContactName: bookingData.emergencyContactName || null,
      emergencyContactPhone: bookingData.emergencyContactPhone || null,
      emergencyContactRelation: bookingData.emergencyContactRelation || null,
      shareLiveLocationWithRelative: !!bookingData.shareLiveLocationWithRelative,
      cancelledAt: null,
      cancellationReason: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.bookings.push(newBooking);
    return this.attachBookingRelations(newBooking);
  }

  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    const idx = this.bookings.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Booking not found');
    this.bookings[idx].status = 'CANCELLED';
    this.bookings[idx].paymentStatus = 'REFUNDED';
    this.bookings[idx].cancelledAt = new Date().toISOString();
    this.bookings[idx].cancellationReason = reason || 'Cancelled by user';
    this.bookings[idx].updatedAt = new Date().toISOString();
    return this.attachBookingRelations(this.bookings[idx]);
  }

  // User Preferences
  async getUserPreference(userId: string): Promise<UserPreference | null> {
    const pref = this.preferences.find((p) => p.userId === userId);
    return pref ? JSON.parse(JSON.stringify(pref)) : null;
  }

  async upsertUserPreference(userId: string, prefs: Partial<UserPreference>): Promise<UserPreference> {
    const idx = this.preferences.findIndex((p) => p.userId === userId);
    if (idx !== -1) {
      this.preferences[idx] = {
        ...this.preferences[idx],
        ...prefs,
        updatedAt: new Date().toISOString(),
      };
      return JSON.parse(JSON.stringify(this.preferences[idx]));
    }
    const newPref: UserPreference = {
      id: `pref-${crypto.randomUUID().slice(0, 8)}`,
      userId,
      maxWalkDistanceKm: prefs.maxWalkDistanceKm ?? 2.0,
      musicPreference: prefs.musicPreference || 'ANY',
      smokingAllowed: prefs.smokingAllowed ?? false,
      petsAllowed: prefs.petsAllowed ?? false,
      quietRide: prefs.quietRide ?? false,
      womenOnlyPreferred: prefs.womenOnlyPreferred ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.preferences.push(newPref);
    return JSON.parse(JSON.stringify(newPref));
  }

  // Safety Reports
  async createSafetyReport(reportData: Partial<SafetyReport>): Promise<SafetyReport> {
    const newReport: SafetyReport = {
      id: `rep-${crypto.randomUUID().slice(0, 8)}`,
      reporterId: reportData.reporterId!,
      rideId: reportData.rideId || null,
      category: reportData.category || 'OTHER',
      description: reportData.description!,
      status: 'OPEN',
      adminNotes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.safetyReports.push(newReport);
    return JSON.parse(JSON.stringify(newReport));
  }

  async listSafetyReports(): Promise<SafetyReport[]> {
    return JSON.parse(JSON.stringify(this.safetyReports));
  }

  async updateSafetyReport(id: string, status: ReportStatus, adminNotes?: string): Promise<SafetyReport> {
    const idx = this.safetyReports.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Safety report not found');
    this.safetyReports[idx].status = status;
    if (adminNotes !== undefined) {
      this.safetyReports[idx].adminNotes = adminNotes;
    }
    this.safetyReports[idx].updatedAt = new Date().toISOString();
    return JSON.parse(JSON.stringify(this.safetyReports[idx]));
  }

  // Emergency Events
  async createEmergencyEvent(eventData: Partial<EmergencyEvent>): Promise<EmergencyEvent> {
    const newEvent: EmergencyEvent = {
      id: `emg-${crypto.randomUUID().slice(0, 8)}`,
      userId: eventData.userId!,
      rideId: eventData.rideId || null,
      lat: eventData.lat || 33.71,
      lng: eventData.lng || 73.05,
      message: eventData.message || 'Emergency SOS button triggered.',
      emergencyNumber: '112',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.emergencyEvents.push(newEvent);
    return JSON.parse(JSON.stringify(newEvent));
  }

  async listEmergencyEvents(): Promise<EmergencyEvent[]> {
    return JSON.parse(JSON.stringify(this.emergencyEvents));
  }

  // Notifications
  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    const list = this.notifications.filter((n) => n.userId === userId);
    return JSON.parse(JSON.stringify(list));
  }

  async createNotification(notifData: Partial<Notification>): Promise<Notification> {
    const newNotif: Notification = {
      id: `notif-${crypto.randomUUID().slice(0, 8)}`,
      userId: notifData.userId!,
      title: notifData.title || 'Notification',
      message: notifData.message || '',
      type: notifData.type || 'SYSTEM',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(newNotif);
    return JSON.parse(JSON.stringify(newNotif));
  }

  async markNotificationAsRead(id: string): Promise<Notification> {
    const idx = this.notifications.findIndex((n) => n.id === id);
    if (idx === -1) throw new Error('Notification not found');
    this.notifications[idx].isRead = true;
    return JSON.parse(JSON.stringify(this.notifications[idx]));
  }
}

/**
 * Real PostgreSQL Prisma Store
 */
export class PrismaDataStore implements IDataStore {
  public isDemoMode = false;
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async init(): Promise<void> {
    console.log('[SAFAR AI DataStore]: Connected to PostgreSQL Database via Prisma.');
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const u = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    return (u as unknown) as User | null;
  }

  async findUserById(id: string): Promise<User | null> {
    const u = await this.prisma.user.findUnique({ where: { id } });
    return (u as unknown) as User | null;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const u = await this.prisma.user.create({
      data: {
        email: userData.email!.toLowerCase(),
        passwordHash: userData.passwordHash!,
        fullName: userData.fullName!,
        phone: userData.phone || null,
        role: (userData.role as any) || 'PASSENGER',
        gender: (userData.gender as any) || 'PREFER_NOT_TO_SAY',
        bio: userData.bio || '',
        avatarUrl: userData.avatarUrl || null,
      },
    });
    return (u as unknown) as User;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const u = await this.prisma.user.update({
      where: { id },
      data: updates as any,
    });
    return (u as unknown) as User;
  }

  async listUsers(): Promise<User[]> {
    const list = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return (list as unknown) as User[];
  }

  async findVehicleById(id: string): Promise<Vehicle | null> {
    const v = await this.prisma.vehicle.findUnique({ where: { id } });
    return (v as unknown) as Vehicle | null;
  }

  async findVehiclesByUserId(userId: string): Promise<Vehicle[]> {
    const list = await this.prisma.vehicle.findMany({ where: { userId } });
    return (list as unknown) as Vehicle[];
  }

  async createVehicle(vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    const v = await this.prisma.vehicle.create({
      data: {
        userId: vehicleData.userId!,
        make: vehicleData.make!,
        model: vehicleData.model!,
        year: vehicleData.year!,
        color: vehicleData.color!,
        licensePlate: vehicleData.licensePlate!,
        capacity: vehicleData.capacity || 4,
        isVerified: true,
      },
    });
    return (v as unknown) as Vehicle;
  }

  async findRideById(id: string): Promise<Ride | null> {
    const r = await this.prisma.ride.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            ratingAvg: true,
            totalRatingsCount: true,
            gender: true,
            isVerified: true,
            verificationStatus: true,
          },
        },
        vehicle: true,
      },
    });
    return (r as unknown) as Ride | null;
  }

  async listRides(filter?: { isWomenOnly?: boolean; status?: string }): Promise<Ride[]> {
    const where: any = {};
    if (filter?.status) where.status = filter.status;
    if (filter?.isWomenOnly !== undefined) where.isWomenOnly = filter.isWomenOnly;

    const list = await this.prisma.ride.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            ratingAvg: true,
            totalRatingsCount: true,
            gender: true,
            isVerified: true,
            verificationStatus: true,
          },
        },
        vehicle: true,
      },
      orderBy: { departureTime: 'asc' },
    });
    return (list as unknown) as Ride[];
  }

  async createRide(rideData: Partial<Ride>): Promise<Ride> {
    const r = await this.prisma.ride.create({
      data: {
        providerId: rideData.providerId!,
        vehicleId: rideData.vehicleId || null,
        originAddress: rideData.originAddress!,
        originLat: rideData.originLat!,
        originLng: rideData.originLng!,
        destAddress: rideData.destAddress!,
        destLat: rideData.destLat!,
        destLng: rideData.destLng!,
        departureTime: new Date(rideData.departureTime!),
        estimatedArrivalTime: rideData.estimatedArrivalTime ? new Date(rideData.estimatedArrivalTime) : null,
        totalSeats: rideData.totalSeats || 3,
        availableSeats: rideData.availableSeats ?? (rideData.totalSeats || 3),
        pricePerSeat: rideData.pricePerSeat || 300,
        status: (rideData.status as any) || 'SCHEDULED',
        isWomenOnly: !!rideData.isWomenOnly,
        notes: rideData.notes || '',
      },
      include: {
        provider: true,
        vehicle: true,
      },
    });
    return (r as unknown) as Ride;
  }

  async updateRide(id: string, updates: Partial<Ride>): Promise<Ride> {
    const data: any = { ...updates };
    if (updates.departureTime) data.departureTime = new Date(updates.departureTime);
    if (updates.estimatedArrivalTime) data.estimatedArrivalTime = new Date(updates.estimatedArrivalTime);
    const r = await this.prisma.ride.update({
      where: { id },
      data,
      include: { provider: true, vehicle: true },
    });
    return (r as unknown) as Ride;
  }

  async decrementRideSeats(rideId: string, count: number): Promise<Ride> {
    const r = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        availableSeats: {
          decrement: count,
        },
      },
      include: { provider: true, vehicle: true },
    });
    return (r as unknown) as Ride;
  }

  async incrementRideSeats(rideId: string, count: number): Promise<Ride> {
    const r = await this.prisma.ride.update({
      where: { id: rideId },
      data: {
        availableSeats: {
          increment: count,
        },
      },
      include: { provider: true, vehicle: true },
    });
    return (r as unknown) as Ride;
  }

  async findBookingById(id: string): Promise<Booking | null> {
    const b = await this.prisma.booking.findFirst({
      where: {
        OR: [{ id }, { bookingReference: id }],
      },
      include: {
        ride: {
          include: { provider: true, vehicle: true },
        },
        passenger: true,
      },
    });
    return (b as unknown) as Booking | null;
  }

  async findBookingsByPassengerId(passengerId: string): Promise<Booking[]> {
    const list = await this.prisma.booking.findMany({
      where: { passengerId },
      include: {
        ride: {
          include: { provider: true, vehicle: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return (list as unknown) as Booking[];
  }

  async findBookingsByRideId(rideId: string): Promise<Booking[]> {
    const list = await this.prisma.booking.findMany({
      where: { rideId },
      include: { passenger: true },
      orderBy: { createdAt: 'desc' },
    });
    return (list as unknown) as Booking[];
  }

  async listAllBookings(): Promise<Booking[]> {
    const list = await this.prisma.booking.findMany({
      include: {
        ride: { include: { provider: true } },
        passenger: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return (list as unknown) as Booking[];
  }

  async createBooking(bookingData: Partial<Booking>): Promise<Booking> {
    const b = await this.prisma.booking.create({
      data: {
        rideId: bookingData.rideId!,
        passengerId: bookingData.passengerId!,
        seatCount: bookingData.seatCount || 1,
        totalPrice: bookingData.totalPrice!,
        status: 'CONFIRMED',
        paymentStatus: 'SIMULATED_PAID',
        paymentMethod: bookingData.paymentMethod || 'SIMULATED_WALLET',
        bookingReference: `SFR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      },
      include: {
        ride: { include: { provider: true } },
        passenger: true,
      },
    });
    return (b as unknown) as Booking;
  }

  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    const b = await this.prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'REFUNDED',
        cancelledAt: new Date(),
        cancellationReason: reason || 'Cancelled by user',
      },
      include: {
        ride: { include: { provider: true } },
        passenger: true,
      },
    });
    return (b as unknown) as Booking;
  }

  async getUserPreference(userId: string): Promise<UserPreference | null> {
    const p = await this.prisma.userPreference.findUnique({
      where: { userId },
    });
    return (p as unknown) as UserPreference | null;
  }

  async upsertUserPreference(userId: string, prefs: Partial<UserPreference>): Promise<UserPreference> {
    const p = await this.prisma.userPreference.upsert({
      where: { userId },
      update: prefs as any,
      create: {
        userId,
        maxWalkDistanceKm: prefs.maxWalkDistanceKm ?? 2.0,
        musicPreference: prefs.musicPreference || 'ANY',
        smokingAllowed: prefs.smokingAllowed ?? false,
        petsAllowed: prefs.petsAllowed ?? false,
        quietRide: prefs.quietRide ?? false,
        womenOnlyPreferred: prefs.womenOnlyPreferred ?? false,
      },
    });
    return (p as unknown) as UserPreference;
  }

  async createSafetyReport(reportData: Partial<SafetyReport>): Promise<SafetyReport> {
    const r = await this.prisma.safetyReport.create({
      data: {
        reporterId: reportData.reporterId!,
        rideId: reportData.rideId || null,
        category: (reportData.category as any) || 'OTHER',
        description: reportData.description!,
        status: 'OPEN',
      },
    });
    return (r as unknown) as SafetyReport;
  }

  async listSafetyReports(): Promise<SafetyReport[]> {
    const list = await this.prisma.safetyReport.findMany({
      include: {
        reporter: { select: { id: true, fullName: true, email: true } },
        ride: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return (list as unknown) as SafetyReport[];
  }

  async updateSafetyReport(id: string, status: ReportStatus, adminNotes?: string): Promise<SafetyReport> {
    const r = await this.prisma.safetyReport.update({
      where: { id },
      data: {
        status: status as any,
        adminNotes: adminNotes !== undefined ? adminNotes : undefined,
      },
    });
    return (r as unknown) as SafetyReport;
  }

  async createEmergencyEvent(eventData: Partial<EmergencyEvent>): Promise<EmergencyEvent> {
    const e = await this.prisma.emergencyEvent.create({
      data: {
        userId: eventData.userId!,
        rideId: eventData.rideId || null,
        lat: eventData.lat || 33.71,
        lng: eventData.lng || 73.05,
        message: eventData.message || 'Emergency SOS button triggered.',
        emergencyNumber: '112',
        status: 'ACTIVE',
      },
    });
    return (e as unknown) as EmergencyEvent;
  }

  async listEmergencyEvents(): Promise<EmergencyEvent[]> {
    const list = await this.prisma.emergencyEvent.findMany({
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return (list as unknown) as EmergencyEvent[];
  }

  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    const list = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return (list as unknown) as Notification[];
  }

  async createNotification(notifData: Partial<Notification>): Promise<Notification> {
    const n = await this.prisma.notification.create({
      data: {
        userId: notifData.userId!,
        title: notifData.title || 'Notification',
        message: notifData.message || '',
        type: notifData.type || 'SYSTEM',
        isRead: false,
      },
    });
    return (n as unknown) as Notification;
  }

  async markNotificationAsRead(id: string): Promise<Notification> {
    const n = await this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return (n as unknown) as Notification;
  }
}

/**
 * Singleton database manager with intelligent fallback
 */
class DataStoreManager {
  private instance: IDataStore | null = null;

  async getStore(): Promise<IDataStore> {
    if (this.instance) {
      return this.instance;
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      try {
        console.log('[SAFAR AI DB]: Attempting PostgreSQL connection...');
        const prisma = new PrismaClient({
          datasources: { db: { url: databaseUrl } },
        });
        await prisma.$connect();
        const prismaStore = new PrismaDataStore(prisma);
        await prismaStore.init();
        this.instance = prismaStore;
        return this.instance;
      } catch (err: any) {
        console.warn(
          `[SAFAR AI DB NOTICE]: Failed to connect to PostgreSQL (${err.message}). Explicitly falling back to Demo Mode service.`
        );
      }
    } else {
      console.log(
        '[SAFAR AI DB NOTICE]: No DATABASE_URL specified in environment. Starting in Demo Mode with fictional sample data.'
      );
    }

    const mockStore = new MockDataStore();
    await mockStore.init();
    this.instance = mockStore;
    return this.instance;
  }
}

export const dataStoreManager = new DataStoreManager();
