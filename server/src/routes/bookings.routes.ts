import { Router, Response } from 'express';
import { dataStoreManager } from '../services/dataStore';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// POST /api/bookings - Create Booking
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      rideId,
      seatCount = 1,
      paymentMethod = 'SIMULATED_WALLET',
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      shareLiveLocationWithRelative = false,
    } = req.body;

    if (!rideId) {
      res.status(400).json({ error: 'Validation Error', message: 'rideId is required.' });
      return;
    }

    const seatsToBook = Number(seatCount);
    if (isNaN(seatsToBook) || seatsToBook <= 0) {
      res.status(400).json({ error: 'Validation Error', message: 'seatCount must be a positive integer.' });
      return;
    }

    const store = await dataStoreManager.getStore();
    const ride = await store.findRideById(rideId);

    if (!ride) {
      res.status(404).json({ error: 'Not Found', message: 'Selected ride does not exist.' });
      return;
    }

    if (ride.status !== 'SCHEDULED') {
      res.status(400).json({
        error: 'Ride Unavailable',
        message: `This ride is ${ride.status.toLowerCase()} and cannot accept new bookings.`,
      });
      return;
    }

    // Provider cannot book their own ride
    if (ride.providerId === req.user!.userId) {
      res.status(400).json({ error: 'Invalid Request', message: 'You cannot book a seat on your own ride.' });
      return;
    }

    // Availability & Overbooking check
    if (ride.availableSeats < seatsToBook) {
      res.status(400).json({
        error: 'Overbooking Prevented',
        message: `Only ${ride.availableSeats} seat(s) available on this ride. You requested ${seatsToBook}.`,
      });
      return;
    }

    // Fetch passenger profile for Women-Only verification
    const passenger = await store.findUserById(req.user!.userId);
    if (!passenger) {
      res.status(404).json({ error: 'Not Found', message: 'Passenger account not found.' });
      return;
    }

    // Strict Women-Only check
    if (ride.isWomenOnly) {
      if (passenger.gender !== 'FEMALE') {
        res.status(403).json({
          error: 'Restricted Category',
          message: 'Safety Policy: This is a verified Women-Only ride. Only female passengers may reserve seats.',
        });
        return;
      }
    }

    // Server-side price calculation
    const calculatedPrice = ride.pricePerSeat * seatsToBook;

    // Decrement seats
    await store.decrementRideSeats(ride.id, seatsToBook);

    // Create booking
    const booking = await store.createBooking({
      rideId: ride.id,
      passengerId: passenger.id,
      seatCount: seatsToBook,
      totalPrice: calculatedPrice,
      paymentMethod,
      emergencyContactName: emergencyContactName || null,
      emergencyContactPhone: emergencyContactPhone || null,
      emergencyContactRelation: emergencyContactRelation || null,
      shareLiveLocationWithRelative: !!shareLiveLocationWithRelative,
    });

    // Notify passenger
    await store.createNotification({
      userId: passenger.id,
      title: 'Booking Confirmed!',
      message: `Your reservation (${booking.bookingReference}) for ${seatsToBook} seat(s) to ${ride.destAddress} is confirmed.`,
      type: 'BOOKING',
    });

    if (shareLiveLocationWithRelative && emergencyContactName) {
      await store.createNotification({
        userId: passenger.id,
        title: 'Live Location Shared with Relative',
        message: `Trip tracking link generated and transmitted to ${emergencyContactName} (${emergencyContactPhone || 'Emergency Contact'}).`,
        type: 'SAFETY',
      });
    }

    // Notify driver
    await store.createNotification({
      userId: ride.providerId,
      title: 'New Passenger Joined',
      message: `${passenger.fullName} has booked ${seatsToBook} seat(s) on your trip to ${ride.destAddress}.`,
      type: 'BOOKING',
    });

    res.status(201).json({
      message: 'Booking created successfully.',
      booking,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// GET /api/bookings/track/:ref - Public Live Tracking for Relatives
router.get('/track/:ref', async (req, res): Promise<void> => {
  try {
    const ref = req.params.ref as string;
    const store = await dataStoreManager.getStore();
    const booking = await store.findBookingById(ref);

    if (!booking) {
      res.status(404).json({ error: 'Not Found', message: 'Tracking record not found.' });
      return;
    }

    res.json({
      bookingReference: booking.bookingReference,
      status: booking.status,
      createdAt: booking.createdAt,
      seatCount: booking.seatCount,
      emergencyContactName: booking.emergencyContactName,
      emergencyContactPhone: booking.emergencyContactPhone,
      emergencyContactRelation: booking.emergencyContactRelation,
      shareLiveLocationWithRelative: booking.shareLiveLocationWithRelative,
      passenger: booking.passenger,
      ride: booking.ride,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// GET /api/bookings/my-bookings
router.get('/my-bookings', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const store = await dataStoreManager.getStore();
    const bookings = await store.findBookingsByPassengerId(req.user!.userId);

    res.json({
      bookings,
      totalCount: bookings.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// GET /api/bookings/:id
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const store = await dataStoreManager.getStore();
    const booking = await store.findBookingById(id);

    if (!booking) {
      res.status(404).json({ error: 'Not Found', message: 'Booking not found.' });
      return;
    }

    // Check ownership or provider or admin
    const isOwner = booking.passengerId === req.user!.userId;
    const isProvider = booking.ride?.providerId === req.user!.userId;
    const isAdmin = req.user!.role === 'ADMIN';

    if (!isOwner && !isProvider && !isAdmin) {
      res.status(403).json({ error: 'Forbidden', message: 'You are not authorized to view this booking.' });
      return;
    }

    res.json({ booking });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// PUT /api/bookings/:id/cancel
router.put('/:id/cancel', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;
    const store = await dataStoreManager.getStore();
    const booking = await store.findBookingById(id);

    if (!booking) {
      res.status(404).json({ error: 'Not Found', message: 'Booking not found.' });
      return;
    }

    const isOwner = booking.passengerId === req.user!.userId;
    const isAdmin = req.user!.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      res.status(403).json({ error: 'Forbidden', message: 'You can only cancel your own bookings.' });
      return;
    }

    if (booking.status === 'CANCELLED') {
      res.status(400).json({ error: 'Invalid State', message: 'This booking has already been cancelled.' });
      return;
    }

    // Cancel booking
    const updatedBooking = await store.cancelBooking(booking.id, reason || 'Cancelled by passenger');

    // Return seats back to ride
    await store.incrementRideSeats(booking.rideId, booking.seatCount);

    // Notify driver
    if (booking.ride?.providerId) {
      await store.createNotification({
        userId: booking.ride.providerId,
        title: 'Booking Cancelled',
        message: `Booking ${booking.bookingReference} for ${booking.seatCount} seat(s) has been cancelled. Seats have been restored.`,
        type: 'BOOKING',
      });
    }

    res.json({
      message: 'Booking cancelled successfully. Simulated refund processed.',
      booking: updatedBooking,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

export default router;
