import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { proposalService } from '../services/proposalService';
import { emailService } from '../services/emailService';

export class ProposalController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await proposalService.createProposal(req.user!.userId, req.body);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyProposals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await proposalService.getMyProposals(req.user!.userId, req.query.status as string);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getForRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await proposalService.getProposalsForRequest(req.params.requestId, req.user!.userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await proposalService.updateProposal(req.params.id, req.user!.userId, req.body);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async withdraw(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await proposalService.withdrawProposal(req.params.id, req.user!.userId);

      res.json({
        success: true,
        message: 'Propuesta retirada',
      });
    } catch (error) {
      next(error);
    }
  }

  async accept(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const transaction = await proposalService.acceptProposal(req.params.id, req.user!.userId);

      res.json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  async reject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await proposalService.rejectProposal(req.params.id, req.user!.userId);

      res.json({
        success: true,
        message: 'Propuesta rechazada',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const proposalController = new ProposalController();
