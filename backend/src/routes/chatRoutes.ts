import { Router } from 'express';
import { chatController } from '../controllers/chatController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/conversations', chatController.getConversations.bind(chatController));
router.get('/conversations/:id/messages', chatController.getMessages.bind(chatController));
router.post('/conversations/:id/messages', chatController.sendMessage.bind(chatController));
router.put('/conversations/:id/read', chatController.markAsRead.bind(chatController));
router.post('/conversations', chatController.getOrCreateConversation.bind(chatController));

export default router;
