import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/webhook', paymentController.handleWebhook.bind(paymentController));
router.use(authenticate);

router.post('/create-intent', paymentController.createPaymentIntent.bind(paymentController));
router.get('/transactions', paymentController.getMyTransactions.bind(paymentController));
router.post('/transactions/:id/complete', paymentController.completeTransaction.bind(paymentController));
router.post('/transactions/:id/confirm', paymentController.confirmTransaction.bind(paymentController));

export default router;
