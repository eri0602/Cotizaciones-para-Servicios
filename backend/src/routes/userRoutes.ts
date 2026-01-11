import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/me', userController.getProfile.bind(userController));
router.put('/me', userController.updateProfile.bind(userController));
router.get('/notifications', userController.getNotifications.bind(userController));
router.put('/notifications/:id/read', userController.markNotificationRead.bind(userController));
router.put('/notifications/read-all', userController.markAllNotificationsRead.bind(userController));

export default router;
