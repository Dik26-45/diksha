import { PrismaClient } from '@prisma/client';
import {
  initialUsers,
  initialVehicles,
  initialRides,
  initialBookings,
  initialPreferences,
} from '../src/services/mockData';

const prisma = new PrismaClient();

async function main() {
  console.log('[SAFAR AI Seed]: Seeding Maharashtra, India data...');

  // 1. Users
  for (const u of initialUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        fullName: u.fullName,
        phone: u.phone,
        role: u.role,
        gender: u.gender,
        isVerified: u.isVerified,
        verificationStatus: u.verificationStatus,
        verificationDocUrl: u.verificationDocUrl,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
        ratingAvg: u.ratingAvg,
        totalRatingsCount: u.totalRatingsCount,
      },
      create: {
        id: u.id,
        email: u.email,
        passwordHash: u.passwordHash,
        fullName: u.fullName,
        phone: u.phone,
        role: u.role,
        gender: u.gender,
        isVerified: u.isVerified,
        verificationStatus: u.verificationStatus,
        verificationDocUrl: u.verificationDocUrl,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
        ratingAvg: u.ratingAvg,
        totalRatingsCount: u.totalRatingsCount,
      },
    });
  }

  // 2. Vehicles
  for (const v of initialVehicles) {
    await prisma.vehicle.upsert({
      where: { licensePlate: v.licensePlate },
      update: {
        make: v.make,
        model: v.model,
        year: v.year,
        color: v.color,
        capacity: v.capacity,
        isVerified: v.isVerified,
      },
      create: {
        id: v.id,
        userId: v.userId,
        make: v.make,
        model: v.model,
        year: v.year,
        color: v.color,
        licensePlate: v.licensePlate,
        capacity: v.capacity,
        isVerified: v.isVerified,
      },
    });
  }

  // 3. Rides (10 Maharashtra entries)
  for (const r of initialRides) {
    const existing = await prisma.ride.findUnique({ where: { id: r.id } });
    if (!existing) {
      await prisma.ride.create({
        data: {
          id: r.id,
          providerId: r.providerId,
          vehicleId: r.vehicleId,
          originAddress: r.originAddress,
          originLat: r.originLat,
          originLng: r.originLng,
          destAddress: r.destAddress,
          destLat: r.destLat,
          destLng: r.destLng,
          departureTime: new Date(r.departureTime),
          estimatedArrivalTime: r.estimatedArrivalTime ? new Date(r.estimatedArrivalTime) : null,
          totalSeats: r.totalSeats,
          availableSeats: r.availableSeats,
          pricePerSeat: r.pricePerSeat,
          status: r.status,
          isWomenOnly: r.isWomenOnly,
          notes: r.notes,
        },
      });
    }
  }

  // 4. Bookings
  for (const b of initialBookings) {
    const existing = await prisma.booking.findUnique({ where: { id: b.id } });
    if (!existing) {
      await prisma.booking.create({
        data: {
          id: b.id,
          rideId: b.rideId,
          passengerId: b.passengerId,
          seatCount: b.seatCount,
          totalPrice: b.totalPrice,
          status: b.status,
          bookingReference: b.bookingReference,
        },
      });
    }
  }

  // 5. User Preferences
  for (const p of initialPreferences) {
    await prisma.userPreference.upsert({
      where: { userId: p.userId },
      update: {
        maxWalkDistanceKm: p.maxWalkDistanceKm,
        musicPreference: p.musicPreference,
        smokingAllowed: p.smokingAllowed,
        petsAllowed: p.petsAllowed,
        quietRide: p.quietRide,
        womenOnlyPreferred: p.womenOnlyPreferred,
      },
      create: {
        id: p.id,
        userId: p.userId,
        maxWalkDistanceKm: p.maxWalkDistanceKm,
        musicPreference: p.musicPreference,
        smokingAllowed: p.smokingAllowed,
        petsAllowed: p.petsAllowed,
        quietRide: p.quietRide,
        womenOnlyPreferred: p.womenOnlyPreferred,
      },
    });
  }

  console.log('[SAFAR AI Seed]: Seeding completed successfully with 10 Maharashtra rides!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
