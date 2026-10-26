import { Router, Response } from 'express';
import { dataStoreManager } from '../services/dataStore';
import { requireAuth, requireAdmin, AuthenticatedRequest, sanitizeUser } from '../middleware/auth';

const router = Router();

// Protect all admin routes
router.use(requireAuth);
router.use(requireAdmin);

// GET /api/admin/overview
router.get('/overview', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const store = await dataStoreManager.getStore();
    const users = await store.listUsers();
    const rides = await store.listRides();
    const bookings = await store.listAllBookings();
    const reports = await store.listSafetyReports();
    const emergencies = await store.listEmergencyEvents();

    res.json({
      metrics: {
        totalUsers: users.length,
        verifiedUsers: users.filter((u) => u.isVerified).length,
        pendingVerifications: users.filter((u) => u.verificationStatus === 'PENDING').length,
        totalRides: rides.length,
        womenOnlyRides: rides.filter((r) => r.isWomenOnly).length,
        scheduledRides: rides.filter((r) => r.status === 'SCHEDULED').length,
        totalBookings: bookings.length,
        activeBookings: bookings.filter((b) => b.status === 'CONFIRMED').length,
        openSafetyReports: reports.filter((r) => r.status === 'OPEN' || r.status === 'UNDER_INVESTIGATION').length,
        activeEmergencies: emergencies.filter((e) => e.status === 'ACTIVE').length,
      },
      isDemoMode: store.isDemoMode,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// GET /api/admin/users
router.get('/users', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const store = await dataStoreManager.getStore();
    const users = await store.listUsers();
    res.json({ users: users.map(sanitizeUser) });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// PUT /api/admin/users/:id/verify
router.put('/users/:id/verify', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { verificationStatus, isVerified } = req.body;

    if (!verificationStatus) {
      res.status(400).json({ error: 'Validation Error', message: 'verificationStatus is required (VERIFIED, REJECTED, PENDING, UNVERIFIED).' });
      return;
    }

    const store = await dataStoreManager.getStore();
    const user = await store.findUserById(id);
    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    const verifiedBool = isVerified !== undefined ? !!isVerified : verificationStatus === 'VERIFIED';

    const updated = await store.updateUser(id, {
      verificationStatus,
      isVerified: verifiedBool,
    });

    await store.createNotification({
      userId: id,
      title: `Identity Verification ${verificationStatus === 'VERIFIED' ? 'Approved' : 'Status Updated'}`,
      message:
        verificationStatus === 'VERIFIED'
          ? 'Congratulations! Your national identity has been verified. You now have full access to verified driver badges and women-only journeys.'
          : `Your identity verification status has been marked as ${verificationStatus}.`,
      type: 'VERIFICATION',
    });

    res.json({
      message: `User verification updated to ${verificationStatus}.`,
      user: sanitizeUser(updated),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// GET /api/admin/rides
router.get('/rides', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const store = await dataStoreManager.getStore();
    const rides = await store.listRides();
    res.json({ rides });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// GET /api/admin/bookings
router.get('/bookings', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const store = await dataStoreManager.getStore();
    const bookings = await store.listAllBookings();
    res.json({ bookings });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// GET /api/admin/safety-reports
router.get('/safety-reports', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const store = await dataStoreManager.getStore();
    const reports = await store.listSafetyReports();
    res.json({ reports });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// PUT /api/admin/safety-reports/:id
router.put('/safety-reports/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, adminNotes } = req.body;

    if (!status) {
      res.status(400).json({ error: 'Validation Error', message: 'Report status is required (OPEN, UNDER_INVESTIGATION, RESOLVED, DISMISSED).' });
      return;
    }

    const store = await dataStoreManager.getStore();
    const updated = await store.updateSafetyReport(id, status, adminNotes);

    res.json({
      message: 'Safety report updated successfully.',
      report: updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// GET /api/admin/emergency-events
router.get('/emergency-events', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const store = await dataStoreManager.getStore();
    const emergencies = await store.listEmergencyEvents();
    res.json({ emergencies });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

export default router;
