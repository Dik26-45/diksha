import { Router, Response } from 'express';
import { dataStoreManager } from '../services/dataStore';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/rides - List & Search
router.get('/', async (req, res): Promise<void> => {
  try {
    const {
      origin,
      destination,
      isWomenOnly,
      status = 'SCHEDULED',
      minPrice,
      maxPrice,
      minSeats,
      sortBy = 'departureTime',
      order = 'asc',
    } = req.query;

    const store = await dataStoreManager.getStore();
    let rides = await store.listRides({
      status: status ? String(status) : undefined,
      isWomenOnly: isWomenOnly !== undefined ? isWomenOnly === 'true' : undefined,
    });

    // Text search filter if provided
    if (origin) {
      const q = String(origin).toLowerCase();
      rides = rides.filter((r) => r.originAddress.toLowerCase().includes(q));
    }
    if (destination) {
      const q = String(destination).toLowerCase();
      rides = rides.filter((r) => r.destAddress.toLowerCase().includes(q));
    }
    if (minPrice) {
      rides = rides.filter((r) => r.pricePerSeat >= Number(minPrice));
    }
    if (maxPrice) {
      rides = rides.filter((r) => r.pricePerSeat <= Number(maxPrice));
    }
    if (minSeats) {
      rides = rides.filter((r) => r.availableSeats >= Number(minSeats));
    }

    // Sorting
    rides.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'price') {
        comparison = a.pricePerSeat - b.pricePerSeat;
      } else if (sortBy === 'seats') {
        comparison = b.availableSeats - a.availableSeats;
      } else {
        // departureTime
        comparison = new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      }
      return order === 'desc' ? -comparison : comparison;
    });

    res.json({
      rides,
      totalCount: rides.length,
      isDemoMode: store.isDemoMode,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// GET /api/rides/provider/my-rides
router.get('/provider/my-rides', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const store = await dataStoreManager.getStore();
    const allRides = await store.listRides();
    const myRides = allRides.filter((r) => r.providerId === req.user!.userId);

    res.json({
      rides: myRides,
      totalCount: myRides.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// GET /api/rides/:id
router.get('/:id', async (req, res): Promise<void> => {
  try {
    const id = req.params.id as string;
    const store = await dataStoreManager.getStore();
    const ride = await store.findRideById(id);

    if (!ride) {
      res.status(404).json({ error: 'Not Found', message: 'Ride not found.' });
      return;
    }

    res.json({
      ride,
      isDemoMode: store.isDemoMode,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// POST /api/rides - Create Ride
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      originAddress,
      originLat,
      originLng,
      destAddress,
      destLat,
      destLng,
      departureTime,
      estimatedArrivalTime,
      totalSeats,
      pricePerSeat,
      isWomenOnly,
      notes,
      vehicleId,
    } = req.body;

    if (!originAddress || originLat === undefined || originLng === undefined || !destAddress || destLat === undefined || destLng === undefined || !departureTime || !totalSeats || pricePerSeat === undefined) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Origin, destination, coordinates, departure time, total seats, and price are required.',
      });
      return;
    }

    if (totalSeats <= 0 || totalSeats > 8) {
      res.status(400).json({ error: 'Validation Error', message: 'Total seats must be between 1 and 8.' });
      return;
    }

    if (pricePerSeat < 0) {
      res.status(400).json({ error: 'Validation Error', message: 'Price cannot be negative.' });
      return;
    }

    const store = await dataStoreManager.getStore();
    const user = await store.findUserById(req.user!.userId);

    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    // Women-Only verification check
    if (isWomenOnly) {
      if (user.gender !== 'FEMALE') {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Safety Policy: Only female drivers are eligible to host Women-Only journeys.',
        });
        return;
      }
    }

    // Auto-promote passenger to ride provider if posting a ride
    if (user.role === 'PASSENGER') {
      await store.updateUser(user.id, { role: 'RIDE_PROVIDER' });
    }

    // Find or create default vehicle if none provided
    let finalVehicleId = vehicleId;
    if (!finalVehicleId) {
      const existingVehicles = await store.findVehiclesByUserId(user.id);
      if (existingVehicles.length > 0) {
        finalVehicleId = existingVehicles[0].id;
      } else {
        const newVehicle = await store.createVehicle({
          userId: user.id,
          make: 'Toyota',
          model: 'Yaris',
          year: 2023,
          color: 'Silver',
          licensePlate: `ISB-${Math.floor(100 + Math.random() * 900)}`,
          capacity: totalSeats,
        });
        finalVehicleId = newVehicle.id;
      }
    }

    const newRide = await store.createRide({
      providerId: user.id,
      vehicleId: finalVehicleId,
      originAddress,
      originLat: Number(originLat),
      originLng: Number(originLng),
      destAddress,
      destLat: Number(destLat),
      destLng: Number(destLng),
      departureTime,
      estimatedArrivalTime: estimatedArrivalTime || null,
      totalSeats: Number(totalSeats),
      availableSeats: Number(totalSeats),
      pricePerSeat: Number(pricePerSeat),
      status: 'SCHEDULED',
      isWomenOnly: !!isWomenOnly,
      notes: notes || '',
    });

    await store.createNotification({
      userId: user.id,
      title: 'Ride Published',
      message: `Your ride from ${originAddress} to ${destAddress} is now active and discoverable.`,
      type: 'RIDE_UPDATE',
    });

    res.status(201).json({
      message: 'Ride created successfully.',
      ride: newRide,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// PUT /api/rides/:id/cancel
router.put('/:id/cancel', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const store = await dataStoreManager.getStore();
    const ride = await store.findRideById(id);

    if (!ride) {
      res.status(404).json({ error: 'Not Found', message: 'Ride not found.' });
      return;
    }

    if (ride.providerId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to cancel this ride.' });
      return;
    }

    const updated = await store.updateRide(id, { status: 'CANCELLED' });

    // Cancel all confirmed bookings for this ride and notify passengers
    const bookings = await store.findBookingsByRideId(id);
    for (const b of bookings) {
      if (b.status === 'CONFIRMED') {
        await store.cancelBooking(b.id, 'Ride was cancelled by provider');
        await store.createNotification({
          userId: b.passengerId,
          title: 'Ride Cancelled',
          message: `Your booking ${b.bookingReference} has been cancelled because the provider cancelled the ride. A simulated refund has been credited.`,
          type: 'BOOKING',
        });
      }
    }

    res.json({
      message: 'Ride cancelled successfully.',
      ride: updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

export default router;
