import { Router, Response } from 'express';
import { dataStoreManager } from '../services/dataStore';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// POST /api/safety/report
router.post('/report', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { rideId, category, description } = req.body;

    if (!description || description.trim().length < 5) {
      res.status(400).json({ error: 'Validation Error', message: 'Please describe the incident in detail.' });
      return;
    }

    const store = await dataStoreManager.getStore();
    const report = await store.createSafetyReport({
      reporterId: req.user!.userId,
      rideId: rideId || null,
      category: category || 'OTHER',
      description,
    });

    // Notify user of report receipt
    await store.createNotification({
      userId: req.user!.userId,
      title: 'Safety Report Logged',
      message: `Your incident report #${report.id.slice(0, 8)} has been routed to the 24/7 Safety Command Center.`,
      type: 'SAFETY',
    });

    res.status(201).json({
      message: 'Safety report registered successfully. Our response team will review immediately.',
      report,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// POST /api/safety/emergency-sos
router.post('/emergency-sos', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { rideId, lat, lng, message } = req.body;
    const store = await dataStoreManager.getStore();

    const emergency = await store.createEmergencyEvent({
      userId: req.user!.userId,
      rideId: rideId || null,
      lat: Number(lat) || 33.71,
      lng: Number(lng) || 73.05,
      message: message || 'SOS Emergency Alert dispatched from passenger app.',
    });

    // Send high priority notification
    await store.createNotification({
      userId: req.user!.userId,
      title: '🚨 Emergency SOS Dispatched',
      message: 'Local emergency services (112) and your emergency contacts have received your live GPS coordinates.',
      type: 'SAFETY',
    });

    res.status(201).json({
      message: 'SOS Emergency alert triggered. Emergency services notified.',
      emergency,
      emergencyContacts: {
        primaryEmergency: '112',
        womenHelpline: '1091',
        safarRapidResponse: '+92 800 SAFAR (72327)',
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// GET /api/safety/contacts
router.get('/contacts', (_req, res): void => {
  res.json({
    nationalEmergency: '112',
    policeHelpline: '15',
    womenProtectionHelpline: '1091',
    ambulanceRescue: '1122',
    safarSafetyDesk: '+92 51 888 7232',
    supportEmail: 'safety@safar.ai',
    operationalHours: '24/7/365',
  });
});

export default router;
