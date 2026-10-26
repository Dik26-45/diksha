import { Router, Response } from 'express';
import { dataStoreManager } from '../services/dataStore';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/notifications/my-notifications
router.get('/my-notifications', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const store = await dataStoreManager.getStore();
    const notifications = await store.getNotificationsByUserId(req.user!.userId);

    res.json({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const store = await dataStoreManager.getStore();
    const notification = await store.markNotificationAsRead(id);

    res.json({ notification });
  } catch (err: any) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

export default router;
