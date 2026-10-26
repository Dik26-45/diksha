import { Router, Response } from 'express';
import { dataStoreManager } from '../services/dataStore';
import { scoreAndFilterRides, MatchingQuery } from '../services/aiMatching';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middleware/auth';
import { AuthTokenPayload } from '../types';

const router = Router();

// POST /api/matching/find-matches
// Can be called by authenticated users or guests with optional token
router.post('/find-matches', async (req, res): Promise<void> => {
  try {
    const {
      originLat,
      originLng,
      destLat,
      destLng,
      preferredDepartureTime,
      onlyWomenOnly,
      userPreference,
    } = req.body;

    if (originLat === undefined || originLng === undefined || destLat === undefined || destLng === undefined) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Origin coordinates (originLat, originLng) and Destination coordinates (destLat, destLng) are required for AI matching.',
      });
      return;
    }

    // Try detecting authenticated user from token if present
    let authUser: AuthTokenPayload | undefined = undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        authUser = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
      } catch {
        // ignore guest fallback
      }
    }

    const store = await dataStoreManager.getStore();
    const allRides = await store.listRides({ status: 'SCHEDULED' });

    let passengerGender = authUser?.gender;
    let isPassengerVerified = authUser?.isVerified;
    let savedPrefs = undefined;

    if (authUser?.userId) {
      savedPrefs = await store.getUserPreference(authUser.userId);
    }

    const query: MatchingQuery = {
      passengerGender,
      isPassengerVerified,
      originLat: Number(originLat),
      originLng: Number(originLng),
      destLat: Number(destLat),
      destLng: Number(destLng),
      preferredDepartureTime: preferredDepartureTime || undefined,
      userPreference: userPreference || savedPrefs || undefined,
      onlyWomenOnly: !!onlyWomenOnly,
    };

    const matches = scoreAndFilterRides(allRides, query);

    res.json({
      matches,
      totalMatches: matches.length,
      algorithm: {
        type: 'RULE_BASED_HEURISTIC_MATCHING',
        version: '1.2.0',
        weights: {
          pickupProximity: '30%',
          destinationProximity: '30%',
          departureTimeCompatibility: '20%',
          routeVectorCompatibility: '15%',
          userPreferences: '5%',
        },
        notice: 'SAFAR AI uses explainable rule-based scoring criteria. Not an unverified black-box model.',
      },
      isDemoMode: store.isDemoMode,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

export default router;
