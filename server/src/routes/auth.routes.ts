import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dataStoreManager } from '../services/dataStore';
import {
  generateToken,
  sanitizeUser,
  requireAuth,
  AuthenticatedRequest,
} from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res): Promise<void> => {
  try {
    const { email, password, fullName, phone, role, gender, bio } = req.body;

    if (!email || !password || !fullName) {
      res.status(400).json({ error: 'Validation Error', message: 'Email, password, and full name are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Validation Error', message: 'Password must be at least 6 characters.' });
      return;
    }

    const store = await dataStoreManager.getStore();
    const existing = await store.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'Conflict', message: 'An account with this email address already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await store.createUser({
      email,
      passwordHash,
      fullName,
      phone: phone || null,
      role: role || 'PASSENGER',
      gender: gender || 'PREFER_NOT_TO_SAY',
      bio: bio || '',
    });

    const token = generateToken(user);

    res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: sanitizeUser(user),
      isDemoMode: store.isDemoMode,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Validation Error', message: 'Email and password are required.' });
      return;
    }

    const store = await dataStoreManager.getStore();
    const user = await store.findUserByEmail(email);

    if (!user) {
      res.status(401).json({ error: 'Invalid Credentials', message: 'No account found with this email.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid Credentials', message: 'Incorrect password.' });
      return;
    }

    const token = generateToken(user);

    res.json({
      message: 'Logged in successfully.',
      token,
      user: sanitizeUser(user),
      isDemoMode: store.isDemoMode,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const store = await dataStoreManager.getStore();
    const user = await store.findUserById(req.user!.userId);

    if (!user) {
      res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    const preferences = await store.getUserPreference(user.id);
    const vehicles = await store.findVehiclesByUserId(user.id);

    res.json({
      user: sanitizeUser(user),
      preferences,
      vehicles,
      isDemoMode: store.isDemoMode,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { fullName, phone, bio, avatarUrl } = req.body;
    const store = await dataStoreManager.getStore();

    const updated = await store.updateUser(req.user!.userId, {
      fullName: fullName !== undefined ? fullName : undefined,
      phone: phone !== undefined ? phone : undefined,
      bio: bio !== undefined ? bio : undefined,
      avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
    });

    res.json({
      message: 'Profile updated successfully.',
      user: sanitizeUser(updated),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// POST /api/auth/request-verification
router.post('/request-verification', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { docUrl } = req.body;
    const store = await dataStoreManager.getStore();

    const updated = await store.updateUser(req.user!.userId, {
      verificationStatus: 'PENDING',
      verificationDocUrl: docUrl || 'https://docs.safar.ai/verifications/pending-user-id.pdf',
    });

    await store.createNotification({
      userId: req.user!.userId,
      title: 'Verification Request Submitted',
      message: 'Your government ID submission is being reviewed by our Trust & Safety team.',
      type: 'VERIFICATION',
    });

    res.json({
      message: 'Verification request submitted. Status is now PENDING.',
      user: sanitizeUser(updated),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

export default router;
