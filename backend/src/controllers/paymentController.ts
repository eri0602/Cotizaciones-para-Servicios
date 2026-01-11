import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { paymentService } from '../services/paymentService';
import { stripe, STRIPE_WEBHOOK_SECRET } from '../config/stripe';

export class PaymentController {
  async createPaymentIntent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { proposalId } = req.body;
      const result = await paymentService.createPaymentIntent(proposalId, req.user!.userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const sig = req.headers['stripe-signature'] as string;
      const event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);

      await paymentService.handleWebhook(event);

      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }

  async getMyTransactions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await paymentService.getMyTransactions(req.user!.userId, req.query.role as 'client' | 'provider');

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async completeTransaction(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await paymentService.completeTransaction(req.params.id, req.user!.userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async confirmTransaction(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await paymentService.confirmTransaction(req.params.id, req.user!.userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
